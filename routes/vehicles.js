import express from 'express';
import { createBulkPredict, createSinglePredict } from '../controllers/vehicle.js';

const router = express.Router()

router.post('/vehicles', createSinglePredict)
router.post('/bulk-predict', createBulkPredict)


export default router;