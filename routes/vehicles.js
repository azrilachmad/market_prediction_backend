import express from 'express';
import { createBulkPredict, createSinglePredict, getVehicleList, updateVehicleData } from '../controllers/vehicle.js';

const router = express.Router()
router.get('/api/vehicles/', getVehicleList)
router.post('/api/vehicles', createSinglePredict)
router.put('/api/vehicles', updateVehicleData)
router.post('/api/bulk-predict', createBulkPredict)


export default router;