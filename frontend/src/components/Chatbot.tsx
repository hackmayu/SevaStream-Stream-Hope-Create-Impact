import React, { useState, useRef, useEffect } from 'react'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

interface ChatbotProps {
  isOpen: boolean
  onClose: () => void
}

const Chatbot: React.FC<ChatbotProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm SevaBot, your donation assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const quickResponses = [
    { text: "How do I start donating?", action: "donate_help" },
    { text: "What is streaming donations?", action: "streaming_info" },
    { text: "How do I verify my need?", action: "verification_help" },
    { text: "View urgent needs", action: "urgent_needs" },
    { text: "Track my donations", action: "track_donations" }
  ]

  const botResponses: { [key: string]: string } = {
    donate_help: "To start donating:\n1. Click 'Start Donating' button\n2. Connect your wallet (Metamask/Coinbase)\n3. Choose a cause you care about\n4. Set your donation amount (minimum ₹8)\n5. Start your donation stream!\n\nYour donations are processed in real-time on the blockchain for full transparency.",
    
    streaming_info: "Streaming donations allow you to send micro-payments continuously instead of one large donation:\n\n✨ Benefits:\n• Send as little as ₹8 every 10 seconds\n• Create sustained impact over time\n• Higher completion rates\n• Real-time blockchain transparency\n• Stop anytime\n\nIt's like 'subscribing' to help someone in need!",
    
    verification_help: "To get verified as a recipient:\n1. Go to 'Receive Aid' section\n2. Submit required documents:\n   • Government ID\n   • Address proof\n   • Need verification docs\n3. Our AI + human reviewers verify within 2-3 days\n4. Once verified, you can create aid requests\n\nVerification ensures donor trust and prevents fraud.",
    
    urgent_needs: "Current urgent needs requiring immediate attention:\n\n🚨 Medical Emergency - Mumbai\n• 7-year-old needs heart surgery\n• ₹1,18,000 remaining of ₹3,50,000\n\n💧 Clean Water - Bihar\n• 2,500 flood victims need water purification\n• ₹87,500 remaining of ₹1,75,000\n\nWould you like to donate to any of these?",
    
    track_donations: "To track your donations:\n1. Go to Donor Portal\n2. View 'Recent Streams' section\n3. See real-time status and blockchain transactions\n4. Check Analytics for impact metrics\n\nAll transactions are recorded on Polygon blockchain for complete transparency. You can also view recipient updates and impact reports.",
    
    default: "I understand you're asking about that. Here are some things I can help you with:\n\n• Starting your first donation\n• Understanding streaming donations\n• Verification process\n• Viewing urgent needs\n• Tracking donation impact\n\nPlease select one of the quick responses below or ask me something specific!"
  }

  const handleSendMessage = async (text: string, action?: string) => {
    if (!text.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsTyping(true)

    // Simulate bot typing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))

    // Generate bot response
    let botResponse = ''
    if (action && botResponses[action]) {
      botResponse = botResponses[action]
    } else {
      // Simple keyword matching for demo
      const lowerText = text.toLowerCase()
      if (lowerText.includes('donate') || lowerText.includes('donation')) {
        botResponse = botResponses.donate_help
      } else if (lowerText.includes('stream') || lowerText.includes('streaming')) {
        botResponse = botResponses.streaming_info
      } else if (lowerText.includes('verify') || lowerText.includes('verification')) {
        botResponse = botResponses.verification_help
      } else if (lowerText.includes('urgent') || lowerText.includes('emergency')) {
        botResponse = botResponses.urgent_needs
      } else if (lowerText.includes('track') || lowerText.includes('history')) {
        botResponse = botResponses.track_donations
      } else {
        botResponse = botResponses.default
      }
    }

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: botResponse,
      sender: 'bot',
      timestamp: new Date()
    }

    setIsTyping(false)
    setMessages(prev => [...prev, botMessage])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSendMessage(inputText)
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-4 rounded-t-xl flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold">🤖</span>
          </div>
          <div>
            <h3 className="font-semibold">SevaBot</h3>
            <p className="text-xs opacity-90">Donation Assistant</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="text-white/80 hover:text-white text-xl"
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg whitespace-pre-line ${
                message.sender === 'user'
                  ? 'bg-primary-600 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg rounded-bl-none">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Responses */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex flex-wrap gap-2 mb-3">
          {quickResponses.map((response, index) => (
            <button
              key={index}
              onClick={() => handleSendMessage(response.text, response.action)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-full transition-colors"
            >
              {response.text}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}

export default Chatbot
