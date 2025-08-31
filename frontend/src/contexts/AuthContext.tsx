import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  fullName: string
  email: string
  userType: 'donor' | 'user'
  organization?: string
  location: string
  interests: string[]
  phone: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (userData: User) => void
  logout: () => void
  checkAuthStatus: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is already logged in from localStorage
    checkAuthStatus()
  }, [])

  const checkAuthStatus = (): boolean => {
    try {
      const storedUser = localStorage.getItem('sevastream_user')
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        setIsAuthenticated(true)
        return true
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
    }
    return false
  }

  const login = (userData: User) => {
    setUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem('sevastream_user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('sevastream_user')
  }

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
    checkAuthStatus,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
