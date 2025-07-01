// Example of how to use TokenService in your React components and services

import TokenService from './services/TokenService';
import ApiHelper from './services/ApiHelper';

// Example 1: Check if user is authenticated on app start
export const checkAuthOnAppStart = () => {
  const { token, refreshToken } = TokenService.getTokens();
  
  if (!token || !refreshToken) {
    console.log('No tokens found, user needs to login');
    return false;
  }
  
  // Check if refresh token is expired (7 days)
  if (TokenService.isRefreshTokenExpired(refreshToken)) {
    console.log('Refresh token expired, redirecting to login');
    TokenService.redirectToLogin();
    return false;
  }
  
  return true;
};

// Example 2: Making an authenticated API call with automatic token refresh
export const makeAuthenticatedCall = async () => {
  try {
    // This will automatically refresh token if needed
    const response = await ApiHelper.get('/posts/', { page: 1, limit: 10 }, true);
    return response.data;
  } catch (error) {
    console.error('API call failed:', error.message);
    throw error;
  }
};

// Example 3: Manual token refresh
export const manualTokenRefresh = async () => {
  try {
    const { refreshToken } = TokenService.getTokens();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const newTokens = await TokenService.refreshToken(refreshToken);
    TokenService.setTokens(newTokens.access, newTokens.refresh);
    console.log('Tokens refreshed successfully');
    
    return newTokens.access;
  } catch (error) {
    console.error('Token refresh failed:', error.message);
    TokenService.clearTokens();
    TokenService.redirectToLogin();
    throw error;
  }
};

// Example 4: Using in a React component
export const useAuthToken = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await TokenService.getValidToken();
        setIsAuthenticated(!!token);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);
  
  return isAuthenticated;
};

/* 
HOW TO INTEGRATE WITH YOUR EXISTING SERVICES:

1. Update your login process to store tokens:
   - In LoginService.login(), call TokenService.setTokens(access, refresh)
   
2. Update your protected API calls:
   - Replace manual token handling with ApiHelper methods
   - Example: ApiHelper.post('/posts/', data, true) for authenticated requests
   
3. Add token validation to your app startup:
   - Call TokenService.validateTokens() on app initialization
   
4. Handle logout:
   - Call TokenService.clearTokens() and redirect to login

5. For existing services that need gradual migration:
   - Use TokenService.getValidToken() to get a fresh token
   - This method will automatically refresh if needed
*/
