from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class OrderBase(BaseModel):
    user_id: Optional[int] = None
    data: Optional[str] = None
    products: Optional[str] = None
    subtotal: float = 0
    orderStatus: str = "Pending"
    orderDate: Optional[str] = None


class OrderCreate(BaseModel):
    data: Optional[str] = None
    products: Optional[str] = None
    subtotal: float = 0


class OrderUpdate(BaseModel):
    orderStatus: Optional[str] = None
    data: Optional[str] = None


class OrderItemBase(BaseModel):
    order_id: int
    product_title: str
    product_image: Optional[str] = None
    product_color: str = ""
    product_size: str = ""
    product_price: float = 0
    qty: str = "1"
    total: float = 0


class OrderItemCreate(BaseModel):
    product_title: str
    product_image: Optional[str] = None
    product_color: str = ""
    product_size: str = ""
    product_price: float = 0
    qty: str = "1"
    total: float = 0


class OrderStatusLogResponse(BaseModel):
    id: int
    order_id: int
    from_status: Optional[str] = None
    to_status: str
    changed_by: Optional[int] = None
    comment: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class OrderItemResponse(OrderItemBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class OrderResponse(OrderBase):
    id: int
    deleted_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    order_items: list[OrderItemResponse] = []
    status_logs: list[OrderStatusLogResponse] = []

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    status: str
    comment: Optional[str] = None
