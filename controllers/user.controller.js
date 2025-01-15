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
        const { oldPassword, newPassword, retypePassword } = req.body;
        // Kiểm tra mật khẩu mới và mật khẩu nhập lại có trùng nhau không
        if (newPassword !== retypePassword) {
            return res.status(400).json({ status: 'error', message: 'Mật khẩu mới và mật khẩu nhập lại không trùng khớp!' });
        }
        // Kiểm tra mật khẩu cũ có đúng không
        const [rows] = await pool.query('SELECT * FROM user WHERE id = ?', [req.payload.userId]);
        const user = rows[0];
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ status: 'error', message: 'Mật khẩu cũ không đúng!' });
        }
        // Cập nhật mật khẩu mới
        const salt = await bcrypt.genSalt(8);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await pool.query('UPDATE user SET password = ? WHERE id = ?', [hashedPassword, req.payload.userId]);
        res.json({ status: 'success', message: 'Đổi mật khẩu thành công!' });
    }
    catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
}
module.exports = { register, login, changePassword };