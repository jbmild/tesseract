import { Router, Request, Response } from 'express';
import { RolesService } from '../roles/roles.service';
import { ClientContextRequest } from '../middleware/client-context.middleware';

const router = Router();
const rolesService = new RolesService();

router.get('/', async (req: ClientContextRequest, res: Response) => {
  try {
    const data = await rolesService.findAll(req.clientId);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.get('/:id', async (req: ClientContextRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid ID' });
    }
    const data = await rolesService.findOne(id, req.clientId);
    if (!data) {
      return res.status(404).json({ success: false, error: 'Role not found' });
    }
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/', async (req: ClientContextRequest, res: Response) => {
  try {
    // Use clientId from request body if provided, otherwise use context clientId
    // This allows selecting a client when "All" is selected
    const clientId = req.body.clientId !== undefined ? req.body.clientId : req.clientId;
    // Ensure clientId is in the roleData for the service
    const roleData = { ...req.body, clientId };
    const data = await rolesService.create(roleData, clientId);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.put('/:id', async (req: ClientContextRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid ID' });
    }
    // Use clientId from request body if provided, otherwise use context clientId
    // This allows selecting a client when "All" is selected
    const clientId = req.body.clientId !== undefined ? req.body.clientId : req.clientId;
    // Ensure clientId is in the roleData for the service
    const roleData = { ...req.body, clientId };
    const data = await rolesService.update(id, roleData, clientId);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/:id/permissions', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid ID' });
    }
    const { permissionIds } = req.body;
    if (!Array.isArray(permissionIds)) {
      return res.status(400).json({ success: false, error: 'permissionIds must be an array' });
    }
    const data = await rolesService.assignPermissions(id, permissionIds);
    res.json({ success: true, data });
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
    await rolesService.remove(id);
    res.json({ success: true, message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export default router;
