const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const userschema = require('../models/user.model');
dotenv.config();

exports.authmiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userschema.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Unauthorized', error });
    }
};