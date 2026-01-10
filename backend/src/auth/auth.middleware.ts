import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    username: string;
    roleId: number | null;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Authentication required. Please provide a valid token.',
      });
      return;
    }

    const authService = new AuthService();
    const payload = await authService.verifyToken(token);

    // Attach user info to request
    req.user = {
      userId: payload.userId,
      username: payload.username,
      roleId: payload.roleId,
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token. Please login again.',
    });
  }
};
