# AccountIQ Backend - Architecture & Flow Documentation

## Table of Contents
1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Architecture Patterns](#architecture-patterns)
5. [Authentication & Authorization Flow](#authentication--authorization-flow)
6. [API Routes & Endpoints](#api-routes--endpoints)
7. [Data Flow](#data-flow)
8. [Database Schema](#database-schema)
9. [Middleware Pipeline](#middleware-pipeline)
10. [Services Layer](#services-layer)
11. [File Upload & Storage](#file-upload--storage)
12. [Error Handling](#error-handling)
13. [Security Features](#security-features)

---

## Overview

AccountIQ Backend is a comprehensive RESTful API built for financial management and accounting operations. It provides secure, role-based access to financial data with support for bills, cards, cash transactions, salary management, budgeting, and analytics.

### Key Features
- **JWT-based authentication** via Supabase Auth
- **Role-Based Access Control (RBAC)** with field-level permissions
- **Real-time analytics** and dashboard metrics
- **File upload support** for bills and receipts
- **Budget tracking** with alerts and notifications
- **Data export** capabilities (PDF, Excel)
- **Comprehensive audit logging**

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js with TypeScript |
| **Framework** | Express.js |
| **Database** | PostgreSQL (via Supabase) |
| **Authentication** | Supabase Auth (JWT) |
| **Storage** | Supabase Storage |
| **Validation** | Zod |
| **Documentation** | Swagger/OpenAPI |
| **Logging** | Pino |
| **Security** | Helmet, CORS |

---

## Project Structure

```
AccountIQ-Backend/
├── src/
│   ├── index.ts                    # Main Express server & app configuration
│   ├── config/
│   │   └── swagger.ts              # Swagger/OpenAPI configuration
│   ├── db/
│   │   ├── database.ts             # Database connection
│   │   ├── db.ts                   # PostgreSQL pool
│   │   ├── supabase.ts             # Supabase client (admin & user)
│   │   ├── supabase-client.ts      # Additional Supabase utilities
│   │   ├── storage.ts              # File storage service
│   │   ├── storage-init.ts         # Storage bucket initialization
│   │   ├── migrations.ts           # Database schema migrations
│   │   └── dashboard-indexes.ts    # Dashboard query optimizations
│   ├── middleware/
│   │   ├── auth.middleware.ts      # JWT authentication
│   │   ├── rbac.middleware.ts      # Role-based access control
│   │   └── error.middleware.ts     # Global error handling
│   ├── routes/
│   │   ├── auth.routes.ts          # Authentication endpoints
│   │   ├── bills.routes.ts         # Bill management
│   │   ├── cards.routes.ts         # Card management
│   │   ├── cash-transactions.routes.ts  # Cash transaction tracking
│   │   ├── salary.routes.ts        # Salary management
│   │   ├── employees.routes.ts     # Employee CRUD
│   │   ├── petty-expenses.routes.ts # Petty expenses
│   │   ├── reminders.routes.ts     # Reminders & notifications
│   │   ├── budgets.routes.ts       # Budget management
│   │   ├── dashboard.routes.ts     # Analytics & KPIs
│   │   └── sessions.routes.ts      # Session management
│   ├── services/
│   │   ├── index.ts                # Service exports
│   │   ├── bills.service.ts        # Bill business logic
│   │   ├── cards.service.ts        # Card business logic
│   │   ├── cash-transactions.service.ts
│   │   ├── salary.service.ts
│   │   ├── employees.service.ts
│   │   ├── petty-expenses.service.ts
│   │   ├── reminders.service.ts
│   │   ├── budgets.service.ts
│   │   ├── dashboard.service.ts
│   │   └── cache-invalidation.service.ts
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces & types
│   ├── utils/
│   │   └── rbac.ts                 # RBAC utility functions
│   └── validators/
│       └── index.ts                # Zod validation schemas
├── .env                            # Environment variables
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript configuration
└── vercel.json                     # Deployment config

```

---

## Architecture Patterns

### 1. **Layered Architecture**

```
┌─────────────────────────────────────────┐
│         Client (Frontend)               │
└─────────────────┬───────────────────────┘
                  │ HTTP/REST
┌─────────────────▼───────────────────────┐
│         Routes Layer                    │
│  (Express Router - API Endpoints)       │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Middleware Layer                   │
│  - Authentication (JWT)                 │
│  - Authorization (RBAC)                 │
│  - Validation (Zod)                     │
│  - Error Handling                       │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│       Services Layer                    │
│  (Business Logic)                       │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Database Layer                     │
│  - Supabase Client                      │
│  - PostgreSQL                           │
│  - Storage (S3-compatible)              │
└─────────────────────────────────────────┘
```

### 2. **Service-Oriented Design**

Each domain (bills, cards, salary, etc.) has:
- **Routes**: API endpoint definitions
- **Service**: Business logic and data operations
- **Validators**: Input validation schemas
- **Types**: TypeScript interfaces

---

## Authentication & Authorization Flow

### Authentication Flow

```
┌──────────┐                ┌──────────────┐                ┌────────────┐
│  Client  │                │   Express    │                │  Supabase  │
│          │                │   Backend    │                │    Auth    │
└────┬─────┘                └──────┬───────┘                └─────┬──────┘
     │                             │                              │
     │  POST /api/auth/login       │                              │
     ├────────────────────────────►│                              │
     │  { email, password }        │                              │
     │                             │                              │
     │                             │  signInWithPassword()        │
     │                             ├─────────────────────────────►│
     │                             │                              │
     │                             │  ◄────────────────────────────┤
     │                             │  { access_token, user }      │
     │                             │                              │
     │                             │  Query users table           │
     │                             │  (get role, status)          │
     │                             │                              │
     │  ◄────────────────────────────┤                              │
     │  { token, user, role }      │                              │
     │                             │                              │
     │  Subsequent requests        │                              │
     │  Authorization: Bearer TOKEN │                              │
     ├────────────────────────────►│                              │
     │                             │                              │
     │                             │  Verify token                │
     │                             ├─────────────────────────────►│
     │                             │                              │
     │                             │  ◄────────────────────────────┤
     │                             │  { user data }               │
     │                             │                              │
     │  ◄────────────────────────────┤                              │
     │  Response with data         │                              │
```

### Authorization (RBAC) Flow

```
Request → authenticate() → authorize() → RBAC checks → Handler
           │                │             │
           │                │             └─→ Field-level permissions
           │                └─→ Role check (admin/user)
           └─→ JWT validation
```

### Middleware Stack

```typescript
// Example: Protected route with RBAC
router.put(
  '/bills/:id',
  authenticate,              // 1. Verify JWT token
  requireEditPermission,     // 2. Check if user can edit bills
  asyncHandler(handler)      // 3. Execute business logic
);
```

---

## API Routes & Endpoints

### Base URL
- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-domain.com/api`

### Complete API Reference

#### 1. Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/login` | Login with email/password | ❌ |
| `POST` | `/signup` | Register new user (admin only) | ✅ Admin |
| `POST` | `/logout` | Logout and invalidate token | ✅ |
| `POST` | `/refresh` | Refresh access token | ✅ |
| `GET` | `/me` | Get current user profile | ✅ |
| `PUT` | `/me` | Update current user profile | ✅ |
| `POST` | `/change-password` | Change password | ✅ |
| `POST` | `/forgot-password` | Request password reset | ❌ |
| `POST` | `/reset-password` | Reset password with token | ❌ |

**Example: Login Request**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "v1.abc123...",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "role": "admin",
    "first_name": "Admin",
    "last_name": "User"
  }
}
```

---

#### 2. Bills Management (`/api/bills`)

| Method | Endpoint | Description | Auth | Permissions |
|--------|----------|-------------|------|-------------|
| `GET` | `/` | Get all bills (with filters) | ✅ | All |
| `GET` | `/:id` | Get bill by ID | ✅ | All |
| `POST` | `/` | Create new bill | ✅ | All |
| `PUT` | `/:id` | Update bill | ✅ | Admin only |
| `DELETE` | `/:id` | Delete bill | ✅ | Admin only |
| `POST` | `/:id/attachment` | Upload bill attachment | ✅ | All |
| `GET` | `/:id/attachment` | Get bill attachment | ✅ | All |
| `GET` | `/export/pdf` | Export bills to PDF | ✅ | All |
| `GET` | `/export/excel` | Export bills to Excel | ✅ | All |
| `GET` | `/stats` | Get bill statistics | ✅ | All |

**Query Parameters**
- `startDate`: Filter from date (YYYY-MM-DD)
- `endDate`: Filter to date (YYYY-MM-DD)
- `status`: Filter by status (pending/paid/overdue)
- `vendor`: Filter by vendor name
- `category_id`: Filter by category

**Example: Get Bills**
```bash
GET /api/bills?startDate=2024-01-01&status=pending
Authorization: Bearer {token}
```

**Example: Create Bill**
```bash
POST /api/bills
Authorization: Bearer {token}
Content-Type: application/json

{
  "vendor": "ABC Suppliers",
  "amount": 1500.00,
  "bill_date": "2024-12-09",
  "due_date": "2024-12-31",
  "description": "Office supplies",
  "category_id": "uuid",
  "card_id": "uuid",
  "status": "pending"
}
```

---

#### 3. Cards Management (`/api/cards`)

| Method | Endpoint | Description | Auth | Permissions |
|--------|----------|-------------|------|-------------|
| `GET` | `/` | Get all active cards | ✅ | All |
| `GET` | `/:id` | Get card by ID | ✅ | All |
| `POST` | `/` | Create new card | ✅ | Admin only |
| `PUT` | `/:id` | Update card | ✅ | Admin only |
| `DELETE` | `/:id` | Deactivate card | ✅ | Admin only |
| `GET` | `/:id/transactions` | Get card transactions | ✅ | All |
| `GET` | `/stats` | Get card statistics | ✅ | All |

**Example: Create Card**
```bash
POST /api/cards
Authorization: Bearer {token}

{
  "card_number": "**** **** **** 1234",
  "card_holder": "Company Name",
  "card_type": "credit",
  "bank": "ABC Bank",
  "expiry_date": "2026-12",
  "card_limit": 50000.00,
  "balance": 0.00
}
```

---

#### 4. Cash Transactions (`/api/cash-transactions`)

| Method | Endpoint | Description | Auth | Permissions |
|--------|----------|-------------|------|-------------|
| `GET` | `/` | Get all transactions | ✅ | All |
| `GET` | `/:id` | Get transaction by ID | ✅ | All |
| `POST` | `/` | Create transaction | ✅ | All |
| `PUT` | `/:id` | Update transaction | ✅ | Admin only |
| `DELETE` | `/:id` | Delete transaction | ✅ | Admin only |
| `GET` | `/stats` | Get transaction stats | ✅ | All |
| `GET` | `/export/excel` | Export to Excel | ✅ | All |

---

#### 5. Employees (`/api/employees`)

| Method | Endpoint | Description | Auth | Permissions |
|--------|----------|-------------|------|-------------|
| `GET` | `/` | Get all employees | ✅ | All |
| `GET` | `/:id` | Get employee by ID | ✅ | All |
| `POST` | `/` | Create employee | ✅ | Admin only |
| `PUT` | `/:id` | Update employee | ✅ | Admin only |
| `DELETE` | `/:id` | Deactivate employee | ✅ | Admin only |

---

#### 6. Salary Management (`/api/salary`)

| Method | Endpoint | Description | Auth | Permissions |
|--------|----------|-------------|------|-------------|
| `GET` | `/` | Get all salary records | ✅ | All |
| `GET` | `/:id` | Get salary record | ✅ | All |
| `POST` | `/` | Create salary record | ✅ | Admin only |
| `PUT` | `/:id` | Update salary | ✅ | Admin only |
| `DELETE` | `/:id` | Delete salary record | ✅ | Admin only |
| `GET` | `/employee/:id` | Get employee salaries | ✅ | All |
| `GET` | `/export/excel` | Export salary data | ✅ | All |

---

#### 7. Petty Expenses (`/api/petty-expenses`)

| Method | Endpoint | Description | Auth | Permissions |
|--------|----------|-------------|------|-------------|
| `GET` | `/` | Get all petty expenses | ✅ | All |
| `GET` | `/:id` | Get expense by ID | ✅ | All |
| `POST` | `/` | Create petty expense | ✅ | All |
| `PUT` | `/:id` | Update expense | ✅ | Admin only |
| `DELETE` | `/:id` | Delete expense | ✅ | Admin only |
| `GET` | `/monthly-summary` | Get monthly summary | ✅ | All |

---

#### 8. Budgets (`/api/budgets`)

| Method | Endpoint | Description | Auth | Permissions |
|--------|----------|-------------|------|-------------|
| `GET` | `/` | Get all budgets | ✅ | All |
| `GET` | `/:id` | Get budget by ID | ✅ | All |
| `POST` | `/` | Create budget | ✅ | Admin only |
| `PUT` | `/:id` | Update budget | ✅ | Admin only |
| `DELETE` | `/:id` | Delete budget | ✅ | Admin only |
| `GET` | `/status` | Get budget status overview | ✅ | All |
| `GET` | `/alerts` | Get budget alerts | ✅ | All |

---

#### 9. Reminders (`/api/reminders`)

| Method | Endpoint | Description | Auth | Permissions |
|--------|----------|-------------|------|-------------|
| `GET` | `/` | Get all reminders | ✅ | All |
| `GET` | `/:id` | Get reminder by ID | ✅ | All |
| `POST` | `/` | Create reminder | ✅ | All |
| `PUT` | `/:id` | Update reminder | ✅ | Owner/Admin |
| `DELETE` | `/:id` | Delete reminder | ✅ | Owner/Admin |
| `GET` | `/upcoming` | Get upcoming reminders | ✅ | All |

---

#### 10. Dashboard & Analytics (`/api/dashboard`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/summary` | Complete dashboard data | ✅ |
| `GET` | `/kpis` | KPI metrics only | ✅ |
| `GET` | `/trends` | Monthly expense trends | ✅ |
| `GET` | `/category-breakdown` | Expense by category | ✅ |
| `GET` | `/recent-transactions` | Recent transactions | ✅ |
| `GET` | `/budget-overview` | Budget status | ✅ |
| `GET` | `/top-vendors` | Top vendors by spend | ✅ |
| `GET` | `/cash-flow` | Cash flow analysis | ✅ |
| `GET` | `/expense-forecast` | Expense predictions | ✅ |

**Query Parameters**
- `period`: `current_month` | `last_30_days` | `custom_range`
- `startDate`: Start date for custom range
- `endDate`: End date for custom range
- `include`: Comma-separated components to include
- `exclude`: Comma-separated components to exclude
- `timeZone`: Timezone for date calculations

**Example: Get Dashboard Summary**
```bash
GET /api/dashboard/summary?period=current_month
Authorization: Bearer {token}
```

**Response Structure**
```json
{
  "kpis": {
    "totalExpenses": 45000.00,
    "totalBills": 25000.00,
    "totalCards": 15000.00,
    "pendingBills": 5000.00,
    "averageDailyExpense": 1500.00
  },
  "trends": {
    "monthly": [...],
    "daily": [...]
  },
  "categoryBreakdown": [...],
  "recentTransactions": [...],
  "budgetStatus": {...},
  "alerts": [...]
}
```

---

#### 11. Sessions (`/api/sessions`)

| Method | Endpoint | Description | Auth | Permissions |
|--------|----------|-------------|------|-------------|
| `GET` | `/` | Get all active sessions | ✅ | Admin only |
| `GET` | `/my-sessions` | Get current user sessions | ✅ | All |
| `DELETE` | `/:id` | Terminate session | ✅ | Admin only |

---

## Data Flow

### Request-Response Lifecycle

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ 1. HTTP Request
       ▼
┌─────────────────────────────────┐
│  Express Server (index.ts)      │
│  - CORS                         │
│  - Helmet (Security Headers)    │
│  - Body Parser                  │
│  - Session                      │
└──────┬──────────────────────────┘
       │ 2. Route Matching
       ▼
┌─────────────────────────────────┐
│  Route Handler                  │
│  (e.g., bills.routes.ts)        │
└──────┬──────────────────────────┘
       │ 3. Middleware Chain
       ▼
┌─────────────────────────────────┐
│  authenticate()                 │
│  - Extract JWT token            │
│  - Verify with Supabase        │
│  - Attach user to request      │
└──────┬──────────────────────────┘
       │ 4. Authorization
       ▼
┌─────────────────────────────────┐
│  authorize() / RBAC             │
│  - Check user role              │
│  - Validate permissions         │
│  - Filter editable fields       │
└──────┬──────────────────────────┘
       │ 5. Validation
       ▼
┌─────────────────────────────────┐
│  Zod Schema Validation          │
│  - Validate request body        │
│  - Type checking                │
└──────┬──────────────────────────┘
       │ 6. Business Logic
       ▼
┌─────────────────────────────────┐
│  Service Layer                  │
│  (e.g., BillsService)           │
│  - Data processing              │
│  - Business rules               │
│  - Cache invalidation           │
└──────┬──────────────────────────┘
       │ 7. Database Operations
       ▼
┌─────────────────────────────────┐
│  Supabase Client                │
│  - Query PostgreSQL             │
│  - Upload files (if needed)     │
│  - Update relationships         │
└──────┬──────────────────────────┘
       │ 8. Response
       ▼
┌─────────────────────────────────┐
│  Format & Send Response         │
│  - Add metadata                 │
│  - Set status code              │
│  - JSON response                │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────┐
│   Client    │
└─────────────┘
```

### Example: Creating a Bill

```typescript
// 1. Client sends request
POST /api/bills
Authorization: Bearer {token}
{ vendor: "ABC", amount: 1000 }

// 2. Router matches endpoint
router.post('/', authenticate, asyncHandler(handler))

// 3. authenticate() middleware
- Extract JWT from Authorization header
- Verify token with Supabase: supabaseAdmin.auth.getUser(token)
- Query users table for role and status
- Attach req.user = { id, email, role }

// 4. Business Logic (BillsService.createBill)
- Validate required fields
- Transform camelCase to snake_case
- Insert into bills table
- Update card balance (if card_id provided)
- Invalidate dashboard cache

// 5. Response
{
  "id": "uuid",
  "vendor": "ABC",
  "amount": 1000,
  "status": "pending",
  "created_at": "2024-12-09T10:30:00Z"
}
```

---

## Database Schema

### Core Tables

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'user',  -- 'admin' | 'user'
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### bills
```sql
CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_date DATE NOT NULL,
  vendor VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id),
  card_id UUID REFERENCES cards(id),
  status VARCHAR(20) DEFAULT 'pending',  -- 'pending' | 'paid' | 'overdue'
  attachment_url TEXT,
  attachment_type VARCHAR(50),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### cards
```sql
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_number VARCHAR(20) NOT NULL,
  card_holder VARCHAR(100) NOT NULL,
  card_type VARCHAR(20) NOT NULL,  -- 'credit' | 'debit'
  bank VARCHAR(100),
  expiry_date VARCHAR(7),  -- YYYY-MM
  card_limit DECIMAL(10, 2) DEFAULT 0,
  balance DECIMAL(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### employees
```sql
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  designation VARCHAR(100),
  department_id UUID REFERENCES departments(id),
  base_salary DECIMAL(10, 2),
  join_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### salary
```sql
CREATE TABLE salary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id),
  month VARCHAR(7) NOT NULL,  -- YYYY-MM
  base_salary DECIMAL(10, 2) NOT NULL,
  allowances DECIMAL(10, 2) DEFAULT 0,
  deductions DECIMAL(10, 2) DEFAULT 0,
  net_salary DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  paid_date DATE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### budgets
```sql
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id),
  limit_amount DECIMAL(10, 2) NOT NULL,
  spent_amount DECIMAL(10, 2) DEFAULT 0,
  period VARCHAR(20),  -- 'monthly' | 'quarterly' | 'annual'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  alert_threshold DECIMAL(5, 2) DEFAULT 80.00,  -- percentage
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Relationships

```
users ─┬─ bills (created_by)
       ├─ salary (created_by)
       ├─ budgets (created_by)
       └─ reminders (user_id)

employees ── salary (employee_id)

categories ─┬─ bills (category_id)
            ├─ budgets (category_id)
            └─ cash_transactions (category_id)

cards ── bills (card_id)
```

---

## Middleware Pipeline

### 1. Global Middleware (Applied to All Routes)

```typescript
// src/index.ts

app.use(helmet());                    // Security headers
app.use(cors(corsOptions));           // CORS configuration
app.use(pinoHttp());                  // Request logging
app.use(express.json());              // JSON body parser
app.use(session({...}));              // Session management
```

### 2. Route-Specific Middleware

#### Authentication Middleware
```typescript
// src/middleware/auth.middleware.ts

export const authenticate = async (req, res, next) => {
  // 1. Extract token from Authorization header
  const token = req.headers.authorization?.substring(7);
  
  // 2. Verify token with Supabase
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  
  // 3. Query user from database
  const userData = await supabaseAdmin
    .from('users')
    .select('id, email, role')
    .eq('id', data.user.id)
    .single();
  
  // 4. Attach user to request
  req.user = userData;
  next();
};
```

#### RBAC Middleware
```typescript
// src/middleware/rbac.middleware.ts

export const requireEditPermission = (resource) => {
  return (req, res, next) => {
    const user = req.user;
    const permissions = FIELD_PERMISSIONS[resource];
    
    // Check if user role can edit this resource
    const rolePermissions = permissions[user.role];
    
    if (rolePermissions.length === 0) {
      return res.status(403).json({ 
        error: 'Edit access denied' 
      });
    }
    
    // Validate specific fields
    const fieldsToUpdate = Object.keys(req.body);
    const validation = validateEditPermission(
      user.role, 
      resource, 
      fieldsToUpdate
    );
    
    if (!validation.allowed) {
      return res.status(403).json({
        error: 'Field edit access denied',
        deniedFields: validation.deniedFields
      });
    }
    
    next();
  };
};
```

#### Error Handling Middleware
```typescript
// src/middleware/error.middleware.ts

export const errorHandler = (err, req, res, next) => {
  console.error(err);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    details: process.env.NODE_ENV === 'development' 
      ? err.message 
      : undefined
  });
};

// Async wrapper to catch errors
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

---

## Services Layer

Services contain business logic and database operations.

### Service Pattern

```typescript
// src/services/bills.service.ts

export class BillsService {
  // Get all bills with filters
  static async getAllBills(userId: string, filters?: any) {
    let query = supabaseAdmin
      .from('bills')
      .select('*, cards(*), users(*)')
      .order('bill_date', { ascending: false });
    
    // Apply filters
    if (filters?.startDate) {
      query = query.gte('bill_date', filters.startDate);
    }
    
    const { data, error } = await query;
    
    if (error) throw new Error(error.message);
    return data;
  }
  
  // Create bill
  static async createBill(data: any, userId: string) {
    // Validate data
    if (!data.vendor || !data.amount) {
      throw new Error('Vendor and amount are required');
    }
    
    // Insert bill
    const { data: newBill, error } = await supabaseAdmin
      .from('bills')
      .insert({
        ...data,
        created_by: userId
      })
      .select()
      .single();
    
    if (error) throw new Error(error.message);
    
    // Update card balance if linked
    if (data.card_id) {
      await this.updateCardBalance(data.card_id, data.amount);
    }
    
    // Invalidate dashboard cache
    await invalidateDashboardOnBillChange();
    
    return newBill;
  }
  
  // Update card balance
  private static async updateCardBalance(cardId: string, amount: number) {
    await supabaseAdmin.rpc('increment_card_balance', {
      card_id_param: cardId,
      amount_param: amount
    });
  }
}
```

---

## File Upload & Storage

### Storage Service

```typescript
// src/db/storage.ts

export class StorageService {
  private buckets = {
    bills: 'bills-attachments',
    documents: 'documents',
    exports: 'exports',
    receipts: 'receipts'
  };
  
  async uploadBillAttachment(
    billId: string, 
    file: Buffer, 
    fileName: string
  ) {
    const bucketName = this.buckets.bills;
    const filePath = `uploads/${billId}-${uuidv4()}.${ext}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(filePath, file);
    
    if (error) throw new Error(error.message);
    
    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    return {
      path: filePath,
      publicUrl: urlData.publicUrl
    };
  }
}
```

### File Upload Endpoint

```typescript
// src/routes/bills.routes.ts

router.post(
  '/:id/attachment',
  authenticate,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ 
        error: 'No file uploaded' 
      });
    }
    
    // Upload to storage
    const result = await storageService.uploadBillAttachment(
      id,
      file.buffer,
      file.originalname
    );
    
    // Update bill with attachment URL
    await supabaseAdmin
      .from('bills')
      .update({
        attachment_url: result.publicUrl,
        attachment_type: file.mimetype
      })
      .eq('id', id);
    
    res.json(result);
  })
);
```

---

## Error Handling

### Error Types

1. **Authentication Errors** (401)
   - Invalid token
   - Expired token
   - User not found

2. **Authorization Errors** (403)
   - Insufficient permissions
   - Role mismatch
   - Field edit denied

3. **Validation Errors** (400)
   - Missing required fields
   - Invalid data format
   - Schema validation failed

4. **Not Found Errors** (404)
   - Resource not found

5. **Server Errors** (500)
   - Database errors
   - Service failures

### Error Response Format

```json
{
  "error": "Error message",
  "message": "Detailed description",
  "code": "ERROR_CODE",
  "details": {
    "field": "error detail"
  }
}
```

---

## Security Features

### 1. **Authentication**
- JWT token-based authentication via Supabase
- Token expiry and refresh mechanism
- Secure password hashing (bcrypt)

### 2. **Authorization**
- Role-Based Access Control (RBAC)
- Field-level permissions
- Resource ownership validation

### 3. **Security Headers**
- Helmet.js for security headers
- CORS with whitelist
- CSP (Content Security Policy)

### 4. **Input Validation**
- Zod schema validation
- SQL injection prevention (parameterized queries)
- XSS protection

### 5. **Rate Limiting**
- API rate limiting per IP
- Login attempt limiting

### 6. **Data Protection**
- Encrypted connections (HTTPS)
- Sensitive data masking
- Audit logging

### 7. **Session Management**
- Secure session cookies
- Session timeout
- Session invalidation on logout

---

## API Usage Examples

### Authentication Flow
```bash
# 1. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Response: { "token": "jwt-token", "user": {...} }

# 2. Use token in subsequent requests
curl -X GET http://localhost:5000/api/bills \
  -H "Authorization: Bearer jwt-token"
```

### CRUD Operations
```bash
# Create
curl -X POST http://localhost:5000/api/bills \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{"vendor":"ABC","amount":1000,"bill_date":"2024-12-09"}'

# Read
curl -X GET http://localhost:5000/api/bills/uuid \
  -H "Authorization: Bearer token"

# Update
curl -X PUT http://localhost:5000/api/bills/uuid \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{"status":"paid"}'

# Delete
curl -X DELETE http://localhost:5000/api/bills/uuid \
  -H "Authorization: Bearer token"
```

---

## Development Workflow

### 1. **Setup**
```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Run migrations
npm run migrate
```

### 2. **Development**
```bash
# Start dev server with hot reload
npm run dev

# Server runs on http://localhost:5000
# API docs available at http://localhost:5000/api-docs
```

### 3. **Testing**
```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Build
npm run build

# Start production
npm start
```

---

## Deployment

### Environment Variables Required
```bash
# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# Server
NODE_ENV=production
BACKEND_PORT=5000
BACKEND_URL=https://api.yourdomain.com

# Frontend
FRONTEND_URL=https://yourdomain.com
FRONTEND_URLS=https://app1.com,https://app2.com

# Security
SESSION_SECRET=your-secure-secret-key
```

### Deployment Platforms
- **Vercel**: See `vercel.json` configuration
- **Railway**: One-click deploy
- **Heroku**: Compatible with Procfile
- **AWS/GCP/Azure**: Docker container support

---

## API Documentation

### Swagger UI
Access interactive API documentation at:
```
http://localhost:5000/api-docs
```

### OpenAPI Spec
Download OpenAPI JSON:
```
http://localhost:5000/api-docs.json
```

---

## Support & Maintenance

### Logging
- All requests logged via Pino
- Error stack traces in development
- Structured logging for production monitoring

### Monitoring
- Health check endpoint: `/health`
- Database connection status
- Storage bucket availability

### Backup & Recovery
- Database: Automated Supabase backups
- Storage: S3-compatible bucket replication
- Audit logs for data recovery

---

## Conclusion

This backend provides a robust, scalable foundation for financial management with:
- ✅ **Secure authentication & authorization**
- ✅ **Comprehensive API coverage**
- ✅ **Role-based access control**
- ✅ **Real-time analytics**
- ✅ **File upload support**
- ✅ **Excellent documentation**

For questions or contributions, please refer to the repository documentation.
