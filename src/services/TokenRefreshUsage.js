// Usage examples for TokenRefreshService

import TokenRefreshService from './services/TokenRefreshService';
import ApiHelper from './services/ApiHelper';

// Example 1: Check if user is authenticated when app starts
export const checkAuthOnStart = async () => {
  try {
    const token = await TokenRefreshService.getValidAccessToken();
    return !!token; // Returns true if authenticated, false if logged out
  } catch (error) {
    console.error('Auth check failed:', error);
    return false;
  }
};

// Example 2: Make authenticated API calls (automatically handles token refresh)
export const fetchUserPosts = async (userId) => {
  try {
    const response = await ApiHelper.get('/posts/', { user: userId }, true);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    throw error;
  }
};

// Example 3: Use in React component
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await TokenRefreshService.getValidAccessToken();
        setIsAuthenticated(!!token);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { isAuthenticated, loading };
};

// Example 4: Manual logout
export const handleLogout = () => {
  TokenRefreshService.logout();
  // User will be redirected to /login automatically
};

/* 
INTEGRATION WITH YOUR EXISTING CODE:

1. Replace existing token handling in your services:
   - Instead of: headers: { Authorization: `Bearer ${token}` }
   - Use: await ApiHelper.get('/endpoint', params, true)

2. Update your login flow:
   - LoginService already updated to store tokens
   - Call TokenRefreshService.logout() for logout

3. Add auth check to your app:
   - Call checkAuthOnStart() in your App.js useEffect
   - Use useAuth() hook in components that need auth state

4. Your token refresh will happen automatically:
   - No manual intervention needed
   - Logs errors and redirects on failure
   - Handles 7-day expiration automatically

CURL COMMAND IMPLEMENTATION:
The TokenRefreshService.refreshToken() method implements your exact curl command:

curl --request POST \
  --url http://localhost:8000/api/token/refresh/ \
  --header 'content-type: application/json' \
  --data '{"refresh": "your_refresh_token"}'

This happens automatically when tokens expire!
*/
