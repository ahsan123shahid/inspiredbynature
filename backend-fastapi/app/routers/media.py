import uuid
import os
import magic
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.config import settings
from app.middleware.auth import require_admin

router = APIRouter(prefix="/api/media", tags=["media"])

ALLOWED_MIME_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
}

MAX_FILE_SIZE = settings.max_upload_size_mb * 1024 * 1024


@router.post("/upload")
async def upload_file(file: UploadFile = File(...), admin=Depends(require_admin)):
    contents = await file.read(MAX_FILE_SIZE + 1)
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File too large")

    mime_type = magic.from_buffer(contents[:2048], mime=True)
    if mime_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"File type {mime_type} not allowed")

    ext = ALLOWED_MIME_TYPES[mime_type]
    filename = f"{uuid.uuid4().hex}{ext}"
    upload_dir = settings.upload_dir
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, filename)
    with open(file_path, "wb") as f:
        f.write(contents)

    return {"url": f"/uploads/{filename}", "filename": filename}


@router.get("")
async def list_media(admin=Depends(require_admin)):
    upload_dir = settings.upload_dir
    if not os.path.exists(upload_dir):
        return {"items": []}
    files = []
    for f in os.listdir(upload_dir):
        file_path = os.path.join(upload_dir, f)
        if os.path.isfile(file_path):
            files.append({
                "filename": f,
                "url": f"/uploads/{f}",
                "size": os.path.getsize(file_path),
            })
    return {"items": sorted(files, key=lambda x: x["filename"])}


@router.delete("/{filename}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file(filename: str, admin=Depends(require_admin)):
    file_path = os.path.join(settings.upload_dir, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    os.remove(file_path)
