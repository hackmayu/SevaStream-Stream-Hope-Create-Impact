import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'

// Pages
import Dashboard from './pages/Dashboard'
import DonorPortal from './pages/DonorPortal_clean'
import ReceiverView from './pages/ReceiverView'
import Analytics from './pages/Analytics'
import WalletPage from './pages/WalletPage'
import NewsPage from './pages/NewsPage'
import AuthPage from './pages/AuthPage'

// Components
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ChatbotWidget from './components/ChatbotWidget'

// Create a client
const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="pt-16">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/donor" element={<DonorPortal />} />
                <Route path="/receiver" element={<ReceiverView />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/wallet" element={<WalletPage />} />
                <Route path="/news" element={<NewsPage />} />
              </Routes>
            </main>
            <Footer />
            <ChatbotWidget />
            <Toaster position="top-right" />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
