import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../db/supabase';
import { AuthPayload, UserRole } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token with Supabase Auth
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user role from public.users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, role')
      .eq('id', data.user.id)
      .eq('is_active', true)
      .single();

    if (userError || !userData) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    // Attach user to request
    req.user = {
      id: userData.id,
      email: userData.email,
      role: userData.role as UserRole,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role as UserRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
