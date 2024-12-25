const express = require('express');
const app = express();

// Kết nối MySQL
const pool = require('./db/connect_db');

app.get('/', async (req, res) => {
    try {
        const [rows, fields] = await pool.query('SELECT * FROM product');
        console.log(fields);
        res.json(rows);
    }
    catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
