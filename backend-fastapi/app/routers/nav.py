from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import NavItem
from app.schemas.admin import NavItemCreate, NavItemUpdate, NavItemResponse
from app.middleware.auth import require_admin

router = APIRouter(prefix="/api/nav", tags=["navigation"])


@router.get("", response_model=list[NavItemResponse])
async def list_nav_items(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(NavItem).order_by(NavItem.sort_order))
    items = result.scalars().all()
    return [NavItemResponse.model_validate(i) for i in items]


@router.post("", response_model=NavItemResponse, status_code=status.HTTP_201_CREATED)
async def create_nav_item(data: NavItemCreate, db: AsyncSession = Depends(get_db), admin=Depends(require_admin)):
    item = NavItem(**data.model_dump())
    db.add(item)
    await db.flush()
    await db.refresh(item)
    return NavItemResponse.model_validate(item)


@router.put("/{item_id}", response_model=NavItemResponse)
async def update_nav_item(
    item_id: int, data: NavItemUpdate, db: AsyncSession = Depends(get_db), admin=Depends(require_admin)
):
    result = await db.execute(select(NavItem).where(NavItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nav item not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(item, key, value)
    await db.flush()
    await db.refresh(item)
    return NavItemResponse.model_validate(item)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_nav_item(item_id: int, db: AsyncSession = Depends(get_db), admin=Depends(require_admin)):
    result = await db.execute(select(NavItem).where(NavItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nav item not found")
    await db.delete(item)
    await db.flush()
