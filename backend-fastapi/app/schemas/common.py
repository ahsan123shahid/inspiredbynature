from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, ConfigDict


class PaginatedResponse(BaseModel):
    items: list[Any]
    total: int
    page: int
    size: int
    pages: int


class MessageResponse(BaseModel):
    message: str


class ErrorResponse(BaseModel):
    error: str
