import express, { Request, Response } from 'express';

const router = express.Router();

// Mock news data for climate and aid problems
const mockNewsData = [
  {
    id: '1',
    title: 'Severe Flooding Hits Kerala - Immediate Aid Required',
    summary: 'Heavy monsoon rains have displaced over 50,000 families in Kerala. Emergency shelters and medical supplies urgently needed.',
    category: 'disaster',
    location: 'Kerala, India',
    timestamp: '2025-08-30T10:30:00Z',
    severity: 'critical',
    image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=250&fit=crop',
    source: 'Climate Relief Network',
    impact: {
      affected: 50000,
      funding_needed: 2500000,
      donations_received: 340000
    },
    tags: ['flooding', 'monsoon', 'emergency', 'shelter'],
    verified: true,
    urgent: true
  },
  {
    id: '2',
    title: 'Rising Sea Levels Threaten Coastal Communities in Bangladesh',
    summary: 'Climate change-induced sea level rise forcing families to relocate. Long-term support needed for community relocation.',
    category: 'climate',
    location: 'Bangladesh',
    timestamp: '2025-08-29T15:45:00Z',
    severity: 'high',
    image: 'https://images.unsplash.com/photo-1569163139394-de4e4f43e4e5?w=400&h=250&fit=crop',
    source: 'Global Climate Watch',
    impact: {
      affected: 125000,
      funding_needed: 5000000,
      donations_received: 890000
    },
    tags: ['climate change', 'sea level', 'relocation', 'coastal'],
    verified: true,
    urgent: false
  },
  {
    id: '3',
    title: 'Drought Crisis Affects 2 Million in Horn of Africa',
    summary: 'Prolonged drought has led to crop failure and livestock deaths. Water and food security initiatives urgently needed.',
    category: 'humanitarian',
    location: 'Horn of Africa',
    timestamp: '2025-08-28T08:20:00Z',
    severity: 'critical',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop',
    source: 'International Aid Alliance',
    impact: {
      affected: 2000000,
      funding_needed: 15000000,
      donations_received: 2300000
    },
    tags: ['drought', 'food security', 'water crisis', 'agriculture'],
    verified: true,
    urgent: true
  },
  {
    id: '4',
    title: 'Cyclone Preparedness: Pacific Islands Brace for Impact',
    summary: 'Category 4 cyclone approaching Pacific Island nations. Evacuation and relief preparations underway.',
    category: 'emergency',
    location: 'Pacific Islands',
    timestamp: '2025-08-27T20:15:00Z',
    severity: 'high',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop',
    source: 'Pacific Disaster Response',
    impact: {
      affected: 85000,
      funding_needed: 1200000,
      donations_received: 450000
    },
    tags: ['cyclone', 'evacuation', 'preparedness', 'islands'],
    verified: true,
    urgent: false
  },
  {
    id: '5',
    title: 'Heatwave Emergency: Delhi Temperature Hits Record 48°C',
    summary: 'Extreme heatwave grips Delhi with temperatures reaching 48°C. Cooling centers and medical aid urgently needed.',
    category: 'climate',
    location: 'Delhi, India',
    timestamp: '2025-08-27T14:30:00Z',
    severity: 'high',
    image: 'https://images.unsplash.com/photo-1523473827533-2a64d0d36748?w=400&h=250&fit=crop',
    source: 'Climate Health Network',
    impact: {
      affected: 180000,
      funding_needed: 800000,
      donations_received: 120000
    },
    tags: ['heatwave', 'temperature', 'health', 'cooling'],
    verified: true,
    urgent: false
  },
  {
    id: '6',
    title: 'Wildfire Response: Australia Mobilizes Emergency Aid',
    summary: 'Bushfires threaten rural communities in Australia. Firefighting support and evacuation assistance required.',
    category: 'disaster',
    location: 'New South Wales, Australia',
    timestamp: '2025-08-26T11:45:00Z',
    severity: 'medium',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop',
    source: 'Australian Emergency Response',
    impact: {
      affected: 25000,
      funding_needed: 3500000,
      donations_received: 1200000
    },
    tags: ['wildfire', 'bushfire', 'evacuation', 'rural'],
    verified: true,
    urgent: false
  },
  {
    id: '7',
    title: 'Earthquake Strikes Turkey-Syria Border Region',
    summary: 'Magnitude 6.8 earthquake causes widespread damage. Search and rescue operations ongoing, medical aid needed.',
    category: 'disaster',
    location: 'Turkey-Syria Border',
    timestamp: '2025-08-25T03:17:00Z',
    severity: 'critical',
    image: 'https://images.unsplash.com/photo-1524838647597-a7fa38e7de29?w=400&h=250&fit=crop',
    source: 'International Earthquake Response',
    impact: {
      affected: 350000,
      funding_needed: 8500000,
      donations_received: 1200000
    },
    tags: ['earthquake', 'rescue', 'medical', 'shelter'],
    verified: true,
    urgent: true
  },
  {
    id: '8',
    title: 'Arctic Ice Melt Accelerates: Indigenous Communities at Risk',
    summary: 'Rapid Arctic ice melt threatens traditional hunting grounds and food security for Inuit communities.',
    category: 'climate',
    location: 'Arctic Region',
    timestamp: '2025-08-24T12:00:00Z',
    severity: 'medium',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop',
    source: 'Arctic Climate Institute',
    impact: {
      affected: 75000,
      funding_needed: 2200000,
      donations_received: 180000
    },
    tags: ['arctic', 'ice melt', 'indigenous', 'food security'],
    verified: true,
    urgent: false
  }
];

// GET /api/news - Get all climate and aid news
router.get('/', (req: Request, res: Response) => {
  try {
    const { 
      category, 
      severity, 
      urgent, 
      limit = '20', 
      offset = '0',
      location,
      verified = 'true'
    } = req.query;
    
    let filteredNews = [...mockNewsData];
    
    // Filter by category
    if (category && category !== 'all') {
      filteredNews = filteredNews.filter(news => news.category === category);
    }
    
    // Filter by severity
    if (severity) {
      filteredNews = filteredNews.filter(news => news.severity === severity);
    }
    
    // Filter by urgent status
    if (urgent === 'true') {
      filteredNews = filteredNews.filter(news => news.urgent);
    }
    
    // Filter by location
    if (location) {
      filteredNews = filteredNews.filter(news => 
        news.location.toLowerCase().includes((location as string).toLowerCase())
      );
    }
    
    // Filter by verified status
    if (verified === 'true') {
      filteredNews = filteredNews.filter(news => news.verified);
    }
    
    // Sort by timestamp (newest first)
    filteredNews.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Apply pagination
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);
    const paginatedNews = filteredNews.slice(offsetNum, offsetNum + limitNum);
    
    res.json({
      success: true,
      data: paginatedNews,
      total: filteredNews.length,
      limit: limitNum,
      offset: offsetNum,
      hasMore: offsetNum + limitNum < filteredNews.length
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch news data' 
    });
  }
});

// GET /api/news/statistics - Get news statistics
router.get('/statistics', (req: Request, res: Response) => {
  try {
    const totalAffected = mockNewsData.reduce((sum, news) => sum + news.impact.affected, 0);
    const totalFundingNeeded = mockNewsData.reduce((sum, news) => sum + news.impact.funding_needed, 0);
    const totalDonationsReceived = mockNewsData.reduce((sum, news) => sum + news.impact.donations_received, 0);
    
    const criticalAlerts = mockNewsData.filter(news => news.severity === 'critical').length;
    const urgentCases = mockNewsData.filter(news => news.urgent).length;
    
    const categoryCounts = mockNewsData.reduce((acc: any, news) => {
      acc[news.category] = (acc[news.category] || 0) + 1;
      return acc;
    }, {});
    
    const fundingProgress = totalFundingNeeded > 0 
      ? (totalDonationsReceived / totalFundingNeeded) * 100 
      : 0;
    
    res.json({
      success: true,
      statistics: {
        totalAffected,
        totalFundingNeeded,
        totalDonationsReceived,
        fundingProgress: Math.round(fundingProgress * 100) / 100,
        criticalAlerts,
        urgentCases,
        totalArticles: mockNewsData.length,
        categoryCounts,
        lastUpdated: new Date().toISOString()
      }
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch statistics' 
    });
  }
});

// GET /api/news/:id - Get specific news article
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const article = mockNewsData.find(news => news.id === id);
    
    if (!article) {
      return res.status(404).json({ 
        success: false, 
        error: 'News article not found' 
      });
    }
    
    res.json({
      success: true,
      data: article
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch news article' 
    });
  }
});

// GET /api/news/urgent/alerts - Get urgent alerts only
router.get('/urgent/alerts', (req: Request, res: Response) => {
  try {
    const urgentNews = mockNewsData.filter(news => news.urgent && news.verified);
    
    // Sort by severity (critical first) and then by timestamp
    urgentNews.sort((a, b) => {
      const severityOrder = { critical: 3, high: 2, medium: 1, low: 0 };
      const severityDiff = (severityOrder[b.severity as keyof typeof severityOrder] || 0) - 
                          (severityOrder[a.severity as keyof typeof severityOrder] || 0);
      
      if (severityDiff !== 0) return severityDiff;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    
    res.json({
      success: true,
      data: urgentNews,
      count: urgentNews.length
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch urgent alerts' 
    });
  }
});

export default router;
