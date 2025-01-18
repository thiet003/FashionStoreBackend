const express = require('express');
const router = express.Router();
const { verifyAccessToken } = require('../services/auth/acccessToken');
const {
    addPaymentMethod,
    getPaymentMethods,
    addShippingMethod,
    getShippingMethods,
    addOrder
} = require('../controllers/order.controller');

// Thêm phương thức thanh toán
router.post('/add-payment-method', addPaymentMethod);
// Thêm phương thức vận chuyển
router.post('/add-shipping-method', addShippingMethod);



/**
 * @swagger
 * tags:
 *   - name: Order
 *     description: API liên quan đến đơn hàng và phương thức thanh toán/vận chuyển
 */

/**
 * @swagger
 * /api/v1/order/payment-methods:
 *   get:
 *     tags:
 *       - Order
 *     summary: Lấy danh sách phương thức thanh toán
 *     description: Trả về danh sách các phương thức thanh toán có sẵn.
 *     responses:
 *       200:
 *         description: Lấy danh sách phương thức thanh toán thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       method_name:
 *                         type: string
 *                         example: "Thanh toán khi nhận hàng"
 *       500:
 *         description: Lỗi máy chủ.
 */
// Lấy danh sách phương thức thanh toán
router.get('/payment-methods', getPaymentMethods);
/**
 * @swagger
 * /api/v1/order/shipping-methods:
 *   get:
 *     tags:
 *       - Order
 *     summary: Lấy danh sách phương thức vận chuyển
 *     description: Trả về danh sách các phương thức vận chuyển có sẵn.
 *     responses:
 *       200:
 *         description: Lấy danh sách phương thức vận chuyển thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       method_name:
 *                         type: string
 *                         example: "Giao hàng tiêu chuẩn"
 *                       shipping_fee:
 *                         type: number
 *                         format: float
 *                         example: 30000
 *       500:
 *         description: Lỗi máy chủ.
 */
// Lấy danh sách phương thức vận chuyển
router.get('/shipping-methods', getShippingMethods);

/**
 * @swagger
 * /api/v1/order/add-order:
 *   post:
 *     tags:
 *       - Order
 *     summary: Thêm đơn hàng mới
 *     description: Tạo một đơn hàng mới. Yêu cầu xác thực bằng Bearer Token.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *                 example: "Nguyen Van A"
 *               phone:
 *                 type: string
 *                 example: "0987654321"
 *               addressId:
 *                 type: integer
 *                 example: 1
 *               address:
 *                 type: string
 *                 example: "123 Pho Hue, Hoan Kiem, Ha Noi"
 *               paymentMethodId:
 *                 type: integer
 *                 example: 2
 *               shippingMethodId:
 *                 type: integer
 *                 example: 3
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id:
 *                       type: integer
 *                       example: 101
 *                     colorName:
 *                       type: string
 *                       example: "Đỏ"
 *                     sizeName:
 *                       type: string
 *                       example: "L"
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *     responses:
 *       201:
 *         description: Thêm đơn hàng thành công.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Thêm đơn hàng thành công!"
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: integer
 *                       example: 10
 *                     userName:
 *                       type: string
 *                       example: "Nguyen Van A"
 *                     phone:
 *                       type: string
 *                       example: "0987654321"
 *                     address:
 *                       type: string
 *                       example: "123 Pho Hue, Hoan Kiem, Ha Noi"
 *                     total:
 *                       type: number
 *                       format: float
 *                       example: 1200000
 *       400:
 *         description: Lỗi nhập liệu hoặc thông tin sản phẩm không hợp lệ.
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
 *                   example: "Thông tin sản phẩm không hợp lệ!"
 *       500:
 *         description: Thêm đơn hàng thất bại.
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
 *                   example: "Thêm đơn hàng thất bại!"
 */
// Thêm đơn hàng
router.post('/add-order', verifyAccessToken, addOrder);


module.exports = router;