from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, delete as sa_delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import Cart, Product, User
from app.schemas.cart import CartCreate, CartUpdate, CartResponse, CartListResponse
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/cart", tags=["cart"])


@router.get("", response_model=CartListResponse)
async def get_cart(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Cart).where(Cart.user_id == current_user.id).options(selectinload(Cart.product))
    )
    items = result.scalars().all()
    total = sum(item.total for item in items)
    return CartListResponse(
        items=[CartResponse.model_validate(i) for i in items],
        total=total,
    )


@router.post("", response_model=CartResponse, status_code=status.HTTP_201_CREATED)
async def add_to_cart(
    data: CartCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Cart).where(
            Cart.user_id == current_user.id,
            Cart.pro_id == data.pro_id,
            Cart.product_size == data.product_size,
            Cart.product_color == data.product_color,
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        existing.quantity += data.quantity
        existing.total = existing.product_price * existing.quantity
        await db.flush()
        await db.refresh(existing)
        return CartResponse.model_validate(existing)

    cart_item = Cart(
        user_id=current_user.id,
        pro_id=data.pro_id,
        product_title=data.product_title,
        product_image=data.product_image,
        product_size=data.product_size,
        product_color=data.product_color,
        product_price=data.product_price,
        quantity=data.quantity,
        total=data.product_price * data.quantity,
    )
    db.add(cart_item)
    await db.flush()
    await db.refresh(cart_item)
    return CartResponse.model_validate(cart_item)


@router.put("/{item_id}", response_model=CartResponse)
async def update_cart_item(
    item_id: int,
    data: CartUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Cart).where(Cart.id == item_id, Cart.user_id == current_user.id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")
    item.quantity = data.quantity
    item.total = item.product_price * data.quantity
    await db.flush()
    await db.refresh(item)
    return CartResponse.model_validate(item)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_cart_item(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Cart).where(Cart.id == item_id, Cart.user_id == current_user.id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")
    await db.delete(item)
    await db.flush()


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def clear_cart(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    await db.execute(sa_delete(Cart).where(Cart.user_id == current_user.id))
    await db.flush()
