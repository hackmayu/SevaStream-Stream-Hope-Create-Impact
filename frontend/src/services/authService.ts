const API_BASE_URL = 'http://localhost:3008/api';

export interface User {
  id: string;
  fullName: string;
  email: string;
  userType: 'donor' | 'user';
  phone: string;
  location: string;
  organization?: string;
  interests: string[];
  createdAt: string;
  isVerified: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  userType: 'donor' | 'user';
  phone: string;
  location: string;
  organization?: string;
  interests: string[];
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

class AuthService {
  private getHeaders(includeAuth = false) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (includeAuth) {
      const token = localStorage.getItem('sevastream_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return headers;
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      if (data.success && data.token) {
        localStorage.setItem('sevastream_token', data.token);
        localStorage.setItem('sevastream_user', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    }
  }

  async login(loginData: LoginData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(loginData),
      });

      const data = await response.json();
      
      if (data.success && data.token) {
        localStorage.setItem('sevastream_token', data.token);
        localStorage.setItem('sevastream_user', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: this.getHeaders(true),
      });

      const data = await response.json();
      
      if (data.success) {
        return data.user;
      }
      
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders(true),
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('sevastream_token');
      localStorage.removeItem('sevastream_user');
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('sevastream_token');
    return !!token;
  }

  getStoredUser(): User | null {
    try {
      const userStr = localStorage.getItem('sevastream_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  }
}

export const authService = new AuthService();
