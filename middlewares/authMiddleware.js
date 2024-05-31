const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel'); // Adjust the path to your User model

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    try {    
        if(token){
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
             req.user = user
            next();
        }  
    
    
    } catch (error) {
      res.status(401);
      throw new Error('Not Authorized, token expired, please login again');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not Authorized, no token attached to header');
  }
});

const isAdmin = asyncHandler(async (req, res, next) => {
  const { email } = req.user;
  const adminUser = await User.findOne({ email });

  if (adminUser && adminUser.role !== 'admin') {
    res.status(403);
    throw new Error('You are not an admin');
  } else {
    next();
  }
});

module.exports = { authMiddleware, isAdmin };
