import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthWithNotifications';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, clearError, loading } = useAuth();

  // Clear any existing errors when component mounts or form changes
  useEffect(() => {
    clearError();
  }, [email, password, clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      // AuthContext will handle navigation after successful login
      console.log('Login successful');
    }
  };

  const isFormValid = email.trim() && password.trim();

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>ZnappyStore</h1>
          <p>Secure file storage and management</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              autoComplete="email"
              disabled={isSubmitting || loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              disabled={isSubmitting || loading}
            />
          </div>

          {/* Error notifications are now handled by NotificationContext */}

          <button
            type="submit"
            className="login-button"
            disabled={!isFormValid || isSubmitting || loading}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>Demo credentials for testing:</p>
          <p><strong>Valid:</strong> demo@znappystore.com / demo123</p>
          <p><strong>Error Test:</strong> network@error.com / any</p>
          <p><strong>Invalid:</strong> wrong@email.com / wrong</p>
        </div>
      </div>
    </div>
  );
};

export default Login; 