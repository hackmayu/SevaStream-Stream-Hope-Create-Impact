import React, { useState } from 'react'

const CoinbaseDemo: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)

  const connectCoinbaseWallet = async () => {
    setIsConnecting(true)
    
    try {
      // Check if Coinbase Wallet is available
      if (typeof window.ethereum !== 'undefined') {
        console.log('✅ Ethereum provider detected')
        
        // Request account access
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        })
        
        if (accounts.length > 0) {
          setAddress(accounts[0])
          setIsConnected(true)
          console.log('🎉 Wallet connected:', accounts[0])
          
          // Check network
          const chainId = await window.ethereum.request({
            method: 'eth_chainId'
          })
          
          console.log('🌐 Current network:', chainId)
          
          if (chainId !== '0x89') { // Polygon
            console.log('⚠️ Please switch to Polygon network')
          }
        }
      } else {
        console.log('❌ No Ethereum provider found')
        alert('Please install Coinbase Wallet or another Web3 wallet')
      }
    } catch (error: any) {
      console.error('❌ Connection failed:', error)
      if (error.code === 4001) {
        alert('Connection was rejected by user')
      } else {
        alert('Failed to connect wallet: ' + error.message)
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setAddress('')
    console.log('👋 Wallet disconnected')
  }

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          🚀 Coinbase Integration Demo
        </h2>
        <p className="text-gray-600">
          Simple demonstration of wallet connection
        </p>
      </div>

      {!isConnected ? (
        <div className="text-center">
          <button
            onClick={connectCoinbaseWallet}
            disabled={isConnecting}
            className={`px-8 py-4 rounded-xl text-white font-bold text-lg transition-all duration-300 ${
              isConnecting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 shadow-lg hover:shadow-xl'
            }`}
          >
            {isConnecting ? (
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Connecting...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <span>🔗 Connect Coinbase Wallet</span>
              </div>
            )}
          </button>
          
          <div className="mt-6 text-sm text-gray-500">
            <p>✅ Supports Coinbase Wallet, MetaMask, and other Web3 wallets</p>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
            <div className="text-green-600 text-4xl mb-3">🎉</div>
            <h3 className="text-xl font-bold text-green-800 mb-2">
              Wallet Connected Successfully!
            </h3>
            <div className="bg-white rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-600 mb-1">Address:</p>
              <p className="font-mono text-sm text-gray-800 break-all">
                {address}
              </p>
            </div>
            <p className="text-green-600">
              Ready to start donating on SevaStream! 💙
            </p>
          </div>
          
          <button
            onClick={disconnectWallet}
            className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            Disconnect Wallet
          </button>
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-bold text-gray-800 mb-2">Quick Test Steps:</h4>
        <ol className="text-sm text-gray-600 space-y-1">
          <li>1. Click "Connect Coinbase Wallet"</li>
          <li>2. Approve connection in your wallet</li>
          <li>3. See your address displayed</li>
          <li>4. Check browser console for detailed logs</li>
        </ol>
      </div>
    </div>
  )
}

export default CoinbaseDemo
