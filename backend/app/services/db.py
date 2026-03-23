from azure.cosmos import PartitionKey
from azure.cosmos.aio import CosmosClient, ContainerProxy, DatabaseProxy

from app.config import settings

DB_NAME = "focusbuddy"

CONTAINERS = {
    "tasks": "tasks",
    "preferences": "preferences",
    "activity": "activity",
    "users": "users",
    "documents": "documents",
    "rooms": "rooms",
}

_client: CosmosClient | None = None
_database: DatabaseProxy | None = None
_containers: dict[str, ContainerProxy] = {}


async def init_db() -> None:
    """Initialize Cosmos DB client and ensure database/containers exist."""
    global _client, _database

    if not settings.cosmos_endpoint or not settings.cosmos_key:
        # Skip DB init if no credentials (allows server to start for dev/testing)
        return

    _client = CosmosClient(settings.cosmos_endpoint, settings.cosmos_key)
    _database = await _client.create_database_if_not_exists(DB_NAME)

    for name, container_id in CONTAINERS.items():
        container = await _database.create_container_if_not_exists(
            id=container_id,
            partition_key=PartitionKey("/userId"),
        )
        _containers[name] = container


async def close_db() -> None:
    """Close the Cosmos DB client."""
    global _client
    if _client:
        await _client.close()
        _client = None


async def get_container(name: str) -> ContainerProxy:
    """Get a container proxy by name."""
    if name not in _containers:
        raise RuntimeError(
            f"Container '{name}' not initialized. "
            "Check COSMOS_ENDPOINT and COSMOS_KEY in .env"
        )
    return _containers[name]
