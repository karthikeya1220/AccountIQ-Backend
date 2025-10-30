import { Router } from 'express';
import { supabaseAdmin } from '../db/supabase';
import { authenticate, authorize, isAdmin, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { UserRole } from '../types';

const router = Router();
const supabase = getSupabaseClient();

// Sign up (register new user)
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Sign in with Supabase Auth
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Get user role from public.users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name, role, is_active')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (userError || !userData) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    // Update last login
    await supabaseAdmin
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userData.id);

    // Return Supabase session and user data
    res.json({
      token: data.session!.access_token,
      refresh_token: data.session!.refresh_token,
      user: userData,
    });
  })
);

// Login
router.post(
  '/register',
  authenticate,
  isAdmin,
  asyncHandler(async (req: AuthRequest, res) => {
    const { email, password, firstName, lastName, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user already exists in public.users
    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    });

    if (authError) {
      return res.status(400).json({ message: `Failed to create user: ${authError.message}` });
    }

    // Create user record in public.users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        role: role || 'user',
        is_active: true,
      })
      .select('id, email, first_name, last_name, role, created_at')
      .single();

    if (userError) {
      // Rollback: delete auth user if public.users insert fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return res.status(500).json({ message: `Failed to create user profile: ${userError.message}` });
    }

    res.status(201).json(userData);
  })
);

// Refresh token
router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    const { data, error } = await supabaseAdmin.auth.refreshSession({
      refresh_token,
    });

    if (error) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    res.json({
      token: data.session!.access_token,
      refresh_token: data.session!.refresh_token,
    });
  })
);

// Logout
router.post(
  '/logout',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    // Get the token from authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      // Sign out the user (invalidates the token)
      await supabaseAdmin.auth.admin.signOut(token);
    }

    res.json({ message: 'Logged out successfully' });
  })
);

// Get current user
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name, role, is_active, last_login_at, created_at')
      .eq('id', req.user!.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(data);
  })
);

export default router;

