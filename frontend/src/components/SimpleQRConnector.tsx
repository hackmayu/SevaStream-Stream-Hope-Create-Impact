import React, { useState, useRef } from 'react'
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk'

interface SimpleQRConnectorProps {
  onConnect?: (address: string) => void
  onError?: (error: string) => void
}

const SimpleQRConnector: React.FC<SimpleQRConnectorProps> = ({
  onConnect,
  onError
}) => {
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<string>('')
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateLocalQR = async (data: string) => {
    try {
      if (canvasRef.current) {
        // Generate QR code on canvas
        await QRCode.toCanvas(canvasRef.current, data, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        
        // Also generate data URL for backup
        const dataUrl = await QRCode.toDataURL(data, {
          width: 200,
          margin: 2
        })
        setQrDataUrl(dataUrl)
        
        return true
      }
      return false
    } catch (error) {
      console.error('QR generation error:', error)
      return false
    }
  }

  const connectWallet = async () => {
    try {
      setIsConnecting(true)
      setConnectionStatus('Setting up wallet connection...')

      // Simple connection approach - no recovery phrase needed
      const APP_NAME = 'SevaStream Charity Platform'
      const APP_LOGO_URL = 'https://via.placeholder.com/150/0066cc/ffffff?text=SevaStream'
      
      const coinbaseWallet = new CoinbaseWalletSDK({
        appName: APP_NAME,
        appLogoUrl: APP_LOGO_URL,
        darkMode: false
      })

      setConnectionStatus('Creating Polygon provider...')

      // Create provider for Polygon network
      const provider = coinbaseWallet.makeWeb3Provider(
        'https://polygon-rpc.com',
        137 // Polygon Chain ID
      )

      setConnectionStatus('Generating QR code...')

      // Generate connection URL for mobile wallets
      const baseUrl = window.location.origin
      const connectionUrl = `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(baseUrl)}`
      
      // Generate QR code locally
      const qrGenerated = await generateLocalQR(connectionUrl)
      
      if (qrGenerated) {
        setConnectionStatus('✅ QR Code ready! Scan with Coinbase Wallet app')
      } else {
        setConnectionStatus('⚠️ QR generation failed - using direct connection')
      }

      // Try automatic connection for desktop users
      setTimeout(async () => {
        try {
          setConnectionStatus('Attempting automatic connection...')
          
          const accounts = await provider.request({
            method: 'eth_requestAccounts'
          }) as string[]

          if (accounts && accounts.length > 0) {
            setConnectionStatus(`✅ Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`)
            onConnect?.(accounts[0])
          }
        } catch (autoConnectError) {
          console.log('Auto-connect failed (expected for mobile flow):', autoConnectError)
          setConnectionStatus('📱 Please scan QR code with your mobile wallet')
        }
      }, 2000)

    } catch (error: any) {
      console.error('Wallet connection error:', error)
      const errorMessage = error.message || 'Connection failed'
      setConnectionStatus(`❌ Error: ${errorMessage}`)
      onError?.(errorMessage)
    } finally {
      setIsConnecting(false)
    }
  }

  const openMobileWallet = () => {
    const mobileUrl = `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(window.location.origin)}`
    window.open(mobileUrl, '_blank')
    setConnectionStatus('🚀 Opening Coinbase Wallet...')
  }

  const tryBrowserExtension = async () => {
    try {
      if (window.ethereum) {
        setConnectionStatus('Connecting to browser extension...')
        
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        }) as string[]

        if (accounts && accounts.length > 0) {
          setConnectionStatus(`✅ Connected via extension: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`)
          onConnect?.(accounts[0])
        }
      } else {
        setConnectionStatus('❌ No browser extension found')
        onError?.('Please install Coinbase Wallet or MetaMask extension')
      }
    } catch (error: any) {
      setConnectionStatus('❌ Extension connection failed')
      onError?.(error.message)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto border border-gray-200">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          🔗 Connect Your Wallet
        </h3>
        <p className="text-gray-600 text-sm">
          Multiple connection methods - no recovery phrase required
        </p>
      </div>

      {/* QR Code Display */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4 text-center">
        <canvas
          ref={canvasRef}
          className="mx-auto mb-2 border-2 border-gray-200 rounded bg-white"
          style={{ display: qrDataUrl ? 'block' : 'none' }}
        />
        
        {qrDataUrl && (
          <img 
            src={qrDataUrl}
            alt="Wallet Connection QR Code"
            className="mx-auto mb-2 border-2 border-gray-200 rounded"
            style={{ width: '200px', height: '200px', display: 'none' }}
          />
        )}
        
        {!qrDataUrl && !isConnecting && (
          <div className="w-48 h-48 mx-auto bg-gray-200 rounded flex items-center justify-center">
            <span className="text-gray-500">Click Generate QR to start</span>
          </div>
        )}
        
        <p className="text-xs text-gray-500 mt-2">
          Scan with Coinbase Wallet or compatible mobile app
        </p>
      </div>

      {/* Status Display */}
      {connectionStatus && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800 text-center">{connectionStatus}</p>
        </div>
      )}

      {/* Connection Buttons */}
      <div className="space-y-3">
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isConnecting ? '⏳ Generating...' : '📱 Generate QR Code'}
        </button>

        <button
          onClick={openMobileWallet}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          🚀 Open Mobile Wallet
        </button>

        <button
          onClick={tryBrowserExtension}
          className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors"
        >
          🔌 Use Browser Extension
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm">
        <h4 className="font-medium text-gray-800 mb-2">📋 Instructions:</h4>
        <ul className="text-gray-600 space-y-1">
          <li>🔹 <strong>Mobile:</strong> Generate QR → Scan with wallet app</li>
          <li>🔹 <strong>Desktop:</strong> Use browser extension button</li>
          <li>🔹 <strong>No wallet?</strong> Download Coinbase Wallet app first</li>
        </ul>
      </div>

      {/* Troubleshooting */}
      <details className="mt-4">
        <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
          🔧 Troubleshooting
        </summary>
        <div className="mt-2 text-xs text-gray-500 space-y-1">
          <p>• QR not showing? Try refreshing the page</p>
          <p>• Can't scan? Use "Open Mobile Wallet" instead</p>
          <p>• No extension? Install Coinbase Wallet or MetaMask</p>
          <p>• Still stuck? Try connecting directly from your wallet app</p>
        </div>
      </details>
    </div>
  )
}

export default SimpleQRConnector
