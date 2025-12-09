# AccountIQ Database Schema Documentation

## Overview

This document provides comprehensive documentation for the AccountIQ financial management system database. The database uses **PostgreSQL** (via Supabase) and contains 12 main tables for managing users, employees, bills, cards, transactions, salaries, expenses, budgets, reminders, sessions, and audit logs.

**Version:** 1.0  
**Created:** December 2025  
**Database:** PostgreSQL 15+  
**Extensions:** uuid-ossp, pgcrypto

---

## Table of Contents

1. [Users & Authentication](#1-users--authentication)
   - [Users](#users-table)
   - [Sessions](#sessions-table)
2. [Employees & HR](#2-employees--human-resources)
   - [Employees](#employees-table)
   - [Salaries](#salaries-table)
3. [Financial Accounts](#3-financial-accounts)
   - [Cards](#cards-table)
   - [Card Transactions](#card-transactions-table)
   - [Cash Transactions](#cash-transactions-table)
4. [Bills & Expenses](#4-bills--expenses)
   - [Bills](#bills-table)
   - [Petty Expenses](#petty-expenses-table)
5. [Budgets & Planning](#5-budgets--planning)
   - [Budgets](#budgets-table)
6. [Reminders](#6-reminders)
   - [Reminders](#reminders-table)
7. [Audit & Logging](#7-audit--logging)
   - [Audit Log](#audit-log-table)
8. [Database Views](#8-database-views)
9. [Functions & Triggers](#9-functions--triggers)
10. [Indexes](#10-indexes)
11. [Entity Relationships](#11-entity-relationships)
12. [Migration Guide](#12-migration-guide)

---

## 1. Users & Authentication

### Users Table

**Purpose**: Core authentication and user management with role-based access control.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    is_active BOOLEAN DEFAULT true,
    phone VARCHAR(20),
    department VARCHAR(100),
    designation VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Auto-generated unique identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User's email address (login credential) |
| `first_name` | VARCHAR(100) | | User's first name |
| `last_name` | VARCHAR(100) | | User's last name |
| `role` | VARCHAR(20) | NOT NULL, CHECK | User role: 'admin' or 'user' |
| `is_active` | BOOLEAN | DEFAULT true | Account active status |
| `phone` | VARCHAR(20) | | Contact phone number |
| `department` | VARCHAR(100) | | User's department |
| `designation` | VARCHAR(100) | | User's job title |
| `created_at` | TIMESTAMP | DEFAULT NOW | Record creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW | Last update timestamp |

#### Notes
- Password authentication is handled by Supabase Auth
- Roles: `admin` (full access), `user` (limited access)
- `updated_at` automatically updated via trigger
- Indexed on: email, role, is_active

---

### Sessions Table

**Purpose**: Track user sessions for security monitoring and auditing.

```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(500) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Session identifier |
| `user_id` | UUID | FK → users, NOT NULL | Associated user |
| `session_token` | VARCHAR(500) | UNIQUE, NOT NULL | JWT or session token |
| `ip_address` | INET | | Client IP address |
| `user_agent` | TEXT | | Browser/client info |
| `expires_at` | TIMESTAMP | NOT NULL | Session expiration time |
| `created_at` | TIMESTAMP | DEFAULT NOW | Session start time |
| `last_activity` | TIMESTAMP | DEFAULT NOW | Last request timestamp |

#### Notes
- Cascading delete when user is removed
- Indexed on: user_id, expires_at, session_token
- Cleanup function available: `cleanup_expired_sessions()`

---

## 2. Employees & Human Resources

### Employees Table

**Purpose**: Employee records for HR and payroll management.

```sql
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    position VARCHAR(100),
    department VARCHAR(100),
    join_date DATE NOT NULL,
    base_salary DECIMAL(12, 2) NOT NULL CHECK (base_salary >= 0),
    is_active BOOLEAN DEFAULT true,
    phone VARCHAR(20),
    address TEXT,
    emergency_contact VARCHAR(255),
    emergency_phone VARCHAR(20),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Employee identifier |
| `name` | VARCHAR(255) | NOT NULL | Full name |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Contact email |
| `position` | VARCHAR(100) | | Job title |
| `department` | VARCHAR(100) | | Department name |
| `join_date` | DATE | NOT NULL | Employment start date |
| `base_salary` | DECIMAL(12, 2) | NOT NULL, CHECK >= 0 | Monthly base salary |
| `is_active` | BOOLEAN | DEFAULT true | Employment status |
| `phone` | VARCHAR(20) | | Contact phone |
| `address` | TEXT | | Residential address |
| `emergency_contact` | VARCHAR(255) | | Emergency contact name |
| `emergency_phone` | VARCHAR(20) | | Emergency phone number |
| `created_by` | UUID | FK → users | User who created record |
| `created_at` | TIMESTAMP | DEFAULT NOW | Record creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW | Last update time |

#### Notes
- Indexed on: email, is_active, department
- Related to salaries via `employee_id`
- View available: `employee_salary_summary`

---

### Salaries Table

**Purpose**: Monthly salary payment records with automatic net amount calculation.

```sql
CREATE TABLE salaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    base_amount DECIMAL(12, 2) NOT NULL CHECK (base_amount >= 0),
    bonuses DECIMAL(12, 2) DEFAULT 0 CHECK (bonuses >= 0),
    deductions DECIMAL(12, 2) DEFAULT 0 CHECK (deductions >= 0),
    net_amount DECIMAL(12, 2) GENERATED ALWAYS AS (base_amount + bonuses - deductions) STORED,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    paid_date DATE,
    payment_method VARCHAR(50),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (employee_id, month)
);
```

#### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Salary record ID |
| `employee_id` | UUID | FK → employees, NOT NULL | Employee reference |
| `month` | DATE | NOT NULL | Salary month (1st of month) |
| `base_amount` | DECIMAL(12, 2) | NOT NULL, CHECK >= 0 | Base salary amount |
| `bonuses` | DECIMAL(12, 2) | DEFAULT 0, CHECK >= 0 | Additional bonuses |
| `deductions` | DECIMAL(12, 2) | DEFAULT 0, CHECK >= 0 | Deductions (tax, etc.) |
| `net_amount` | DECIMAL(12, 2) | GENERATED/COMPUTED | Automatic calculation |
| `status` | VARCHAR(20) | CHECK | 'pending', 'paid', 'cancelled' |
| `paid_date` | DATE | | Actual payment date |
| `payment_method` | VARCHAR(50) | | Payment method used |
| `notes` | TEXT | | Additional notes |
| `created_by` | UUID | FK → users | User who created record |
| `created_at` | TIMESTAMP | DEFAULT NOW | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT NOW | Update timestamp |

#### Notes
- `net_amount` is **computed**: base_amount + bonuses - deductions
- **UNIQUE constraint**: one salary per employee per month
- Indexed on: employee_id, month, status
- Cascading delete when employee is removed

---

## 3. Financial Accounts

### Cards Table

**Purpose**: Company credit/debit cards with balance tracking.

```sql
CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_name VARCHAR(100) NOT NULL,
    card_number VARCHAR(4) NOT NULL,
    holder_name VARCHAR(255) NOT NULL,
    card_type VARCHAR(20) DEFAULT 'credit' CHECK (card_type IN ('credit', 'debit')),
    expiry_date VARCHAR(7) NOT NULL,
    balance DECIMAL(12, 2) DEFAULT 0 CHECK (balance >= 0),
    credit_limit DECIMAL(12, 2) CHECK (credit_limit >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked', 'expired')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    bank_name VARCHAR(100),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Card identifier |
| `card_name` | VARCHAR(100) | NOT NULL | Card nickname/label |
| `card_number` | VARCHAR(4) | NOT NULL | **Last 4 digits only** |
| `holder_name` | VARCHAR(255) | NOT NULL | Cardholder name |
| `card_type` | VARCHAR(20) | CHECK | 'credit' or 'debit' |
| `expiry_date` | VARCHAR(7) | NOT NULL | Format: MM/YYYY |
| `balance` | DECIMAL(12, 2) | DEFAULT 0, CHECK >= 0 | Current balance |
| `credit_limit` | DECIMAL(12, 2) | CHECK >= 0 | Credit limit (for credit cards) |
| `status` | VARCHAR(20) | CHECK | Card status |
| `is_active` | BOOLEAN | NOT NULL | Synced with status |
| `bank_name` | VARCHAR(100) | | Issuing bank |
| `notes` | TEXT | | Additional notes |
| `created_by` | UUID | FK → users | Creator user |
| `created_at` | TIMESTAMP | DEFAULT NOW | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW | Update time |

#### Notes
- **Security**: Only last 4 digits stored
- `is_active` automatically synced with `status` via trigger
- Indexed on: status, is_active, created_by
- Status values: 'active', 'inactive', 'blocked', 'expired'

---

### Card Transactions Table

**Purpose**: Individual card transaction records.

```sql
CREATE TABLE card_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    transaction_type VARCHAR(20) NOT NULL DEFAULT 'debit' CHECK (transaction_type IN ('debit', 'credit', 'refund')),
    description TEXT NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    category VARCHAR(50) NOT NULL,
    vendor VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    receipt_url TEXT,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Transaction ID |
| `card_id` | UUID | FK → cards, NOT NULL | Associated card |
| `amount` | DECIMAL(12, 2) | NOT NULL, CHECK > 0 | Transaction amount |
| `transaction_type` | VARCHAR(20) | CHECK | 'debit', 'credit', 'refund' |
| `description` | TEXT | NOT NULL | Transaction description |
| `transaction_date` | TIMESTAMP | NOT NULL | Transaction timestamp |
| `category` | VARCHAR(50) | NOT NULL | Expense category |
| `vendor` | VARCHAR(255) | | Vendor/merchant name |
| `status` | VARCHAR(20) | CHECK | Transaction status |
| `receipt_url` | TEXT | | Receipt file URL |
| `notes` | TEXT | | Additional notes |
| `created_by` | UUID | FK → users | User who recorded |
| `created_at` | TIMESTAMP | DEFAULT NOW | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW | Update time |

#### Notes
- Cascading delete when card is removed
- Indexed on: card_id, transaction_date, category, status
- Categories: 'office_supplies', 'travel', 'software', 'meals', etc.

---

### Cash Transactions Table

**Purpose**: Track cash inflows and outflows.

```sql
CREATE TABLE cash_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('inflow', 'outflow')),
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    description TEXT NOT NULL,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    category VARCHAR(50) NOT NULL,
    vendor VARCHAR(255),
    payment_method VARCHAR(50),
    receipt_number VARCHAR(100),
    notes TEXT,
    recorded_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Transaction ID |
| `transaction_type` | VARCHAR(20) | NOT NULL, CHECK | 'inflow' or 'outflow' |
| `amount` | DECIMAL(12, 2) | NOT NULL, CHECK > 0 | Amount |
| `description` | TEXT | NOT NULL | Description |
| `transaction_date` | DATE | NOT NULL | Transaction date |
| `category` | VARCHAR(50) | NOT NULL | Category |
| `vendor` | VARCHAR(255) | | Vendor name |
| `payment_method` | VARCHAR(50) | | Payment method |
| `receipt_number` | VARCHAR(100) | | Receipt reference |
| `notes` | TEXT | | Additional notes |
| `recorded_by` | UUID | FK → users, NOT NULL | Recording user |
| `created_at` | TIMESTAMP | DEFAULT NOW | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW | Update time |

#### Notes
- Indexed on: transaction_date, transaction_type, category
- Categories: 'revenue', 'salary', 'petty_cash', 'vendor_payment', etc.

---

## 4. Bills & Expenses

### Bills Table

**Purpose**: Invoice and bill tracking with payment management.

```sql
CREATE TABLE bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_number VARCHAR(100) UNIQUE,
    vendor VARCHAR(255) NOT NULL,
    bill_date DATE NOT NULL,
    due_date DATE,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    tax_amount DECIMAL(12, 2) DEFAULT 0 CHECK (tax_amount >= 0),
    total_amount DECIMAL(12, 2) GENERATED ALWAYS AS (amount + tax_amount) STORED,
    description TEXT NOT NULL,
    expense_type VARCHAR(50) NOT NULL DEFAULT 'other' CHECK (expense_type IN ('office', 'travel', 'software', 'equipment', 'utilities', 'rent', 'maintenance', 'other')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    payment_date DATE,
    payment_method VARCHAR(50),
    linked_card_id UUID REFERENCES cards(id) ON DELETE SET NULL,
    linked_cash_transaction_id UUID REFERENCES cash_transactions(id) ON DELETE SET NULL,
    file_url TEXT,
    file_name VARCHAR(255),
    notes TEXT,
    user_id UUID,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Bill ID |
| `bill_number` | VARCHAR(100) | UNIQUE | Bill/invoice number |
| `vendor` | VARCHAR(255) | NOT NULL | Vendor name |
| `bill_date` | DATE | NOT NULL | Bill issue date |
| `due_date` | DATE | | Payment due date |
| `amount` | DECIMAL(12, 2) | NOT NULL, CHECK > 0 | Base amount |
| `tax_amount` | DECIMAL(12, 2) | DEFAULT 0, CHECK >= 0 | Tax amount |
| `total_amount` | DECIMAL(12, 2) | GENERATED | amount + tax_amount |
| `description` | TEXT | NOT NULL | Bill description |
| `expense_type` | VARCHAR(50) | CHECK | Expense category |
| `status` | VARCHAR(20) | CHECK | Bill status |
| `payment_date` | DATE | | Actual payment date |
| `payment_method` | VARCHAR(50) | | Payment method |
| `linked_card_id` | UUID | FK → cards | Linked card payment |
| `linked_cash_transaction_id` | UUID | FK → cash_transactions | Linked cash payment |
| `file_url` | TEXT | | Attachment URL |
| `file_name` | VARCHAR(255) | | Attachment filename |
| `notes` | TEXT | | Additional notes |
| `user_id` | UUID | | For RLS/filtering |
| `uploaded_by` | UUID | FK → users, NOT NULL | Uploader |
| `created_at` | TIMESTAMP | DEFAULT NOW | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW | Update time |

#### Notes
- `total_amount` is **computed**: amount + tax_amount
- Indexed on: user_id, vendor, bill_date, due_date, status, expense_type
- Payment can be linked to card or cash transaction
- View available: `monthly_expenses`

---

### Petty Expenses Table

**Purpose**: Small miscellaneous expenses tracking.

```sql
CREATE TABLE petty_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    category VARCHAR(50) NOT NULL,
    vendor VARCHAR(255),
    receipt_number VARCHAR(100),
    notes TEXT,
    recorded_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Expense ID |
| `description` | TEXT | NOT NULL | Description |
| `amount` | DECIMAL(10, 2) | NOT NULL, CHECK > 0 | Amount |
| `expense_date` | DATE | NOT NULL | Expense date |
| `category` | VARCHAR(50) | NOT NULL | Category |
| `vendor` | VARCHAR(255) | | Vendor name |
| `receipt_number` | VARCHAR(100) | | Receipt reference |
| `notes` | TEXT | | Additional notes |
| `recorded_by` | UUID | FK → users, NOT NULL | Recording user |
| `created_at` | TIMESTAMP | DEFAULT NOW | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW | Update time |

#### Notes
- Indexed on: expense_date, category, recorded_by
- Categories: 'snacks', 'stationery', 'transport', 'misc'

---

## 5. Budgets & Planning

### Budgets Table

**Purpose**: Budget allocation and tracking with automatic remaining calculation.

```sql
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    budget_type VARCHAR(20) NOT NULL DEFAULT 'monthly' CHECK (budget_type IN ('monthly', 'quarterly', 'yearly', 'project')),
    category VARCHAR(100) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    allocated_amount DECIMAL(12, 2) NOT NULL CHECK (allocated_amount >= 0),
    spent_amount DECIMAL(12, 2) DEFAULT 0 CHECK (spent_amount >= 0),
    remaining_amount DECIMAL(12, 2) GENERATED ALWAYS AS (allocated_amount - spent_amount) STORED,
    alert_threshold INTEGER DEFAULT 80 CHECK (alert_threshold BETWEEN 0 AND 100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'exceeded', 'cancelled')),
    card_id UUID REFERENCES cards(id) ON DELETE SET NULL,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK (period_end >= period_start)
);
```

#### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Budget ID |
| `name` | VARCHAR(255) | NOT NULL | Budget name |
| `budget_type` | VARCHAR(20) | CHECK | Budget period type |
| `category` | VARCHAR(100) | NOT NULL | Budget category |
| `period_start` | DATE | NOT NULL | Period start date |
| `period_end` | DATE | NOT NULL | Period end date |
| `allocated_amount` | DECIMAL(12, 2) | NOT NULL, CHECK >= 0 | Total allocated |
| `spent_amount` | DECIMAL(12, 2) | DEFAULT 0, CHECK >= 0 | Amount spent |
| `remaining_amount` | DECIMAL(12, 2) | GENERATED | Auto-calculated |
| `alert_threshold` | INTEGER | DEFAULT 80, CHECK 0-100 | Alert % threshold |
| `status` | VARCHAR(20) | CHECK | Budget status |
| `card_id` | UUID | FK → cards | Optional card link |
| `notes` | TEXT | | Additional notes |
| `created_by` | UUID | FK → users | Creator |
| `created_at` | TIMESTAMP | DEFAULT NOW | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW | Update time |

#### Notes
- `remaining_amount` is **computed**: allocated_amount - spent_amount
- Indexed on: category, period_start, period_end, status, card_id
- View available: `budget_utilization`
- Alert when spent >= alert_threshold% of allocated

---

## 6. Reminders

### Reminders Table

**Purpose**: Payment and task reminders with notification support.

```sql
CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    reminder_date DATE NOT NULL,
    reminder_time TIME,
    reminder_type VARCHAR(20) DEFAULT 'custom' CHECK (reminder_type IN ('bill', 'expense', 'salary', 'budget', 'custom')),
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    notification_methods TEXT[] DEFAULT ARRAY['in_app'],
    recipients TEXT[],
    is_active BOOLEAN DEFAULT true,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern VARCHAR(20),
    last_sent_at TIMESTAMP WITH TIME ZONE,
    next_send_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Reminder ID |
| `title` | VARCHAR(255) | NOT NULL | Reminder title |
| `description` | TEXT | | Description |
| `reminder_date` | DATE | NOT NULL | Reminder date |
| `reminder_time` | TIME | | Reminder time |
| `reminder_type` | VARCHAR(20) | CHECK | Type of reminder |
| `related_entity_type` | VARCHAR(50) | | Related entity type |
| `related_entity_id` | UUID | | Related entity ID |
| `notification_methods` | TEXT[] | DEFAULT ['in_app'] | Notification channels |
| `recipients` | TEXT[] | | Recipient emails/phones |
| `is_active` | BOOLEAN | DEFAULT true | Active status |
| `is_recurring` | BOOLEAN | DEFAULT false | Recurring flag |
| `recurrence_pattern` | VARCHAR(20) | | Recurrence pattern |
| `last_sent_at` | TIMESTAMP | | Last notification time |
| `next_send_at` | TIMESTAMP | | Next notification time |
| `created_by` | UUID | FK → users | Creator |
| `created_at` | TIMESTAMP | DEFAULT NOW | Creation time |
| `updated_at` | TIMESTAMP | DEFAULT NOW | Update time |

#### Notes
- Indexed on: reminder_date, reminder_type, is_active, (related_entity_type, related_entity_id)
- Notification methods: ['email', 'sms', 'in_app', 'push']
- Recurrence patterns: 'daily', 'weekly', 'monthly', 'yearly'

---

## 7. Audit & Logging

### Audit Log Table

**Purpose**: Track all significant changes for compliance and security.

```sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Log entry ID |
| `user_id` | UUID | FK → users | User who performed action |
| `action` | VARCHAR(50) | NOT NULL | Action type |
| `entity_type` | VARCHAR(50) | NOT NULL | Affected table/entity |
| `entity_id` | UUID | | Affected record ID |
| `old_values` | JSONB | | Before state (JSON) |
| `new_values` | JSONB | | After state (JSON) |
| `ip_address` | INET | | Client IP address |
| `user_agent` | TEXT | | Client user agent |
| `created_at` | TIMESTAMP | DEFAULT NOW | Log timestamp |

#### Notes
- Indexed on: user_id, (entity_type, entity_id), created_at
- Actions: 'create', 'update', 'delete', 'login', 'logout'
- Cleanup function: `archive_old_audit_logs(days_to_keep)`
- Enable triggers selectively for critical tables

---

## 8. Database Views

### dashboard_summary

Quick overview of key metrics.

```sql
SELECT
    pending_bills_count,
    pending_bills_amount,
    active_cards_count,
    total_card_balance,
    active_employees_count,
    pending_salary_amount,
    monthly_cash_outflow,
    exceeded_budgets_count
FROM dashboard_summary;
```

### monthly_expenses

Monthly expense breakdown by type.

```sql
SELECT month, expense_type, bill_count, total_amount
FROM monthly_expenses
ORDER BY month DESC;
```

### budget_utilization

Budget usage with alert status.

```sql
SELECT
    id, name, category,
    allocated_amount, spent_amount, remaining_amount,
    utilization_percentage, alert_status
FROM budget_utilization
ORDER BY utilization_percentage DESC;
```

### employee_salary_summary

Employee salary overview.

```sql
SELECT
    id, name, email, position, base_salary,
    total_payments, total_paid,
    last_salary_amount, last_salary_month
FROM employee_salary_summary;
```

---

## 9. Functions & Triggers

### update_updated_at_column()

Automatically updates `updated_at` timestamp on row update.

**Applied to:** users, employees, salaries, cards, card_transactions, cash_transactions, bills, petty_expenses, budgets, reminders

### sync_card_is_active()

Keeps `cards.is_active` in sync with `cards.status`.

**Trigger:** `trg_sync_card_is_active` (BEFORE INSERT/UPDATE on cards)

### create_audit_log()

Creates audit log entries for tracked operations.

**Usage:** Apply trigger to critical tables as needed.

### cleanup_expired_sessions()

Removes expired sessions.

**Usage:** `SELECT cleanup_expired_sessions();`

### archive_old_audit_logs(days_to_keep)

Archives/deletes old audit logs.

**Usage:** `SELECT archive_old_audit_logs(365);`

---

## 10. Indexes

All tables have strategic indexes for performance:

- **Users**: email, role, is_active
- **Sessions**: user_id, expires_at, session_token
- **Employees**: email, is_active, department
- **Salaries**: employee_id, month, status
- **Cards**: status, is_active, created_by
- **Card Transactions**: card_id, transaction_date, category, status
- **Cash Transactions**: transaction_date, transaction_type, category
- **Bills**: user_id, vendor, bill_date, due_date, status, expense_type, linked_card_id
- **Petty Expenses**: expense_date, category, recorded_by
- **Budgets**: category, period_start, period_end, status, card_id
- **Reminders**: reminder_date, reminder_type, is_active, (related_entity_type, related_entity_id)
- **Audit Log**: user_id, (entity_type, entity_id), created_at

---

## 11. Entity Relationships

```
users
├─> sessions (user_id)
├─> employees (created_by)
├─> salaries (created_by)
├─> cards (created_by)
├─> card_transactions (created_by)
├─> cash_transactions (recorded_by)
├─> bills (uploaded_by)
├─> petty_expenses (recorded_by)
├─> budgets (created_by)
├─> reminders (created_by)
└─> audit_log (user_id)

employees
└─> salaries (employee_id)

cards
├─> card_transactions (card_id)
├─> bills (linked_card_id)
└─> budgets (card_id)

cash_transactions
└─> bills (linked_cash_transaction_id)
```

---

## 12. Migration Guide

### Initial Setup

1. **Run the schema file:**
   ```bash
   npm run migrate
   ```

2. **Initialize database:**
   ```typescript
   import { initializeDatabase } from './src/db/migrations';
   await initializeDatabase();
   ```

### Reset Database (Development Only)

```typescript
import { resetDatabase } from './src/db/migrations';
await resetDatabase();
```

### Maintenance Tasks

**Clean expired sessions:**
```sql
SELECT cleanup_expired_sessions();
```

**Archive old audit logs:**
```sql
SELECT archive_old_audit_logs(365); -- Keep last 365 days
```

---

## Security Considerations

1. **Card Numbers**: Only last 4 digits stored
2. **Passwords**: Handled by Supabase Auth (not in users table)
3. **Audit Trail**: All critical operations logged
4. **Session Management**: Automatic expiration and cleanup
5. **Row Level Security**: Can be enabled for multi-tenant setup
6. **Cascading Deletes**: Configured to maintain referential integrity

---

## Performance Tips

1. Use prepared statements for repeated queries
2. Leverage computed columns (`net_amount`, `total_amount`, `remaining_amount`)
3. Use views for complex aggregations
4. Regular VACUUM and ANALYZE on PostgreSQL
5. Monitor slow queries and add indexes as needed
6. Archive old audit logs periodically

---

**Last Updated:** December 2025  
**Schema Version:** 1.0  
**Maintainer:** AccountIQ Development Team
