"""``SafetyChecker`` backed by Azure AI Content Safety's REST API.

Text analysis, Prompt Shields and Groundedness Detection are three plain HTTP
calls. Text analysis fails closed (``SafetyCheckError``): content that couldn't be
checked isn't called safe. Prompt Shields and Groundedness fail open, with a
warning, as they did before the port.
"""

import asyncio
import logging
from collections.abc import Sequence

import httpx

from app.application.ports.safety import SafetyCheckError
from app.domain.safety import Groundedness, HarmCategory, SafetyVerdict

logger = logging.getLogger("pebble.safety")

ANALYZE_API_VERSION = "2024-09-01"
SHIELD_API_VERSION = "2024-09-01"
GROUNDEDNESS_API_VERSION = "2024-09-15-preview"

MAX_ANALYZE_CHARS = 10_000  # the text:analyze limit per request
MAX_GROUNDEDNESS_CHARS = 7_500


class AzureContentSafety:
    def __init__(self, *, endpoint: str, key: str, timeout: float = 10.0) -> None:
        self._endpoint = endpoint.rstrip("/")
        self._headers = {"Ocp-Apim-Subscription-Key": key}
        self._timeout = timeout
        self._client = httpx.AsyncClient()

    async def _post(self, path: str, api_version: str, payload: dict, timeout: float | None = None) -> dict:
        response = await self._client.post(
            f"{self._endpoint}/contentsafety/{path}",
            params={"api-version": api_version},
            headers=self._headers,
            json=payload,
            timeout=timeout or self._timeout,
        )
        response.raise_for_status()
        return response.json()

    async def analyze_text(self, text: str) -> SafetyVerdict:
        chunks = [text[i : i + MAX_ANALYZE_CHARS] for i in range(0, len(text), MAX_ANALYZE_CHARS)] or [""]
        try:
            results = await asyncio.gather(*(self._analyze_chunk(chunk) for chunk in chunks))
        except (httpx.HTTPError, ValueError, KeyError, TypeError) as e:
            raise SafetyCheckError(f"Content Safety text analysis failed ({type(e).__name__})") from e
        # A long text is as unsafe as its worst part.
        severities = {category: max(result.get(category, 0) for result in results) for category in HarmCategory}
        return SafetyVerdict(severities)

    async def _analyze_chunk(self, text: str) -> dict[HarmCategory, int]:
        data = await self._post(
            "text:analyze",
            ANALYZE_API_VERSION,
            {"text": text, "categories": [c.value for c in HarmCategory], "outputType": "FourSeverityLevels"},
        )
        severities: dict[HarmCategory, int] = {}
        for item in data["categoriesAnalysis"]:
            try:
                category = HarmCategory(item["category"])
            except ValueError:
                continue  # a category added to the API later
            severities[category] = int(item.get("severity") or 0)
        return severities

    async def detect_prompt_attack(self, user_prompt: str, documents: Sequence[str] = ()) -> bool:
        try:
            data = await self._post(
                "text:shieldPrompt", SHIELD_API_VERSION, {"userPrompt": user_prompt, "documents": list(documents)}
            )
            user_attack = data.get("userPromptAnalysis", {}).get("attackDetected", False)
            doc_attack = any(d.get("attackDetected", False) for d in data.get("documentsAnalysis", []))
        except (httpx.HTTPError, ValueError, AttributeError) as e:
            logger.warning("Prompt Shield check failed (non-blocking): %s", type(e).__name__)
            return False
        return bool(user_attack or doc_attack)

    async def check_groundedness(self, output: str, sources: Sequence[str]) -> Groundedness:
        payload = {
            "domain": "Generic",
            "task": "Summarization",
            "text": output[:MAX_GROUNDEDNESS_CHARS],
            "groundingSources": [s[:MAX_GROUNDEDNESS_CHARS] for s in sources],
            "reasoning": False,
        }
        try:
            data = await self._post("text:detectGroundedness", GROUNDEDNESS_API_VERSION, payload, timeout=15.0)
            return Groundedness(
                grounded=not data.get("ungroundedDetected", False),
                ungrounded_percentage=float(data.get("ungroundedPercentage", 0.0)),
            )
        except (httpx.HTTPError, ValueError, TypeError, AttributeError) as e:
            logger.warning("Groundedness check failed (non-blocking): %s", type(e).__name__)
            return Groundedness()

    async def aclose(self) -> None:
        await self._client.aclose()
