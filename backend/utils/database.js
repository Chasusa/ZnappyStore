import bcrypt from 'bcryptjs';

// Mock users database (in production, this would be a real database)
export const users = [
  {
    id: 1,
    email: 'demo@znappystore.com',
    password: await bcrypt.hash('demo123', 10),
    name: 'Demo User',
    createdAt: new Date('2024-01-01T00:00:00Z')
  },
  {
    id: 2,
    email: 'test@example.com',
    password: await bcrypt.hash('test123', 10),
    name: 'Test User',
    createdAt: new Date('2024-01-01T00:00:00Z')
  }
];

// Mock files database (in production, this would be a real database)
export const files = [];

// Database helper functions
export const findUserByEmail = (email) => {
  return users.find(user => user.email === email);
};

export const findUserById = (id) => {
  return users.find(user => user.id === id);
};

export const createFile = (fileData) => {
  const file = {
    id: fileData.id,
    filename: fileData.filename,
    originalName: fileData.originalName,
    mimeType: fileData.mimeType,
    size: fileData.size,
    userId: fileData.userId,
    path: fileData.path,
    uploadDate: new Date().toISOString()
  };
  
  files.push(file);
  return file;
};

export const findFilesByUserId = (userId) => {
  return files.filter(file => file.userId === userId);
};

export const findFileById = (fileId) => {
  return files.find(file => file.id === fileId);
};

export const deleteFileById = (fileId) => {
  const index = files.findIndex(file => file.id === fileId);
  if (index > -1) {
    const deletedFile = files[index];
    files.splice(index, 1);
    return deletedFile;
  }
  return null;
};

// Get database stats (for debugging)
export const getStats = () => {
  return {
    users: users.length,
    files: files.length,
    userFiles: files.reduce((acc, file) => {
      acc[file.userId] = (acc[file.userId] || 0) + 1;
      return acc;
    }, {})
  };
}; 