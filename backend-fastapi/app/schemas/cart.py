from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class CartBase(BaseModel):
    pro_id: int
    user_id: int
    product_title: str
    product_image: Optional[str] = None
    product_size: Optional[str] = None
    product_color: Optional[str] = None
    product_price: float = 0
    quantity: int = 1
    total: float = 0


class CartCreate(BaseModel):
    pro_id: int
    product_title: str
    product_image: Optional[str] = None
    product_size: Optional[str] = None
    product_color: Optional[str] = None
    product_price: float = 0
    quantity: int = 1


class CartUpdate(BaseModel):
    quantity: int


class CartResponse(CartBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class CartListResponse(BaseModel):
    items: list[CartResponse]
    total: float = 0
