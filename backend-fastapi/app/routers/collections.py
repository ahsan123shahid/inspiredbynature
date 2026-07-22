from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, delete as sa_delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Collection, collection_product, Product
from app.schemas.collections import CollectionCreate, CollectionUpdate, CollectionResponse
from app.middleware.auth import require_admin

router = APIRouter(prefix="/api/collections", tags=["collections"])


@router.get("", response_model=list[CollectionResponse])
async def list_collections(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Collection).order_by(Collection.id))
    collections = result.scalars().all()
    return [CollectionResponse.model_validate(c) for c in collections]


@router.get("/{collection_id}", response_model=CollectionResponse)
async def get_collection(collection_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Collection).where(Collection.id == collection_id))
    collection = result.scalar_one_or_none()
    if not collection:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found")
    return CollectionResponse.model_validate(collection)


@router.post("", response_model=CollectionResponse, status_code=status.HTTP_201_CREATED)
async def create_collection(data: CollectionCreate, db: AsyncSession = Depends(get_db), admin=Depends(require_admin)):
    product_ids = data.product_ids
    collection = Collection(**data.model_dump(exclude={"product_ids"}))
    db.add(collection)
    await db.flush()

    if product_ids:
        for pid in product_ids:
            db.execute(collection_product.insert().values(collection_id=collection.id, product_id=pid))
        await db.flush()

    await db.refresh(collection)
    return CollectionResponse.model_validate(collection)


@router.put("/{collection_id}", response_model=CollectionResponse)
async def update_collection(
    collection_id: int, data: CollectionUpdate, db: AsyncSession = Depends(get_db), admin=Depends(require_admin)
):
    result = await db.execute(select(Collection).where(Collection.id == collection_id))
    collection = result.scalar_one_or_none()
    if not collection:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found")

    update_data = data.model_dump(exclude_unset=True, exclude={"product_ids"})
    for key, value in update_data.items():
        setattr(collection, key, value)

    if data.product_ids is not None:
        await db.execute(
            sa_delete(collection_product).where(collection_product.c.collection_id == collection_id)
        )
        for pid in data.product_ids:
            await db.execute(
                collection_product.insert().values(collection_id=collection_id, product_id=pid)
            )

    await db.flush()
    await db.refresh(collection)
    return CollectionResponse.model_validate(collection)


@router.delete("/{collection_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_collection(collection_id: int, db: AsyncSession = Depends(get_db), admin=Depends(require_admin)):
    result = await db.execute(select(Collection).where(Collection.id == collection_id))
    collection = result.scalar_one_or_none()
    if not collection:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found")
    await db.delete(collection)
    await db.flush()
