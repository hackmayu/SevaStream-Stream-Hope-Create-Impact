import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Mock donation data
const mockDonations = [
  {
    id: '1',
    donorAddress: '0x1234567890abcdef',
    recipientAddress: '0xfedcba0987654321',
    amount: '0.016', // in ETH/MATIC
    amountUSD: 16,
    amountINR: 240,
    cause: 'Medical Emergency',
    location: 'Mumbai, Maharashtra',
    status: 'completed',
    txHash: '0x1234567890abcdef1234567890abcdef12345678',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    streamRate: 8, // INR per 10 seconds
    streamDuration: 30 // seconds
  },
  {
    id: '2',
    donorAddress: '0x9876543210fedcba',
    recipientAddress: '0x1122334455667788',
    amount: '0.048',
    amountUSD: 48,
    amountINR: 480,
    cause: 'Clean Water',
    location: 'Chennai, Tamil Nadu',
    status: 'streaming',
    txHash: '0x9876543210fedcba9876543210fedcba98765432',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    streamRate: 16,
    streamDuration: 60
  }
];

// GET /api/donations - Get all donations with filters
router.get('/', (req: Request, res: Response) => {
  try {
    const { status, cause, limit = '10', offset = '0' } = req.query;
    
    let filteredDonations = [...mockDonations];
    
    if (status) {
      filteredDonations = filteredDonations.filter(d => d.status === status);
    }
    
    if (cause) {
      filteredDonations = filteredDonations.filter(d => 
        d.cause.toLowerCase().includes((cause as string).toLowerCase())
      );
    }
    
    const startIndex = parseInt(offset as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedDonations = filteredDonations.slice(startIndex, endIndex);
    
    res.json({
      donations: paginatedDonations,
      total: filteredDonations.length,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch donations' });
  }
});

// GET /api/donations/:id - Get specific donation
router.get('/:id', (req: Request, res: Response) => {
  try {
    const donation = mockDonations.find(d => d.id === req.params.id);
    
    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }
    
    res.json(donation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch donation' });
  }
});

// POST /api/donations/stream - Start a donation stream
router.post('/stream', (req: Request, res: Response) => {
  try {
    const {
      donorAddress,
      recipientAddress,
      amountINR,
      cause,
      location,
      streamRate,
      streamDuration
    } = req.body;
    
    // Validate required fields
    if (!donorAddress || !recipientAddress || !amountINR || !cause) {
      return res.status(400).json({
        error: 'Missing required fields: donorAddress, recipientAddress, amountINR, cause'
      });
    }
    
    // Create new donation stream
    const newDonation = {
      id: uuidv4(),
      donorAddress,
      recipientAddress,
      amount: (amountINR / 15000).toFixed(6), // Mock conversion rate
      amountUSD: amountINR / 83, // Mock INR to USD rate
      amountINR,
      cause,
      location: location || 'Unknown',
      status: 'streaming',
      txHash: '0x' + Math.random().toString(16).substr(2, 64), // Mock tx hash
      timestamp: new Date(),
      streamRate: streamRate || 8,
      streamDuration: streamDuration || 30
    };
    
    mockDonations.unshift(newDonation);
    
    // Simulate stream completion after duration
    setTimeout(() => {
      const donation = mockDonations.find(d => d.id === newDonation.id);
      if (donation) {
        donation.status = 'completed';
      }
    }, (streamDuration || 30) * 1000);
    
    res.status(201).json({
      message: 'Donation stream started successfully',
      donation: newDonation
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start donation stream' });
  }
});

// POST /api/donations/:id/stop - Stop a donation stream
router.post('/:id/stop', (req: Request, res: Response) => {
  try {
    const donation = mockDonations.find(d => d.id === req.params.id);
    
    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }
    
    if (donation.status !== 'streaming') {
      return res.status(400).json({ error: 'Donation is not currently streaming' });
    }
    
    donation.status = 'stopped';
    
    res.json({
      message: 'Donation stream stopped successfully',
      donation
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to stop donation stream' });
  }
});

// GET /api/donations/stats/summary - Get donation statistics
router.get('/stats/summary', (req: Request, res: Response) => {
  try {
    const totalDonations = mockDonations.length;
    const totalAmountINR = mockDonations.reduce((sum, d) => sum + d.amountINR, 0);
    const activeDonations = mockDonations.filter(d => d.status === 'streaming').length;
    const completedDonations = mockDonations.filter(d => d.status === 'completed').length;
    
    const topCauses = mockDonations.reduce((acc: any, donation) => {
      acc[donation.cause] = (acc[donation.cause] || 0) + donation.amountINR;
      return acc;
    }, {});
    
    const topCausesArray = Object.entries(topCauses)
      .map(([cause, amount]) => ({ cause, amount }))
      .sort((a: any, b: any) => b.amount - a.amount)
      .slice(0, 5);
    
    res.json({
      totalDonations,
      totalAmountINR,
      totalAmountUSD: totalAmountINR / 83,
      activeDonations,
      completedDonations,
      averageDonation: totalAmountINR / totalDonations,
      topCauses: topCausesArray
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch donation statistics' });
  }
});

export default router;
