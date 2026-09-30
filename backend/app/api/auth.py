"""Who is calling: the short-lived access token the Next.js server signs for each proxied request.

Auth.js's session cookie is meant only for Next.js. For every ``/api/*`` call, the Next.js server signs
a JWT (HS256, a few minutes long) with ``AUTH_TOKEN_SECRET``, a secret it shares with this backend:
``sub`` is the user id (``github:123``, ``google:456``, or ``dev:name`` from the dev login), ``iss`` is
``pebble-web`` and ``aud`` is ``pebble-api``. The token is never shown to the browser.
"""

import logging

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.infrastructure.config import settings

logger = logging.getLogger("pebble.auth")

ISSUER = "pebble-web"
AUDIENCE = "pebble-api"
ALGORITHM = "HS256"

security = HTTPBearer(auto_error=False)


def _unauthorized(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail=detail, headers={"WWW-Authenticate": "Bearer"}
    )


async def get_current_user(credentials: HTTPAuthorizationCredentials | None = Depends(security)) -> str:
    """The signed-in user's id. 401 for a missing, invalid or expired token; 503 if sign-in isn't set up."""
    if not settings.auth_token_secret:
        logger.warning("AUTH_TOKEN_SECRET is not set: nobody can sign in")
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Sign-in isn't set up yet.")
    if credentials is None:
        raise _unauthorized("Please sign in first.")
    try:
        claims = jwt.decode(
            credentials.credentials,
            settings.auth_token_secret,
            algorithms=[ALGORITHM],
            audience=AUDIENCE,
            issuer=ISSUER,
            options={"require_exp": True, "require_sub": True, "require_iat": True},
        )
    except JWTError:
        raise _unauthorized("Your sign-in has expired. Please sign in again.") from None
    user_id = claims.get("sub")
    if not isinstance(user_id, str) or not user_id.strip():
        raise _unauthorized("Your sign-in has expired. Please sign in again.")
    return user_id
