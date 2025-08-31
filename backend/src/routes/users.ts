import express, { Request, Response } from 'express';

const router = express.Router();

// Mock user data
const mockUsers = [
  {
    id: '1',
    address: '0x1234567890abcdef',
    type: 'donor',
    profile: {
      name: 'John Doe',
      email: 'john@example.com',
      verified: true,
      totalDonated: 2400,
      donationCount: 15
    }
  },
  {
    id: '2',
    address: '0xfedcba0987654321',
    type: 'receiver',
    profile: {
      name: 'NGO Mumbai',
      email: 'contact@ngomumbai.org',
      verified: true,
      totalReceived: 57000,
      requestCount: 3
    }
  }
];

// GET /api/users/profile/:address - Get user profile
router.get('/profile/:address', (req: Request, res: Response) => {
  try {
    const user = mockUsers.find(u => u.address.toLowerCase() === req.params.address.toLowerCase());
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// POST /api/users/register - Register new user
router.post('/register', (req: Request, res: Response) => {
  try {
    const { address, type, name, email } = req.body;
    
    if (!address || !type || !name) {
      return res.status(400).json({
        error: 'Missing required fields: address, type, name'
      });
    }
    
    // Check if user already exists
    const existingUser = mockUsers.find(u => u.address.toLowerCase() === address.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ error: 'User already registered' });
    }
    
    const newUser: any = {
      id: (mockUsers.length + 1).toString(),
      address,
      type,
      profile: {
        name,
        email: email || '',
        verified: false,
        ...(type === 'donor' ? { totalDonated: 0, donationCount: 0 } : { totalReceived: 0, requestCount: 0 })
      }
    };
    
    mockUsers.push(newUser);
    
    res.status(201).json({
      message: 'User registered successfully',
      user: newUser
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// PUT /api/users/profile/:address - Update user profile
router.put('/profile/:address', (req: Request, res: Response) => {
  try {
    const user = mockUsers.find(u => u.address.toLowerCase() === req.params.address.toLowerCase());
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { name, email } = req.body;
    
    if (name) user.profile.name = name;
    if (email) user.profile.email = email;
    
    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
