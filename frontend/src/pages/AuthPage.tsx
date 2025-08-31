import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authService } from '../services/authService'

type UserType = 'donor' | 'user'
type FormMode = 'login' | 'signup'

interface FormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  organization?: string
  donationGoals?: string
  location: string
  interests: string[]
}

const AuthPage: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [userType, setUserType] = useState<UserType>('user')
  const [formMode, setFormMode] = useState<FormMode>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    organization: '',
    donationGoals: '',
    location: '',
    interests: []
  })

  const interestOptions = [
    'Climate Change', 'Disaster Relief', 'Education', 'Healthcare', 
    'Poverty Alleviation', 'Food Security', 'Water & Sanitation', 
    'Human Rights', 'Environmental Protection', 'Community Development'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validate passwords match for signup
    if (formMode === 'signup' && formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!')
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      
      let response;
      
      if (formMode === 'signup') {
        // Validate passwords match for signup
        if (formData.password !== formData.confirmPassword) {
          alert('Passwords do not match!')
          setIsLoading(false)
          return
        }
        
        // Call registration API
        response = await authService.register({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          userType,
          phone: formData.phone,
          location: formData.location,
          organization: formData.organization,
          interests: formData.interests
        })
      } else {
        // Call login API
        response = await authService.login({
          email: formData.email,
          password: formData.password
        })
      }
      
      if (response.success && response.user) {
        // Use auth context to login
        login(response.user)
        
        // Navigate based on user type
        if (userType === 'donor') {
          navigate('/donor')
        } else {
          navigate('/receiver')
        }
      } else {
        alert(response.message || 'Authentication failed')
      }
    } catch (error) {
      console.error('Auth error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
            <span className="text-white text-2xl">🌍</span>
          </div>
          <h1 className="text-4xl font-bold text-gradient-news mb-2">
            Welcome to SevaStream
          </h1>
          <p className="text-gray-600 text-lg">
            Join our community of changemakers and make a difference
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* User Type Selection */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Choose Your Role
            </h2>
            
            <div className="space-y-4">
              <button
                onClick={() => setUserType('user')}
                className={`w-full p-6 rounded-xl border-2 transition-all duration-300 ${
                  userType === 'user' 
                    ? 'border-blue-500 bg-blue-50 shadow-lg' 
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${userType === 'user' ? 'bg-blue-500' : 'bg-gray-100'}`}>
                    <span className={`text-xl ${userType === 'user' ? 'text-white' : 'text-gray-600'}`}>🤝</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg text-gray-800">Aid Recipient</h3>
                    <p className="text-gray-600 text-sm">
                      Request assistance and receive support from donors
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setUserType('donor')}
                className={`w-full p-6 rounded-xl border-2 transition-all duration-300 ${
                  userType === 'donor' 
                    ? 'border-purple-500 bg-purple-50 shadow-lg' 
                    : 'border-gray-200 bg-white hover:border-purple-300'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${userType === 'donor' ? 'bg-purple-500' : 'bg-gray-100'}`}>
                    <span className={`text-xl ${userType === 'donor' ? 'text-white' : 'text-gray-600'}`}>❤️</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-lg text-gray-800">Donor</h3>
                    <p className="text-gray-600 text-sm">
                      Support causes and help those in need with donations
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Benefits Section */}
            <div className="mt-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                <span className="text-green-500 mr-2">🛡️</span>
                Why Choose SevaStream?
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Transparent and secure transactions
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  Real-time impact tracking
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Direct connection with communities
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  AI-powered aid distribution
                </li>
              </ul>
            </div>
          </div>

          {/* Auth Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {/* Form Mode Toggle */}
            <div className="flex rounded-lg p-1 mb-6 bg-gray-100">
              <button
                onClick={() => setFormMode('login')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  formMode === 'login'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setFormMode('signup')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  formMode === 'signup'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {formMode === 'signup' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your full name"
                    />
                  </div>

                  {userType === 'donor' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Organization (Optional)
                      </label>
                      <input
                        type="text"
                        name="organization"
                        value={formData.organization}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        placeholder="Company or organization name"
                      />
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {formMode === 'signup' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="City, Country"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Areas of Interest
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {interestOptions.map((interest) => (
                        <label key={interest} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.interests.includes(interest)}
                            onChange={() => handleInterestToggle(interest)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{interest}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
                  userType === 'donor'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                } disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  `${formMode === 'login' ? 'Sign In' : 'Create Account'} as ${userType === 'donor' ? 'Donor' : 'Recipient'}`
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              By continuing, you agree to our{' '}
              <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and{' '}
              <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
