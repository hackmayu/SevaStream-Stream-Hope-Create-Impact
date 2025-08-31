import React from 'react'
import { useWallet } from '../hooks/useWallet'
import { useX402 } from '../hooks/useX402'

interface WalletManagementProps {
  className?: string
}

const WalletManagement: React.FC<WalletManagementProps> = ({ className = '' }) => {
  const {
    isConnected,
    address,
    balance,
    chainId,
    formatAddress,
    getNetworkName,
    disconnectWallet
  } = useWallet()
  
  const {
    activeStreams,
    getTotalStreamAmount,
    calculateX402Fee
  } = useX402()

  if (!isConnected) {
    return null
  }

  const totalActiveStreamValue = getTotalStreamAmount()
  const estimatedMonthlyTotal = totalActiveStreamValue * 6 * 24 * 30 // 10s intervals
  const monthlyFees = calculateX402Fee(estimatedMonthlyTotal)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Wallet Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Wallet Management</h3>
        <button
          onClick={disconnectWallet}
          className="text-sm text-red-600 hover:text-red-700 transition-colors"
        >
          Disconnect
        </button>
      </div>

      {/* Main Wallet Card */}
      <div className="glass-morphism rounded-2xl p-8 text-white relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/90 via-secondary-500/90 to-purple-600/90"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">₿</span>
                </div>
              </div>
              <div>
                <p className="font-semibold text-lg">Coinbase Wallet</p>
                <p className="text-sm opacity-90 font-mono">{formatAddress(address!)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold mb-1">{balance}</p>
              <p className="text-sm opacity-80">{getNetworkName(chainId!)}</p>
            </div>
          </div>
          
          <div className="border-t border-white/20 pt-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                  </svg>
                </div>
                <p className="text-sm opacity-80 mb-1">Active Streams</p>
                <p className="text-2xl font-bold">{activeStreams.length}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <p className="text-sm opacity-80 mb-1">Stream Rate</p>
                <p className="text-2xl font-bold">₹{totalActiveStreamValue}</p>
                <p className="text-xs opacity-70">/10s</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Streaming Stats */}
      {activeStreams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Streaming Overview</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600 font-medium">Current Rate:</span>
                <div className="text-right">
                  <span className="font-bold text-lg text-gray-900">₹{totalActiveStreamValue}</span>
                  <span className="text-sm text-gray-500 ml-1">every 10s</span>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-600 font-medium">Hourly Rate:</span>
                <span className="font-bold text-blue-600">₹{(totalActiveStreamValue * 6 * 60).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-600 font-medium">Daily Estimate:</span>
                <span className="font-bold text-green-600">₹{(totalActiveStreamValue * 6 * 24 * 60).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="card p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10Z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900">x402 Fee Analysis</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600 font-medium">Per Transaction:</span>
                <span className="font-bold text-gray-900">₹{calculateX402Fee(totalActiveStreamValue).toFixed(3)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-gray-600 font-medium">Daily Fees:</span>
                <span className="font-bold text-orange-600">₹{(calculateX402Fee(totalActiveStreamValue) * 6 * 24 * 60).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-gray-600 font-medium">Monthly Est.:</span>
                <span className="font-bold text-purple-600">₹{monthlyFees.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Limits & Safety */}
      <div className="card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z" />
            </svg>
          </div>
          <h4 className="text-lg font-semibold text-gray-900">Security & Status</h4>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
                </svg>
              </div>
              <div>
                <span className="font-semibold text-green-800">Wallet Connected</span>
                <p className="text-sm text-green-600">Coinbase Wallet • Secure Connection</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">Active</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M11,7H13V9H11V7M11,11H13V17H11V11Z" />
                </svg>
              </div>
              <div>
                <span className="font-semibold text-blue-800">x402 Protocol Active</span>
                <p className="text-sm text-blue-600">Ultra-low fees • Instant transactions</p>
              </div>
            </div>
            <span className="text-sm font-medium text-blue-700 bg-blue-200 px-3 py-1 rounded-full">Optimized</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" />
                </svg>
              </div>
              <div>
                <span className="font-semibold text-purple-800">Polygon Network</span>
                <p className="text-sm text-purple-600">Fast & eco-friendly blockchain</p>
              </div>
            </div>
            <span className="text-sm font-medium text-purple-700 bg-purple-200 px-3 py-1 rounded-full">Layer 2</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button className="btn-secondary group flex items-center justify-center space-x-2 py-4">
          <svg className="w-5 h-5 text-gray-600 group-hover:text-primary-600 transition-colors" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19,3H5C3.9,3 3,3.9 3,5V19C3,20.1 3.9,21 5,21H19C20.1,21 21,20.1 21,19V5C21,3.9 20.1,3 19,3M17,17H7V15H17V17M17,13H7V11H17V13M17,9H7V7H17V9Z" />
          </svg>
          <span className="font-medium">View History</span>
        </button>
        <button className="btn-secondary group flex items-center justify-center space-x-2 py-4">
          <svg className="w-5 h-5 text-gray-600 group-hover:text-primary-600 transition-colors" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
          </svg>
          <span className="font-medium">Settings</span>
        </button>
      </div>

      {/* AI & Blockchain Info */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border border-amber-200 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/10 to-orange-400/10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2A7,7 0 0,1 19,9C19,11.38 17.81,13.47 16,14.74V17A1,1 0 0,1 15,18H9A1,1 0 0,1 8,17V14.74C6.19,13.47 5,11.38 5,9A7,7 0 0,1 12,2M9,21V20H15V21A1,1 0 0,1 14,22H10A1,1 0 0,1 9,21M12,4A5,5 0 0,0 7,9C7,10.68 7.69,12.19 8.83,13.24L9,13.39V16H15V13.39L15.17,13.24C16.31,12.19 17,10.68 17,9A5,5 0 0,0 12,4Z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h5 className="font-semibold text-amber-900">AI-Powered Smart Donations</h5>
                <span className="bg-amber-200 text-amber-800 text-xs px-2 py-1 rounded-full font-medium">Enhanced</span>
              </div>
              <p className="text-sm text-amber-800 leading-relaxed mb-3">
                Your donations are enhanced with AI verification for needs detection, news verification, and fraud prevention. 
                Smart contracts on Polygon ensure transparency and minimal fees.
              </p>
              <div className="flex items-center space-x-4 text-xs text-amber-700">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>AI Verified Recipients</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Blockchain Transparency</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Real-time Impact</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WalletManagement
