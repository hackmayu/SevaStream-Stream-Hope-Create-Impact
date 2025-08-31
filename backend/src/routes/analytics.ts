import express, { Request, Response } from 'express';

const router = express.Router();

// GET /api/analytics/dashboard - Get dashboard analytics
router.get('/dashboard', (req: Request, res: Response) => {
  try {
    const analytics = {
      totalVolume24h: {
        usdc: 298000,
        usd: 298000,
        percentage: 15.3
      },
      activeStreams: {
        count: 3247,
        percentage: 8.7
      },
      avgStreamDuration: {
        seconds: 47,
        percentage: -12
      },
      successRate: {
        rate: 98.2,
        percentage: 0.3
      },
      topCauses: [
        { cause: 'Medical Emergency', amount: 101000, percentage: 34 },
        { cause: 'Clean Water', amount: 68500, percentage: 23 },
        { cause: 'Food Security', amount: 50600, percentage: 17 },
        { cause: 'Education', amount: 44700, percentage: 15 },
        { cause: 'Disaster Relief', amount: 32800, percentage: 11 }
      ],
      geographicDistribution: [
        { region: 'North America', amount: 77000, recipients: 1247 },
        { region: 'Europe', amount: 67000, recipients: 983 },
        { region: 'Asia', amount: 50600, recipients: 756 },
        { region: 'South America', amount: 45700, recipients: 642 },
        { region: 'Africa', amount: 33800, recipients: 489 }
      ],
      networkStats: {
        network: 'Polygon',
        avgGasFee: 0.058,
        confirmationTime: 2.3,
        successRate: 98.7,
        totalTransactions: 127492,
        networkLoad: 65
      }
    };
    
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// GET /api/analytics/live-streams - Get live stream activity
router.get('/live-streams', (req: Request, res: Response) => {
  try {
    const { limit = '20' } = req.query;
    
    // Generate mock live stream data
    const liveStreams = Array.from({ length: parseInt(limit as string) }, (_, i) => ({
      id: `stream_${i}`,
      donor: `0x${Math.random().toString(16).substr(2, 40)}`,
      amount: Math.floor(Math.random() * 50) + 8, // $8-58 USDC
      cause: ['Medical Emergency', 'Clean Water', 'Food Security', 'Education', 'Disaster Relief'][Math.floor(Math.random() * 5)],
      timestamp: new Date(Date.now() - Math.random() * 60 * 1000).toISOString() // Within last minute
    }));
    
    res.json({ streams: liveStreams });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch live streams' });
  }
});

// GET /api/analytics/transactions - Get recent transactions
router.get('/transactions', (req: Request, res: Response) => {
  try {
    const { limit = '10', offset = '0' } = req.query;
    
    // Generate mock transaction data
    const transactions = Array.from({ length: parseInt(limit as string) }, (_, i) => ({
      hash: `0x${Math.random().toString(16).substr(2, 64)}`,
      from: `0x${Math.random().toString(16).substr(2, 40)}`,
      to: `0x${Math.random().toString(16).substr(2, 40)}`,
      amount: Math.floor(Math.random() * 50) + 8,
      cause: ['Medical', 'Water', 'Food', 'Education', 'Relief'][Math.floor(Math.random() * 5)],
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString() // Within last 24 hours
    }));
    
    res.json({
      transactions,
      total: 127492,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// GET /api/analytics/insights - Get AI insights
router.get('/insights', (req: Request, res: Response) => {
  try {
    const insights = [
      {
        type: 'pattern',
        title: 'Pattern Detected',
        description: 'Medical emergencies peak between 6-8 PM. Consider targeted campaigns.',
        confidence: 0.87,
        impact: 'high'
      },
      {
        type: 'opportunity',
        title: 'Opportunity',
        description: 'Micro-donations ($8-16 USDC) show 34% higher completion rates.',
        confidence: 0.92,
        impact: 'medium'
      },
      {
        type: 'alert',
        title: 'Alert',
        description: 'Food security funding 23% below historical average this week.',
        confidence: 0.78,
        impact: 'high'
      },
      {
        type: 'recommendation',
        title: 'Recommendation',
        description: 'Weekend campaigns generate 45% more engagement.',
        confidence: 0.83,
        impact: 'medium'
      }
    ];
    
    res.json({ insights });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch AI insights' });
  }
});

export default router;
