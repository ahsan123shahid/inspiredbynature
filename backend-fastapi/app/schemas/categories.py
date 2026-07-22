from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class CategoryBase(BaseModel):
    cat_title: str
    cat_img: Optional[str] = None
    handle: Optional[str] = None
    SEOtitle: Optional[str] = None
    SEOdescription: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    cat_title: Optional[str] = None
    cat_img: Optional[str] = None
    handle: Optional[str] = None
    SEOtitle: Optional[str] = None
    SEOdescription: Optional[str] = None


class CategoryResponse(CategoryBase):
    cat_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class SubCategoryBase(BaseModel):
    cat_id: int
    subcat_title: str
    subcat_img: Optional[str] = None
    handle: Optional[str] = None
    SEOdescription: Optional[str] = None
    SEOtitle: Optional[str] = None


class SubCategoryCreate(SubCategoryBase):
    pass


class SubCategoryUpdate(BaseModel):
    cat_id: Optional[int] = None
    subcat_title: Optional[str] = None
    subcat_img: Optional[str] = None
    handle: Optional[str] = None
    SEOdescription: Optional[str] = None
    SEOtitle: Optional[str] = None


class SubCategoryResponse(SubCategoryBase):
    subcat_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class CatItemBase(BaseModel):
    subcat_id: int
    cat_item_title: str
    cat_item_img: Optional[str] = None
    SEOdescription: Optional[str] = None
    SEOtitle: Optional[str] = None
    handle: Optional[str] = None


class CatItemCreate(CatItemBase):
    pass


class CatItemUpdate(BaseModel):
    subcat_id: Optional[int] = None
    cat_item_title: Optional[str] = None
    cat_item_img: Optional[str] = None
    SEOdescription: Optional[str] = None
    SEOtitle: Optional[str] = None
    handle: Optional[str] = None


class CatItemResponse(CatItemBase):
    cat_item_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
