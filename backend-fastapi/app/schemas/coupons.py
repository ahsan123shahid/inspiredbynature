from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from decimal import Decimal


class CouponBase(BaseModel):
    code: str
    type: str
    value: Decimal
    min_order_value: Decimal = Decimal("0.00")
    starts_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    is_active: bool = True


class CouponCreate(CouponBase):
    pass


class CouponUpdate(BaseModel):
    code: Optional[str] = None
    type: Optional[str] = None
    value: Optional[Decimal] = None
    min_order_value: Optional[Decimal] = None
    starts_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    is_active: Optional[bool] = None


class CouponResponse(CouponBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class CouponValidateRequest(BaseModel):
    code: str
    subtotal: float


class CouponValidateResponse(BaseModel):
    valid: bool
    discount: float = 0
    message: str = ""
