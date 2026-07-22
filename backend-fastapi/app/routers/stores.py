from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Store
from app.schemas.store import StoreUpdate, StoreResponse, ThemeSettingsUpdate
from app.middleware.auth import require_admin

router = APIRouter(prefix="/api/store", tags=["store"])


@router.get("", response_model=StoreResponse)
async def get_store(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Store).limit(1))
    store = result.scalar_one_or_none()
    if not store:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Store not found")
    return StoreResponse.model_validate(store)


@router.put("", response_model=StoreResponse)
async def update_store(data: StoreUpdate, db: AsyncSession = Depends(get_db), admin=Depends(require_admin)):
    result = await db.execute(select(Store).limit(1))
    store = result.scalar_one_or_none()
    if not store:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Store not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(store, key, value)
    await db.flush()
    await db.refresh(store)
    return StoreResponse.model_validate(store)


@router.put("/theme", response_model=StoreResponse)
async def update_theme(
    data: ThemeSettingsUpdate,
    db: AsyncSession = Depends(get_db),
    admin=Depends(require_admin),
):
    result = await db.execute(select(Store).limit(1))
    store = result.scalar_one_or_none()
    if not store:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Store not found")
    store.theme_settings = data.theme_settings
    await db.flush()
    await db.refresh(store)
    return StoreResponse.model_validate(store)
