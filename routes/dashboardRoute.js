const { authentication, restrictTo } = require('../controllers/authController.js');
const { getAllVehicleCount, getToBeProcessedData } = require('../controllers/dashboardController.js');

const router = require('express').Router()

router.get('/api/dashboard/card1', authentication, getAllVehicleCount)
router.get('/api/dashboard/card2', authentication, getToBeProcessedData)


module.exports = router;