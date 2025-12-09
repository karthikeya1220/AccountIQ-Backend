import { z } from 'zod';

// ============================================================================
// AUTH VALIDATORS
// ============================================================================

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
});

// ============================================================================
// USER VALIDATORS
// ============================================================================

export const updateUserSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  designation: z.string().optional(),
  isActive: z.boolean().optional(),
});

// ============================================================================
// EMPLOYEE VALIDATORS
// ============================================================================

export const createEmployeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  position: z.string().optional(),
  department: z.string().optional(),
  joinDate: z.string().or(z.date()),
  baseSalary: z.number().positive('Base salary must be positive'),
  phone: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

// ============================================================================
// SALARY VALIDATORS
// ============================================================================

export const createSalarySchema = z.object({
  employeeId: z.string().uuid('Invalid employee ID'),
  month: z.string().or(z.date()),
  baseAmount: z.number().positive('Base amount must be positive'),
  bonuses: z.number().min(0).default(0),
  deductions: z.number().min(0).default(0),
  status: z.enum(['pending', 'paid', 'cancelled']).default('pending'),
  paidDate: z.string().or(z.date()).optional(),
  paymentMethod: z.string().optional(),
  notes: z.string().optional(),
});

export const updateSalarySchema = createSalarySchema.partial();

// ============================================================================
// CARD VALIDATORS
// ============================================================================

export const createCardSchema = z.object({
  cardName: z.string().min(1, 'Card name is required'),
  cardNumber: z.string().length(4, 'Last 4 digits required'),
  holderName: z.string().min(1, 'Card holder name is required'),
  cardType: z.enum(['credit', 'debit']),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{4}$/, 'Invalid expiry date format (MM/YYYY)'),
  balance: z.number().min(0).default(0),
  creditLimit: z.number().min(0).optional(),
  status: z.enum(['active', 'inactive', 'blocked', 'expired']).default('active'),
  bankName: z.string().optional(),
  notes: z.string().optional(),
});

export const updateCardSchema = createCardSchema.partial();

// ============================================================================
// CARD TRANSACTION VALIDATORS
// ============================================================================

export const createCardTransactionSchema = z.object({
  cardId: z.string().uuid('Invalid card ID'),
  amount: z.number().positive('Amount must be positive'),
  transactionType: z.enum(['debit', 'credit', 'refund']).default('debit'),
  description: z.string().min(1, 'Description is required'),
  transactionDate: z.string().or(z.date()).optional(),
  category: z.string().min(1, 'Category is required'),
  vendor: z.string().optional(),
  status: z.enum(['pending', 'completed', 'failed', 'cancelled']).default('completed'),
  receiptUrl: z.string().url().optional(),
  notes: z.string().optional(),
});

export const updateCardTransactionSchema = createCardTransactionSchema.partial();

// ============================================================================
// CASH TRANSACTION VALIDATORS
// ============================================================================

export const createCashTransactionSchema = z.object({
  transactionType: z.enum(['inflow', 'outflow']),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  transactionDate: z.string().or(z.date()),
  category: z.string().min(1, 'Category is required'),
  vendor: z.string().optional(),
  paymentMethod: z.string().optional(),
  receiptNumber: z.string().optional(),
  notes: z.string().optional(),
});

export const updateCashTransactionSchema = createCashTransactionSchema.partial();

// ============================================================================
// BILL VALIDATORS
// ============================================================================

export const createBillSchema = z.object({
  billNumber: z.string().optional(),
  vendor: z.string().min(1, 'Vendor name is required'),
  billDate: z.string().or(z.date()),
  dueDate: z.string().or(z.date()).optional(),
  amount: z.number().positive('Amount must be positive'),
  taxAmount: z.number().min(0).default(0),
  description: z.string().min(1, 'Description is required'),
  expenseType: z.enum(['office', 'travel', 'software', 'equipment', 'utilities', 'rent', 'maintenance', 'other']).default('other'),
  status: z.enum(['pending', 'paid', 'overdue', 'cancelled']).default('pending'),
  paymentDate: z.string().or(z.date()).optional(),
  paymentMethod: z.string().optional(),
  linkedCardId: z.string().uuid().optional(),
  linkedCashTransactionId: z.string().uuid().optional(),
  fileUrl: z.string().url().optional(),
  fileName: z.string().optional(),
  notes: z.string().optional(),
});

export const updateBillSchema = createBillSchema.partial();

export const billFilterSchema = z.object({
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional(),
  status: z.enum(['pending', 'paid', 'overdue', 'cancelled']).optional(),
  expenseType: z.enum(['office', 'travel', 'software', 'equipment', 'utilities', 'rent', 'maintenance', 'other']).optional(),
  vendor: z.string().optional(),
});

// ============================================================================
// PETTY EXPENSE VALIDATORS
// ============================================================================

export const createPettyExpenseSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Amount must be positive'),
  expenseDate: z.string().or(z.date()),
  category: z.string().min(1, 'Category is required'),
  vendor: z.string().optional(),
  receiptNumber: z.string().optional(),
  notes: z.string().optional(),
});

export const updatePettyExpenseSchema = createPettyExpenseSchema.partial();

// ============================================================================
// BUDGET VALIDATORS
// ============================================================================

export const createBudgetSchema = z.object({
  name: z.string().min(1, 'Budget name is required'),
  budgetType: z.enum(['monthly', 'quarterly', 'yearly', 'project']).default('monthly'),
  category: z.string().min(1, 'Category is required'),
  periodStart: z.string().or(z.date()),
  periodEnd: z.string().or(z.date()),
  allocatedAmount: z.number().positive('Allocated amount must be positive'),
  spentAmount: z.number().min(0).default(0),
  alertThreshold: z.number().min(0).max(100).default(80),
  status: z.enum(['active', 'completed', 'exceeded', 'cancelled']).default('active'),
  cardId: z.string().uuid().optional(),
  notes: z.string().optional(),
});

export const updateBudgetSchema = createBudgetSchema.partial();

// ============================================================================
// REMINDER VALIDATORS
// ============================================================================

export const createReminderSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  reminderDate: z.string().or(z.date()),
  reminderTime: z.string().optional(),
  reminderType: z.enum(['bill', 'expense', 'salary', 'budget', 'custom']).default('custom'),
  relatedEntityType: z.string().optional(),
  relatedEntityId: z.string().uuid().optional(),
  notificationMethods: z.array(z.string()).default(['in_app']),
  recipients: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  isRecurring: z.boolean().default(false),
  recurrencePattern: z.string().optional(),
});

export const updateReminderSchema = createReminderSchema.partial();

// ============================================================================
// PAGINATION & FILTER VALIDATORS
// ============================================================================

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

export type CreateSalaryInput = z.infer<typeof createSalarySchema>;
export type UpdateSalaryInput = z.infer<typeof updateSalarySchema>;

export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;

export type CreateCardTransactionInput = z.infer<typeof createCardTransactionSchema>;
export type UpdateCardTransactionInput = z.infer<typeof updateCardTransactionSchema>;

export type CreateCashTransactionInput = z.infer<typeof createCashTransactionSchema>;
export type UpdateCashTransactionInput = z.infer<typeof updateCashTransactionSchema>;

export type CreateBillInput = z.infer<typeof createBillSchema>;
export type UpdateBillInput = z.infer<typeof updateBillSchema>;
export type BillFilterInput = z.infer<typeof billFilterSchema>;

export type CreatePettyExpenseInput = z.infer<typeof createPettyExpenseSchema>;
export type UpdatePettyExpenseInput = z.infer<typeof updatePettyExpenseSchema>;

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;

export type CreateReminderInput = z.infer<typeof createReminderSchema>;
export type UpdateReminderInput = z.infer<typeof updateReminderSchema>;

export type PaginationInput = z.infer<typeof paginationSchema>;

