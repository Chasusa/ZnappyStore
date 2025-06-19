import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { authenticateToken } from "../middleware/auth.js";
import {
  validateFile,
  generateSafeFilename,
  formatFileSize,
  getFileCategory,
  MAX_FILE_SIZE,
  isValidMimeType,
  isValidExtension,
} from "../utils/fileValidation.js";
import {
  createFile,
  findFilesByUserId,
  findFileById,
} from "../utils/database.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads");
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const safeFilename = generateSafeFilename(file.originalname);
    const ext = path.extname(safeFilename);
    const basename = path.basename(safeFilename, ext);
    cb(null, `${uniqueId}_${basename}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    // Only check MIME type and extension here
    const isMimeTypeValid = isValidMimeType(file.mimetype);
    const isExtensionValid = isValidExtension(file.originalname);
    if (isMimeTypeValid && isExtensionValid) {
      cb(null, true);
    } else {
      cb(new Error("File type or extension not supported"), false);
    }
  },
});

// POST /api/upload - Upload file endpoint
router.post("/upload", authenticateToken, upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "Upload failed",
        message: "No file provided",
      });
    }

    // Create file record in database
    const fileId = uuidv4();
    const fileRecord = createFile({
      id: fileId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      userId: req.user.id,
      path: req.file.path,
    });

    // Return success response with file information
    res.status(201).json({
      message: "File uploaded successfully",
      file: {
        id: fileRecord.id,
        filename: fileRecord.originalName,
        size: fileRecord.size,
        type: fileRecord.mimeType,
        category: getFileCategory(fileRecord.mimeType),
        uploadDate: fileRecord.uploadDate,
        formattedSize: formatFileSize(fileRecord.size),
      },
    });
  } catch (error) {
    console.error("Upload error:", error);

    // Clean up uploaded file if there was an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      error: "Upload failed",
      message: "An error occurred during file upload",
    });
  }
});

// GET /api/files - List user's files endpoint
router.get("/files", authenticateToken, (req, res) => {
  try {
    const userFiles = findFilesByUserId(req.user.id);

    // Format files for response
    const formattedFiles = userFiles.map((file) => ({
      id: file.id,
      filename: file.originalName,
      size: file.size,
      type: file.mimeType,
      category: getFileCategory(file.mimeType),
      uploadDate: file.uploadDate,
      formattedSize: formatFileSize(file.size),
    }));

    res.json({
      message: "Files retrieved successfully",
      files: formattedFiles,
      count: formattedFiles.length,
    });
  } catch (error) {
    console.error("List files error:", error);
    res.status(500).json({
      error: "Failed to retrieve files",
      message: "An error occurred while retrieving your files",
    });
  }
});

// GET /api/files/:fileId - Download file endpoint
router.get("/files/:fileId", authenticateToken, (req, res) => {
  try {
    const { fileId } = req.params;

    // Find file in database
    const file = findFileById(fileId);
    if (!file) {
      return res.status(404).json({
        error: "File not found",
        message: "The requested file does not exist",
      });
    }

    // Check ownership - users can only access their own files
    if (file.userId !== req.user.id) {
      return res.status(403).json({
        error: "Access denied",
        message: "You do not have permission to access this file",
      });
    }

    // Check if file exists on disk
    if (!fs.existsSync(file.path)) {
      return res.status(404).json({
        error: "File not found",
        message: "The file no longer exists on the server",
      });
    }

    // Set appropriate headers for download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.originalName}"`,
    );
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Length", file.size);

    // Stream file to response
    const fileStream = fs.createReadStream(file.path);
    fileStream.pipe(res);

    fileStream.on("error", (error) => {
      console.error("File stream error:", error);
      if (!res.headersSent) {
        res.status(500).json({
          error: "Download failed",
          message: "An error occurred while downloading the file",
        });
      }
    });
  } catch (error) {
    console.error("Download error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Download failed",
        message: "An error occurred while processing the download",
      });
    }
  }
});

// GET /api/files/:fileId/preview - Get file for inline preview (images)
router.get("/files/:fileId/preview", authenticateToken, (req, res) => {
  try {
    const fileId = req.params.fileId;

    // Find file in database
    const file = findFileById(fileId);
    if (!file) {
      return res.status(404).json({
        error: "File not found",
        message: "The requested file does not exist",
      });
    }

    // Check ownership - users can only access their own files
    if (file.userId !== req.user.id) {
      return res.status(403).json({
        error: "Access denied",
        message: "You do not have permission to access this file",
      });
    }

    // Check if file exists on disk
    if (!fs.existsSync(file.path)) {
      return res.status(404).json({
        error: "File not found",
        message: "The file no longer exists on the server",
      });
    }

    // Set appropriate headers for inline preview
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader("Content-Length", file.size);
    res.setHeader("Cache-Control", "public, max-age=3600"); // Cache for 1 hour

    // Stream file to response
    const fileStream = fs.createReadStream(file.path);
    fileStream.pipe(res);

    fileStream.on("error", (error) => {
      console.error("File stream error:", error);
      if (!res.headersSent) {
        res.status(500).json({
          error: "Preview failed",
          message: "An error occurred while loading the preview",
        });
      }
    });
  } catch (error) {
    console.error("Preview error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Preview failed",
        message: "An error occurred while processing the preview",
      });
    }
  }
});

// GET /api/files/:fileId/info - Get file information (without downloading)
router.get("/files/:fileId/info", authenticateToken, (req, res) => {
  try {
    const { fileId } = req.params;

    const file = findFileById(fileId);
    if (!file) {
      return res.status(404).json({
        error: "File not found",
        message: "The requested file does not exist",
      });
    }

    // Check ownership
    if (file.userId !== req.user.id) {
      return res.status(403).json({
        error: "Access denied",
        message: "You do not have permission to access this file",
      });
    }

    res.json({
      file: {
        id: file.id,
        filename: file.originalName,
        size: file.size,
        type: file.mimeType,
        category: getFileCategory(file.mimeType),
        uploadDate: file.uploadDate,
        formattedSize: formatFileSize(file.size),
      },
    });
  } catch (error) {
    console.error("File info error:", error);
    res.status(500).json({
      error: "Failed to retrieve file information",
      message: "An error occurred while retrieving file information",
    });
  }
});

export default router;
