import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create database connection
const dbPath = path.join(__dirname, "..", "znappystore.db");
const db = new Database(dbPath);

// Enable foreign keys
db.pragma("foreign_keys = ON");

// Create tables
const createTables = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Files table
  db.exec(`
    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      file_path TEXT NOT NULL,
      upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  console.log("📊 Database tables created successfully");
};

// Seed initial data
const seedData = async () => {
  try {
    // Check if users already exist
    const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();

    if (userCount.count === 0) {
      console.log("🌱 Seeding initial user data...");

      const insertUser = db.prepare(`
        INSERT INTO users (email, password, name)
        VALUES (?, ?, ?)
      `);

      // Hash passwords
      const demoPassword = await bcrypt.hash("demo123", 10);
      const testPassword = await bcrypt.hash("test123", 10);
      const adminPassword = await bcrypt.hash("admin123", 10);
      const johnPassword = await bcrypt.hash("john123", 10);

      // Insert demo users
      insertUser.run("demo@znappystore.com", demoPassword, "Demo User");
      insertUser.run("test@example.com", testPassword, "Test User");
      insertUser.run("admin@znappystore.com", adminPassword, "Admin User");
      insertUser.run("john@example.com", johnPassword, "John Smith");

      console.log("✅ Demo users created successfully");
      console.log("👥 Available demo accounts:");
      console.log("   📧 demo@znappystore.com (password: demo123)");
      console.log("   📧 test@example.com (password: test123)");
      console.log("   📧 admin@znappystore.com (password: admin123)");
      console.log("   📧 john@example.com (password: john123)");
    }
  } catch (error) {
    console.error("❌ Error seeding data:", error);
  }
};

// Initialize database
const initializeDatabase = async () => {
  try {
    createTables();
    await seedData();
    console.log("🚀 SQLite database initialized successfully");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  }
};

// Database helper functions
export const findUserByEmail = (email) => {
  const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
  return stmt.get(email);
};

export const findUserById = (id) => {
  const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
  return stmt.get(id);
};

export const createFile = (fileData) => {
  const stmt = db.prepare(`
    INSERT INTO files (id, filename, original_name, mime_type, size, user_id, file_path)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    fileData.id,
    fileData.filename,
    fileData.originalName,
    fileData.mimeType,
    fileData.size,
    fileData.userId,
    fileData.path,
  );

  // Return the created file with upload_date
  const file = db.prepare("SELECT * FROM files WHERE id = ?").get(fileData.id);
  return {
    id: file.id,
    filename: file.filename,
    originalName: file.original_name,
    mimeType: file.mime_type,
    size: file.size,
    userId: file.user_id,
    path: file.file_path,
    uploadDate: file.upload_date,
  };
};

export const findFilesByUserId = (userId) => {
  const stmt = db.prepare(
    "SELECT * FROM files WHERE user_id = ? ORDER BY upload_date DESC",
  );
  const files = stmt.all(userId);

  // Transform to match expected format
  return files.map((file) => ({
    id: file.id,
    filename: file.filename,
    originalName: file.original_name,
    mimeType: file.mime_type,
    size: file.size,
    userId: file.user_id,
    path: file.file_path,
    uploadDate: file.upload_date,
  }));
};

export const findFileById = (fileId) => {
  const stmt = db.prepare("SELECT * FROM files WHERE id = ?");
  const file = stmt.get(fileId);

  if (!file) return null;

  // Transform to match expected format
  return {
    id: file.id,
    filename: file.filename,
    originalName: file.original_name,
    mimeType: file.mime_type,
    size: file.size,
    userId: file.user_id,
    path: file.file_path,
    uploadDate: file.upload_date,
  };
};

export const deleteFileById = (fileId) => {
  // First get the file to return it
  const file = findFileById(fileId);
  if (!file) return null;

  // Delete the file record
  const stmt = db.prepare("DELETE FROM files WHERE id = ?");
  const result = stmt.run(fileId);

  return result.changes > 0 ? file : null;
};

// Get database statistics
export const getStats = () => {
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();
  const fileCount = db.prepare("SELECT COUNT(*) as count FROM files").get();
  const userFiles = db
    .prepare(
      `
    SELECT user_id, COUNT(*) as file_count
    FROM files
    GROUP BY user_id
  `,
    )
    .all();

  const userFilesMap = {};
  userFiles.forEach((row) => {
    userFilesMap[row.user_id] = row.file_count;
  });

  return {
    users: userCount.count,
    files: fileCount.count,
    userFiles: userFilesMap,
    databasePath: dbPath,
  };
};

// Create a user (for future registration functionality)
export const createUser = async (userData) => {
  const stmt = db.prepare(`
    INSERT INTO users (email, password, name)
    VALUES (?, ?, ?)
  `);

  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const result = stmt.run(userData.email, hashedPassword, userData.name);

  return findUserById(result.lastInsertRowid);
};

// Close database connection
export const closeDatabase = () => {
  db.close();
  console.log("📊 Database connection closed");
};

// Initialize database on import
await initializeDatabase();

// Export database instance for advanced operations if needed
export { db };

// Handle process termination
process.on("SIGINT", () => {
  closeDatabase();
  process.exit(0);
});

process.on("SIGTERM", () => {
  closeDatabase();
  process.exit(0);
});
