const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

// Kết nối MySQL
const pool = require('./db/connect_db');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
const userRoute = require('./routers/user.route');
app.use('/api/v1/user', userRoute);

app.get('/', async (req, res) => {
    try {
        const [rows, fields] = await pool.query('SELECT * FROM address');
        console.log(fields);
        res.json(rows);
    }
    catch (err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});
const port = process.env.BACKEND_PORT || 5005;
app.listen(port, () => {
    console.log('Server is running on port ' + port);
});
