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

### ✅ Backend API (NEW!)
- **🔐 JWT Authentication** - Secure token-based authentication
- **📤 File Upload API** - Support for JPG, PNG, GIF, SVG, TXT, MD, CSV files (max 2MB)
- **📋 File Management API** - List and retrieve user files with ownership validation
- **⬇️ Secure Download API** - File download with strict access control

### 🚧 Frontend Integration (Next)
- **📤 File Upload UI** - Drag & drop file upload interface
- **📋 File List View** - Display uploaded files with details
- **⬇️ Download Interface** - File download and preview functionality
- **🖼️ File Previews** - Image and text file preview capabilities

## 🛠️ Tech Stack

**Frontend:**
- **Framework**: React 19 + Vite
- **Styling**: CSS3 with custom components
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **State Management**: React Context
- **Notifications**: Custom toast notification system

**Backend:**
- **Runtime**: Node.js with ES modules
- **Framework**: Express.js
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer
- **Security**: Helmet, CORS, bcryptjs
- **Storage**: File system (uploads directory)

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
├── backend/                           # Express.js API server
│   ├── routes/
│   │   ├── auth.js                   # Authentication endpoints
│   │   └── files.js                  # File management endpoints
│   ├── middleware/
│   │   └── auth.js                   # JWT authentication middleware
│   ├── utils/
│   │   ├── database.js               # SQLite database with better-sqlite3
│   │   └── fileValidation.js         # File validation utilities
│   ├── server.js                     # Main server file
│   ├── config.js                     # Configuration
│   └── package.json                  # Backend dependencies
└── README.md                         # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Chasusa/ZnappyStore.git
   cd ZnappyStore
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Start the backend server**
   ```bash
   npm run dev
   # Server runs on http://localhost:3001
   ```

4. **Install frontend dependencies (new terminal)**
   ```bash
   cd frontend
   npm install
   ```

5. **Start the frontend development server**
   ```bash
   npm run dev
   # Frontend runs on http://localhost:5173
   ```

6. **Open your browser**
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

**Phase 1**: Authentication & UI Foundation ✅
- Complete authentication system with JWT
- Responsive login interface with notifications
- Protected routes and access control

**Phase 2**: Backend API System ✅
- Express.js API server with all endpoints
- File upload, list, and download functionality
- Security features and validation
- Complete API documentation

**Phase 3**: Frontend Integration (Current)
- Connect frontend to real API endpoints
- File upload UI with drag & drop
- File management interface
- Download and preview functionality

## 📄 API Endpoints

### ✅ Implemented
- `POST /api/auth/login` - User authentication with JWT
- `POST /api/upload` - File upload (JPG, PNG, GIF, SVG, TXT, MD, CSV, max 2MB)
- `GET /api/files` - List authenticated user's files
- `GET /api/files/:fileId` - Download specific file (with ownership check)
- `GET /api/files/:fileId/info` - Get file information
- `GET /api/health` - API health check

### Backend Server
The API server runs on `http://localhost:3001` and provides:
- **Full authentication system** with JWT tokens
- **Complete file management** with upload, list, download
- **Security features** including CORS, Helmet, file validation
- **Error handling** with consistent response format

See [backend/README.md](backend/README.md) for detailed API documentation.

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
