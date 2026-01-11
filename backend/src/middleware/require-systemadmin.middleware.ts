import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../auth/auth.middleware';
import { AppDataSource } from '../database/database';
import { Role } from '../roles/role.entity';

/**
 * Middleware to ensure only systemadmin role can access the route
 */
export const requireSystemAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.roleId) {
      res.status(403).json({
        success: false,
        error: 'Access denied. System administrator role required.',
      });
      return;
    }

    // Fetch the role to check its name
    const roleRepository = AppDataSource.getRepository(Role);
    const role = await roleRepository.findOne({
      where: { id: req.user.roleId },
    });

    if (!role || role.name.toLowerCase() !== 'systemadmin') {
      res.status(403).json({
        success: false,
        error: 'Access denied. This resource is only accessible to system administrators.',
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error checking permissions',
    });
  }
};
