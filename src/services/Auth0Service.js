import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { useDispatch } from 'react-redux';
import { setLogin } from '../state';

const API_URL = process.env.VITE_API_URL;

class Auth0Service {
  // Exchange Auth0 token for backend JWT tokens
  static async exchangeAuth0Token(auth0Token) {
    try {
      const response = await axios.post(`${API_URL}/auth0/token-exchange`, {
        token: auth0Token
      });
      
      return response.data;
    } catch (error) {
      console.error('Error exchanging Auth0 token:', error);
      throw error;
    }
  }

  // Handle Auth0 login success
  static async handleAuth0LoginSuccess(user, getAccessTokenSilently) {
    try {
      // Get Auth0 access token
      const auth0Token = await getAccessTokenSilently();
      
      // Exchange for backend tokens
      const result = await this.exchangeAuth0Token(auth0Token);
      
      // Store tokens in localStorage
      localStorage.setItem('token', result.tokens.access);
      localStorage.setItem('refreshToken', result.tokens.refresh);
      
      return result.user;
    } catch (error) {
      console.error('Error handling Auth0 login:', error);
      throw error;
    }
  }

  // Check if user is authenticated via Auth0 or regular login
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
  }
}

// Custom hook for Auth0 integration
export const useAuth0Integration = () => {
  const { user, isAuthenticated, isLoading, loginWithRedirect, getAccessTokenSilently } = useAuth0();
  const dispatch = useDispatch();

  const loginUser = () => {
    loginWithRedirect();
  };

  const exchangeTokenAndLogin = async () => {
    if (isAuthenticated && user) {
      try {
        const result = await Auth0Service.handleAuth0LoginSuccess(user, getAccessTokenSilently);
        
        // Dispatch to Redux store
        dispatch(setLogin({
          user: result,
          token: localStorage.getItem('token')
        }));
        
        return result;
      } catch (error) {
        console.error('Error during token exchange:', error);
        throw error;
      }
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    loginUser,
    exchangeTokenAndLogin
  };
};

export default Auth0Service;
