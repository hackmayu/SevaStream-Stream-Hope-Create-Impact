import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet'
import { useAuth } from '../contexts/AuthContext'
import WalletSelector from './WalletSelector'

// Simple icon components
const Home = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)

const Heart = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
)

const BarChart3 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const Users = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const Wallet = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
)

const User = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const Newspaper = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
  </svg>
)

const Navbar = () => {
  const location = useLocation()
  const { isAuthenticated, user, logout } = useAuth()
  const [showWalletSelector, setShowWalletSelector] = useState(false)
  const {
    isConnected,
    address,
    chainId,
    balance,
    usdcBalance,
    displayBalance,
    displaySymbol,
    disconnectWallet,
    formatAddress,
    getNetworkName
  } = useWallet()

  const handleWalletConnect = (selectedWalletType: 'coinbase') => {
    console.log('Connected with:', selectedWalletType)
  }

  const baseNavigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Donate', href: '/donor', icon: Heart },
    { name: 'News', href: '/news', icon: Newspaper },
    { name: 'Receive Aid', href: '/receiver', icon: Users },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Wallet', href: '/wallet', icon: Wallet },
  ]

  // Show different navigation based on auth status
  const navigation = isAuthenticated 
    ? baseNavigation 
    : [
        ...baseNavigation.slice(0, 3), // Dashboard, Donate, News
        { name: 'Sign In', href: '/auth', icon: User },
        ...baseNavigation.slice(3) // Rest of the items
      ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Enhanced Logo */}
          <Link to="/" className="group flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <span className="text-xl font-black text-white">S</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                SevaStream
              </h1>
              <p className="text-xs text-gray-500 font-medium hidden sm:block">Stream Hope, Create Impact</p>
            </div>
          </Link>

          {/* Enhanced Connect Wallet Button - Center for prominence */}
          <div className="flex items-center space-x-6">
            {isConnected ? (
              <div className="flex items-center space-x-4">
                <div className="hidden sm:block">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-bold text-gray-800">{formatAddress(address!)}</span>
                        <span className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-3 py-1 rounded-full font-semibold capitalize">
                          💙 coinbase
                        </span>
                      </div>
                      <div className="text-gray-600 text-xs">
                        🔗 {getNetworkName(chainId!)} • � {displayBalance} {displaySymbol}
                      </div>
                    </div>
                  </div>
                </div>
                <Link
                  to="/wallet"
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center space-x-2">
                    <Wallet className="w-5 h-5" />
                    <span className="hidden sm:inline">Wallet</span>
                  </div>
                </Link>
                <button 
                  onClick={disconnectWallet}
                  className="text-gray-600 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all duration-300"
                  title="Disconnect Wallet"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowWalletSelector(true)}
                className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center space-x-3">
                  <Wallet className="w-6 h-6" />
                  <span className="text-lg">🚀 Connect Wallet</span>
                </span>
              </button>
            )}
          </div>

          {/* Enhanced Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigation.filter(item => item.href !== '/wallet').map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center space-x-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500/10 to-purple-600/10 text-blue-700 shadow-lg backdrop-blur-sm'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 hover:backdrop-blur-sm'
                  }`}
                >
                  <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
            
            {/* User Profile Dropdown when authenticated */}
            {isAuthenticated && user && (
              <div className="relative group">
                <button className="flex items-center space-x-2 px-4 py-3 rounded-xl font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {user.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden xl:inline">{user.fullName}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-4 border-b border-gray-100">
                    <p className="font-semibold text-gray-800">{user.fullName}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-blue-600 capitalize">
                      {user.userType === 'donor' ? '❤️ Donor' : '🤝 Recipient'}
                    </p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Mobile Menu Button */}
          <div className="lg:hidden">
            <button className="p-3 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Wallet Selector Modal */}
        <WalletSelector
          isOpen={showWalletSelector}
          onClose={() => setShowWalletSelector(false)}
          onWalletConnect={handleWalletConnect}
        />
      </div>
    </nav>
  )
}

export default Navbar
