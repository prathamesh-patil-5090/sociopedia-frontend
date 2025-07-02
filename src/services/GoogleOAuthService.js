import axios from 'axios';

const API_URL = process.env.VITE_API_URL;

class GoogleOAuthService {
  // Exchange Google credential for backend JWT tokens
  static async exchangeGoogleToken(googleCredential) {
    try {
      const response = await axios.post(`${API_URL}/auth/google/token-exchange`, {
        credential: googleCredential
      });
      
      return response.data;
    } catch (error) {
      console.error('Error exchanging Google token:', error);
      throw error;
    }
  }

  // Handle Google login success
  static async handleGoogleLoginSuccess(googleResponse) {
    try {
      console.log('Handling Google login success:', googleResponse);
      
      // Exchange Google credential for backend tokens
      const result = await this.exchangeGoogleToken(googleResponse.credential);
      
      // Store tokens in localStorage
      localStorage.setItem('token', result.tokens.access);
      localStorage.setItem('refreshToken', result.tokens.refresh);
      
      return {
        user: result.user || googleResponse.user,
        token: result.tokens.access
      };
    } catch (error) {
      console.error('Error handling Google login:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  static isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  }

  // Get current user from token
  static getCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      // Decode JWT token to get user info
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  // Logout function
  static logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Also sign out from Google
    if (window.google && window.google.accounts) {
      window.google.accounts.id.disableAutoSelect();
    }
  }
}

export default GoogleOAuthService;
