// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

// User roles
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

// Card types
export enum CardType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

// Card status
export enum CardStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
  EXPIRED = 'expired',
}

// Transaction types
export enum TransactionType {
  DEBIT = 'debit',
  CREDIT = 'credit',
  REFUND = 'refund',
}

// Card transaction status
export enum CardTransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

// Cash transaction types
export enum CashTransactionType {
  INFLOW = 'inflow',
  OUTFLOW = 'outflow',
}

// Bill status
export enum BillStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

// Expense types
export enum ExpenseType {
  OFFICE = 'office',
  TRAVEL = 'travel',
  SOFTWARE = 'software',
  EQUIPMENT = 'equipment',
  UTILITIES = 'utilities',
  RENT = 'rent',
  MAINTENANCE = 'maintenance',
  OTHER = 'other',
}

// Salary status
export enum SalaryStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

// Budget types
export enum BudgetType {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  PROJECT = 'project',
}

// Budget status enum
export enum BudgetStatusEnum {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  EXCEEDED = 'exceeded',
  CANCELLED = 'cancelled',
}

// Reminder types
export enum ReminderType {
  BILL = 'bill',
  EXPENSE = 'expense',
  SALARY = 'salary',
  BUDGET = 'budget',
  CUSTOM = 'custom',
}

// Audit actions
export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
}

// ============================================================================
// CORE INTERFACES
// ============================================================================

// User
export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  isActive: boolean;
  phone: string | null;
  department: string | null;
  designation: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Session
export interface Session {
  id: string;
  userId: string;
  sessionToken: string;
  ipAddress: string | null;
  userAgent: string | null;
  expiresAt: Date;
  createdAt: Date;
  lastActivity: Date;
}

// Employee
export interface Employee {
  id: string;
  name: string;
  email: string;
  position: string | null;
  department: string | null;
  joinDate: Date;
  baseSalary: number;
  isActive: boolean;
  phone: string | null;
  address: string | null;
  emergencyContact: string | null;
  emergencyPhone: string | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Salary
export interface Salary {
  id: string;
  employeeId: string;
  month: Date;
  baseAmount: number;
  bonuses: number;
  deductions: number;
  netAmount: number; // Computed field
  status: SalaryStatus;
  paidDate: Date | null;
  paymentMethod: string | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Card
export interface Card {
  id: string;
  cardName: string;
  cardNumber: string; // Last 4 digits only
  holderName: string;
  cardType: CardType;
  expiryDate: string; // Format: MM/YYYY
  balance: number;
  creditLimit: number | null;
  status: CardStatus;
  isActive: boolean;
  bankName: string | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Card Transaction
export interface CardTransaction {
  id: string;
  cardId: string;
  amount: number;
  transactionType: TransactionType;
  description: string;
  transactionDate: Date;
  category: string;
  vendor: string | null;
  status: CardTransactionStatus;
  receiptUrl: string | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Cash Transaction
export interface CashTransaction {
  id: string;
  transactionType: CashTransactionType;
  amount: number;
  description: string;
  transactionDate: Date;
  category: string;
  vendor: string | null;
  paymentMethod: string | null;
  receiptNumber: string | null;
  notes: string | null;
  recordedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Bill
export interface Bill {
  id: string;
  billNumber: string | null;
  vendor: string;
  billDate: Date;
  dueDate: Date | null;
  amount: number;
  taxAmount: number;
  totalAmount: number; // Computed field
  description: string;
  expenseType: ExpenseType;
  status: BillStatus;
  paymentDate: Date | null;
  paymentMethod: string | null;
  linkedCardId: string | null;
  linkedCashTransactionId: string | null;
  fileUrl: string | null;
  fileName: string | null;
  notes: string | null;
  userId: string | null; // For Supabase RLS
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Petty Expense
export interface PettyExpense {
  id: string;
  description: string;
  amount: number;
  expenseDate: Date;
  category: string;
  vendor: string | null;
  receiptNumber: string | null;
  notes: string | null;
  recordedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Budget
export interface Budget {
  id: string;
  name: string;
  budgetType: BudgetType;
  category: string;
  periodStart: Date;
  periodEnd: Date;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number; // Computed field
  alertThreshold: number; // Percentage (0-100)
  status: BudgetStatusEnum;
  cardId: string | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Reminder
export interface Reminder {
  id: string;
  title: string;
  description: string | null;
  reminderDate: Date;
  reminderTime: string | null;
  reminderType: ReminderType;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  notificationMethods: string[];
  recipients: string[];
  isActive: boolean;
  isRecurring: boolean;
  recurrencePattern: string | null;
  lastSentAt: Date | null;
  nextSendAt: Date | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Audit Log
export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  oldValues: Record<string, any> | null;
  newValues: Record<string, any> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
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
  id: string;
  email: string;
  role: UserRole | string;
}

// Dashboard Types

export interface DashboardKPIs {
  totalExpenses: number;
  totalIncome: number;
  availableBalance: number;
  budgetUtilization: number;
  cardsInUse: number;
  pendingBills: number;
  cardBalances: number;
  cashOnHand: number;
  totalPayroll: number;
  activeEmployees: number;
}

export interface MonthlyTrendPoint {
  month: string; // YYYY-MM format
  expenses: number;
  budget: number;
  income: number;
}

export interface ExpenseByCategoryPoint {
  category: string;
  amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

export interface RecentTransaction {
  id: string;
  description: string;
  amount: number;
  date: Date;
  status: 'approved' | 'pending' | 'rejected';
  category: string;
  type: 'expense' | 'income';
  createdBy: string;
}

export interface BudgetAlert {
  id: string;
  category: string;
  current: number;
  limit: number;
  percentage: number;
  severity: 'low' | 'medium' | 'high';
  message: string;
}

export interface DashboardAlerts {
  budgetAlerts: BudgetAlert[];
  pendingApprovals: number;
  overdueBills: number;
  lowCashBalance: boolean;
}

export interface CardSummary {
  totalCards: number;
  activeCards: number;
  totalLimit: number;
  totalUsed: number;
  available: number;
}

export interface BudgetStatusSummary {
  onTrack: number;
  warning: number;
  exceeded: number;
  total: number;
}

export interface DashboardPeriod {
  startDate: string;
  endDate: string;
  label: string;
}

export interface DashboardMetadata {
  dataFreshness: 'real-time' | 'cached' | 'stale';
  cacheUntil: string;
  cacheDuration: number;
  permissions: {
    canEdit: boolean;
    canExport: boolean;
    canDelete: boolean;
  };
  userRole: UserRole;
}

export interface DashboardSummaryData {
  timestamp: string;
  period: DashboardPeriod;
  kpis: DashboardKPIs;
  monthlyTrend: MonthlyTrendPoint[];
  expensesByCategory: ExpenseByCategoryPoint[];
  recentTransactions: RecentTransaction[];
  alerts: DashboardAlerts;
  cards: CardSummary;
  budgetStatus: BudgetStatusSummary;
  metadata: DashboardMetadata;
}

export interface DashboardSummaryResponse {
  success: true;
  data: DashboardSummaryData;
  pagination: null;
}
