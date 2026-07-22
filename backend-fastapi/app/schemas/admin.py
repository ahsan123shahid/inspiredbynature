from typing import Optional
from pydantic import BaseModel
from decimal import Decimal


class DashboardStats(BaseModel):
    total_orders: int = 0
    total_revenue: float = 0
    total_customers: int = 0
    total_products: int = 0
    pending_orders: int = 0
    low_stock_count: int = 0


class TaxBase(BaseModel):
    digital: str
    food: str
    nonfood: str


class TaxUpdate(BaseModel):
    digital: Optional[str] = None
    food: Optional[str] = None
    nonfood: Optional[str] = None


class TaxResponse(TaxBase):
    id: int

    model_config = {"from_attributes": True}


class NotificationBase(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None


class NotificationCreate(NotificationBase):
    pass


class NotificationResponse(NotificationBase):
    id: int

    model_config = {"from_attributes": True}


class CPageBase(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    SEOtitle: Optional[str] = None
    SEOdescription: Optional[str] = None
    SEOurl: Optional[str] = None
    visibility: Optional[int] = None


class CPageCreate(CPageBase):
    pass


class CPageUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    SEOtitle: Optional[str] = None
    SEOdescription: Optional[str] = None
    SEOurl: Optional[str] = None
    visibility: Optional[int] = None


class CPageResponse(CPageBase):
    id: int

    model_config = {"from_attributes": True}


class NavItemBase(BaseModel):
    label: str
    slug: str
    sort_order: int = 0


class NavItemCreate(NavItemBase):
    pass


class NavItemUpdate(BaseModel):
    label: Optional[str] = None
    slug: Optional[str] = None
    sort_order: Optional[int] = None


class NavItemResponse(NavItemBase):
    id: int

    model_config = {"from_attributes": True}
