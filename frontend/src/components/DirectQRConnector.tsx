import React, { useState, useCallback } from 'react'

interface DirectQRConnectorProps {
  onConnect?: (success: boolean, address?: string) => void
}

const DirectQRConnector: React.FC<DirectQRConnectorProps> = ({ onConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStep, setConnectionStep] = useState<'idle' | 'connecting' | 'qr-shown' | 'connected'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const connectWallet = useCallback(async () => {
    setIsConnecting(true)
    setConnectionStep('connecting')
    setErrorMessage('')

    try {
      console.log('🔍 Checking for Ethereum provider...')
      
      // Check if any Ethereum provider exists
      if (typeof window.ethereum === 'undefined') {
        throw new Error('No Ethereum wallet found. Please install Coinbase Wallet or MetaMask.')
      }

      console.log('✅ Ethereum provider found:', window.ethereum.constructor.name)

      // Try to connect directly first
      console.log('🔄 Requesting wallet connection...')
      
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      console.log('📋 Accounts received:', accounts)

      if (accounts && accounts.length > 0) {
        console.log('✅ Wallet connected successfully!')
        console.log('📍 Address:', accounts[0])
        
        // Check network
        const chainId = await window.ethereum.request({
          method: 'eth_chainId'
        })
        
        console.log('🌐 Network ID:', chainId)
        
        setConnectionStep('connected')
        onConnect?.(true, accounts[0])
      } else {
        throw new Error('No accounts returned from wallet')
      }

    } catch (error: any) {
      console.error('❌ Connection failed:', error)
      
      let errorMsg = ''
      
      if (error.code === 4001) {
        errorMsg = 'Connection was rejected by user'
      } else if (error.code === -32002) {
        errorMsg = 'Connection request is already pending. Please check your wallet.'
      } else if (error.message?.includes('No Ethereum wallet')) {
        errorMsg = 'No wallet found. Please install Coinbase Wallet.'
      } else {
        errorMsg = error.message || 'Unknown error occurred'
      }
      
      setErrorMessage(errorMsg)
      onConnect?.(false)
    } finally {
      setIsConnecting(false)
      if (connectionStep !== 'connected') {
        setConnectionStep('idle')
      }
    }
  }, [onConnect, connectionStep])

  const openCoinbaseWallet = () => {
    // For mobile, try to open Coinbase Wallet app
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (isMobile) {
      const currentUrl = encodeURIComponent(window.location.href)
      const coinbaseUrl = `https://go.cb-w.com/dapp?cb_url=${currentUrl}`
      console.log('📱 Opening Coinbase Wallet mobile app:', coinbaseUrl)
      window.location.href = coinbaseUrl
    } else {
      // For desktop, open Coinbase Wallet download page
      window.open('https://www.coinbase.com/wallet', '_blank')
    }
  }

  const generateWalletConnectQR = () => {
    // This is a placeholder for WalletConnect integration
    console.log('📱 WalletConnect QR generation would go here')
    alert('WalletConnect QR feature coming soon! For now, please use the direct connection or install Coinbase Wallet extension.')
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100">
      <div className="text-center mb-6">
        <div className="text-4xl mb-3">🔗</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Direct Wallet Connection
        </h3>
        <p className="text-gray-600 text-sm">
          Simplified connection without QR code dependencies
        </p>
      </div>

      {connectionStep === 'idle' && (
        <div className="space-y-4">
          {/* Direct Connection */}
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className={`w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
              isConnecting
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 shadow-lg'
            }`}
          >
            {isConnecting ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Connect Wallet Directly</span>
              </>
            )}
          </button>

          {/* Mobile App Connection */}
          <button
            onClick={openCoinbaseWallet}
            className="w-full flex items-center justify-center space-x-3 px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span>Open Coinbase Wallet App</span>
          </button>

          {/* WalletConnect Alternative */}
          <button
            onClick={generateWalletConnectQR}
            className="w-full flex items-center justify-center space-x-3 px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M12 12h.01M12 12v4.01M12 12H8.01M8 12h.01M8 12v4.01M8 12H4.01M4 12h.01M4 12v4.01" />
            </svg>
            <span>WalletConnect QR (Coming Soon)</span>
          </button>
        </div>
      )}

      {connectionStep === 'connecting' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-600 font-medium">Connecting to your wallet...</p>
          <p className="text-sm text-gray-500 mt-2">Please check your wallet app and approve the connection</p>
        </div>
      )}

      {connectionStep === 'connected' && (
        <div className="text-center py-6">
          <div className="text-6xl mb-4">🎉</div>
          <h4 className="text-xl font-bold text-green-600 mb-2">Connected Successfully!</h4>
          <p className="text-green-700">Your wallet is now connected to SevaStream</p>
        </div>
      )}

      {/* Error Display */}
      {errorMessage && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="text-red-500 text-xl">⚠️</div>
            <div className="flex-1">
              <h4 className="font-bold text-red-800 mb-1">Connection Failed</h4>
              <p className="text-sm text-red-600 mb-3">{errorMessage}</p>
              <div className="space-x-2">
                <button
                  onClick={connectWallet}
                  className="text-sm bg-red-600 text-white px-3 py-1 rounded font-medium hover:bg-red-700"
                >
                  Try Again
                </button>
                <button
                  onClick={openCoinbaseWallet}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded font-medium hover:bg-blue-700"
                >
                  Install Wallet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debug Info */}
      <details className="mt-4">
        <summary className="text-sm font-medium text-gray-600 cursor-pointer hover:text-gray-800">
          🔧 Debug Information
        </summary>
        <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs space-y-2">
          <div><strong>Browser:</strong> {navigator.userAgent}</div>
          <div><strong>Ethereum Provider:</strong> {typeof window.ethereum !== 'undefined' ? '✅ Available' : '❌ Not Found'}</div>
          <div><strong>Provider Type:</strong> {window.ethereum?.constructor?.name || 'Unknown'}</div>
          <div><strong>Is Coinbase:</strong> {window.ethereum?.isCoinbaseWallet ? '✅ Yes' : '❌ No'}</div>
          <div><strong>Is MetaMask:</strong> {window.ethereum?.isMetaMask ? '✅ Yes' : '❌ No'}</div>
          <div><strong>Connection Step:</strong> {connectionStep}</div>
        </div>
      </details>
    </div>
  )
}

export default DirectQRConnector
