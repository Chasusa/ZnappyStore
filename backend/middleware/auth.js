import jwt from 'jsonwebtoken';
import { users } from '../utils/database.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Access denied',
      message: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    // Find user in our mock database
    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'User not found'
      });
    }

    // Add user info to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name
    };
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({
      error: 'Invalid token',
      message: 'Token verification failed'
    });
  }
};

export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = users.find(u => u.id === decoded.userId);
    
    req.user = user ? {
      id: user.id,
      email: user.email,
      name: user.name
    } : null;
  } catch (error) {
    req.user = null;
  }
  
  next();
}; 