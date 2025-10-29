// User roles
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

// Expense categories
export enum ExpenseCategory {
  BILL = 'bill',
  CARD = 'card',
  CASH = 'cash',
  SALARY = 'salary',
  PETTY = 'petty',
}

// User
export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  departmentId?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Employee
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  designation: string;
  departmentId?: string;
  baseSalary: number;
  joinDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Bill
export interface Bill {
  id: string;
  billDate: Date;
  vendor: string;
  amount: number;
  description: string;
  categoryId?: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'pdf';
  cardId?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Card
export interface Card {
  id: string;
  cardNumber: string;
  cardHolder: string;
  cardType: 'credit' | 'debit';
  bank: string;
  expiryDate: Date;
  limit?: number;
  balance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Cash Transaction
export interface CashTransaction {
  id: string;
  transactionDate: Date;
  description: string;
  amount: number;
  transactionType: 'income' | 'expense';
  categoryId?: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Salary
export interface Salary {
  id: string;
  employeeId: string;
  month: Date;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'pending' | 'approved' | 'paid';
  paidDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Petty Expense
export interface PettyExpense {
  id: string;
  description: string;
  amount: number;
  categoryId?: string;
  expenseDate: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Reminder
export interface Reminder {
  id: string;
  title: string;
  description?: string;
  reminderDate: Date;
  reminderTime: string;
  type: 'bill' | 'expense' | 'salary' | 'custom';
  relatedId?: string;
  notificationMethods: ('email' | 'ui')[];
  recipients: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Budget
export interface Budget {
  id: string;
  categoryId: string;
  categoryName: string;
  limit: number;
  spent: number;
  period: 'monthly' | 'quarterly' | 'annual';
  month?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Session
export interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken?: string;
  ipAddress: string;
  userAgent: string;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: Omit<User, 'password'>;
  token: string;
  refreshToken: string;
}

export interface AuthPayload {
  userId: string;
  email: string;
  role: UserRole;
}
