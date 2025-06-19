import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'znappystore-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173'
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 2097152, // 2MB
    uploadDir: process.env.UPLOAD_DIR || 'uploads'
  }
};

export default config;