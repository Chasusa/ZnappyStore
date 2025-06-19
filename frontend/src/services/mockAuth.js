// Authentication service now connected to SQLite backend
// No longer mock - this uses the real API

import { authAPI } from './api';

export const mockAuthService = {
  async login(email, password) {
    try {
      const response = await authAPI.login({ email, password });
      return {
        token: response.token,
        user: response.user
      };
    } catch (error) {
      // Handle different error types with user-friendly messages
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      } else if (error.response?.status >= 500) {
        throw new Error('Server is temporarily unavailable. Please try again later.');
      } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        throw new Error('Cannot connect to server. Please check if the backend is running on port 3001.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || 'Invalid request. Please check your input.');
      } else {
        throw new Error(error.response?.data?.message || 'Login failed. Please try again.');
      }
    }
  },
  
  async validateToken(token) {
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    try {
      // For JWT tokens, we can decode the payload to get user info
      // This is safe since JWT payload is not encrypted, just encoded
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Check if token is expired
      if (payload.exp && payload.exp < Date.now() / 1000) {
        throw new Error('Token has expired');
      }
      
      return {
        user: {
          id: payload.userId,
          email: payload.email,
          name: payload.name || 'User' // Fallback if name not in token
        }
      };
    } catch (error) {
      if (error.message === 'Token has expired') {
        throw error;
      }
      throw new Error('Invalid authentication token');
    }
  }
}; 