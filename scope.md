# ZnappyStore Project Scope

## Overview
ZnappyStore is a secure file storage and management application. It provides authenticated users with the ability to upload, list, and download their own files through a simple and elegant web interface. The system enforces strict access controls to ensure privacy and security.

---

## Functional Requirements

### Authentication & Access
- All API endpoints require authentication (session or token-based).
- Each uploaded file is associated with the user who uploaded it.
- Users cannot access files uploaded by others.

### API Endpoints

#### 1. **Upload API** – `POST /upload`
- Accepts file types: JPG, PNG, GIF, SVG, TXT, MD, CSV.
- Rejects unsupported file types and files larger than 2MB.
- Returns a unique identifier for the uploaded file.

#### 2. **List API** – `GET /files`
- Returns only files uploaded by the authenticated user.

#### 3. **Download API** – `GET /files/:file_id`
- Returns raw file content.
- Enforces strict ownership checks (only the owner can access).

---

## Frontend Requirements

### Pages & Features

1. **Login/Authentication UI**
   - Simulate or implement simple authentication (email + password or token input).
   - Display clear error states on failure.

2. **File Upload View**
   - Allow users to upload files.
   - Show validation messages for unsupported types or oversized files.
   - Show success confirmation and uploaded file information.

3. **File List View**
   - Display the user's uploaded files.
   - For each file, show:
     - Filename
     - Upload date
     - File size
     - File type
   - Provide clean empty, loading, and error states.

4. **File Download View**
   - Enable users to download their own files.
   - Optionally display previews (images or plain text).

---

## Non-Functional Requirements
- Simple, modern, and elegant UI/UX.
- Secure file storage and access.
- Clear error handling and user feedback throughout the app.

---

## Out of Scope
- Sharing files between users.
- Public file access.
- Advanced user management (roles, permissions beyond ownership).

---

## Deliverables
- Backend API with authentication and file management.
- Frontend web application with all required views and features.
- Documentation for setup and usage. 