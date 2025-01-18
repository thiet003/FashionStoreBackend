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


/**
 * @swagger
 * tags:
 *   - name: Product
 *     description: API cho sản phẩm
 */

/**
 * @swagger
 * /api/v1/product:
 *   get:
 *     tags:
 *       - Product
 *     summary: Lấy danh sách sản phẩm
 *     description: Trả về danh sách sản phẩm với các tùy chọn lọc, sắp xếp và phân trang.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Số trang (mặc định là 1).
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số lượng sản phẩm mỗi trang (mặc định là 10).
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Trường để sắp xếp (VD -> name, original_price).
 *       - in: query
 *         name: sortType
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Kiểu sắp xếp (ASC là tăng dần, DESC là giảm dần).
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên sản phẩm.
 *       - in: query
 *         name: categoryName
 *         schema:
 *           type: string
 *         description: Lọc theo tên danh mục.
 *       - in: query
 *         name: startPrice
 *         schema:
 *           type: number
 *         description: Giá bắt đầu.
 *       - in: query
 *         name: endPrice
 *         schema:
 *           type: number
 *         description: Giá kết thúc.
 *     responses:
 *       200:
 *         description: Lấy danh sách sản phẩm thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Áo thun"
 *                       original_price:
 *                         type: number
 *                         example: 200000
 *                       final_price:
 *                         type: number
 *                         example: 180000
 *                       discount:
 *                         type: number
 *                         example: 10
 *                       color_count:
 *                         type: integer
 *                         example: 3
 *                       size_count:
 *                         type: integer
 *                         example: 4
 *       500:
 *         description: Lỗi máy chủ.
 */
// Lấy danh sách sản phẩm
router.get('/', getProducts);
/**
 * @swagger
 * /api/v1/product/discount:
 *   get:
 *     tags:
 *       - Product
 *     summary: Lấy danh sách sản phẩm giảm giá
 *     description: Trả về danh sách các sản phẩm đang có khuyến mãi.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Số trang (mặc định là 1).
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số lượng sản phẩm mỗi trang (mặc định là 10).
 *     responses:
 *       200:
 *         description: Lấy danh sách sản phẩm giảm giá thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Áo thun"
 *                       original_price:
 *                         type: number
 *                         example: 200000
 *                       final_price:
 *                         type: number
 *                         example: 180000
 *                       discount:
 *                         type: number
 *                         example: 10
 *       500:
 *         description: Lỗi máy chủ.
 */
// Lấy danh sách sản phẩm giảm giá
router.get('/discount', getDiscountProducts);
/**
 * @swagger
 * /api/v1/product/new:
 *   get:
 *     tags:
 *       - Product
 *     summary: Lấy danh sách sản phẩm mới
 *     description: Trả về danh sách các sản phẩm mới.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Số trang (mặc định là 1).
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số lượng sản phẩm mỗi trang (mặc định là 10).
 *     responses:
 *       200:
 *         description: Lấy danh sách sản phẩm mới thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Áo thun"
 *                       original_price:
 *                         type: number
 *                         example: 200000
 *                       final_price:
 *                         type: number
 *                         example: 180000
 *                       is_new:
 *                         type: boolean
 *                         example: true
 *       500:
 *         description: Lỗi máy chủ.
 */
// Lấy danh sách sản phẩm mới
router.get('/new', getNewProducts);
/**
 * @swagger
 * /api/v1/product/{id}:
 *   get:
 *     tags:
 *       - Product
 *     summary: Lấy chi tiết sản phẩm
 *     description: Trả về chi tiết một sản phẩm theo ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của sản phẩm.
 *     responses:
 *       200:
 *         description: Lấy chi tiết sản phẩm thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Áo thun"
 *                     colorSize:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           color:
 *                             type: string
 *                             example: "Đỏ"
 *                           size:
 *                             type: string
 *                             example: "L"
 *                           quantity:
 *                             type: integer
 *                             example: 10
 *                     images:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "https://example.com/image.jpg"
 *       404:
 *         description: Không tìm thấy sản phẩm.
 *       500:
 *         description: Lỗi máy chủ.
 */
// Lấy chi tiết sản phẩm
router.get('/:id', getProductDetail);
module.exports = router;