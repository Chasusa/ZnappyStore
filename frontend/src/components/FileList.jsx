import React, { useState, useEffect } from 'react';
import { fileAPI } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import './FileList.css';

const FileList = ({ refreshTrigger }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingFiles, setDownloadingFiles] = useState(new Set());
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchFiles();
  }, [refreshTrigger]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fileAPI.getFiles();
      setFiles(response.files || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      showNotification('error', 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (file) => {
    try {
      setDownloadingFiles(prev => new Set([...prev, file.id]));
      
      const response = await fileAPI.downloadFile(file.id);
      
      // Create blob from response
      const blob = new Blob([response.data], { type: file.type });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showNotification('success', `Downloaded "${file.filename}"`);
    } catch (error) {
      console.error('Download error:', error);
      showNotification('error', `Failed to download "${file.filename}"`);
    } finally {
      setDownloadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.id);
        return newSet;
      });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (type, category) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type === 'text/plain') return '📄';
    if (type === 'text/markdown') return '📝';
    if (type === 'text/csv') return '📊';
    return '📄';
  };

  const getCategoryBadge = (category) => {
    const badges = {
      image: { emoji: '🎨', label: 'Image', color: '#f59e0b' },
      document: { emoji: '📄', label: 'Document', color: '#3b82f6' },
      data: { emoji: '📊', label: 'Data', color: '#10b981' },
      other: { emoji: '📁', label: 'File', color: '#6b7280' }
    };
    
    return badges[category] || badges.other;
  };

  if (loading) {
    return (
      <div className="file-list-container">
        <div className="loading-state">
          <div className="loading-spinner">⏳</div>
          <p>Loading your files...</p>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="file-list-container">
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h3>No files uploaded yet</h3>
          <p>Upload your first file to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="file-list-container">
      <div className="file-list-header">
        <h3>📁 Your Files ({files.length})</h3>
        <button className="refresh-btn" onClick={fetchFiles} disabled={loading}>
          🔄 Refresh
        </button>
      </div>

      <div className="file-grid">
        {files.map((file) => (
          <div key={file.id} className="file-card">
            <div className="file-card-header">
              <div className="file-icon-large">
                {getFileIcon(file.type, file.category)}
              </div>
              <div className="file-category-badge" style={{
                backgroundColor: `${getCategoryBadge(file.category).color}15`,
                color: getCategoryBadge(file.category).color
              }}>
                {getCategoryBadge(file.category).emoji} {getCategoryBadge(file.category).label}
              </div>
            </div>

            <div className="file-card-content">
              <h4 className="file-name" title={file.filename}>
                {file.filename}
              </h4>
              <div className="file-metadata">
                <span className="file-size">{file.formattedSize}</span>
                <span className="file-date">{formatDate(file.uploadDate)}</span>
              </div>
              <div className="file-type">{file.type}</div>
            </div>

            <div className="file-card-actions">
              <button
                className="download-file-btn"
                onClick={() => handleDownload(file)}
                disabled={downloadingFiles.has(file.id)}
              >
                {downloadingFiles.has(file.id) ? (
                  <>
                    <span className="downloading-spinner">⏳</span>
                    Downloading...
                  </>
                ) : (
                  <>
                    ⬇️ Download
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileList; 