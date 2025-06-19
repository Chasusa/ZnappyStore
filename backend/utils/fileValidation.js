import path from 'path';

// Allowed file types as specified in scope.md
export const ALLOWED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/svg+xml': ['.svg'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
  'text/csv': ['.csv'],
  'application/csv': ['.csv']
};

// Maximum file size (2MB as specified in scope.md)
export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

// Get all allowed extensions
export const getAllowedExtensions = () => {
  return Object.values(ALLOWED_FILE_TYPES).flat();
};

// Get all allowed MIME types
export const getAllowedMimeTypes = () => {
  return Object.keys(ALLOWED_FILE_TYPES);
};

// Validate file type by MIME type
export const isValidMimeType = (mimeType) => {
  return ALLOWED_FILE_TYPES.hasOwnProperty(mimeType);
};

// Validate file type by extension
export const isValidExtension = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  return getAllowedExtensions().includes(ext);
};

// Validate file size
export const isValidFileSize = (size) => {
  return size <= MAX_FILE_SIZE;
};

// Comprehensive file validation
export const validateFile = (file) => {
  const errors = [];
  
  if (!file) {
    errors.push('No file provided');
    return { isValid: false, errors };
  }
  
  // Check file size
  if (!isValidFileSize(file.size)) {
    errors.push(`File size (${formatFileSize(file.size)}) exceeds the 2MB limit`);
  }
  
  // Check MIME type
  if (!isValidMimeType(file.mimetype)) {
    errors.push(`File type '${file.mimetype}' is not supported`);
  }
  
  // Check file extension (additional validation)
  if (!isValidExtension(file.originalname)) {
    const ext = path.extname(file.originalname).toLowerCase();
    errors.push(`File extension '${ext}' is not supported`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Format file size for human readability
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get file type category
export const getFileCategory = (mimeType) => {
  if (mimeType.startsWith('image/')) {
    return 'image';
  } else if (mimeType.startsWith('text/') || mimeType.includes('csv')) {
    return 'text';
  }
  return 'unknown';
};

// Generate safe filename
export const generateSafeFilename = (originalFilename) => {
  const ext = path.extname(originalFilename);
  const basename = path.basename(originalFilename, ext);
  
  // Remove unsafe characters and limit length
  const safeName = basename
    .replace(/[^a-zA-Z0-9\-_]/g, '_')
    .substring(0, 50);
  
  return safeName + ext;
}; 