import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import pinoHttp from 'pino-http';
import dotenv from 'dotenv';

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
import { errorHandler } from './middleware/error.middleware';
import initializeStorageBuckets from './db/storage-init';

dotenv.config();

const app: Express = express();
const PORT = process.env.BACKEND_PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

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
