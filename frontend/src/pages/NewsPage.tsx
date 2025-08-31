import React, { useState, useEffect } from 'react'
import { Clock, MapPin, TrendingUp, AlertTriangle, Heart, Thermometer } from 'lucide-react'

interface NewsArticle {
  id: string
  title: string
  summary: string
  category: 'climate' | 'disaster' | 'humanitarian' | 'emergency'
  location: string
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  image: string
  source: string
  impact: {
    affected: number
    funding_needed: number
    donations_received: number
  }
  tags: string[]
}

const NewsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [news, setNews] = useState<NewsArticle[]>([])

  useEffect(() => {
    // Mock news data - in production, this would come from an API
    const mockNews: NewsArticle[] = [
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
        tags: ['flooding', 'monsoon', 'emergency', 'shelter']
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
        tags: ['climate change', 'sea level', 'relocation', 'coastal']
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
        tags: ['drought', 'food security', 'water crisis', 'agriculture']
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
        tags: ['cyclone', 'evacuation', 'preparedness', 'islands']
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
        tags: ['heatwave', 'temperature', 'health', 'cooling']
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
        tags: ['wildfire', 'bushfire', 'evacuation', 'rural']
      }
    ]
    setNews(mockNews)
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'climate': return <Thermometer className="w-4 h-4" />
      case 'disaster': return <AlertTriangle className="w-4 h-4" />
      case 'humanitarian': return <Heart className="w-4 h-4" />
      case 'emergency': return <TrendingUp className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const filteredNews = selectedCategory === 'all' 
    ? news 
    : news.filter(article => article.category === selectedCategory)

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
    return num.toString()
  }

  const getProgressPercentage = (received: number, needed: number) => {
    return Math.min((received / needed) * 100, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header with Animation */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg animate-bounce">
            <span className="text-3xl">🌍</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Climate & Aid News
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Stay informed about <span className="font-bold text-blue-600">critical emergencies</span> and 
            <span className="font-bold text-purple-600"> climate crises</span> happening worldwide
          </p>
          
          {/* Enhanced Category Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {[
              { key: 'all', label: 'All News', icon: '📰', color: 'from-gray-500 to-gray-600' },
              { key: 'climate', label: 'Climate', icon: '🌡️', color: 'from-orange-500 to-red-500' },
              { key: 'disaster', label: 'Disasters', icon: '⚠️', color: 'from-red-500 to-pink-500' },
              { key: 'humanitarian', label: 'Humanitarian', icon: '❤️', color: 'from-pink-500 to-rose-500' },
              { key: 'emergency', label: 'Emergency', icon: '🚨', color: 'from-purple-500 to-indigo-500' }
            ].map(({ key, label, icon, color }) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`group px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center space-x-3 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                  selectedCategory === key
                    ? `bg-gradient-to-r ${color} text-white shadow-2xl scale-105`
                    : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-lg group-hover:animate-bounce">{icon}</span>
                <span>{label}</span>
                {selectedCategory === key && (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Statistics Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-xl">👥</span>
              </div>
              <div className="text-3xl font-black text-red-600 mb-2">
                {formatNumber(news.reduce((sum, article) => sum + article.impact.affected, 0))}
              </div>
              <div className="text-sm font-semibold text-gray-600">People Affected</div>
            </div>
          </div>
          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-xl">💰</span>
              </div>
              <div className="text-3xl font-black text-orange-600 mb-2">
                ₹{formatNumber(news.reduce((sum, article) => sum + article.impact.funding_needed, 0))}
              </div>
              <div className="text-sm font-semibold text-gray-600">Funding Needed</div>
            </div>
          </div>
          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-xl">💚</span>
              </div>
              <div className="text-3xl font-black text-green-600 mb-2">
                ₹{formatNumber(news.reduce((sum, article) => sum + article.impact.donations_received, 0))}
              </div>
              <div className="text-sm font-semibold text-gray-600">Donations Raised</div>
            </div>
          </div>
          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-xl">🚨</span>
              </div>
              <div className="text-3xl font-black text-blue-600 mb-2">{news.length}</div>
              <div className="text-sm font-semibold text-gray-600">Active Alerts</div>
            </div>
          </div>
        </div>

        {/* Enhanced News Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredNews.map((article, index) => (
            <div key={article.id} className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] animate-fade-in"
                 style={{animationDelay: `${index * 0.1}s`}}>
              {/* Enhanced Image */}
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute top-4 left-4">
                  <span className={`px-4 py-2 rounded-full text-xs font-bold border-2 backdrop-blur-sm ${getSeverityColor(article.severity)} shadow-lg`}>
                    {article.severity.toUpperCase()}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-2 rounded-full text-xs font-bold flex items-center space-x-2 shadow-lg">
                    {getCategoryIcon(article.category)}
                    <span className="capitalize">{article.category}</span>
                  </span>
                </div>
                {/* Floating action button on image */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform duration-200">
                    <span className="text-sm">💝</span>
                  </button>
                </div>
              </div>

              {/* Enhanced Content */}
              <div className="p-8">
                <h3 className="text-2xl font-black text-gray-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors duration-300">
                  {article.title}
                </h3>
                <p className="text-gray-600 text-base mb-6 leading-relaxed">
                  {article.summary}
                </p>

                {/* Enhanced Meta Information */}
                <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">{article.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">{new Date(article.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Enhanced Impact Stats */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 mb-6 border border-gray-100">
                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div className="group">
                      <div className="text-2xl font-black text-red-600 group-hover:scale-110 transition-transform duration-200">
                        {formatNumber(article.impact.affected)}
                      </div>
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Affected</div>
                    </div>
                    <div className="group">
                      <div className="text-2xl font-black text-orange-600 group-hover:scale-110 transition-transform duration-200">
                        ₹{formatNumber(article.impact.funding_needed)}
                      </div>
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Needed</div>
                    </div>
                    <div className="group">
                      <div className="text-2xl font-black text-green-600 group-hover:scale-110 transition-transform duration-200">
                        ₹{formatNumber(article.impact.donations_received)}
                      </div>
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Raised</div>
                    </div>
                  </div>

                  {/* Enhanced Progress Bar */}
                  <div className="mt-6">
                    <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
                      <span>Funding Progress</span>
                      <span className="text-blue-600">{getProgressPercentage(article.impact.donations_received, article.impact.funding_needed).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-1000 shadow-sm"
                        style={{ width: `${getProgressPercentage(article.impact.donations_received, article.impact.funding_needed)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {article.tags.map((tag, index) => (
                    <span key={index} className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-xs px-3 py-2 rounded-full font-semibold border border-blue-200 hover:scale-105 transition-transform duration-200">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Enhanced Actions */}
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500 font-medium">
                    📰 Source: <span className="text-gray-700 font-semibold">{article.source}</span>
                  </div>
                  <button className="group bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl text-sm font-bold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                    <span className="flex items-center space-x-2">
                      <span>💝</span>
                      <span>Donate Now</span>
                      <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Emergency Alert Banner */}
        <div className="mt-12 relative overflow-hidden bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 border-l-4 border-red-600 p-8 rounded-2xl shadow-2xl">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative flex items-center">
            <div className="flex-shrink-0 w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mr-6">
              <AlertTriangle className="w-8 h-8 text-white animate-pulse" />
            </div>
            <div className="flex-1">
              <h4 className="text-2xl font-black text-white mb-2">🚨 Critical Emergency Alerts</h4>
              <p className="text-white/90 text-lg leading-relaxed">
                <span className="font-bold">{news.filter(n => n.severity === 'critical').length} critical emergencies</span> require immediate attention. 
                Your donation can make a <span className="font-bold underline">life-saving difference</span> right now.
              </p>
            </div>
            <button className="flex-shrink-0 bg-white text-red-600 px-8 py-4 rounded-xl text-lg font-black hover:bg-red-50 transition-all duration-300 transform hover:scale-105 shadow-xl">
              <span className="flex items-center space-x-2">
                <span>🚨</span>
                <span>View Critical Cases</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewsPage
