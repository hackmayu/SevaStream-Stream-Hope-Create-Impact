import React, { useState } from 'react'
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk'

interface SimpleFixedQRProps {
  onConnect?: (address: string) => void
  onError?: (error: string) => void
}

const SimpleFixedQR: React.FC<SimpleFixedQRProps> = ({ onConnect, onError }) => {
  const [status, setStatus] = useState<string>('Ready to connect')
  const [qrUrl, setQrUrl] = useState<string>('')
  const [connectionUrl, setConnectionUrl] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)

  const generateQR = async () => {
    try {
      setIsGenerating(true)
      setStatus('🔄 Setting up Coinbase Wallet...')

      // Simple SDK setup
      const coinbaseWallet = new CoinbaseWalletSDK({
        appName: 'SevaStream Charity Platform',
        appLogoUrl: window.location.origin + '/favicon.ico',
        darkMode: false
      })

      setStatus('🔄 Creating connection link...')

      // Generate mobile connection URL
      const baseUrl = window.location.origin
      const walletUrl = `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(baseUrl)}`
      setConnectionUrl(walletUrl)

      setStatus('🔄 Generating QR code...')

      // Use the most reliable QR API
      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&format=png&data=${encodeURIComponent(walletUrl)}`
      
      // Set the QR URL directly (most reliable method)
      setQrUrl(qrImageUrl)
      setStatus('✅ QR Code ready! Scan with Coinbase Wallet mobile app')

      // Try automatic connection after 3 seconds
      setTimeout(async () => {
        try {
          setStatus('🔄 Checking for automatic connection...')
          
          const provider = coinbaseWallet.makeWeb3Provider('https://polygon-rpc.com', 137)
          const accounts = await provider.request({
            method: 'eth_requestAccounts'
          }) as string[]

          if (accounts && accounts.length > 0) {
            setStatus(`✅ Successfully connected! ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`)
            onConnect?.(accounts[0])
          }
        } catch (autoError) {
          setStatus('📱 Please scan QR code with Coinbase Wallet app')
        }
      }, 3000)

    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`)
      onError?.(error.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const openMobileWallet = () => {
    if (connectionUrl) {
      window.open(connectionUrl, '_blank')
      setStatus('🚀 Opening Coinbase Wallet app...')
    } else {
      setStatus('⚠️ Please generate QR code first')
    }
  }

  const connectBrowser = async () => {
    try {
      setStatus('🔌 Connecting via browser...')

      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        }) as string[]

        if (accounts && accounts.length > 0) {
          setStatus(`✅ Browser connected! ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`)
          onConnect?.(accounts[0])
        }
      } else {
        setStatus('❌ No browser wallet found')
        onError?.('Please install Coinbase Wallet or MetaMask extension')
      }
    } catch (error: any) {
      setStatus(`❌ Browser connection failed: ${error.message}`)
      onError?.(error.message)
    }
  }

  const copyUrl = () => {
    if (connectionUrl) {
      navigator.clipboard.writeText(connectionUrl)
      setStatus('📋 Connection URL copied to clipboard!')
    }
  }

  return (
    <div className="max-w-sm mx-auto bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="w-12 h-12 bg-blue-600 rounded-full mx-auto mb-2 flex items-center justify-center">
          <span className="text-white text-xl">🔗</span>
        </div>
        <h3 className="text-lg font-bold text-gray-800">Connect Wallet</h3>
        <p className="text-xs text-gray-600">Fixed QR generation</p>
      </div>

      {/* Status */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4 text-center">
        <p className="text-sm text-gray-700">{status}</p>
      </div>

      {/* QR Code */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4 text-center">
        {qrUrl ? (
          <div>
            <img
              src={qrUrl}
              alt="Wallet QR Code"
              className="mx-auto rounded border-2 border-gray-300"
              style={{ width: '180px', height: '180px' }}
              onLoad={() => setStatus('✅ QR code loaded - ready to scan!')}
              onError={() => setStatus('❌ QR image failed to load')}
            />
            <p className="text-xs text-gray-500 mt-2">📱 Scan with wallet app</p>
          </div>
        ) : (
          <div className="w-44 h-44 mx-auto bg-gray-200 rounded border-2 border-dashed border-gray-400 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl mb-1">📱</div>
              <div className="text-xs text-gray-500">
                {isGenerating ? 'Generating...' : 'Click Generate QR'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="space-y-2">
        <button
          onClick={generateQR}
          disabled={isGenerating}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          {isGenerating ? '⏳ Generating...' : '📱 Generate QR Code'}
        </button>

        <button
          onClick={openMobileWallet}
          disabled={!connectionUrl}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
        >
          🚀 Open Mobile Wallet
        </button>

        <button
          onClick={connectBrowser}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          🔌 Browser Extension
        </button>
      </div>

      {/* Connection URL */}
      {connectionUrl && (
        <div className="mt-4 p-2 bg-gray-50 rounded border">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-700">Connection URL:</span>
            <button
              onClick={copyUrl}
              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
            >
              📋 Copy
            </button>
          </div>
          <p className="text-xs text-gray-600 break-all font-mono bg-white p-1 rounded">
            {connectionUrl}
          </p>
        </div>
      )}

      {/* Quick Help */}
      <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
        <h4 className="text-xs font-medium text-yellow-800 mb-1">💡 Quick Help:</h4>
        <ul className="text-xs text-yellow-700 space-y-0.5">
          <li>• Generate QR → Scan with Coinbase Wallet app</li>
          <li>• Use "Open Mobile Wallet" if QR fails</li>
          <li>• Try "Browser Extension" on desktop</li>
        </ul>
      </div>
    </div>
  )
}

export default SimpleFixedQR
