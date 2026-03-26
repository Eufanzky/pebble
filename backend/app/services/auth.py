from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from jose.backends import RSAKey
import httpx

from app.config import settings

security = HTTPBearer(auto_error=False)

_jwks_cache: dict | None = None


async def _get_jwks() -> dict:
    """Fetch and cache Microsoft's public signing keys."""
    global _jwks_cache
    if _jwks_cache is None:
        jwks_url = (
            f"https://login.microsoftonline.com/{settings.azure_ad_tenant_id}"
            "/discovery/v2.0/keys"
        )
        async with httpx.AsyncClient() as client:
            resp = await client.get(jwks_url)
            resp.raise_for_status()
            _jwks_cache = resp.json()
    return _jwks_cache


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> str:
    """Validate the Entra ID JWT and return the user's object ID."""
    if settings.dev_mode:
        return "dev-user-00000000"

    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
        )

    token = credentials.credentials

    try:
        # Decode header to find the key ID
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")

        # Find the matching public key from Microsoft's JWKS
        jwks = await _get_jwks()
        jwk_data = None
        for key in jwks.get("keys", []):
            if key["kid"] == kid:
                jwk_data = key
                break

        if jwk_data is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unable to find signing key",
            )

        # Convert JWK dict to an RSA key object for python-jose
        rsa_key = RSAKey(jwk_data, algorithm="RS256")

        # Validate the token
        payload = jwt.decode(
            token,
            rsa_key.to_pem().decode("utf-8"),
            algorithms=["RS256"],
            audience=settings.azure_ad_client_id,
            issuer=f"https://login.microsoftonline.com/{settings.azure_ad_tenant_id}/v2.0",
        )

        user_id: str | None = payload.get("oid") or payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token missing user identifier",
            )

        return user_id

    except HTTPException:
        raise
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token validation failed",
        )
