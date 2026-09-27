"""The Azure Immersive Reader token adapter (respx)."""

import httpx
import pytest
import respx

from app.application.ports.reader import ReaderToken, ReaderUnavailableError
from app.infrastructure.config import Settings
from app.infrastructure.immersive_reader import AzureImmersiveReader, UnconfiguredReader, build_reader

TOKEN_URL = "https://login.microsoftonline.com/tenant/oauth2/token"


@pytest.fixture
def reader():
    return AzureImmersiveReader(tenant_id="tenant", client_id="client", client_secret="secret", subdomain="pebble")


@respx.mock
async def test_gets_a_client_credentials_token(reader):
    route = respx.post(TOKEN_URL).respond(json={"access_token": "abc", "expires_in": "3599"})

    assert await reader.get_token() == ReaderToken(token="abc", subdomain="pebble")

    form = dict(httpx.QueryParams(route.calls.last.request.content.decode()))
    assert form == {
        "grant_type": "client_credentials",
        "client_id": "client",
        "client_secret": "secret",
        "resource": "https://cognitiveservices.azure.com/",
    }


@respx.mock
@pytest.mark.parametrize(
    "response", [httpx.Response(401), httpx.Response(200, json={}), httpx.Response(200, text="<html>")]
)
async def test_failures_are_unavailable(reader, response):
    respx.post(TOKEN_URL).mock(return_value=response)

    with pytest.raises(ReaderUnavailableError):
        await reader.get_token()


@respx.mock
async def test_network_errors_are_unavailable(reader):
    respx.post(TOKEN_URL).mock(side_effect=httpx.ConnectError("down"))

    with pytest.raises(ReaderUnavailableError):
        await reader.get_token()


async def test_unconfigured_reader_is_unavailable():
    assert isinstance(build_reader(Settings(_env_file=None)), UnconfiguredReader)
    with pytest.raises(ReaderUnavailableError):
        await UnconfiguredReader().get_token()


def test_configured_reader():
    settings = Settings(_env_file=None, immersive_reader_client_id="c", immersive_reader_subdomain="s")

    assert isinstance(build_reader(settings), AzureImmersiveReader)
