const express = require('express');
const {signIn, signUp} = require('../controllers/authController.js');

const router = express.Router()

router.post('/api/register/', signUp)
router.post('/api/login/', signIn)

module.exports = router;