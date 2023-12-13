const express = require('express');
const router = express.Router();
const { authLimiter, bookLimiter } = require('../middleware/rate-limit');
const userCtrl = require('../controllers/user');

router.post('/signup', userCtrl.signup);
router.post('/login', authLimiter, userCtrl.login);

module.exports = router;