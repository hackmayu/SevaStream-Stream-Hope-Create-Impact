import React, { useState } from 'react'
import CoinbaseWalletSDK from '@coinbase/wallet-sdk'

interface MobileQRConnectorProps {
  onConnect?: (success: boolean) => void
  className?: string
}

const MobileQRConnector: React.FC<MobileQRConnectorProps> = ({ 
  onConnect, 
  className = '' 
}) => {
  const [isConnecting, setIsConnecting] = useState(false)
  const [showQR, setShowQR] = useState(false)

  // Initialize Coinbase Wallet SDK specifically for QR code generation
  const coinbaseWallet = new CoinbaseWalletSDK({
    appName: 'SevaStream - Charitable Giving Platform',
    appLogoUrl: 'https://sevastream.org/logo.png',
    darkMode: false,
    headlessMode: false, // Important: false to show QR modal
    enableMobileWalletLink: true // Enable mobile connections
  })

  const connectWithQR = async () => {
    setIsConnecting(true)
    setShowQR(true)
    
    try {
      // Create the provider - this should trigger QR code display
      const ethereum = coinbaseWallet.makeWeb3Provider(
        'https://polygon-mainnet.g.alchemy.com/v2/demo', 
        137
      )

      // Request connection - this will show the QR code modal
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      }) as string[]

      if (accounts && accounts.length > 0) {
        console.log('✅ Mobile wallet connected:', accounts[0])
        onConnect?.(true)
        setShowQR(false)
      }
    } catch (error: any) {
      console.error('❌ Mobile connection failed:', error)
      onConnect?.(false)
      setShowQR(false)
    } finally {
      setIsConnecting(false)
    }
  }

  const connectDirectly = () => {
    // For mobile browsers, try to open Coinbase Wallet app directly
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (isMobile) {
      // Deep link to Coinbase Wallet
      const deepLink = `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(window.location.href)}`
      window.open(deepLink, '_self')
    } else {
      // For desktop, use QR code method
      connectWithQR()
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
        <div className="text-center mb-4">
          <div className="text-4xl mb-3">📱</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Connect Mobile Wallet
          </h3>
          <p className="text-gray-600 text-sm">
            Connect using Coinbase Wallet mobile app
          </p>
        </div>

        {/* Connection Methods */}
        <div className="space-y-3">
          {/* QR Code Connection */}
          <button
            onClick={connectWithQR}
            disabled={isConnecting}
            className={`w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
              isConnecting
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
            }`}
          >
            {isConnecting ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Generating QR Code...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 12h.01M12 12v4.01M12 12H8.01M8 12h.01M8 12v4.01M8 12H4.01M4 12h.01M4 12v4.01" />
                </svg>
                <span>Show QR Code</span>
              </>
            )}
          </button>

          {/* Direct Mobile Connection */}
          <button
            onClick={connectDirectly}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-xl font-medium bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span>Open in Coinbase Wallet</span>
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-white rounded-lg border">
          <h4 className="font-bold text-gray-800 mb-2 text-sm">📋 Instructions:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li><strong>Desktop:</strong> Click "Show QR Code" and scan with Coinbase Wallet app</li>
            <li><strong>Mobile:</strong> Click "Open in Coinbase Wallet" for direct connection</li>
            <li><strong>No App?</strong> Download Coinbase Wallet from your app store first</li>
          </ul>
        </div>

        {/* QR Code Status */}
        {showQR && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-center">
              <div className="text-blue-600 text-2xl mb-2">📱</div>
              <p className="text-blue-800 font-medium text-sm">
                QR Code should appear in a popup window
              </p>
              <p className="text-blue-600 text-xs mt-1">
                Scan it with your Coinbase Wallet mobile app
              </p>
            </div>
          </div>
        )}

        {/* Troubleshooting */}
        <details className="mt-4">
          <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
            🔧 Troubleshooting QR Code Issues
          </summary>
          <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 space-y-2">
            <div><strong>QR code not showing?</strong></div>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Check if popup blockers are disabled</li>
              <li>Try refreshing the page and connecting again</li>
              <li>Make sure you have the latest Coinbase Wallet extension</li>
              <li>Try using the direct mobile connection instead</li>
            </ul>
            
            <div className="mt-3"><strong>Alternative methods:</strong></div>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Use WalletConnect for broader mobile wallet support</li>
              <li>Install Coinbase Wallet browser extension</li>
              <li>Use MetaMask mobile app with WalletConnect</li>
            </ul>
          </div>
        </details>
      </div>
    </div>
  )
}

export default MobileQRConnector
