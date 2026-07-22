from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.database import get_db
from app.models import User, RefreshToken
from app.utils.auth import (
    hash_password, verify_password, create_access_token, create_refresh_token,
    generate_token_hash, decode_token,
)
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])
limiter = Limiter(key_func=get_remote_address)


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    name: str
    lastname: str
    email: str
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: dict


@router.post("/login")
@limiter.limit("5/minute")
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(request.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    access_token = create_access_token(user.id, user.role)
    refresh_token = create_refresh_token(user.id)

    token_hash = generate_token_hash(refresh_token)
    db.add(RefreshToken(
        token=token_hash,
        user_id=user.id,
        expires_at=datetime.now(timezone.utc).replace(tzinfo=None),
    ))
    await db.flush()

    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={"id": user.id, "name": user.name, "lastname": user.lastname, "email": user.email, "role": user.role},
    )


@router.post("/register")
@limiter.limit("5/minute")
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == request.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        name=request.name,
        lastname=request.lastname,
        email=request.email,
        password=hash_password(request.password),
        role="customer",
    )
    db.add(user)
    await db.flush()

    access_token = create_access_token(user.id, user.role)
    refresh_token = create_refresh_token(user.id)

    token_hash = generate_token_hash(refresh_token)
    db.add(RefreshToken(
        token=token_hash,
        user_id=user.id,
        expires_at=datetime.now(timezone.utc).replace(tzinfo=None),
    ))
    await db.flush()

    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={"id": user.id, "name": user.name, "lastname": user.lastname, "email": user.email, "role": user.role},
    )


@router.post("/refresh")
@limiter.limit("10/minute")
async def refresh(request: RefreshRequest, db: AsyncSession = Depends(get_db)):
    payload = decode_token(request.refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user_id = int(payload["sub"])
    token_hash = generate_token_hash(request.refresh_token)

    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.token == token_hash,
            RefreshToken.user_id == user_id,
            RefreshToken.is_revoked == False,
        )
    )
    stored_token = result.scalar_one_or_none()
    if not stored_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token revoked or not found")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    stored_token.is_revoked = True

    access_token = create_access_token(user.id, user.role)
    new_refresh_token = create_refresh_token(user.id)

    db.add(RefreshToken(
        token=generate_token_hash(new_refresh_token),
        user_id=user.id,
        expires_at=datetime.now(timezone.utc).replace(tzinfo=None),
    ))
    await db.flush()

    return AuthResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        user={"id": user.id, "name": user.name, "lastname": user.lastname, "email": user.email, "role": user.role},
    )


@router.post("/logout")
async def logout(
    request: RefreshRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    token_hash = generate_token_hash(request.refresh_token)
    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.token == token_hash,
            RefreshToken.user_id == current_user.id,
            RefreshToken.is_revoked == False,
        )
    )
    stored_token = result.scalar_one_or_none()
    if stored_token:
        stored_token.is_revoked = True
        await db.flush()

    return {"message": "Logged out successfully"}


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "lastname": current_user.lastname,
        "email": current_user.email,
        "role": current_user.role,
    }
