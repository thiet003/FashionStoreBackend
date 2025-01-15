const express = require('express');
const router = express.Router();
const { register, login, changePassword } = require('../controllers/user.controller');
const { verifyAccessToken } = require('../services/auth/acccessToken');
// Đăng ký
router.post('/register', register);
// Đăng nhập
router.post('/login', login);
// Đổi mật khẩu
router.post('/change-password', verifyAccessToken, changePassword);
module.exports = router;
