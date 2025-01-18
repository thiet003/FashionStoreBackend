const pool = require('../db/connect_db');
const bcrypt = require('bcrypt');
const { generateAccessToken, verifyAccessToken } = require('../services/auth/acccessToken');
// Đăng ký
const register = async (req, res) => {
    try {
        const { firstName, lastName, dateOfBirth, email, password, retypePassword } = req.body;
        // Kiểm tra mật khẩu và mật khẩu nhập lại có trùng nhau không
        if (password !== retypePassword) {
            return res.status(400).json({ status: 'error', message: 'Mật khẩu và mật khẩu nhập lại không trùng khớp' });
        }
        // Kiểm tra email đã tồn tại chưa
        const [rows] = await pool.query('SELECT * FROM user WHERE email = ?', [email]);
        if (rows.length > 0) {
            return res.status(400).json({ status: 'error', message: 'Email đã tồn tại' });
        }
        // Thêm user vào database
        const salt = await bcrypt.genSalt(8);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log(hashedPassword);
        // Thêm user vào database và lấy id của user vừa thêm
        const [result] = await pool.query('INSERT INTO user (first_name, last_name, date_of_birth, email, password) VALUES (?, ?, ?, ?, ?)',
            [firstName, lastName, dateOfBirth, email, hashedPassword]);
        const userId = result.insertId;
        // Tạo access token
        const payload = { userId };
        const accessToken = await generateAccessToken(payload);
        res.status(201).json({ 
            status: 'success', 
            message: 'Đăng ký thành công!', 
            accessToken
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
}
// Đăng nhập
const login = async (req, res) => {
    try{
        const { email, password } = req.body;
        // Kiểm tra email có tồn tại không
        const [rows] = await pool.query('SELECT * FROM user WHERE email = ?', [email]);
        if(rows.length === 0){
            return res.status(400).json({ status: 'error', message: 'Email không tồn tại!' });
        }
        // Kiểm tra mật khẩu có đúng không
        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({ status: 'error', message: 'Mật khẩu không đúng!' });
        }
        // Tạo access token
        const payload = { userId: user.id };
        const accessToken = await generateAccessToken(payload);
        res.json({ 
            status: 'success', 
            message: 'Đăng nhập thành công!', 
            accessToken
        });

    }catch(err){
        console.log(err);
        res.status(500).send('Lỗi máy chủ');
    }
}
// Đổi mật khẩu
const changePassword = async (req, res) => {
    try {
        const userId = req.payload.userId;
        console.log(userId);
        
        const { oldPassword, newPassword, retypePassword } = req.body;
        // Kiểm tra mật khẩu mới và mật khẩu nhập lại có trùng nhau không
        if (newPassword !== retypePassword) {
            return res.status(400).json({ status: 'error', message: 'Mật khẩu mới và mật khẩu nhập lại không trùng khớp' });
        }
        // Kiểm tra mật khẩu cũ có đúng không
        const [rows] = await pool.query('SELECT * FROM user WHERE id = ?', [userId]);
        const user = rows[0];
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ status: 'error', message: 'Mật khẩu cũ không đúng!' });
        }
        // Hash mật khẩu mới và cập nhật vào database
        const salt = await bcrypt.genSalt(8);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await pool.query('UPDATE user SET password = ? WHERE id = ?', [hashedPassword, userId]);
        res.json({ status: 'success', message: 'Đổi mật khẩu thành công!' });
    }
    catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
}

// Lấy các đơn hàng của user
const getOrdersByUser = async (req, res) => {
    try {
        const userId = req.payload.userId;
        const [orders] = await pool.query(`
            SELECT o.id, o.user_name, o.phone, o.address_text, o.order_date, o.shipping_fee, o.total_amount, sm.method_name AS shipping_method, pm.method_name AS payment_method, o.status
            FROM \`order\` o
            JOIN shipping_method sm ON o.shipping_method_id = sm.id
            JOIN payment_method pm ON o.payment_method_id = pm.id
            WHERE o.user_id = ?
            ORDER BY o.order_date DESC`
            , [userId]);
        // Lấy các trường cần thiết của đơn hàng
        const filteredOrders = orders.map(order => {
            return {
                id: order.id,
                userName: order.user_name,
                phone: order.phone,
                address: order.address_text,
                createdAt: order.order_date,
                shippingFee: order.shipping_fee,
                totalAmount: order.total_amount,
                shippingMethod: order.shipping_method,
                paymentMethod: order.payment_method,
                status: order.status
            };
        });
        res.status(200).json({
            status: 'success',
            data: filteredOrders
        })
    }
    catch (err) {
        console.log(err);
        res.status(500).send('Lỗi kết nối đến máy chủ!');
    }
}

// Lấy chi tiết đơn hàng nào đó của user
const getOrderDetailByUser = async (req, res) => {
    try {
        const userId = req.payload.userId;
        const orderId = req.params.id;
        const [order] = await pool.query(`
            SELECT o.id, o.user_name, o.phone, o.address_text, o.order_date, o.shipping_fee, o.total_amount, sm.method_name AS shipping_method, pm.method_name AS payment_method, o.status
            FROM \`order\` o
            JOIN shipping_method sm ON o.shipping_method_id = sm.id
            JOIN payment_method pm ON o.payment_method_id = pm.id
            WHERE o.user_id = ? AND o.id = ?
            ORDER BY o.order_date DESC`
            , [userId, orderId]);
        if(order.length === 0){
            return res.status(404).json({ status: 'error', message: 'Không tìm thấy đơn hàng có ID = ' + orderId });
        }
        const [listProducts, fields] = await pool.query(`
            SELECT p.id, p.name, c.color_name, s.size_name, od.quantity, od.price
            FROM order_detail od
            JOIN product p ON od.product_id = p.id
            JOIN color c ON od.color_id = c.id
            JOIN size s ON od.size_id = s.id
            WHERE od.order_id = ?`
            , [orderId]);
        const filteredListProducts = listProducts.map(product => {
            return {
                id: product.id,
                name: product.name,
                color: product.color_name,
                size: product.size_name,
                quantity: product.quantity,
                price: product.price
            };
        });
        const filteredOrder = {
            id: order[0].id,
            userName: order[0].user_name,
            phone: order[0].phone,
            address: order[0].address_text,
            createdAt: order[0].order_date,
            shippingFee: order[0].shipping_fee,
            totalAmount: order[0].total_amount,
            shippingMethod: order[0].shipping_method,
            paymentMethod: order[0].payment_method,
            status: order[0].status,
            products: filteredListProducts
        };
        res.status(200).json({
            status: 'success',
            data: filteredOrder
        })
        
    }
    catch (err) {
        console.log(err);
        res.status(500).send('Lỗi kết nối đến máy chủ!');
    }
}
// Thêm địa chỉ của user
const addAddress = async (req, res) => {
    try {
        const userId = req.payload.userId;
        const { userName, phone , city, district, addressDetail } = req.body;
        if (!userName || !phone || !city || !district || !addressDetail) {
            return res.status(400).json({ status: 'error', message: 'Vui lòng điền đầy đủ thông tin!' });
        }
        await pool.query('INSERT INTO address (user_id, user_name, phone, city, district, address_detail) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, userName, phone, city, district, addressDetail]);
        res.json({ status: 'success', message: 'Thêm địa chỉ thành công!' });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ status: 'error', message: 'Lỗi máy chủ' });
    }
}
//  Sửa địa chỉ của user
const editAddress = async (req, res) => {
    try {
        const userId = req.payload.userId;
        const { userName, phone, city, district, addressDetail } = req.body;
        const addressId = req.params.id;
        if (!userName || !phone || !city || !district || !addressDetail) {
            return res.status(400).json({ status: 'error', message: 'Vui lòng điền đầy đủ thông tin!' });
        }
        // Kiểm tra địa chỉ có tồn tại không
        const [rows] = await pool.query('SELECT * FROM address WHERE user_id = ? AND id = ?', [userId, addressId]);
        if (rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Địa chỉ không tồn tại!' });
        }
        await pool.query('UPDATE address SET user_name = ?, phone = ?, city = ?, district = ?, address_detail = ? WHERE user_id = ? AND id = ?',
            [userName, phone, city, district, addressDetail, userId, addressId]);
        res.json({ status: 'success', message: 'Sửa địa chỉ thành công!' });
    }
    catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
}
// Xóa địa chỉ của user theo id của địa chỉ
const deleteAddress = async (req, res) => {
    try {
        const userId = req.payload.userId;
        const addressId = req.params.id;
        const [result] = await pool.query('DELETE FROM address WHERE user_id = ? AND id = ?', [userId, addressId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 'error', message: 'Xóa địa chỉ thất bại!' });
        }
        res.json({ status: 'success', message: 'Xóa địa chỉ thành công!' });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ status: 'error', message: 'Lỗi máy chủ' });
    }
}
// Xem danh sách địa chỉ của user
const getAddressList = async (req, res) => {
    try {
        const userId = req.payload.userId;
        const [addresses] = await pool.query('SELECT * FROM address WHERE user_id = ?', [userId]);
        const filterAddresses = addresses.map(address => {
            return {
                id: address.id,
                userName: address.user_name,
                phone: address.phone,
                city: address.city,
                district: address.district,
                addressDetail: address.address_detail,
                createdAt: address.created_at
            };
        });
        res.json({ status: 'success', data: filterAddresses });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ status: 'error', message: 'Lỗi máy chủ' });
    }
}

module.exports = { register, login, changePassword, getOrdersByUser, getOrderDetailByUser, addAddress, editAddress, deleteAddress, getAddressList };