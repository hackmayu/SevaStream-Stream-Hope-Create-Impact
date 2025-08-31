import React from 'react'
import { Link } from 'react-router-dom'
import WalletWidget from '../components/WalletWidget'
import CoinbaseWalletConnector from '../components/CoinbaseWalletConnector'
import NewsWidget from '../components/NewsWidget'
import { useWallet } from '../hooks/useWallet'

const Dashboard = () => {
  const { isConnected, connectWallet } = useWallet()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-emerald-400/25 to-cyan-400/25 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-r from-pink-400/20 to-rose-400/20 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-gradient-to-l from-violet-400/20 to-purple-400/20 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-blue-400/60 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 left-1/4 w-2 h-2 bg-purple-400/60 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 right-1/3 w-4 h-4 bg-emerald-400/60 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      {/* Enhanced Wallet Connection Banner */}
      {!isConnected && (
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-6 shadow-2xl border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0 p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">🚀 Connect Your Wallet to Start Helping</h3>
                  <p className="text-sm opacity-90 flex items-center space-x-2">
                    <span>💎 Secure, instant donations starting from just ₹8</span>
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Live</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => connectWallet()}
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105 duration-300 border-2 border-transparent hover:border-blue-200"
              >
                <span className="flex items-center space-x-2">
                  <span>Connect Coinbase Wallet</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            {/* Enhanced Live indicator with more details */}
            <div className="inline-flex items-center space-x-4 glass-enhanced rounded-full px-8 py-4 mb-12 shadow-2xl hover-glow-green animate-slide-up">
              <div className="relative">
                <span className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></span>
                <span className="absolute inset-0 w-4 h-4 bg-green-400 rounded-full animate-ping"></span>
              </div>
              <span className="text-base font-bold text-gray-800">🔴 Live Donation Streaming</span>
              <div className="w-px h-4 bg-gray-400"></div>
              <span className="text-sm text-gray-700 font-medium bg-green-100 px-3 py-1 rounded-full">
                23 donors active
              </span>
              <span className="text-sm text-gray-700 font-medium bg-blue-100 px-3 py-1 rounded-full">
                ₹18,450 today
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-gray-900 mb-12 leading-tight tracking-tight animate-fade-in">
              Stream Hope,
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-shift">
                Create Impact
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed animate-slide-up font-medium" style={{animationDelay: '0.2s'}}>
              Join the <span className="font-bold text-blue-600">revolutionary platform</span> that turns 
              <span className="font-bold text-emerald-600"> micro-donations into macro-change</span>. 
              Start streaming hope with just <span className="font-bold text-purple-600">₹8</span>.
            </p>
            
            <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
              Transform charitable giving with <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">real-time micro-donations</span>. 
              Every ₹8 creates immediate impact through blockchain transparency and AI verification.
            </p>
            
            {/* Enhanced Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 animate-scale-in" style={{animationDelay: '0.4s'}}>
              <Link to="/donor" className="group relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white text-xl px-12 py-6 rounded-2xl font-bold shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-300 animate-gradient-shift">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center space-x-3">
                  <span>🚀 Start Donating</span>
                  <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Link>

              <Link to="/receiver" className="group glass-enhanced text-gray-800 text-xl px-12 py-6 rounded-2xl font-bold shadow-2xl hover:shadow-emerald-500/50 hover-lift transition-all duration-300 border-2 border-emerald-200 hover:border-emerald-400">
                <span className="flex items-center space-x-3">
                  <span>🤝 Request Aid</span>
                  <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </span>
              </Link>
            </div>

            {/* Enhanced Trust indicators with animations */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-base text-gray-700 animate-fade-in" style={{animationDelay: '0.6s'}}>
              <div className="flex items-center space-x-3 bg-green-50 px-4 py-2 rounded-full border border-green-200 hover:bg-green-100 transition-colors">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                <span className="font-medium">🤖 AI Verified</span>
              </div>
              <div className="flex items-center space-x-3 bg-blue-50 px-4 py-2 rounded-full border border-blue-200 hover:bg-blue-100 transition-colors">
                <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></span>
                <span className="font-medium">🔗 Blockchain Secured</span>
              </div>
              <div className="flex items-center space-x-3 bg-purple-50 px-4 py-2 rounded-full border border-purple-200 hover:bg-purple-100 transition-colors">
                <span className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></span>
                <span className="font-medium">⚡ Real-time Impact</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Section with staggered animations */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-8 animate-slide-up">
            📊 Impact in <span className="text-gradient">Real-Time</span>
          </h2>
          <p className="text-2xl text-gray-600 max-w-4xl mx-auto font-medium animate-fade-in" style={{animationDelay: '0.2s'}}>
            See how your contributions create <span className="font-bold text-blue-600">immediate change</span> across the globe
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Link to="/analytics" className="group cursor-pointer animate-slide-up" style={{animationDelay: '0.1s'}}>
            <div className="relative overflow-hidden glass-card p-10 text-center group-hover:scale-105 hover-glow-blue transition-all duration-500 hover:border-blue-300 rounded-3xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Floating background element */}
              <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse-slow"></div>
              
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl group-hover:scale-110 group-hover:shadow-blue-500/50 transition-all duration-500 animate-bounce-soft">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="text-6xl font-black text-blue-600 mb-4 group-hover:scale-110 transition-transform duration-300">₹1.2M</div>
                <div className="text-gray-800 font-bold text-xl mb-4">Total Donated</div>
                <div className="inline-flex items-center text-sm text-green-700 bg-green-100 px-4 py-2 rounded-full font-bold border border-green-200">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  +15.3% this week 📈
                </div>
              </div>
            </div>
          </Link>

          <Link to="/receiver" className="group cursor-pointer animate-slide-up" style={{animationDelay: '0.2s'}}>
            <div className="relative overflow-hidden glass-card p-10 text-center group-hover:scale-105 hover-glow-green transition-all duration-500 hover:border-emerald-300 rounded-3xl">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-full blur-xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
              
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl group-hover:scale-110 group-hover:shadow-emerald-500/50 transition-all duration-500 animate-bounce-soft" style={{animationDelay: '0.5s'}}>
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div className="text-6xl font-black text-emerald-600 mb-4 group-hover:scale-110 transition-transform duration-300">15,432</div>
                <div className="text-gray-800 font-bold text-xl mb-4">Lives Impacted</div>
                <div className="inline-flex items-center text-sm text-emerald-700 bg-emerald-100 px-4 py-2 rounded-full font-bold border border-emerald-200">
                  <span className="w-3 h-3 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                  +234 today 💖
                </div>
              </div>
            </div>
          </Link>

          <Link to="/donor" className="group cursor-pointer">
            <div className="relative overflow-hidden bg-white/70 backdrop-blur-lg border border-gray-200/50 rounded-3xl p-8 text-center group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-purple-500/20 transition-all duration-500 group-hover:border-purple-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-5xl font-black text-purple-600 mb-3 group-hover:scale-110 transition-transform duration-300">847</div>
                <div className="text-gray-700 font-bold text-lg mb-3">Active Donors</div>
                <div className="inline-flex items-center text-sm text-red-700 bg-red-100 px-3 py-2 rounded-full font-semibold">
                  <span className="relative">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse inline-block"></span>
                    <span className="absolute inset-0 w-2 h-2 bg-red-400 rounded-full animate-ping"></span>
                  </span>
                  23 streaming now 🔴
                </div>
              </div>
            </div>
          </Link>

          <Link to="/analytics" className="group cursor-pointer">
            <div className="relative overflow-hidden bg-white/70 backdrop-blur-lg border border-gray-200/50 rounded-3xl p-8 text-center group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-amber-500/20 transition-all duration-500 group-hover:border-amber-300">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="text-5xl font-black text-amber-600 mb-3 group-hover:scale-110 transition-transform duration-300">23</div>
                <div className="text-gray-700 font-bold text-lg mb-3">Partner NGOs</div>
                <div className="inline-flex items-center text-sm text-gray-700 bg-gray-100 px-3 py-2 rounded-full font-semibold">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  AI Verified ✅
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Enhanced Wallet & Quick Actions Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Enhanced Wallet Widget */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-8 space-y-6">
              <WalletWidget />
              
              {/* News Widget */}
              <NewsWidget />
              
              {/* Coinbase Wallet Integration Section */}
              {!isConnected && (
                <div className="bg-white/70 backdrop-blur-lg border border-gray-200 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <span>🚀</span>
                    <span>Connect Coinbase Wallet</span>
                  </h3>
                  <CoinbaseWalletConnector 
                    onConnect={(success) => {
                      if (success) {
                        console.log('✅ Coinbase Wallet connected from Dashboard!')
                      }
                    }}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Enhanced Quick Action Cards */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">⚡ Quick Actions</h3>
              <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                Choose your impact
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link to="/donor" className="group relative overflow-hidden bg-white/70 backdrop-blur-lg border border-gray-200 rounded-2xl p-6 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:border-blue-300 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <span className="text-2xl">�</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">Start Donating</h4>
                      <p className="text-sm text-gray-600 mt-1">Begin your impact journey</p>
                      <div className="flex items-center mt-2 text-xs text-blue-600 font-semibold">
                        <span>From ₹8</span>
                        <svg className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
              
              <Link to="/receiver" className="group relative overflow-hidden bg-white/70 backdrop-blur-lg border border-gray-200 rounded-2xl p-6 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 hover:border-emerald-300 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <span className="text-2xl">🤝</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-lg group-hover:text-emerald-600 transition-colors">Request Aid</h4>
                      <p className="text-sm text-gray-600 mt-1">Submit verified requests</p>
                      <div className="flex items-center mt-2 text-xs text-emerald-600 font-semibold">
                        <span>AI Verified</span>
                        <svg className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
              
              <Link to="/analytics" className="group relative overflow-hidden bg-white/70 backdrop-blur-lg border border-gray-200 rounded-2xl p-6 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 hover:border-purple-300 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <span className="text-2xl">📊</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-lg group-hover:text-purple-600 transition-colors">View Analytics</h4>
                      <p className="text-sm text-gray-600 mt-1">Track real-time impact</p>
                      <div className="flex items-center mt-2 text-xs text-purple-600 font-semibold">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                        <span>Live Data</span>
                        <svg className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How SevaStream Works
          </h2>
          <p className="text-xl text-gray-600">
            Revolutionary technology meets compassionate giving
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold mb-4">Micro-Donations</h3>
            <p className="text-gray-600">
              Stream donations as low as ₹8 using x402 protocol. 
              No minimum amounts, maximum impact.
            </p>
          </div>

          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔗</span>
            </div>
            <h3 className="text-xl font-semibold mb-4">Blockchain Transparency</h3>
            <p className="text-gray-600">
              Every transaction recorded on Polygon. 
              Track your donations from wallet to recipient.
            </p>
          </div>

          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-xl font-semibold mb-4">AI-Powered Matching</h3>
            <p className="text-gray-600">
              Smart algorithms match urgent needs with available resources 
              for maximum effectiveness.
            </p>
          </div>
        </div>
      </div>

      {/* fx02 Protocol Integration */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            🚀 Powered by fx02 Protocol
          </h2>
          <p className="text-xl text-gray-600">
            Advanced financial infrastructure for seamless aid distribution
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white/70 backdrop-blur-lg border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">💸</span>
            </div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Low-Cost Transactions</h3>
            <p className="text-gray-600 text-sm">
              fx02 protocol enables micro-donations with minimal fees (2%), making small contributions viable and impactful.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-lg border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Secure Processing</h3>
            <p className="text-gray-600 text-sm">
              Built-in security measures and fraud detection ensure donations reach legitimate recipients safely.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-lg border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Instant Settlement</h3>
            <p className="text-gray-600 text-sm">
              Real-time processing means aid requests can receive funds immediately when urgent needs arise.
            </p>
          </div>
        </div>

        <div className="mt-12 bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">How fx02 Enhances Aid Requests</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">For Recipients:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Low 2% protocol fee on aid requests</li>
                <li>• Transparent fee calculation upfront</li>
                <li>• Instant notification when donations arrive</li>
                <li>• Built-in verification and trust scoring</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">For Donors:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• See exact fee breakdown before donating</li>
                <li>• Guaranteed fund delivery tracking</li>
                <li>• AI-powered recipient verification</li>
                <li>• Fraud protection and refund mechanisms</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Recent Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { 
              location: "Mumbai, India", 
              need: "Clean Water", 
              amount: "₹2,400", 
              status: "Funded",
              time: "2 hours ago"
            },
            { 
              location: "Delhi, India", 
              need: "Medical Supplies", 
              amount: "₹4,800", 
              status: "In Progress",
              time: "4 hours ago"
            },
            { 
              location: "Bangalore, India", 
              need: "Food Distribution", 
              amount: "₹1,200", 
              status: "Completed",
              time: "6 hours ago"
            }
          ].map((item, index) => (
            <div key={index} className="card p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{item.need}</h3>
                  <p className="text-sm text-gray-600">{item.location}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.status === 'Completed' ? 'bg-success-100 text-success-800' :
                  item.status === 'Funded' ? 'bg-primary-100 text-primary-800' :
                  'bg-warning-100 text-warning-800'
                }`}>
                  {item.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">{item.amount}</span>
                <span className="text-sm text-gray-500">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Impact Stories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Success Stories</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
                <span className="text-success-600 text-xl">🎓</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Meera's Education</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Your micro-donations helped Meera complete her engineering degree.
                </p>
                <div className="mt-3 flex items-center text-sm text-success-600">
                  <span className="font-medium">₹18,450 raised</span>
                  <span className="mx-2">•</span>
                  <span>127 donors</span>
                </div>
              </div>
              <button className="text-gray-400 hover:text-primary-600 transition-colors">
                ❤️
              </button>
            </div>
          </div>

          <div className="card p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center">
                <span className="text-warning-600 text-xl">🏥</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Emergency Surgery</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Real-time donations enabled life-saving surgery for Ravi.
                </p>
                <div className="mt-3 flex items-center text-sm text-success-600">
                  <span className="font-medium">₹45,000 raised</span>
                  <span className="mx-2">•</span>
                  <span>203 donors</span>
                </div>
              </div>
              <button className="text-gray-400 hover:text-primary-600 transition-colors">
                ❤️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
