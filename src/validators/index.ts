import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const createBillSchema = z.object({
  billDate: z.string().transform(str => new Date(str)),
  vendor: z.string().min(1, 'Vendor is required'),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().optional(),
  cardId: z.string().uuid().optional(),
});

export const createCardSchema = z.object({
  cardNumber: z.string().regex(/^\d{13,19}$/, 'Invalid card number'),
  cardHolder: z.string().min(1),
  cardType: z.enum(['credit', 'debit']),
  bank: z.string().min(1),
  expiryDate: z.string().transform(str => new Date(str)),
  limit: z.number().optional(),
});

export const createSalarySchema = z.object({
  employeeId: z.string().uuid(),
  month: z.string().transform(str => new Date(str)),
  baseSalary: z.number().positive(),
  allowances: z.number().default(0),
  deductions: z.number().default(0),
});

export const createBudgetSchema = z.object({
  categoryId: z.string().optional(),
  categoryName: z.string().min(1),
  limit: z.number().positive(),
  period: z.enum(['monthly', 'quarterly', 'annual']),
  month: z.string().optional(),
});

export const createReminderSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  reminderDate: z.string().transform(str => new Date(str)),
  reminderTime: z.string(),
  type: z.enum(['bill', 'expense', 'salary', 'custom']),
  notificationMethods: z.array(z.enum(['email', 'ui'])).default(['ui']),
  recipients: z.array(z.string().email()).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateBillInput = z.infer<typeof createBillSchema>;
export type CreateCardInput = z.infer<typeof createCardSchema>;
export type CreateSalaryInput = z.infer<typeof createSalarySchema>;
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type CreateReminderInput = z.infer<typeof createReminderSchema>;
