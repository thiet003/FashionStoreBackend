const express = require('express');
const router = express.Router();
const { register, login, changePassword, getOrdersByUser, getOrderDetailByUser, addAddress, editAddress, deleteAddress, getAddressList } = require('../controllers/user.controller');
const { verifyAccessToken } = require('../services/auth/acccessToken');
/**
 * @swagger
 * tags:
 *   - name: User
 *     description: API cho người dùng
 */

/**
 * @swagger
 * /api/v1/user/register:
 *   post:
 *     tags:
 *     - User   
 *     summary: Đăng ký tài khoản
 *     description: Tạo mới một tài khoản người dùng.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "Nguyen"
 *               lastName:
 *                 type: string
 *                 example: "Van A"
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "2000-01-01"
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               retypePassword:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: Đăng ký thành công!
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
 *                   example: "Đăng ký thành công!"
 *       400:
 *         description: Lỗi nhập liệu, VD là email đã tồn tại hoặc mật khẩu không khớp.
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
 *                   example: "Email đã tồn tại hoặc mật khẩu không khớp."
 *       500:
 *         description: Lỗi máy chủ.
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
 *                   example: "Lỗi máy chủ."
 */
router.post('/register', register);

/**
 * @swagger
 * /api/v1/user/login:
 *   post:
 *     tags:
 *      - User
 *     summary: Đăng nhập tài khoản
 *     description: Đăng nhập với email và mật khẩu của người dùng.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Đăng nhập thành công!
 *       400:
 *         description: Email hoặc mật khẩu không đúng.
 *       500:
 *         description: Lỗi máy chủ.
 */
// Đăng nhập
router.post('/login', login);
/**
 * @swagger
 * /api/v1/user/change-password:
 *   post:
 *     tags:
 *      - User
 *     summary: Đổi mật khẩu
 *     description: Người dùng thay đổi mật khẩu của mình. Yêu cầu xác thực bằng Bearer Token.
 *     security:
 *       - bearerAuth: [] # Áp dụng Bearer Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: "oldpassword123"
 *               newPassword:
 *                 type: string
 *                 example: "newpassword123"
 *               retypePassword:
 *                 type: string
 *                 example: "newpassword123"
 *             required:
 *               - oldPassword
 *               - newPassword
 *               - retypePassword
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công.
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
 *                   example: "Đổi mật khẩu thành công!"
 *       400:
 *         description: Lỗi nhập liệu hoặc mật khẩu không hợp lệ.
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
 *                   example: "Mật khẩu cũ không đúng hoặc mật khẩu mới không khớp."
 *       401:
 *         description: Unauthorized. Token không hợp lệ hoặc đã hết hạn.
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
 *                   example: "Không có access token!"
 *       500:
 *         description: Lỗi máy chủ.
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
 *                   example: "Lỗi máy chủ."
 */
router.post('/change-password', verifyAccessToken, changePassword);

/**
 * @swagger
 * /api/v1/user/my-orders:
 *   get:
 *     tags:
 *      - User
 *     summary: Lấy danh sách đơn hàng của người dùng
 *     description: Trả về danh sách các đơn hàng của người dùng đã đăng nhập.
 *     security:
 *       - bearerAuth: [] # Áp dụng xác thực Bearer Token
 *     responses:
 *       200:
 *         description: Lấy danh sách đơn hàng thành công.
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
 *                       userName:
 *                         type: string
 *                         example: "Nguyen Van A"
 *                       phone:
 *                         type: string
 *                         example: "0987654321"
 *                       address:
 *                         type: string
 *                         example: "123 Pho Hue, Hanoi"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-01-18T07:55:02Z"
 *                       shippingFee:
 *                         type: number
 *                         format: float
 *                         example: 5.00
 *                       totalAmount:
 *                         type: number
 *                         format: float
 *                         example: 120.50
 *                       shippingMethod:
 *                         type: string
 *                         example: "Standard Shipping"
 *                       paymentMethod:
 *                         type: string
 *                         example: "Credit Card"
 *                       status:
 *                         type: string
 *                         example: "delivered"
 *       404:
 *         description: Không tìm thấy đơn hàng nào.
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
 *                   example: "Không tìm thấy đơn hàng nào."
 *       401:
 *         description: Unauthorized. Token không hợp lệ hoặc đã hết hạn.
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
 *                   example: "Không có access token!"
 *       500:
 *         description: Lỗi máy chủ.
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
 *                   example: "Lỗi máy chủ."
 */
router.get('/my-orders', verifyAccessToken, getOrdersByUser);

/**
 * @swagger
 * /api/v1/user/my-orders/{id}:
 *   get:
 *     tags:
 *      - User
 *     summary: Lấy chi tiết đơn hàng
 *     description: Trả về chi tiết một đơn hàng cụ thể, bao gồm thông tin đơn hàng và danh sách sản phẩm trong đơn hàng.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID của đơn hàng
 *     responses:
 *       200:
 *         description: Lấy chi tiết đơn hàng thành công!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     userName:
 *                       type: string
 *                       example: "Nguyen Van A"
 *                     phone:
 *                       type: string
 *                       example: "0987654321"
 *                     address:
 *                       type: string
 *                       example: "123 Pho Hue, Hoan Kiem, Hanoi"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-18T10:30:00Z"
 *                     shippingFee:
 *                       type: number
 *                       format: float
 *                       example: 50000.00
 *                     totalAmount:
 *                       type: number
 *                       format: float
 *                       example: 1000000.00
 *                     shippingMethod:
 *                       type: string
 *                       example: "Standard Delivery"
 *                     paymentMethod:
 *                       type: string
 *                       example: "Credit Card"
 *                     status:
 *                       type: string
 *                       example: "delivered"
 *                     products:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 101
 *                           name:
 *                             type: string
 *                             example: "Áo thun nam"
 *                           color:
 *                             type: string
 *                             example: "Đỏ"
 *                           size:
 *                             type: string
 *                             example: "L"
 *                           quantity:
 *                             type: integer
 *                             example: 2
 *                           price:
 *                             type: number
 *                             format: float
 *                             example: 250000.00
 *       404:
 *         description: Không tìm thấy đơn hàng.
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
 *                   example: "Không tìm thấy đơn hàng với ID đã cung cấp."
 *       500:
 *         description: Lỗi máy chủ.
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
 *                   example: "Lỗi kết nối đến máy chủ."
 */
router.get('/my-orders/:id', verifyAccessToken, getOrderDetailByUser);

/**
 * @swagger
 * /api/v1/user/add-address:
 *   post:
 *     tags:
 *      - User
 *     summary: Thêm địa chỉ mới
 *     description: Người dùng thêm địa chỉ mới.
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
 *               city:
 *                 type: string
 *                 example: "Hanoi"
 *               district:
 *                 type: string
 *                 example: "Hoan Kiem"
 *               addressDetail:
 *                 type: string
 *                 example: "123 Pho Hue"
 *     responses:
 *       201:
 *         description: Thêm địa chỉ thành công!
 *       400:
 *         description: Lỗi nhập liệu.
 *       500:
 *         description: Lỗi máy chủ.
 */
// Thêm địa chỉ
router.post('/add-address', verifyAccessToken, addAddress);

/**
 * @swagger
 * /api/v1/user/update-address/{id}:
 *   put:
 *     tags:
 *      - User
 *     summary: Sửa địa chỉ của người dùng
 *     description: Người dùng sửa thông tin của một địa chỉ đã có.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID của địa chỉ cần sửa
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
 *               city:
 *                 type: string
 *                 example: "Hanoi"
 *               district:
 *                 type: string
 *                 example: "Hoan Kiem"
 *               addressDetail:
 *                 type: string
 *                 example: "123 Pho Hue"
 *     responses:
 *       200:
 *         description: Sửa địa chỉ thành công!
 *       400:
 *         description: Lỗi nhập liệu hoặc địa chỉ không tồn tại.
 *       500:
 *         description: Lỗi máy chủ.
 */
// Sửa địa chỉ
router.put('/update-address/:id', verifyAccessToken, editAddress);

/**
 * @swagger
 * /api/v1/user/delete-address/{id}:
 *   delete:
 *     tags:
 *      - User
 *     summary: Xóa địa chỉ của người dùng
 *     description: Người dùng xóa một địa chỉ cụ thể.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID của địa chỉ cần xóa
 *     responses:
 *       200:
 *         description: Xóa địa chỉ thành công!
 *       404:
 *         description: Địa chỉ không tồn tại.
 *       500:
 *         description: Lỗi máy chủ.
 */
// Xóa địa chỉ
router.delete('/delete-address/:id', verifyAccessToken, deleteAddress);

/**
 * @swagger
 * /api/v1/user/address-list:
 *   get:
 *     tags:
 *      - User
 *     summary: Lấy danh sách địa chỉ của người dùng
 *     description: Trả về danh sách các địa chỉ của người dùng đã đăng nhập.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy danh sách địa chỉ thành công!
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
 *                       userName:
 *                         type: string
 *                         example: "Nguyen Van A"
 *                       phone:
 *                         type: string
 *                         example: "0987654321"
 *                       city:
 *                         type: string
 *                         example: "Hanoi"
 *                       district:
 *                         type: string
 *                         example: "Hoan Kiem"
 *                       addressDetail:
 *                         type: string
 *                         example: "123 Pho Hue"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-01-18T10:30:00Z"
 *       401:
 *         description: Unauthorized. Token không hợp lệ hoặc đã hết hạn.
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
 *                   example: "Không có access token!"
 *       500:
 *         description: Lỗi máy chủ.
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
 *                   example: "Lỗi máy chủ."
 */
router.get('/address-list', verifyAccessToken, getAddressList);



module.exports = router;
