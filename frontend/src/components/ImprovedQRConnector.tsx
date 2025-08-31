import React, { useState, useEffect } from 'react'
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk'

interface ImprovedQRConnectorProps {
  onConnect?: (address: string) => void
  onError?: (error: string) => void
}

const ImprovedQRConnector: React.FC<ImprovedQRConnectorProps> = ({
  onConnect,
  onError
}) => {
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<string>('')
  const [walletUrl, setWalletUrl] = useState<string>('')
  const [qrCodeData, setQrCodeData] = useState<string>('')

  // Create QR code using a simple base64 encoded data URL approach
  const generateQRCode = (data: string): string => {
    // Simple QR code generation using a public API (for demo purposes)
    // In production, you might want to use a proper QR code library
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`
  }

  const connectWithMobile = async () => {
    try {
      setIsConnecting(true)
      setConnectionStatus('Initializing Coinbase Wallet...')

      // Initialize Coinbase Wallet SDK without recovery phrase requirement
      const coinbaseWallet = new CoinbaseWalletSDK({
        appName: 'SevaStream - Charity Donations',
        appLogoUrl: 'https://i.imgur.com/Q2nOKx0.png', // Fallback logo
        darkMode: false,
        overrideIsMetaMask: false,
        overrideIsCoinbaseWallet: false,
        diagnosticLogger: console,
        reloadOnDisconnect: true
      })

      setConnectionStatus('Creating Web3 provider...')

      // Create provider for Polygon network
      const provider = coinbaseWallet.makeWeb3Provider(
        'https://polygon-mainnet.g.alchemy.com/v2/demo',
        137
      )

      setConnectionStatus('Generating connection URI...')

      // Generate mobile wallet connection URL
      const connectionData = {
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }]
      }

      // Create a connection URI for mobile wallets
      const mobileUri = `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(window.location.origin)}`
      setWalletUrl(mobileUri)

      // Generate QR code for the connection
      const qrUrl = generateQRCode(mobileUri)
      setQrCodeData(qrUrl)

      setConnectionStatus('QR Code generated! Scan with Coinbase Wallet mobile app')

      // Try to connect automatically if on desktop
      try {
        const accounts = await provider.request({
          method: 'eth_requestAccounts'
        }) as string[]

        if (accounts && accounts.length > 0) {
          setConnectionStatus(`Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`)
          onConnect?.(accounts[0])
        }
      } catch (providerError) {
        console.log('Provider connection failed, using mobile flow:', providerError)
        setConnectionStatus('Please scan QR code with Coinbase Wallet mobile app')
      }

    } catch (error: any) {
      console.error('Connection error:', error)
      const errorMessage = error.message || 'Failed to generate QR code'
      setConnectionStatus(`Error: ${errorMessage}`)
      onError?.(errorMessage)
    } finally {
      setIsConnecting(false)
    }
  }

  const connectDirectly = () => {
    // Direct deep link for mobile devices
    const deepLink = 'https://go.cb-w.com/dapp?cb_url=' + encodeURIComponent(window.location.origin)
    window.open(deepLink, '_blank')
    setConnectionStatus('Opening Coinbase Wallet app...')
  }

  const openCoinbaseWallet = () => {
    // Try different approaches for opening Coinbase Wallet
    const urls = [
      'coinbase://dapp?url=' + encodeURIComponent(window.location.origin),
      'https://wallet.coinbase.com/dapp?url=' + encodeURIComponent(window.location.origin),
      'https://go.cb-w.com/dapp?cb_url=' + encodeURIComponent(window.location.origin)
    ]

    urls.forEach((url, index) => {
      setTimeout(() => {
        window.open(url, '_blank')
      }, index * 1000)
    })

    setConnectionStatus('Trying to open Coinbase Wallet...')
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Connect Coinbase Wallet
        </h3>
        <p className="text-gray-600 text-sm">
          No recovery phrase needed - just scan or click to connect
        </p>
      </div>

      {/* QR Code Display */}
      {qrCodeData && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4 text-center">
          <img 
            src={qrCodeData} 
            alt="QR Code for Wallet Connection"
            className="mx-auto mb-2 border-2 border-gray-200 rounded"
            style={{ width: '200px', height: '200px' }}
            onError={(e) => {
              console.error('QR code failed to load')
              setConnectionStatus('QR code generation failed - use direct connection')
            }}
          />
          <p className="text-xs text-gray-500">
            Scan with Coinbase Wallet mobile app
          </p>
        </div>
      )}

      {/* Connection Status */}
      {connectionStatus && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">{connectionStatus}</p>
        </div>
      )}

      {/* Connection Buttons */}
      <div className="space-y-3">
        <button
          onClick={connectWithMobile}
          disabled={isConnecting}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isConnecting ? 'Generating QR Code...' : '📱 Generate QR Code'}
        </button>

        <button
          onClick={connectDirectly}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          🔗 Open Coinbase Wallet App
        </button>

        <button
          onClick={openCoinbaseWallet}
          className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors"
        >
          🚀 Try All Connection Methods
        </button>
      </div>

      {/* Manual Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">Alternative Methods:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Install Coinbase Wallet browser extension</li>
          <li>• Use MetaMask if you have it installed</li>
          <li>• Try WalletConnect compatible wallets</li>
        </ul>
      </div>

      {/* Connection URL Display */}
      {walletUrl && (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Connection URL:</p>
          <p className="text-xs text-gray-800 break-all font-mono">{walletUrl}</p>
          <button
            onClick={() => navigator.clipboard.writeText(walletUrl)}
            className="mt-2 text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
          >
            Copy URL
          </button>
        </div>
      )}
    </div>
  )
}

export default ImprovedQRConnector
