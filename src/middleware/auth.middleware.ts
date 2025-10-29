import { Request, Response, NextFunction } from 'express';
import { getSupabaseClient } from '../db/db';
import { AuthPayload, UserRole } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
      auth?: any; // Supabase auth object
    }
  }
}

/**
 * Middleware to verify Supabase JWT token and attach user to request
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token with Supabase
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Get user details from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError || !userData) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user info to request
    req.user = {
      userId: data.user.id,
      email: data.user.email || userData.email,
      role: (userData.role || 'user') as UserRole,
    } as AuthPayload;

    req.auth = data;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

/**
 * Middleware to check if user has specific roles
 */
export const authorize = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role as UserRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

/**
 * Middleware to check if user is admin
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

/**
 * Middleware to check if user is authenticated (optional middleware)
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // User is not authenticated, but that's OK
      next();
      return;
    }

    const token = authHeader.substring(7);
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.getUser(token);

    if (!error && data.user) {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userData) {
        req.user = {
          userId: data.user.id,
          email: data.user.email || userData.email,
          role: (userData.role || 'user') as UserRole,
        } as AuthPayload;
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next();
  }
};

