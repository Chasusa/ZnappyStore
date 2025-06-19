#!/usr/bin/env node
import { fileURLToPath } from 'url';
import path from 'path';
import { createUser, findUserByEmail, db } from '../utils/database.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.cyan}${colors.bright}🚀 ${msg}${colors.reset}`),
  user: (email, name, id) => console.log(`   📧 ${colors.bright}${email}${colors.reset} - ${name} (ID: ${id})`)
};

// List all users
const listUsers = () => {
  try {
    const users = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();

    log.header('ZnappyStore Users');
    console.log('');

    if (users.length === 0) {
      log.warning('No users found in database');
      return;
    }

    users.forEach(user => {
      log.user(user.email, user.name, user.id);
    });

    console.log('');
    log.info(`Total users: ${users.length}`);

  } catch (error) {
    log.error(`Failed to list users: ${error.message}`);
  }
};

// Create a new user
const createNewUser = async (email, password, name) => {
  try {
    // Check if user already exists
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      log.error(`User with email ${email} already exists!`);
      return;
    }

    // Create the user
    const userData = { email, password, name };
    const newUser = await createUser(userData);

    log.success(`User created successfully!`);
    log.user(newUser.email, newUser.name, newUser.id);

  } catch (error) {
    log.error(`Failed to create user: ${error.message}`);
  }
};

// Delete a user
const deleteUser = (email) => {
  try {
    const user = findUserByEmail(email);
    if (!user) {
      log.error(`User with email ${email} not found!`);
      return;
    }

    // Delete user files first (CASCADE should handle this, but let's be explicit)
    const deleteFiles = db.prepare('DELETE FROM files WHERE user_id = ?');
    const filesResult = deleteFiles.run(user.id);

    // Delete user
    const deleteUserStmt = db.prepare('DELETE FROM users WHERE email = ?');
    const userResult = deleteUserStmt.run(email);

    if (userResult.changes > 0) {
      log.success(`User ${email} deleted successfully!`);
      log.info(`Also deleted ${filesResult.changes} associated files`);
    } else {
      log.error(`Failed to delete user ${email}`);
    }

  } catch (error) {
    log.error(`Failed to delete user: ${error.message}`);
  }
};

// Reset user password
const resetPassword = async (email, newPassword) => {
  try {
    const user = findUserByEmail(email);
    if (!user) {
      log.error(`User with email ${email} not found!`);
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updateStmt = db.prepare('UPDATE users SET password = ? WHERE email = ?');
    const result = updateStmt.run(hashedPassword, email);

    if (result.changes > 0) {
      log.success(`Password reset successfully for ${email}`);
      log.info(`New password: ${newPassword}`);
    } else {
      log.error(`Failed to reset password for ${email}`);
    }

  } catch (error) {
    log.error(`Failed to reset password: ${error.message}`);
  }
};

// Create demo users
const createDemoUsers = async () => {
  const demoUsers = [
    { email: 'demo@znappystore.com', password: 'demo123', name: 'Demo User' },
    { email: 'test@example.com', password: 'test123', name: 'Test User' },
    { email: 'admin@znappystore.com', password: 'admin123', name: 'Admin User' },
    { email: 'john@example.com', password: 'john123', name: 'John Smith' },
    { email: 'jane@example.com', password: 'jane123', name: 'Jane Doe' },
    { email: 'dev@znappystore.com', password: 'dev123', name: 'Developer' }
  ];

  log.header('Creating Demo Users');
  console.log('');

  for (const userData of demoUsers) {
    await createNewUser(userData.email, userData.password, userData.name);
  }

  console.log('');
  log.header('Demo Account Credentials:');
  demoUsers.forEach(user => {
    console.log(`   📧 ${user.email} → 🔑 ${user.password}`);
  });
};

// Show help
const showHelp = () => {
  console.log(`
${colors.cyan}${colors.bright}ZnappyStore User Management Tool${colors.reset}

${colors.bright}Usage:${colors.reset}
  node manage-users.js [command] [options]

${colors.bright}Commands:${colors.reset}
  ${colors.green}list${colors.reset}                          List all users
  ${colors.green}create <email> <password> <name>${colors.reset}  Create a new user
  ${colors.green}delete <email>${colors.reset}                 Delete a user
  ${colors.green}reset <email> <newpassword>${colors.reset}    Reset user password
  ${colors.green}demo${colors.reset}                           Create demo users
  ${colors.green}help${colors.reset}                           Show this help

${colors.bright}Examples:${colors.reset}
  node manage-users.js list
  node manage-users.js create "alice@example.com" "alice123" "Alice Johnson"
  node manage-users.js delete "alice@example.com"
  node manage-users.js reset "demo@znappystore.com" "newpassword123"
  node manage-users.js demo

${colors.bright}Current Demo Users:${colors.reset}
  📧 demo@znappystore.com (password: demo123)
  📧 test@example.com (password: test123)
  📧 admin@znappystore.com (password: admin123)
  📧 john@example.com (password: john123)
`);
};

// Main function
const main = async () => {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'list':
      listUsers();
      break;

    case 'create':
      if (args.length !== 4) {
        log.error('Usage: create <email> <password> <name>');
        process.exit(1);
      }
      await createNewUser(args[1], args[2], args[3]);
      break;

    case 'delete':
      if (args.length !== 2) {
        log.error('Usage: delete <email>');
        process.exit(1);
      }
      deleteUser(args[1]);
      break;

    case 'reset':
      if (args.length !== 3) {
        log.error('Usage: reset <email> <newpassword>');
        process.exit(1);
      }
      await resetPassword(args[1], args[2]);
      break;

    case 'demo':
      await createDemoUsers();
      break;

    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;

    default:
      if (!command) {
        showHelp();
      } else {
        log.error(`Unknown command: ${command}`);
        showHelp();
        process.exit(1);
      }
  }

  // Close database connection
  db.close();
};

// Handle errors
process.on('unhandledRejection', (error) => {
  log.error(`Unhandled error: ${error.message}`);
  db.close();
  process.exit(1);
});

// Run the main function
main().catch((error) => {
  log.error(`Script error: ${error.message}`);
  db.close();
  process.exit(1);
});
