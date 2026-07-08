@'
# Subscription Management System

A centralized web application to manage subscription-based products, recurring billing plans, customers, quotations, invoices, taxes, discounts, payments, and reports. Built for SaaS and other recurring-revenue businesses.

## Tech Stack (PERN)
- **PostgreSQL** — database (raw SQL via the `pg` driver, no ORM — managed through pgAdmin)
- **Express.js** — backend REST API (ESM, JWT auth, role-based access control)
- **React (Vite)** — frontend SPA, styled with Tailwind CSS v4
- **Node.js** — runtime

## Project Structure
subscription-management/
├── backend/
│   ├── config/       # DB pool connection (db.js)
│   ├── controllers/  # Route handler logic per module
│   ├── db/
│   │   ├── schema/   # SQL migration files (run manually via pgAdmin Query Tool)
│   │   └── seed/     # Admin seed script
│   ├── middleware/   # JWT auth, role authorization, request validators
│   ├── models/       # Raw SQL query functions per module
│   ├── routes/       # Express route definitions per module
│   ├── .env           # Environment variables (not committed)
│   └── index.js       # App entry point
└── frontend/
└── src/
├── components/  # Reusable UI (Modal, ProtectedRoute)
├── context/      # AuthContext (global user/token state)
├── layouts/      # MainLayout (sidebar + topbar shell)
├── pages/        # One page per module
└── services/     # Axios API client

## User Roles
- **Admin** — Full system control and configuration
- **Internal User** — Limited operational access
- **Portal/User** — Customer/subscriber access

> Rule: Only Admin can create Internal Users. Public signup always creates a Portal User.
> Rule: Only Admin can create Discounts.

## Modules Implemented
- Authentication (Login, Signup, Reset Password, JWT-based sessions)
- Dashboard (live stats: active subscriptions, revenue, outstanding, overdue)
- Products Management (+ variants)
- Recurring Plans
- Subscriptions (order lines, status flow: Draft → Quotation → Confirmed → Active → Closed)
- Quotation Templates (with product lines)
- Invoices (auto-generated from subscriptions, status flow: Draft → Confirmed → Paid, Cancel, Print)
- Payments (partial payments, outstanding balance tracking, auto-marks invoice Paid)
- Discount Management (Admin-only, product/subscription scoped)
- Tax Management
- Users/Contacts (Admin creates Internal Users)
- Reports (subscriptions by status, revenue by date range, payments by method, overdue invoices)

## Prerequisites
- Node.js 18+ (20 or 22 LTS recommended)
- PostgreSQL (with pgAdmin for database management)
- A REST client for testing (this project was built/tested with Thunder Client)

## Setup

### 1. Clone and install dependencies

```powershell
cd backend
npm install

cd ..\frontend
npm install
```

### 2. Create the database
In pgAdmin: right-click **Databases** → **Create** → **Database** → name it `subscription_management`.

### 3. Run the SQL schema files
Open pgAdmin's Query Tool on `subscription_management`, and run each file in `backend/db/schema/` **in order**:
01_users.sql
02_products.sql
03_subscriptions.sql
04_quotation_templates.sql
05_invoices.sql
06_payments.sql
07_discounts_taxes.sql

### 4. Configure environment variables
Create `backend/.env`:
PORT=5000
NODE_ENV=development
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=subscription_management
JWT_SECRET=replace_this_with_a_long_random_string
JWT_EXPIRES_IN=7d

### 5. Seed the first Admin account

```powershell
cd backend
npm run seed:admin
```

Default seeded credentials: `admin@example.com` / `Admin@1234` — **change this password after first login in a real deployment.**

### 6. Run both servers (in separate terminals)

```powershell
# Terminal 1 — backend
cd backend
npm run dev
```

```powershell
# Terminal 2 — frontend
cd frontend
npm run dev
```

Backend runs at `http://localhost:5000`, frontend at `http://localhost:5173`.

## API Overview
All endpoints are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

| Module | Base Route |
|---|---|
| Auth | `/api/auth` |
| Admin (Internal Users) | `/api/admin` |
| Products | `/api/products` |
| Recurring Plans | `/api/plans` |
| Subscriptions | `/api/subscriptions` |
| Quotation Templates | `/api/quotation-templates` |
| Invoices | `/api/invoices` |
| Payments | `/api/payments` |
| Discounts | `/api/discounts` |
| Taxes | `/api/taxes` |
| Reports | `/api/reports` |

## Status
✅ Backend complete — all modules implemented with raw SQL, JWT auth, and role-based access control.
✅ Frontend complete — all modules have a working UI.

## Notes
- Password reset and invoice "Send" currently log to console instead of sending real emails — swap in Nodemailer/SendGrid for production.
- The "Print" invoice action currently opens the raw JSON API response; a styled print view is a good next enhancement.
