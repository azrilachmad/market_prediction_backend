const { authentication, restrictTo } = require('../controllers/authController.js');
const { getAllVehicleCount, getToBeProcessedData, getProcessedData } = require('../controllers/dashboardController.js');

const router = require('express').Router()

router.get('/api/dashboard/card1', authentication, getAllVehicleCount)
router.get('/api/dashboard/card2', authentication, getToBeProcessedData)
router.get('/api/dashboard/card3', authentication, getProcessedData)


module.exports = router;