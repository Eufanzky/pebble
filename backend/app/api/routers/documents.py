from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.api.auth import get_current_user
from app.api.dependencies import get_parse_document, get_reader
from app.api.schemas.documents import ParsedDocumentResponse, ReaderTokenResponse
from app.application.documents import MAX_DOCUMENT_BYTES, ParseDocument
from app.application.ports.reader import ReaderTokenProvider, ReaderUnavailableError

router = APIRouter()


@router.post("/parse", response_model=ParsedDocumentResponse, summary="Read a document's text")
async def parse(
    file: UploadFile = File(..., description="PDF, Word (.docx) or plain-text file. Max 10 MB."),
    user_id: str = Depends(get_current_user),
    parse_document: ParseDocument = Depends(get_parse_document),
):
    """
    Read the text of an uploaded document with a local parser (pypdf, python-docx).

    The file is parsed in memory and **never stored**: nothing is written to disk or sent to
    another service. Pass the returned `text` to `POST /api/agents/simplify` to simplify it.
    """
    content = await file.read(MAX_DOCUMENT_BYTES + 1)
    document = parse_document(content, file.filename or "document.txt")
    return {"title": document.title, "type": str(document.type), "text": document.text, "pages": document.pages}


@router.get("/immersive-reader/token", response_model=ReaderTokenResponse, summary="Get an Immersive Reader token")
async def immersive_reader_token(
    user_id: str = Depends(get_current_user),
    reader: ReaderTokenProvider = Depends(get_reader),
):
    """
    A short-lived token for Microsoft's Immersive Reader, used by the frontend's `launchAsync`.

    Optional: without `IMMERSIVE_READER_*` settings this is a 503, and the frontend uses its built-in reader.
    """
    try:
        token = await reader.get_token()
    except ReaderUnavailableError:
        raise HTTPException(status_code=503, detail="Immersive Reader not available")
    return {"token": token.token, "subdomain": token.subdomain}
