"""``ReaderTokenProvider`` for Azure Immersive Reader: a client-credentials token from Microsoft Entra."""

import httpx

from app.application.ports.reader import ReaderToken, ReaderUnavailableError
from app.infrastructure.config import Settings

RESOURCE = "https://cognitiveservices.azure.com/"


class AzureImmersiveReader:
    def __init__(self, *, tenant_id: str, client_id: str, client_secret: str, subdomain: str) -> None:
        self._url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/token"
        self._form = {
            "grant_type": "client_credentials",
            "client_id": client_id,
            "client_secret": client_secret,
            "resource": RESOURCE,
        }
        self._subdomain = subdomain

    async def get_token(self) -> ReaderToken:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(self._url, data=self._form, timeout=10.0)
            response.raise_for_status()
            return ReaderToken(token=response.json()["access_token"], subdomain=self._subdomain)
        except (httpx.HTTPError, ValueError, KeyError) as e:
            raise ReaderUnavailableError(f"Immersive Reader token request failed ({type(e).__name__})") from e


class UnconfiguredReader:
    async def get_token(self) -> ReaderToken:
        raise ReaderUnavailableError("Immersive Reader not configured")


def build_reader(settings: Settings) -> AzureImmersiveReader | UnconfiguredReader:
    if settings.immersive_reader_client_id and settings.immersive_reader_subdomain:
        return AzureImmersiveReader(
            tenant_id=settings.immersive_reader_tenant_id,
            client_id=settings.immersive_reader_client_id,
            client_secret=settings.immersive_reader_client_secret,
            subdomain=settings.immersive_reader_subdomain,
        )
    return UnconfiguredReader()
