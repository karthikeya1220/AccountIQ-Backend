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
  } = {}): Promise<Salary[]> {
    let query = supabaseAdmin
      .from('salaries')
      .select('*')
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
  async getSalaryById(id: string): Promise<Salary> {
    const { data, error } = await supabaseAdmin
      .from('salaries')
      .select('*')
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
  async createSalary(salaryData: CreateSalaryInput): Promise<Salary> {
    const netSalary = this.calculateNetSalary(
      salaryData.base_salary,
      salaryData.allowances,
      salaryData.deductions
    );

    const { data, error } = await supabaseAdmin
      .from('salaries')
      .insert([
        {
          ...salaryData,
          net_salary: netSalary,
          status: 'pending',
        },
      ])
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
