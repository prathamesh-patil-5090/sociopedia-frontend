import axios from 'axios';
import TokenService from './TokenService';

const API_URL = process.env.VITE_API_URL;

class ApiHelper {
  // Make an authenticated API request with automatic token refresh
  static async makeAuthenticatedRequest(config) {
    try {
      // Validate tokens first
      if (!TokenService.validateTokens()) {
        throw new Error('Authentication required');
      }

      // Get a valid token (will refresh if needed)
      const token = await TokenService.getValidToken();
      
      if (!token) {
        throw new Error('Authentication failed');
      }

      // Add authorization header
      const requestConfig = {
        ...config,
        baseURL: API_URL,
        headers: {
          ...config.headers,
          'Authorization': `Bearer ${token}`,
        }
      };

      // Make the request
      const response = await axios(requestConfig);
      return response;

    } catch (error) {
      // If it's a 401 error, try to refresh token once more
      if (error.response?.status === 401) {
        try {
          console.log('Got 401, attempting token refresh...');
          const { refreshToken } = TokenService.getTokens();
          
          if (refreshToken && !TokenService.isRefreshTokenExpired(refreshToken)) {
            const newTokens = await TokenService.refreshToken(refreshToken);
            TokenService.setTokens(newTokens.access, newTokens.refresh);
            
            // Retry the original request with new token
            const retryConfig = {
              ...config,
              baseURL: API_URL,
              headers: {
                ...config.headers,
                'Authorization': `Bearer ${newTokens.access}`,
              }
            };
            
            return await axios(retryConfig);
          }
        } catch (refreshError) {
          console.error('Token refresh failed on 401 retry:', refreshError.message);
          TokenService.clearTokens();
          TokenService.redirectToLogin();
        }
      }
      
      throw error;
    }
  }

  // Make a public API request (no auth required)
  static async makePublicRequest(config) {
    try {
      const requestConfig = {
        ...config,
        baseURL: API_URL,
      };

      const response = await axios(requestConfig);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Convenience methods for different HTTP methods
  static async get(url, params = {}, requireAuth = true) {
    const config = { method: 'GET', url, params };
    return requireAuth ? 
      this.makeAuthenticatedRequest(config) : 
      this.makePublicRequest(config);
  }

  static async post(url, data = {}, requireAuth = true, headers = {}) {
    const config = { method: 'POST', url, data, headers };
    return requireAuth ? 
      this.makeAuthenticatedRequest(config) : 
      this.makePublicRequest(config);
  }

  static async patch(url, data = {}, requireAuth = true, headers = {}) {
    const config = { method: 'PATCH', url, data, headers };
    return requireAuth ? 
      this.makeAuthenticatedRequest(config) : 
      this.makePublicRequest(config);
  }

  static async delete(url, data = {}, requireAuth = true) {
    const config = { method: 'DELETE', url, data };
    return requireAuth ? 
      this.makeAuthenticatedRequest(config) : 
      this.makePublicRequest(config);
  }
}

export default ApiHelper;
