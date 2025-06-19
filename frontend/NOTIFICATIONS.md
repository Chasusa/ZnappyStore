# ZnappyStore Notification System

## Overview
The notification system provides elegant toast notifications for user feedback throughout the application. It includes support for different notification types, auto-dismissal, and multiple simultaneous notifications.

## Features
- **Multiple notification types**: Error, Success, Warning, Info
- **Auto-dismissal**: Configurable duration with default 5 seconds
- **Manual dismissal**: Users can close notifications manually
- **Multiple notifications**: Stack multiple notifications gracefully
- **Responsive design**: Adapts to mobile and desktop layouts
- **Accessibility**: Proper ARIA labels and keyboard support

## Usage

### Basic Usage
```jsx
import { useNotification } from '../contexts/NotificationContext';

function MyComponent() {
  const { showError, showSuccess, showWarning, showInfo } = useNotification();
  
  const handleAction = () => {
    // Show different types of notifications
    showSuccess('Operation completed successfully!');
    showError('Something went wrong!');
    showWarning('Please check your input.');
    showInfo('Here\'s some helpful information.');
  };
}
```

### Advanced Usage
```jsx
// Custom duration and title
showError('Invalid credentials', {
  title: 'Login Failed',
  duration: 7000 // 7 seconds
});

// No auto-dismiss
showInfo('Important information', {
  duration: 0 // Won't auto-dismiss
});

// Custom options
addNotification({
  type: 'success',
  message: 'Custom notification',
  title: 'Custom Title',
  duration: 3000
});
```

## Authentication Integration
The notification system is integrated with the authentication flow:

- **Login Success**: Shows welcome message
- **Login Error**: Shows contextual error messages based on error type
- **Logout**: Shows confirmation message
- **Network Errors**: Shows connection-specific error messages

## Test Scenarios
You can test different notification scenarios using these credentials:

- **Valid Login**: `demo@znappystore.com` / `demo123` → Success notification
- **Invalid Credentials**: `wrong@email.com` / `wrong` → Invalid credentials error
- **Network Error**: `network@error.com` / `any` → Network error notification
- **Server Error**: `server@error.com` / `any` → Server error notification

## Notification Types

### Error Notifications
- **Color**: Red theme
- **Icon**: ❌
- **Default Duration**: 7 seconds (longer for errors)
- **Use Case**: Login failures, validation errors, server errors

### Success Notifications
- **Color**: Green theme
- **Icon**: ✅
- **Default Duration**: 5 seconds
- **Use Case**: Login success, file uploads, successful operations

### Warning Notifications
- **Color**: Orange/yellow theme
- **Icon**: ⚠️
- **Default Duration**: 5 seconds
- **Use Case**: File size warnings, validation warnings

### Info Notifications
- **Color**: Blue theme
- **Icon**: ℹ️
- **Default Duration**: 5 seconds
- **Use Case**: General information, tips, status updates

## Accessibility Features
- Proper ARIA labels for screen readers
- Keyboard navigation support
- Focus management
- High contrast colors for readability

## Mobile Responsiveness
- Notifications adapt to screen size
- Full-width on mobile devices
- Touch-friendly close buttons
- Appropriate spacing for touch targets 