import { supabaseAdmin } from '../db/supabase';

export interface Salary {
  id: string;
  employee_id: string;
  month: string;
  base_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  status: 'pending' | 'paid';
  paid_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSalaryInput {
  employee_id: string;
  month: string;
  base_salary: number;
  allowances?: number;
  deductions?: number;
}

export interface UpdateSalaryInput {
  employee_id?: string;
  month?: string;
  base_salary?: number;
  allowances?: number;
  deductions?: number;
  status?: 'pending' | 'paid';
  paid_date?: string;
}

export class SalaryService {
  // Calculate net salary
  private calculateNetSalary(
    baseSalary: number,
    allowances: number = 0,
    deductions: number = 0
  ): number {
    return baseSalary + allowances - deductions;
  }

  // Get all salaries with optional filters
  async getAllSalaries(filters: {
    employeeId?: string;
    month?: string;
    status?: string;
  } = {}): Promise<any[]> {
    let query = supabaseAdmin
      .from('salaries')
      .select('*, employee:employees(id, first_name, last_name, email, designation, base_salary)')
      .order('month', { ascending: false });

    if (filters.employeeId) {
      query = query.eq('employee_id', filters.employeeId);
    }
    if (filters.month) {
      query = query.eq('month', filters.month);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch salaries: ${error.message}`);
    }

    return data || [];
  }

  // Get salary by ID
  async getSalaryById(id: string): Promise<any> {
    const { data, error } = await supabaseAdmin
      .from('salaries')
      .select('*, employee:employees(id, first_name, last_name, email, designation, base_salary)')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch salary: ${error.message}`);
    }

    if (!data) {
      throw new Error('Salary record not found');
    }

    return data;
  }

  // Create new salary record
  async createSalary(salaryData: any): Promise<Salary> {
    // Map frontend fields to database fields
    const dbSalaryData: any = {};

    // Handle employee_id - skip if it's a placeholder (all zeros)
    if (salaryData.employee_id && salaryData.employee_id !== "00000000-0000-0000-0000-000000000000") {
      dbSalaryData.employee_id = salaryData.employee_id;
    }
    // If employee_id is null or placeholder, we'll leave it null (requires nullable FK or removing FK)

    // Handle month field (can be 'salary_month' or 'month')
    if (salaryData.salary_month) {
      dbSalaryData.month = salaryData.salary_month;
    } else if (salaryData.month) {
      dbSalaryData.month = salaryData.month;
    }

    // Handle base_salary
    if (salaryData.base_salary !== undefined) {
      dbSalaryData.base_salary = salaryData.base_salary;
    }

    // Handle allowances
    if (salaryData.allowances !== undefined) {
      dbSalaryData.allowances = salaryData.allowances;
    } else {
      dbSalaryData.allowances = 0;
    }

    // Handle deductions
    if (salaryData.deductions !== undefined) {
      dbSalaryData.deductions = salaryData.deductions;
    } else {
      dbSalaryData.deductions = 0;
    }

    // Calculate net salary
    const netSalary = this.calculateNetSalary(
      dbSalaryData.base_salary,
      dbSalaryData.allowances,
      dbSalaryData.deductions
    );
    dbSalaryData.net_salary = netSalary;

    // Handle status field (can be 'payment_status' or 'status')
    if (salaryData.payment_status) {
      dbSalaryData.status = salaryData.payment_status;
    } else if (salaryData.status) {
      dbSalaryData.status = salaryData.status;
    } else {
      dbSalaryData.status = 'pending';
    }

    // Handle paid_date
    if (salaryData.payment_date) {
      dbSalaryData.paid_date = salaryData.payment_date;
    } else if (salaryData.paid_date) {
      dbSalaryData.paid_date = salaryData.paid_date;
    }

    // Note: 'notes' and 'created_by' are not in the database schema (migrations.ts)
    // If these fields are needed, add them to the database schema first

    const { data, error } = await supabaseAdmin
      .from('salaries')
      .insert([dbSalaryData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create salary record: ${error.message}`);
    }

    return data;
  }

  // Update salary record
  async updateSalary(
    id: string,
    salaryData: UpdateSalaryInput
  ): Promise<Salary> {
    // If base_salary, allowances, or deductions are updated, recalculate net_salary
    let updateData: any = { ...salaryData };

    if (
      salaryData.base_salary !== undefined ||
      salaryData.allowances !== undefined ||
      salaryData.deductions !== undefined
    ) {
      // Fetch current record to get existing values
      const current = await this.getSalaryById(id);
      const baseSalary = salaryData.base_salary ?? current.base_salary;
      const allowances = salaryData.allowances ?? current.allowances;
      const deductions = salaryData.deductions ?? current.deductions;

      updateData.net_salary = this.calculateNetSalary(baseSalary, allowances, deductions);
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('salaries')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update salary record: ${error.message}`);
    }

    if (!data) {
      throw new Error('Salary record not found');
    }

    return data;
  }

  // Get employee salary history
  async getEmployeeSalaryHistory(employeeId: string): Promise<Salary[]> {
    const { data, error } = await supabaseAdmin
      .from('salaries')
      .select('*')
      .eq('employee_id', employeeId)
      .order('month', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch employee salary history: ${error.message}`);
    }

    return data || [];
  }

  // Mark salary as paid
  async markAsPaid(id: string): Promise<Salary> {
    const { data, error } = await supabaseAdmin
      .from('salaries')
      .update({
        status: 'paid',
        paid_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to mark salary as paid: ${error.message}`);
    }

    if (!data) {
      throw new Error('Salary record not found');
    }

    return data;
  }
}
