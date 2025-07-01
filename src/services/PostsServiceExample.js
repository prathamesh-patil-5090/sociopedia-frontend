// Example: Updated PostsService using TokenRefreshService
// This shows how to integrate the new token refresh with your existing services

import ApiHelper from './ApiHelper';
import TokenRefreshService from './TokenRefreshService';

const API_URL = process.env.VITE_API_URL;

class PostsServiceWithTokenRefresh {
  // Get all posts with automatic token refresh
  static async getPosts(page = 1, limit = 10) {
    try {
      // This will automatically handle token refresh if needed
      const response = await ApiHelper.get('/posts/', { page, limit }, true);
      const data = response.data;
      
      // Handle both old format (array) and new format (object with posts and pagination)
      if (Array.isArray(data)) {
        return { posts: data, pagination: null };
      }
      
      return {
        posts: Array.isArray(data.posts) ? data.posts : [],
        pagination: data.pagination || null
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Network error occurred");
    }
  }

  // Get user posts with automatic token refresh
  static async getUserPosts(userId, page = 1, limit = 10) {
    try {
      const response = await ApiHelper.get('/posts/', { user: userId, page, limit }, true);
      const data = response.data;
      
      if (Array.isArray(data)) {
        return { posts: data, pagination: null };
      }
      
      return {
        posts: Array.isArray(data.posts) ? data.posts : [],
        pagination: data.pagination || null
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Network error occurred");
    }
  }

  // Create post with automatic token refresh
  static async createPost(formData) {
    try {
      const response = await ApiHelper.post('/posts/', formData, true, {
        'Content-Type': 'multipart/form-data'
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Network error occurred");
    }
  }

  // Like post with automatic token refresh
  static async likePost(postId) {
    try {
      const response = await ApiHelper.post(`/posts/${postId}/like/`, {}, true);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Network error occurred");
    }
  }

  // Add comment with automatic token refresh
  static async addComment(postId, commentData) {
    try {
      const response = await ApiHelper.post(`/posts/${postId}/comments/`, commentData, true);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Network error occurred");
    }
  }

  // Get posts without authentication (for public viewing)
  static async getPublicPosts(page = 1, limit = 10) {
    try {
      const response = await ApiHelper.get('/posts/', { page, limit }, false);
      const data = response.data;
      
      if (Array.isArray(data)) {
        return { posts: data, pagination: null };
      }
      
      return {
        posts: Array.isArray(data.posts) ? data.posts : [],
        pagination: data.pagination || null
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Network error occurred");
    }
  }
}

export default PostsServiceWithTokenRefresh;

/*
KEY BENEFITS OF THIS APPROACH:

1. AUTOMATIC TOKEN REFRESH:
   - Your curl command runs automatically when tokens expire
   - No manual intervention needed
   - Seamless user experience

2. ERROR HANDLING:
   - Logs user out if refresh fails (API error)
   - Logs user out if 7 days passed (refresh token expired)
   - Console logs all errors for debugging

3. SIMPLIFIED API CALLS:
   - No need to pass tokens manually
   - No need to handle token expiration in components
   - Just call the service methods normally

4. BACKWARDS COMPATIBLE:
   - Works with your existing paginated response format
   - Handles both array and object responses
   - No changes needed to your React components

CONSOLE OUTPUT EXAMPLES:
✅ "Access token expired - attempting refresh..."
✅ "Token refreshed successfully"
❌ "Token refresh failed - logging out user: Error message"
❌ "Refresh token expired (7 days passed) - logging out user"
❌ "Got 401 error - attempting token refresh..."

Your users will stay logged in automatically unless:
- The refresh API fails (network/server error)
- 7 days have passed (refresh token expired)
- Both cases will log them out and redirect to /login
*/
