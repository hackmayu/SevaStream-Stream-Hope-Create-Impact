import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Mock user database (replace with real database in production)
const users: any[] = [];

// Initialize with demo users
const initializeDemoUsers = async () => {
  if (users.length === 0) {
    const demoUsers = [
      {
        id: 'demo_donor_1',
        fullName: 'John Donor',
        email: 'donor@demo.com',
        password: await bcrypt.hash('demo123', 12),
        userType: 'donor',
        phone: '+1-555-0101',
        location: 'New York, USA',
        organization: 'Demo Foundation',
        interests: ['Climate Change', 'Education'],
        createdAt: new Date().toISOString(),
        isVerified: true
      },
      {
        id: 'demo_user_1',
        fullName: 'Jane Recipient',
        email: 'user@demo.com',
        password: await bcrypt.hash('demo123', 12),
        userType: 'user',
        phone: '+1-555-0102',
        location: 'Los Angeles, USA',
        organization: null,
        interests: ['Disaster Relief', 'Healthcare'],
        createdAt: new Date().toISOString(),
        isVerified: true
      }
    ];
    
    users.push(...demoUsers);
    console.log('✅ Demo users initialized:');
    console.log('   🎯 Donor: donor@demo.com / demo123');
    console.log('   🤝 User: user@demo.com / demo123');
  }
};

// Initialize demo users on startup
initializeDemoUsers();

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      userType,
      phone,
      location,
      organization,
      interests
    } = req.body;

    // Validate required fields
    if (!fullName || !email || !password || !userType || !phone || !location) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    console.log(`📝 Registration attempt for: ${email} (${userType})`);

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      console.log(`❌ User already exists: ${email}`);
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      fullName,
      email,
      password: hashedPassword,
      userType,
      phone,
      location,
      organization: organization || null,
      interests: interests || [],
      createdAt: new Date().toISOString(),
      isVerified: false
    };

    users.push(newUser);
    console.log(`✅ User registered successfully: ${email}`);
    console.log(`📊 Total users: ${users.length}`);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email,
        userType: newUser.userType
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userResponse } = newUser;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    console.log(`🔐 Login attempt for: ${email}`);
    console.log(`📊 Total users in database: ${users.length}`);

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password',
        debug: process.env.NODE_ENV === 'development' ? 'User not found' : undefined
      });
    }

    console.log(`✅ User found: ${user.fullName}`);

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log(`❌ Invalid password for: ${email}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password',
        debug: process.env.NODE_ENV === 'development' ? 'Invalid password' : undefined
      });
    }

    console.log(`🎉 Login successful for: ${email}`);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        userType: user.userType
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get current user profile
router.get('/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No authorization token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { password: _, ...userResponse } = user;
    
    res.json({
      success: true,
      user: userResponse
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Logout endpoint (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Debug endpoint to check users (development only)
router.get('/debug/users', (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ message: 'Not found' });
  }
  
  const safeUsers = users.map(user => ({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    userType: user.userType,
    isVerified: user.isVerified
  }));
  
  res.json({
    success: true,
    totalUsers: users.length,
    users: safeUsers
  });
});

export default router;
