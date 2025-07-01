import axios from 'axios';

const API_URL = process.env.VITE_API_URL;

class TokenRefreshService {
  // Refresh access token using refresh token (matches your curl command exactly)
  static async refreshToken(refreshToken) {
    try {
      const response = await axios.post(`${API_URL}/token/refresh/`, {
        refresh: refreshToken
      }, {
        headers: {
          'content-type': 'application/json'
        }
      });

      return response.data; // Returns { access: "new_token", refresh: "refresh_token" }
    } catch (error) {
      console.error('Token refresh failed:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get tokens from localStorage
  static getTokens() {
    try {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      return { token, refreshToken };
    } catch (error) {
      console.error('Failed to get tokens from localStorage:', error);
      return { token: null, refreshToken: null };
    }
  }

  // Store tokens in localStorage
  static setTokens(accessToken, refreshToken) {
    try {
      localStorage.setItem('token', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  }

  // Clear tokens and logout user
  static logout() {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      console.log('User logged out - tokens cleared');
      
      // Redirect to login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  }

  // Check if JWT token is expired
  static isTokenExpired(token) {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Failed to decode token:', error);
      return true;
    }
  }

  // Get a valid access token (refreshes if needed)
  static async getValidAccessToken() {
    const { token, refreshToken } = this.getTokens();
    
    // No tokens available
    if (!token || !refreshToken) {
      console.log('No tokens found - user needs to login');
      this.logout();
      return null;
    }

    // Check if refresh token is expired (7 days)
    if (this.isTokenExpired(refreshToken)) {
      console.log('Refresh token expired (7 days passed) - logging out user');
      this.logout();
      return null;
    }

    // If access token is still valid, return it
    if (!this.isTokenExpired(token)) {
      return token;
    }

    // Access token expired, try to refresh
    try {
      console.log('Access token expired - attempting refresh...');
      const newTokens = await this.refreshToken(refreshToken);
      
      this.setTokens(newTokens.access, newTokens.refresh || refreshToken);
      console.log('Token refreshed successfully');
      
      return newTokens.access;
    } catch (error) {
      console.error('Token refresh failed - logging out user:', error.message);
      this.logout();
      return null;
    }
  }

  // Make authenticated API request with automatic token refresh
  static async makeAuthenticatedRequest(axiosConfig) {
    try {
      const token = await this.getValidAccessToken();
      
      if (!token) {
        throw new Error('Authentication failed - user logged out');
      }

      // Add authorization header
      const config = {
        ...axiosConfig,
        headers: {
          ...axiosConfig.headers,
          'Authorization': `Bearer ${token}`
        }
      };

      return await axios(config);
    } catch (error) {
      // If we get 401, try one more time with fresh token
      if (error.response?.status === 401) {
        try {
          console.log('Got 401 error - attempting token refresh...');
          const { refreshToken } = this.getTokens();
          
          if (refreshToken && !this.isTokenExpired(refreshToken)) {
            const newTokens = await this.refreshToken(refreshToken);
            this.setTokens(newTokens.access, newTokens.refresh || refreshToken);
            
            // Retry with new token
            const retryConfig = {
              ...axiosConfig,
              headers: {
                ...axiosConfig.headers,
                'Authorization': `Bearer ${newTokens.access}`
              }
            };
            
            return await axios(retryConfig);
          }
        } catch (refreshError) {
          console.error('Final token refresh attempt failed - logging out:', refreshError.message);
          this.logout();
        }
      }
      
      throw error;
    }
  }
}

export default TokenRefreshService;
