const pool = require('../db/connect_db');

// Thêm payment method
const addPaymentMethod = async (req, res) => {
    try {
        const { name } = req.body;

        // Thêm phương thức thanh toán
        const insertQuery = "INSERT INTO payment_method (method_name) VALUES (?)";
        const [insertResult] = await pool.execute(insertQuery, [name]);

        // Lấy thông tin dòng vừa thêm
        const newPaymentMethodId = insertResult.insertId;
        const selectQuery = "SELECT * FROM payment_method WHERE id = ?";
        const [newPaymentMethod] = await pool.execute(selectQuery, [newPaymentMethodId]);

        res.json({
            status: 'success',
            message: 'Thêm phương thức thanh toán thành công!',
            data: newPaymentMethod[0] // Dữ liệu vừa thêm
        });
    } catch (error) {
        console.error(error.message);
        res.json({
            status: 'error',
            message: 'Thêm phương thức thanh toán thất bại!'
        });
    }
};
// Lấy danh sách phương thức thanh toán
const getPaymentMethods = async (req, res) => {
    try {
        // Thực hiện truy vấn để lấy danh sách phương thức thanh toán
        const [paymentMethods] = await pool.execute("SELECT * FROM payment_method");

        // Trả về kết quả
        res.json({
            status: 'success',
            data: paymentMethods, // Trả về danh sách các phương thức thanh toán
        });
    } catch (error) {
        console.error(error.message);
        res.json({
            status: 'error',
            message: 'Lấy danh sách phương thức thanh toán thất bại!',
        });
    }
};
// Thêm shipping method
const addShippingMethod = async (req, res) => {
    try {
        const { name, price } = req.body;

        // Thêm phương thức vận chuyển
        const insertQuery = "INSERT INTO shipping_method (method_name, shipping_fee) VALUES (?, ?)";
        const [insertResult] = await pool.execute(insertQuery, [name, price]);

        // Lấy thông tin dòng vừa thêm
        const newShippingMethodId = insertResult.insertId;
        const selectQuery = "SELECT * FROM shipping_method WHERE id = ?";
        const [newShippingMethod] = await pool.execute(selectQuery, [newShippingMethodId]);

        res.json({
            status: 'success',
            message: 'Thêm phương thức vận chuyển thành công!',
            data: newShippingMethod[0] // Dữ liệu vừa thêm
        });
    } catch (error) {
        console.error(error.message);
        res.json({
            status: 'error',
            message: 'Thêm phương thức vận chuyển thất bại!'
        });
    }
};
// Lấy danh sách phương thức vận chuyển
const getShippingMethods = async (req, res) => {
    try {
        // Thực hiện truy vấn để lấy danh sách phương thức vận chuyển
        const [shippingMethods] = await pool.execute("SELECT * FROM shipping_method");

        // Trả về kết quả
        res.json({
            status: 'success',
            data: shippingMethods, // Trả về danh sách phương thức vận chuyển
        });
    } catch (error) {
        console.error(error.message);
        res.json({
            status: 'error',
            message: 'Lấy danh sách phương thức vận chuyển thất bại!',
        });
    }
};
// Check product quantity
const checkProductQuantity = async (products) => {
    try {
        for (const product of products) {
            // Kiểm tra xem có tồn tại id không
            const [productResult] = await pool.execute("SELECT * FROM product WHERE id = ?", [product.product_id]);
            if (!productResult.length) {
                return {
                    status: 'error',
                    message: `Sản phẩm (ID: ${product.product_id}) không tồn tại!`
                };
            }
            const [result] = await pool.execute(`
                SELECT pq.quantity, c.id AS color_id, s.id AS size_id
                FROM product_quantity pq
                JOIN color c ON c.id = pq.color_id
                JOIN size s ON s.id = pq.size_id
                WHERE pq.product_id = ? AND LOWER(c.color_name) = LOWER(?) AND LOWER(s.size_name) = LOWER(?)`,
                [product.product_id, product.colorName, product.sizeName]
            );

            if (!result.length) {
                return {
                    status: 'error',
                    message: `Sản phẩm (ID: ${product.product_id}, Màu: ${product.colorName}, Kích thước: ${product.sizeName}) không tồn tại!`
                };
            }

            if (result[0].quantity < product.quantity) {
                return {
                    status: 'error',
                    message: `Sản phẩm (ID: ${product.product_id}, Màu: ${product.colorName}, Kích thước: ${product.sizeName}) không đủ số lượng!`
                };
            }
        }

        return { status: 'success' };
    } catch (error) {
        console.error(error.message);
        return { status: 'error', message: 'Lỗi khi kiểm tra số lượng sản phẩm!' };
    }
};

// Thêm đơn hàng
// Bao gồm: user_id, user_name, phone, address_id, address, payment_method_id, shipping_method_id, products
// Products: [{product_id, colorName, sizeName, quantity}]
const addOrder = async (req, res) => {
    // Lấy user_id từ access token
    const userId = req.payload.userId
    console.log(userId);
    
    try {
        const {userName, phone, addressId = null, address = '', paymentMethodId, shippingMethodId, products } = req.body;

        // Validate input
        if (!userName || !phone || !paymentMethodId || !shippingMethodId || !(products && products.length)) {
            return res.status(400).json({ status: 'error', message: 'Thiếu thông tin đơn hàng!' });
        }
        if (products.some(p => !p.product_id || !p.colorName || !p.sizeName || !p.quantity)) {
            return res.json({ status: 'error', message: 'Thông tin sản phẩm không hợp lệ!' });
        }
        if (addressId === null && !address) {
            return res.json({ status: 'error', message: 'Thiếu thông tin địa chỉ!' });
        }
        // Check product quantity
        const quantityCheck = await checkProductQuantity(products);
        if (quantityCheck.status === 'error') {
            return res.json(quantityCheck);
        }
        // Kiểm tra tồn tại của shipping_method_id
        const [shippingMethodResult] = await pool.execute("SELECT * FROM shipping_method WHERE id = ?", [shippingMethodId]);
        if (!shippingMethodResult.length) {
            return res.status(400).json({ status: 'error', message: 'Phương thức vận chuyển không tồn tại!' });
        }
        // Kiểm tra tồn tại của payment_method_id
        const [paymentMethodResult] = await pool.execute("SELECT * FROM payment_method WHERE id = ?", [paymentMethodId]);
        if (!paymentMethodResult.length) {
            return res.status(400).json({ status: 'error', message: 'Phương thức thanh toán không tồn tại!' });
        }
        // Get shipping fee
        const [shippingResult] = await pool.execute(
            "SELECT shipping_fee FROM shipping_method WHERE id = ?",
            [shippingMethodId]
        );
        const shippingFee = parseFloat(shippingResult[0].shipping_fee);
        
        // Calculate total price
        let total = 0;
        for (const product of products) {
            const [priceResult] = await pool.execute(
                "SELECT final_price FROM product WHERE id = ?",
                [product.product_id]
            );
            total += priceResult[0].final_price * product.quantity;
        }
        total += shippingFee;
        // Insert order
        const [orderResult] = await pool.execute(`
            INSERT INTO \`order\` (user_id, user_name, phone, address_id, address_text, payment_method_id, shipping_method_id, shipping_fee, total_amount)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, userName, phone, addressId, address, paymentMethodId, shippingMethodId, shippingFee, total]
        );
        const orderId = orderResult.insertId;

        // Insert order details and update product quantities
        for (const product of products) {
            const [result] = await pool.execute(`
                SELECT c.id AS color_id, s.id AS size_id 
                FROM color c, size s 
                WHERE LOWER(c.color_name) = LOWER(?) AND LOWER(s.size_name) = LOWER(?)`,
                [product.colorName, product.sizeName]
            );
            const { color_id, size_id } = result[0];

            // Insert order detail
            await pool.execute(`
                INSERT INTO order_detail (order_id, product_id, color_id, size_id, quantity, price)
                VALUES (?, ?, ?, ?, ?, (SELECT final_price FROM product WHERE id = ?))`,
                [orderId, product.product_id, color_id, size_id, product.quantity, product.product_id]
            );

            // Update product quantity
            await pool.execute(`
                UPDATE product_quantity SET quantity = quantity - ? 
                WHERE product_id = ? AND color_id = ? AND size_id = ?`,
                [product.quantity, product.product_id, color_id, size_id]
            );
        }

        // Return response
        res.json({
            status: 'success',
            message: 'Thêm đơn hàng thành công!',
            data: {
                orderId,
                userName,
                phone,
                address,
                total
            }
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ status: 'error', message: 'Thêm đơn hàng thất bại!' });
    }
};


module.exports = {
    addPaymentMethod,
    getPaymentMethods,
    addShippingMethod,
    getShippingMethods,
    addOrder
}