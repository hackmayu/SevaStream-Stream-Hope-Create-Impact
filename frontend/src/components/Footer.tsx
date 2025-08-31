import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white py-20 mt-24">
      {/* Enhanced Background Pattern with animations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      {/* Animated background elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-full blur-2xl animate-pulse-slow"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Company Info - Enhanced */}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center space-x-4 mb-8 group cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-2xl animate-gradient-shift">
                <span className="text-white font-bold text-2xl">🌊</span>
              </div>
              <div>
                <span className="text-3xl font-black bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  SevaStream
                </span>
                <div className="text-sm text-blue-400 font-semibold tracking-wide">
                  ⚡ Powered by AI + Blockchain
                </div>
              </div>
            </div>
            
            <p className="text-gray-300 text-lg leading-relaxed max-w-lg mb-8">
              Revolutionizing charitable giving through <span className="font-bold text-blue-400">real-time blockchain-powered</span> micro-donations. 
              Every <span className="font-bold text-emerald-400">₹8</span> creates immediate impact with <span className="font-bold text-purple-400">full transparency</span>.
            </p>
            
            {/* Enhanced Social Links */}
            <div className="flex space-x-4">
              {[
                { icon: "🐦", label: "Twitter", href: "#", color: "hover:bg-blue-500" },
                { icon: "💬", label: "Discord", href: "#", color: "hover:bg-indigo-500" },
                { icon: "📱", label: "Telegram", href: "#", color: "hover:bg-cyan-500" },
                { icon: "📧", label: "Email", href: "#", color: "hover:bg-emerald-500" }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className={`w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center text-xl ${social.color} hover:scale-110 hover:shadow-lg transition-all duration-300 group border border-white/20 hover:border-white/40`}
                  title={social.label}
                >
                  <span className="group-hover:scale-125 transition-transform duration-300">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links - Enhanced */}
          <div className="space-y-6">
            <h3 className="font-bold text-lg text-white mb-4 flex items-center">
              <span className="w-1 h-6 bg-primary-500 rounded-full mr-3"></span>
              Platform
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Donate", href: "/donor", icon: "💝" },
                { name: "Receive Aid", href: "/receiver", icon: "🤝" },
                { name: "Analytics", href: "/analytics", icon: "📊" },
                { name: "Wallet", href: "/wallet", icon: "💳" }
              ].map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href} 
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-300 group"
                  >
                    <span className="text-sm group-hover:scale-110 transition-transform duration-300">{link.icon}</span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources - Enhanced */}
          <div className="space-y-6">
            <h3 className="font-bold text-lg text-white mb-4 flex items-center">
              <span className="w-1 h-6 bg-secondary-500 rounded-full mr-3"></span>
              Resources
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Documentation", href: "#", icon: "📚" },
                { name: "API Reference", href: "#", icon: "🔌" },
                { name: "Smart Contracts", href: "#", icon: "🔗" },
                { name: "GitHub", href: "#", icon: "🐙" }
              ].map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-all duration-300 group"
                  >
                    <span className="text-sm group-hover:scale-110 transition-transform duration-300">{link.icon}</span>
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="bg-gradient-to-r from-primary-900/50 to-secondary-900/50 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-white/10">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-3">Stay Updated</h3>
            <p className="text-gray-300 mb-6">Get the latest updates on new features, impact stories, and community initiatives.</p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent backdrop-blur-sm"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section - Enhanced */}
        <div className="border-t border-gray-700/50 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-6">
              <p className="text-gray-400 text-sm">
                © 2025 SevaStream. All rights reserved.
              </p>
              <div className="hidden md:flex items-center space-x-1 text-xs text-gray-500">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>Live on Polygon Network</span>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center lg:justify-end gap-6 text-sm">
              {[
                { name: "Privacy Policy", href: "#" },
                { name: "Terms of Service", href: "#" },
                { name: "Cookie Policy", href: "#" },
                { name: "Security", href: "#" }
              ].map((link, index) => (
                <a 
                  key={index}
                  href={link.href} 
                  className="text-gray-400 hover:text-white transition-colors duration-300 hover:underline"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
          
          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-gray-700/30 text-center">
            <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                <span>AI-Powered Verification</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-success-500 rounded-full"></span>
                <span>Blockchain Transparent</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-warning-500 rounded-full"></span>
                <span>Real-time Impact</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
