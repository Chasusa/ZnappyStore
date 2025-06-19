import React, { useState, useRef, useCallback, useMemo } from "react";
import { fileAPI } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import "./FileUpload.css";

const FileUpload = ({ onUploadSuccess }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [currentUploadIndex, setCurrentUploadIndex] = useState(0);

  const fileInputRef = useRef(null);
  const { showNotification } = useNotification();

  // Supported file types (matching backend validation)
  const supportedTypes = useMemo(
    () => ({
      "image/jpeg": ".jpg",
      "image/jpg": ".jpg",
      "image/png": ".png",
      "image/gif": ".gif",
      "image/svg+xml": ".svg",
      "text/plain": ".txt",
      "text/markdown": ".md",
      "application/octet-stream": ".md",
      "text/csv": ".csv",
      "application/csv": ".csv",
    }),
    [],
  );

  const maxFileSize = 2 * 1024 * 1024; // 2MB

  const validateFile = useCallback(
    (file) => {
      // Check file size
      if (file.size > maxFileSize) {
        throw new Error(
          `File size must be less than 2MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
        );
      }

      // Check file type - be more flexible with common file types
      const fileExtension = file.name.toLowerCase().split(".").pop();
      const isValidType =
        supportedTypes[file.type] ||
        (fileExtension === "md" &&
          (file.type === "text/plain" ||
            file.type === "text/markdown" ||
            file.type === "application/octet-stream" ||
            file.type === "")) ||
        (fileExtension === "txt" &&
          (file.type === "text/plain" || file.type === "")) ||
        (fileExtension === "csv" &&
          (file.type === "text/csv" ||
            file.type === "application/csv" ||
            file.type === "text/plain"));

      if (!isValidType) {
        const supportedExtensions = Object.values(supportedTypes).join(", ");
        throw new Error(
          `File type not supported. Supported formats: ${supportedExtensions}`,
        );
      }

      return true;
    },
    [maxFileSize, supportedTypes],
  );

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

  const handleSingleFileUpload = useCallback(
    async (file, fileIndex = 0, totalFiles = 1) => {
      try {
        console.log("🚀 Starting file upload:", {
          name: file.name,
          size: file.size,
          type: file.type,
        });

        validateFile(file);

        console.log("📁 File validation passed, calling API...");

        const result = await fileAPI.uploadFile(file, (progress) => {
          console.log("📊 Upload progress:", progress + "%");
          setUploadProgress(progress);
        });

        console.log("✅ Upload successful:", result);

        if (totalFiles === 1) {
          showNotification(
            "success",
            `File "${file.name}" uploaded successfully!`,
          );
        }

        // Notify parent component for automatic refresh
        if (onUploadSuccess) {
          onUploadSuccess(result.file);
        }

        return { success: true, file: result.file };
      } catch (error) {
        console.error("❌ Upload error details:", {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          config: error.config,
          code: error.code,
        });
        let errorMessage = "Upload failed";
        if (
          error.code === "ECONNREFUSED" ||
          error.message.includes("Network Error")
        ) {
          errorMessage =
            "Cannot connect to server. Please check if the backend is running on port 3001.";
        } else if (error.response?.status === 401) {
          errorMessage = "Authentication required. Please log in again.";
        } else if (error.response?.status === 413) {
          errorMessage = "File is too large. Maximum allowed size is 2MB.";
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
          if (errorMessage.includes("exceeds the 2MB limit")) {
            errorMessage = "File is too large. Maximum allowed size is 2MB.";
          }
        } else if (error.message) {
          errorMessage = error.message;
        }

        if (totalFiles === 1) {
          showNotification("error", errorMessage);
        }

        return { success: false, error: errorMessage, fileName: file.name };
      }
    },
    [showNotification, onUploadSuccess, validateFile],
  );

  const handleMultipleFileUpload = useCallback(
    async (files) => {
      setIsUploading(true);
      setUploadProgress(0);
      setCurrentUploadIndex(0);

      const results = {
        successful: [],
        failed: [],
      };

      for (let i = 0; i < files.length; i++) {
        setCurrentUploadIndex(i + 1);
        const file = files[i];

        const result = await handleSingleFileUpload(file, i, files.length);

        if (result.success) {
          results.successful.push(result.file);
        } else {
          results.failed.push({ fileName: file.name, error: result.error });
        }
      }

      // Show summary notification
      const successCount = results.successful.length;
      const failCount = results.failed.length;

      if (successCount > 0 && failCount === 0) {
        showNotification(
          "success",
          `All ${successCount} files uploaded successfully!`,
        );
      } else if (successCount > 0 && failCount > 0) {
        showNotification(
          "warning",
          `${successCount} files uploaded successfully, ${failCount} failed.`,
        );
      } else {
        showNotification("error", `All ${failCount} files failed to upload.`);
      }

      // Reset state
      setIsUploading(false);
      setUploadProgress(0);
      setCurrentUploadIndex(0);
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleSingleFileUpload, showNotification],
  );

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      setSelectedFiles(files);
    }
  }, []);

  const handleFileSelect = useCallback((event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      setSelectedFiles(files);
    }
  }, []);

  const removeFile = useCallback((index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const startUpload = useCallback(() => {
    if (selectedFiles.length === 1) {
      handleSingleFileUpload(selectedFiles[0]);
    } else if (selectedFiles.length > 1) {
      handleMultipleFileUpload(selectedFiles);
    }
  }, [selectedFiles, handleSingleFileUpload, handleMultipleFileUpload]);

  const clearSelection = useCallback(() => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }, []);

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="file-upload-container">
      <div className="upload-section">
        <div
          className={`upload-dropzone ${isDragActive ? "drag-active" : ""} ${isUploading ? "uploading" : ""}`}
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
            accept=".jpg,.jpeg,.png,.gif,.svg,.txt,.md,.csv"
            className="file-input"
            disabled={isUploading}
            multiple
          />

          <div className="upload-content">
            {isUploading ? (
              <>
                <div className="upload-spinner">⏳</div>
                <p>
                  Uploading file {currentUploadIndex} of {selectedFiles.length}
                  ... {uploadProgress}%
                </p>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </>
            ) : selectedFiles.length > 0 ? (
              <>
                <div className="upload-icon">📁</div>
                <h4>
                  {selectedFiles.length} file
                  {selectedFiles.length > 1 ? "s" : ""} selected
                </h4>
                <div className="selected-files-actions">
                  <button
                    className="upload-btn primary"
                    type="button"
                    onClick={startUpload}
                  >
                    Upload {selectedFiles.length} File
                    {selectedFiles.length > 1 ? "s" : ""}
                  </button>
                  <button
                    className="upload-btn secondary"
                    type="button"
                    onClick={clearSelection}
                  >
                    Clear Selection
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="upload-icon">📁</div>
                <h4>Create or import files</h4>
                <p className="upload-subtitle">Maximum file size: 2MB each</p>
                <p className="upload-formats">
                  Supported formats: JPG, PNG, GIF, SVG, TXT, MD, CSV
                </p>
                <div className="upload-actions">
                  <button className="upload-btn primary" type="button">
                    Choose Files
                  </button>
                  <p className="or-text">or drag and drop here</p>
                </div>
              </>
            )}
          </div>
        </div>

        {selectedFiles.length > 0 && !isUploading && (
          <div className="selected-files-list">
            <h5>Selected Files ({selectedFiles.length}):</h5>
            <div className="files-preview">
              {selectedFiles.map((file, index) => (
                <div key={index} className="file-preview-item">
                  <div className="file-info">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                  <button
                    className="remove-file-btn"
                    onClick={() => removeFile(index)}
                    type="button"
                    title="Remove file"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
