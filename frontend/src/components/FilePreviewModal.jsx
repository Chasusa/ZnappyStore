import React, { useState, useEffect } from "react";
import { fileAPI } from "../services/api";
import { useNotification } from "../contexts/NotificationContext";
import "./FilePreviewModal.css";

const FilePreviewModal = ({ file, isOpen, onClose }) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (isOpen && file) {
      fetchFileContent();
    }
  }, [isOpen, file]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  const fetchFileContent = async () => {
    try {
      setLoading(true);
      setError(null);
      setContent("");

      const response = await fileAPI.downloadFile(file.id);
      const text = await response.data.text();
      setContent(text);
    } catch (error) {
      console.error("Error fetching file content:", error);
      setError("Failed to load file content");
      showNotification("error", `Failed to preview "${file.filename}"`);
    } finally {
      setLoading(false);
    }
  };

  const renderMarkdown = (text) => {
    // Simple markdown renderer for basic formatting
    let html = text
      // Headers
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      // Bold
      .replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")
      .replace(/__(.*?)__/gim, "<strong>$1</strong>")
      // Italic
      .replace(/\*(.*?)\*/gim, "<em>$1</em>")
      .replace(/_(.*?)_/gim, "<em>$1</em>")
      // Code blocks
      .replace(/```([^`]+)```/gim, "<pre><code>$1</code></pre>")
      // Inline code
      .replace(/`([^`]+)`/gim, "<code>$1</code>")
      // Links
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/gim,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
      )
      // Line breaks
      .replace(/\n/gim, "<br>");

    return { __html: html };
  };

  const renderCSV = (text) => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length === 0) return null;

    // Parse CSV (simple implementation)
    const rows = lines.map((line) => {
      // Simple CSV parsing - handles quoted fields
      const result = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' && (i === 0 || line[i - 1] === ",")) {
          inQuotes = true;
        } else if (
          char === '"' &&
          inQuotes &&
          (i === line.length - 1 || line[i + 1] === ",")
        ) {
          inQuotes = false;
        } else if (char === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    });

    const headers = rows[0];
    const dataRows = rows.slice(1);

    return (
      <div className="csv-table-container">
        <table className="csv-table">
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index}>{header.replace(/^"|"$/g, "")}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell.replace(/^"|"$/g, "")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="preview-loading">
          <div className="loading-spinner">⏳</div>
          <p>Loading preview...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="preview-error">
          <div className="error-icon">❌</div>
          <p>{error}</p>
          <button onClick={fetchFileContent} className="retry-btn">
            🔄 Retry
          </button>
        </div>
      );
    }

    if (!content) {
      return (
        <div className="preview-empty">
          <div className="empty-icon">📄</div>
          <p>File appears to be empty</p>
        </div>
      );
    }

    switch (file.type) {
      case "text/markdown":
        return (
          <div className="markdown-content">
            <div
              className="markdown-rendered"
              dangerouslySetInnerHTML={renderMarkdown(content)}
            />
          </div>
        );

      case "text/csv":
        return renderCSV(content);

      case "text/plain":
      default:
        return (
          <div className="text-content">
            <pre className="text-pre">{content}</pre>
          </div>
        );
    }
  };

  const getFileIcon = () => {
    switch (file.type) {
      case "text/markdown":
        return "📝";
      case "text/csv":
        return "📊";
      case "text/plain":
      default:
        return "📄";
    }
  };

  const getFileTypeLabel = () => {
    switch (file.type) {
      case "text/markdown":
        return "Markdown";
      case "text/csv":
        return "CSV";
      case "text/plain":
        return "Text";
      default:
        return "Document";
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fileAPI.downloadFile(file.id);
      const blob = new Blob([response.data], { type: file.type });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showNotification("success", `Downloaded "${file.filename}"`);
    } catch (error) {
      console.error("Download error:", error);
      showNotification("error", `Failed to download "${file.filename}"`);
    }
  };

  if (!isOpen || !file) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container">
        <div className="modal-header">
          <div className="modal-title">
            <span className="file-icon">{getFileIcon()}</span>
            <div className="file-info">
              <h2 className="file-name" title={file.filename}>
                {file.filename}
              </h2>
              <div className="file-meta">
                <span className="file-type-badge">{getFileTypeLabel()}</span>
                <span className="file-size">{file.formattedSize}</span>
                <span className="file-date">
                  {new Date(file.uploadDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="modal-actions">
            <button
              onClick={handleDownload}
              className="download-btn"
              title="Download file"
            >
              ⬇️ Download
            </button>
            <button
              onClick={onClose}
              className="close-btn"
              title="Close preview"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="modal-content">{renderContent()}</div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
