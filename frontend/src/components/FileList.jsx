import React, { useState, useEffect, useCallback } from "react";
import { fileAPI } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import FilePreviewModal from "./FilePreviewModal";
import "./FileList.css";

const FileList = ({ refreshTrigger }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingFiles, setDownloadingFiles] = useState(new Set());
  const [deletingFiles, setDeletingFiles] = useState(new Set());
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState(new Map());
  const [imageErrorStates, setImageErrorStates] = useState(new Set());
  const [previewFile, setPreviewFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
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
      // Remove from selected files if it was selected
      setSelectedFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(file.id);
        return newSet;
      });

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

  const handleSelectFile = (fileId) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedFiles.size === filteredFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredFiles.map((file) => file.id)));
    }
  };

  const handleBulkDelete = async () => {
    const selectedFilesList = filteredFiles.filter((file) =>
      selectedFiles.has(file.id),
    );

    if (selectedFilesList.length === 0) {
      showNotification("warning", "No files selected for deletion");
      return;
    }

    const fileNames = selectedFilesList.map((file) => file.filename);
    const confirmMessage =
      selectedFilesList.length === 1
        ? `Are you sure you want to delete "${fileNames[0]}"?`
        : `Are you sure you want to delete ${selectedFilesList.length} files?\n\n${fileNames.slice(0, 3).join(", ")}${fileNames.length > 3 ? `, and ${fileNames.length - 3} more...` : ""}`;

    if (!window.confirm(`${confirmMessage}\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      setBulkDeleting(true);
      const fileIds = selectedFilesList.map((file) => file.id);

      const result = await fileAPI.bulkDeleteFiles(fileIds);

      const successCount = result.summary.deleted;
      const failCount = result.summary.failed;

      // Remove successfully deleted files from local state
      if (successCount > 0) {
        const deletedIds = new Set(
          result.results.deleted.map((file) => file.id),
        );
        setFiles((prevFiles) =>
          prevFiles.filter((file) => !deletedIds.has(file.id)),
        );
        setSelectedFiles(new Set());
      }

      // Show notifications
      if (successCount > 0 && failCount === 0) {
        showNotification(
          "success",
          `${successCount} ${successCount === 1 ? "file" : "files"} deleted successfully`,
        );
      } else if (successCount > 0 && failCount > 0) {
        showNotification(
          "warning",
          `${successCount} files deleted, ${failCount} failed`,
        );
      } else {
        showNotification("error", "Failed to delete selected files");
      }
    } catch (error) {
      console.error("Bulk delete error:", error);
      showNotification("error", "An error occurred during bulk deletion");
    } finally {
      setBulkDeleting(false);
    }
  };

  const handlePreview = (file) => {
    setPreviewFile(file);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewFile(null);
  };

  const isPreviewableFile = (type) => {
    return (
      type === "text/plain" ||
      type === "text/markdown" ||
      type === "text/csv" ||
      type.startsWith("image/")
    );
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

  const getFileTypeGroup = (type) => {
    if (type.startsWith("image/")) return "images";
    if (type === "text/plain" || type === "text/markdown") return "documents";
    if (type === "text/csv" || type.includes("spreadsheet")) return "data";
    if (
      type.includes("pdf") ||
      type.includes("word") ||
      type.includes("presentation")
    )
      return "documents";
    return "other";
  };

  const fileTypeFilters = [
    { key: "all", label: "All Files", icon: "📁", count: files.length },
    {
      key: "images",
      label: "Images",
      icon: "🖼️",
      count: files.filter((f) => getFileTypeGroup(f.type) === "images").length,
    },
    {
      key: "documents",
      label: "Documents",
      icon: "📄",
      count: files.filter((f) => getFileTypeGroup(f.type) === "documents")
        .length,
    },
    {
      key: "data",
      label: "Data",
      icon: "📊",
      count: files.filter((f) => getFileTypeGroup(f.type) === "data").length,
    },
    {
      key: "other",
      label: "Other",
      icon: "📦",
      count: files.filter((f) => getFileTypeGroup(f.type) === "other").length,
    },
  ];

  const filteredFiles =
    activeFilter === "all"
      ? files
      : files.filter((file) => getFileTypeGroup(file.type) === activeFilter);

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

  if (filteredFiles.length === 0 && activeFilter !== "all") {
    const activeFilterData = fileTypeFilters.find(
      (f) => f.key === activeFilter,
    );
    return (
      <div className="file-list-container">
        <div className="file-list-header">
          <div className="file-count">
            {filteredFiles.length} of {files.length}{" "}
            {files.length === 1 ? "file" : "files"}
          </div>
          <div className="header-actions">
            <button
              className="refresh-btn"
              onClick={() => fetchFiles(true)}
              disabled={loading || refreshing}
            >
              {refreshing ? "Updating..." : "🔄 Refresh"}
            </button>
          </div>
        </div>

        <div className="file-filters">
          <div className="filter-tabs">
            {fileTypeFilters.map((filter) => (
              <button
                key={filter.key}
                className={`filter-tab ${activeFilter === filter.key ? "active" : ""}`}
                onClick={() => setActiveFilter(filter.key)}
                disabled={filter.count === 0}
              >
                <span className="filter-icon">{filter.icon}</span>
                <span className="filter-label">{filter.label}</span>
                <span className="filter-count">({filter.count})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="empty-filtered-state">
          <div className="empty-icon">{activeFilterData?.icon}</div>
          <h3>No {activeFilterData?.label.toLowerCase()} found</h3>
          <p>
            You haven't uploaded any {activeFilterData?.label.toLowerCase()}{" "}
            yet.
          </p>
          <button
            className="clear-filter-btn"
            onClick={() => setActiveFilter("all")}
          >
            Show All Files
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="file-list-container">
      <div className="file-list-header">
        <div className="file-count">
          {filteredFiles.length} of {files.length}{" "}
          {files.length === 1 ? "file" : "files"}
          {selectedFiles.size > 0 && (
            <span className="selected-count">
              ({selectedFiles.size} selected)
            </span>
          )}
        </div>
        <div className="header-actions">
          {files.length > 0 && (
            <div className="bulk-actions">
              <label className="select-all-checkbox">
                <input
                  type="checkbox"
                  checked={
                    selectedFiles.size === filteredFiles.length &&
                    filteredFiles.length > 0
                  }
                  onChange={handleSelectAll}
                  disabled={loading || refreshing || bulkDeleting}
                />
                <span>
                  Select All {activeFilter !== "all" ? `(${activeFilter})` : ""}
                </span>
              </label>
              {selectedFiles.size > 0 && (
                <button
                  className="bulk-delete-btn"
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting || selectedFiles.size === 0}
                >
                  {bulkDeleting ? (
                    <>
                      <span className="deleting-spinner">⏳</span>
                      Deleting...
                    </>
                  ) : (
                    <>🗑️ Delete Selected ({selectedFiles.size})</>
                  )}
                </button>
              )}
            </div>
          )}
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
      </div>

      <div className="file-filters">
        <div className="filter-tabs">
          {fileTypeFilters.map((filter) => (
            <button
              key={filter.key}
              className={`filter-tab ${activeFilter === filter.key ? "active" : ""}`}
              onClick={() => setActiveFilter(filter.key)}
              disabled={filter.count === 0}
            >
              <span className="filter-icon">{filter.icon}</span>
              <span className="filter-label">{filter.label}</span>
              <span className="filter-count">({filter.count})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="file-grid">
        {filteredFiles.map((file) => (
          <div
            key={file.id}
            className={`file-card ${selectedFiles.has(file.id) ? "selected" : ""}`}
          >
            <div className="file-card-header">
              <label className="file-checkbox">
                <input
                  type="checkbox"
                  checked={selectedFiles.has(file.id)}
                  onChange={() => handleSelectFile(file.id)}
                  disabled={bulkDeleting}
                />
              </label>
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
              {isPreviewableFile(file.type) && (
                <button
                  className="preview-file-btn"
                  onClick={() => handlePreview(file)}
                  disabled={bulkDeleting}
                  title={`Preview ${file.filename}`}
                >
                  👁️ Preview
                </button>
              )}
              <button
                className="download-file-btn"
                onClick={() => handleDownload(file)}
                disabled={
                  downloadingFiles.has(file.id) ||
                  deletingFiles.has(file.id) ||
                  bulkDeleting
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
                  downloadingFiles.has(file.id) ||
                  deletingFiles.has(file.id) ||
                  bulkDeleting
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

      <FilePreviewModal
        file={previewFile}
        isOpen={showPreview}
        onClose={handleClosePreview}
      />
    </div>
  );
};

export default FileList;
