const pool = require('../db/connect_db');
// Thêm category
const addCategory = async (req, res) => {
    const { name, imageLink } = req.body;
    try {
        await pool.query('INSERT INTO category (name, image_link) VALUES (?, ?)', [name, imageLink]);
        res.json({ status: 'success', message: 'Thêm danh mục thành công!' });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ status: 'error', message: 'Lỗi kết nối CSDL!' });
    }
}

// Lấy danh sách category
const getCategories = async (req, res) => {
    try {
        const [rows, fields] = await pool.query('SELECT * FROM category');
        res.json(rows);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ status: 'error', message: 'Lỗi kết nối với server!' });
    }
}

module.exports = {
    addCategory,
    getCategories
}