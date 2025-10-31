import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Accounting Dashboard API',
    version: '1.0.0',
    description: 'API documentation for the Accounting Dashboard application',
    contact: {
      name: 'API Support',
      email: 'support@accountingdashboard.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: process.env.BACKEND_URL || 'http://localhost:5000',
      description: 'Development server',
    },
    {
      url: 'https://api.accountingdashboard.com',
      description: 'Production server',
    },
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and authorization endpoints',
    },
    {
      name: 'Bills',
      description: 'Bill management endpoints',
    },
    {
      name: 'Cards',
      description: 'Credit/Debit card management endpoints',
    },
    {
      name: 'Cash Transactions',
      description: 'Cash transaction management endpoints',
    },
    {
      name: 'Budgets',
      description: 'Budget management endpoints',
    },
    {
      name: 'Employees',
      description: 'Employee management endpoints',
    },
    {
      name: 'Petty Expenses',
      description: 'Petty expense management endpoints',
    },
    {
      name: 'Salary',
      description: 'Salary management endpoints',
    },
    {
      name: 'Reminders',
      description: 'Reminder management endpoints',
    },
    {
      name: 'Dashboard',
      description: 'Dashboard statistics and analytics endpoints',
    },
    {
      name: 'Sessions',
      description: 'Session management endpoints',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token from the login endpoint',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'User ID',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
          },
          first_name: {
            type: 'string',
            description: 'User first name',
          },
          last_name: {
            type: 'string',
            description: 'User last name',
          },
          role: {
            type: 'string',
            enum: ['admin', 'user', 'accountant'],
            description: 'User role',
          },
          is_active: {
            type: 'boolean',
            description: 'User active status',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Account creation timestamp',
          },
          last_login_at: {
            type: 'string',
            format: 'date-time',
            description: 'Last login timestamp',
          },
        },
      },
      Bill: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Bill ID',
          },
          vendor_name: {
            type: 'string',
            description: 'Vendor name',
          },
          bill_number: {
            type: 'string',
            description: 'Bill number',
          },
          amount: {
            type: 'number',
            format: 'decimal',
            description: 'Bill amount',
          },
          due_date: {
            type: 'string',
            format: 'date',
            description: 'Bill due date',
          },
          status: {
            type: 'string',
            enum: ['pending', 'paid', 'overdue'],
            description: 'Bill status',
          },
          category: {
            type: 'string',
            description: 'Bill category',
          },
          notes: {
            type: 'string',
            description: 'Additional notes',
          },
          attachment_url: {
            type: 'string',
            description: 'Attachment URL',
          },
          created_by: {
            type: 'string',
            format: 'uuid',
            description: 'Creator user ID',
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
      },
      Card: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Card ID',
          },
          card_name: {
            type: 'string',
            description: 'Card name/label',
          },
          card_number: {
            type: 'string',
            description: 'Last 4 digits of card',
          },
          card_type: {
            type: 'string',
            enum: ['credit', 'debit'],
            description: 'Card type',
          },
          bank_name: {
            type: 'string',
            description: 'Bank name',
          },
          limit_amount: {
            type: 'number',
            format: 'decimal',
            description: 'Card limit',
          },
          billing_date: {
            type: 'integer',
            description: 'Day of month for billing',
          },
          is_active: {
            type: 'boolean',
            description: 'Card active status',
          },
        },
      },
      Budget: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Budget ID',
          },
          category: {
            type: 'string',
            description: 'Budget category',
          },
          amount: {
            type: 'number',
            format: 'decimal',
            description: 'Budget amount',
          },
          period: {
            type: 'string',
            enum: ['monthly', 'quarterly', 'yearly'],
            description: 'Budget period',
          },
          start_date: {
            type: 'string',
            format: 'date',
            description: 'Budget start date',
          },
          end_date: {
            type: 'string',
            format: 'date',
            description: 'Budget end date',
          },
        },
      },
      CashTransaction: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Transaction ID',
          },
          transaction_type: {
            type: 'string',
            enum: ['income', 'expense'],
            description: 'Transaction type',
          },
          amount: {
            type: 'number',
            format: 'decimal',
            description: 'Transaction amount',
          },
          category: {
            type: 'string',
            description: 'Transaction category',
          },
          description: {
            type: 'string',
            description: 'Transaction description',
          },
          transaction_date: {
            type: 'string',
            format: 'date',
            description: 'Transaction date',
          },
        },
      },
      Employee: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Employee ID',
          },
          first_name: {
            type: 'string',
            description: 'First name',
          },
          last_name: {
            type: 'string',
            description: 'Last name',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Email address',
          },
          phone: {
            type: 'string',
            description: 'Phone number',
          },
          department: {
            type: 'string',
            description: 'Department',
          },
          position: {
            type: 'string',
            description: 'Job position',
          },
          salary: {
            type: 'number',
            format: 'decimal',
            description: 'Monthly salary',
          },
          hire_date: {
            type: 'string',
            format: 'date',
            description: 'Hire date',
          },
          is_active: {
            type: 'boolean',
            description: 'Active status',
          },
        },
      },
      PettyExpense: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Expense ID',
          },
          description: {
            type: 'string',
            description: 'Expense description',
          },
          amount: {
            type: 'number',
            format: 'decimal',
            description: 'Expense amount',
          },
          category: {
            type: 'string',
            description: 'Expense category',
          },
          expense_date: {
            type: 'string',
            format: 'date',
            description: 'Expense date',
          },
          receipt_url: {
            type: 'string',
            description: 'Receipt attachment URL',
          },
        },
      },
      Reminder: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Reminder ID',
          },
          title: {
            type: 'string',
            description: 'Reminder title',
          },
          description: {
            type: 'string',
            description: 'Reminder description',
          },
          reminder_date: {
            type: 'string',
            format: 'date-time',
            description: 'Reminder date and time',
          },
          is_completed: {
            type: 'boolean',
            description: 'Completion status',
          },
          category: {
            type: 'string',
            description: 'Reminder category',
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'Error message',
          },
          error: {
            type: 'string',
            description: 'Error details',
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  // Path to the API routes
  apis: [
    './src/routes/*.ts',
    './src/routes/*.js',
    './dist/routes/*.js',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
