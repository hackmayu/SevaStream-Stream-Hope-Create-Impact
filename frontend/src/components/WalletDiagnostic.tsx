import React, { useState, useEffect } from 'react'

interface DiagnosticInfo {
  hasEthereum: boolean
  providerType: string
  isCoinbase: boolean
  isMetaMask: boolean
  chainId: string | null
  accounts: string[]
  error: string | null
}

const WalletDiagnostic: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticInfo>({
    hasEthereum: false,
    providerType: 'Unknown',
    isCoinbase: false,
    isMetaMask: false,
    chainId: null,
    accounts: [],
    error: null
  })
  
  const [isLoading, setIsLoading] = useState(false)

  const runDiagnostics = async () => {
    setIsLoading(true)
    
    try {
      const hasEthereum = typeof window.ethereum !== 'undefined'
      
      let providerType = 'None'
      let isCoinbase = false
      let isMetaMask = false
      let chainId = null
      let accounts: string[] = []
      
      if (hasEthereum) {
        providerType = window.ethereum.constructor?.name || 'Unknown Provider'
        isCoinbase = !!window.ethereum.isCoinbaseWallet
        isMetaMask = !!window.ethereum.isMetaMask
        
        try {
          chainId = await window.ethereum.request({ method: 'eth_chainId' })
        } catch (error) {
          console.log('Could not get chain ID:', error)
        }
        
        try {
          accounts = await window.ethereum.request({ method: 'eth_accounts' })
        } catch (error) {
          console.log('Could not get accounts:', error)
        }
      }
      
      setDiagnostics({
        hasEthereum,
        providerType,
        isCoinbase,
        isMetaMask,
        chainId,
        accounts,
        error: null
      })
      
    } catch (error: any) {
      setDiagnostics(prev => ({
        ...prev,
        error: error.message
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const testConnection = async () => {
    if (!diagnostics.hasEthereum) {
      alert('No Ethereum provider found!')
      return
    }
    
    try {
      console.log('🔄 Testing wallet connection...')
      
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })
      
      console.log('✅ Connection successful!', accounts)
      alert(`Connection successful! Address: ${accounts[0]}`)
      
      // Refresh diagnostics
      runDiagnostics()
      
    } catch (error: any) {
      console.error('❌ Connection failed:', error)
      alert(`Connection failed: ${error.message}`)
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">🔍 Wallet Diagnostic</h3>
        <button
          onClick={runDiagnostics}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? 'Scanning...' : 'Refresh'}
        </button>
      </div>

      <div className="space-y-4">
        {/* Basic Detection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center space-x-2">
              <span className={`w-3 h-3 rounded-full ${diagnostics.hasEthereum ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="font-medium">Ethereum Provider</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {diagnostics.hasEthereum ? '✅ Available' : '❌ Not Found'}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center space-x-2">
              <span className={`w-3 h-3 rounded-full ${diagnostics.isCoinbase ? 'bg-blue-500' : 'bg-gray-400'}`}></span>
              <span className="font-medium">Coinbase Wallet</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {diagnostics.isCoinbase ? '✅ Detected' : '❌ Not Detected'}
            </p>
          </div>
        </div>

        {/* Provider Details */}
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-bold text-gray-800 mb-2">Provider Information</h4>
          <div className="space-y-2 text-sm">
            <div><strong>Type:</strong> {diagnostics.providerType}</div>
            <div><strong>Is MetaMask:</strong> {diagnostics.isMetaMask ? 'Yes' : 'No'}</div>
            <div><strong>Is Coinbase:</strong> {diagnostics.isCoinbase ? 'Yes' : 'No'}</div>
            <div><strong>Chain ID:</strong> {diagnostics.chainId || 'Not connected'}</div>
            <div><strong>Connected Accounts:</strong> {diagnostics.accounts.length}</div>
          </div>
        </div>

        {/* Current Accounts */}
        {diagnostics.accounts.length > 0 && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="font-bold text-green-800 mb-2">Connected Accounts</h4>
            {diagnostics.accounts.map((account, index) => (
              <div key={index} className="text-sm font-mono text-green-700 mb-1">
                {account}
              </div>
            ))}
          </div>
        )}

        {/* Error Display */}
        {diagnostics.error && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h4 className="font-bold text-red-800 mb-2">Error</h4>
            <p className="text-sm text-red-700">{diagnostics.error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={testConnection}
            disabled={!diagnostics.hasEthereum}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {diagnostics.hasEthereum ? 'Test Connection' : 'No Wallet Found'}
          </button>
          
          {!diagnostics.hasEthereum && (
            <button
              onClick={() => window.open('https://www.coinbase.com/wallet', '_blank')}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-600"
            >
              Install Coinbase Wallet
            </button>
          )}
        </div>

        {/* Troubleshooting Tips */}
        <details className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <summary className="font-bold text-yellow-800 cursor-pointer">
            💡 Troubleshooting Tips
          </summary>
          <div className="mt-3 space-y-2 text-sm text-yellow-700">
            <div><strong>No Provider Found:</strong></div>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Install Coinbase Wallet browser extension</li>
              <li>Install MetaMask as an alternative</li>
              <li>Refresh the page after installation</li>
            </ul>
            
            <div><strong>Connection Fails:</strong></div>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Make sure your wallet is unlocked</li>
              <li>Check if wallet is busy with another connection</li>
              <li>Try refreshing and connecting again</li>
            </ul>
            
            <div><strong>QR Code Issues:</strong></div>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>QR codes require specific Coinbase SDK setup</li>
              <li>Browser extension method is more reliable</li>
              <li>Mobile deep links work better on mobile devices</li>
            </ul>
          </div>
        </details>
      </div>
    </div>
  )
}

export default WalletDiagnostic
