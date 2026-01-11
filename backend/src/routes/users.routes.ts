import { Router, Response } from 'express';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { ClientContextRequest } from '../middleware/client-context.middleware';

const router = Router();
const usersService = new UsersService();

// Helper function to exclude password from user object
const excludePassword = (user: User): Omit<User, 'password'> => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

router.get('/', async (req: ClientContextRequest, res: Response) => {
  try {
    // Check if the current user is systemadmin
    const isSystemAdmin = req.user?.roleId ? await usersService.isSystemAdmin(req.user.roleId) : false;
    const data = await usersService.findAll(req.clientId, isSystemAdmin);
    const sanitizedData = data.map(excludePassword);
    res.json({ success: true, data: sanitizedData });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid ID' });
    }
    const data = await usersService.findOne(id);
    if (!data) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: excludePassword(data) });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const data = await usersService.create(req.body);
    res.status(201).json({ success: true, data: excludePassword(data) });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid ID' });
    }
    const data = await usersService.update(id, req.body);
    res.json({ success: true, data: excludePassword(data) });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid ID' });
    }
    await usersService.remove(id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export default router;
