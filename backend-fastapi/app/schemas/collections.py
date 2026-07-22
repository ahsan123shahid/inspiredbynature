from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class CollectionBase(BaseModel):
    title: str
    image: Optional[str] = None
    handle: Optional[str] = None
    SEOdescription: Optional[str] = None
    SEOtitle: Optional[str] = None
    cat_id: Optional[int] = None


class CollectionCreate(CollectionBase):
    product_ids: list[int] = []


class CollectionUpdate(BaseModel):
    title: Optional[str] = None
    image: Optional[str] = None
    handle: Optional[str] = None
    SEOdescription: Optional[str] = None
    SEOtitle: Optional[str] = None
    cat_id: Optional[int] = None
    product_ids: Optional[list[int]] = None


class CollectionResponse(CollectionBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
