import React, { useState, useRef, useCallback } from 'react';
import { fileAPI } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import './FileUpload.css';

const FileUpload = ({ onUploadSuccess }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);
  const { showNotification } = useNotification();

  // Supported file types (matching backend validation)
  const supportedTypes = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg', 
    'image/png': '.png',
    'image/gif': '.gif',
    'image/svg+xml': '.svg',
    'text/plain': '.txt',
    'text/markdown': '.md',
    'text/csv': '.csv'
  };

  const maxFileSize = 2 * 1024 * 1024; // 2MB

  const validateFile = (file) => {
    // Check file size
    if (file.size > maxFileSize) {
      throw new Error(`File size must be less than 2MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    }

    // Check file type
    if (!supportedTypes[file.type]) {
      const supportedExtensions = Object.values(supportedTypes).join(', ');
      throw new Error(`File type not supported. Supported formats: ${supportedExtensions}`);
    }

    return true;
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileUpload(file);
    }
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      console.log('🚀 Starting file upload:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      validateFile(file);
      setIsUploading(true);
      setUploadProgress(0);
      setUploadedFile(null);

      console.log('📁 File validation passed, calling API...');

      const result = await fileAPI.uploadFile(file, (progress) => {
        console.log('📊 Upload progress:', progress + '%');
        setUploadProgress(progress);
      });

      console.log('✅ Upload successful:', result);

      setUploadedFile(result.file);
      showNotification('success', `File "${file.name}" uploaded successfully!`);
      
      // Reset form
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Notify parent component
      if (onUploadSuccess) {
        onUploadSuccess(result.file);
      }

    } catch (error) {
      console.error('❌ Upload error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config,
        code: error.code
      });
      let errorMessage = 'Upload failed';
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        errorMessage = 'Cannot connect to server. Please check if the backend is running on port 3001.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (error.response?.status === 413) {
        errorMessage = 'File is too large. Maximum allowed size is 2MB.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        if (errorMessage.includes('exceeds the 2MB limit')) {
          errorMessage = 'File is too large. Maximum allowed size is 2MB.';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      showNotification('error', errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type === 'text/plain') return '📄';
    if (type === 'text/markdown') return '📝';
    if (type === 'text/csv') return '📊';
    return '📄';
  };



  return (
    <div className="file-upload-container">
      <div className="upload-section">
        <h3>📤 Upload File</h3>
        
        <div
          className={`upload-dropzone ${isDragActive ? 'drag-active' : ''} ${isUploading ? 'uploading' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDrag}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept={Object.keys(supportedTypes).join(',')}
            className="file-input"
            disabled={isUploading}
          />

          <div className="upload-content">
            {isUploading ? (
              <>
                <div className="upload-spinner">⏳</div>
                <p>Uploading... {uploadProgress}%</p>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </>
            ) : (
              <>
                <div className="upload-icon">📁</div>
                <h4>Create or import a file</h4>
                <p className="upload-subtitle">Maximum file size: 2MB</p>
                <p className="upload-formats">Supported formats: JPG, PNG, GIF, SVG, TXT, MD, CSV</p>
                <div className="upload-actions">
                  <button className="upload-btn primary" type="button">
                    Choose File
                  </button>
                  <p className="or-text">or drag and drop here</p>
                </div>
              </>
            )}
          </div>
        </div>

        {uploadedFile && (
          <div className="upload-success">
            <div className="success-icon">✅</div>
            <div className="file-details">
              <h4>Upload Successful!</h4>
              <div className="file-info">
                <span className="file-icon">{getFileIcon(uploadedFile.type)}</span>
                <div className="file-meta">
                  <p className="file-name">{uploadedFile.filename}</p>
                  <p className="file-size">{uploadedFile.formattedSize}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>


    </div>
  );
};

export default FileUpload; 