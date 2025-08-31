// Token configurations for Polygon network
export const TOKENS = {
  USDC: {
    address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC on Polygon
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    icon: '💵'
  },
  MATIC: {
    address: '0x0000000000000000000000000000000000001010', // Native MATIC
    symbol: 'MATIC',
    name: 'Polygon',
    decimals: 18,
    icon: '🔷'
  },
  ETH: {
    address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', // WETH on Polygon
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    icon: '⟨Ξ⟩'
  },
  USDT: {
    address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // USDT on Polygon
    symbol: 'USDT',
    name: 'Tether',
    decimals: 6,
    icon: '💰'
  }
}

// Default token for the platform
export const DEFAULT_TOKEN = TOKENS.USDC

// ERC-20 ABI for token operations
export const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_to", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{"name": "", "type": "string"}],
    "type": "function"
  }
]
