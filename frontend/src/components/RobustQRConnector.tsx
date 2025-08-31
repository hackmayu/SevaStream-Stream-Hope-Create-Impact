import React, { useState, useEffect } from 'react'
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk'

interface RobustQRConnectorProps {
  onConnect?: (address: string) => void
  onError?: (error: string) => void
}

const RobustQRConnector: React.FC<RobustQRConnectorProps> = ({
  onConnect,
  onError
}) => {
  const [status, setStatus] = useState<string>('Ready to connect')
  const [qrCodeImage, setQrCodeImage] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [connectionUrl, setConnectionUrl] = useState<string>('')
  const [coinbaseWallet, setCoinbaseWallet] = useState<CoinbaseWalletSDK | null>(null)

  // Initialize Coinbase Wallet SDK
  useEffect(() => {
    try {
      const wallet = new CoinbaseWalletSDK({
        appName: 'SevaStream Charity',
        appLogoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMSA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDMgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjMDA2NkNDIi8+Cjwvc3ZnPgo=',
        darkMode: false,
        reloadOnDisconnect: true
      })
      setCoinbaseWallet(wallet)
      setStatus('Coinbase Wallet SDK initialized')
    } catch (error) {
      console.error('SDK initialization error:', error)
      setStatus('❌ Failed to initialize Coinbase SDK')
    }
  }, [])

  // Generate QR code using multiple methods
  const generateQRCode = async () => {
    if (!coinbaseWallet) {
      setStatus('❌ Coinbase SDK not initialized')
      return
    }

    try {
      setIsGenerating(true)
      setStatus('🔄 Step 1: Setting up Coinbase SDK...')

      // Method 1: Create Web3 provider
      const provider = coinbaseWallet.makeWeb3Provider(
        'https://polygon-rpc.com',
        137
      )

      setStatus('🔄 Step 2: Generating connection URL...')

      // Method 2: Generate connection URL
      const baseUrl = window.location.origin
      const dappUrl = `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(baseUrl)}`
      setConnectionUrl(dappUrl)

      setStatus('🔄 Step 3: Creating QR code...')

      // Method 3: Try multiple QR code generation APIs with better error handling
      const qrApis = [
        {
          url: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&format=png&ecc=M&data=${encodeURIComponent(dappUrl)}`,
          name: 'QR Server API'
        },
        {
          url: `https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=${encodeURIComponent(dappUrl)}&chld=M|0`,
          name: 'Google Charts API'
        },
        {
          url: `https://quickchart.io/qr?text=${encodeURIComponent(dappUrl)}&size=250`,
          name: 'QuickChart API'
        }
      ]

      let qrGenerated = false
      
      // Try each API until one works
      for (let i = 0; i < qrApis.length; i++) {
        try {
          setStatus(`🔄 Trying ${qrApis[i].name}...`)
          
          // Test if the URL is accessible
          const response = await fetch(qrApis[i].url, { 
            method: 'HEAD',
            mode: 'no-cors'
          })
          
          // If we get here, the URL is accessible
          setQrCodeImage(qrApis[i].url)
          setStatus(`✅ QR code generated using ${qrApis[i].name}!`)
          qrGenerated = true
          break
          
        } catch (apiError) {
          console.log(`${qrApis[i].name} failed:`, apiError)
          setStatus(`⚠️ ${qrApis[i].name} failed, trying next...`)
        }
      }

      if (!qrGenerated) {
        // Fallback: Use the first API anyway (it might still work)
        setQrCodeImage(qrApis[0].url)
        setStatus('⚠️ QR APIs uncertain - trying fallback method')
      }

      // Try automatic connection for desktop users
      setTimeout(async () => {
        try {
          setStatus('🔄 Attempting automatic connection...')
          const accounts = await provider.request({
            method: 'eth_requestAccounts'
          }) as string[]

          if (accounts && accounts.length > 0) {
            setStatus(`✅ Connected! ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`)
            onConnect?.(accounts[0])
          }
        } catch (autoError) {
          setStatus('📱 Scan QR with Coinbase Wallet mobile app')
        }
      }, 3000)

    } catch (error: any) {
      console.error('QR generation error:', error)
      setStatus(`❌ Error: ${error.message}`)
      onError?.(error.message)
    } finally {
      setIsGenerating(false)
    }
  }

  // Open mobile wallet directly
  const openMobileWallet = () => {
    if (connectionUrl) {
      // Try multiple methods to open the wallet
      const methods = [
        () => window.open(connectionUrl, '_blank'),
        () => window.open(`coinbase-wallet://dapp?url=${encodeURIComponent(window.location.origin)}`, '_blank'),
        () => window.location.href = connectionUrl
      ]

      methods.forEach((method, index) => {
        setTimeout(method, index * 1000)
      })

      setStatus('🚀 Opening Coinbase Wallet app...')
    } else {
      setStatus('⚠️ Please generate QR code first')
    }
  }

  // Connect via browser extension
  const connectBrowserWallet = async () => {
    try {
      setStatus('🔌 Connecting via browser...')

      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        }) as string[]

        if (accounts && accounts.length > 0) {
          // Switch to Polygon network
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x89' }],
            })
          } catch (switchError: any) {
            if (switchError.code === 4902) {
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

          setStatus(`✅ Browser wallet connected! ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`)
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
      setStatus('📋 Connection URL copied!')
    }
  }

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl shadow-xl p-6 border border-gray-200">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-3 flex items-center justify-center">
          <span className="text-white text-2xl">🔗</span>
        </div>
        <h2 className="text-xl font-bold text-gray-800">Coinbase Wallet Connection</h2>
        <p className="text-sm text-gray-600 mt-1">Multiple connection methods available</p>
      </div>

      {/* Status */}
      <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200 shadow-sm">
        <p className="text-sm text-center font-medium text-gray-700">{status}</p>
      </div>

      {/* QR Code Display */}
      <div className="bg-white rounded-lg p-4 mb-4 text-center border border-gray-200 shadow-sm">
        {qrCodeImage ? (
          <div>
            <img
              src={qrCodeImage}
              alt="Coinbase Wallet QR Code"
              className="mx-auto rounded-lg border-2 border-gray-300"
              style={{ width: '200px', height: '200px' }}
              onError={() => {
                setStatus('❌ QR image failed to load')
                setQrCodeImage('')
              }}
              onLoad={() => {
                setStatus('✅ QR code ready - scan with mobile app!')
              }}
            />
            <p className="text-xs text-gray-500 mt-2">Scan with Coinbase Wallet app</p>
          </div>
        ) : (
          <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl mb-2">📱</div>
              <div className="text-sm text-gray-500">
                {isGenerating ? 'Generating...' : 'Click Generate QR'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={generateQRCode}
          disabled={isGenerating || !coinbaseWallet}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {isGenerating ? '⏳ Generating QR...' : '📱 Generate QR Code'}
        </button>

        <button
          onClick={openMobileWallet}
          disabled={!connectionUrl}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          🚀 Open Mobile Wallet
        </button>

        <button
          onClick={connectBrowserWallet}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-md"
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
              onClick={copyUrl}
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
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h4 className="text-sm font-medium text-yellow-800 mb-2">💡 Having trouble?</h4>
        <ul className="text-xs text-yellow-700 space-y-1">
          <li>• Try refreshing the page and generating QR again</li>
          <li>• Use "Open Mobile Wallet" if QR doesn't work</li>
          <li>• Install browser extension for desktop use</li>
          <li>• Make sure Coinbase Wallet app is updated</li>
        </ul>
      </div>

      {/* Download Link */}
      <div className="mt-4 text-center">
        <a
          href="https://www.coinbase.com/wallet"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          Don't have Coinbase Wallet? Download here
        </a>
      </div>
    </div>
  )
}

export default RobustQRConnector
