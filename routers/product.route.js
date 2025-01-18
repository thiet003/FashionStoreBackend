const express = require('express');
const router = express.Router();
const {addSize, 
    addProduct, 
    getProducts,
    getDiscountProducts,
    getNewProducts,
    getProductDetail
} = require('../controllers/product.controller');

// Thêm size
router.post('/add-size', addSize);

// Thêm sản phẩm
router.post('/add-product', addProduct);

// Lấy danh sách sản phẩm
router.get('/', getProducts);
// Lấy danh sách sản phẩm giảm giá
router.get('/discount', getDiscountProducts);
// Lấy danh sách sản phẩm mới
router.get('/new', getNewProducts);
// Lấy chi tiết sản phẩm
router.get('/:id', getProductDetail);


module.exports = router;