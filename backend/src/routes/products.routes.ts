import { Router, Response } from 'express';
import { ProductsService } from '../products/products.service';
import { ClientContextRequest } from '../middleware/client-context.middleware';

const router = Router();
const productsService = new ProductsService();

router.get('/', async (req: ClientContextRequest, res: Response) => {
  try {
    const data = await productsService.findAll(req.clientId);
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
    const data = await productsService.findOne(id, req.clientId);
    if (!data) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/', async (req: ClientContextRequest, res: Response) => {
  try {
    if (!req.clientId) {
      return res.status(400).json({ success: false, error: 'Client selection is required to create a product' });
    }
    const data = await productsService.create(req.body, req.clientId);
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
    const data = await productsService.update(id, req.body, req.clientId);
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
    await productsService.remove(id, req.clientId);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export default router;
