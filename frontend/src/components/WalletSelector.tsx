import React, { useState } from 'react'
import { useWallet } from '../hooks/useWallet'

interface WalletSelectorProps {
  isOpen: boolean
  onClose: () => void
  onWalletConnect: (walletType: 'coinbase') => void
}

const WalletSelector: React.FC<WalletSelectorProps> = ({
  isOpen,
  onClose,
  onWalletConnect
}) => {
  const [isConnecting, setIsConnecting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { connectWallet } = useWallet()

  const handleWalletSelect = async (walletType: 'coinbase') => {
    setIsConnecting(walletType)
    setError(null)
    
    try {
      console.log('Attempting to connect wallet:', walletType)
      const result = await connectWallet()
      console.log('Connection result:', result)
      
      if (result?.success) {
        console.log('Wallet connected successfully')
        onWalletConnect(walletType)
        onClose()
      } else {
        const errorMessage = result?.error || 'Failed to connect wallet'
        console.error('Connection failed:', errorMessage)
        setError(errorMessage)
      }
    } catch (error) {
      console.error('Wallet connection error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet. Please try again.'
      setError(errorMessage)
    } finally {
      setIsConnecting(null)
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="relative bg-white/95 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md mx-4 shadow-2xl border border-gray-200/50 transform transition-all duration-300 scale-100 hover:scale-105">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">🔐 Connect Wallet</h2>
          <p className="text-gray-600">Choose your preferred wallet to continue</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center space-x-2">
              <span className="text-red-500">❌</span>
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Wallet options */}
        <div className="space-y-4">
          {/* Coinbase Wallet Option */}
          <button
            onClick={() => handleWalletSelect('coinbase')}
            disabled={isConnecting !== null}
            className={`w-full p-6 border-2 rounded-2xl flex items-center space-x-4 transition-all duration-300 transform hover:scale-105 ${
              isConnecting === 'coinbase'
                ? 'border-blue-500 bg-blue-50 shadow-lg'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 hover:shadow-lg'
            } ${isConnecting !== null ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 7.568l-2.88 2.88c-.39.39-1.024.39-1.414 0l-2.88-2.88c-.39-.39-.39-1.024 0-1.414l2.88-2.88c.39-.39 1.024-.39 1.414 0l2.88 2.88c.39.39.39 1.024 0 1.414z"/>
              </svg>
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold text-gray-900 text-lg mb-1">💙 Coinbase Wallet</h3>
              <p className="text-sm text-gray-600">
                {isConnecting === 'coinbase' ? '🔄 Connecting...' : '🚀 Secure & Easy Connection'}
              </p>
              {isConnecting === 'coinbase' && (
                <p className="text-xs text-blue-600 mt-1 font-medium">Please check your wallet for connection request</p>
              )}
            </div>
            {isConnecting === 'coinbase' ? (
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            )}
          </button>

          {/* Debug info in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs">
              <p className="font-medium text-gray-700 mb-1">Debug Info:</p>
              <p className="text-gray-600">Window.ethereum: {typeof window !== 'undefined' && window.ethereum ? 'Available' : 'Not found'}</p>
              <p className="text-gray-600">Connecting: {isConnecting || 'No'}</p>
              {error && <p className="text-red-600">Error: {error}</p>}
            </div>
          )}
        </div>

        {/* Info sections */}
        <div className="mt-8 space-y-4">
          {/* Security notice */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="text-blue-600 text-lg">🛡️</div>
              <div className="text-sm text-blue-800">
                <p className="font-bold mb-1">Secure Connection</p>
                <p>Your wallet information is never stored on our servers. All transactions are secured by blockchain technology.</p>
              </div>
            </div>
          </div>

          {/* Help section */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="text-gray-600 text-lg">❓</div>
              <div className="text-sm text-gray-700">
                <p className="font-bold mb-1">New to Crypto Wallets?</p>
                <p className="mb-2">Wallets allow you to send, receive, and store digital assets securely. Choose Coinbase Wallet to get started with SevaStream donations.</p>
                {typeof window !== 'undefined' && !window.ethereum && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="font-medium text-yellow-800 mb-2">⚠️ No Wallet Detected</p>
                    <p className="text-yellow-700 text-xs mb-2">You need to install a crypto wallet first:</p>
                    <div className="space-y-1">
                      <a 
                        href="https://www.coinbase.com/wallet" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        📱 Install Coinbase Wallet →
                      </a>
                    </div>
                    <p className="text-yellow-600 text-xs mt-2">After installation, refresh this page and try connecting again.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Terms notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            By connecting a wallet, you agree to our <span className="font-semibold">Terms of Service</span> and <span className="font-semibold">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default WalletSelector
