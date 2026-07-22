import math
import json
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import Order, OrderItem, OrderStatusLog, User
from app.schemas.orders import (
    OrderCreate, OrderUpdate, OrderResponse, OrderItemCreate,
    OrderStatusUpdate, OrderStatusLogResponse,
)
from app.middleware.auth import get_current_user, require_admin

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.get("", response_model=dict)
async def list_orders(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(Order).where(Order.deleted_at.is_(None))

    if current_user.role != "admin":
        query = query.where(Order.user_id == current_user.id)
    if status_filter:
        query = query.where(Order.orderStatus == status_filter)

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    query = query.order_by(Order.created_at.desc()).offset((page - 1) * size).limit(size)
    query = query.options(
        selectinload(Order.order_items),
        selectinload(Order.status_logs),
    )
    result = await db.execute(query)
    orders = result.scalars().all()

    return {
        "items": [OrderResponse.model_validate(o) for o in orders],
        "total": total,
        "page": page,
        "size": size,
        "pages": math.ceil(total / size),
    }


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(
        select(Order)
        .where(Order.id == order_id)
        .options(selectinload(Order.order_items), selectinload(Order.status_logs))
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if current_user.role != "admin" and order.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return OrderResponse.model_validate(order)


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    data: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    order = Order(
        user_id=current_user.id if current_user else None,
        data=data.data,
        products=data.products,
        subtotal=data.subtotal,
        orderStatus="Pending",
    )
    db.add(order)
    await db.flush()
    await db.refresh(order)
    return OrderResponse.model_validate(order)


@router.put("/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: int,
    data: OrderUpdate,
    db: AsyncSession = Depends(get_db),
    admin=Depends(require_admin),
):
    result = await db.execute(
        select(Order).where(Order.id == order_id).options(
            selectinload(Order.order_items), selectinload(Order.status_logs)
        )
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(order, key, value)
    await db.flush()
    await db.refresh(order)
    return OrderResponse.model_validate(order)


@router.post("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    data: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    admin=Depends(require_admin),
):
    result = await db.execute(
        select(Order).where(Order.id == order_id).options(
            selectinload(Order.order_items), selectinload(Order.status_logs)
        )
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    log = OrderStatusLog(
        order_id=order.id,
        from_status=order.orderStatus,
        to_status=data.status,
        comment=data.comment,
    )
    db.add(log)
    order.orderStatus = data.status
    await db.flush()
    await db.refresh(order)
    return OrderResponse.model_validate(order)


@router.get("/{order_id}/logs", response_model=list[OrderStatusLogResponse])
async def get_order_logs(order_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(OrderStatusLog).where(OrderStatusLog.order_id == order_id).order_by(OrderStatusLog.created_at.desc())
    )
    logs = result.scalars().all()
    return [OrderStatusLogResponse.model_validate(log) for log in logs]
