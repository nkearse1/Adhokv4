import { Request, Response, NextFunction } from 'express';
import { supabase } from '@supabase/supabaseClient';

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

/**
 * Authentication middleware
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // Get authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header is required' });
    }
    
    // Extract token
    const token = authHeader.replace('Bearer ', '');
    
    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Get user role from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('user_role')
      .eq('id', data.user.id)
      .single();
    
    if (userError) {
      console.error('Error getting user role:', userError);
      return res.status(500).json({ error: 'Failed to get user role' });
    }
    
    // Set user in request
    req.user = {
      id: data.user.id,
      role: userData?.user_role || 'talent'
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

/**
 * Check if user is admin
 */
export async function isAdmin(req: Request): Promise<boolean> {
  if (!req.user) return false;
  
  return req.user.role === 'admin';
}