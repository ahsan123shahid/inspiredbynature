from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import CPage
from app.schemas.admin import CPageCreate, CPageUpdate, CPageResponse
from app.middleware.auth import require_admin

router = APIRouter(prefix="/api/pages", tags=["pages"])


@router.get("", response_model=list[CPageResponse])
async def list_pages(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CPage).order_by(CPage.id))
    pages = result.scalars().all()
    return [CPageResponse.model_validate(p) for p in pages]


@router.get("/{slug}", response_model=CPageResponse)
async def get_page(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CPage).where(CPage.SEOurl == slug))
    page = result.scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    return CPageResponse.model_validate(page)


@router.post("", response_model=CPageResponse, status_code=status.HTTP_201_CREATED)
async def create_page(data: CPageCreate, db: AsyncSession = Depends(get_db), admin=Depends(require_admin)):
    page = CPage(**data.model_dump())
    db.add(page)
    await db.flush()
    await db.refresh(page)
    return CPageResponse.model_validate(page)


@router.put("/{page_id}", response_model=CPageResponse)
async def update_page(
    page_id: int, data: CPageUpdate, db: AsyncSession = Depends(get_db), admin=Depends(require_admin)
):
    result = await db.execute(select(CPage).where(CPage.id == page_id))
    page = result.scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(page, key, value)
    await db.flush()
    await db.refresh(page)
    return CPageResponse.model_validate(page)


@router.delete("/{page_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_page(page_id: int, db: AsyncSession = Depends(get_db), admin=Depends(require_admin)):
    result = await db.execute(select(CPage).where(CPage.id == page_id))
    page = result.scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")
    await db.delete(page)
    await db.flush()
