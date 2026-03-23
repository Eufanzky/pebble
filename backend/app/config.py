from pydantic_settings import BaseSettings


class Settings(BaseSettings):
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

    # CORS
    frontend_url: str = "http://localhost:3000"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
