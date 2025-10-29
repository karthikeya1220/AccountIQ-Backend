import { Router, Request, Response } from 'express';
import { getSupabaseClient } from '../db/db';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { UserRole } from '../types';

const router = Router();
const supabase = getSupabaseClient();

// Sign up (register new user)
router.post(
  '/signup',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
      // Create user in Supabase Auth
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email for now
      });

      if (error || !data.user) {
        return res.status(400).json({ error: error?.message || 'Failed to create user' });
      }

      // Create user profile in users table
      const { error: profileError } = await supabase.from('users').insert([
        {
          id: data.user.id,
          email,
          name: name || email.split('@')[0],
          role: UserRole.USER,
        },
      ]);

      if (profileError) {
        // Clean up: delete auth user if profile creation fails
        await supabase.auth.admin.deleteUser(data.user.id);
        return res.status(400).json({ error: 'Failed to create user profile' });
      }

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        user: {
          id: data.user.id,
          email: data.user.email,
          name,
        },
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  })
);

// Login
router.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
      // Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.session) {
        return res.status(401).json({ error: error?.message || 'Invalid credentials' });
      }

      // Get user profile
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      res.json({
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: userData?.name,
          role: userData?.role || UserRole.USER,
        },
        session: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresIn: data.session.expires_in,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  })
);

// Refresh token
router.post(
  '/refresh',
  asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    try {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error || !data.session) {
        return res.status(401).json({ error: 'Failed to refresh token' });
      }

      res.json({
        success: true,
        session: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresIn: data.session.expires_in,
        },
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  })
);

// Logout
router.post(
  '/logout',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        await supabase.auth.signOut(); // This doesn't require token in backend
      }

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  })
);

// Get current user
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    res.json({
      success: true,
      user: req.user,
    });
  })
);

// Create new user (admin only)
router.post(
  '/users',
  authenticate,
  isAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
      // Create user in Supabase Auth
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (error || !data.user) {
        return res.status(400).json({ error: error?.message || 'Failed to create user' });
      }

      // Create user profile
      const { error: profileError } = await supabase.from('users').insert([
        {
          id: data.user.id,
          email,
          name: name || email.split('@')[0],
          role: role || UserRole.USER,
        },
      ]);

      if (profileError) {
        await supabase.auth.admin.deleteUser(data.user.id);
        return res.status(400).json({ error: 'Failed to create user profile' });
      }

      res.status(201).json({
        success: true,
        user: {
          id: data.user.id,
          email,
          name,
          role: role || UserRole.USER,
        },
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  })
);

// Delete user (admin only)
router.delete(
  '/users/:userId',
  authenticate,
  isAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  })
);

export default router;

