from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Order, Product, User, ProductVariant
from app.schemas.admin import DashboardStats
from app.middleware.auth import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard(db: AsyncSession = Depends(get_db), admin=Depends(require_admin)):
    total_orders = (await db.execute(select(func.count(Order.id)).where(Order.deleted_at.is_(None)))).scalar() or 0
    total_revenue = (await db.execute(select(func.coalesce(func.sum(Order.subtotal), 0)).where(Order.deleted_at.is_(None)))).scalar() or 0
    total_customers = (await db.execute(select(func.count(User.id)).where(User.role == "customer"))).scalar() or 0
    total_products = (await db.execute(select(func.count(Product.id)).where(Product.deleted_at.is_(None)))).scalar() or 0
    pending_orders = (await db.execute(
        select(func.count(Order.id)).where(Order.orderStatus == "Pending", Order.deleted_at.is_(None))
    )).scalar() or 0
    low_stock = (await db.execute(
        select(func.count(ProductVariant.id)).where(
            ProductVariant.stock <= ProductVariant.reorder_threshold,
            ProductVariant.deleted_at.is_(None),
        )
    )).scalar() or 0

    return DashboardStats(
        total_orders=total_orders,
        total_revenue=float(total_revenue),
        total_customers=total_customers,
        total_products=total_products,
        pending_orders=pending_orders,
        low_stock_count=low_stock,
    )


@router.get("/recent-orders")
async def get_recent_orders(db: AsyncSession = Depends(get_db), admin=Depends(require_admin)):
    result = await db.execute(
        select(Order).where(Order.deleted_at.is_(None)).order_by(Order.created_at.desc()).limit(10)
    )
    orders = result.scalars().all()
    return [{
        "id": o.id,
        "orderStatus": o.orderStatus,
        "subtotal": o.subtotal,
        "orderDate": o.orderDate,
        "created_at": o.created_at,
    } for o in orders]


@router.get("/top-products")
async def get_top_products(db: AsyncSession = Depends(get_db), admin=Depends(require_admin)):
    result = await db.execute(
        select(Product).where(Product.deleted_at.is_(None)).order_by(Product.popularity.desc()).limit(10)
    )
    products = result.scalars().all()
    return [{"id": p.id, "title": p.title, "price": p.price, "popularity": p.popularity} for p in products]
