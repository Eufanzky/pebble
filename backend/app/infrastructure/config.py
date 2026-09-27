"""Settings from the environment (and ``.env``). Every external service is optional except the LLM."""

from typing import Literal

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # LLM. "github" = GitHub Models, "openai", "azure" (uses the AZURE_OPENAI_*
    # settings below), or "fake" (scripted, offline).
    llm_provider: Literal["github", "openai", "azure", "fake"] = "github"
    llm_api_key: str = ""
    llm_model: str = ""  # empty: the provider's default (openai/gpt-4o on GitHub Models)
    llm_base_url: str = ""  # empty: the provider's public endpoint
    llm_timeout_seconds: float = 30.0

    # Azure OpenAI, when LLM_PROVIDER=azure
    azure_openai_endpoint: str = ""
    azure_openai_key: str = ""
    azure_openai_deployment: str = "gpt-4o"
    azure_openai_api_version: str = "2024-12-01-preview"

    # Azure AI Content Safety (optional; without it content checks are off, PII redaction still runs)
    content_safety_endpoint: str = ""
    content_safety_key: str = ""

    # Azure Immersive Reader (optional; the frontend falls back to its built-in reader)
    immersive_reader_tenant_id: str = ""
    immersive_reader_client_id: str = ""
    immersive_reader_client_secret: str = ""
    immersive_reader_subdomain: str = ""

    # Microsoft Entra ID sign-in (replaced by Auth.js in roadmap 4.3)
    azure_ad_client_id: str = ""
    azure_ad_tenant_id: str = ""

    # Dev mode (bypasses JWT auth for local demos; removed in 4.3)
    dev_mode: bool = False

    # CORS
    frontend_url: str = "http://localhost:3000"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()
