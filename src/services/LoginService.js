import axios from 'axios';
import TokenService from './TokenService';

const API_URL = process.env.VITE_API_URL;

class LoginService {
  static async login(credentials) {
    try {
      const response = await axios.post(`${API_URL}/login/`, {
        username: credentials.usernameOrEmail.trim(),
        password: credentials.password,
      });
      
      const data = response.data;
      
      // Store tokens if login is successful
      if (data.access && data.refresh) {
        TokenService.setTokens(data.access, data.refresh);
        console.log('Login successful, tokens stored');
      }
      
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Invalid credentials';
      console.error('Login failed:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  // Logout method to clear tokens
  static logout() {
    TokenService.clearTokens();
    console.log('User logged out, tokens cleared');
  }
}

export default LoginService;
