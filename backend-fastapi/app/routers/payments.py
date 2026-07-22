from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from decimal import Decimal

from app.database import get_db
from app.models import Payment, Order, User
from app.services.easypay import create_payment_request, verify_webhook_signature
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/api/payments", tags=["payments"])


class InitiateRequest(BaseModel):
    order_id: int
    return_url: str


@router.post("/easypay/initiate")
async def initiate_payment(
    data: InitiateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Order).where(Order.id == data.order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    if current_user.role != "admin" and order.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    payment_data = create_payment_request(
        order_id=order.id,
        amount=Decimal(str(order.subtotal)),
        return_url=data.return_url,
    )

    payment = Payment(
        user_id=current_user.id,
        order_id=order.id,
        cardholder="",
        card="",
        month="",
        year="",
        amount=order.subtotal,
        payment_method="easypay",
        payment_status="pending",
    )
    db.add(payment)
    await db.flush()

    return payment_data


@router.post("/easypay/webhook")
async def easypay_webhook(payload: dict, db: AsyncSession = Depends(get_db)):
    if not verify_webhook_signature(payload):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid signature")

    transaction_id = payload.get("transactionId")
    order_ref = payload.get("orderRefNum")
    status_value = payload.get("status")

    if not transaction_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing transaction ID")

    existing = await db.execute(
        select(Payment).where(Payment.transaction_id == transaction_id)
    )
    if existing.scalar():
        return {"status": "already_processed"}

    if order_ref:
        result = await db.execute(select(Order).where(Order.id == int(order_ref)))
        order = result.scalar_one_or_none()
        if order:
            order.orderStatus = "Processing" if status_value == "success" else "Pending"
            order.payment_status = "paid" if status_value == "success" else "failed"

    payment_record = await db.execute(
        select(Payment).where(Payment.order_id == int(order_ref)) if order_ref else select(Payment).limit(0)
    )
    payment = payment_record.scalar_one_or_none()
    if payment:
        payment.transaction_id = transaction_id
        payment.payment_status = "completed" if status_value == "success" else "failed"

    await db.flush()
    return {"status": "processed"}


@router.get("/easypay/return")
async def easypay_return(
    orderRefNum: str = None,
    status: str = None,
    db: AsyncSession = Depends(get_db),
):
    if status == "success":
        return {"status": "success", "message": "Payment successful", "order_id": orderRefNum}
    return {"status": "failed", "message": "Payment failed or cancelled", "order_id": orderRefNum}
