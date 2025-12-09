# AccountIQ Backend - Quick Reference

## 📚 Documentation Index

This repository contains comprehensive documentation for the AccountIQ Backend API:

1. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete architecture, tech stack, and design patterns
2. **[FLOW_DIAGRAMS.md](./FLOW_DIAGRAMS.md)** - Visual diagrams of system flows and processes
3. **[API_GUIDE.md](./API_GUIDE.md)** - Complete API integration guide with examples
4. **[README.md](./README.md)** - Project overview and setup instructions

---

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Clone repository
git clone <repository-url>
cd AccountIQ-Backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials
```

### 2. Required Environment Variables

```env
# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-key
SUPABASE_ANON_KEY=your-anon-key

# Server
BACKEND_PORT=5000
BACKEND_URL=http://localhost:5000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:3000

# Security
SESSION_SECRET=your-secret-key
```

### 3. Run the Server

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

### 4. Access API Documentation

```
http://localhost:5000/api-docs
```

---

## 🔑 Authentication Quick Guide

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

**Response:**
```json
{
  "token": "eyJhbGc...",
  "user": { "id": "uuid", "email": "...", "role": "admin" }
}
```

### Use Token
```bash
curl -X GET http://localhost:5000/api/bills \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📋 API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /login` - Login
- `POST /signup` - Register (admin)
- `GET /me` - Get current user
- `PUT /me` - Update profile
- `POST /logout` - Logout

### Bills (`/api/bills`)
- `GET /` - List bills
- `GET /:id` - Get bill
- `POST /` - Create bill
- `PUT /:id` - Update bill (admin)
- `DELETE /:id` - Delete bill (admin)
- `POST /:id/attachment` - Upload attachment
- `GET /export/pdf` - Export to PDF
- `GET /export/excel` - Export to Excel

### Cards (`/api/cards`)
- `GET /` - List cards
- `GET /:id` - Get card
- `POST /` - Create card (admin)
- `PUT /:id` - Update card (admin)
- `DELETE /:id` - Delete card (admin)
- `GET /:id/transactions` - Card transactions

### Employees (`/api/employees`)
- `GET /` - List employees
- `GET /:id` - Get employee
- `POST /` - Create employee (admin)
- `PUT /:id` - Update employee (admin)
- `DELETE /:id` - Delete employee (admin)

### Salary (`/api/salary`)
- `GET /` - List salary records
- `GET /:id` - Get salary record
- `POST /` - Create salary (admin)
- `PUT /:id` - Update salary (admin)
- `GET /employee/:id` - Employee salaries

### Cash Transactions (`/api/cash-transactions`)
- `GET /` - List transactions
- `POST /` - Create transaction
- `PUT /:id` - Update (admin)
- `DELETE /:id` - Delete (admin)

### Petty Expenses (`/api/petty-expenses`)
- `GET /` - List expenses
- `POST /` - Create expense
- `PUT /:id` - Update (admin)
- `GET /monthly-summary` - Monthly summary

### Budgets (`/api/budgets`)
- `GET /` - List budgets
- `POST /` - Create budget (admin)
- `PUT /:id` - Update budget (admin)
- `GET /status` - Budget overview
- `GET /alerts` - Budget alerts

### Reminders (`/api/reminders`)
- `GET /` - List reminders
- `POST /` - Create reminder
- `PUT /:id` - Update reminder
- `DELETE /:id` - Delete reminder
- `GET /upcoming` - Upcoming reminders

### Dashboard (`/api/dashboard`)
- `GET /summary` - Complete dashboard
- `GET /kpis` - KPIs only
- `GET /trends` - Monthly trends
- `GET /category-breakdown` - Category analysis
- `GET /recent-transactions` - Recent activity

### Sessions (`/api/sessions`)
- `GET /` - List sessions (admin)
- `GET /my-sessions` - My sessions
- `DELETE /:id` - Terminate session (admin)

---

## 🏗️ Architecture Overview

```
Client → Express Server → Middleware → Routes → Services → Database
           ├─ Security (Helmet, CORS)
           ├─ Authentication (JWT)
           ├─ Authorization (RBAC)
           └─ Validation (Zod)
```

### Key Components

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | Node.js + TypeScript | Server execution |
| **Framework** | Express.js | Web framework |
| **Database** | PostgreSQL (Supabase) | Data storage |
| **Auth** | Supabase Auth | JWT authentication |
| **Storage** | Supabase Storage | File uploads |
| **Validation** | Zod | Schema validation |
| **Security** | Helmet, CORS | Protection |

---

## 🔐 Security Features

### Authentication
- ✅ JWT token-based authentication
- ✅ Token expiry and refresh
- ✅ Secure password hashing (bcrypt)
- ✅ Session management

### Authorization
- ✅ Role-Based Access Control (RBAC)
- ✅ Field-level permissions
- ✅ Resource ownership validation

### Security Headers
- ✅ Helmet.js for security headers
- ✅ CORS with whitelist
- ✅ XSS protection
- ✅ SQL injection prevention

---

## 📊 Database Schema

### Core Tables

**users**
- `id` (UUID, PK)
- `email`, `role`, `is_active`
- Authentication & profile data

**bills**
- `id` (UUID, PK)
- `vendor`, `amount`, `bill_date`, `status`
- References: `card_id`, `category_id`, `created_by`

**cards**
- `id` (UUID, PK)
- `card_number`, `card_holder`, `card_type`
- `balance`, `card_limit`, `is_active`

**employees**
- `id` (UUID, PK)
- `first_name`, `last_name`, `email`
- `designation`, `base_salary`, `is_active`

**salary**
- `id` (UUID, PK)
- `employee_id`, `month`, `net_salary`
- `base_salary`, `allowances`, `deductions`

**budgets**
- `id` (UUID, PK)
- `category_id`, `limit_amount`, `spent_amount`
- `period`, `alert_threshold`, `is_active`

---

## 🎭 Role-Based Permissions

### Admin Role
- ✅ Full CRUD on all resources
- ✅ Edit all fields
- ✅ User management
- ✅ Session management
- ✅ System configuration

### User Role
- ✅ Read access to all resources
- ✅ Create bills, reminders, petty expenses
- ✅ View dashboard analytics
- ❌ Cannot edit/delete resources
- ❌ No system administration

---

## 🔄 Request Flow

```
1. Client Request
   ↓
2. CORS & Security Headers
   ↓
3. Body Parsing & Logging
   ↓
4. Route Matching
   ↓
5. Authentication (JWT verification)
   ↓
6. Authorization (RBAC check)
   ↓
7. Validation (Zod schemas)
   ↓
8. Business Logic (Services)
   ↓
9. Database Operations
   ↓
10. Response Formatting
    ↓
11. Client Response
```

---

## 📦 Project Structure

```
src/
├── index.ts              # Server entry point
├── config/
│   └── swagger.ts        # API documentation
├── db/
│   ├── supabase.ts       # Database client
│   ├── storage.ts        # File storage
│   └── migrations.ts     # Schema migrations
├── middleware/
│   ├── auth.middleware.ts    # JWT authentication
│   ├── rbac.middleware.ts    # Permissions
│   └── error.middleware.ts   # Error handling
├── routes/
│   ├── auth.routes.ts
│   ├── bills.routes.ts
│   ├── cards.routes.ts
│   └── ... (11 route files)
├── services/
│   ├── bills.service.ts
│   ├── cards.service.ts
│   └── ... (9 service files)
├── types/
│   └── index.ts          # TypeScript types
├── utils/
│   └── rbac.ts           # Permission utilities
└── validators/
    └── index.ts          # Zod schemas
```

---

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start dev server with hot reload

# Build
npm run build            # Compile TypeScript
npm start                # Run production build

# Type checking
npm run typecheck        # Check TypeScript types

# Linting
npm run lint             # Run ESLint

# Database
npm run migrate          # Run migrations
npm run seed             # Seed database
```

---

## 🔍 Common Query Examples

### Filter Bills by Date
```bash
GET /api/bills?startDate=2024-01-01&endDate=2024-12-31
```

### Filter Bills by Status
```bash
GET /api/bills?status=pending
```

### Get Dashboard for Custom Period
```bash
GET /api/dashboard/summary?period=custom_range&startDate=2024-11-01&endDate=2024-11-30
```

### Export Bills to PDF
```bash
GET /api/bills/export/pdf?startDate=2024-01-01
```

---

## ⚠️ Error Handling

### Error Response Format
```json
{
  "error": "Error message",
  "message": "Detailed description",
  "code": "ERROR_CODE",
  "timestamp": "2024-12-09T10:30:00Z"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## 📈 Performance Tips

### Optimize Queries
- Use filters to limit data
- Paginate large result sets
- Request only needed fields

### Caching
- Dashboard data is cached
- Cache invalidated on data changes
- Use KPIs endpoint for fast updates

### Rate Limiting
- 1000 requests/hour (authenticated)
- 10 login attempts per 15 minutes
- 50 file uploads per hour

---

## 🔧 Troubleshooting

### Token Issues
```bash
# Check token expiry
# Refresh token if expired
# Verify token format: "Bearer <token>"
```

### CORS Errors
```bash
# Add frontend URL to .env
FRONTEND_URL=http://localhost:3000
```

### Database Connection
```bash
# Verify Supabase credentials
# Check network connectivity
# Ensure database is running
```

### File Upload Errors
```bash
# Check file size limits
# Verify mime type support
# Ensure storage bucket exists
```

---

## 📞 API Support

### Documentation
- **Swagger UI**: `http://localhost:5000/api-docs`
- **OpenAPI JSON**: `http://localhost:5000/api-docs.json`

### Health Check
```bash
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-12-09T10:30:00Z"
}
```

---

## 🎯 Best Practices

### 1. **Always Include Authorization**
```javascript
headers: {
  'Authorization': 'Bearer ' + token
}
```

### 2. **Handle Errors Gracefully**
```javascript
if (!response.ok) {
  const error = await response.json();
  console.error(error.message);
}
```

### 3. **Validate Data Client-Side**
Reduce API errors by validating before sending.

### 4. **Use Appropriate HTTP Methods**
- GET for reading
- POST for creating
- PUT for updating
- DELETE for removing

### 5. **Implement Token Refresh**
Refresh tokens before expiry to maintain session.

---

## 📝 Example Integration

### JavaScript/TypeScript
```typescript
// API Client
class AccountIQClient {
  private baseUrl = 'http://localhost:5000/api';
  private token: string | null = null;

  async login(email: string, password: string) {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    this.token = data.token;
    return data;
  }

  async getBills(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(`${this.baseUrl}/bills?${query}`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    return await response.json();
  }

  async createBill(billData: any) {
    const response = await fetch(`${this.baseUrl}/bills`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(billData)
    });
    return await response.json();
  }
}
```

---

## 🚀 Deployment

### Environment Variables (Production)
```env
NODE_ENV=production
BACKEND_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
SESSION_SECRET=<strong-random-secret>
```

### Deployment Platforms
- **Vercel**: See `vercel.json`
- **Railway**: One-click deploy
- **Heroku**: Docker support
- **AWS/GCP/Azure**: Container deployment

---

## 📚 Additional Resources

### Documentation Files
1. **ARCHITECTURE.md** - Complete system architecture
2. **FLOW_DIAGRAMS.md** - Visual process flows
3. **API_GUIDE.md** - Detailed API reference
4. **README.md** - Project overview

### Tools & Resources
- **Postman Collection**: Import from `/api-docs.json`
- **Swagger UI**: Interactive API testing
- **TypeScript Types**: Full type definitions
- **Code Examples**: Multiple languages

---

## 🆘 Getting Help

### Issues?
1. Check API documentation
2. Review error messages
3. Verify token validity
4. Check environment variables
5. Consult logs

### Need Support?
- Review documentation files
- Check Swagger UI at `/api-docs`
- Verify request payload structure
- Test with curl or Postman

---

## ✅ Checklist for Integration

- [ ] Environment variables configured
- [ ] Server running successfully
- [ ] Login endpoint working
- [ ] Token stored securely
- [ ] Authentication header included
- [ ] Error handling implemented
- [ ] Token refresh mechanism in place
- [ ] API endpoints tested

---

## 🎉 You're Ready!

You now have everything you need to integrate with the AccountIQ Backend API. Start with the authentication flow, then explore the various endpoints based on your needs.

**Happy Coding! 🚀**
