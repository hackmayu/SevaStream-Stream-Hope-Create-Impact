import React, { useState } from 'react'
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk'

interface NoRecoveryQRConnectorProps {
  onConnect?: (address: string) => void
  onError?: (error: string) => void
}

const NoRecoveryQRConnector: React.FC<NoRecoveryQRConnectorProps> = ({
  onConnect,
  onError
}) => {
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<string>('')
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [connectionUrl, setConnectionUrl] = useState<string>('')

  // Generate QR code using reliable public API
  const generateQR = (data: string): string => {
    const encodedData = encodeURIComponent(data)
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&format=png&data=${encodedData}`
  }

  const connectWallet = async () => {
    try {
      setIsConnecting(true)
      setConnectionStatus('🔄 Initializing wallet connection...')

      // Simple Coinbase Wallet setup - NO recovery phrase needed
      const coinbaseWallet = new CoinbaseWalletSDK({
        appName: 'SevaStream - Charity Donations',
        appLogoUrl: window.location.origin + '/favicon.ico',
        darkMode: false,
        reloadOnDisconnect: true
      })

      setConnectionStatus('🌐 Setting up Polygon network...')

      // Create Web3 provider for Polygon
      const provider = coinbaseWallet.makeWeb3Provider(
        'https://polygon-rpc.com',
        137
      )

      setConnectionStatus('📱 Creating mobile connection...')

      // Generate mobile wallet URL
      const baseUrl = window.location.origin
      const walletUrl = `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(baseUrl)}`
      
      setConnectionUrl(walletUrl)
      
      // Generate QR code
      const qrUrl = generateQR(walletUrl)
      setQrCodeUrl(qrUrl)

      setConnectionStatus('✅ QR Code ready! Scan with Coinbase Wallet mobile app')

      // Try automatic connection after a delay (for desktop)
      setTimeout(async () => {
        try {
          setConnectionStatus('🔄 Checking for automatic connection...')
          
          const accounts = await provider.request({
            method: 'eth_requestAccounts'
          }) as string[]

          if (accounts && accounts.length > 0) {
            setConnectionStatus(`✅ Successfully connected! Address: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`)
            onConnect?.(accounts[0])
          }
        } catch (autoError) {
          console.log('Auto-connect skipped (normal for mobile flow):', autoError)
          setConnectionStatus('📱 Please scan QR code or use mobile button')
        }
      }, 3000)

    } catch (error: any) {
      console.error('Connection setup error:', error)
      const message = error.message || 'Failed to set up wallet connection'
      setConnectionStatus(`❌ Error: ${message}`)
      onError?.(message)
    } finally {
      setIsConnecting(false)
    }
  }

  const openInMobileWallet = () => {
    if (connectionUrl) {
      // Try multiple methods to open mobile wallet
      const urls = [
        connectionUrl,
        `coinbase-wallet://dapp?url=${encodeURIComponent(window.location.origin)}`,
        `https://wallet.coinbase.com/dapp?url=${encodeURIComponent(window.location.origin)}`
      ]

      urls.forEach((url, index) => {
        setTimeout(() => {
          window.open(url, '_blank')
        }, index * 500)
      })

      setConnectionStatus('🚀 Opening Coinbase Wallet app...')
    } else {
      setConnectionStatus('⚠️ Please generate QR code first')
    }
  }

  const connectBrowserWallet = async () => {
    try {
      setConnectionStatus('🔌 Connecting to browser wallet...')

      if (window.ethereum) {
        // Try connecting to any available browser wallet
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        }) as string[]

        if (accounts && accounts.length > 0) {
          // Switch to Polygon if needed
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x89' }], // Polygon
            })
          } catch (switchError: any) {
            if (switchError.code === 4902) {
              // Add Polygon network
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x89',
                  chainName: 'Polygon Mainnet',
                  nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
                  rpcUrls: ['https://polygon-rpc.com/'],
                  blockExplorerUrls: ['https://polygonscan.com/']
                }]
              })
            }
          }

          setConnectionStatus(`✅ Browser wallet connected! Address: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`)
          onConnect?.(accounts[0])
        }
      } else {
        setConnectionStatus('❌ No browser wallet found. Please install MetaMask or Coinbase Wallet extension.')
        onError?.('No browser wallet extension detected')
      }
    } catch (error: any) {
      setConnectionStatus(`❌ Browser connection failed: ${error.message}`)
      onError?.(error.message)
    }
  }

  const copyConnectionUrl = () => {
    if (connectionUrl) {
      navigator.clipboard.writeText(connectionUrl)
      setConnectionStatus('📋 Connection URL copied to clipboard!')
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-6 max-w-md mx-auto border border-gray-200">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          🔗 Connect Wallet
        </h3>
        <p className="text-gray-600 text-sm">
          <strong>No recovery phrase needed!</strong> Multiple connection options available.
        </p>
      </div>

      {/* QR Code Display */}
      <div className="bg-white rounded-lg p-4 mb-4 text-center shadow-inner">
        {qrCodeUrl ? (
          <>
            <img 
              src={qrCodeUrl}
              alt="Wallet Connection QR Code"
              className="mx-auto mb-2 border-2 border-gray-200 rounded"
              style={{ width: '200px', height: '200px' }}
              onError={() => {
                setConnectionStatus('❌ QR code failed to load - try direct connection')
              }}
            />
            <p className="text-xs text-gray-500">
              📱 Scan with Coinbase Wallet mobile app
            </p>
          </>
        ) : (
          <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <span className="text-gray-500 text-center">
              <div className="text-2xl mb-2">📱</div>
              <div className="text-sm">Click "Generate QR Code" to start</div>
            </span>
          </div>
        )}
      </div>

      {/* Status Display */}
      {connectionStatus && (
        <div className="bg-white border border-blue-200 rounded-lg p-3 mb-4 shadow-sm">
          <p className="text-sm text-blue-800 text-center">{connectionStatus}</p>
        </div>
      )}

      {/* Connection Buttons */}
      <div className="space-y-3">
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
        >
          {isConnecting ? '⏳ Setting up...' : '📱 Generate QR Code'}
        </button>

        <button
          onClick={openInMobileWallet}
          disabled={!connectionUrl}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
        >
          🚀 Open Mobile Wallet
        </button>

        <button
          onClick={connectBrowserWallet}
          className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-700 hover:to-orange-800 transition-all duration-200 shadow-md"
        >
          🔌 Browser Extension
        </button>
      </div>

      {/* Connection URL */}
      {connectionUrl && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-700">Connection URL:</span>
            <button
              onClick={copyConnectionUrl}
              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
            >
              📋 Copy
            </button>
          </div>
          <p className="text-xs text-gray-600 break-all font-mono bg-white p-2 rounded border">
            {connectionUrl}
          </p>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
        <h4 className="font-medium text-gray-800 mb-2 text-sm">🆘 Need Help?</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <p><strong>Mobile:</strong> Generate QR → Open Coinbase Wallet → Scan</p>
          <p><strong>Desktop:</strong> Use Browser Extension button</p>
          <p><strong>No Wallet:</strong> Download Coinbase Wallet app first</p>
          <p><strong>Issues:</strong> Try refreshing page or different browser</p>
        </div>
      </div>

      {/* Emergency Fallback */}
      <div className="mt-4 text-center">
        <a
          href="https://wallet.coinbase.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          Download Coinbase Wallet
        </a>
      </div>
    </div>
  )
}

export default NoRecoveryQRConnector
