import React from 'react';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProviderWithNotifications } from './contexts/AuthWithNotifications';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import './App.css';

function App() {
  return (
    <NotificationProvider>
      <AuthProviderWithNotifications>
        <div className="App">
          <ProtectedRoute>
            <Header />
            <main className="main-content">
              <div className="container">
                <h2>Welcome to ZnappyStore</h2>
                <p>Your secure file storage is ready. Upload, manage, and download your files safely.</p>
                {/* File upload, list, and download components will be added here */}
              </div>
            </main>
          </ProtectedRoute>
        </div>
      </AuthProviderWithNotifications>
    </NotificationProvider>
  );
}

export default App;
