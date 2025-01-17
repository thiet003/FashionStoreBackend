const express = require('express');
const router = express.Router();
const { addCategory, getCategories } = require('../controllers/category.controller');
// Thêm category
router.post('/add-category', addCategory);
// Danh sách category
router.get('/', getCategories);
module.exports = router;
