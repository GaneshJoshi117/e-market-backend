const express = require('express');

const userController = require('../controller/userController');
const authController = require('../controller/authController');

const router = express.Router();

router.get('/', userController.getAllUser);
router.post('/signup', authController.signup);

module.exports = router;
