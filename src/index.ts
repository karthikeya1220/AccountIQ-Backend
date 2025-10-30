import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import pinoHttp from 'pino-http';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/auth.routes';
import billRoutes from './routes/bills.routes';
import cardRoutes from './routes/cards.routes';
import cashTransactionRoutes from './routes/cash-transactions.routes';
import salaryRoutes from './routes/salary.routes';
import pettyExpenseRoutes from './routes/petty-expenses.routes';
import reminderRoutes from './routes/reminders.routes';
import budgetRoutes from './routes/budgets.routes';
import dashboardRoutes from './routes/dashboard.routes';
import sessionRoutes from './routes/sessions.routes';
import employeesRoutes from './routes/employees.routes';
import { errorHandler } from './middleware/error.middleware';
import initializeStorageBuckets from './db/storage-init';

// Load environment variables from the backend directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app: Express = express();
const PORT = process.env.BACKEND_PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration: allow localhost:3000 and Codespaces app.github.dev by default
const defaultAllowedOrigins = [
  'http://localhost:3000',
  'https://localhost:3000',
];

// Support comma-separated FRONTEND_URLS and single FRONTEND_URL
const envOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS ? process.env.FRONTEND_URLS.split(',').map((s) => s.trim()) : []),
].filter(Boolean) as string[];

// Regex for GitHub Codespaces forwarded URLs (port 3000)
const codespacesRegex = /^https:\/\/[a-z0-9-]+-3000\.app\.github\.dev$/;

const allowedOrigins = [...defaultAllowedOrigins, ...envOrigins];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow server-to-server, curl, etc.
    const allowed = allowedOrigins.includes(origin) || codespacesRegex.test(origin);
    if (allowed) return callback(null, true);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
// Explicitly handle preflight across routes
app.options('*', cors(corsOptions));

// Logging
app.use(pinoHttp());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
}));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/cash-transactions', cashTransactionRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/petty-expenses', pettyExpenseRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/sessions', sessionRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize storage buckets
initializeStorageBuckets().catch((error) => {
  console.error('Storage initialization error:', error);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});

export default app;
