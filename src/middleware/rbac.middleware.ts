import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import {
  validateEditPermission,
  filterEditableFields,
  FIELD_PERMISSIONS,
} from '../utils/rbac';

/**
 * Middleware to check edit permissions for a specific resource
 * Usage: router.put('/:id', requireEditPermission('bills'), handler)
 */
export const requireEditPermission = (resource: keyof typeof FIELD_PERMISSIONS) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as AuthRequest).user;
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Check if user can edit this resource at all
      const permissions = FIELD_PERMISSIONS[resource];
      if (!permissions) {
        return res.status(400).json({ error: 'Invalid resource' });
      }

      const rolePermissions = (permissions[user.role as keyof typeof permissions] || []) as string[];
      
      if (rolePermissions.length === 0) {
        return res.status(403).json({
          error: 'Edit access denied',
          message: `${user.role} users cannot edit ${resource}`,
        });
      }

      // Validate specific fields being updated
      const fieldsToUpdate = Object.keys(req.body);
      const validation = validateEditPermission(user.role, resource, fieldsToUpdate);

      if (!validation.allowed) {
        return res.status(403).json({
          error: 'Field edit access denied',
          message: `You cannot edit the following fields: ${validation.deniedFields.join(', ')}`,
          deniedFields: validation.deniedFields,
          allowedFields: rolePermissions,
        });
      }

      // Filter body to only include editable fields
      (req as any).editableData = filterEditableFields(user.role, resource, req.body);

      next();
    } catch (error) {
      console.error('Edit permission error:', error);
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

/**
 * Middleware to only allow admin users to edit
 * Usage: router.put('/:id', adminOnly, handler)
 */
export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as AuthRequest).user;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access denied',
      message: 'Only admin users can perform this action',
    });
  }
  next();
};

/**
 * Middleware to apply field-level permissions to response
 * Marks which fields are editable for the current user
 */
export const attachEditPermissions = (resource: keyof typeof FIELD_PERMISSIONS) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as AuthRequest).user;
      if (!user) {
        return next();
      }

      const permissions = FIELD_PERMISSIONS[resource];
      if (!permissions) {
        return next();
      }

      const editableFields = (permissions[user.role as keyof typeof permissions] || []) as string[];

      // Store in request for use in handlers
      (req as any).editableFields = editableFields;
      (req as any).userRole = user.role;

      next();
    } catch (error) {
      console.error('Attach permissions error:', error);
      next();
    }
  };
};

/**
 * Helper to wrap responses with permission metadata
 */
export const withPermissionMetadata = (
  data: Record<string, any>,
  editableFields: string[],
  userRole: string
) => {
  return {
    ...data,
    _metadata: {
      editable: editableFields,
      editingEnabled: editableFields.length > 0,
      userRole,
    },
  };
};
