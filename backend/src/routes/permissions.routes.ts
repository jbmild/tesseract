import { Router, Request, Response } from 'express';
import { PermissionsService } from '../permissions/permissions.service';
import { Express } from 'express';

const router = Router();
const permissionsService = new PermissionsService();

// Store app reference for route scanning
let appInstance: Express | null = null;

export function setAppInstance(app: Express) {
  appInstance = app;
}

// Sync permissions from routes
router.post('/sync', async (req: Request, res: Response) => {
  try {
    if (!appInstance) {
      return res.status(500).json({ success: false, error: 'App instance not available' });
    }
    const data = await permissionsService.syncFromRoutes(appInstance);
    res.json({ success: true, data, message: `Synced ${data.length} permissions from routes` });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const resource = req.query.resource as string | undefined;
    const data = resource
      ? await permissionsService.findByResource(resource)
      : await permissionsService.findAll();
    res.json({ success: true, data });
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
    const data = await permissionsService.findOne(id);
    if (!data) {
      return res.status(404).json({ success: false, error: 'Permission not found' });
    }
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// Note: Manual CRUD operations are disabled - permissions are auto-generated from routes
// Use POST /api/permissions/sync to update permissions from current routes
router.post('/', async (req: Request, res: Response) => {
  res.status(400).json({ 
    success: false, 
    error: 'Permissions are auto-generated from routes. Use POST /api/permissions/sync to sync permissions.' 
  });
});

router.put('/:id', async (req: Request, res: Response) => {
  res.status(400).json({ 
    success: false, 
    error: 'Permissions are auto-generated from routes. Use POST /api/permissions/sync to sync permissions.' 
  });
});

router.delete('/:id', async (req: Request, res: Response) => {
  res.status(400).json({ 
    success: false, 
    error: 'Permissions are auto-generated from routes. Use POST /api/permissions/sync to sync permissions.' 
  });
});

export default router;
