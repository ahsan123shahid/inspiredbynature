from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Coupon
from app.schemas.coupons import (
    CouponCreate, CouponUpdate, CouponResponse,
    CouponValidateRequest, CouponValidateResponse,
)
from app.middleware.auth import require_admin

router = APIRouter(prefix="/api/coupons", tags=["coupons"])


@router.get("", response_model=list[CouponResponse])
async def list_coupons(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Coupon).order_by(Coupon.id.desc()))
    coupons = result.scalars().all()
    return [CouponResponse.model_validate(c) for c in coupons]


@router.post("", response_model=CouponResponse, status_code=status.HTTP_201_CREATED)
async def create_coupon(data: CouponCreate, db: AsyncSession = Depends(get_db), admin=Depends(require_admin)):
    coupon = Coupon(**data.model_dump())
    db.add(coupon)
    await db.flush()
    await db.refresh(coupon)
    return CouponResponse.model_validate(coupon)


@router.put("/{coupon_id}", response_model=CouponResponse)
async def update_coupon(
    coupon_id: int, data: CouponUpdate, db: AsyncSession = Depends(get_db), admin=Depends(require_admin)
):
    result = await db.execute(select(Coupon).where(Coupon.id == coupon_id))
    coupon = result.scalar_one_or_none()
    if not coupon:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coupon not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(coupon, key, value)
    await db.flush()
    await db.refresh(coupon)
    return CouponResponse.model_validate(coupon)


@router.delete("/{coupon_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_coupon(coupon_id: int, db: AsyncSession = Depends(get_db), admin=Depends(require_admin)):
    result = await db.execute(select(Coupon).where(Coupon.id == coupon_id))
    coupon = result.scalar_one_or_none()
    if not coupon:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coupon not found")
    await db.delete(coupon)
    await db.flush()


@router.post("/validate", response_model=CouponValidateResponse)
async def validate_coupon(data: CouponValidateRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Coupon).where(Coupon.code == data.code, Coupon.is_active == True))
    coupon = result.scalar_one_or_none()
    if not coupon:
        return CouponValidateResponse(valid=False, discount=0, message="Invalid or expired coupon code")

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    if coupon.starts_at and now < coupon.starts_at.replace(tzinfo=None) if coupon.starts_at.tzinfo else coupon.starts_at:
        return CouponValidateResponse(valid=False, discount=0, message="Coupon is not yet active")
    if coupon.expires_at and now > (coupon.expires_at.replace(tzinfo=None) if coupon.expires_at.tzinfo else coupon.expires_at):
        return CouponValidateResponse(valid=False, discount=0, message="Coupon has expired")
    if data.subtotal < float(coupon.min_order_value):
        return CouponValidateResponse(
            valid=False, discount=0,
            message=f"Minimum order value of {coupon.min_order_value} required",
        )

    if coupon.type.lower() == "percentage":
        discount = min(data.subtotal * float(coupon.value) / 100, data.subtotal)
    else:
        discount = min(float(coupon.value), data.subtotal)

    return CouponValidateResponse(valid=True, discount=round(discount, 2), message="Coupon applied")
