import axios from 'axios';
import TokenRefreshService from './TokenRefreshService';

const API_URL = process.env.VITE_API_URL;

class ApiHelper {
  // Make an authenticated API request with automatic token refresh
  static async makeAuthenticatedRequest(config) {
    const requestConfig = {
      ...config,
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      }
    };

    return await TokenRefreshService.makeAuthenticatedRequest(requestConfig);
  }

  // Make a public API request (no auth required)
  static async makePublicRequest(config) {
    const requestConfig = {
      ...config,
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      }
    };

    return await axios(requestConfig);
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
