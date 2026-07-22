from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class UserBase(BaseModel):
    name: str
    lastname: str
    email: str


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    lastname: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None


class UserResponse(UserBase):
    id: int
    role: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class AddressBase(BaseModel):
    user_id: int
    primary_address: bool = False
    Name: str
    address: str
    city: str
    state: str
    zip: int
    phone: int


class AddressCreate(BaseModel):
    primary_address: bool = False
    Name: str
    address: str
    city: str
    state: str
    zip: int
    phone: int


class AddressUpdate(BaseModel):
    primary_address: Optional[bool] = None
    Name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip: Optional[int] = None
    phone: Optional[int] = None


class AddressResponse(AddressBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
