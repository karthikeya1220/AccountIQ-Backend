import { supabaseAdmin } from '../db/supabase';

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  reminder_date: string;
  reminder_time?: string;
  type?: string;
  related_id?: string;
  notification_methods?: string[];
  recipients?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateReminderInput {
  title: string;
  description?: string;
  reminder_date: string;
  reminder_time?: string;
  type?: string;
  related_id?: string;
  notification_methods?: string[];
  recipients?: string[];
}

export interface UpdateReminderInput {
  title?: string;
  description?: string;
  reminder_date?: string;
  reminder_time?: string;
  type?: string;
  related_id?: string;
  notification_methods?: string[];
  recipients?: string[];
  is_active?: boolean;
}

export class RemindersService {
  // Get all reminders with optional filters
  async getAllReminders(filters: {
    type?: string;
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<Reminder[]> {
    let query = supabaseAdmin
      .from('reminders')
      .select('*')
      .order('reminder_date', { ascending: true });

    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }
    if (filters.startDate) {
      query = query.gte('reminder_date', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('reminder_date', filters.endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch reminders: ${error.message}`);
    }

    return data || [];
  }

  // Get reminder by ID
  async getReminderById(id: string): Promise<Reminder> {
    const { data, error } = await supabaseAdmin
      .from('reminders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch reminder: ${error.message}`);
    }

    if (!data) {
      throw new Error('Reminder not found');
    }

    return data;
  }

  // Create new reminder
  async createReminder(reminderData: CreateReminderInput): Promise<Reminder> {
    const { data, error } = await supabaseAdmin
      .from('reminders')
      .insert([
        {
          ...reminderData,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create reminder: ${error.message}`);
    }

    return data;
  }

  // Update reminder
  async updateReminder(
    id: string,
    reminderData: UpdateReminderInput
  ): Promise<Reminder> {
    const { data, error } = await supabaseAdmin
      .from('reminders')
      .update({
        ...reminderData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update reminder: ${error.message}`);
    }

    if (!data) {
      throw new Error('Reminder not found');
    }

    return data;
  }

  // Delete reminder
  async deleteReminder(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('reminders')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete reminder: ${error.message}`);
    }
  }

  // Get upcoming reminders (next 7 days by default)
  async getUpcomingReminders(days: number = 7): Promise<Reminder[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    const { data, error } = await supabaseAdmin
      .from('reminders')
      .select('*')
      .eq('is_active', true)
      .gte('reminder_date', today.toISOString().split('T')[0])
      .lte('reminder_date', futureDate.toISOString().split('T')[0])
      .order('reminder_date', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch upcoming reminders: ${error.message}`);
    }

    return data || [];
  }

  // Get today's reminders
  async getTodaysReminders(): Promise<Reminder[]> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabaseAdmin
      .from('reminders')
      .select('*')
      .eq('is_active', true)
      .eq('reminder_date', today)
      .order('reminder_time', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch today's reminders: ${error.message}`);
    }

    return data || [];
  }
}
