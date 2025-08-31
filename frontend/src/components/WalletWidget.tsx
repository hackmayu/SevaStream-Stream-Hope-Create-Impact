import React from 'react'
import { Link } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet'
import { useX402 } from '../hooks/useX402'

const WalletWidget = () => {
  const {
    isConnected,
    address,
    balance,
    chainId,
    formatAddress,
    getNetworkName
  } = useWallet()
  
  const {
    activeStreams,
    getTotalStreamAmount
  } = useX402()

  if (!isConnected) {
    return (
      <div className="relative overflow-hidden glass-enhanced rounded-3xl p-8 hover-lift hover-glow-blue transition-all duration-500 group animate-slide-up">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Animated background elements */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse-slow"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-float"></div>
        
        <div className="relative text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500 shadow-2xl hover-glow-blue animate-bounce-soft">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          
          <h3 className="font-black text-gray-900 text-2xl mb-4 group-hover:text-blue-600 transition-colors">
            🔐 Connect Your Wallet
          </h3>
          
          <p className="text-gray-600 mb-8 leading-relaxed text-lg">
            Unlock the full potential of <span className="font-bold text-blue-600">SevaStream</span> and start making a difference
          </p>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center text-base text-gray-700 group-hover:text-blue-600 transition-colors">
              <span className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full mr-4 animate-pulse"></span>
              <span className="font-medium">🔒 Bank-grade security</span>
            </div>
            <div className="flex items-center text-base text-gray-700 group-hover:text-emerald-600 transition-colors">
              <span className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full mr-4 animate-pulse" style={{animationDelay: '0.5s'}}></span>
              <span className="font-medium">⚡ Real-time streaming</span>
            </div>
            <div className="flex items-center text-base text-gray-700 group-hover:text-purple-600 transition-colors">
              <span className="w-3 h-3 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full mr-4 animate-pulse" style={{animationDelay: '1s'}}></span>
              <span className="font-medium">📊 Live impact tracking</span>
            </div>
          </div>
          
          <Link to="/wallet" className="group/btn relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-300 animate-gradient-shift">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
            <span className="relative flex items-center space-x-2">
              <span>Connect Wallet</span>
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card p-8 hover-lift hover-glow-green transition-all duration-500 group animate-scale-in rounded-3xl">
      {/* Header with enhanced styling */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-xl">✅</span>
          </div>
          <h3 className="font-bold text-gray-900 text-xl">Connected Wallet</h3>
        </div>
        <Link 
          to="/wallet" 
          className="text-blue-600 hover:text-blue-700 text-sm font-semibold bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-all duration-300 group-hover:translate-x-1"
        >
          Manage →
        </Link>
      </div>
      
      <div className="space-y-6">
        {/* Enhanced Wallet Info with animations */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 rounded-2xl border-2 border-blue-200/50 p-6 group/card hover:shadow-xl transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg animate-pulse-slow">
              🌊
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <p className="text-lg font-bold text-gray-900 truncate">
                  {formatAddress(address!)}
                </p>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  📋
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                  Coinbase Wallet
                </span>
                <span className="text-sm text-gray-600">
                  {getNetworkName(chainId!)}
                </span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">Live</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Balance Display with gradient */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Available Balance</span>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-gray-900">{balance}</span>
            <span className="text-lg font-medium text-gray-600">ETH</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            ≈ ₹{balance ? (parseFloat(balance) * 180000).toLocaleString() : '0'}
          </div>
        </div>

        {/* Enhanced Active Streams */}
        {activeStreams.length > 0 && (
          <div className="bg-gradient-to-r from-success-50 to-success-100 rounded-xl p-4 border border-success-200">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-success-700">Active Streams</span>
              <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-success-600">Stream Count</span>
              <span className="font-bold text-success-800 text-lg">{activeStreams.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-success-600">Stream Rate</span>
              <span className="text-sm font-semibold text-success-700">₹{getTotalStreamAmount()}/10s</span>
            </div>
            <div className="mt-3 w-full bg-success-200 rounded-full h-2">
              <div 
                className="bg-success-500 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min((activeStreams.length / 10) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Enhanced Quick Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link 
            to="/donor" 
            className="text-center py-3 px-4 bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 rounded-xl text-sm font-medium hover:from-primary-100 hover:to-primary-200 transition-all duration-300 group-hover:scale-105 border border-primary-200 hover:border-primary-300"
          >
            <div className="flex flex-col items-center space-y-1">
              <span className="text-lg">💝</span>
              <span>Donate</span>
            </div>
          </Link>
          <Link 
            to="/analytics" 
            className="text-center py-3 px-4 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:from-gray-100 hover:to-gray-200 transition-all duration-300 group-hover:scale-105 border border-gray-200 hover:border-gray-300"
          >
            <div className="flex flex-col items-center space-y-1">
              <span className="text-lg">📊</span>
              <span>Analytics</span>
            </div>
          </Link>
        </div>

        {/* Network Status */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Network: {getNetworkName(chainId!)}</span>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WalletWidget
