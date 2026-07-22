import datetime
from sqlalchemy import (
    Column, BigInteger, Integer, String, Text, Float, Boolean, DateTime,
    JSON, ForeignKey, Table, UniqueConstraint, Index, Enum as SAEnum,
    DECIMAL,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    lastname = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password = Column(String, nullable=False)
    role = Column(String, default="customer")
    remember_token = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    addresses = relationship("Address", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="user")
    cart_items = relationship("Cart", back_populates="user", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="user", cascade="all, delete-orphan")


class Product(Base):
    __tablename__ = "products"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    title = Column(String, nullable=False)
    sku = Column(String, unique=True, nullable=True, index=True)
    image = Column(String, nullable=True)
    category = Column(String, nullable=True)
    price = Column(Float, default=0)
    popularity = Column(Integer, default=0)
    stock = Column(Integer, default=0)
    category_id = Column(BigInteger, ForeignKey("categories.cat_id", ondelete="SET NULL"), nullable=True, index=True)
    subcategory_id = Column(BigInteger, ForeignKey("sub_categories.subcat_id", ondelete="SET NULL"), nullable=True, index=True)
    deleted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    category_rel = relationship("Category", back_populates="products", foreign_keys=[category_id])
    subcategory = relationship("SubCategory", back_populates="products", foreign_keys=[subcategory_id])
    collections = relationship("Collection", secondary="collection_product", back_populates="products")
    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="product", cascade="all, delete-orphan")
    cart_items = relationship("Cart", back_populates="product", cascade="all, delete-orphan")


class ProductVariant(Base):
    __tablename__ = "product_variants"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    product_id = Column(BigInteger, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    sku = Column(String, unique=True, nullable=True, index=True)
    size = Column(String, nullable=True)
    color = Column(String, nullable=True)
    price = Column(DECIMAL(10, 2), nullable=True)
    stock = Column(Integer, default=0)
    reorder_threshold = Column(Integer, default=5)
    deleted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("product_id", "size", "color", name="product_variant_unique"),
    )

    product = relationship("Product", back_populates="variants")


class Category(Base):
    __tablename__ = "categories"

    cat_id = Column(BigInteger, primary_key=True, autoincrement=True)
    cat_title = Column(String, nullable=False)
    cat_img = Column(String, nullable=True)
    handle = Column(String, nullable=True)
    SEOtitle = Column(String, nullable=True)
    SEOdescription = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    products = relationship("Product", back_populates="category_rel", foreign_keys=[Product.category_id])
    subcategories = relationship("SubCategory", back_populates="category", cascade="all, delete-orphan")
    collections = relationship("Collection", back_populates="category")


class SubCategory(Base):
    __tablename__ = "sub_categories"

    subcat_id = Column(BigInteger, primary_key=True, autoincrement=True)
    cat_id = Column(BigInteger, ForeignKey("categories.cat_id", ondelete="CASCADE"), nullable=False)
    subcat_title = Column(String, nullable=False)
    subcat_img = Column(String, nullable=True)
    handle = Column(String, nullable=True)
    SEOdescription = Column(String, nullable=True)
    SEOtitle = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    category = relationship("Category", back_populates="subcategories")
    cat_items = relationship("CatItem", back_populates="subcategory", cascade="all, delete-orphan")
    products = relationship("Product", back_populates="subcategory", foreign_keys=[Product.subcategory_id])


class CatItem(Base):
    __tablename__ = "cat_items"

    cat_item_id = Column(BigInteger, primary_key=True, autoincrement=True)
    subcat_id = Column(BigInteger, ForeignKey("sub_categories.subcat_id", ondelete="CASCADE"), nullable=False)
    cat_item_title = Column(String, nullable=False)
    cat_item_img = Column(String, nullable=True)
    SEOdescription = Column(String, nullable=True)
    SEOtitle = Column(String, nullable=True)
    handle = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    subcategory = relationship("SubCategory", back_populates="cat_items")


class Collection(Base):
    __tablename__ = "collections"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    title = Column(String, nullable=False)
    image = Column(String, nullable=True)
    handle = Column(String, nullable=True)
    SEOdescription = Column(String, nullable=True)
    SEOtitle = Column(String, nullable=True)
    cat_id = Column(BigInteger, ForeignKey("categories.cat_id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    category = relationship("Category", back_populates="collections")
    products = relationship("Product", secondary="collection_product", back_populates="collections")


collection_product = Table(
    "collection_product",
    Base.metadata,
    Column("id", BigInteger, primary_key=True, autoincrement=True),
    Column("product_id", BigInteger, ForeignKey("products.id", ondelete="CASCADE"), nullable=False),
    Column("collection_id", BigInteger, ForeignKey("collections.id", ondelete="CASCADE"), nullable=False),
    Column("created_at", DateTime, server_default=func.now()),
    Column("updated_at", DateTime, onupdate=func.now()),
)


class Order(Base):
    __tablename__ = "orders"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    data = Column(Text, nullable=True)
    products = Column(Text, nullable=True)
    subtotal = Column(Float, default=0)
    orderStatus = Column(String, default="Processing", index=True)
    orderDate = Column(String, nullable=True)
    deleted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    user = relationship("User", back_populates="orders")
    status_logs = relationship("OrderStatusLog", back_populates="order", cascade="all, delete-orphan",
                               order_by="OrderStatusLog.created_at.desc()")
    order_items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    order_id = Column(BigInteger, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_title = Column(String, nullable=False)
    product_image = Column(String, nullable=True)
    product_color = Column(String, nullable=False)
    product_size = Column(String, nullable=False)
    product_price = Column(Float, default=0)
    qty = Column(Text, nullable=False)
    total = Column(Float, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    order = relationship("Order", back_populates="order_items")


class OrderStatusLog(Base):
    __tablename__ = "order_status_logs"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    order_id = Column(BigInteger, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    from_status = Column(String, nullable=True)
    to_status = Column(String, nullable=False)
    changed_by = Column(BigInteger, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    comment = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    order = relationship("Order", back_populates="status_logs")
    changer = relationship("User")


class Cart(Base):
    __tablename__ = "carts"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    pro_id = Column(BigInteger, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    product_title = Column(String, nullable=False)
    product_image = Column(String, nullable=True)
    product_size = Column(String, nullable=True)
    product_color = Column(String, nullable=True)
    product_price = Column(Float, default=0)
    quantity = Column(Integer, default=0)
    total = Column(Float, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    product = relationship("Product", back_populates="cart_items")
    user = relationship("User", back_populates="cart_items")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    product_id = Column(BigInteger, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Float, nullable=False)
    review = Column(String, nullable=False)
    pic1 = Column(String, nullable=True)
    pic2 = Column(String, nullable=True)
    pic3 = Column(String, nullable=True)
    pic4 = Column(String, nullable=True)
    username = Column(String, nullable=True)
    usercity = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    user = relationship("User", back_populates="reviews")
    product = relationship("Product", back_populates="reviews")


class Address(Base):
    __tablename__ = "addresses"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    primary_address = Column(Boolean, default=False)
    Name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    zip = Column(Integer, nullable=False)
    phone = Column(BigInteger, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    user = relationship("User", back_populates="addresses")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    order_id = Column(BigInteger, ForeignKey("orders.id", ondelete="SET NULL"), nullable=True)
    cardholder = Column(String, nullable=False)
    card = Column(String, nullable=False)
    month = Column(String, nullable=False)
    year = Column(String, nullable=False)
    transaction_id = Column(String, nullable=True, unique=True)
    payment_method = Column(String, nullable=True)
    payment_status = Column(String, default="pending")
    amount = Column(Float, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    user = relationship("User", back_populates="payments")
    order = relationship("Order", back_populates="payments")


class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    code = Column(String, unique=True, nullable=False, index=True)
    type = Column(String, nullable=False)
    value = Column(DECIMAL(10, 2), nullable=False)
    min_order_value = Column(DECIMAL(10, 2), default=0.00)
    starts_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    title = Column(String, nullable=True)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())


class Tax(Base):
    __tablename__ = "taxes"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    digital = Column(String(1024), nullable=False)
    food = Column(String(1024), nullable=False)
    nonfood = Column(String(1024), nullable=False)


class CPage(Base):
    __tablename__ = "c_pages"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    title = Column(String(1024), nullable=True)
    description = Column(String(1024), nullable=True)
    SEOtitle = Column(String(1024), nullable=True)
    SEOdescription = Column(String(1024), nullable=True)
    SEOurl = Column(String(1024), nullable=True)
    visibility = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())


class NavItem(Base):
    __tablename__ = "nav_items"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    label = Column(String, nullable=False)
    slug = Column(String, nullable=False)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())


class Store(Base):
    __tablename__ = "stores"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    StoreName = Column(String(1024), nullable=True)
    StoreEmail = Column(String(1024), nullable=True)
    SenderEmail = Column(String(1024), nullable=True)
    StoreIndustry = Column(String(1024), nullable=True)
    LegalName = Column(String(1024), nullable=True)
    Phone = Column(String(1024), nullable=True)
    Streets = Column(String(1024), nullable=True)
    Apartment = Column(String(1024), nullable=True)
    City = Column(String(1024), nullable=True)
    ZipCode = Column(String(1024), nullable=True)
    Country = Column(String(1024), nullable=True)
    TimeZone = Column(String(1024), nullable=True)
    UnitSystem = Column(String(1024), nullable=True)
    WeightUnit = Column(String(1024), nullable=True)
    Currency = Column(String(1024), nullable=True)
    theme_settings = Column(JSON, nullable=True)
    ShippingFee = Column(DECIMAL(10, 2), nullable=True, default=500)
    FreeShippingThreshold = Column(DECIMAL(10, 2), nullable=True, default=0)
    fb_connected = Column(Integer, default=0)
    fb_access_token = Column(Text, nullable=True)
    fb_business_manager = Column(String(1024), nullable=True)
    fb_ad_account = Column(String(1024), nullable=True)
    fb_page = Column(String(1024), nullable=True)
    fb_pixel_id = Column(String(1024), nullable=True)
    fb_data_sharing = Column(String(1024), default="Maximum")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    token = Column(String, unique=True, nullable=False, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_revoked = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    user = relationship("User", back_populates="refresh_tokens")
