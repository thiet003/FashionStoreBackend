const express = require('express');
const router = express.Router();
const { addCategory, getCategories } = require('../controllers/category.controller');
// Thêm category
router.post('/add-category', addCategory);


/**
 * @swagger
 * tags:
 *   - name: Category
 *     description: API cho danh mục sản phẩm
 */

/**
 * @swagger
 * /api/v1/category:
 *   get:
 *     tags:
 *       - Category
 *     summary: Lấy danh sách danh mục sản phẩm
 *     description: Trả về danh sách tất cả các danh mục sản phẩm.
 *     responses:
 *       200:
 *         description: Lấy danh sách danh mục thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Thời trang nam"
 *                   image_link:
 *                     type: string
 *                     example: "https://example.com/image.jpg"
 *       500:
 *         description: Lỗi kết nối với server.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Lỗi kết nối với server!"
 */
// Danh sách category
router.get('/', getCategories);
module.exports = router;
