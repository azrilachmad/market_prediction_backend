const express = require('express');
const { createBulkPredict, createSinglePredict, getCarCount, getCarTypeCount, getChart, getOmsetPenjualan, getPriceComparison, getVehicleList, getVehicleRank, getVehicleType, getVehicleTypeList, updateVehicleData } = require('../controllers/vehicleController.js');
const {signIn, signUp} = require('./../controllers/authController.js');

const router = express.Router()

router.post('/api/register/', signUp)
router.post('/api/login/', signIn)

router.get('/api/chart/', getChart)
router.get('/api/vehicles/', getVehicleList)
router.get('/api/vehicles/count', getCarCount)
router.get('/api/vehicles/count-type', getCarTypeCount)
router.get('/api/vehicles/omset', getOmsetPenjualan)
router.get('/api/vehicles/sales', getVehicleRank)
router.get('/api/vehicles/car-type', getVehicleType)
router.get('/api/vehicles/list', getVehicleTypeList)
router.get('/api/vehicles/comparison', getPriceComparison)
router.post('/api/vehicles', createSinglePredict)
router.put('/api/vehicles', updateVehicleData)
router.post('/api/bulk-predict', createBulkPredict)

module.exports = router;