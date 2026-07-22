from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Category, SubCategory, CatItem
from app.schemas.categories import (
    CategoryCreate, CategoryUpdate, CategoryResponse,
    SubCategoryCreate, SubCategoryUpdate, SubCategoryResponse,
    CatItemCreate, CatItemUpdate, CatItemResponse,
)
from app.middleware.auth import require_admin

router = APIRouter(prefix="/api/categories", tags=["categories"])


@router.get("", response_model=list[CategoryResponse])
async def list_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).order_by(Category.cat_id))
    categories = result.scalars().all()
    return [CategoryResponse.model_validate(c) for c in categories]


@router.get("/{cat_id}", response_model=CategoryResponse)
async def get_category(cat_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).where(Category.cat_id == cat_id))
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return CategoryResponse.model_validate(category)


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(data: CategoryCreate, db: AsyncSession = Depends(get_db), admin=Depends(require_admin)):
    category = Category(**data.model_dump())
    db.add(category)
    await db.flush()
    await db.refresh(category)
    return CategoryResponse.model_validate(category)


@router.put("/{cat_id}", response_model=CategoryResponse)
async def update_category(cat_id: int, data: CategoryUpdate, db: AsyncSession = Depends(get_db), admin=Depends(require_admin)):
    result = await db.execute(select(Category).where(Category.cat_id == cat_id))
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(category, key, value)
    await db.flush()
    await db.refresh(category)
    return CategoryResponse.model_validate(category)


@router.delete("/{cat_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(cat_id: int, db: AsyncSession = Depends(get_db), admin=Depends(require_admin)):
    result = await db.execute(select(Category).where(Category.cat_id == cat_id))
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    await db.delete(category)
    await db.flush()


@router.get("/{cat_id}/subcategories", response_model=list[SubCategoryResponse])
async def list_subcategories(cat_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(SubCategory).where(SubCategory.cat_id == cat_id).order_by(SubCategory.subcat_id)
    )
    subcategories = result.scalars().all()
    return [SubCategoryResponse.model_validate(s) for s in subcategories]


@router.post("/subcategories", response_model=SubCategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_subcategory(data: SubCategoryCreate, db: AsyncSession = Depends(get_db), admin=Depends(require_admin)):
    sub = SubCategory(**data.model_dump())
    db.add(sub)
    await db.flush()
    await db.refresh(sub)
    return SubCategoryResponse.model_validate(sub)


@router.put("/subcategories/{subcat_id}", response_model=SubCategoryResponse)
async def update_subcategory(subcat_id: int, data: SubCategoryUpdate, db: AsyncSession = Depends(get_db), admin=Depends(require_admin)):
    result = await db.execute(select(SubCategory).where(SubCategory.subcat_id == subcat_id))
    sub = result.scalar_one_or_none()
    if not sub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subcategory not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(sub, key, value)
    await db.flush()
    await db.refresh(sub)
    return SubCategoryResponse.model_validate(sub)


@router.delete("/subcategories/{subcat_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subcategory(subcat_id: int, db: AsyncSession = Depends(get_db), admin=Depends(require_admin)):
    result = await db.execute(select(SubCategory).where(SubCategory.subcat_id == subcat_id))
    sub = result.scalar_one_or_none()
    if not sub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subcategory not found")
    await db.delete(sub)
    await db.flush()


@router.get("/subcategories/{subcat_id}/items", response_model=list[CatItemResponse])
async def list_cat_items(subcat_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CatItem).where(CatItem.subcat_id == subcat_id).order_by(CatItem.cat_item_id)
    )
    items = result.scalars().all()
    return [CatItemResponse.model_validate(i) for i in items]


@router.post("/items", response_model=CatItemResponse, status_code=status.HTTP_201_CREATED)
async def create_cat_item(data: CatItemCreate, db: AsyncSession = Depends(get_db), admin=Depends(require_admin)):
    item = CatItem(**data.model_dump())
    db.add(item)
    await db.flush()
    await db.refresh(item)
    return CatItemResponse.model_validate(item)


@router.put("/items/{cat_item_id}", response_model=CatItemResponse)
async def update_cat_item(cat_item_id: int, data: CatItemUpdate, db: AsyncSession = Depends(get_db), admin=Depends(require_admin)):
    result = await db.execute(select(CatItem).where(CatItem.cat_item_id == cat_item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(item, key, value)
    await db.flush()
    await db.refresh(item)
    return CatItemResponse.model_validate(item)


@router.delete("/items/{cat_item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cat_item(cat_item_id: int, db: AsyncSession = Depends(get_db), admin=Depends(require_admin)):
    result = await db.execute(select(CatItem).where(CatItem.cat_item_id == cat_item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    await db.delete(item)
    await db.flush()
