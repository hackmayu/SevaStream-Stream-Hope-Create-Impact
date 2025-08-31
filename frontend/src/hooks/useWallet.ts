import { useState, useEffect } from 'react'
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk'
import { DEFAULT_TOKEN, ERC20_ABI } from '../config/tokens'

interface WalletState {
  isConnected: boolean
  address: string | null
  chainId: number | null
  balance: string | null
  usdcBalance: string | null
  selectedToken: typeof DEFAULT_TOKEN
  walletType: 'coinbase' | 'metamask' | null
}

declare global {
  interface Window {
    ethereum?: any
  }
}

// Enhanced Coinbase Wallet SDK configuration for mobile QR code support
const coinbaseWallet = new CoinbaseWalletSDK({
  appName: 'SevaStream - Revolutionary Charity Platform',
  appLogoUrl: 'https://sevastream.org/logo.png', // Use full URL for mobile compatibility
  darkMode: false,
  headlessMode: false, // Set to false to show QR code modal
  enableMobileWalletLink: true, // Enable mobile wallet connections
  overrideIsMetaMask: false, // Don't override MetaMask detection
  overrideIsCoinbaseWallet: false // Let Coinbase Wallet be detected properly
})

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    balance: null,
    usdcBalance: null,
    selectedToken: DEFAULT_TOKEN,
    walletType: null
  })
  
  const [isConnecting, setIsConnecting] = useState(false)

  // Check if wallet is already connected on component mount
  useEffect(() => {
    checkWalletConnection()
  }, [])

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_accounts' 
        })
        
        if (accounts.length > 0) {
          const chainId = await window.ethereum.request({ 
            method: 'eth_chainId' 
          })
          
          setWalletState({
            isConnected: true,
            address: accounts[0],
            chainId: parseInt(chainId, 16),
            balance: null,
            usdcBalance: null,
            selectedToken: DEFAULT_TOKEN,
            walletType: 'coinbase'
          })
          
          // Get balance
          await getBalance(accounts[0])
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error)
      }
    }
  }

  const getBalance = async (address: string) => {
    try {
      if (window.ethereum) {
        // Get MATIC balance (native token)
        const maticBalance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [address, 'latest']
        })
        
        // Convert from wei to MATIC
        const maticBalanceFormatted = (parseInt(maticBalance, 16) / Math.pow(10, 18)).toFixed(4)
        
        // Get USDC balance (ERC-20 token)
        let usdcBalance = '0.0000'
        try {
          const usdcContract = DEFAULT_TOKEN.address
          const data = `0x70a08231000000000000000000000000${address.slice(2)}`
          
          const usdcBalanceHex = await window.ethereum.request({
            method: 'eth_call',
            params: [{
              to: usdcContract,
              data: data
            }, 'latest']
          })
          
          if (usdcBalanceHex && usdcBalanceHex !== '0x') {
            // Convert from smallest unit to USDC (6 decimals)
            const usdcBalanceWei = parseInt(usdcBalanceHex, 16)
            usdcBalance = (usdcBalanceWei / Math.pow(10, DEFAULT_TOKEN.decimals)).toFixed(4)
          }
        } catch (usdcError) {
          console.error('Error getting USDC balance:', usdcError)
        }
        
        setWalletState(prev => ({
          ...prev,
          balance: maticBalanceFormatted,
          usdcBalance: usdcBalance
        }))
      }
    } catch (error) {
      console.error('Error getting balance:', error)
    }
  }

  const connectWallet = async (preferredWallet?: 'coinbase') => {
    if (isConnecting) {
      console.log('Already connecting, please wait...')
      return { success: false, error: 'Connection already in progress' }
    }
    
    setIsConnecting(true)
    console.log('Starting wallet connection process...')
    
    try {
      let ethereum = null
      let walletType: 'coinbase' | null = null

      // Check if we have any Ethereum provider
      if (typeof window === 'undefined') {
        throw new Error('Window object not available')
      }

      // Try to use Coinbase Wallet SDK first if preferred or as default
      if (preferredWallet === 'coinbase' || !preferredWallet) {
        try {
          console.log('Attempting to connect with Coinbase Wallet SDK...')
          
          // Create the Web3 provider for Polygon network
          const coinbaseProvider = coinbaseWallet.makeWeb3Provider('https://polygon-mainnet.infura.io/v3/demo', 137)
          
          // Request account access - this will show the Coinbase Wallet connection dialog
          const accounts = await coinbaseProvider.request({
            method: 'eth_requestAccounts'
          }) as string[]

          if (accounts && accounts.length > 0) {
            ethereum = coinbaseProvider
            walletType = 'coinbase'
            console.log('Successfully connected via Coinbase Wallet SDK')
          }
        } catch (coinbaseError: any) {
          console.log('Coinbase Wallet SDK connection failed:', coinbaseError)
          
          // Priority 2: Try to detect Coinbase Wallet extension
          if (window.ethereum?.isCoinbaseWallet) {
            console.log('Detected Coinbase Wallet extension, using it...')
            ethereum = window.ethereum
            walletType = 'coinbase'
          }
          // Priority 3: Use any available window.ethereum
          else if (window.ethereum) {
            console.log('Using general window.ethereum provider...')
            ethereum = window.ethereum
            walletType = 'coinbase'
          }
        }
      }

      if (!ethereum) {
        throw new Error('No crypto wallet found. Please install Coinbase Wallet or another Web3 wallet.')
      }

      console.log('Ethereum provider found:', ethereum)
      console.log('Requesting account access...')

      // Request account access if we're using window.ethereum
      let accounts: string[]
      if (ethereum === window.ethereum) {
        accounts = await ethereum.request({ 
          method: 'eth_requestAccounts' 
        }) as string[]
      } else {
        // For Coinbase SDK, accounts are already requested above
        accounts = await ethereum.request({ 
          method: 'eth_accounts' 
        }) as string[]
      }

      console.log('Accounts received:', accounts)

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please make sure your wallet is unlocked.')
      }

      // Get chain ID
      const chainId = await ethereum.request({ 
        method: 'eth_chainId' 
      })

      console.log('Chain ID:', chainId)

      setWalletState({
        isConnected: true,
        address: accounts[0],
        chainId: parseInt(chainId, 16),
        balance: null,
        usdcBalance: null,
        selectedToken: DEFAULT_TOKEN,
        walletType
      })

      // Get balance
      await getBalance(accounts[0])

      // Switch to Polygon network if not already
      await switchToPolygon()

      console.log('Wallet connected successfully!')
      return { success: true, address: accounts[0], walletType }
    } catch (error: any) {
      console.error('Failed to connect wallet:', error)
      
      let errorMessage = 'Failed to connect wallet. Please try again.'
      
      if (error.code === 4001) {
        errorMessage = 'Connection request was rejected. Please approve the connection request in your wallet.'
      } else if (error.code === -32002) {
        errorMessage = 'Connection request is already pending. Please check your wallet.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      console.log('Connection error message:', errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsConnecting(false)
      console.log('Connection process completed.')
    }
  }

  const switchToPolygon = async () => {
    try {
      if (!window.ethereum) return

      // Polygon Mainnet
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x89' }], // 137 in hex
      })
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x89',
                chainName: 'Polygon Mainnet',
                nativeCurrency: {
                  name: 'MATIC',
                  symbol: 'MATIC',
                  decimals: 18,
                },
                rpcUrls: ['https://polygon-rpc.com/'],
                blockExplorerUrls: ['https://polygonscan.com/'],
              },
            ],
          })
        } catch (addError) {
          console.error('Failed to add Polygon network:', addError)
        }
      }
    }
  }

  const disconnectWallet = () => {
    setWalletState({
      isConnected: false,
      address: null,
      chainId: null,
      balance: null,
      usdcBalance: null,
      selectedToken: DEFAULT_TOKEN,
      walletType: null
    })
  }

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else {
          setWalletState(prev => ({
            ...prev,
            address: accounts[0]
          }))
          getBalance(accounts[0])
        }
      }

      const handleChainChanged = (chainId: string) => {
        setWalletState(prev => ({
          ...prev,
          chainId: parseInt(chainId, 16)
        }))
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)

      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
          window.ethereum.removeListener('chainChanged', handleChainChanged)
        }
      }
    }
  }, [])

  const formatAddress = (address: string) => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getNetworkName = (chainId: number) => {
    switch (chainId) {
      case 1: return 'Ethereum'
      case 137: return 'Polygon'
      case 56: return 'BSC'
      case 42220: return 'Celo'
      case 8453: return 'Base'
      default: return 'Unknown'
    }
  }

  return {
    ...walletState,
    isConnecting,
    connectWallet,
    disconnectWallet,
    formatAddress,
    getNetworkName,
    switchToPolygon,
    // USDC-specific properties
    usdcBalance: walletState.usdcBalance,
    selectedToken: walletState.selectedToken,
    // Default display balance (now USDC)
    displayBalance: walletState.usdcBalance || '0.0000',
    displaySymbol: walletState.selectedToken.symbol
  }
}
