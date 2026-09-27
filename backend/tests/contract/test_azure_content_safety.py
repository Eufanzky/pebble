"""Contract tests for the Azure Content Safety adapter (respx, response shapes from the REST API docs)."""

import json

import httpx
import pytest
import respx

from app.application.ports.safety import SafetyCheckError
from app.domain.safety import Groundedness, HarmCategory
from app.infrastructure.safety.azure_content_safety import MAX_ANALYZE_CHARS, AzureContentSafety

ENDPOINT = "https://safety.test"
ANALYZE = f"{ENDPOINT}/contentsafety/text:analyze"
SHIELD = f"{ENDPOINT}/contentsafety/text:shieldPrompt"
GROUNDEDNESS = f"{ENDPOINT}/contentsafety/text:detectGroundedness"


def analysis(**severities: int) -> dict:
    scores = {"Hate": 0, "SelfHarm": 0, "Sexual": 0, "Violence": 0} | severities
    return {"blocklistsMatch": [], "categoriesAnalysis": [{"category": c, "severity": s} for c, s in scores.items()]}


@pytest.fixture
def safety() -> AzureContentSafety:
    return AzureContentSafety(endpoint=f"{ENDPOINT}/", key="cs-key")


# --- Text analysis: the severity mapping ------------------------------------------


@respx.mock
async def test_analyze_sends_the_text_categories_and_key(safety):
    route = respx.post(ANALYZE).respond(json=analysis())

    await safety.analyze_text("Hello Pebble")

    sent = route.calls.last.request
    assert sent.headers["ocp-apim-subscription-key"] == "cs-key"
    assert sent.url.params["api-version"] == "2024-09-01"
    assert json.loads(sent.content) == {
        "text": "Hello Pebble",
        "categories": ["Hate", "SelfHarm", "Sexual", "Violence"],
        "outputType": "FourSeverityLevels",
    }


@respx.mock
@pytest.mark.parametrize("category", list(HarmCategory))
@pytest.mark.parametrize(("severity", "safe"), [(0, True), (2, False), (4, False), (6, False)])
async def test_severity_maps_to_the_verdict(safety, category, severity, safe):
    respx.post(ANALYZE).respond(json=analysis(**{category.value: severity}))

    verdict = await safety.analyze_text("text")

    assert verdict.severities[category] == severity
    assert verdict.is_safe is safe


@respx.mock
async def test_null_severity_and_unknown_categories(safety):
    respx.post(ANALYZE).respond(
        json={"categoriesAnalysis": [{"category": "Hate", "severity": None}, {"category": "Spam", "severity": 6}]}
    )

    verdict = await safety.analyze_text("text")

    assert verdict.severities == {c: 0 for c in HarmCategory}
    assert verdict.is_safe


@respx.mock
async def test_long_text_is_checked_in_chunks_and_the_worst_part_wins(safety):
    route = respx.post(ANALYZE).mock(
        side_effect=[httpx.Response(200, json=analysis()), httpx.Response(200, json=analysis(SelfHarm=4))]
    )

    verdict = await safety.analyze_text("a" * MAX_ANALYZE_CHARS + "b")

    assert route.call_count == 2
    assert [len(json.loads(c.request.content)["text"]) for c in route.calls] == [MAX_ANALYZE_CHARS, 1]
    assert verdict.flagged == [HarmCategory.SELF_HARM]


@respx.mock
@pytest.mark.parametrize(
    "response",
    [httpx.Response(500), httpx.Response(401), httpx.Response(200, text="oops"), httpx.Response(200, json={})],
    ids=["500", "401", "not-json", "no-analysis"],
)
async def test_analysis_failure_fails_closed(safety, response):
    respx.post(ANALYZE).mock(return_value=response)

    with pytest.raises(SafetyCheckError):
        await safety.analyze_text("text")


@respx.mock
async def test_analysis_timeout_fails_closed(safety):
    respx.post(ANALYZE).mock(side_effect=httpx.ReadTimeout("slow"))

    with pytest.raises(SafetyCheckError):
        await safety.analyze_text("text")


# --- Prompt Shields -----------------------------------------------------------------


@respx.mock
@pytest.mark.parametrize(
    ("body", "attack"),
    [
        ({"userPromptAnalysis": {"attackDetected": False}, "documentsAnalysis": []}, False),
        ({"userPromptAnalysis": {"attackDetected": True}, "documentsAnalysis": []}, True),
        ({"userPromptAnalysis": {"attackDetected": False}, "documentsAnalysis": [{"attackDetected": True}]}, True),
    ],
    ids=["clean", "user-attack", "document-attack"],
)
async def test_prompt_shield(safety, body, attack):
    route = respx.post(SHIELD).respond(json=body)

    assert await safety.detect_prompt_attack("Hi", ["doc"]) is attack
    assert json.loads(route.calls.last.request.content) == {"userPrompt": "Hi", "documents": ["doc"]}


@respx.mock
@pytest.mark.parametrize("response", [httpx.Response(500), httpx.Response(200, text="oops")])
async def test_prompt_shield_errors_are_not_blocking(safety, response):
    respx.post(SHIELD).mock(return_value=response)

    assert await safety.detect_prompt_attack("Hi") is False


# --- Groundedness -------------------------------------------------------------------


@respx.mock
async def test_groundedness(safety):
    route = respx.post(GROUNDEDNESS).respond(json={"ungroundedDetected": True, "ungroundedPercentage": 0.4})

    result = await safety.check_groundedness("summary", ["source"])

    assert result == Groundedness(grounded=False, ungrounded_percentage=0.4)
    assert route.calls.last.request.url.params["api-version"] == "2024-09-15-preview"


@respx.mock
async def test_groundedness_errors_count_as_grounded(safety):
    respx.post(GROUNDEDNESS).respond(503)

    assert await safety.check_groundedness("summary", ["source"]) == Groundedness()


async def test_the_client_can_be_closed(safety):
    await safety.aclose()
