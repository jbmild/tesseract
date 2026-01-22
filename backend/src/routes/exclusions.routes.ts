import { Router, Response } from 'express';
import { ExclusionsService } from '../warehouses/exclusions.service';
import { ClientContextRequest } from '../middleware/client-context.middleware';
import { generatePossibleValues } from '../warehouses/warehouse-utils';

const router = Router();
const exclusionsService = new ExclusionsService();

// Get all exclusions for a warehouse with possible values
router.get('/warehouse/:warehouseId', async (req: ClientContextRequest, res: Response) => {
  try {
    const warehouseId = parseInt(req.params.warehouseId, 10);
    if (isNaN(warehouseId)) {
      return res.status(400).json({ success: false, error: 'Invalid warehouse ID' });
    }

    // Verify warehouse belongs to client (if client is selected) and get warehouse data
    const { AppDataSource } = await import('../database/database');
    const { Warehouse } = await import('../warehouses/warehouse.entity');
    const { Location } = await import('../locations/location.entity');
    const warehouseRepository = AppDataSource.getRepository(Warehouse);
    
    let warehouse;
    if (req.clientId !== undefined && req.clientId !== null) {
      warehouse = await warehouseRepository
        .createQueryBuilder('warehouse')
        .leftJoinAndSelect('warehouse.location', 'location')
        .where('warehouse.id = :warehouseId', { warehouseId })
        .andWhere('location.clientId = :clientId', { clientId: req.clientId })
        .getOne();

      if (!warehouse) {
        return res.status(404).json({ success: false, error: 'Warehouse not found or does not belong to the selected client' });
      }
    } else {
      warehouse = await warehouseRepository.findOne({ where: { id: warehouseId } });
      if (!warehouse) {
        return res.status(404).json({ success: false, error: 'Warehouse not found' });
      }
    }

    const exclusions = await exclusionsService.findAllByWarehouse(warehouseId);
    
    // Generate possible values for each dimension
    const possibleValues = {
      aisle: generatePossibleValues(warehouse.aisleType, warehouse.aisleCount),
      bay: generatePossibleValues(warehouse.bayType, warehouse.bayCount),
      level: generatePossibleValues(warehouse.levelType, warehouse.levelCount),
      bin: generatePossibleValues(warehouse.binType, warehouse.binCount),
    };

    res.json({ success: true, data: exclusions, possibleValues });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.get('/:id', async (req: ClientContextRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const warehouseId = parseInt(req.query.warehouseId as string, 10);
    
    if (isNaN(id) || isNaN(warehouseId)) {
      return res.status(400).json({ success: false, error: 'Invalid ID' });
    }

    const data = await exclusionsService.findOne(id, warehouseId);
    if (!data) {
      return res.status(404).json({ success: false, error: 'Exclusion not found' });
    }
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/', async (req: ClientContextRequest, res: Response) => {
  try {
    const { warehouseId } = req.body;
    if (!warehouseId || isNaN(parseInt(warehouseId, 10))) {
      return res.status(400).json({ success: false, error: 'Warehouse ID is required' });
    }

    // Verify warehouse belongs to client (if client is selected)
    if (req.clientId !== undefined && req.clientId !== null) {
      const { AppDataSource } = await import('../database/database');
      const { Warehouse } = await import('../warehouses/warehouse.entity');
      const { Location } = await import('../locations/location.entity');
      const warehouseRepository = AppDataSource.getRepository(Warehouse);
      
      const warehouse = await warehouseRepository
        .createQueryBuilder('warehouse')
        .leftJoinAndSelect('warehouse.location', 'location')
        .where('warehouse.id = :warehouseId', { warehouseId: parseInt(warehouseId, 10) })
        .andWhere('location.clientId = :clientId', { clientId: req.clientId })
        .getOne();

      if (!warehouse) {
        return res.status(404).json({ success: false, error: 'Warehouse not found or does not belong to the selected client' });
      }
    }

    const data = await exclusionsService.create(req.body, parseInt(warehouseId, 10));
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.put('/:id', async (req: ClientContextRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { warehouseId } = req.body;
    
    if (isNaN(id) || !warehouseId || isNaN(parseInt(warehouseId, 10))) {
      return res.status(400).json({ success: false, error: 'Invalid ID or warehouse ID' });
    }

    // Verify warehouse belongs to client (if client is selected)
    if (req.clientId !== undefined && req.clientId !== null) {
      const { AppDataSource } = await import('../database/database');
      const { Warehouse } = await import('../warehouses/warehouse.entity');
      const { Location } = await import('../locations/location.entity');
      const warehouseRepository = AppDataSource.getRepository(Warehouse);
      
      const warehouse = await warehouseRepository
        .createQueryBuilder('warehouse')
        .leftJoinAndSelect('warehouse.location', 'location')
        .where('warehouse.id = :warehouseId', { warehouseId: parseInt(warehouseId, 10) })
        .andWhere('location.clientId = :clientId', { clientId: req.clientId })
        .getOne();

      if (!warehouse) {
        return res.status(404).json({ success: false, error: 'Warehouse not found or does not belong to the selected client' });
      }
    }

    const data = await exclusionsService.update(id, req.body, parseInt(warehouseId, 10));
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.delete('/:id', async (req: ClientContextRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const warehouseId = parseInt(req.query.warehouseId as string, 10);
    
    if (isNaN(id) || isNaN(warehouseId)) {
      return res.status(400).json({ success: false, error: 'Invalid ID or warehouse ID' });
    }

    // Verify warehouse belongs to client (if client is selected)
    if (req.clientId !== undefined && req.clientId !== null) {
      const { AppDataSource } = await import('../database/database');
      const { Warehouse } = await import('../warehouses/warehouse.entity');
      const { Location } = await import('../locations/location.entity');
      const warehouseRepository = AppDataSource.getRepository(Warehouse);
      
      const warehouse = await warehouseRepository
        .createQueryBuilder('warehouse')
        .leftJoinAndSelect('warehouse.location', 'location')
        .where('warehouse.id = :warehouseId', { warehouseId })
        .andWhere('location.clientId = :clientId', { clientId: req.clientId })
        .getOne();

      if (!warehouse) {
        return res.status(404).json({ success: false, error: 'Warehouse not found or does not belong to the selected client' });
      }
    }

    await exclusionsService.remove(id, warehouseId);
    res.json({ success: true, message: 'Exclusion deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export default router;
