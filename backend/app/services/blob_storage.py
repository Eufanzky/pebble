import uuid

from azure.storage.blob.aio import BlobServiceClient, ContainerClient

from app.config import settings

_container_client: ContainerClient | None = None


async def _get_container() -> ContainerClient:
    """Get the blob container client (singleton), creating container if needed."""
    global _container_client
    if _container_client is None:
        service = BlobServiceClient.from_connection_string(
            settings.blob_connection_string
        )
        _container_client = service.get_container_client(settings.blob_container_name)
        if not await _container_client.exists():
            await _container_client.create_container()
    return _container_client


async def upload_document(
    file_bytes: bytes,
    filename: str,
    user_id: str,
    content_type: str = "application/octet-stream",
) -> str:
    """
    Upload a document to Blob Storage.

    Returns the blob URL.
    """
    container = await _get_container()

    # Prefix with user_id for isolation, add UUID to prevent collisions
    blob_name = f"{user_id}/{uuid.uuid4()}/{filename}"

    blob_client = container.get_blob_client(blob_name)
    await blob_client.upload_blob(
        file_bytes,
        content_settings={"content_type": content_type},
        overwrite=True,
    )

    return blob_client.url


async def delete_document(blob_url: str) -> None:
    """Delete a document from Blob Storage by its URL."""
    container = await _get_container()
    # Extract blob name from URL
    blob_name = blob_url.split(f"{settings.blob_container_name}/")[-1]
    blob_client = container.get_blob_client(blob_name)
    await blob_client.delete_blob()
