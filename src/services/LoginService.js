import axios from 'axios';

const API_URL = process.env.VITE_API_URL;

class LoginService {
  static async login(credentials) {
    try {
      const response = await axios.post(`${API_URL}/login/`, {
        username: credentials.usernameOrEmail.trim(),
        password: credentials.password,
      });
      
      const data = response.data;
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Invalid credentials';
      throw new Error(errorMessage);
    }
  }
}

export default LoginService;
