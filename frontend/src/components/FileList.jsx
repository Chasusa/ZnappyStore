import React, { useState, useEffect, useCallback } from "react";
import { fileAPI } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import "./FileList.css";

const FileList = ({ refreshTrigger }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingFiles, setDownloadingFiles] = useState(new Set());
  const [deletingFiles, setDeletingFiles] = useState(new Set());
  const [imageLoadingStates, setImageLoadingStates] = useState(new Map());
  const [imageErrorStates, setImageErrorStates] = useState(new Set());
  const { showNotification } = useNotification();

  const fetchFiles = useCallback(
    async (isManualRefresh = false) => {
      try {
        if (!isManualRefresh) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        const response = await fileAPI.getFiles();
        const newFiles = response.files || [];
        setFiles(newFiles);

        if (isManualRefresh) {
          showNotification(
            "success",
            `Files refreshed - ${newFiles.length} files found`,
          );
        }
      } catch (error) {
        console.error("Error fetching files:", error);
        showNotification("error", "Failed to load files");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [showNotification],
  );

  useEffect(() => {
    fetchFiles();
  }, [refreshTrigger, fetchFiles]);

  const handleDownload = async (file) => {
    try {
      setDownloadingFiles((prev) => new Set([...prev, file.id]));

      const response = await fileAPI.downloadFile(file.id);

      // Create blob from response
      const blob = new Blob([response.data], { type: file.type });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.filename;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showNotification("success", `Downloaded "${file.filename}"`);
    } catch (error) {
      console.error("Download error:", error);
      showNotification("error", `Failed to download "${file.filename}"`);
    } finally {
      setDownloadingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(file.id);
        return newSet;
      });
    }
  };

  const handleDelete = async (file) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${file.filename}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      setDeletingFiles((prev) => new Set([...prev, file.id]));

      await fileAPI.deleteFile(file.id);

      // Remove the file from the local state
      setFiles((prevFiles) => prevFiles.filter((f) => f.id !== file.id));

      showNotification("success", `"${file.filename}" deleted successfully`);
    } catch (error) {
      console.error("Delete error:", error);
      showNotification("error", `Failed to delete "${file.filename}"`);
    } finally {
      setDeletingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(file.id);
        return newSet;
      });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFileIcon = (type) => {
    if (type.startsWith("image/")) return "🖼️";
    if (type === "text/plain") return "📄";
    if (type === "text/markdown") return "📝";
    if (type === "text/csv") return "📊";
    return "📄";
  };

  const getImagePreviewUrl = (fileId) => {
    const token = localStorage.getItem("token");
    return `http://localhost:3001/api/files/${fileId}/preview?token=${token}`;
  };

  const isImageFile = (type) => {
    return type.startsWith("image/");
  };

  const handleImageLoad = (fileId) => {
    setImageLoadingStates((prev) => {
      const newMap = new Map(prev);
      newMap.delete(fileId);
      return newMap;
    });
  };

  const handleImageError = (fileId) => {
    setImageLoadingStates((prev) => {
      const newMap = new Map(prev);
      newMap.delete(fileId);
      return newMap;
    });
    setImageErrorStates((prev) => new Set([...prev, fileId]));
  };

  const handleImageLoadStart = (fileId) => {
    setImageLoadingStates((prev) => {
      const newMap = new Map(prev);
      newMap.set(fileId, true);
      return newMap;
    });
    setImageErrorStates((prev) => {
      const newSet = new Set(prev);
      newSet.delete(fileId);
      return newSet;
    });
  };

  const getCategoryBadge = (category) => {
    const badges = {
      image: { emoji: "🎨", label: "Image", color: "#f59e0b" },
      document: { emoji: "📄", label: "Document", color: "#3b82f6" },
      data: { emoji: "📊", label: "Data", color: "#10b981" },
      other: { emoji: "📁", label: "File", color: "#6b7280" },
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
        <div className="file-count">
          {files.length} {files.length === 1 ? "file" : "files"}
        </div>
        {refreshing && (
          <div className="refresh-indicator">
            <span>Updating...</span>
          </div>
        )}
        <button
          className="refresh-btn"
          onClick={() => fetchFiles(true)}
          disabled={loading || refreshing}
        >
          {refreshing ? "Updating..." : "🔄 Refresh"}
        </button>
      </div>

      <div className="file-grid">
        {files.map((file) => (
          <div key={file.id} className="file-card">
            <div className="file-card-header">
              {isImageFile(file.type) ? (
                <div className="image-preview-container">
                  {imageLoadingStates.get(file.id) && (
                    <div className="image-loading">
                      <div className="loading-spinner">⏳</div>
                    </div>
                  )}
                  {!imageErrorStates.has(file.id) && (
                    <img
                      src={getImagePreviewUrl(file.id)}
                      alt={file.filename}
                      className="image-preview"
                      title={file.filename}
                      onLoadStart={() => handleImageLoadStart(file.id)}
                      onLoad={() => handleImageLoad(file.id)}
                      onError={() => handleImageError(file.id)}
                      style={{
                        display: imageLoadingStates.get(file.id)
                          ? "none"
                          : "block",
                      }}
                    />
                  )}
                  {imageErrorStates.has(file.id) && (
                    <div className="file-icon-large fallback-icon">
                      {getFileIcon(file.type)}
                    </div>
                  )}
                </div>
              ) : (
                <div className="file-icon-large">{getFileIcon(file.type)}</div>
              )}
              <div
                className="file-category-badge"
                style={{
                  backgroundColor: `${getCategoryBadge(file.category).color}15`,
                  color: getCategoryBadge(file.category).color,
                }}
              >
                {getCategoryBadge(file.category).emoji}{" "}
                {getCategoryBadge(file.category).label}
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
                disabled={
                  downloadingFiles.has(file.id) || deletingFiles.has(file.id)
                }
              >
                {downloadingFiles.has(file.id) ? (
                  <>
                    <span className="downloading-spinner">⏳</span>
                    Downloading...
                  </>
                ) : (
                  <>⬇️ Download</>
                )}
              </button>
              <button
                className="delete-file-btn"
                onClick={() => handleDelete(file)}
                disabled={
                  downloadingFiles.has(file.id) || deletingFiles.has(file.id)
                }
                title={`Delete ${file.filename}`}
              >
                {deletingFiles.has(file.id) ? (
                  <>
                    <span className="deleting-spinner">⏳</span>
                    Deleting...
                  </>
                ) : (
                  <>🗑️ Delete</>
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
