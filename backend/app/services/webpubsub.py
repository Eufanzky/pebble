from azure.messaging.webpubsubservice import WebPubSubServiceClient

from app.config import settings

_client: WebPubSubServiceClient | None = None


def _get_client() -> WebPubSubServiceClient:
    """Get the Web PubSub service client (singleton)."""
    global _client
    if _client is None:
        _client = WebPubSubServiceClient.from_connection_string(
            connection_string=settings.webpubsub_connection_string,
            hub=settings.webpubsub_hub_name,
        )
    return _client


def get_client_access_url(user_id: str, room_id: str) -> str:
    """
    Generate a client access URL with a token for WebSocket connection.
    The user joins a group named after the room_id for room-scoped messaging.
    """
    client = _get_client()
    token = client.get_client_access_token(
        user_id=user_id,
        groups=[room_id],
        roles=[
            f"webpubsub.joinLeaveGroup.{room_id}",
            f"webpubsub.sendToGroup.{room_id}",
        ],
    )
    return token["url"]


def send_to_room(room_id: str, message: dict) -> None:
    """Send a message to all users in a room."""
    import json
    client = _get_client()
    client.send_to_group(
        group=room_id,
        content_type="application/json",
        message=json.dumps(message),
    )
