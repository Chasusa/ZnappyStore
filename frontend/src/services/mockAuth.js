// Mock authentication service for development
// Replace this with actual API calls when backend is ready

const MOCK_USERS = [
  {
    id: 1,
    email: 'demo@znappystore.com',
    password: 'demo123',
    name: 'Demo User'
  },
  {
    id: 2,
    email: 'test@example.com',
    password: 'test123',
    name: 'Test User'
  }
];

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAuthService = {
  async login(email, password) {
    // Simulate API delay
    await delay(1000);
    
    // Simulate different error scenarios for testing
    if (email === 'network@error.com') {
      throw new Error('Network error occurred while connecting to server');
    }
    
    if (email === 'server@error.com') {
      throw new Error('Server is temporarily unavailable. Please try again later.');
    }
    
    // Find user
    const user = MOCK_USERS.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    // Generate mock token
    const token = `mock_token_${user.id}_${Date.now()}`;
    
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    };
  },
  
  async validateToken(token) {
    // Simulate API delay
    await delay(500);
    
    // For mock purposes, just check if token exists and has correct format
    if (!token || !token.startsWith('mock_token_')) {
      throw new Error('Invalid token');
    }
    
    // Extract user ID from token (mock implementation)
    const parts = token.split('_');
    const userId = parseInt(parts[2]);
    
    const user = MOCK_USERS.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    };
  }
}; 