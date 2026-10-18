"""The startup line (10.5): what's on and off, so a missing setting shows before a request fails."""

import pytest

from app.infrastructure.config import Settings, describe


def settings(**values) -> Settings:
    return Settings(_env_file=None, **values)


def test_everything_set_up():
    line = describe(
        settings(
            llm_api_key="key",
            llm_model="openai/gpt-oss-120b",
            database_url="postgresql+asyncpg://x",
            auth_token_secret="s",
            content_safety_endpoint="https://cs",
            content_safety_key="k",
            immersive_reader_client_id="c",
            immersive_reader_subdomain="sub",
        )
    )

    assert line == (
        "LLM groq openai/gpt-oss-120b; database on; sign-in on; Content Safety on; Immersive Reader on; "
        "agent calls per user 10/minute, 100/day"
    )


def test_nothing_set_up_says_what_each_gap_means():
    line = describe(settings())

    assert "LLM groq (default model), no LLM_API_KEY (agents off)" in line
    assert "no DATABASE_URL (nothing is saved)" in line
    assert "no AUTH_TOKEN_SECRET (nobody can sign in)" in line
    assert "Content Safety off (PII redaction only)" in line
    assert "Immersive Reader off (the built-in reader)" in line


@pytest.mark.parametrize(
    ("values", "llm"),
    [
        ({"llm_provider": "fake"}, "LLM fake (offline, scripted)"),
        ({"llm_provider": "azure"}, "LLM azure, not set up (agents off)"),
        ({"llm_provider": "azure", "azure_openai_endpoint": "https://a", "azure_openai_key": "k"}, "LLM azure;"),
        ({"llm_provider": "openai", "llm_api_key": "k"}, "LLM openai (default model);"),
    ],
)
def test_each_llm(values, llm):
    assert llm in describe(settings(**values))


def test_no_secret_is_logged():
    line = describe(settings(llm_api_key="gsk_secret", auth_token_secret="tok_secret", content_safety_key="cs_secret"))

    assert not any(secret in line for secret in ("gsk_secret", "tok_secret", "cs_secret"))
