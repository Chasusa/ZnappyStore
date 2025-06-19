# 👥 ZnappyStore Demo Users

This document provides information about the demo users available for testing ZnappyStore.

## 🚀 Available Demo Accounts

The following demo accounts are automatically created when you start the backend server:

### Primary Demo Users
| Email | Password | Name | Purpose |
|-------|----------|------|---------|
| `demo@znappystore.com` | `demo123` | Demo User | Main demo account |
| `test@example.com` | `test123` | Test User | Secondary test account |
| `admin@znappystore.com` | `admin123` | Admin User | Admin testing |
| `john@example.com` | `john123` | John Smith | User persona testing |

## 🎯 How to Use Demo Accounts

1. **Start the backend server**:
   ```bash
   cd ZnappyStore/backend
   npm run dev
   ```

2. **Start the frontend**:
   ```bash
   cd ZnappyStore/frontend
   npm run dev
   ```

3. **Login with any demo account**:
   - Go to `http://localhost:5173`
   - Use any email/password combination from the table above
   - Each user has their own isolated file storage

## 🛠️ Managing Demo Users

### Using the User Management Script

We've included a convenient script to manage users:

```bash
cd ZnappyStore/backend
node scripts/manage-users.js [command]
```

### Available Commands

#### List all users
```bash
node scripts/manage-users.js list
```

#### Create a new user
```bash
node scripts/manage-users.js create "alice@example.com" "alice123" "Alice Johnson"
```

#### Delete a user
```bash
node scripts/manage-users.js delete "alice@example.com"
```

#### Reset user password
```bash
node scripts/manage-users.js reset "demo@znappystore.com" "newpassword123"
```

#### Create additional demo users
```bash
node scripts/manage-users.js demo
```

#### Show help
```bash
node scripts/manage-users.js help
```

## 🔐 Security Notes

- **Demo passwords are simple** - Only use these for testing!
- **Each user has isolated file storage** - Files uploaded by one user are not visible to others
- **User authentication is required** - All file operations require valid login
- **JWT tokens expire** - You'll need to re-login periodically

## 🧪 Testing Scenarios

### Multi-User Testing
1. **Login as `demo@znappystore.com`** and upload some files
2. **Logout and login as `test@example.com`** 
3. **Verify file isolation** - You should only see files uploaded by the current user

### File Upload Testing
1. **Test different file types**: JPG, PNG, GIF, SVG, TXT, MD, CSV
2. **Test file size limits**: Maximum 2MB per file
3. **Test automatic refresh**: Upload a file and watch the file list update automatically

### User Management Testing
1. **Create new users** with the management script
2. **Test login with new accounts**
3. **Reset passwords** and verify login still works

## 📊 Database Information

- **Database Type**: SQLite
- **Location**: `ZnappyStore/backend/znappystore.db`
- **Tables**: `users`, `files`
- **User isolation**: Files are linked to users via `user_id` foreign key

## 🚨 Troubleshooting

### "User not found" errors
- Ensure the backend server has started successfully
- Check that demo users were created (look for success messages in server logs)
- Try running `node scripts/manage-users.js list` to verify users exist

### Authentication issues
- Verify you're using the correct email/password combinations
- Clear browser localStorage if you're getting token errors
- Restart both frontend and backend servers

### File upload issues
- Check file size (must be < 2MB)
- Verify file type is supported
- Ensure you're logged in with a valid account

## 🔄 Resetting Demo Data

To completely reset the demo data:

1. **Stop the backend server**
2. **Delete the database file**:
   ```bash
   rm