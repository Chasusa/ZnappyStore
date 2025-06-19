import React, { useEffect } from "react";
import "./Notification.css";

const Notification = ({
  type = "info",
  message,
  isVisible,
  onClose,
  duration = 5000,
  title,
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case "error":
        return "❗";
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      case "info":
      default:
        return "ℹ️";
    }
  };

  return (
    <div
      className={`notification notification--${type} ${isVisible ? "notification--visible" : ""}`}
    >
      <div className="notification__content">
        <div className="notification__icon">{getIcon()}</div>
        <div className="notification__text">
          {title && <div className="notification__title">{title}</div>}
          <div className="notification__message">{message}</div>
        </div>
        <button
          className="notification__close"
          onClick={onClose}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Notification;
