import { supabaseAdmin } from '../db/supabase';

export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  designation?: string;
  department_id?: string;
  base_salary?: number;
  join_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateEmployeeInput {
  first_name: string;
  last_name: string;
  email?: string;
  designation?: string;
  department_id?: string;
  base_salary?: number;
  join_date?: string;
}

export interface UpdateEmployeeInput {
  first_name?: string;
  last_name?: string;
  email?: string;
  designation?: string;
  department_id?: string;
  base_salary?: number;
  join_date?: string;
  is_active?: boolean;
}

export class EmployeesService {
  // Get all employees
  async getAllEmployees(filters: { is_active?: boolean } = {}): Promise<Employee[]> {
    let query = supabaseAdmin
      .from('employees')
      .select('*')
      .order('first_name', { ascending: true });

    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch employees: ${error.message}`);
    }

    return data || [];
  }

  // Get employee by ID
  async getEmployeeById(id: string): Promise<Employee> {
    const { data, error } = await supabaseAdmin
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch employee: ${error.message}`);
    }

    if (!data) {
      throw new Error('Employee not found');
    }

    return data;
  }

  // Create new employee
  async createEmployee(employeeData: CreateEmployeeInput): Promise<Employee> {
    // Check if email already exists
    if (employeeData.email) {
      const { data: existingEmployee } = await supabaseAdmin
        .from('employees')
        .select('id')
        .eq('email', employeeData.email)
        .single();

      if (existingEmployee) {
        throw new Error('Employee with this email already exists');
      }
    }

    const { data, error } = await supabaseAdmin
      .from('employees')
      .insert([employeeData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create employee: ${error.message}`);
    }

    return data;
  }

  // Update employee
  async updateEmployee(id: string, employeeData: UpdateEmployeeInput): Promise<Employee> {
    // Check if email is being updated and already exists
    if (employeeData.email) {
      const { data: existingEmployee } = await supabaseAdmin
        .from('employees')
        .select('id')
        .eq('email', employeeData.email)
        .neq('id', id)
        .single();

      if (existingEmployee) {
        throw new Error('Employee with this email already exists');
      }
    }

    const updateData: any = {
      ...employeeData,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('employees')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update employee: ${error.message}`);
    }

    if (!data) {
      throw new Error('Employee not found');
    }

    return data;
  }

  // Delete employee (soft delete by setting is_active to false)
  async deleteEmployee(id: string): Promise<{ success: boolean; message: string }> {
    // Check if employee has salary records
    const { count, error: countError } = await supabaseAdmin
      .from('salaries')
      .select('*', { count: 'exact', head: true })
      .eq('employee_id', id);

    if (countError) {
      throw new Error(`Failed to check employee usage: ${countError.message}`);
    }

    if (count && count > 0) {
      // Soft delete if employee has salary records
      const { error } = await supabaseAdmin
        .from('employees')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to deactivate employee: ${error.message}`);
      }

      return { success: true, message: 'Employee deactivated successfully' };
    }

    // Hard delete if no salary records
    const { error } = await supabaseAdmin.from('employees').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete employee: ${error.message}`);
    }

    return { success: true, message: 'Employee deleted successfully' };
  }

  // Get active employees
  async getActiveEmployees(): Promise<Employee[]> {
    return this.getAllEmployees({ is_active: true });
  }
}
