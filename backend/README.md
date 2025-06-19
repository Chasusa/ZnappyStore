# ZnappyStore Backend API

Backend API server for ZnappyStore - A secure file storage and management application.

## 🚀 Features

- **🔐 JWT Authentication** - Secure token-based authentication
- **📤 File Upload** - Support for JPG, PNG, GIF, SVG, TXT, MD, CSV files (max 2MB)
- **📋 File Management** - List and retrieve user files
- **⬇️ Secure Downloads** - File download with ownership verification
- **🛡️ Security** - CORS, Helmet, input validation
- **📊 File Validation** - Type and size validation as per requirements

## 🛠️ Tech Stack

- **Runtime**: Node.js with ES modules
- **Framework**: Express.js
- **Authentication**: JWT (jsonwebtoken)
- **File Upload**: Multer
- **Security**: Helmet, CORS, bcryptjs
- **Storage**: File system (uploads directory)
- **Database**: In-memory mock database

## 📋 API Endpoints

### Authentication

#### POST `/api/auth/login`
Authenticate user and receive JWT token.

**Request:**
```json
{
  "email": "demo@znappystore.com",
  "password": "demo123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "demo@znappystore.com",
    "name": "Demo User"
  }
}
```

### File Management

#### POST `/api/upload`
Upload a file (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: File to upload (JPG, PNG, GIF, SVG, TXT, MD, CSV, max 2MB)

**Response:**
```json
{
  "message": "File uploaded successfully",
  "file": {
    "id": "uuid-v4-string",
    "filename": "document.pdf",
    "size": 1048576,
    "type": "application/pdf",
    "category": "document",
    "uploadDate": "2024-01-01T12:00:00.000Z",
    "formattedSize": "1.00 MB"
  }
}
```

#### GET `/api/files`
List all files for authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Files retrieved successfully",
  "files": [
    {
      "id": "uuid-v4-string",
      "filename": "document.pdf",
      "size": 1048576,
      "type": "application/pdf",
      "category": "document",
      "uploadDate": "2024-01-01T12:00:00.000Z",
      "formattedSize": "1.00 MB"
    }
  ],
  "count": 1
}
```

#### GET `/api/files/:fileId`
Download a specific file (requires authentication and ownership).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
- File download with appropriate headers
- `Content-Disposition`: attachment; filename="original-filename.ext"
- `Content-Type`: file MIME type
- `Content-Length`: file size

#### GET `/api/files/:fileId/info`
Get file information without downloading.

**Response:**
```json
{
  "file": {
    "id": "uuid-v4-string",
    "filename": "document.pdf",
    "size": 1048576,
    "type": "application/pdf",
    "category": "document",
    "uploadDate": "2024-01-01T12:00:00.000Z",
    "formattedSize": "1.00 MB"
  }
}
```

### Health Check

#### GET `/api/health`
Check API server status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "version": "1.0.0"
}
```

## 🚀 Quick Start

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file or use the default configuration:
   ```env
   PORT=3001
   NODE_ENV=development
   JWT_SECRET=znappystore-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=http://localhost:5173
   MAX_FILE_SIZE=2097152
   UPLOAD_DIR=uploads
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Test the API**
   Navigate to `http://localhost:3001` to see the API information.

## 📁 File Support

### Supported File Types
- **Images**: JPG, JPEG, PNG, GIF, SVG
- **Text**: TXT, MD (Markdown), CSV

### File Restrictions
- **Maximum size**: 2MB per file
- **Single file uploads**: One file at a time
- **Validation**: Both MIME type and extension checking

## 🔐 Authentication

- **Token Type**: JWT (JSON Web Token)
- **Header Format**: `Authorization: Bearer <token>`
- **Token Expiry**: 7 days (configurable)
- **Password Hashing**: bcryptjs

### Demo Users
- **Email**: `demo@znappystore.com`, **Password**: `demo123`
- **Email**: `test@example.com`, **Password**: `test123`

## 🛡️ Security Features

- **CORS**: Configured for frontend origin
- **Helmet**: Security headers
- **File Validation**: Type and size restrictions
- **Ownership Checks**: Users can only access their own files
- **Input Sanitization**: Safe filename generation
- **Error Handling**: Comprehensive error responses

## 📊 Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (not implemented yet)

### Project Structure
```
backend/
├── server.js              # Main server file
├── config.js              # Configuration
├── routes/
│   ├── auth.js            # Authentication routes
│   └── files.js           # File management routes
├── middleware/
│   └── auth.js            # Authentication middleware
├── utils/
│   ├── database.js        # Mock database
│   └── fileValidation.js  # File validation utilities
└── uploads/               # File storage directory
```

## 🐛 Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error type",
  "message": "Human-readable error message"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (access denied)
- `404` - Not Found (resource not found)
- `413` - Payload Too Large (file too big)
- `500` - Internal Server Error

## 🔄 Future Enhancements

- Database integration (PostgreSQL/MongoDB)
- File versioning
- Bulk file operations
- File sharing capabilities
- Enhanced file preview
- Rate limiting
- File compression
- Cloud storage integration

---

**ZnappyStore Backend** - Secure file storage API. 🚀