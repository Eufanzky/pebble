from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Azure Cosmos DB
    cosmos_endpoint: str = ""
    cosmos_key: str = ""

    # Microsoft Entra ID
    azure_ad_client_id: str = ""
    azure_ad_tenant_id: str = ""

    # CORS
    frontend_url: str = "http://localhost:3000"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
