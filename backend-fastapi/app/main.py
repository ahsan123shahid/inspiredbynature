from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.redis_client import close_redis

from app.routers import (
    auth,
    products,
    categories,
    collections,
    orders,
    cart,
    users,
    stores,
    media,
    reviews,
    coupons,
    tax,
    admin_dashboard,
    nav,
    pages,
    notifications,
    payments,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await close_redis()


limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])

app = FastAPI(
    title=settings.app_name,
    lifespan=lifespan,
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": "Something went wrong"},
    )


@app.get("/api/health")
async def health():
    return {"status": "ok"}


app.include_router(auth.router)
app.include_router(products.router)
app.include_router(categories.router)
app.include_router(collections.router)
app.include_router(orders.router)
app.include_router(cart.router)
app.include_router(users.router)
app.include_router(stores.router)
app.include_router(media.router)
app.include_router(reviews.router)
app.include_router(coupons.router)
app.include_router(tax.router)
app.include_router(admin_dashboard.router)
app.include_router(nav.router)
app.include_router(pages.router)
app.include_router(notifications.router)
app.include_router(payments.router)
