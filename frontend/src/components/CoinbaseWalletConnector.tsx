import React, { useState, useEffect } from 'react'
import { useWallet } from '../hooks/useWallet'

interface CoinbaseWalletConnectorProps {
  onConnect?: (success: boolean) => void
  className?: string
}

const CoinbaseWalletConnector: React.FC<CoinbaseWalletConnectorProps> = ({ 
  onConnect, 
  className = '' 
}) => {
  const { connectWallet, isConnected, isConnecting } = useWallet()
  const [error, setError] = useState<string | null>(null)
  const [isSDKAvailable, setIsSDKAvailable] = useState(true)

  // Check if Coinbase Wallet is available
  useEffect(() => {
    const checkWalletAvailability = () => {
      // Check for Coinbase Wallet extension
      const hasCoinbaseExtension = window.ethereum?.isCoinbaseWallet
      // Check for mobile app or general Web3 support
      const hasWeb3 = typeof window.ethereum !== 'undefined'
      
      setIsSDKAvailable(hasCoinbaseExtension || hasWeb3)
    }

    checkWalletAvailability()
  }, [])

  const handleConnect = async () => {
    setError(null)
    
    try {
      const result = await connectWallet('coinbase')
      
      if (result?.success) {
        console.log('✅ Coinbase Wallet connected successfully!')
        onConnect?.(true)
      } else {
        const errorMessage = result?.error || 'Failed to connect to Coinbase Wallet'
        setError(errorMessage)
        onConnect?.(false)
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred'
      setError(errorMessage)
      onConnect?.(false)
      console.error('❌ Coinbase Wallet connection failed:', err)
    }
  }

  const openCoinbaseWallet = () => {
    window.open('https://www.coinbase.com/wallet', '_blank')
  }

  if (isConnected) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-xl p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-green-800">Coinbase Wallet Connected!</h3>
            <p className="text-sm text-green-600">You're ready to start donating on SevaStream</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Connection Button */}
      <button
        onClick={handleConnect}
        disabled={isConnecting || !isSDKAvailable}
        className={`w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
          isConnecting
            ? 'bg-blue-100 text-blue-600 cursor-not-allowed'
            : isSDKAvailable
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 shadow-lg hover:shadow-xl'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isConnecting ? (
          <>
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Connecting to Coinbase Wallet...</span>
          </>
        ) : (
          <>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span>Connect Coinbase Wallet</span>
          </>
        )}
      </button>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="text-red-500 text-lg">⚠️</div>
            <div>
              <h4 className="font-bold text-red-800 mb-1">Connection Failed</h4>
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={handleConnect}
                className="mt-2 text-sm text-red-700 font-medium hover:text-red-800 underline"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Install Wallet Prompt */}
      {!isSDKAvailable && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="text-yellow-600 text-lg">📱</div>
            <div className="flex-1">
              <h4 className="font-bold text-yellow-800 mb-1">Coinbase Wallet Required</h4>
              <p className="text-sm text-yellow-700 mb-3">
                To use SevaStream, you need to install Coinbase Wallet first.
              </p>
              <button
                onClick={openCoinbaseWallet}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors"
              >
                Install Coinbase Wallet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl mb-2">🔒</div>
          <h4 className="font-bold text-blue-800 mb-1">Secure</h4>
          <p className="text-sm text-blue-600">Bank-grade security for your donations</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl mb-2">⚡</div>
          <h4 className="font-bold text-green-800 mb-1">Fast</h4>
          <p className="text-sm text-green-600">Instant transactions and confirmations</p>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl mb-2">🌍</div>
          <h4 className="font-bold text-purple-800 mb-1">Global</h4>
          <p className="text-sm text-purple-600">Support causes worldwide</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4">
        <h4 className="font-bold text-gray-800 mb-2">How to Connect:</h4>
        <ol className="text-sm text-gray-600 space-y-1">
          <li>1. Click "Connect Coinbase Wallet" above</li>
          <li>2. Approve the connection in your Coinbase Wallet</li>
          <li>3. You're ready to start donating on SevaStream!</li>
        </ol>
      </div>
    </div>
  )
}

export default CoinbaseWalletConnector
