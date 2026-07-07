# Subscription Management System

A centralized web application to manage subscription-based products, recurring billing plans, customers, quotations, invoices, taxes, discounts, payments, and reports. Built for SaaS and other recurring-revenue businesses.

## Tech Stack (PERN)
- **PostgreSQL** — database (raw SQL, no ORM, managed via pgAdmin)
- **Express.js** — backend REST API
- **React (Vite)** — frontend SPA
- **Node.js** — runtime

## Project Structure
subscription-management/
├── backend/
│   ├── config/       # DB connection, env config
│   ├── controllers/  # Route handler logic
│   ├── db/           # SQL schema/migration files
│   ├── middleware/   # Auth, role-based access, validation
│   ├── models/       # Raw SQL query functions
│   ├── routes/       # Express route definitions
│   ├── utils/        # Helper functions
│   └── index.js      # App entry point
└── frontend/
└── (Vite + React app)

## User Roles
- **Admin** — Full system control and configuration
- **Internal User** — Limited operational access
- **Portal/User** — Customer/subscriber access

> Rule: Only Admin can create Internal Users.

## Modules
- Authentication (Login, Signup, Reset Password)
- Dashboard & Navigation
- Products Management
- Recurring Plans
- Subscriptions
- Quotation Templates
- Invoices
- Payments
- Discount Management
- Tax Management
- Users/Contacts
- Reports

## Status
🚧 In development — project scaffolding phase.

## Setup (WIP)
Setup instructions will be added as the backend and frontend are built out.
'@ | Set-Content -Path README.md -Encoding utf8
