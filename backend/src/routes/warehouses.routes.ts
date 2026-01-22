import { Router, Response } from 'express';
import { WarehousesService } from '../warehouses/warehouses.service';
import { ClientContextRequest } from '../middleware/client-context.middleware';

const router = Router();
const warehousesService = new WarehousesService();

router.get('/', async (req: ClientContextRequest, res: Response) => {
  try {
    const data = await warehousesService.findAll(req.clientId);
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
    const data = await warehousesService.findOne(id, req.clientId);
    if (!data) {
      return res.status(404).json({ success: false, error: 'Warehouse not found' });
    }
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/', async (req: ClientContextRequest, res: Response) => {
  try {
    if (req.clientId === undefined || req.clientId === null) {
      return res.status(400).json({ success: false, error: 'Client must be selected to create a warehouse.' });
    }
    const data = await warehousesService.create(req.body, req.clientId);
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
    if (req.clientId === undefined || req.clientId === null) {
      return res.status(400).json({ success: false, error: 'Client must be selected to update a warehouse.' });
    }
    const data = await warehousesService.update(id, req.body, req.clientId);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.delete('/:id', async (req: ClientContextRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid ID' });
    }
    if (req.clientId === undefined || req.clientId === null) {
      return res.status(400).json({ success: false, error: 'Client must be selected to delete a warehouse.' });
    }
    await warehousesService.remove(id, req.clientId);
    res.json({ success: true, message: 'Warehouse deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export default router;
