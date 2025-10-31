import { UserRole } from '../types';

/**
 * Field permissions configuration
 * Define which fields can be edited by which roles
 */
export const FIELD_PERMISSIONS = {
  // Bills
  bills: {
    // Admin can edit all fields
    admin: [
      'vendor_name',
      'bill_number',
      'amount',
      'bill_date',
      'due_date',
      'description',
      'status',
      'card_id',
      'category_id',
      'attachment_url',
      'attachment_type',
    ],
    // User can only view, not edit
    user: [],
  },

  // Cards
  cards: {
    // Admin can edit all fields
    admin: [
      'card_number',
      'card_holder',
      'card_type',
      'bank',
      'expiry_date',
      'card_limit',
      'balance',
      'is_active',
    ],
    // User can only view
    user: [],
  },

  // Cash Transactions
  cashTransactions: {
    // Admin can edit all
    admin: [
      'transaction_date',
      'description',
      'amount',
      'transaction_type',
      'category_id',
      'notes',
    ],
    // User can only view
    user: [],
  },

  // Employees
  employees: {
    // Admin can edit all
    admin: [
      'first_name',
      'last_name',
      'email',
      'designation',
      'department_id',
      'base_salary',
      'join_date',
      'is_active',
    ],
    // User can only view
    user: [],
  },

  // Salary
  salary: {
    // Admin can edit all
    admin: [
      'employee_id',
      'month',
      'base_salary',
      'allowances',
      'deductions',
      'net_salary',
      'status',
      'paid_date',
    ],
    // User can only view
    user: [],
  },

  // Petty Expenses
  pettyExpenses: {
    // Admin can edit all
    admin: [
      'description',
      'amount',
      'category_id',
      'expense_date',
    ],
    // User can edit their own
    user: ['description', 'amount', 'category_id', 'expense_date'],
  },

  // Budgets
  budgets: {
    // Admin can edit all
    admin: [
      'category_id',
      'category_name',
      'limit',
      'spent',
      'period',
      'month',
      'is_active',
    ],
    // User can only view
    user: [],
  },

  // Reminders
  reminders: {
    // Admin can edit all
    admin: [
      'title',
      'description',
      'reminder_date',
      'reminder_time',
      'type',
      'related_id',
      'notification_methods',
      'recipients',
      'is_active',
    ],
    // User can only view
    user: [],
  },
};

/**
 * Check if a user can edit a specific field
 */
export const canEditField = (
  role: UserRole | string,
  resource: keyof typeof FIELD_PERMISSIONS,
  field: string
): boolean => {
  const permissions = FIELD_PERMISSIONS[resource];
  if (!permissions) return false;

  const rolePermissions = (permissions[role as keyof typeof permissions] || []) as string[];
  return rolePermissions.includes(field);
};

/**
 * Check if user can edit any fields in a resource
 */
export const canEditResource = (
  role: UserRole | string,
  resource: keyof typeof FIELD_PERMISSIONS
): boolean => {
  const permissions = FIELD_PERMISSIONS[resource];
  if (!permissions) return false;

  const rolePermissions = (permissions[role as keyof typeof permissions] || []) as string[];
  return rolePermissions.length > 0;
};

/**
 * Get editable fields for a role
 */
export const getEditableFields = (
  role: UserRole | string,
  resource: keyof typeof FIELD_PERMISSIONS
): string[] => {
  const permissions = FIELD_PERMISSIONS[resource];
  if (!permissions) return [];

  return (permissions[role as keyof typeof permissions] || []) as string[];
};

/**
 * Filter request body to only include editable fields
 */
export const filterEditableFields = (
  role: UserRole | string,
  resource: keyof typeof FIELD_PERMISSIONS,
  body: Record<string, any>
): Record<string, any> => {
  const editableFields = getEditableFields(role, resource);
  
  if (editableFields.length === 0) {
    return {}; // No fields can be edited
  }

  const filtered: Record<string, any> = {};
  editableFields.forEach((field) => {
    if (field in body) {
      filtered[field] = body[field];
    }
  });

  return filtered;
};

/**
 * Validate edit attempt - throws error if user cannot edit
 */
export const validateEditPermission = (
  role: UserRole | string,
  resource: keyof typeof FIELD_PERMISSIONS,
  fieldsToUpdate: string[]
): { allowed: boolean; deniedFields: string[] } => {
  const editableFields = getEditableFields(role, resource);
  const deniedFields = fieldsToUpdate.filter((f) => !editableFields.includes(f));

  return {
    allowed: deniedFields.length === 0,
    deniedFields,
  };
};

/**
 * Response wrapper for role-based field filtering
 * Mark which fields are editable for the current user
 */
export const attachFieldMetadata = (
  data: Record<string, any>,
  role: UserRole | string,
  resource: keyof typeof FIELD_PERMISSIONS
): Record<string, any> => {
  const editableFields = getEditableFields(role, resource);

  return {
    ...data,
    _metadata: {
      editable: editableFields,
      editingEnabled: editableFields.length > 0,
      userRole: role,
    },
  };
};
