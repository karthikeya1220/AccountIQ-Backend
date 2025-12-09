# AccountIQ Backend - API Integration Guide

## Quick Start

### Base Information
- **Base URL (Development)**: `http://localhost:5000/api`
- **Base URL (Production)**: `https://your-domain.com/api`
- **API Documentation**: `http://localhost:5000/api-docs`
- **Content-Type**: `application/json`
- **Authentication**: Bearer Token (JWT)

---

## Authentication

### 1. Login

Get an access token by providing credentials.

**Endpoint**: `POST /api/auth/login`

**Request**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

**Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "v1.abc123def456...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@example.com",
    "first_name": "Admin",
    "last_name": "User",
    "role": "admin",
    "is_active": true
  }
}
```

**Error Responses**:
- `400` - Missing email or password
- `401` - Invalid credentials

---

### 2. Using the Token

Include the token in the `Authorization` header for all protected endpoints:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example**:
```bash
curl -X GET http://localhost:5000/api/bills \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### 3. Get Current User

**Endpoint**: `GET /api/auth/me`

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "admin@example.com",
  "first_name": "Admin",
  "last_name": "User",
  "role": "admin",
  "is_active": true,
  "last_login_at": "2024-12-09T10:30:00Z"
}
```

---

## Bills Management

### 1. Get All Bills

**Endpoint**: `GET /api/bills`

**Query Parameters**:
- `startDate` (optional): Filter from date (YYYY-MM-DD)
- `endDate` (optional): Filter to date (YYYY-MM-DD)
- `status` (optional): Filter by status (`pending`, `paid`, `overdue`)

**Request**:
```bash
curl -X GET "http://localhost:5000/api/bills?startDate=2024-01-01&status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response**:
```json
[
  {
    "id": "bill-uuid-1",
    "bill_date": "2024-12-01",
    "vendor": "ABC Suppliers",
    "amount": 1500.00,
    "description": "Office supplies",
    "status": "pending",
    "category_id": "cat-uuid",
    "card_id": "card-uuid",
    "created_by": "user-uuid",
    "created_at": "2024-12-01T10:00:00Z",
    "updated_at": "2024-12-01T10:00:00Z",
    "cards": {
      "card_number": "**** **** **** 1234",
      "card_holder": "Company Name"
    },
    "_permissions": {
      "canEdit": true,
      "editableFields": ["vendor", "amount", "status", "..."]
    }
  }
]
```

---

### 2. Get Single Bill

**Endpoint**: `GET /api/bills/:id`

**Request**:
```bash
curl -X GET http://localhost:5000/api/bills/bill-uuid-1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response**: Same structure as single bill object above.

---

### 3. Create Bill

**Endpoint**: `POST /api/bills`

**Request Body**:
```json
{
  "vendor": "ABC Suppliers",
  "bill_number": "INV-2024-001",
  "amount": 1500.00,
  "bill_date": "2024-12-09",
  "due_date": "2024-12-31",
  "description": "Monthly office supplies",
  "category_id": "cat-uuid",
  "card_id": "card-uuid",
  "status": "pending"
}
```

**Required Fields**:
- `vendor` (string)
- `amount` (number)

**Optional Fields**:
- `bill_number` (string)
- `bill_date` (date, defaults to today)
- `due_date` (date)
- `description` (string)
- `category_id` (uuid)
- `card_id` (uuid)
- `status` (enum: `pending`, `paid`, `overdue`)

**Request**:
```bash
curl -X POST http://localhost:5000/api/bills \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vendor": "ABC Suppliers",
    "amount": 1500.00,
    "bill_date": "2024-12-09",
    "status": "pending"
  }'
```

**Response** (201 Created):
```json
{
  "id": "new-bill-uuid",
  "vendor": "ABC Suppliers",
  "amount": 1500.00,
  "bill_date": "2024-12-09",
  "status": "pending",
  "created_by": "user-uuid",
  "created_at": "2024-12-09T10:30:00Z"
}
```

---

### 4. Update Bill

**Endpoint**: `PUT /api/bills/:id`

**Permissions**: Admin only

**Request**:
```bash
curl -X PUT http://localhost:5000/api/bills/bill-uuid-1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "paid",
    "amount": 1600.00
  }'
```

**Response** (200 OK):
```json
{
  "id": "bill-uuid-1",
  "status": "paid",
  "amount": 1600.00,
  "updated_at": "2024-12-09T11:00:00Z"
}
```

---

### 5. Delete Bill

**Endpoint**: `DELETE /api/bills/:id`

**Permissions**: Admin only

**Request**:
```bash
curl -X DELETE http://localhost:5000/api/bills/bill-uuid-1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response** (200 OK):
```json
{
  "message": "Bill deleted successfully"
}
```

---

### 6. Upload Bill Attachment

**Endpoint**: `POST /api/bills/:id/attachment`

**Content-Type**: `multipart/form-data`

**Request**:
```bash
curl -X POST http://localhost:5000/api/bills/bill-uuid-1/attachment \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/invoice.pdf"
```

**Response**:
```json
{
  "path": "uploads/bill-uuid-1-abc123.pdf",
  "publicUrl": "https://your-project.supabase.co/storage/v1/object/public/bills-attachments/uploads/bill-uuid-1-abc123.pdf"
}
```

---

### 7. Export Bills

**PDF Export**: `GET /api/bills/export/pdf?startDate=2024-01-01&endDate=2024-12-31`

**Excel Export**: `GET /api/bills/export/excel?startDate=2024-01-01&endDate=2024-12-31`

**Request**:
```bash
curl -X GET "http://localhost:5000/api/bills/export/pdf?startDate=2024-01-01" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o bills.pdf
```

---

## Cards Management

### 1. Get All Cards

**Endpoint**: `GET /api/cards`

**Request**:
```bash
curl -X GET http://localhost:5000/api/cards \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "card-uuid-1",
      "card_number": "**** **** **** 1234",
      "card_holder": "Company Name",
      "card_type": "credit",
      "bank": "ABC Bank",
      "expiry_date": "2026-12",
      "card_limit": 50000.00,
      "balance": 12500.00,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "stats": {
    "totalCards": 5,
    "totalLimit": 250000.00,
    "totalBalance": 45000.00,
    "availableCredit": 205000.00
  }
}
```

---

### 2. Create Card

**Endpoint**: `POST /api/cards`

**Permissions**: Admin only

**Request Body**:
```json
{
  "card_number": "**** **** **** 5678",
  "card_holder": "Company Name",
  "card_type": "credit",
  "bank": "XYZ Bank",
  "expiry_date": "2027-06",
  "card_limit": 75000.00
}
```

**Request**:
```bash
curl -X POST http://localhost:5000/api/cards \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "card_number": "**** **** **** 5678",
    "card_holder": "Company Name",
    "card_type": "credit",
    "bank": "XYZ Bank",
    "card_limit": 75000.00
  }'
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "new-card-uuid",
    "card_number": "**** **** **** 5678",
    "card_holder": "Company Name",
    "card_type": "credit",
    "balance": 0.00,
    "is_active": true
  }
}
```

---

### 3. Get Card Transactions

**Endpoint**: `GET /api/cards/:id/transactions`

**Request**:
```bash
curl -X GET http://localhost:5000/api/cards/card-uuid-1/transactions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "bill-uuid-1",
      "vendor": "ABC Suppliers",
      "amount": 1500.00,
      "bill_date": "2024-12-01",
      "status": "paid"
    }
  ]
}
```

---

## Dashboard & Analytics

### 1. Get Complete Dashboard

**Endpoint**: `GET /api/dashboard/summary`

**Query Parameters**:
- `period`: `current_month` | `last_30_days` | `custom_range` (default: `current_month`)
- `startDate`: Start date for custom range (YYYY-MM-DD)
- `endDate`: End date for custom range (YYYY-MM-DD)
- `include`: Comma-separated components (`kpis,trends,categories`)
- `exclude`: Comma-separated components to exclude
- `timeZone`: Timezone for calculations (default: `UTC`)

**Request**:
```bash
curl -X GET "http://localhost:5000/api/dashboard/summary?period=current_month" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response**:
```json
{
  "period": "current_month",
  "startDate": "2024-12-01",
  "endDate": "2024-12-31",
  "kpis": {
    "totalExpenses": 125000.00,
    "totalBills": 45000.00,
    "totalCards": 35000.00,
    "totalSalary": 40000.00,
    "totalPetty": 5000.00,
    "pendingBills": 12000.00,
    "overdueBills": 3000.00,
    "averageDailyExpense": 4166.67,
    "budgetUtilization": 62.5
  },
  "trends": {
    "monthly": [
      { "month": "2024-01", "amount": 110000 },
      { "month": "2024-02", "amount": 115000 },
      { "month": "2024-03", "amount": 125000 }
    ],
    "daily": [
      { "date": "2024-12-01", "amount": 4200 },
      { "date": "2024-12-02", "amount": 3800 }
    ]
  },
  "categoryBreakdown": [
    { "category": "Office Supplies", "amount": 25000, "percentage": 20 },
    { "category": "Utilities", "amount": 15000, "percentage": 12 },
    { "category": "Salary", "amount": 40000, "percentage": 32 }
  ],
  "recentTransactions": [
    {
      "id": "txn-uuid-1",
      "type": "bill",
      "vendor": "ABC Suppliers",
      "amount": 1500.00,
      "date": "2024-12-09",
      "status": "pending"
    }
  ],
  "budgetStatus": {
    "totalBudget": 200000.00,
    "totalSpent": 125000.00,
    "remaining": 75000.00,
    "percentage": 62.5,
    "status": "on_track"
  },
  "alerts": [
    {
      "type": "budget_warning",
      "category": "Office Supplies",
      "message": "80% of budget utilized",
      "severity": "warning"
    }
  ],
  "metadata": {
    "generatedAt": "2024-12-09T10:30:00Z",
    "dataFreshness": "real-time",
    "calculations": "server-side"
  }
}
```

---

### 2. Get KPIs Only (Fast Endpoint)

**Endpoint**: `GET /api/dashboard/kpis`

**Request**:
```bash
curl -X GET http://localhost:5000/api/dashboard/kpis \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response**:
```json
{
  "kpis": {
    "totalExpenses": 125000.00,
    "totalBills": 45000.00,
    "totalCards": 35000.00,
    "totalSalary": 40000.00,
    "pendingBills": 12000.00,
    "overdueBills": 3000.00
  },
  "metadata": {
    "period": "current_month",
    "generatedAt": "2024-12-09T10:30:00Z"
  }
}
```

---

### 3. Get Monthly Trends

**Endpoint**: `GET /api/dashboard/trends`

**Query Parameters**:
- `months`: Number of months to include (default: 6)

**Request**:
```bash
curl -X GET "http://localhost:5000/api/dashboard/trends?months=12" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response**:
```json
{
  "trends": [
    {
      "month": "2024-01",
      "totalExpenses": 110000.00,
      "bills": 40000.00,
      "cards": 30000.00,
      "salary": 35000.00,
      "petty": 5000.00
    },
    {
      "month": "2024-02",
      "totalExpenses": 115000.00,
      "bills": 42000.00,
      "cards": 32000.00,
      "salary": 36000.00,
      "petty": 5000.00
    }
  ]
}
```

---

### 4. Get Category Breakdown

**Endpoint**: `GET /api/dashboard/category-breakdown`

**Request**:
```bash
curl -X GET http://localhost:5000/api/dashboard/category-breakdown \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response**:
```json
{
  "categories": [
    {
      "category": "Office Supplies",
      "categoryId": "cat-uuid-1",
      "amount": 25000.00,
      "count": 45,
      "percentage": 20.0,
      "avgTransaction": 555.56
    },
    {
      "category": "Utilities",
      "categoryId": "cat-uuid-2",
      "amount": 15000.00,
      "count": 12,
      "percentage": 12.0,
      "avgTransaction": 1250.00
    }
  ],
  "totalAmount": 125000.00,
  "totalCount": 187
}
```

---

## Employees Management

### 1. Get All Employees

**Endpoint**: `GET /api/employees`

**Request**:
```bash
curl -X GET http://localhost:5000/api/employees \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response**:
```json
[
  {
    "id": "emp-uuid-1",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@company.com",
    "designation": "Software Engineer",
    "department_id": "dept-uuid",
    "base_salary": 50000.00,
    "join_date": "2024-01-15",
    "is_active": true,
    "created_at": "2024-01-15T00:00:00Z"
  }
]
```

---

### 2. Create Employee

**Endpoint**: `POST /api/employees`

**Permissions**: Admin only

**Request Body**:
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@company.com",
  "designation": "Product Manager",
  "base_salary": 60000.00,
  "join_date": "2024-12-01"
}
```

**Request**:
```bash
curl -X POST http://localhost:5000/api/employees \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane.smith@company.com",
    "designation": "Product Manager",
    "base_salary": 60000.00
  }'
```

---

## Salary Management

### 1. Get All Salary Records

**Endpoint**: `GET /api/salary`

**Query Parameters**:
- `month`: Filter by month (YYYY-MM)
- `employee_id`: Filter by employee

**Request**:
```bash
curl -X GET "http://localhost:5000/api/salary?month=2024-12" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response**:
```json
[
  {
    "id": "salary-uuid-1",
    "employee_id": "emp-uuid-1",
    "month": "2024-12",
    "base_salary": 50000.00,
    "allowances": 5000.00,
    "deductions": 3000.00,
    "net_salary": 52000.00,
    "status": "paid",
    "paid_date": "2024-12-01",
    "employee": {
      "first_name": "John",
      "last_name": "Doe",
      "designation": "Software Engineer"
    }
  }
]
```

---

### 2. Create Salary Record

**Endpoint**: `POST /api/salary`

**Permissions**: Admin only

**Request Body**:
```json
{
  "employee_id": "emp-uuid-1",
  "month": "2024-12",
  "base_salary": 50000.00,
  "allowances": 5000.00,
  "deductions": 3000.00,
  "net_salary": 52000.00,
  "status": "pending"
}
```

---

## Budgets Management

### 1. Get All Budgets

**Endpoint**: `GET /api/budgets`

**Request**:
```bash
curl -X GET http://localhost:5000/api/budgets \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response**:
```json
[
  {
    "id": "budget-uuid-1",
    "category_id": "cat-uuid-1",
    "limit_amount": 30000.00,
    "spent_amount": 24000.00,
    "period": "monthly",
    "start_date": "2024-12-01",
    "end_date": "2024-12-31",
    "alert_threshold": 80.00,
    "utilization": 80.0,
    "status": "warning",
    "is_active": true,
    "category": {
      "name": "Office Supplies"
    }
  }
]
```

---

### 2. Get Budget Status Overview

**Endpoint**: `GET /api/budgets/status`

**Request**:
```bash
curl -X GET http://localhost:5000/api/budgets/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response**:
```json
{
  "totalBudget": 200000.00,
  "totalSpent": 125000.00,
  "totalRemaining": 75000.00,
  "overallUtilization": 62.5,
  "status": "on_track",
  "budgets": [
    {
      "category": "Office Supplies",
      "limit": 30000,
      "spent": 24000,
      "utilization": 80,
      "status": "warning"
    }
  ]
}
```

---

## Error Handling

### Standard Error Response Format

All error responses follow this structure:

```json
{
  "error": "Error message",
  "message": "Detailed description",
  "code": "ERROR_CODE",
  "timestamp": "2024-12-09T10:30:00Z"
}
```

### Common Error Codes

| Status | Code | Description |
|--------|------|-------------|
| `400` | `BAD_REQUEST` | Invalid request data |
| `401` | `UNAUTHORIZED` | Missing or invalid token |
| `403` | `FORBIDDEN` | Insufficient permissions |
| `404` | `NOT_FOUND` | Resource not found |
| `409` | `CONFLICT` | Resource conflict |
| `422` | `VALIDATION_ERROR` | Data validation failed |
| `500` | `INTERNAL_ERROR` | Server error |

### Example Error Responses

**401 Unauthorized**:
```json
{
  "error": "No authorization token provided",
  "code": "UNAUTHORIZED",
  "timestamp": "2024-12-09T10:30:00Z"
}
```

**403 Forbidden**:
```json
{
  "error": "Field edit access denied",
  "message": "You cannot edit the following fields: amount, status",
  "deniedFields": ["amount", "status"],
  "allowedFields": [],
  "code": "FORBIDDEN",
  "timestamp": "2024-12-09T10:30:00Z"
}
```

**400 Bad Request**:
```json
{
  "error": "Validation error",
  "message": "Invalid input data",
  "details": {
    "vendor": "Vendor name is required",
    "amount": "Amount must be greater than 0"
  },
  "code": "VALIDATION_ERROR",
  "timestamp": "2024-12-09T10:30:00Z"
}
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Authenticated requests**: 1000 requests per hour
- **Login endpoint**: 10 requests per 15 minutes
- **File uploads**: 50 requests per hour

When rate limit is exceeded:

**Response** (429 Too Many Requests):
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 3600,
  "code": "RATE_LIMIT_EXCEEDED"
}
```

---

## Pagination

For endpoints that return lists, pagination is supported:

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Example**:
```bash
curl -X GET "http://localhost:5000/api/bills?page=2&limit=50" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response includes pagination metadata**:
```json
{
  "data": [...],
  "pagination": {
    "currentPage": 2,
    "totalPages": 5,
    "totalItems": 237,
    "itemsPerPage": 50,
    "hasNextPage": true,
    "hasPrevPage": true
  }
}
```

---

## Webhooks (Future Feature)

Subscribe to events in the system:

**Available Events**:
- `bill.created`
- `bill.updated`
- `bill.paid`
- `budget.threshold_reached`
- `salary.paid`

**Webhook Payload**:
```json
{
  "event": "bill.created",
  "timestamp": "2024-12-09T10:30:00Z",
  "data": {
    "id": "bill-uuid",
    "vendor": "ABC Suppliers",
    "amount": 1500.00
  }
}
```

---

## Best Practices

### 1. **Always Use HTTPS in Production**
```bash
https://api.yourdomain.com/api
```

### 2. **Store Tokens Securely**
- Use secure storage (e.g., httpOnly cookies, secure localStorage)
- Never expose tokens in URLs
- Implement token refresh mechanism

### 3. **Handle Token Expiry**
```javascript
if (response.status === 401) {
  // Token expired, refresh or re-authenticate
  await refreshToken();
  // Retry request
}
```

### 4. **Validate Input Client-Side**
Before sending requests, validate data on the client to reduce errors.

### 5. **Use Appropriate HTTP Methods**
- `GET`: Retrieve data
- `POST`: Create new resources
- `PUT`: Update entire resource
- `PATCH`: Partial update
- `DELETE`: Remove resource

### 6. **Include Proper Headers**
```javascript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer token',
  'Accept': 'application/json'
}
```

### 7. **Handle Errors Gracefully**
```javascript
try {
  const response = await fetch('/api/bills', options);
  if (!response.ok) {
    const error = await response.json();
    // Handle error
  }
  const data = await response.json();
} catch (error) {
  // Handle network error
}
```

---

## Code Examples

### JavaScript/TypeScript (Fetch API)

```typescript
// Login
async function login(email: string, password: string) {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    throw new Error('Login failed');
  }
  
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data;
}

// Get bills
async function getBills(filters = {}) {
  const token = localStorage.getItem('token');
  const queryString = new URLSearchParams(filters).toString();
  
  const response = await fetch(`http://localhost:5000/api/bills?${queryString}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch bills');
  }
  
  return await response.json();
}

// Create bill
async function createBill(billData: any) {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/bills', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(billData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}
```

---

### Python (Requests Library)

```python
import requests

BASE_URL = "http://localhost:5000/api"

# Login
def login(email, password):
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={"email": email, "password": password}
    )
    response.raise_for_status()
    data = response.json()
    return data['token']

# Get bills
def get_bills(token, filters=None):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(
        f"{BASE_URL}/bills",
        headers=headers,
        params=filters
    )
    response.raise_for_status()
    return response.json()

# Create bill
def create_bill(token, bill_data):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    response = requests.post(
        f"{BASE_URL}/bills",
        headers=headers,
        json=bill_data
    )
    response.raise_for_status()
    return response.json()
```

---

### React Hook Example

```typescript
import { useState, useEffect } from 'react';

function useBills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchBills() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/bills', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        setBills(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBills();
  }, []);

  return { bills, loading, error };
}
```

---

## Testing the API

### Using Postman

1. Import the OpenAPI spec from `/api-docs.json`
2. Create an environment with `baseUrl` and `token` variables
3. Set up authentication in collection settings

### Using cURL

See examples throughout this document.

### Using Swagger UI

Navigate to `http://localhost:5000/api-docs` for interactive testing.

---

## Support

For issues or questions:
- Check the documentation at `/api-docs`
- Review error messages carefully
- Ensure tokens are valid and not expired
- Verify request payload structure

---

## Changelog

### Version 1.0.0 (Current)
- Initial API release
- Full CRUD operations for all resources
- JWT authentication
- RBAC with field-level permissions
- Dashboard analytics
- File upload support
