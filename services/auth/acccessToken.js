const req = require('express/lib/request');
const JWT = require('jsonwebtoken');
require('dotenv').config();
const generateAccessToken = async (payload) => {
    return new Promise((resolve, reject) => {
        const secret = process.env.ACCESS_TOKEN_SECRET;
        const options = { expiresIn: '1d' };
        JWT.sign(payload, secret, options, (err, token) => {
            if (err) {
                return reject(err);
            }
            resolve(token);
        });
    });
}

const verifyAccessToken = async (req, res, next) => {
    if(!req.headers.authorization) {
        return res.status(401).json({ status: 'error', message: 'Không có access token!' });
    }
    const authHeader = req.headers['authorization'];
    const bearerToken = authHeader.split(' ');
    const token = bearerToken[1];
    JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        if(err) {
            return res.status(403).json({ status: 'error', message: 'Access token không hợp lệ!' });
        }
        req.payload = payload;
        next();
    });
}

module.exports = { generateAccessToken, verifyAccessToken };