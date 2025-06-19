import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByEmail } from '../utils/database.js';
import { config } from '../config.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Email and password are required'
      });
    }

    // Simulate network delay for testing
    if (email === 'network@error.com') {
      return res.status(503).json({
        error: 'Network error',
        message: 'Network error occurred while connecting to server'
      });
    }

    if (email === 'server@error.com') {
      return res.status(503).json({
        error: 'Server error',
        message: 'Server is temporarily unavailable. Please try again later.'
      });
    }

    // Find user by email
    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email 
      },
      config.jwt.secret,
      { 
        expiresIn: config.jwt.expiresIn
      }
    );

    // Return success response
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred during login'
    });
  }
});

// POST /api/auth/validate (optional - for token validation)
router.post('/validate', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Token is required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = findUserByEmail(decoded.email);
    
    if (!user) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'User not found'
      });
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    res.status(401).json({
      valid: false,
      error: 'Invalid token',
      message: 'Token validation failed'
    });
  }
});

export default router; 