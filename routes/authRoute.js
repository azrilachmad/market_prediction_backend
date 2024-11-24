const express = require('express');
const {signIn, signUp, getUser, authentication} = require('../controllers/authController.js');

const router = express.Router()

router.post('/api/register/', signUp)
router.post('/api/login/', signIn)
router.get('/api/user/', authentication, getUser)

module.exports = router;