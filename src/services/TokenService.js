import axios from 'axios';

const API_URL = process.env.VITE_API_URL;

class TokenService {
  // Refresh access token using refresh token
  static async refreshToken(refreshToken) {
    try {
      const response = await axios.post(`${API_URL}/token/refresh/`, {
        refresh: refreshToken
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = response.data;
      return {
        access: data.access,
        refresh: data.refresh || refreshToken // Some APIs return new refresh token, others don't
      };
    } catch (error) {
      console.error('Token refresh failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message || "Token refresh failed");
    }
  }

  // Get stored tokens from localStorage
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

  // Clear tokens from localStorage
  static clearTokens() {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  // Check if token is expired (basic check)
  static isTokenExpired(token) {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Failed to decode token:', error);
      return true; // If we can't decode, assume expired
    }
  }

  // Auto-refresh token if needed and handle redirect on failure
  static async getValidToken() {
    const { token, refreshToken } = this.getTokens();
    
    if (!token || !refreshToken) {
      console.log('No tokens found, user needs to login');
      this.redirectToLogin();
      return null;
    }

    // If token is not expired, return it
    if (!this.isTokenExpired(token)) {
      return token;
    }

    // Token is expired, try to refresh
    try {
      console.log('Access token expired, attempting to refresh...');
      const newTokens = await this.refreshToken(refreshToken);
      this.setTokens(newTokens.access, newTokens.refresh);
      console.log('Token refreshed successfully');
      return newTokens.access;
    } catch (error) {
      // Refresh failed, clear tokens and redirect to login
      console.error('Token refresh failed, redirecting to login:', error.message);
      this.clearTokens();
      this.redirectToLogin();
      return null;
    }
  }

  // Redirect to login page
  static redirectToLogin() {
    // Only redirect if not already on login page
    if (window.location.pathname !== '/login') {
      console.log('Redirecting to login page...');
      window.location.href = '/login';
    }
  }

  // Check if refresh token is expired (7 days check)
  static isRefreshTokenExpired(refreshToken) {
    if (!refreshToken) return true;
    
    try {
      const payload = JSON.parse(atob(refreshToken.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Failed to decode refresh token:', error);
      return true;
    }
  }

  // Validate both tokens and redirect if needed
  static validateTokens() {
    const { token, refreshToken } = this.getTokens();
    
    if (!refreshToken || this.isRefreshTokenExpired(refreshToken)) {
      console.log('Refresh token expired (7 days passed), user needs to login');
      this.clearTokens();
      this.redirectToLogin();
      return false;
    }
    
    return true;
  }
}

export default TokenService;
