from pydantic import BaseModel


class ParsedDocumentResponse(BaseModel):
    title: str
    type: str
    text: str
    pages: int


class ReaderTokenResponse(BaseModel):
    token: str
    subdomain: str
