# ⚡ SevaStream - Real-time Donation Streaming Platform

A revolutionary platform enabling micro-donations and real-time aid distribution using blockchain technology and the x402 payment protocol.

## 🎯 Vision
Transform charitable giving from lump-sum donations to continuous, transparent, and traceable streams of support directly to those in need.

## 🏗️ Architecture Overview

### Frontend Layer
- **Donor Dashboard**: React.js + Tailwind CSS for web interface
- **Receiver View**: Real-time status updates and aid tracking
- **Mobile App**: React Native/Flutter for field workers and NGOs

### Backend Layer
- **Core API**: Node.js (Express.js) with x402 middleware
- **AI Services**: FastAPI (Python) for needs detection
- **Real-time Updates**: WebSocket integration

### Payments & Blockchain
- **Micro-payments**: x402 Protocol via Coinbase
- **Blockchain**: Polygon/Base/Celo for low-cost transactions
- **Smart Contracts**: Solidity for automated fund release

### Data & Verification
- **Needs Detection**: Mock AI API (Python/JSON)
- **IoT Integration**: GPS tracking and QR code verification
- **Storage**: IPFS for decentralized record keeping

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- Metamask or Coinbase Wallet
- Git

### Quick Setup
```bash
# Clone and setup
git clone <repository-url>
cd SevaStream

# Install dependencies
npm install
cd backend && npm install
cd ../ai-services && pip install -r requirements.txt

# Start development servers
npm run dev
```

## 📊 Project Structure
```
SevaStream/
├── frontend/              # React.js donor dashboard
├── mobile/               # React Native field worker app
├── backend/              # Node.js API server
├── ai-services/          # Python FastAPI for needs detection
├── smart-contracts/      # Solidity contracts
├── docs/                 # Documentation
└── scripts/              # Deployment and utility scripts
```

## 💡 Key Features
- ⚡ **Real-time Donations**: Stream micro-payments (₹8 / $0.10+)
- 🔗 **Blockchain Transparency**: All transactions on-chain
- 🤖 **AI Needs Detection**: Automated urgent needs identification
- 📱 **Mobile-first**: Field worker apps for ground verification
- 🔐 **Decentralized**: No centralized custody of funds
- 📊 **Real-time Tracking**: Live updates on aid distribution

## 🛠️ Tech Stack
- **Frontend**: React.js, Tailwind CSS, WebSocket
- **Mobile**: React Native / Flutter
- **Backend**: Node.js, Express.js, x402 middleware
- **AI**: Python, FastAPI, Mock ML models
- **Blockchain**: Polygon/Base/Celo, Solidity
- **Payments**: x402 Protocol, Coinbase integration
- **Storage**: IPFS, PostgreSQL
- **Real-time**: Socket.io, WebRTC

## 📈 Development Roadmap
1. **Phase 1**: MVP with mock data and basic UI
2. **Phase 2**: x402 integration and smart contracts
3. **Phase 3**: Mobile app and IoT verification
4. **Phase 4**: Advanced AI and scaling

## 🤝 Contributing
We welcome contributions! Please read our contributing guidelines and code of conduct.

## 📄 License
MIT License - see LICENSE file for details.
