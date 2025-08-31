import React, { useState } from 'react'
import Chatbot from './Chatbot'

const ChatbotWidget = () => {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 ${isChatOpen ? 'hidden' : 'block'}`}
      >
        <span className="text-2xl">💬</span>
        
        {/* Notification Badge */}
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
          !
        </div>
        
        {/* Ripple Animation */}
        <div className="absolute inset-0 rounded-full bg-primary-600 animate-ping opacity-20"></div>
      </button>

      {/* Tooltip */}
      {!isChatOpen && (
        <div className="fixed bottom-20 right-6 bg-gray-900 text-white text-sm py-2 px-3 rounded-lg shadow-lg opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none z-30">
          Need help? Chat with SevaBot!
          <div className="absolute bottom-[-4px] right-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
        </div>
      )}

      {/* Chatbot */}
      <Chatbot 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </>
  )
}

export default ChatbotWidget
