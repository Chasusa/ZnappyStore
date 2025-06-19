# ZnappyStore

A secure file storage and management application that provides authenticated users with the ability to upload, list, and download their own files through a simple and elegant web interface.

## 🚀 Features

### ✅ Implemented
- **🔐 Authentication System**
  - Token-based authentication with localStorage persistence
  - Secure login/logout functionality
  - Protected routes and access control
  - Beautiful, responsive login interface

- **🔔 Notification System**
  - Toast notifications for user feedback
  - Multiple notification types (Error, Success, Warning, Info)
  - Auto-dismissal with configurable duration
  - Mobile-responsive design

- **🎨 Modern UI/UX**
  - Responsive design for all screen sizes
  - Beautiful gradient backgrounds
  - Smooth animations and transitions
  - Mobile-first approach with desktop enhancements

### 🚧 Planned Features
- **📤 File Upload** - Support for JPG, PNG, GIF, SVG, TXT, MD, CSV files (max 2MB)
- **📋 File Management** - List, view, and organize uploaded files
- **⬇️ File Download** - Secure file retrieval with ownership validation
- **🖼️ File Previews** - Image and text file preview functionality

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: CSS3 with custom components
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **Authentication**: JWT-style token management
- **Notifications**: Custom toast notification system

## 📦 Project Structure

```
ZnappyStore/
├── scope.md                           # Project requirements and scope
├── frontend/                          # React frontend application
│   ├── src/
│   │   ├── components/                # Reusable UI components
│   │   │   ├── Login.jsx             # Authentication form
│   │   │   ├── Header.jsx            # App header with navigation
│   │   │   ├── ProtectedRoute.jsx    # Route protection wrapper
│   │   │   └── Notification.jsx      # Toast notification component
│   │   ├── contexts/                 # React contexts for state management
│   │   │   ├── AuthWithNotifications.jsx  # Auth context with notifications
│   │   │   └── NotificationContext.jsx    # Global notification state
│   │   ├── services/                 # API and external services
│   │   │   └── mockAuth.js           # Mock authentication service
│   │   ├── App.jsx                   # Main application component
│   │   └── main.jsx                  # Application entry point
│   ├── NOTIFICATIONS.md              # Notification system documentation
│   └── package.json                  # Frontend dependencies
└── README.md                         # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ZnappyStore.git
   cd ZnappyStore
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔑 Demo Credentials

Use these credentials to test the application:

| Purpose | Email | Password | Expected Result |
|---------|-------|----------|----------------|
| **Valid Login** | `demo@znappystore.com` | `demo123` | Success notification |
| **Invalid Credentials** | `wrong@email.com` | `wrong` | Error notification |
| **Network Error Test** | `network@error.com` | `any` | Network error simulation |
| **Server Error Test** | `server@error.com` | `any` | Server error simulation |

## 📱 Responsive Design

ZnappyStore is designed to work seamlessly across all devices:

- **📱 Mobile (≤480px)**: Touch-optimized interface with full-width components
- **📟 Tablet (481px-1199px)**: Balanced layout with appropriate spacing
- **🖥️ Desktop (≥1200px)**: Spacious design with enhanced visual elements

## 🔔 Notification System

The application features a comprehensive notification system:

- **Error Notifications**: Red theme, 7-second duration
- **Success Notifications**: Green theme, 5-second duration  
- **Warning Notifications**: Orange theme, 5-second duration
- **Info Notifications**: Blue theme, 5-second duration

See [NOTIFICATIONS.md](frontend/NOTIFICATIONS.md) for detailed documentation.

## 🛡️ Security Features

- **Authentication**: Token-based authentication with secure storage
- **Route Protection**: Protected routes require valid authentication
- **File Ownership**: Users can only access their own files
- **Input Validation**: Client-side validation for all user inputs

## 🚧 Development Status

**Current Phase**: Authentication & UI Foundation ✅

**Next Phase**: File Management System
- Backend API development
- File upload functionality
- File listing and management
- Download and preview features

## 📄 API Endpoints (Planned)

- `POST /api/auth/login` - User authentication
- `POST /api/upload` - File upload (JPG, PNG, GIF, SVG, TXT, MD, CSV)
- `GET /api/files` - List user's files
- `GET /api/files/:file_id` - Download specific file

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/your-username/ZnappyStore/issues) page
2. Create a new issue with detailed information
3. Include steps to reproduce any bugs

---

**ZnappyStore** - Secure file storage made simple. 🚀 