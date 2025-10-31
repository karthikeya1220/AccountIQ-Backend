# Accounting Dashboard - Full Stack TypeScript Application

A comprehensive internal accounting web application built for IT consulting startups using **TypeScript** throughout the entire stack: Next.js frontend, Express.js backend, and PostgreSQL database.

## 🎯 Project Overview

This accounting dashboard provides complete financial management capabilities including:

- **Daily Bills Management**: Upload, track, and manage bills with image/PDF proof
- **Card Management**: CRUD operations for company credit/debit cards with balance tracking
- **Cash Transactions**: Log and export cash payments separately
- **Salary Management**: Track monthly salary distribution linked to employees
- **Petty Expenses**: Quick entry for small expenses with monthly summaries
- **Reminders & Notifications**: Daily notifications for bills/expenses (UI and email)
- **Dashboard Analytics**: Interactive charts and KPIs with real-time data
- **Budget Management**: Configurable expense categories with alerts and visual indicators
- **Session Management**: Admin-only session controls and user tracking
- **Dark/Light Mode**: User preference-based theme switching with persistence

## 📋 Core Features

### 1. Bills Management
- Upload bills with image/PDF attachments
- Link bills to specific cards
- Filter by date range, vendor, or amount
- Export to PDF or Excel
- Status tracking (pending/approved/rejected)

### 2. Card Management
- Add/edit company credit and debit cards
- Real-time balance tracking
- Card limit management
- Link expenses directly to cards
- Deactivate cards while preserving history

### 3. Cash Transactions
- Log cash income and expenses
- Category-based organization
- Monthly export capabilities
- Transaction history and filtering

### 4. Salary Management
- Monthly salary calculation and tracking
- Employee-linked salary records
- Allowances and deductions support
- Payment status management
- Bulk export for payroll

### 5. Petty Expenses
- Quick entry interface for small expenses
- No approval workflow needed
- Monthly summary and statistics
- Running totals and average calculations

### 6. Budget Control
- Set budget limits by category
- Monthly, quarterly, and annual periods
- Real-time spent vs. limit visualization
- Budget alerts with color-coded warnings
- Budget status dashboard

### 7. Reminders & Notifications
- Configurable reminders for bills and expenses
- Email and in-app notifications
- Daily reminder digest
- Upcoming events calendar

### 8. Analytics Dashboard
- KPI summary cards
- Monthly expense trends (line chart)
- Expense distribution by category (pie chart)
- Recent transactions feed
- Budget status overview

## 🏗 Project Structure

```
Accounting-Dashboard/
├── backend/                          # Express.js + TypeScript Backend
│   ├── src/
│   │   ├── index.ts                 # Main Express server
│   │   ├── types/index.ts           # Shared TypeScript types/interfaces
│   │   ├── db/
│   │   │   ├── db.ts                # PostgreSQL connection pool
│   │   │   └── migrations.ts        # Database schema initialization
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts   # JWT verification & role-based access
│   │   │   └── error.middleware.ts  # Global error handling
│   │   ├── services/index.ts        # Business logic (Auth, Bills, etc.)
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── bills.routes.ts
│   │   │   ├── cards.routes.ts
│   │   │   ├── cash-transactions.routes.ts
│   │   │   ├── salary.routes.ts
│   │   │   ├── petty-expenses.routes.ts
│   │   │   ├── reminders.routes.ts
│   │   │   ├── budgets.routes.ts
│   │   │   ├── dashboard.routes.ts
│   │   │   └── sessions.routes.ts
│   │   └── validators/index.ts      # Zod input validation schemas
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/                         # Next.js 14 + TypeScript Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx           # Root layout with header/sidebar
│   │   │   ├── page.tsx             # Dashboard homepage
│   │   │   ├── bills/page.tsx       # Bills module page
│   │   │   ├── cards/page.tsx       # Cards management page
│   │   │   ├── cash-transactions/page.tsx
│   │   │   ├── salary/page.tsx
│   │   │   ├── petty-expenses/page.tsx
│   │   │   ├── budgets/page.tsx
│   │   │   └── reminders/page.tsx
│   │   ├── components/
│   │   │   ├── ui/index.tsx         # Button, Input, Select, Card, Badge
│   │   │   ├── common/index.tsx     # FileUpload, Modal, Toast
│   │   │   ├── layout/index.tsx     # Header, Sidebar, Footer
│   │   │   ├── dashboard/index.tsx  # Dashboard KPIs and charts
│   │   │   └── modules/
│   │   │       ├── BillsModule.tsx
│   │   │       ├── CardsModule.tsx
│   │   │       ├── PettyExpensesModule.tsx
│   │   │       └── BudgetsModule.tsx
│   │   ├── contexts/ThemeContext.tsx # Dark/Light theme provider
│   │   ├── services/api.ts          # Axios-based API client
│   │   ├── stores/index.ts          # Zustand state management
│   │   ├── types/index.ts           # TypeScript interfaces
│   │   ├── utils/
│   │   │   ├── date.ts
│   │   │   ├── pdf.ts               # PDF export with jsPDF
│   │   │   └── excel.ts             # Excel export with XLSX
│   │   └── styles/globals.css
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   └── postcss.config.js
│
├── .env.example                      # Environment variables template
└── README.md                         # This file
```

## 🛠 Technology Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **TypeScript** | Type-safe JavaScript |
| **PostgreSQL** | Relational database |
| **JWT** | Authentication & authorization |
| **Bcrypt** | Password hashing |
| **Multer** | File uploads |
| **AWS S3** | Cloud file storage |
| **Zod** | Input validation |
| **Nodemailer** | Email notifications |
| **node-cron** | Task scheduling |
| **Pino** | Structured logging |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type-safe components |
| **React 18** | UI library |
| **Tailwind CSS** | Utility-first CSS |
| **Zustand** | State management |
| **Axios** | HTTP client |
| **Recharts** | Chart library |
| **jsPDF** | PDF generation |
| **XLSX** | Excel export |
| **react-dropzone** | File upload UI |
| **date-fns** | Date manipulation |

### Database
| Table | Purpose |
|-------|---------|
| **users** | User accounts and authentication |
| **employees** | Employee records |
| **bills** | Invoice/bill tracking |
| **cards** | Company cards |
| **cash_transactions** | Cash payments |
| **salaries** | Monthly salary records |
| **petty_expenses** | Small expenses |
| **reminders** | Notifications |
| **budgets** | Budget limits |
| **sessions** | User sessions |

## 🚀 Quick Start Guide

### Prerequisites
```bash
# Required versions
Node.js >= 18.x
npm >= 9.x (or yarn)
```

### Choose Your Setup

#### Option A: Supabase (Recommended - 5 minutes) ⭐

**Benefits**: No PostgreSQL installation, built-in auth, file storage, real-time features

```bash
# 1. Create Supabase project at https://supabase.com
# 2. Run automated setup
chmod +x supabase-quick-start.sh
./supabase-quick-start.sh

# 3. Follow on-screen instructions
# See SUPABASE_QUICK_START.md for details
```

#### Option B: Self-hosted PostgreSQL (Traditional)

```bash
# 1. Install PostgreSQL 12+
# 2. Run setup
chmod +x quick-start.sh
./quick-start.sh

# See SETUP_GUIDE.md for detailed instructions
```

### Installation

1. **Clone and navigate**
```bash
git clone https://github.com/karthikeya1220/Accounting-Dashboard.git
cd Accounting-Dashboard
```

2. **Choose setup method**
- **Supabase**: See `SUPABASE_QUICK_START.md`
- **PostgreSQL**: See `SETUP_GUIDE.md`

3. **Start services**
```bash
# Backend (Terminal 1)
cd backend && npm run dev

# Frontend (Terminal 2)
cd frontend/accounting-dashboard-frontend && npm run dev
```

4. **Access application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Default login: `admin@accounting.com` / `admin123`

## 🔐 Authentication & Security

### JWT Flow
1. User logs in with email/password
2. Server validates and returns JWT token
3. Client stores token in localStorage
4. API requests include token in Authorization header
5. Server middleware verifies token and extracts user info

### Role-Based Access Control
```typescript
// Admin role - Full access
- Create/edit/delete any record
- Manage users and permissions
- Access session management
- View all reports

// User role - Limited access
- View own records
- Create new expenses
- Export own data
- View shared dashboards
```

### Security Features
✅ Password hashing with bcrypt (10 rounds)
✅ JWT with 7-day expiry + refresh tokens
✅ CORS properly configured
✅ Helmet.js security headers
✅ Input validation with Zod
✅ SQL injection prevention via parameterized queries
✅ Secure session management
✅ HttpOnly cookies for sensitive data

## 📊 Key API Endpoints

> 💡 **Tip**: For interactive testing and complete API documentation, visit the Swagger UI at http://localhost:5000/api-docs

### Authentication
```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me
```

### Bills
```
GET    /api/bills?startDate=&endDate=
POST   /api/bills
PUT    /api/bills/:id
DELETE /api/bills/:id
GET    /api/bills/export/pdf
GET    /api/bills/export/excel
POST   /api/bills/:id/upload
```

### Cards
```
GET    /api/cards
POST   /api/cards (admin only)
PUT    /api/cards/:id (admin only)
DELETE /api/cards/:id (admin only)
GET    /api/cards/:id/balance
```

### Budgets
```
GET    /api/budgets
POST   /api/budgets (admin only)
PUT    /api/budgets/:id (admin only)
GET    /api/budgets/alerts/current
```

## 💡 Code Examples

### Creating a Bill (Frontend)
```typescript
// In component
const { apiClient } = useServices();
const [loading, setLoading] = useState(false);

const handleCreateBill = async (billData) => {
  setLoading(true);
  try {
    const response = await apiClient.createBill({
      vendor: billData.vendor,
      amount: parseFloat(billData.amount),
      billDate: new Date(billData.date),
      description: billData.description,
    });
    
    // Handle success
    showToast('Bill created successfully', 'success');
  } catch (error) {
    showToast('Failed to create bill', 'error');
  } finally {
    setLoading(false);
  }
};
```

### Bill Service (Backend)
```typescript
// In BillService
static async createBill(data: any, userId: string) {
  const result = await query(
    `INSERT INTO bills (bill_date, vendor, amount, description, created_by) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING *`,
    [data.billDate, data.vendor, data.amount, data.description, userId]
  );
  return result.rows[0];
}
```

### Budget Alert Logic
```typescript
// Check if budget is exceeded
static async checkBudgetAlert(categoryId: string) {
  const budget = await getBudgetById(categoryId);
  const percentage = (budget.spent / budget.limit) * 100;
  
  return {
    exceeded: percentage > 100,
    warning: percentage > 80,
    percentage,
    status: percentage > 100 ? 'danger' : percentage > 80 ? 'warning' : 'ok'
  };
}
```

## 🎨 Component Library

### UI Components

**Button**
```tsx
<Button variant="primary" size="md" loading={false}>
  Submit
</Button>
```

**Input**
```tsx
<Input 
  label="Amount" 
  type="number" 
  error={errors.amount}
  placeholder="0.00"
/>
```

**Card**
```tsx
<Card header={<h3>Bills Summary</h3>}>
  Content here
</Card>
```

**Modal**
```tsx
<Modal 
  isOpen={open} 
  onClose={() => setOpen(false)}
  title="Add Bill"
  footer={<Button>Submit</Button>}
>
  Form content
</Modal>
```

**FileUpload**
```tsx
<FileUpload 
  onFile={(file) => handleFileSelect(file)}
  accept="image/*,application/pdf"
  maxSize={10 * 1024 * 1024}
/>
```

## 📈 Dashboard Features

### KPI Cards
- Total Expenses (current month)
- Monthly Budget Usage (%)
- Active Cards Count
- Pending Bills Count

### Charts
- **Line Chart**: Monthly expense trend
- **Pie Chart**: Expense distribution by category
- **Bar Chart**: Budget vs. spent comparison

### Real-time Updates
- Recent transactions feed
- Budget status indicators
- Alerts for exceeded budgets

## 🧪 Development

### Type Checking
```bash
# Backend
cd backend && npm run typecheck

# Frontend
cd frontend && npm run typecheck
```

### Build for Production
```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
```

### Run in Production
```bash
# Backend
cd backend && npm start

# Frontend
cd frontend && npm start
```

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Database connection error | Check DATABASE_URL in .env, ensure PostgreSQL is running |
| CORS error | Verify FRONTEND_URL in backend .env, check CORS middleware |
| Module not found | Run `npm install` in affected directory |
| TypeScript errors | Run `npm run typecheck` to see all type errors |
| Port already in use | Change port in .env or kill existing process |

## 📚 Environment Configuration

### Backend .env
```bash
BACKEND_PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/accounting_db
JWT_SECRET=your_min_32_char_secret_key_here
JWT_EXPIRY=7d
REFRESH_TOKEN_SECRET=your_refresh_secret
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_BUCKET_NAME=accounting-uploads
SESSION_SECRET=your_session_secret
```

### Frontend .env.local
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=Accounting Dashboard
```

## 📝 Database Initialization

```sql
-- Create database
CREATE DATABASE accounting_db;

-- Connect and run migrations
psql -U postgres -d accounting_db -f migrations.sql
```

Or use the provided migration script:
```bash
cd backend
npm run migrate
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run backend
docker build -t accounting-backend ./backend
docker run -p 5000:5000 accounting-backend

# Build and run frontend
docker build -t accounting-frontend ./frontend
docker run -p 3000:3000 accounting-frontend
```

### Production Checklist

## 📖 API Documentation (Swagger)

Interactive API documentation is available via Swagger UI:

**Access Swagger UI**: http://localhost:5000/api-docs

### Features
- 🔍 **Interactive Testing** - Test all API endpoints directly from the browser
- 📋 **Comprehensive Docs** - Complete request/response schemas for all endpoints
- 🔐 **Authentication** - Built-in JWT token management
- 📊 **Schema Definitions** - All data models documented with examples
- 🏷️ **Organized by Tags** - Endpoints grouped by feature (Auth, Bills, Cards, etc.)

### Quick Start with Swagger

1. **Start the backend server**
  ```bash
  cd backend && npm run dev
  ```

2. **Open Swagger UI**
  ```
  http://localhost:5000/api-docs
  ```

3. **Authenticate**
  - Use `POST /api/auth/login` to get a token
  - Click the 🔒 "Authorize" button
  - Paste your token
  - Test protected endpoints

### Documentation Files
- **Setup Guide**: `backend/SWAGGER_SETUP.md`
- **Implementation Summary**: `backend/SWAGGER_IMPLEMENTATION.md`
- **Swagger Config**: `backend/src/config/swagger.ts`

### Documented Endpoints
Currently documented:
- ✅ Authentication (5 endpoints)
- ✅ Bills (7 endpoints)
- ✅ Employees (5 endpoints)

See `SWAGGER_IMPLEMENTATION.md` for complete documentation status.

## 📄 License

MIT License - See LICENSE file for details

## 👥 Support

For issues and questions:
- 📧 Email: support@accounting-dashboard.com
- 🐛 GitHub Issues: Create an issue on repository
- 💬 Discussions: Join community discussions

## 🎓 Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Next.js Docs](https://nextjs.org/docs)
- [PostgreSQL Manual](https://www.postgresql.org/docs/current/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Version**: 1.0.0  
**Status**: Production Ready  
**Last Updated**: October 2025
