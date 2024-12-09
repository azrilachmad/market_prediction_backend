const express = require('express');
const { getUser, getAllUser, createUser, editUser } = require('../controllers/userController.js');
const { authentication } = require('../controllers/authController.js');

const router = express.Router()

router.get('/api/userlist/', authentication, getAllUser)
router.get('/api/user/', authentication, getUser)
router.post('/api/user/create', createUser)
router.post('/api/user/edit/:id', editUser)

module.exports = router;