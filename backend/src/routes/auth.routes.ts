import { Router, Request, Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { authenticateToken, AuthenticatedRequest } from '../auth/auth.middleware';

const router = Router();
const authService = new AuthService();

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        success: false,
        error: 'Username and password are required',
      });
      return;
    }

    const result = await authService.login({ username, password });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Login failed';
    res.status(401).json({
      success: false,
      error: errorMessage,
    });
  }
});

// Get current user (protected route)
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    const user = await authService.getCurrentUser(req.user.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get user';
    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
});

// Logout endpoint (client-side token removal, but we can add token blacklisting here if needed)
router.post('/logout', authenticateToken, async (req: Request, res: Response) => {
  // In a more advanced implementation, you could blacklist the token here
  // For now, logout is handled client-side by removing the token
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

export default router;
