import React from 'react';
import { useAuth } from '../contexts/AuthWithNotifications';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="header-title">ZnappyStore</h1>
          <span className="header-subtitle">Secure File Storage</span>
        </div>
        
        <div className="header-right">
          {user && (
            <div className="user-info">
              <span className="user-email">{user.email || 'User'}</span>
              <button 
                onClick={handleLogout}
                className="logout-button"
                aria-label="Logout"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 