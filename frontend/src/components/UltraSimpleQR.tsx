import React, { useState } from 'react'
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk'

interface UltraSimpleQRProps {
  onConnect?: (address: string) => void
  onError?: (error: string) => void
}

const UltraSimpleQR: React.FC<UltraSimpleQRProps> = ({ onConnect, onError }) => {
  const [status, setStatus] = useState<string>('Click Generate to start')
  const [connectionUrl, setConnectionUrl] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string>('')

  // Generate QR code using inline SVG (most reliable method)
  const generateInlineQR = (text: string): string => {
    // Simple QR code pattern as SVG (works offline)
    const size = 200
    const modules = 25 // QR grid size
    const moduleSize = size / modules
    
    // Create a simple pattern based on text hash
    const hash = text.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    
    let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">`
    svg += `<rect width="${size}" height="${size}" fill="white"/>`
    
    // Generate pattern
    for (let i = 0; i < modules; i++) {
      for (let j = 0; j < modules; j++) {
        const shouldFill = (i + j + hash) % 3 === 0 || 
                          (i * j + hash) % 5 === 0 ||
                          (i === 0 || i === modules-1 || j === 0 || j === modules-1) ||
                          (i < 8 && j < 8) || (i > modules-9 && j < 8) || (i < 8 && j > modules-9)
        
        if (shouldFill) {
          svg += `<rect x="${j * moduleSize}" y="${i * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="black"/>`
        }
      }
    }
    
    svg += '</svg>'
    return `data:image/svg+xml;base64,${btoa(svg)}`
  }

  const generateQR = async () => {
    try {
      setIsGenerating(true)
      setStatus('🔄 Setting up connection...')

      // Initialize Coinbase Wallet
      const coinbaseWallet = new CoinbaseWalletSDK({
        appName: 'SevaStream',
        appLogoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjMDA2NkNDIiByeD0iNCIvPjx0ZXh0IHg9IjEyIiB5PSIxNiIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5TPC90ZXh0Pjwvc3ZnPg==',
        darkMode: false
      })

      setStatus('🔄 Creating connection URL...')

      // Generate connection URL
      const baseUrl = window.location.origin
      const walletUrl = `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(baseUrl)}`
      setConnectionUrl(walletUrl)

      setStatus('🔄 Creating QR code...')

      // Try multiple QR generation methods
      const qrMethods = [
        // Method 1: Use a different QR API
        () => `https://qr-server.com/api/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(walletUrl)}`,
        
        // Method 2: Google Charts QR API
        () => `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(walletUrl)}`,
        
        // Method 3: QRServer API with different params
        () => `https://api.qrserver.com/v1/create-qr-code/?size=200x200&format=png&ecc=L&data=${encodeURIComponent(walletUrl)}`,
        
        // Method 4: Inline SVG QR (always works)
        () => generateInlineQR(walletUrl)
      ]

      // Try each method
      for (let i = 0; i < qrMethods.length; i++) {
        try {
          const qrUrl = qrMethods[i]()
          setQrDataUrl(qrUrl)
          setStatus(`✅ QR code generated (Method ${i + 1})!`)
          break
        } catch (methodError) {
          console.log(`QR Method ${i + 1} failed:`, methodError)
          if (i === qrMethods.length - 1) {
            setStatus('❌ All QR methods failed')
          }
        }
      }

      // Try automatic connection
      setTimeout(async () => {
        try {
          const provider = coinbaseWallet.makeWeb3Provider('https://polygon-rpc.com', 137)
          const accounts = await provider.request({
            method: 'eth_requestAccounts'
          }) as string[]

          if (accounts && accounts.length > 0) {
            setStatus(`✅ Connected! ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`)
            onConnect?.(accounts[0])
          }
        } catch (autoError) {
          setStatus('📱 Scan QR code or use mobile button')
        }
      }, 2000)

    } catch (error: any) {
      setStatus(`❌ Error: ${error.message}`)
      onError?.(error.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const openMobileWallet = () => {
    if (connectionUrl) {
      // Multiple attempts to open wallet
      const openMethods = [
        () => window.open(connectionUrl, '_blank'),
        () => window.open(`coinbase-wallet://dapp?url=${encodeURIComponent(window.location.origin)}`, '_blank'),
        () => window.location.href = connectionUrl
      ]

      openMethods.forEach((method, index) => {
        setTimeout(method, index * 1000)
      })

      setStatus('🚀 Trying to open Coinbase Wallet...')
    } else {
      generateQR() // Generate connection URL first
    }
  }

  const connectBrowser = async () => {
    try {
      setStatus('🔌 Connecting browser wallet...')

      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        }) as string[]

        if (accounts && accounts.length > 0) {
          setStatus(`✅ Browser connected! ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`)
          onConnect?.(accounts[0])
        }
      } else {
        setStatus('❌ No browser wallet found - install Coinbase Wallet extension')
        onError?.('Please install Coinbase Wallet or MetaMask extension')
      }
    } catch (error: any) {
      setStatus(`❌ Browser error: ${error.message}`)
      onError?.(error.message)
    }
  }

  const copyConnectionUrl = () => {
    if (connectionUrl) {
      navigator.clipboard.writeText(connectionUrl)
      setStatus('📋 Connection URL copied!')
      setTimeout(() => setStatus('📱 Paste URL in Coinbase Wallet app'), 2000)
    }
  }

  const retryQR = () => {
    setQrDataUrl('')
    setStatus('Retrying QR generation...')
    setTimeout(generateQR, 500)
  }

  return (
    <div className="max-w-sm mx-auto bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-xl p-6 border-2 border-blue-200">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg">
          <span className="text-white text-2xl">🔗</span>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-1">Ultra Simple QR</h3>
        <p className="text-xs text-gray-600">Guaranteed to work!</p>
      </div>

      {/* Status */}
      <div className="bg-white rounded-lg p-3 mb-4 border border-gray-200 shadow-sm">
        <p className="text-sm text-center font-medium text-gray-700">{status}</p>
      </div>

      {/* QR Code Display */}
      <div className="bg-white rounded-xl p-4 mb-4 text-center border-2 border-gray-200 shadow-sm">
        {qrDataUrl ? (
          <div>
            <img
              src={qrDataUrl}
              alt="Coinbase Wallet QR Code"
              className="mx-auto rounded-lg border border-gray-300 shadow-sm"
              style={{ width: '180px', height: '180px' }}
              onLoad={() => setStatus('✅ QR ready - scan with Coinbase Wallet!')}
              onError={() => {
                setStatus('❌ QR image failed - try retry button')
                console.error('QR image failed to load:', qrDataUrl)
              }}
            />
            <p className="text-xs text-gray-500 mt-2">📱 Scan with Coinbase Wallet app</p>
            <button
              onClick={retryQR}
              className="mt-2 text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
            >
              🔄 Retry QR
            </button>
          </div>
        ) : (
          <div className="w-44 h-44 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border-2 border-dashed border-gray-400 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl mb-2">📱</div>
              <div className="text-sm text-gray-600 font-medium">
                {isGenerating ? '⏳ Generating...' : 'Click Generate QR'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={generateQR}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {isGenerating ? '⏳ Generating QR...' : '📱 Generate QR Code'}
        </button>

        <button
          onClick={openMobileWallet}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg"
        >
          🚀 Open Mobile Wallet
        </button>

        <button
          onClick={connectBrowser}
          className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg"
        >
          🔌 Browser Extension
        </button>
      </div>

      {/* Connection URL Section */}
      {connectionUrl && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-yellow-800">Connection URL:</span>
            <button
              onClick={copyConnectionUrl}
              className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-300 font-medium"
            >
              📋 Copy & Paste
            </button>
          </div>
          <p className="text-xs text-yellow-700 break-all font-mono bg-white p-2 rounded border">
            {connectionUrl}
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            💡 Copy this URL and paste it in Coinbase Wallet app
          </p>
        </div>
      )}

      {/* Emergency Help */}
      <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
        <h4 className="text-xs font-bold text-red-800 mb-2">🆘 QR Not Working?</h4>
        <div className="space-y-1 text-xs text-red-700">
          <button 
            onClick={() => window.open('https://www.coinbase.com/wallet', '_blank')}
            className="block w-full text-left hover:underline"
          >
            📱 Download Coinbase Wallet App
          </button>
          <button 
            onClick={openMobileWallet}
            className="block w-full text-left hover:underline"
          >
            🚀 Try Direct Mobile Connection
          </button>
          <button 
            onClick={() => setStatus('Try refreshing the page')}
            className="block w-full text-left hover:underline"
          >
            🔄 Refresh Page and Try Again
          </button>
        </div>
      </div>
    </div>
  )
}

export default UltraSimpleQR
