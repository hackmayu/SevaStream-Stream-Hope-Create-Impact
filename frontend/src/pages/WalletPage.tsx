import React, { useState, useEffect } from 'react'
import { useWallet } from '../hooks/useWallet'
import { useX402 } from '../hooks/useX402'
import WalletSelector from '../components/WalletSelector'

const WalletPage = () => {
  const [showWalletSelector, setShowWalletSelector] = useState(false)
  const [transactions, setTransactions] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'streams'>('overview')
  
  const {
    isConnected,
    address,
    balance,
    usdcBalance,
    displayBalance,
    displaySymbol,
    chainId,
    connectWallet,
    disconnectWallet,
    formatAddress,
    getNetworkName
  } = useWallet()
  
  const {
    activeStreams,
    getAllStreams,
    getTotalStreamAmount,
    getStreamStats
  } = useX402()

  // Mock transaction data
  useEffect(() => {
    if (isConnected) {
      setTransactions([
        {
          id: 'tx_001',
          type: 'donation',
          amount: 25.00,
          recipient: 'Emergency Medical Support',
          timestamp: Date.now() - 3600000,
          status: 'completed',
          txHash: '0x1234...5678'
        },
        {
          id: 'tx_002',
          type: 'stream',
          amount: 8.00,
          recipient: 'Clean Water Project',
          timestamp: Date.now() - 7200000,
          status: 'completed',
          txHash: '0x2345...6789'
        },
        {
          id: 'tx_003',
          type: 'donation',
          amount: 50.00,
          recipient: 'Food Distribution',
          timestamp: Date.now() - 10800000,
          status: 'pending',
          txHash: '0x3456...7890'
        }
      ])
    }
  }, [isConnected])

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'donation': return '💝'
      case 'stream': return '🌊'
      case 'received': return '📥'
      default: return '💸'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success-600 bg-success-100'
      case 'pending': return 'text-warning-600 bg-warning-100'
      case 'failed': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const handleWalletConnect = (walletType: 'coinbase') => {
    console.log('Connected wallet:', walletType)
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-400/20 to-cyan-400/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h1 className="text-5xl font-black text-gray-900 mb-6">🔐 Connect Your Wallet</h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Connect your crypto wallet to unlock the full potential of SevaStream. 
              View your balance, track donation history, and manage real-time streams with complete transparency.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <button
                onClick={() => setShowWalletSelector(true)}
                className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg px-10 py-5 rounded-2xl font-bold shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center space-x-3">
                  <span>🚀 Connect Wallet</span>
                  <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Secure Connection</h3>
                <p className="text-sm text-gray-600">Bank-level encryption and security</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Instant Transactions</h3>
                <p className="text-sm text-gray-600">Real-time donation streaming</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌍</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Global Impact</h3>
                <p className="text-sm text-gray-600">Support causes worldwide</p>
              </div>
            </div>
          </div>
        </div>
        
        <WalletSelector
          isOpen={showWalletSelector}
          onClose={() => setShowWalletSelector(false)}
          onWalletConnect={handleWalletConnect}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-400/20 to-cyan-400/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-gradient-to-r from-pink-400/15 to-rose-400/15 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-3 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full px-6 py-3 mb-6 shadow-xl">
            <div className="relative">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse inline-block"></span>
              <span className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping"></span>
            </div>
            <span className="text-sm font-semibold text-gray-800">💰 Wallet Connected</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            My Digital Wallet
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Monitor your donations, manage streams, and track your global impact
          </p>
        </div>

        {/* Enhanced Wallet Overview Card */}
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-lg border border-gray-200/50 rounded-3xl p-8 mb-8 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <span className="text-3xl">💙</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Coinbase Wallet</h2>
                  <p className="text-gray-600 font-mono bg-gray-100 px-3 py-1 rounded-lg">{formatAddress(address!)}</p>
                  <div className="flex items-center mt-2 text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    <span className="text-green-600 font-semibold">Connected</span>
                  </div>
                </div>
              </div>
              <button
                onClick={disconnectWallet}
                className="mt-4 md:mt-0 bg-white/70 backdrop-blur border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Disconnect
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-white/50 backdrop-blur rounded-2xl border border-gray-200/50 hover:shadow-lg transition-all duration-300">
                <div className="text-3xl font-black text-green-600 mb-2">{displayBalance} {displaySymbol}</div>
                <div className="text-sm text-gray-600 font-semibold">💰 Wallet Balance</div>
                <div className="mt-2 text-xs text-gray-500">Available for donations</div>
              </div>
              <div className="text-center p-6 bg-white/50 backdrop-blur rounded-2xl border border-gray-200/50 hover:shadow-lg transition-all duration-300">
                <div className="text-3xl font-black text-purple-600 mb-2">{activeStreams.length}</div>
                <div className="text-sm text-gray-600 font-semibold">🌊 Active Streams</div>
                <div className="mt-2 text-xs text-gray-500">Live donations flowing</div>
              </div>
              <div className="text-center p-6 bg-white/50 backdrop-blur rounded-2xl border border-gray-200/50 hover:shadow-lg transition-all duration-300">
                <div className="text-3xl font-black text-emerald-600 mb-2">₹{getTotalStreamAmount()}</div>
                <div className="text-sm text-gray-600 font-semibold">💸 Stream Rate</div>
                <div className="mt-2 text-xs text-gray-500">Per hour donation rate</div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200/50">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Network:</span>
                  <span className="text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-semibold">
                    🔗 {getNetworkName(chainId!)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>Secured by Coinbase Wallet</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'transactions', name: 'Transactions' },
              { id: 'streams', name: 'Active Streams' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors">
                  <div className="text-center">
                    <div className="text-2xl mb-2">💝</div>
                    <div className="font-medium text-gray-900">Start Donation</div>
                    <div className="text-sm text-gray-600">Create new donation stream</div>
                  </div>
                </button>
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors">
                  <div className="text-center">
                    <div className="text-2xl mb-2">📊</div>
                    <div className="font-medium text-gray-900">View Analytics</div>
                    <div className="text-sm text-gray-600">Track donation impact</div>
                  </div>
                </button>
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors">
                  <div className="text-center">
                    <div className="text-2xl mb-2">⚙️</div>
                    <div className="font-medium text-gray-900">Settings</div>
                    <div className="text-sm text-gray-600">Manage preferences</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {transactions.slice(0, 3).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getTransactionIcon(tx.type)}</div>
                      <div>
                        <div className="font-medium text-gray-900">₹{tx.amount}</div>
                        <div className="text-sm text-gray-600">{tx.recipient}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(tx.status)}`}>
                        {tx.status}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatTimestamp(tx.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Recipient</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Tx Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getTransactionIcon(tx.type)}</span>
                          <span className="capitalize">{tx.type}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">₹{tx.amount}</td>
                      <td className="py-3 px-4 text-gray-600">{tx.recipient}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(tx.status)}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {formatTimestamp(tx.timestamp)}
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm font-mono">
                        <a
                          href={`https://polygonscan.com/tx/${tx.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-800"
                        >
                          {tx.txHash}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'streams' && (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Donation Streams</h3>
            {activeStreams.length > 0 ? (
              <div className="space-y-4">
                {activeStreams.map((stream) => {
                  const stats = getStreamStats(stream.id)
                  return (
                    <div key={stream.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-success-500 rounded-full animate-pulse"></div>
                          <div>
                            <div className="font-medium text-gray-900">₹{stream.amount} every {stream.interval}s</div>
                            <div className="text-sm text-gray-600">To: {stream.recipient}</div>
                          </div>
                        </div>
                        <button className="btn-secondary text-sm">
                          Stop Stream
                        </button>
                      </div>
                      
                      {stats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
                          <div className="text-center">
                            <div className="text-lg font-semibold text-gray-900">₹{stats.totalSent}</div>
                            <div className="text-xs text-gray-600">Total Sent</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-gray-900">{Math.floor(stats.runtime / 60)}m</div>
                            <div className="text-xs text-gray-600">Runtime</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-gray-900">{stats.actualPayments}</div>
                            <div className="text-xs text-gray-600">Payments</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-success-600">{stats.successRate.toFixed(1)}%</div>
                            <div className="text-xs text-gray-600">Success Rate</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🌊</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Active Streams</h4>
                <p className="text-gray-600 mb-6">Start a donation stream to see it here</p>
                <button className="btn-primary">
                  Start New Stream
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default WalletPage
