import { z } from 'zod';

// Auth validators
export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

// Bill validators
export const createBillSchema = z.object({
  vendor_name: z.string().min(1, 'Vendor name is required'),
  bill_date: z.string().or(z.date()),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  card_id: z.string().uuid().optional(),
  category: z.string().optional(),
  notes: z.string().optional(),
});

export const updateBillSchema = createBillSchema.partial();

export const billFilterSchema = z.object({
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  category: z.string().optional(),
});

// Card validators
export const createCardSchema = z.object({
  card_number: z.string().min(10, 'Invalid card number'),
  card_holder_name: z.string().min(1, 'Card holder name is required'),
  card_type: z.enum(['credit', 'debit']),
  issuer: z.string().optional(),
  balance: z.number().default(0),
  credit_limit: z.number().optional(),
  expiry_date: z.string().or(z.date()).optional(),
});

export const updateCardSchema = createCardSchema.partial();

// Cash transaction validators
export const createCashTransactionSchema = z.object({
  transaction_date: z.string().or(z.date()),
  type: z.enum(['income', 'expense']),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional(),
  category: z.string().optional(),
  notes: z.string().optional(),
});

export const updateCashTransactionSchema = createCashTransactionSchema.partial();

// Salary validators
export const createSalarySchema = z.object({
  employee_id: z.string().uuid('Invalid employee ID'),
  salary_month: z.string().or(z.date()),
  base_salary: z.number().positive('Base salary must be positive'),
  allowances: z.number().default(0),
  deductions: z.number().default(0),
  net_salary: z.number().optional(),
  payment_status: z.enum(['pending', 'paid', 'failed']).default('pending'),
  payment_date: z.string().or(z.date()).optional(),
  notes: z.string().optional(),
});

export const updateSalarySchema = createSalarySchema.partial();

// Petty expense validators
export const createPettyExpenseSchema = z.object({
  expense_date: z.string().or(z.date()),
  amount: z.number().positive('Amount must be positive'),
  description: z.string(),
  category: z.string().optional(),
  is_approved: z.boolean().default(false),
});

export const updatePettyExpenseSchema = createPettyExpenseSchema.partial();

// Budget validators
export const createBudgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  budget_limit: z.number().positive('Budget limit must be positive'),
  period: z.enum(['monthly', 'quarterly', 'annual']),
  fiscal_month: z.string().or(z.date()),
  alert_threshold: z.number().min(0).max(1).default(0.8),
});

export const updateBudgetSchema = createBudgetSchema.partial();

// Reminder validators
export const createReminderSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  reminder_date: z.string().or(z.date()),
  reminder_type: z.enum(['bill', 'expense', 'salary', 'budget']).optional(),
  related_id: z.string().uuid().optional(),
});

export const updateReminderSchema = createReminderSchema.partial();

// Employee validators
export const createEmployeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional(),
  phone: z.string().optional(),
  position: z.string().optional(),
  salary_amount: z.number().positive().optional(),
  start_date: z.string().or(z.date()),
  end_date: z.string().or(z.date()).optional(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

// Export types
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type CreateBillInput = z.infer<typeof createBillSchema>;
export type UpdateBillInput = z.infer<typeof updateBillSchema>;
export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
export type CreateCashTransactionInput = z.infer<typeof createCashTransactionSchema>;
export type UpdateCashTransactionInput = z.infer<typeof updateCashTransactionSchema>;
export type CreateSalaryInput = z.infer<typeof createSalarySchema>;
export type UpdateSalaryInput = z.infer<typeof updateSalarySchema>;
export type CreatePettyExpenseInput = z.infer<typeof createPettyExpenseSchema>;
export type UpdatePettyExpenseInput = z.infer<typeof updatePettyExpenseSchema>;
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
export type CreateReminderInput = z.infer<typeof createReminderSchema>;
export type UpdateReminderInput = z.infer<typeof updateReminderSchema>;
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
