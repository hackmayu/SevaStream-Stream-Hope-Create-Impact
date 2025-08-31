import React from 'react'
import { useWallet } from '../hooks/useWallet'

const USDCBalanceDemo: React.FC = () => {
  const { 
    isConnected, 
    address, 
    balance, 
    usdcBalance, 
    displayBalance, 
    displaySymbol,
    selectedToken,
    connectWallet 
  } = useWallet()

  const handleConnect = async () => {
    await connectWallet('coinbase')
  }

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-green-600 rounded-full mx-auto mb-3 flex items-center justify-center">
            <span className="text-white text-2xl">💵</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">USDC Default Currency</h3>
          <p className="text-gray-600 text-sm">Connect wallet to see USDC balance</p>
        </div>
        
        <button
          onClick={handleConnect}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          Connect Wallet
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 border-2 border-green-200">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-600 rounded-full mx-auto mb-3 flex items-center justify-center">
          <span className="text-white text-2xl">{selectedToken.icon}</span>
        </div>
        <h3 className="text-xl font-bold text-green-800 mb-2">
          Default Currency: {selectedToken.symbol}
        </h3>
        <p className="text-green-600 text-sm">{selectedToken.name}</p>
      </div>

      <div className="space-y-4">
        {/* Primary Balance (USDC) */}
        <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {displayBalance} {displaySymbol}
            </div>
            <div className="text-sm text-green-700 font-medium">
              Primary Balance ({selectedToken.name})
            </div>
          </div>
        </div>

        {/* Secondary Balances */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <h4 className="text-sm font-bold text-gray-700 mb-3">Other Token Balances:</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">🔷 MATIC (Gas):</span>
              <span className="text-sm font-medium text-gray-800">{balance || '0.0000'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">💵 USDC (Primary):</span>
              <span className="text-sm font-medium text-green-600">{usdcBalance || '0.0000'}</span>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <h4 className="text-sm font-bold text-gray-700 mb-3">Account Details:</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Address:</span>
              <div className="font-mono text-gray-800 break-all">{address}</div>
            </div>
            <div>
              <span className="text-gray-600">Default Token:</span>
              <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                {selectedToken.symbol} ({selectedToken.name})
              </span>
            </div>
          </div>
        </div>

        {/* Feature Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-bold text-blue-800 mb-2">✨ New Feature:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Default currency changed to USDC</li>
            <li>• More stable for donations</li>
            <li>• Better price consistency</li>
            <li>• Lower volatility for recipients</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default USDCBalanceDemo
