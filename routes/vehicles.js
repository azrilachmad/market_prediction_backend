import express from 'express';
import { createBulkPredict, createSinglePredict, getVehicleList, updateVehicleData } from '../controllers/vehicle.js';

const router = express.Router()

router.get('/vehicles', getVehicleList)
router.post('/vehicles', createSinglePredict)
router.put('/vehicles', updateVehicleData)
router.post('/bulk-predict', createBulkPredict)


export default router;