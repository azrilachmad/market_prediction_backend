const express = require('express');
const { getAllDataParameter, createDataParameter } = require('../controllers/dataParameterController.js');
const { authentication } = require('../controllers/authController.js');

const router = express.Router()

router.get('/api/data-parameter/', authentication, getAllDataParameter)
router.post('/api/data-parameter/create', authentication, createDataParameter)

module.exports = router;