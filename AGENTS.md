<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# ASFixit SIM Portal

## Project Overview

A B2B SIM card distribution portal built with Next.js. ASFixit procures SIM cards from telecom operators, registers them, distributes to registered vendors (Pasals), tracks SIM activation outcomes, and manages vendor commission and fine balances.

## Tech Stack

- Framework: Next.js (App Router)
- Styling: Tailwind CSS
- UI Components: shadcn/ui
- Auth: (JWT) or free auth
- Database: PostgreSQL
- ORM: Prisma
- File Storage: local(same for vps)

## App Structure

/app/admin/_ → Admin portal (email + password login)
/app/vendor/_ → Vendor portal (phone number + password login)
/app/api/\* → API routes

## Two Separate Portals

- Admin login: email and password
- Vendor login: phone number and password
- Middleware protects all routes — vendors cannot access /admin, admins cannot access /vendor

## Database Models (core)

- Operator (telecom company)
- SIM (number, status, operator, assigned vendor, order)
- Vendor / Pasal (profile, KYC status, contract, commission rate, fine rate, balance)
- Order (vendor, operator, quantity, SIM range, payment method, status)
- BalanceLedger (vendor, type, amount, note, timestamp)
- User (admin users with roles: superadmin, manager, support)
- KYCDocument (vendor, document type, file url, status)
- Contract (version, file url, active)

## SIM Status Flow

active → assigned → approved / rejected

## Order Status Flow

pending → assigned → dispatched → delivered

## Key Business Rules

- Vendor cannot order if balance is negative
- Commission credited only when SIM marked approved
- Fine deducted immediately when SIM marked rejected
- SIM numbers assigned by admin after order placed, vendors order quantity only
- Contract download and signed upload are mandatory in vendor registration
- Every balance adjustment by admin requires a written note
- All records tagged with operator for future multi-operator support

## Coding Conventions

- Use App Router (not Pages Router)
- Server components by default, client components only when needed
- All API routes in /app/api/
- Prisma client imported from /lib/prisma.ts
- Use TypeScript throughout
- Tailwind for all styling
- shadcn/ui for UI components
  asfixit-sim/
  ├── prisma/
  │ ├── schema.prisma # All database models
  │ └── migrations/ # Auto-generated migrations
  │
  ├── public/
  │ └── assets/ # Static images, icons
  │
  ├── src/
  │ ├── app/
  │ │ ├── (auth)/
  │ │ │ ├── admin/
  │ │ │ │ └── login/
  │ │ │ │ └── page.tsx
  │ │ │ └── vendor/
  │ │ │ └── login/
  │ │ │ └── page.tsx
  │ │ │
  │ │ ├── admin/
  │ │ │ ├── layout.tsx # Admin layout with dark sidebar
  │ │ │ ├── page.tsx # Dashboard
  │ │ │ ├── sims/
  │ │ │ │ └── page.tsx # SIM inventory management
  │ │ │ ├── orders/
  │ │ │ │ ├── page.tsx # Order list
  │ │ │ │ └── [id]/
  │ │ │ │ └── page.tsx # Single order detail + assign SIMs
  │ │ │ ├── approval/
  │ │ │ │ └── page.tsx # SIM approval / rejection processing
  │ │ │ ├── vendors/
  │ │ │ │ ├── page.tsx # Vendor list
  │ │ │ │ └── [id]/
  │ │ │ │ └── page.tsx # Vendor detail + balance + settings
  │ │ │ ├── kyc/
  │ │ │ │ ├── page.tsx # KYC submissions list
  │ │ │ │ └── [id]/
  │ │ │ │ └── page.tsx # Review single KYC
  │ │ │ ├── commissions/
  │ │ │ │ └── page.tsx # Commission overview all vendors
  │ │ │ ├── payment-methods/
  │ │ │ │ └── page.tsx # Manage payment methods
  │ │ │ ├── operators/
  │ │ │ │ └── page.tsx # Operator management
  │ │ │ ├── contracts/
  │ │ │ │ └── page.tsx # Upload and manage contract versions
  │ │ │ ├── users/
  │ │ │ │ └── page.tsx # Admin user management
  │ │ │ └── roles/
  │ │ │ └── page.tsx # Roles and permissions
  │ │ │
  │ │ ├── vendor/
  │ │ │ ├── layout.tsx # Vendor layout
  │ │ │ ├── page.tsx # Vendor dashboard
  │ │ │ ├── orders/
  │ │ │ │ ├── page.tsx # Order history
  │ │ │ │ └── new/
  │ │ │ │ └── page.tsx # Place new order
  │ │ │ ├── sims/
  │ │ │ │ └── page.tsx # My SIMs with status
  │ │ │ ├── balance/
  │ │ │ │ └── page.tsx # Balance ledger
  │ │ │ └── profile/
  │ │ │ └── page.tsx # Vendor profile and settings
  │ │ │
  │ │ ├── api/
  │ │ │ ├── auth/
  │ │ │ │ ├── admin/
  │ │ │ │ │ └── route.ts # Admin login endpoint
  │ │ │ │ └── vendor/
  │ │ │ │ └── route.ts # Vendor login endpoint
  │ │ │ ├── sims/
  │ │ │ │ ├── route.ts # GET list, POST add single
  │ │ │ │ ├── bulk/
  │ │ │ │ │ └── route.ts # POST bulk range entry
  │ │ │ │ └── [id]/
  │ │ │ │ └── route.ts # GET, PATCH, DELETE single SIM
  │ │ │ ├── orders/
  │ │ │ │ ├── route.ts # GET list, POST create order
  │ │ │ │ └── [id]/
  │ │ │ │ ├── route.ts # GET, PATCH single order
  │ │ │ │ └── assign/
  │ │ │ │ └── route.ts # POST assign SIM range to order
  │ │ │ ├── vendors/
  │ │ │ │ ├── route.ts # GET list, POST create vendor
  │ │ │ │ └── [id]/
  │ │ │ │ ├── route.ts # GET, PATCH, DELETE vendor
  │ │ │ │ ├── balance/
  │ │ │ │ │ └── route.ts # GET ledger, POST manual adjustment
  │ │ │ │ └── settings/
  │ │ │ │ └── route.ts # PATCH commission and fine rates
  │ │ │ ├── kyc/
  │ │ │ │ ├── route.ts # GET all submissions
  │ │ │ │ └── [id]/
  │ │ │ │ └── route.ts # PATCH approve or reject
  │ │ │ ├── approval/
  │ │ │ │ └── route.ts # POST process SIM approval/rejection
  │ │ │ ├── operators/
  │ │ │ │ ├── route.ts # GET list, POST create
  │ │ │ │ └── [id]/
  │ │ │ │ └── route.ts # PATCH, DELETE
  │ │ │ ├── contracts/
  │ │ │ │ ├── route.ts # GET active contract, POST upload new
  │ │ │ │ └── [id]/
  │ │ │ │ └── route.ts # PATCH, DELETE
  │ │ │ ├── payment-methods/
  │ │ │ │ ├── route.ts
  │ │ │ │ └── [id]/
  │ │ │ │ └── route.ts
  │ │ │ └── upload/
  │ │ │ └── route.ts # File upload handler (KYC docs, contracts)
  │ │ │
  │ │ ├── layout.tsx # Root layout
  │ │ └── globals.css
  │ │
  │ ├── components/
  │ │ ├── admin/
  │ │ │ ├── sidebar.tsx # Admin sidebar navigation
  │ │ │ ├── header.tsx
  │ │ │ ├── sims/
  │ │ │ │ ├── sim-table.tsx
  │ │ │ │ ├── add-sim-form.tsx
  │ │ │ │ └── bulk-range-form.tsx
  │ │ │ ├── orders/
  │ │ │ │ ├── order-table.tsx
  │ │ │ │ ├── order-detail.tsx
  │ │ │ │ └── assign-sim-modal.tsx
  │ │ │ ├── vendors/
  │ │ │ │ ├── vendor-table.tsx
  │ │ │ │ ├── vendor-detail.tsx
  │ │ │ │ └── balance-ledger.tsx
  │ │ │ ├── kyc/
  │ │ │ │ ├── kyc-table.tsx
  │ │ │ │ └── kyc-review-modal.tsx
  │ │ │ └── approval/
  │ │ │ └── approval-form.tsx
  │ │ │
  │ │ ├── vendor/
  │ │ │ ├── sidebar.tsx # Vendor sidebar navigation
  │ │ │ ├── header.tsx
  │ │ │ ├── order-form.tsx
  │ │ │ ├── sim-list.tsx
  │ │ │ └── balance-table.tsx
  │ │ │
  │ │ └── ui/ # shadcn/ui components live here
  │ │ ├── button.tsx
  │ │ ├── input.tsx
  │ │ ├── table.tsx
  │ │ ├── modal.tsx
  │ │ ├── badge.tsx
  │ │ └── ...
  │ │
  │ ├── lib/
  │ │ ├── prisma.ts # Prisma client instance
  │ │ ├── auth.ts # Auth helpers, session utils
  │ │ ├── upload.ts # File upload helper (S3/R2)
  │ │ └── utils.ts # General utility functions
  │ │
  │ ├── middleware.ts # Route protection for /admin and /vendor
  │ │
  │ └── types/
  │ └── index.ts # Shared TypeScript types
  │
  ├── AGENTS.md # Codex instructions
  ├── .env # Environment variables
  ├── .env.example # Env template to commit
  ├── next.config.ts
  ├── tailwind.config.ts
  ├── tsconfig.json
  └── package.json
