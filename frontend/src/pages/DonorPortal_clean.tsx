import React, { useState } from 'react'
import { useWallet } from '../hooks/useWallet'
import { useX402 } from '../hooks/useX402'

interface UrgentNeed {
  id: number
  title: string
  description: string
  location: string
  needed: string
  raised: string
  progress: number
  urgency: 'Critical' | 'High' | 'Medium'
}

const DonorPortal: React.FC = () => {
  const { isConnected, address, balance, chainId, connectWallet } = useWallet()
  const { startPaymentStream, stopPaymentStream, activeStreams } = useX402()
  
  const [donationAmount, setDonationAmount] = useState('')
  const [selectedCause, setSelectedCause] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStreamId, setCurrentStreamId] = useState<string | null>(null)

  const urgentNeeds: UrgentNeed[] = [
    {
      id: 1,
      title: "Emergency Medical Support",
      description: "Urgent medical supplies needed for disaster victims in remote areas.",
      location: "Rural Bangladesh",
      needed: "$1,200 USDC",
      raised: "$768 USDC",
      progress: 64,
      urgency: "Critical"
    },
    {
      id: 2,
      title: "Clean Water Access",
      description: "Installing water purification systems for communities without clean water.",
      location: "Sub-Saharan Africa",
      needed: "$1,800 USDC",
      raised: "$432 USDC",
      progress: 24,
      urgency: "High"
    },
    {
      id: 3,
      title: "Food Security Program",
      description: "Providing nutritious meals for malnourished children and families.",
      location: "Southeast Asia",
      needed: "$960 USDC",
      raised: "$672 USDC",
      progress: 70,
      urgency: "High"
    },
    {
      id: 4,
      title: "Education Support Initiative",
      description: "Providing educational resources and technology access for underprivileged students.",
      location: "South America",
      needed: "$2,400 USDC",
      raised: "$480 USDC",
      progress: 20,
      urgency: "Medium"
    }
  ]

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const calculateX402Fee = (amount: number) => {
    return amount * 0.001 // 0.1% fee
  }

  const getNetworkName = (chainId: number) => {
    const networks: { [key: number]: string } = {
      1: 'Ethereum',
      137: 'Polygon',
      42161: 'Arbitrum',
      10: 'Optimism'
    }
    return networks[chainId] || 'Unknown'
  }

  const displayBalance = balance ? parseFloat(balance).toFixed(4) : '0.0000'
  const displaySymbol = 'USDC'

  const getTotalStreamAmount = () => {
    return activeStreams.reduce((total, stream) => total + stream.amount, 0)
  }

  const handleConnectWallet = async () => {
    try {
      await connectWallet()
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      alert('Failed to connect wallet. Please try again.')
    }
  }

  const handleStartStream = async () => {
    if (!donationAmount || !selectedCause || !isConnected) return
    
    setIsProcessing(true)
    setIsStreaming(true)
    
    try {
      const amount = parseFloat(donationAmount)
      const fee = calculateX402Fee(amount)
      const totalAmount = amount + fee
      
      console.log('Starting donation stream:', {
        amount,
        fee,
        totalAmount,
        cause: selectedCause,
        recipient: address,
        timestamp: new Date().toISOString()
      })
      
      // Start x402 payment stream (every 10 seconds)
      const streamId = await startPaymentStream(amount, selectedCause, 10)
      
      if (streamId) {
        setCurrentStreamId(streamId)
        alert(`x402 donation stream started! Sending ${amount} USDC every 10 seconds. Total with fees: ${totalAmount.toFixed(4)} USDC`)
      } else {
        throw new Error('Failed to start payment stream')
      }
      
    } catch (error) {
      console.error('Failed to start donation stream:', error)
      alert('Failed to start donation stream. Please try again.')
      setIsStreaming(false)
    }
    setIsProcessing(false)
  }

  const handleStopStream = () => {
    if (currentStreamId) {
      stopPaymentStream(currentStreamId)
      setCurrentStreamId(null)
    }
    setIsStreaming(false)
    alert('Donation stream stopped successfully!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-black text-gray-900 mb-4 gradient-text">Donor Portal</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Stream your donations in real-time and create immediate impact through blockchain technology
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Donation Stream Panel */}
          <div className="lg:col-span-1">
            <div className="card p-8 sticky top-32">
              <h2 className="text-2xl font-bold mb-6 gradient-text">Start Donation Stream</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stream Amount (USDC)
                  </label>
                  <input
                    type="number"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                    placeholder="Enter USDC amount"
                    className="input"
                    min="0.01"
                    step="0.01"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Any amount welcome | Recommended: 50+ USDC
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stream Rate
                  </label>
                  <select className="input">
                    <option>2.5 USDC every 10 seconds</option>
                    <option>5 USDC every 10 seconds</option>
                    <option>15 USDC every 30 seconds</option>
                    <option>30 USDC every minute</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selected Cause
                  </label>
                  <select 
                    value={selectedCause}
                    onChange={(e) => setSelectedCause(e.target.value)}
                    className="input"
                  >
                    <option value="">Select a cause</option>
                    {urgentNeeds.map(need => (
                      <option key={need.id} value={need.id}>
                        {need.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* x402 Fee Information */}
                {donationAmount && parseFloat(donationAmount) > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-700">x402 Protocol Fee:</span>
                      <span className="font-medium text-blue-900">{calculateX402Fee(parseFloat(donationAmount)).toFixed(4)} USDC</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-blue-700">Total Amount:</span>
                      <span className="font-bold text-blue-900">
                        {(parseFloat(donationAmount) + calculateX402Fee(parseFloat(donationAmount))).toFixed(4)} USDC
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      Ultra-low fees for all donations via x402 protocol
                    </p>
                  </div>
                )}

                {isStreaming ? (
                  <button
                    onClick={handleStopStream}
                    className="w-full py-3 px-4 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
                  >
                    🛑 Stop Stream
                  </button>
                ) : (
                  <button
                    onClick={handleStartStream}
                    disabled={!donationAmount || !selectedCause || isStreaming || !isConnected}
                    className={`w-full py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      isStreaming
                        ? 'bg-success-600 text-white animate-pulse'
                        : 'btn-primary'
                    } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1`}
                  >
                    {!isConnected ? (
                      <>
                        <span>�</span>
                        <span>Connect Wallet</span>
                      </>
                    ) : isProcessing ? (
                      <>
                        <span>⏳</span>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>⚡</span>
                        <span>Start x402 Stream</span>
                      </>
                    )}
                  </button>
                )}

                {isStreaming && (
                  <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="animate-pulse w-3 h-3 bg-success-500 rounded-full mr-3"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-success-800">
                          x402 Stream Active
                        </p>
                        <p className="text-xs text-success-600">
                          Sending {donationAmount} USDC every 10 seconds via x402 protocol
                        </p>
                        {currentStreamId && (
                          <p className="text-xs text-success-500 mt-1">
                            Stream ID: {currentStreamId.slice(0, 12)}...
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Active Streams Summary */}
                    {activeStreams.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-success-200">
                        <div className="flex justify-between text-xs text-success-700">
                          <span>Active Streams: {activeStreams.length}</span>
                          <span>Combined Rate: ${getTotalStreamAmount()} USDC/10s</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Wallet Connection */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                {isConnected ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Wallet Address</span>
                      <span className="font-medium text-primary-600">{formatAddress(address!)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-600">Balance</span>
                      <span className="font-medium">{displayBalance} {displaySymbol}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-600">Network</span>
                      <span className="text-sm bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        {getNetworkName(chainId!)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-3">Connect your wallet to start donating</p>
                    <button 
                      onClick={handleConnectWallet}
                      className="btn-primary w-full py-2 px-3 text-sm rounded-md flex items-center justify-center space-x-1"
                    >
                      <span>🚀</span>
                      <span>Connect Wallet</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Urgent Needs List */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold gradient-text mb-2">Urgent Needs</h2>
                <p className="text-gray-600 text-lg">Choose a cause to support with your stream</p>
              </div>
              <div className="flex space-x-3">
                <button className="btn-secondary text-sm px-6 py-2">Filter</button>
                <button className="btn-secondary text-sm px-6 py-2">Sort</button>
              </div>
            </div>

            <div className="space-y-8">
              {urgentNeeds.map((need) => (
                <div 
                  key={need.id} 
                  className={`card p-8 cursor-pointer transition-all hover:shadow-2xl transform hover:scale-[1.02] ${
                    selectedCause === need.id.toString() ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''
                  }`}
                  onClick={() => setSelectedCause(need.id.toString())}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{need.title}</h3>
                      <p className="text-gray-600">{need.location}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      need.urgency === 'Critical' ? 'bg-danger-100 text-danger-800' :
                      need.urgency === 'High' ? 'bg-warning-100 text-warning-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {need.urgency}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-4">{need.description}</p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{need.raised} / {need.needed}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${need.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{need.progress}% funded</span>
                      <span>${parseInt(need.needed.replace('$', '').replace(' USDC', '').replace(',', '')) - parseInt(need.raised.replace('$', '').replace(' USDC', '').replace(',', ''))} USDC remaining</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <div className="flex -space-x-2">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="w-8 h-8 bg-primary-100 rounded-full border-2 border-white flex items-center justify-center">
                          <span className="text-xs text-primary-700">👤</span>
                        </div>
                      ))}
                      <div className="w-8 h-8 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-xs text-gray-600">+23</span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">27 active donors</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Donations */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-6">Your Recent Streams</h2>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cause
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tx Hash
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[
                    { cause: "Emergency Medical", amount: "$58 USDC", status: "Completed", date: "2 hours ago", hash: "0x1234...5678" },
                    { cause: "Clean Water", amount: "$115 USDC", status: "Completed", date: "1 day ago", hash: "0x9876...5432" },
                    { cause: "Food Security", amount: "$29 USDC", status: "Processing", date: "2 days ago", hash: "0xabcd...efgh" }
                  ].map((donation, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {donation.cause}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {donation.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          donation.status === 'Completed' ? 'bg-success-100 text-success-800' :
                          'bg-warning-100 text-warning-800'
                        }`}>
                          {donation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {donation.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600 font-mono">
                        {donation.hash}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DonorPortal
