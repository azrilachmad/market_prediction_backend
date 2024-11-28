const express = require('express');
const { getUser, getAllUser } = require('../controllers/userController.js');
const { authentication } = require('../controllers/authController.js');

const router = express.Router()

router.get('/api/userlist/', authentication, getAllUser)
router.get('/api/user/', authentication, getUser)

module.exports = router;