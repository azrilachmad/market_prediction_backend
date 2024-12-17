const express = require('express');
const { getAllDataParameter } = require('../controllers/dataParameterController.js');
const { authentication } = require('../controllers/authController.js');

const router = express.Router()

router.get('/api/userlist/', authentication, getAllDataParameter)

module.exports = router;