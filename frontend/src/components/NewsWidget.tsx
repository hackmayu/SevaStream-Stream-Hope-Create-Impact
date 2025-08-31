import React, { useState, useEffect } from 'react'
import { AlertTriangle, Clock, MapPin, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'

interface NewsAlert {
  id: string
  title: string
  summary: string
  category: 'climate' | 'disaster' | 'humanitarian' | 'emergency'
  location: string
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  urgent: boolean
}

const NewsWidget: React.FC = () => {
  const [urgentNews, setUrgentNews] = useState<NewsAlert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch urgent news from backend API
    const fetchUrgentNews = async () => {
      try {
        const response = await fetch('http://localhost:3008/api/news/urgent/alerts')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setUrgentNews(data.data.slice(0, 3)) // Show only top 3 urgent news
          }
        } else {
          // Fallback to mock data if API fails
          const mockUrgentNews: NewsAlert[] = [
            {
              id: '1',
              title: 'Severe Flooding Hits Kerala',
              summary: 'Heavy monsoon rains displace 50,000 families. Emergency aid needed.',
              category: 'disaster',
              location: 'Kerala, India',
              timestamp: '2025-08-30T10:30:00Z',
              severity: 'critical',
              urgent: true
            },
            {
              id: '3',
              title: 'Drought Crisis in Horn of Africa',
              summary: 'Prolonged drought affects 2 million people. Water and food urgently needed.',
              category: 'humanitarian',
              location: 'Horn of Africa',
              timestamp: '2025-08-28T08:20:00Z',
              severity: 'critical',
              urgent: true
            }
          ]
          setUrgentNews(mockUrgentNews)
        }
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch urgent news:', error)
        // Fallback to mock data
        const mockUrgentNews: NewsAlert[] = [
          {
            id: '1',
            title: 'Severe Flooding Hits Kerala',
            summary: 'Heavy monsoon rains displace 50,000 families. Emergency aid needed.',
            category: 'disaster',
            location: 'Kerala, India',
            timestamp: '2025-08-30T10:30:00Z',
            severity: 'critical',
            urgent: true
          }
        ]
        setUrgentNews(mockUrgentNews)
        setLoading(false)
      }
    }

    fetchUrgentNews()
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'climate': return '🌡️'
      case 'disaster': return '⚠️'
      case 'humanitarian': return '❤️'
      case 'emergency': return '🚨'
      default: return '📰'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    return `${Math.floor(diffHours / 24)}d ago`
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-black">Breaking News</h3>
              <p className="text-white/80 text-sm font-medium">Climate & Aid Emergencies</p>
            </div>
          </div>
          <Link 
            to="/news" 
            className="group bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center space-x-2"
          >
            <span>View All</span>
            <TrendingUp className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>

      {/* Enhanced News Items */}
      <div className="divide-y divide-gray-100">
        {urgentNews.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-gray-300" />
            </div>
            <p className="font-medium">No urgent news alerts at the moment</p>
            <p className="text-sm text-gray-400 mt-1">Check back later for updates</p>
          </div>
        ) : (
          urgentNews.map((news, index) => (
            <div key={news.id} className="group p-6 hover:bg-gray-50 transition-all duration-300 animate-fade-in"
                 style={{animationDelay: `${index * 0.1}s`}}>
              <div className="flex items-start space-x-4">
                {/* Enhanced Category Icon */}
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-lg group-hover:scale-110 transition-transform duration-300">
                  {getCategoryIcon(news.category)}
                </div>

                {/* Enhanced Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getSeverityColor(news.severity)} shadow-sm`}>
                      {news.severity.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500 font-semibold capitalize bg-gray-100 px-2 py-1 rounded-full">
                      {news.category}
                    </span>
                  </div>

                  <h4 className="text-base font-black text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors duration-300">
                    {news.title}
                  </h4>
                  
                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                    {news.summary}
                  </p>

                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <MapPin className="w-3 h-3" />
                      <span className="font-medium">{news.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <Clock className="w-3 h-3" />
                      <span className="font-medium">{formatTimeAgo(news.timestamp)}</span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Action */}
                <div className="flex-shrink-0">
                  <button className="group bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-lg">
                    <span className="flex items-center space-x-1">
                      <span>💝</span>
                      <span>Help</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Enhanced Footer */}
      {urgentNews.length > 0 && (
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 text-center border-t border-gray-100">
          <Link 
            to="/news" 
            className="group inline-flex items-center space-x-3 text-blue-600 hover:text-blue-700 text-sm font-bold transition-all duration-300"
          >
            <span>📰</span>
            <span>View all climate & aid news</span>
            <TrendingUp className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      )}
    </div>
  )
}

export default NewsWidget
