# Implementation Plan: Full Stack Rebuild — FastAPI + Next.js E-Commerce Store (v2)

**Goal:** Rebuild Inspired by Nature perfume store (React/Vite + Laravel/PHP) → FastAPI (Python) + Next.js 14 + PostgreSQL + Redis + EasyPaisa.

**Timeline:** 1-2 days for core functionality, staging verification before cutover.

> **Note:** Domain, DB names, and product fields are placeholders (`inspiredbynature.com`, `inspired_by_nature`) — swap in real domain and VPS IP once confirmed.

---

## Architecture

```
inspired-by-nature-v2/
├── backend/                    # FastAPI Python Backend
│   ├── app/
│   │   ├── main.py            # FastAPI app + middleware stack
│   │   ├── config.py          # Pydantic Settings (env-only secrets)
│   │   ├── database.py        # SQLAlchemy async engine + session
│   │   ├── redis_client.py    # Redis connection pool
│   │   ├── models/            # SQLAlchemy ORM models (mapped from Laravel)
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   ├── routers/           # API route handlers
│   │   ├── middleware/        # Auth, CORS, security headers, rate limiting
│   │   ├── services/          # Business logic (payments, coupons, etc.)
│   │   └── utils/             # JWT, bcrypt, file handling
│   ├── migrations/            # Alembic migration scripts
│   ├── scripts/
│   │   └── migrate_from_laravel.py  # Schema validation script
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/                   # Next.js 14 (App Router)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (store)/       # Customer-facing (SSR for SEO)
│   │   │   └── admin/         # Admin panel (client-side)
│   │   ├── components/
│   │   ├── lib/               # API client, auth, utilities
│   │   └── styles/
│   ├── public/
│   └── next.config.js
│
├── nginx/
│   ├── staging.conf           # beta.inspiredbynature.com
│   ├── production.conf        # inspiredbynature.com (new stack)
│   └── rollback.conf          # inspiredbynature.com (instant revert to Laravel)
│
└── docker-compose.yml          # All services
```

---

## Phase 0: Database Migration Strategy

> CAUTION: Never run migration scripts against the live database. Always work on a copy first.

### 0.1 Database Copy for Development
- `pg_dump` the live `inspired_by_nature` database on VPS
- Create `inspired_by_nature_v2` database from the dump
- All development and staging points to `inspired_by_nature_v2`
- Production cutover only after full QA pass

### 0.2 SQLAlchemy Model Mapping (Laravel → SQLAlchemy)

**Standard Tables (direct mapping)**

| Laravel Model | SQLAlchemy Model | Primary Key | Notes |
|---|---|---|---|
| User | User | id (bigserial) | role stored as VARCHAR not enum — keep as-is |
| Product | Product | id | pro_img through pro_img5 stay as VARCHAR columns; product represents a fragrance (one SKU per scent) |
| Category | Category | id | Has slug, seo_title, seo_description (e.g. Men, Women, Unisex, Attars/Oud) |
| SubCategory | SubCategory | id | FK → categories.id (e.g. Woody, Floral, Oriental, Fresh, Musk) |
| CatItem | CatItem | id | FK → sub_categories.id |
| Order | Order | id | shipping_address/billing_address stored as JSON text |
| OrderItem | OrderItem | id | FK → orders.id, products.id |
| Cart | Cart | id | session_id for guest carts |
| Review | Review | id | user_id nullable (guest reviews allowed) |
| Address | Address | id | FK → users.id |
| Payment | Payment | id | FK → orders.id |
| Coupon | Coupon | id | type is VARCHAR ('Percentage'/'Fixed Amount'), NOT Postgres enum |
| Notification | Notification | id | Simple CRUD |
| Tax | Tax | id | Rate percentage, country/state |
| CPage | CPage | id | CMS pages with slug, content (text), status |
| NavItem | NavItem | id | parent_id self-referencing for nested menus |
| ProductVariant | ProductVariant | id | FK → products.id — bottle size/concentration (e.g. 30ml/50ml/100ml, EDT/EDP/Parfum) |

**Tricky Tables (require special handling)**

**stores table — JSON columns:**
```python
class Store(Base):
    __tablename__ = "stores"
    id = Column(BigInteger, primary_key=True)
    name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    currency = Column(String, nullable=True)
    shipping_fee = Column(String, nullable=True)  # VARCHAR in Laravel, not numeric
    theme_settings = Column(JSON, nullable=True)
    installed_apps = Column(JSON, nullable=True)
    seo_settings = Column(JSON, nullable=True)
    fb_pixel_id = Column(String, nullable=True)
    fb_connected = Column(Boolean, default=False)
    fb_access_token = Column(Text, nullable=True)
    fb_business_manager = Column(String, nullable=True)
    fb_ad_account = Column(String, nullable=True)
    fb_page = Column(String, nullable=True)
    fb_data_sharing = Column(String, nullable=True)
```

**collection_product pivot table — no model, use SQLAlchemy Table:**
```python
collection_product = Table(
    "collection_product",
    Base.metadata,
    Column("collection_id", BigInteger, ForeignKey("collections.id", ondelete="CASCADE")),
    Column("product_id", BigInteger, ForeignKey("products.id", ondelete="CASCADE")),
)
```

**orders table — status fields are VARCHAR, not enum:**
```python
status = Column(String, default="pending")
payment_status = Column(String, default="unpaid")
```

**refresh_tokens table:**
```python
class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"))
    token_hash = Column(String, nullable=False)
    expires_at = Column(DateTime, nullable=False)
```

**Fragrance-specific product fields (new vs. the couture version):**
- `fragrance_notes` (JSON: top/middle/base notes)
- `concentration` (VARCHAR: EDT / EDP / Parfum / Attar / Oil)
- `gender` (VARCHAR: Men / Women / Unisex)
- `longevity_rating`, `sillage_rating` (optional, VARCHAR or small int)
- `ingredients_text` (Text, for allergen/ingredient disclosure)

### 0.3 Migration Validation Script

**`backend/scripts/migrate_from_laravel.py`**
- Connects to `inspired_by_nature_v2` database
- For each SQLAlchemy model: queries `information_schema.columns` and compares against model definition
- Reports mismatches: missing columns, type differences, FK issues
- Does NOT alter the database — read-only validation
- Must pass 100% before any API development begins

---

## Phase 1: Backend Foundation (FastAPI) — ~5 hours

### 1.1 Project Scaffolding

| File | Purpose |
|---|---|
| `backend/app/main.py` | FastAPI app with global middleware (security headers, CORS with explicit allowlist, request tracing) |
| `backend/app/config.py` | Pydantic Settings loading from `.env` (server-side only) |
| `backend/app/database.py` | SQLAlchemy async engine + AsyncSession factory |
| `backend/app/redis_client.py` | `aioredis` connection pool for sessions/caching |
| `backend/requirements.txt` | See below |
| `backend/.env.example` | Placeholder values only, never real credentials |
| `backend/Dockerfile` | Python 3.12 slim |

**`requirements.txt`:**
```
fastapi==0.115.0
uvicorn[standard]==0.30.0
sqlalchemy[asyncio]==2.0.31
asyncpg==0.29.0
redis==5.0.7
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.9
pillow==10.4.0
pydantic-settings==2.3.4
alembic==1.13.2
slowapi==0.1.9
```

### 1.2 Auth System

| File | Details |
|---|---|
| `backend/app/utils/auth.py` | Password hashing (passlib+bcrypt, compatible with Laravel's `Hash::make`), JWT creation/validation (python-jose, HS256), Access token (15min) + Refresh token (7 days) |
| `backend/app/middleware/auth.py` | `get_current_user` dependency (runs BEFORE handler), `require_admin` dependency (returns 403 for non-admin), Unauthenticated → 401, Unauthorized → 403 |
| `backend/app/routers/auth.py` | `POST /api/auth/login` (rate limited: 5/min/IP), `POST /api/auth/register` (rate limited), `POST /api/auth/refresh` (rate limited), `POST /api/auth/logout` (revoke refresh token) |

### 1.3 Core API Routes

**Priority Tier 1 — Customer-blocking (must ship):**

| Router | Endpoints |
|---|---|
| `routers/products.py` | GET list (pagination, filter by category/collection/notes/concentration, search, sort), GET single, POST/PUT/DELETE (admin) |
| `routers/categories.py` | CRUD + SEO fields |
| `routers/subcategories.py` | CRUD with parent FK (scent families) |
| `routers/collections.py` | CRUD + pivot table management |
| `routers/orders.py` | Create (guest + auth), list, update status, fulfillment tracking |
| `routers/cart.py` | Add/remove/update/clear (session-based for guests, user-based for auth) |
| `routers/users.py` | Profile, admin user management |
| `routers/stores.py` | Theme settings CRUD (JSON column read/write) |
| `routers/media.py` | Image upload (magic byte validation, UUID rename, size limit), list, delete |
| `routers/reviews.py` | Submit (guest allowed), list by product |
| `routers/coupons.py` | Validate code, calculate discount, CRUD (admin) |
| `routers/tax.py` | CRUD |

**Priority Tier 2 — SEO/Discovery (must ship, NOT shells):**

| Router | Endpoints |
|---|---|
| `routers/nav.py` | Navigation items CRUD (header/footer menus) |
| `routers/pages.py` | CMS pages CRUD (About, FAQ, Ingredients/Allergen Info, etc.) |
| `routers/admin_dashboard.py` | Stats, analytics, CSV export/import |

**Priority Tier 3 — Can genuinely wait (shell pages OK initially):**
- `routers/staff.py` — Staff management (placeholder)
- `routers/marketing.py` — Campaign management (placeholder)
- `routers/facebook.py` — Meta/Facebook Ads integration (placeholder)
- `routers/notifications.py` — Simple CRUD (placeholder)

### 1.4 Input Validation & Security
- ALL user input validated server-side via Pydantic schemas
- ALL database queries via SQLAlchemy ORM (parameterized, no raw SQL concatenation)
- File uploads: magic byte validation (not filename extension), UUID rename
- Error responses: generic messages only (`{"error": "Something went wrong"}`)
- Full error details → server-side logs only

---

## Phase 2: Next.js Frontend — ~7 hours

### 2.1 Project Setup

| File | Purpose |
|---|---|
| `frontend/` | Next.js 14 with App Router (`npx -y create-next-app@latest ./`) |
| `frontend/src/lib/api.ts` | Fetch wrapper with JWT interceptor (same logic as current Axios interceptor) |
| `frontend/src/lib/auth.ts` | Token storage, refresh logic, auth context |
| `frontend/src/styles/globals.css` | Port current design system (colors, typography, animations) |
| Google Fonts | Inter (body), Playfair Display (headings) — Playfair pairs well with botanical/nature-inspired brand |
| Tailwind CSS | 3.4 (matching current setup) |

### 2.2 Customer Pages (SSR for SEO)

| Page | Rendering | Notes |
|---|---|---|
| `/` Landing | SSR | Banner slideshow (desktop/mobile images, overlay opacity, clickable links) |
| `/shop` | SSR | Filters (scent family, concentration, gender, price), sort, pagination |
| `/shop/[category]` | SSR | Category-filtered with `generateMetadata` for SEO |
| `/product/[id]` | SSR | Full product detail (notes pyramid, concentration, size options), `generateMetadata` |
| `/cart` | Client | Cart state from localStorage/Redis |
| `/checkout` | Client | Address form, coupon validation, order placement |
| `/search` | SSR | Search results with query params |
| `/login`, `/register` | Client | Auth forms |
| `/order-confirmation` | Client | Post-checkout |
| `/user-profile` | Client (auth) | Profile management |
| `/order-history` | Client (auth) | Order list |
| `/wishlist` | Client | localStorage-based |
| `/about`, `/faqs`, `/contact`, `/shipping-returns`, `/fragrance-guide`, `/ingredients` | SSR | Static content from CMS — fragrance-guide covers EDT vs EDP, layering tips; ingredients page covers allergen disclosures |

### 2.3 Admin Panel (Client-Side, Auth-Gated)

All admin pages are client-side rendered with `"use client"` and auth guard middleware.

**Tier 1 — Must be fully functional:**
- Dashboard (stats cards, recent orders, low stock alerts, top sellers)
- Products (list, add/edit with image upload, variants — bottle size/concentration, notes pyramid, SEO fields)
- Orders (list, status updates, fulfillment, tracking)
- Categories / Subcategories / Collections (CRUD)
- Customers (list, search)
- Theme Editor (banner slideshow with desktop/mobile settings, overlay opacity sliders, collection tabs)
- Store Settings (name, email, phone, shipping fee, currency)
- Discounts / Coupons (CRUD — NOT a shell)
- SEO Preferences (meta tags, pixel IDs — NOT a shell)

**Tier 2 — Fully functional but simpler:**
- Inventory management (per-bottle-size stock, not just per-product)
- Media library
- Tax settings
- CMS Pages
- Navigation editor

**Tier 3 — Shell pages (functional later):**
- Staff management
- Marketing campaigns
- Facebook Ads integration
- App marketplace
- Notifications

### 2.4 Core Components (ported from current)

| Component | Description |
|---|---|
| `Banner.tsx` | Slideshow with `<picture>` responsive images, dual overlays, conditional buttons, full-slide clickable links |
| `Header.tsx` | Announcement bar, logo, mega menu, search, cart count, account dropdown |
| `Footer.tsx` | Navigation links, newsletter, social media, payment icons |
| `ProductCard.tsx` | Image, title, concentration/size, price, compare price, wishlist toggle, quick add |
| `ProductGrid.tsx` | Responsive grid with view toggle |
| `NotesPyramid.tsx` | Top/middle/base fragrance notes visual (new component) |
| `CartDrawer.tsx` | Slide-out cart |
| `SearchModal.tsx` | Live search with instant results |
| `ConfirmModal.tsx` | Delete/action confirmation |
| `AdminSidebar.tsx` | Collapsible admin navigation |

---

## Phase 3: Staging Environment & QA

### 3.1 Staging Deployment

**`nginx/staging.conf`:**
```nginx
server {
    server_name beta.inspiredbynature.com;

    location /api/ {
        proxy_pass http://127.0.0.1:8000;  # FastAPI
    }
    location / {
        proxy_pass http://127.0.0.1:3000;  # Next.js
    }
}
```

- DNS: Add A record for `beta.inspiredbynature.com` → `<VPS IP>`
- SSL: Let's Encrypt cert for staging subdomain
- Database: Points to `inspired_by_nature_v2` (copy, not live)
- Current Laravel+Vite stack: completely untouched, still serving `inspiredbynature.com`

### 3.2 QA Checklist

- [ ] Browse products (home, shop, category, search)
- [ ] Product detail page (images, notes pyramid, size/concentration variants, add to cart)
- [ ] Cart (add, remove, update quantity)
- [ ] Guest checkout (address, coupon, place order)
- [ ] Auth checkout (login, place order)
- [ ] Order history (list, detail)
- [ ] Wishlist (add, remove)
- [ ] Admin login
- [ ] Admin dashboard (stats load correctly)
- [ ] Admin product CRUD (add, edit, delete, image upload)
- [ ] Admin category/collection CRUD
- [ ] Admin order management (status update, fulfillment)
- [ ] Admin theme editor (banner settings persist and render)
- [ ] Admin coupon/discount CRUD
- [ ] Admin SEO settings
- [ ] Mobile responsive (all pages)
- [ ] SSR/SEO (view-source shows content for product/category pages)

---

## Phase 4: EasyPaisa Payment Integration

> IMPORTANT: Payment integration is its own phase, deployed to staging first. No live payments until everything else is verified working.

### 4.1 Sandbox Integration

| File | Purpose |
|---|---|
| `backend/app/services/easypay.py` | Generate payment request (order ID, amount, callback URL), redirect to EasyPaisa hosted checkout, handle return URL |
| `backend/app/routers/payments.py` | `POST /api/payments/easypay/initiate`, `POST /api/payments/easypay/webhook`, `GET /api/payments/easypay/return` |

### 4.2 Webhook Reliability (Idempotency)

```python
async def handle_easypay_webhook(payload):
    # 1. Verify signature/hash from EasyPaisa
    # 2. Extract transaction_id from payload
    # 3. Check: has this transaction_id already been processed?
    existing = await db.execute(
        select(Payment).where(Payment.transaction_id == transaction_id)
    )
    if existing.scalar():
        return {"status": "already_processed"}  # Idempotent response

    # 4. Only now: update order status + create payment record
    # 5. Use database transaction to ensure atomicity
```

### 4.3 Payment Testing
- Full sandbox flow: create order → redirect → simulate payment → webhook → verify order status
- Test duplicate webhook delivery → verify idempotency
- Test failed payments → verify order stays in "pending"
- Test timeout/network errors → verify graceful degradation

---

## Phase 5: Production Cutover

### 5.1 Pre-Cutover Checklist

- [ ] All QA items from Phase 3.2 pass on staging
- [ ] EasyPaisa sandbox payments verified
- [ ] Performance: page load under 3s
- [ ] SSL certificate ready for main domain
- [ ] Database fully synced (or fresh copy from live)

### 5.2 Cutover Process

1. Final `pg_dump` of live `inspired_by_nature` → restore as `inspired_by_nature_v2`
2. Point FastAPI backend to `inspired_by_nature_v2`
3. Switch Nginx config: `inspiredbynature.com` → new Next.js + FastAPI stack
4. Verify live site works
5. **DO NOT stop Laravel containers yet**

### 5.3 Rollback Plan

> CAUTION: Current Laravel + Vite containers stay running and untouched until new stack is verified stable for at least 3 days.

**Instant rollback (< 30 seconds):**
```bash
cp /etc/nginx/sites-enabled/rollback.conf /etc/nginx/sites-enabled/inspiredbynature.conf
nginx -s reload
```

**Files:**
- `nginx/rollback.conf` — Pre-written config pointing back to Laravel containers
- `nginx/production.conf` — New stack config

**Rollback triggers:**
- Any 500 errors on critical paths (checkout, order placement)
- Payment processing failures
- Admin panel inaccessible
- Database corruption indicators

### 5.4 Post-Cutover Monitoring (3 days)

- **Day 1:** Monitor error logs every 2 hours
- **Day 2:** Verify all admin operations working
- **Day 3:** If stable, stop Laravel containers and clean up
- **Only after Day 3:** Remove old containers and mark migration complete

---

## Feature Priority Matrix

| Feature | Priority | Phase | Status at Launch |
|---|---|---|---|
| Product catalog (browse, search, filter by scent/concentration) | P0 | 2 | Fully functional |
| Cart & Checkout | P0 | 2 | Fully functional |
| Order management (admin) | P0 | 2 | Fully functional |
| Product CRUD (admin) | P0 | 2 | Fully functional |
| Auth (login, register, JWT refresh) | P0 | 1 | Fully functional |
| Theme editor (banners, mobile/desktop) | P0 | 2 | Fully functional |
| Category/Collection CRUD | P0 | 2 | Fully functional |
| Coupons/Discounts | P0 | 2 | Fully functional (NOT shell) |
| SEO settings & meta tags | P0 | 2 | Fully functional (NOT shell) |
| SSR product/category pages | P0 | 2 | Fully functional |
| Notes pyramid / fragrance details | P0 | 2 | Fully functional |
| Customer list (admin) | P1 | 2 | Fully functional |
| Inventory management (per size/concentration) | P1 | 2 | Fully functional |
| CMS pages (about, FAQ, ingredients, etc.) | P1 | 2 | Fully functional |
| Navigation editor | P1 | 2 | Fully functional |
| Media library | P1 | 2 | Fully functional |
| Tax settings | P1 | 2 | Fully functional |
| EasyPaisa payment | P1 | 4 | Sandbox verified |
| Analytics dashboard | P2 | 2 | Functional |
| Staff management | P3 | Post-launch | Shell page |
| Marketing campaigns | P3 | Post-launch | Shell page |
| Facebook Ads integration | P3 | Post-launch | Shell page |
| App marketplace | P3 | Post-launch | Shell page |
| Notification center | P3 | Post-launch | Shell page |

---

## Open Questions

1. **EasyPaisa Credentials:** Do you have a merchant account or sandbox credentials? (Merchant ID, Store ID, Hashkey). If not yet, I'll build the integration interface and we'll plug in credentials when ready.
2. **Project Directory:** Confirm where the new project should live on disk (e.g. a fresh `inspired-by-nature-v2/` folder). The current store folder stays completely untouched as reference + rollback.
3. **DNS for Staging:** Can you add an A record for `beta.inspiredbynature.com` → your VPS IP? Or should staging use a different approach (e.g. port-based like `:3000`)?
4. **Domain/DB naming:** Confirm the real domain and preferred database name — `inspiredbynature.com` / `inspired_by_nature` used above are placeholders.
5. **Fragrance-specific data:** Confirm whether notes pyramid, concentration, and allergen/ingredient fields already exist somewhere in the current Laravel schema, or need to be added fresh in v2.

---

## Verification Plan

**Automated Tests:**
- `pytest` for all FastAPI endpoints (auth, products, orders, cart, coupons)
- `npm run build` for Next.js (catches TypeScript errors)
- Migration validation script against DB copy

**Manual Verification:**
- Full customer journey: browse → add to cart → checkout → confirm
- Admin journey: login → add product → edit theme → manage orders
- Mobile responsive testing
- SEO verification: view-source on product pages shows rendered HTML
- Rollback drill: switch Nginx back to Laravel, verify old site works
