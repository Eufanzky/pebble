from typing import Literal

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # LLM (roadmap 2.2). "github" = GitHub Models, "openai", "azure" (uses the
    # AZURE_OPENAI_* settings below), or "fake" (scripted, offline).
    llm_provider: Literal["github", "openai", "azure", "fake"] = "github"
    llm_api_key: str = ""
    llm_model: str = ""  # empty: the provider's default (openai/gpt-4o on GitHub Models)
    llm_base_url: str = ""  # empty: the provider's public endpoint
    llm_timeout_seconds: float = 30.0

    # Azure Cosmos DB
    cosmos_endpoint: str = ""
    cosmos_key: str = ""

    # Microsoft Entra ID
    azure_ad_client_id: str = ""
    azure_ad_tenant_id: str = ""

    # Azure OpenAI
    azure_openai_endpoint: str = ""
    azure_openai_key: str = ""
    azure_openai_deployment: str = "gpt-4o"
    azure_openai_api_version: str = "2024-12-01-preview"

    # Azure Content Safety
    content_safety_endpoint: str = ""
    content_safety_key: str = ""

    # Azure Blob Storage
    blob_connection_string: str = ""
    blob_container_name: str = "documents"

    # Azure Document Intelligence
    doc_intelligence_endpoint: str = ""
    doc_intelligence_key: str = ""

    # Azure AI Search
    search_endpoint: str = ""
    search_key: str = ""
    search_index_name: str = "focusbuddy-documents"

    # Azure Web PubSub (Focus Room real-time)
    webpubsub_connection_string: str = ""
    webpubsub_hub_name: str = "focusroom"

    # Azure Application Insights
    applicationinsights_connection_string: str = ""

    # Azure Immersive Reader
    immersive_reader_tenant_id: str = ""
    immersive_reader_client_id: str = ""
    immersive_reader_client_secret: str = ""
    immersive_reader_subdomain: str = ""

    # Dev mode (bypasses JWT auth for local demos)
    dev_mode: bool = False

    # CORS
    frontend_url: str = "http://localhost:3000"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
