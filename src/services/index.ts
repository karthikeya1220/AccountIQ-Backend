/**
 * Backend service implementations
 */
import { query } from '../db/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, LoginRequest, LoginResponse, UserRole } from '../types';

export class AuthService {
  static async login(email: string, password: string): Promise<LoginResponse> {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      (process.env.JWT_SECRET || 'secret') as string,
      { expiresIn: (process.env.JWT_EXPIRY || '7d') as string } as any
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      (process.env.REFRESH_TOKEN_SECRET || 'refresh-secret') as string,
      { expiresIn: (process.env.REFRESH_TOKEN_EXPIRY || '30d') as string } as any
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
      token,
      refreshToken,
    };
  }

  static async createUser(data: any): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const result = await query(
      `INSERT INTO users (email, password, first_name, last_name, role) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [data.email, hashedPassword, data.firstName, data.lastName, data.role || UserRole.USER]
    );

    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  static async getUserById(id: string): Promise<User | null> {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    const user = result.rows[0];

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      password: user.password,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }
}

export class BillService {
  static async createBill(data: any, userId: string) {
    const result = await query(
      `INSERT INTO bills (bill_date, vendor, amount, description, card_id, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [data.billDate, data.vendor, data.amount, data.description, data.cardId, userId]
    );

    return result.rows[0];
  }

  static async getBills(filters?: any) {
    let query_str = 'SELECT * FROM bills WHERE 1=1';
    const params: any[] = [];

    if (filters?.startDate) {
      query_str += ` AND bill_date >= $${params.length + 1}`;
      params.push(filters.startDate);
    }

    if (filters?.endDate) {
      query_str += ` AND bill_date <= $${params.length + 1}`;
      params.push(filters.endDate);
    }

    query_str += ' ORDER BY bill_date DESC';

    const result = await query(query_str, params);
    return result.rows;
  }

  static async deleteBill(id: string) {
    await query('DELETE FROM bills WHERE id = $1', [id]);
  }
}

export class CardService {
  static async createCard(data: any) {
    const result = await query(
      `INSERT INTO cards (card_number, card_holder, card_type, bank, expiry_date, card_limit) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [data.cardNumber, data.cardHolder, data.cardType, data.bank, data.expiryDate, data.limit]
    );

    return result.rows[0];
  }

  static async getCards() {
    const result = await query('SELECT * FROM cards WHERE is_active = true');
    return result.rows;
  }

  static async getCardById(id: string) {
    const result = await query('SELECT * FROM cards WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async updateCard(id: string, data: any) {
    const result = await query(
      `UPDATE cards SET card_holder = $1, bank = $2, card_limit = $3, updated_at = NOW() 
       WHERE id = $4 RETURNING *`,
      [data.cardHolder, data.bank, data.limit, id]
    );

    return result.rows[0];
  }
}

export class PettyExpenseService {
  static async createExpense(data: any, userId: string) {
    const result = await query(
      `INSERT INTO petty_expenses (description, amount, expense_date, created_by) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [data.description, data.amount, data.expenseDate, userId]
    );

    return result.rows[0];
  }

  static async getMonthlyExpenses(month: Date, userId?: string) {
    const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
    const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    let query_str = `SELECT * FROM petty_expenses 
                      WHERE expense_date >= $1 AND expense_date <= $2`;
    const params: any[] = [startDate, endDate];

    if (userId) {
      query_str += ` AND created_by = $3`;
      params.push(userId);
    }

    const result = await query(query_str, params);
    return result.rows;
  }
}

export class BudgetService {
  static async createBudget(data: any) {
    const result = await query(
      `INSERT INTO budgets (category_name, budget_limit, period, month) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [data.categoryName, data.limit, data.period, data.month]
    );

    return result.rows[0];
  }

  static async getBudgets(period?: string) {
    let query_str = 'SELECT * FROM budgets WHERE is_active = true';
    const params: any[] = [];

    if (period) {
      query_str += ` AND period = $1`;
      params.push(period);
    }

    const result = await query(query_str, params);
    return result.rows;
  }

  static async checkBudgetAlert(categoryId: string): Promise<{ exceeded: boolean; percentage: number }> {
    const result = await query('SELECT * FROM budgets WHERE id = $1', [categoryId]);
    const budget = result.rows[0];

    if (!budget) {
      return { exceeded: false, percentage: 0 };
    }

    const percentage = (budget.spent / budget.budget_limit) * 100;
    return {
      exceeded: percentage > 100,
      percentage,
    };
  }
}
