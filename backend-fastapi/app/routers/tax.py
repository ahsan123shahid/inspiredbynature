from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Tax
from app.schemas.admin import TaxUpdate, TaxResponse
from app.middleware.auth import require_admin

router = APIRouter(prefix="/api/taxes", tags=["taxes"])


@router.get("", response_model=TaxResponse)
async def get_taxes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tax).limit(1))
    tax = result.scalar_one_or_none()
    if not tax:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tax configuration not found")
    return TaxResponse.model_validate(tax)


@router.put("", response_model=TaxResponse)
async def update_taxes(data: TaxUpdate, db: AsyncSession = Depends(get_db), admin=Depends(require_admin)):
    result = await db.execute(select(Tax).limit(1))
    tax = result.scalar_one_or_none()
    if not tax:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tax configuration not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(tax, key, value)
    await db.flush()
    await db.refresh(tax)
    return TaxResponse.model_validate(tax)
