const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.BACKEND_PORT || 5005;
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

app.listen(port, () => {
    console.log('Server is running on port ' + port);
});
