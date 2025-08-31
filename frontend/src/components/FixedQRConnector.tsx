import React, { useState, useEffect } from 'react'
import CoinbaseWalletSDK from '@coinbase/wallet-sdk'

interface FixedQRConnectorProps {
  onConnect?: (success: boolean) => void
}

const FixedQRConnector: React.FC<FixedQRConnectorProps> = ({ onConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionURI, setConnectionURI] = useState<string>('')
  const [showQRModal, setShowQRModal] = useState(false)

  // Initialize Coinbase Wallet SDK with correct settings for QR generation
  const initializeSDK = () => {
    const coinbaseWallet = new CoinbaseWalletSDK({
      appName: 'SevaStream',
      appLogoUrl: 'https://via.placeholder.com/128x128/4f46e5/ffffff?text=S', // Use a working logo URL
      darkMode: false,
      headlessMode: false, // Critical: must be false for QR modal
      enableMobileWalletLink: true,
      overrideIsMetaMask: false,
      overrideIsCoinbaseWallet: false
    })
    
    return coinbaseWallet
  }

  const connectWithProperQR = async () => {
    setIsConnecting(true)
    setShowQRModal(true)
    
    try {
      console.log('🔄 Initializing Coinbase Wallet SDK...')
      
      const coinbaseWallet = initializeSDK()
      
      console.log('🔄 Creating Web3 Provider...')
      
      // Create provider with Polygon network
      const ethereum = coinbaseWallet.makeWeb3Provider(
        'https://polygon-mainnet.g.alchemy.com/v2/demo',
        137
      )
      
      console.log('🔄 Requesting account access - QR should appear now...')
      
      // This should trigger the QR code modal
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      }) as string[]
      
      if (accounts && accounts.length > 0) {
        console.log('✅ Wallet connected successfully:', accounts[0])
        onConnect?.(true)
        setShowQRModal(false)
      }
      
    } catch (error: any) {
      console.error('❌ Connection failed:', error)
      
      if (error.code === 4001) {
        console.log('User rejected the connection')
      } else if (error.message?.includes('User denied')) {
        console.log('User denied the connection')
      } else {
        console.log('Connection error:', error.message)
      }
      
      onConnect?.(false)
      setShowQRModal(false)
    } finally {
      setIsConnecting(false)
    }
  }

  // Alternative method: Generate QR manually using WalletConnect-style approach
  const generateManualQR = async () => {
    try {
      // This is a simplified QR generation - in a real app you'd use WalletConnect
      const connectionData = {
        name: 'SevaStream',
        url: window.location.origin,
        icon: 'https://via.placeholder.com/128x128/4f46e5/ffffff?text=S'
      }
      
      const qrData = `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(window.location.href)}&name=${encodeURIComponent(connectionData.name)}`
      
      // For demo purposes, we'll show the connection URL
      setConnectionURI(qrData)
      
      console.log('📱 Manual QR connection URL generated:', qrData)
      
      // In a real implementation, you'd generate an actual QR code image here
      // For now, we'll show the URL and instructions
      
    } catch (error) {
      console.error('Error generating manual QR:', error)
    }
  }

  const openMobileApp = () => {
    const mobileURL = `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(window.location.href)}`
    
    // For mobile devices, open directly
    if (/Mobi|Android/i.test(navigator.userAgent)) {
      window.location.href = mobileURL
    } else {
      // For desktop, open in new tab
      window.open(mobileURL, '_blank')
    }
  }

  useEffect(() => {
    generateManualQR()
  }, [])

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-200">
      <div className="text-center mb-6">
        <div className="text-4xl mb-3">📱</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Fixed QR Code Connection
        </h3>
        <p className="text-gray-600 text-sm">
          Addresses the missing QR code issue
        </p>
      </div>

      <div className="space-y-4">
        {/* Method 1: SDK QR Modal */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-bold text-blue-800 mb-2">Method 1: Coinbase SDK Modal</h4>
          <button
            onClick={connectWithProperQR}
            disabled={isConnecting}
            className={`w-full px-4 py-3 rounded-lg font-medium transition-all ${
              isConnecting
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isConnecting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Opening QR Modal...</span>
              </div>
            ) : (
              'Trigger Coinbase QR Modal'
            )}
          </button>
          
          {showQRModal && (
            <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-200">
              <p className="text-yellow-800 text-sm">
                📱 QR Modal should be open - look for a popup window or overlay
              </p>
            </div>
          )}
        </div>

        {/* Method 2: Direct Mobile Link */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-bold text-green-800 mb-2">Method 2: Direct Mobile Link</h4>
          <button
            onClick={openMobileApp}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all"
          >
            📱 Open Coinbase Wallet App
          </button>
          
          {connectionURI && (
            <div className="mt-3">
              <p className="text-green-700 text-xs mb-2">Connection URL:</p>
              <div className="bg-white p-2 rounded border text-xs font-mono break-all">
                {connectionURI}
              </div>
            </div>
          )}
        </div>

        {/* Method 3: Manual Instructions */}
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h4 className="font-bold text-purple-800 mb-2">Method 3: Manual Steps</h4>
          <div className="text-sm text-purple-700 space-y-2">
            <div><strong>Desktop:</strong></div>
            <ol className="list-decimal list-inside ml-2 space-y-1">
              <li>Click "Trigger Coinbase QR Modal" above</li>
              <li>Look for popup window or overlay</li>
              <li>If no QR appears, check popup blockers</li>
              <li>Scan QR with Coinbase Wallet mobile app</li>
            </ol>
            
            <div><strong>Mobile:</strong></div>
            <ol className="list-decimal list-inside ml-2 space-y-1">
              <li>Click "Open Coinbase Wallet App" above</li>
              <li>App should open automatically</li>
              <li>Approve the connection in the app</li>
            </ol>
          </div>
        </div>

        {/* Troubleshooting */}
        <details className="bg-gray-50 p-4 rounded-lg border">
          <summary className="font-bold text-gray-800 cursor-pointer">
            🔧 Still No QR Code?
          </summary>
          <div className="mt-3 text-sm text-gray-600 space-y-2">
            <div><strong>Common Fixes:</strong></div>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li><strong>Popup Blockers:</strong> Disable for this site</li>
              <li><strong>Browser Extensions:</strong> Try in incognito/private mode</li>
              <li><strong>Different Browser:</strong> Try Chrome or Firefox</li>
              <li><strong>Update SDK:</strong> Make sure Coinbase SDK is latest version</li>
              <li><strong>Use Extension:</strong> Install Coinbase Wallet browser extension instead</li>
            </ul>
            
            <div className="mt-3"><strong>Alternative Solutions:</strong></div>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Install Coinbase Wallet browser extension</li>
              <li>Use MetaMask with WalletConnect</li>
              <li>Use the direct mobile app link above</li>
            </ul>
          </div>
        </details>

        {/* Debug Info */}
        <div className="bg-gray-100 p-3 rounded text-xs">
          <strong>Debug Info:</strong>
          <div>User Agent: {navigator.userAgent.substring(0, 50)}...</div>
          <div>Has Ethereum: {typeof window.ethereum !== 'undefined' ? 'Yes' : 'No'}</div>
          <div>Provider: {window.ethereum?.constructor?.name || 'None'}</div>
        </div>
      </div>
    </div>
  )
}

export default FixedQRConnector
