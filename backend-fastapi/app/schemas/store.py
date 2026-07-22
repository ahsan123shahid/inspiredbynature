from typing import Any, Optional
from pydantic import BaseModel
from decimal import Decimal


class StoreBase(BaseModel):
    StoreName: Optional[str] = None
    StoreEmail: Optional[str] = None
    SenderEmail: Optional[str] = None
    StoreIndustry: Optional[str] = None
    LegalName: Optional[str] = None
    Phone: Optional[str] = None
    Streets: Optional[str] = None
    Apartment: Optional[str] = None
    City: Optional[str] = None
    ZipCode: Optional[str] = None
    Country: Optional[str] = None
    TimeZone: Optional[str] = None
    UnitSystem: Optional[str] = None
    WeightUnit: Optional[str] = None
    Currency: Optional[str] = None
    ShippingFee: Optional[Decimal] = None
    FreeShippingThreshold: Optional[Decimal] = None
    fb_pixel_id: Optional[str] = None
    fb_data_sharing: Optional[str] = None


class StoreUpdate(BaseModel):
    StoreName: Optional[str] = None
    StoreEmail: Optional[str] = None
    SenderEmail: Optional[str] = None
    StoreIndustry: Optional[str] = None
    LegalName: Optional[str] = None
    Phone: Optional[str] = None
    Streets: Optional[str] = None
    Apartment: Optional[str] = None
    City: Optional[str] = None
    ZipCode: Optional[str] = None
    Country: Optional[str] = None
    TimeZone: Optional[str] = None
    UnitSystem: Optional[str] = None
    WeightUnit: Optional[str] = None
    Currency: Optional[str] = None
    ShippingFee: Optional[Decimal] = None
    FreeShippingThreshold: Optional[Decimal] = None
    fb_pixel_id: Optional[str] = None
    fb_data_sharing: Optional[str] = None


class ThemeSettingsUpdate(BaseModel):
    theme_settings: dict[str, Any]


class StoreResponse(StoreBase):
    id: int
    theme_settings: Optional[dict[str, Any]] = None
    fb_connected: int = 0
    fb_access_token: Optional[str] = None
    fb_business_manager: Optional[str] = None
    fb_ad_account: Optional[str] = None
    fb_page: Optional[str] = None

    model_config = {"from_attributes": True}
