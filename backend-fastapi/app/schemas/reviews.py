from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ReviewBase(BaseModel):
    user_id: Optional[int] = None
    product_id: int
    rating: float
    review: str
    pic1: Optional[str] = None
    pic2: Optional[str] = None
    pic3: Optional[str] = None
    pic4: Optional[str] = None
    username: Optional[str] = None
    usercity: Optional[str] = None


class ReviewCreate(BaseModel):
    product_id: int
    rating: float
    review: str
    pic1: Optional[str] = None
    pic2: Optional[str] = None
    pic3: Optional[str] = None
    pic4: Optional[str] = None
    username: Optional[str] = None
    usercity: Optional[str] = None


class ReviewResponse(ReviewBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
