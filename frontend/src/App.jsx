import React, { useState } from "react";
import { NotificationProvider } from "./contexts/NotificationContext";
import { AuthProviderWithNotifications } from "./contexts/AuthWithNotifications";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import FileUpload from "./components/FileUpload";
import FileList from "./components/FileList";
import "./App.css";

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    // Trigger file list refresh when a file is uploaded
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <NotificationProvider>
      <AuthProviderWithNotifications>
        <div className="App">
          <ProtectedRoute>
            <Header />
            <main className="main-content">
              <div className="container">
                <h2>Welcome to ZnappyStore</h2>
                <p>
                  Your secure file storage is ready. Upload, manage, and
                  download your files safely.
                </p>

                <div className="app-sections">
                  <section className="upload-section">
                    <div className="section-header">
                      <h3>📤 Upload Files</h3>
                      <p>Upload your files securely to ZnappyStore</p>
                    </div>
                    <FileUpload onUploadSuccess={handleUploadSuccess} />
                  </section>

                  <section className="files-section">
                    <div className="section-header">
                      <h3>📁 Your Files</h3>
                      <p>Manage and download your uploaded files</p>
                    </div>
                    <FileList refreshTrigger={refreshTrigger} />
                  </section>
                </div>
              </div>
            </main>
          </ProtectedRoute>
        </div>
      </AuthProviderWithNotifications>
    </NotificationProvider>
  );
}

export default App;
