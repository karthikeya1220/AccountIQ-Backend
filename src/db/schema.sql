-- ============================================================================
-- AccountIQ Database Schema
-- PostgreSQL Database Schema for Accounting Management System
-- Version: 1.0
-- Created: December 2025
-- ============================================================================

-- Enable UUID extension for generating unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for additional encryption functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- USERS & AUTHENTICATION
-- ============================================================================

-- Users table: Core authentication and user management
CREATE TABLE IF NOT EXISTS users (
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

-- Sessions table: Track user sessions for security and auditing
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(500) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- EMPLOYEES & HUMAN RESOURCES
-- ============================================================================

-- Employees table: Employee records for HR and payroll
CREATE TABLE IF NOT EXISTS employees (
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

-- Salaries table: Monthly salary payment records
CREATE TABLE IF NOT EXISTS salaries (
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

-- ============================================================================
-- FINANCIAL ACCOUNTS
-- ============================================================================

-- Cards table: Company credit/debit cards
CREATE TABLE IF NOT EXISTS cards (
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

-- Card transactions table: Individual card transaction records
CREATE TABLE IF NOT EXISTS card_transactions (
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

-- Cash transactions table: Cash inflows and outflows
CREATE TABLE IF NOT EXISTS cash_transactions (
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

-- ============================================================================
-- BILLS & EXPENSES
-- ============================================================================

-- Bills table: Invoice and bill tracking
CREATE TABLE IF NOT EXISTS bills (
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

-- Petty expenses table: Small miscellaneous expenses
CREATE TABLE IF NOT EXISTS petty_expenses (
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

-- ============================================================================
-- BUDGETS & PLANNING
-- ============================================================================

-- Budgets table: Budget allocation and tracking
CREATE TABLE IF NOT EXISTS budgets (
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

-- ============================================================================
-- REMINDERS & NOTIFICATIONS
-- ============================================================================

-- Reminders table: Payment and task reminders
CREATE TABLE IF NOT EXISTS reminders (
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

-- ============================================================================
-- AUDIT & LOGGING
-- ============================================================================

-- Audit log table: Track all significant changes for compliance
CREATE TABLE IF NOT EXISTS audit_log (
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

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Sessions
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_session_token ON sessions(session_token);

-- Employees
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_is_active ON employees(is_active);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);

-- Salaries
CREATE INDEX IF NOT EXISTS idx_salaries_employee_id ON salaries(employee_id);
CREATE INDEX IF NOT EXISTS idx_salaries_month ON salaries(month);
CREATE INDEX IF NOT EXISTS idx_salaries_status ON salaries(status);

-- Cards
CREATE INDEX IF NOT EXISTS idx_cards_status ON cards(status);
CREATE INDEX IF NOT EXISTS idx_cards_is_active ON cards(is_active);
CREATE INDEX IF NOT EXISTS idx_cards_created_by ON cards(created_by);

-- Card Transactions
CREATE INDEX IF NOT EXISTS idx_card_transactions_card_id ON card_transactions(card_id);
CREATE INDEX IF NOT EXISTS idx_card_transactions_date ON card_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_card_transactions_category ON card_transactions(category);
CREATE INDEX IF NOT EXISTS idx_card_transactions_status ON card_transactions(status);

-- Cash Transactions
CREATE INDEX IF NOT EXISTS idx_cash_transactions_date ON cash_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_cash_transactions_type ON cash_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_cash_transactions_category ON cash_transactions(category);

-- Bills
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_vendor ON bills(vendor);
CREATE INDEX IF NOT EXISTS idx_bills_bill_date ON bills(bill_date);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON bills(due_date);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_expense_type ON bills(expense_type);
CREATE INDEX IF NOT EXISTS idx_bills_linked_card_id ON bills(linked_card_id);

-- Petty Expenses
CREATE INDEX IF NOT EXISTS idx_petty_expenses_date ON petty_expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_petty_expenses_category ON petty_expenses(category);
CREATE INDEX IF NOT EXISTS idx_petty_expenses_recorded_by ON petty_expenses(recorded_by);

-- Budgets
CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category);
CREATE INDEX IF NOT EXISTS idx_budgets_period_start ON budgets(period_start);
CREATE INDEX IF NOT EXISTS idx_budgets_period_end ON budgets(period_end);
CREATE INDEX IF NOT EXISTS idx_budgets_status ON budgets(status);
CREATE INDEX IF NOT EXISTS idx_budgets_card_id ON budgets(card_id);

-- Reminders
CREATE INDEX IF NOT EXISTS idx_reminders_date ON reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_reminders_type ON reminders(reminder_type);
CREATE INDEX IF NOT EXISTS idx_reminders_is_active ON reminders(is_active);
CREATE INDEX IF NOT EXISTS idx_reminders_related_entity ON reminders(related_entity_type, related_entity_id);

-- Audit Log
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function: Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_salaries_updated_at ON salaries;
CREATE TRIGGER update_salaries_updated_at BEFORE UPDATE ON salaries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cards_updated_at ON cards;
CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_card_transactions_updated_at ON card_transactions;
CREATE TRIGGER update_card_transactions_updated_at BEFORE UPDATE ON card_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cash_transactions_updated_at ON cash_transactions;
CREATE TRIGGER update_cash_transactions_updated_at BEFORE UPDATE ON cash_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bills_updated_at ON bills;
CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON bills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_petty_expenses_updated_at ON petty_expenses;
CREATE TRIGGER update_petty_expenses_updated_at BEFORE UPDATE ON petty_expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_budgets_updated_at ON budgets;
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reminders_updated_at ON reminders;
CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to keep card is_active in sync with status
CREATE OR REPLACE FUNCTION sync_card_is_active()
RETURNS TRIGGER AS $$
BEGIN
    NEW.is_active := (NEW.status = 'active');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_card_is_active ON cards;
CREATE TRIGGER trg_sync_card_is_active
    BEFORE INSERT OR UPDATE OF status ON cards
    FOR EACH ROW
    EXECUTE FUNCTION sync_card_is_active();

-- Function: Create audit log entry
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (
        user_id,
        action,
        entity_type,
        entity_id,
        old_values,
        new_values
    ) VALUES (
        COALESCE(current_setting('app.current_user_id', true)::uuid, NULL),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Dashboard summary metrics
CREATE OR REPLACE VIEW dashboard_summary AS
SELECT
    (SELECT COUNT(*) FROM bills WHERE status = 'pending') as pending_bills_count,
    (SELECT COALESCE(SUM(amount), 0) FROM bills WHERE status = 'pending') as pending_bills_amount,
    (SELECT COUNT(*) FROM cards WHERE status = 'active') as active_cards_count,
    (SELECT COALESCE(SUM(balance), 0) FROM cards WHERE status = 'active') as total_card_balance,
    (SELECT COUNT(*) FROM employees WHERE is_active = true) as active_employees_count,
    (SELECT COALESCE(SUM(net_amount), 0) FROM salaries 
     WHERE month = DATE_TRUNC('month', CURRENT_DATE) AND status = 'pending') as pending_salary_amount,
    (SELECT COALESCE(SUM(amount), 0) FROM cash_transactions 
     WHERE transaction_type = 'outflow' 
     AND transaction_date >= DATE_TRUNC('month', CURRENT_DATE)) as monthly_cash_outflow,
    (SELECT COUNT(*) FROM budgets WHERE status = 'exceeded') as exceeded_budgets_count;

-- View: Monthly expense summary
CREATE OR REPLACE VIEW monthly_expenses AS
SELECT
    DATE_TRUNC('month', bill_date) as month,
    expense_type,
    COUNT(*) as bill_count,
    SUM(total_amount) as total_amount
FROM bills
WHERE status IN ('paid', 'pending')
GROUP BY DATE_TRUNC('month', bill_date), expense_type
ORDER BY month DESC, expense_type;

-- View: Budget utilization
CREATE OR REPLACE VIEW budget_utilization AS
SELECT
    id,
    name,
    category,
    allocated_amount,
    spent_amount,
    remaining_amount,
    CASE
        WHEN allocated_amount > 0 THEN ROUND((spent_amount / allocated_amount * 100)::numeric, 2)
        ELSE 0
    END as utilization_percentage,
    CASE
        WHEN allocated_amount > 0 AND (spent_amount / allocated_amount * 100) > 100 THEN 'exceeded'
        WHEN allocated_amount > 0 AND (spent_amount / allocated_amount * 100) > alert_threshold THEN 'warning'
        ELSE 'ok'
    END as alert_status,
    period_start,
    period_end,
    status
FROM budgets
ORDER BY utilization_percentage DESC;

-- View: Employee salary summary
CREATE OR REPLACE VIEW employee_salary_summary AS
SELECT
    e.id,
    e.name,
    e.email,
    e.position,
    e.base_salary,
    COUNT(s.id) as total_payments,
    COALESCE(SUM(s.net_amount), 0) as total_paid,
    (SELECT net_amount FROM salaries 
     WHERE employee_id = e.id 
     ORDER BY month DESC LIMIT 1) as last_salary_amount,
    (SELECT month FROM salaries 
     WHERE employee_id = e.id 
     ORDER BY month DESC LIMIT 1) as last_salary_month
FROM employees e
LEFT JOIN salaries s ON e.id = s.employee_id AND s.status = 'paid'
WHERE e.is_active = true
GROUP BY e.id, e.name, e.email, e.position, e.base_salary;

-- ============================================================================
-- DATABASE MAINTENANCE FUNCTIONS
-- ============================================================================

-- Function to clean up old sessions (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM sessions WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Function to archive old audit logs (run periodically)
CREATE OR REPLACE FUNCTION archive_old_audit_logs(days_to_keep INTEGER DEFAULT 365)
RETURNS void AS $$
BEGIN
    -- In production, move to archive table instead of deleting
    DELETE FROM audit_log WHERE created_at < CURRENT_TIMESTAMP - (days_to_keep || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TABLE COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE users IS 'Core user accounts for authentication and authorization';
COMMENT ON TABLE employees IS 'Employee records for HR and payroll management';
COMMENT ON TABLE salaries IS 'Monthly salary payment records linked to employees';
COMMENT ON TABLE cards IS 'Company credit and debit card records';
COMMENT ON TABLE card_transactions IS 'Individual transactions made with company cards';
COMMENT ON TABLE cash_transactions IS 'Cash inflows and outflows tracking';
COMMENT ON TABLE bills IS 'Vendor bills and invoices for payment tracking';
COMMENT ON TABLE petty_expenses IS 'Small miscellaneous expense records';
COMMENT ON TABLE budgets IS 'Budget allocation and spending tracking';
COMMENT ON TABLE reminders IS 'Payment and task reminders with notification support';
COMMENT ON TABLE sessions IS 'User session management for security';
COMMENT ON TABLE audit_log IS 'Audit trail for compliance and security monitoring';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
