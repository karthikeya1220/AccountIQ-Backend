# AccountIQ Backend - Visual Flow Diagrams

This document contains visual representations of the system architecture, request flows, and key processes.

## Table of Contents
1. [System Architecture Overview](#system-architecture-overview)
2. [Request Flow Diagrams](#request-flow-diagrams)
3. [Authentication Flow](#authentication-flow)
4. [RBAC Permission Flow](#rbac-permission-flow)
5. [Database Relationship Diagram](#database-relationship-diagram)
6. [Service Layer Interactions](#service-layer-interactions)
7. [File Upload Process](#file-upload-process)
8. [Dashboard Data Aggregation](#dashboard-data-aggregation)

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Client Applications                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   Web App    │  │  Mobile App  │  │  Desktop App │            │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            │
└─────────┼──────────────────┼──────────────────┼────────────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
                    HTTP/REST API (JSON)
                             │
┌────────────────────────────▼─────────────────────────────────────────┐
│                      API Gateway / Load Balancer                      │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────────┐
│                        Express.js Server                              │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Security Layer                                               │   │
│  │  • Helmet (Security Headers)                                  │   │
│  │  • CORS Configuration                                         │   │
│  │  • Rate Limiting                                              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Middleware Pipeline                                          │   │
│  │  • Body Parser                                                │   │
│  │  • Session Management                                         │   │
│  │  • Logging (Pino)                                            │   │
│  │  • Authentication (JWT)                                       │   │
│  │  • Authorization (RBAC)                                       │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Routes Layer                                                 │   │
│  │  /auth  /bills  /cards  /salary  /dashboard  /budgets etc.   │   │
│  └───────────────────────┬──────────────────────────────────────┘   │
│                          │                                           │
│  ┌───────────────────────▼──────────────────────────────────────┐   │
│  │  Services Layer (Business Logic)                             │   │
│  │  • BillsService                                              │   │
│  │  • CardsService                                              │   │
│  │  • SalaryService                                             │   │
│  │  • DashboardService                                          │   │
│  │  • BudgetsService                                            │   │
│  │  • EmployeesService                                          │   │
│  └───────────────────────┬──────────────────────────────────────┘   │
└────────────────────────────┼─────────────────────────────────────────┘
                             │
         ┌───────────────────┴───────────────────┐
         │                                       │
┌────────▼─────────┐                   ┌────────▼─────────┐
│    Supabase      │                   │  Supabase        │
│    PostgreSQL    │                   │  Storage         │
│    Database      │                   │  (S3-like)       │
│                  │                   │                  │
│  • users         │                   │  • bills/        │
│  • bills         │                   │  • receipts/     │
│  • cards         │                   │  • documents/    │
│  • employees     │                   │  • exports/      │
│  • salary        │                   │                  │
│  • budgets       │                   │                  │
│  • categories    │                   │                  │
└──────────────────┘                   └──────────────────┘
```

---

## Request Flow Diagrams

### 1. Complete Request Lifecycle

```
┌────────┐
│ Client │
└───┬────┘
    │
    │ ① POST /api/bills
    │    Authorization: Bearer <JWT>
    │    { vendor, amount, ... }
    │
┌───▼────────────────────────────────────────────────┐
│ Express Server - Middleware Chain                  │
│                                                     │
│  ┌──────────────────────────────────────────────┐ │
│  │ ② Global Middleware                          │ │
│  │    ✓ helmet() - Security headers             │ │
│  │    ✓ cors() - Cross-origin checks            │ │
│  │    ✓ express.json() - Parse body             │ │
│  │    ✓ pinoHttp() - Log request                │ │
│  └────────────────┬─────────────────────────────┘ │
│                   │                                │
│  ┌────────────────▼─────────────────────────────┐ │
│  │ ③ Route Matching                             │ │
│  │    router.post('/api/bills', ...)            │ │
│  └────────────────┬─────────────────────────────┘ │
│                   │                                │
│  ┌────────────────▼─────────────────────────────┐ │
│  │ ④ authenticate() Middleware                  │ │
│  │    • Extract JWT from header                 │ │
│  │    • Verify with Supabase Auth               │ │
│  │    • Load user data from DB                  │ │
│  │    • Attach req.user = {id, email, role}     │ │
│  │    • Continue or return 401                  │ │
│  └────────────────┬─────────────────────────────┘ │
│                   │                                │
│  ┌────────────────▼─────────────────────────────┐ │
│  │ ⑤ authorize() / RBAC Middleware              │ │
│  │    • Check user role (admin/user)            │ │
│  │    • Validate resource permissions           │ │
│  │    • Check field-level permissions           │ │
│  │    • Continue or return 403                  │ │
│  └────────────────┬─────────────────────────────┘ │
│                   │                                │
│  ┌────────────────▼─────────────────────────────┐ │
│  │ ⑥ Validation Middleware (Zod)                │ │
│  │    • Validate request body schema            │ │
│  │    • Type checking                           │ │
│  │    • Required fields check                   │ │
│  │    • Continue or return 400                  │ │
│  └────────────────┬─────────────────────────────┘ │
│                   │                                │
│  ┌────────────────▼─────────────────────────────┐ │
│  │ ⑦ Route Handler                              │ │
│  │    asyncHandler(async (req, res) => {...})   │ │
│  └────────────────┬─────────────────────────────┘ │
└───────────────────┼────────────────────────────────┘
                    │
┌───────────────────▼────────────────────────────────┐
│ ⑧ Service Layer - Business Logic                  │
│                                                     │
│  BillsService.createBill(data, userId)             │
│    • Validate business rules                       │
│    • Transform data                                │
│    • Call database operations                      │
│    • Handle side effects (card balance, cache)     │
│    • Return result or throw error                  │
└───────────────────┬────────────────────────────────┘
                    │
┌───────────────────▼────────────────────────────────┐
│ ⑨ Database Layer - Supabase Client                │
│                                                     │
│  supabaseAdmin.from('bills').insert(...)           │
│    • Execute SQL query                             │
│    • Handle constraints                            │
│    • Return data or error                          │
└───────────────────┬────────────────────────────────┘
                    │
┌───────────────────▼────────────────────────────────┐
│ ⑩ Response Formation                               │
│                                                     │
│  res.status(201).json(bill)                        │
│    • Format response                               │
│    • Add metadata                                  │
│    • Set status code                               │
│    • Send JSON                                     │
└───────────────────┬────────────────────────────────┘
                    │
                    │ Response
                    │ { id, vendor, amount, ... }
                    │
                ┌───▼────┐
                │ Client │
                └────────┘
```

---

## Authentication Flow

### Login Process

```
┌──────────┐                                    ┌──────────────┐
│  Client  │                                    │   Backend    │
└────┬─────┘                                    └──────┬───────┘
     │                                                 │
     │ POST /api/auth/login                           │
     ├───────────────────────────────────────────────►│
     │ { email: "user@example.com",                   │
     │   password: "password123" }                    │
     │                                                 │
     │                                        ┌────────▼────────┐
     │                                        │ Validate Input  │
     │                                        │ • Email format  │
     │                                        │ • Password      │
     │                                        └────────┬────────┘
     │                                                 │
     │                                        ┌────────▼────────────┐
     │                                        │  Supabase Auth      │
     │                                        │  signInWithPassword │
     │                                        └────────┬────────────┘
     │                                                 │
     │                                        ┌────────▼────────┐
     │                                        │ Auth Successful?│
     │                                        └────────┬────────┘
     │                                                 │
     │                                        ┌────────▼────────────┐
     │                                        │ Query users table   │
     │                                        │ SELECT id, email,   │
     │                                        │   role, is_active   │
     │                                        │ WHERE email = ?     │
     │                                        └────────┬────────────┘
     │                                                 │
     │                                        ┌────────▼────────────┐
     │                                        │ User active?        │
     │                                        │ Role valid?         │
     │                                        └────────┬────────────┘
     │                                                 │
     │                                        ┌────────▼────────────┐
     │                                        │ Update last_login   │
     │                                        └────────┬────────────┘
     │                                                 │
     │ ◄───────────────────────────────────────────────┤
     │ { token: "eyJhbGc...",                          │
     │   refresh_token: "v1.abc...",                   │
     │   user: { id, email, role, ... } }              │
     │                                                 │
     │                                                 │
     │ Subsequent Authenticated Requests               │
     │ GET /api/bills                                  │
     │ Authorization: Bearer eyJhbGc...                │
     ├───────────────────────────────────────────────►│
     │                                                 │
     │                                        ┌────────▼────────────┐
     │                                        │ authenticate()      │
     │                                        │ • Extract token     │
     │                                        │ • Verify with       │
     │                                        │   Supabase Auth     │
     │                                        │ • Load user data    │
     │                                        └────────┬────────────┘
     │                                                 │
     │                                        ┌────────▼────────────┐
     │                                        │ Process Request     │
     │                                        │ with user context   │
     │                                        └────────┬────────────┘
     │                                                 │
     │ ◄───────────────────────────────────────────────┤
     │ Response with data                              │
```

### Token Verification Flow

```
┌─────────────────┐
│ Request arrives │
│ with JWT token  │
└────────┬────────┘
         │
    ┌────▼──────────────────────────┐
    │ authenticate() Middleware     │
    └────┬──────────────────────────┘
         │
    ┌────▼──────────────────────────┐
    │ Extract Authorization header  │
    │ Format: "Bearer <token>"      │
    └────┬──────────────────────────┘
         │
    ┌────▼──────────────────────────┐
    │ Token present?                │
    └────┬──────────────────────────┘
         │
    ┌────▼──────────────────────────┐
    │ YES → Extract token           │
    │ NO  → Return 401 Unauthorized │
    └────┬──────────────────────────┘
         │
    ┌────▼───────────────────────────┐
    │ Verify token with Supabase     │
    │ supabaseAdmin.auth.getUser()   │
    └────┬───────────────────────────┘
         │
    ┌────▼──────────────────────────┐
    │ Token valid?                  │
    └────┬──────────────────────────┘
         │
    ┌────▼──────────────────────────┐
    │ YES → Continue                │
    │ NO  → Return 401 Invalid Token│
    └────┬──────────────────────────┘
         │
    ┌────▼───────────────────────────┐
    │ Query users table              │
    │ SELECT * FROM users            │
    │ WHERE id = token.user.id       │
    │   AND is_active = true         │
    └────┬───────────────────────────┘
         │
    ┌────▼──────────────────────────┐
    │ User found and active?        │
    └────┬──────────────────────────┘
         │
    ┌────▼──────────────────────────┐
    │ YES → Attach user to request  │
    │ req.user = {id, email, role}  │
    │ NO  → Return 401 User Inactive│
    └────┬──────────────────────────┘
         │
    ┌────▼──────────────────────────┐
    │ Continue to next middleware   │
    └───────────────────────────────┘
```

---

## RBAC Permission Flow

### Role-Based Access Control Process

```
┌─────────────────────────────────────────────────────────────┐
│ Authenticated Request with req.user = {id, email, role}     │
└─────────────────────┬───────────────────────────────────────┘
                      │
         ┌────────────▼────────────┐
         │ Check Resource Access   │
         │ (e.g., bills, cards)    │
         └────────────┬────────────┘
                      │
         ┌────────────▼─────────────────────────────────┐
         │ FIELD_PERMISSIONS[resource]                  │
         │ {                                            │
         │   admin: ['field1', 'field2', ...],          │
         │   user: ['field1']  // or []                 │
         │ }                                            │
         └────────────┬─────────────────────────────────┘
                      │
         ┌────────────▼────────────┐
         │ Get role permissions    │
         │ permissions[req.user.role]│
         └────────────┬────────────┘
                      │
         ┌────────────▼────────────┐
         │ Has any permissions?    │
         └────────────┬────────────┘
                      │
              ┌───────┴───────┐
              │               │
         ┌────▼─────┐   ┌────▼─────┐
         │   YES    │   │    NO    │
         │ Continue │   │ Return   │
         └────┬─────┘   │   403    │
              │         └──────────┘
              │
         ┌────▼────────────────────┐
         │ Validate specific fields│
         │ being edited            │
         └────┬────────────────────┘
              │
         ┌────▼────────────────────────────────────┐
         │ For each field in request body:         │
         │   if (field in allowedFields)           │
         │     → Allow                             │
         │   else                                  │
         │     → Deny                              │
         └────┬────────────────────────────────────┘
              │
         ┌────▼────────────────────┐
         │ All fields allowed?     │
         └────┬────────────────────┘
              │
      ┌───────┴───────┐
      │               │
 ┌────▼─────┐   ┌────▼─────────────┐
 │   YES    │   │       NO         │
 │ Continue │   │ Return 403 with  │
 │ to route │   │ denied fields    │
 │ handler  │   │ list             │
 └──────────┘   └──────────────────┘
```

### Field-Level Permission Example

```
Request: PUT /api/bills/123
Body: { amount: 1500, status: "paid", vendor: "ABC" }
User: { role: "user" }

┌──────────────────────────────────────────┐
│ FIELD_PERMISSIONS.bills                  │
│ {                                        │
│   admin: [                               │
│     'amount',      ✅                    │
│     'status',      ✅                    │
│     'vendor',      ✅                    │
│     ...all fields                        │
│   ],                                     │
│   user: []  ← No edit permissions        │
│ }                                        │
└──────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ Validation Result                        │
│ • allowed: false                         │
│ • deniedFields: ['amount','status',      │
│                  'vendor']               │
└──────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│ Response: 403 Forbidden                  │
│ {                                        │
│   "error": "Field edit access denied",   │
│   "deniedFields": [...],                 │
│   "allowedFields": []                    │
│ }                                        │
└──────────────────────────────────────────┘
```

---

## Database Relationship Diagram

```
┌─────────────────────┐
│       users         │
│ ─────────────────── │
│ PK: id (UUID)       │
│     email           │
│     role            │
│     is_active       │
│     created_at      │
└──────┬──────────────┘
       │
       │ created_by (FK)
       │
       ├──────────────────────────────────┐
       │                                  │
       │                                  │
┌──────▼────────────┐            ┌───────▼───────────┐
│       bills       │            │     salary        │
│ ───────────────── │            │ ───────────────── │
│ PK: id            │            │ PK: id            │
│     vendor        │            │     employee_id FK│───┐
│     amount        │            │     month         │   │
│     bill_date     │            │     base_salary   │   │
│     status        │            │     net_salary    │   │
│     card_id    FK │───┐        │     status        │   │
│     category_id FK│───┼───┐    │     created_by FK │   │
│     created_by FK │   │   │    └───────────────────┘   │
└───────────────────┘   │   │                            │
                        │   │                            │
                        │   │    ┌───────────────────┐   │
┌───────────────────┐   │   │    │    categories    │   │
│       cards       │   │   │    │ ──────────────── │   │
│ ───────────────── │   │   │    │ PK: id           │   │
│ PK: id            │◄──┘   │    │     name         │   │
│     card_number   │       │    │     type         │   │
│     card_holder   │       │    │     budget_limit │   │
│     card_type     │       │    └────────┬─────────┘   │
│     balance       │       │             │             │
│     card_limit    │       │             │ category_id │
│     is_active     │       │             │ (FK)        │
└───────────────────┘       │             │             │
                            │             │             │
                            │    ┌────────▼─────────┐   │
                            └───►│     budgets      │   │
                                 │ ──────────────── │   │
                                 │ PK: id           │   │
                                 │     category_id FK   │
                                 │     limit_amount │   │
                                 │     spent_amount │   │
                                 │     period       │   │
                                 │     is_active    │   │
                                 └──────────────────┘   │
                                                        │
┌──────────────────────────────────────────────────────┘
│
│    ┌─────────────────────┐
└───►│     employees       │
     │ ─────────────────── │
     │ PK: id              │
     │     first_name      │
     │     last_name       │
     │     email           │
     │     designation     │
     │     base_salary     │
     │     is_active       │
     └─────────────────────┘


Other Tables:

┌──────────────────────┐     ┌──────────────────────┐
│  cash_transactions   │     │     reminders        │
│ ──────────────────── │     │ ──────────────────── │
│ PK: id               │     │ PK: id               │
│     amount           │     │     user_id       FK │
│     transaction_type │     │     title            │
│     category_id   FK │     │     due_date         │
│     notes            │     │     is_completed     │
└──────────────────────┘     └──────────────────────┘

┌──────────────────────┐     ┌──────────────────────┐
│  petty_expenses      │     │     sessions         │
│ ──────────────────── │     │ ──────────────────── │
│ PK: id               │     │ PK: sid              │
│     description      │     │     user_id       FK │
│     amount           │     │     sess             │
│     category_id   FK │     │     expire           │
│     created_by    FK │     └──────────────────────┘
└──────────────────────┘
```

---

## Service Layer Interactions

### Bills Service Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     BillsService.createBill()               │
└─────────────────────┬───────────────────────────────────────┘
                      │
         ┌────────────▼────────────┐
         │ 1. Validate Input       │
         │    • vendor required    │
         │    • amount > 0         │
         │    • valid dates        │
         └────────────┬────────────┘
                      │
         ┌────────────▼────────────┐
         │ 2. Transform Data       │
         │    • camelCase → snake  │
         │    • set defaults       │
         │    • add created_by     │
         └────────────┬────────────┘
                      │
         ┌────────────▼────────────┐
         │ 3. Insert Bill          │
         │    supabase             │
         │      .from('bills')     │
         │      .insert(data)      │
         └────────────┬────────────┘
                      │
         ┌────────────▼────────────┐
         │ 4. Card linked?         │
         └────────────┬────────────┘
                      │
              ┌───────┴───────┐
              │               │
         ┌────▼─────┐   ┌────▼─────┐
         │   YES    │   │    NO    │
         └────┬─────┘   │  Skip    │
              │         └──────────┘
              │
         ┌────▼─────────────────────┐
         │ 5. Update Card Balance   │
         │    supabase.rpc(         │
         │      'increment_...',    │
         │      {card_id, amount}   │
         │    )                     │
         └────┬─────────────────────┘
              │
         ┌────▼─────────────────────┐
         │ 6. Invalidate Dashboard  │
         │    Cache                 │
         │    invalidateDashboard   │
         │    OnBillChange()        │
         └────┬─────────────────────┘
              │
         ┌────▼─────────────────────┐
         │ 7. Return Created Bill   │
         └──────────────────────────┘
```

### Dashboard Service Aggregation

```
┌────────────────────────────────────────────────────┐
│         DashboardService.getDashboardSummary()     │
└────────────────────┬───────────────────────────────┘
                     │
         ┌───────────▼───────────┐
         │ Parse Parameters      │
         │ • period              │
         │ • date range          │
         │ • include/exclude     │
         └───────────┬───────────┘
                     │
         ┌───────────▼────────────────────────────────┐
         │ Parallel Data Fetching                     │
         └───────────┬────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
   ┌────▼──────┐           ┌─────▼──────┐
   │ Get KPIs  │           │ Get Trends │
   │           │           │            │
   │ • Total   │           │ • Monthly  │
   │   expenses│           │   data     │
   │ • Pending │           │ • Daily    │
   │   bills   │           │   breakdown│
   │ • Budget  │           └─────┬──────┘
   │   status  │                 │
   └────┬──────┘                 │
        │                        │
        │           ┌────────────▼───────────┐
        │           │ Get Category Breakdown │
        │           │                        │
        │           │ • Expenses by category│
        │           │ • Percentage split    │
        │           └────────────┬───────────┘
        │                        │
        │           ┌────────────▼────────────┐
        │           │ Get Recent Transactions │
        │           │                         │
        │           │ • Last 10 bills         │
        │           │ • Latest expenses       │
        │           └────────────┬────────────┘
        │                        │
        └────────────┬───────────┘
                     │
         ┌───────────▼───────────┐
         │ Combine All Data      │
         │ • Merge results       │
         │ • Add metadata        │
         │ • Calculate derived   │
         │   metrics             │
         └───────────┬───────────┘
                     │
         ┌───────────▼───────────┐
         │ Return Complete       │
         │ Dashboard Object      │
         └───────────────────────┘
```

---

## File Upload Process

```
┌──────────┐
│  Client  │
└────┬─────┘
     │
     │ POST /api/bills/:id/attachment
     │ Content-Type: multipart/form-data
     │ Authorization: Bearer <token>
     │
┌────▼───────────────────────────────────────┐
│ Express Server                             │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │ 1. Multer Middleware                 │ │
│  │    upload.single('file')             │ │
│  │    • Parse multipart form            │ │
│  │    • Extract file                    │ │
│  │    • Store in memory                 │ │
│  └────────────┬─────────────────────────┘ │
│               │                            │
│  ┌────────────▼─────────────────────────┐ │
│  │ 2. Validate File                     │ │
│  │    • File present?                   │ │
│  │    • Valid mime type?                │ │
│  │    • Size within limit?              │ │
│  └────────────┬─────────────────────────┘ │
│               │                            │
│  ┌────────────▼─────────────────────────┐ │
│  │ 3. Generate Unique Filename          │ │
│  │    billId-uuid.ext                   │ │
│  └────────────┬─────────────────────────┘ │
└───────────────┼────────────────────────────┘
                │
┌───────────────▼────────────────────────────┐
│ StorageService                             │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │ 4. Upload to Supabase Storage        │ │
│  │    supabaseAdmin.storage             │ │
│  │      .from('bills-attachments')      │ │
│  │      .upload(filePath, buffer)       │ │
│  └────────────┬─────────────────────────┘ │
│               │                            │
│  ┌────────────▼─────────────────────────┐ │
│  │ 5. Get Public URL                    │ │
│  │    .getPublicUrl(filePath)           │ │
│  └────────────┬─────────────────────────┘ │
└───────────────┼────────────────────────────┘
                │
┌───────────────▼────────────────────────────┐
│ Database Update                            │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │ 6. Update Bill Record                │ │
│  │    UPDATE bills                      │ │
│  │    SET attachment_url = ?            │ │
│  │        attachment_type = ?           │ │
│  │    WHERE id = ?                      │ │
│  └────────────┬─────────────────────────┘ │
└───────────────┼────────────────────────────┘
                │
┌───────────────▼────────────────────────────┐
│ Response to Client                         │
│                                            │
│  {                                         │
│    "path": "uploads/bill-uuid.pdf",        │
│    "publicUrl": "https://...supabase..."   │
│  }                                         │
└────────────────────────────────────────────┘
```

---

## Dashboard Data Aggregation

### KPI Calculation Flow

```
┌─────────────────────────────────────────┐
│    Calculate Monthly KPIs               │
└─────────────────┬───────────────────────┘
                  │
     ┌────────────┴────────────┐
     │                         │
┌────▼─────────┐      ┌───────▼─────────┐
│ Total Bills  │      │  Total Cards    │
│              │      │                 │
│ SELECT       │      │ SELECT          │
│   SUM(amount)│      │   SUM(balance)  │
│ FROM bills   │      │ FROM cards      │
│ WHERE        │      │ WHERE is_active │
│   bill_date  │      │   = true        │
│   BETWEEN    │      └────────┬────────┘
│   start,end  │               │
└────┬─────────┘               │
     │                         │
     │        ┌────────────────┘
     │        │
┌────▼────────▼──────┐
│ Total Salary       │
│                    │
│ SELECT             │
│   SUM(net_salary)  │
│ FROM salary        │
│ WHERE month        │
│   = current_month  │
└────┬───────────────┘
     │
┌────▼─────────────────┐
│ Petty Expenses       │
│                      │
│ SELECT               │
│   SUM(amount)        │
│ FROM petty_expenses  │
│ WHERE created_at     │
│   BETWEEN start, end │
└────┬─────────────────┘
     │
┌────▼─────────────────┐
│ Calculate Derived    │
│ Metrics              │
│                      │
│ • Total Expenses =   │
│   bills + cards +    │
│   salary + petty     │
│                      │
│ • Avg Daily =        │
│   total / days       │
│                      │
│ • % vs Budget        │
└──────────────────────┘
```

---

## API Response Structure

### Standard Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2024-12-09T10:30:00Z",
    "version": "1.0.0",
    "permissions": {
      "canEdit": true,
      "editableFields": ["amount", "vendor"]
    }
  }
}
```

### Standard Error Response

```json
{
  "error": "Error message",
  "message": "Detailed description",
  "code": "ERROR_CODE",
  "details": {
    "field": "error detail"
  },
  "timestamp": "2024-12-09T10:30:00Z"
}
```

---

## Conclusion

These visual diagrams provide a comprehensive overview of how data flows through the AccountIQ Backend system, from initial client request through authentication, authorization, business logic, and database operations.

Key Takeaways:
- **Layered architecture** with clear separation of concerns
- **Security-first** approach with JWT authentication and RBAC
- **Service-oriented** design for maintainable business logic
- **Database-driven** with Supabase PostgreSQL
- **API-first** with comprehensive REST endpoints
