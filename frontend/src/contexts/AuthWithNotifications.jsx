import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { mockAuthService } from '../services/mockAuth';
import { useNotification } from './NotificationContext';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProviderWithNotifications = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showError, showSuccess } = useNotification();

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Validate token with backend (optional - you can implement this later)
      setUser({ token }); // For now, just set a basic user object
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setError('');
      setLoading(true);
      
      // Use mock service for now - replace with actual API call later
      const { token, user: userData } = await mockAuthService.login(email, password);
      
      // Store token
      localStorage.setItem('token', token);
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update user state
      setUser({ ...userData, token });
      
      // Show success notification
      showSuccess('Welcome back! You have been successfully logged in.', {
        title: 'Login Successful'
      });
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      
      // Show error notification with more context
      let notificationMessage = errorMessage;
      let notificationTitle = 'Login Failed';
      
      if (errorMessage.includes('Invalid email or password')) {
        notificationMessage = 'Please check your email and password and try again.';
        notificationTitle = 'Invalid Credentials';
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        notificationMessage = 'Unable to connect to the server. Please check your internet connection.';
        notificationTitle = 'Connection Error';
      }
      
      showError(notificationMessage, {
        title: notificationTitle,
        duration: 7000 // Show error longer
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Remove token from storage
    localStorage.removeItem('token');
    
    // Remove axios default header
    delete axios.defaults.headers.common['Authorization'];
    
    // Clear user state
    setUser(null);
    setError('');
    
    // Show logout notification
    showSuccess('You have been successfully logged out.', {
      title: 'Logged Out',
      duration: 3000
    });
  };

  const clearError = () => {
    setError('');
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    clearError,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 