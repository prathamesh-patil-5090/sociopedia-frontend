import axios from 'axios';
import TokenService from './TokenService';
import ApiHelper from './ApiHelper';

const API_URL = process.env.VITE_API_URL;

class PostsService {
  // Get all posts with pagination (with automatic token refresh)
  static async getPosts(token = null, page = 1, limit = 10) {
    try {
      // For posts, we can allow both authenticated and unauthenticated access
      const { token: storedToken } = TokenService.getTokens();
      const hasToken = storedToken || token;

      if (hasToken) {
        // Use authenticated request with auto-refresh
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
      } else {
        // Use public request for unauthenticated users
        const response = await ApiHelper.get('/posts/', { page, limit }, false);
        const data = response.data;
        
        if (Array.isArray(data)) {
          return { posts: data, pagination: null };
        }
        
        return {
          posts: Array.isArray(data.posts) ? data.posts : [],
          pagination: data.pagination || null
        };
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Network error occurred");
    }
  }

  // Get user posts with pagination (with automatic token refresh)
  static async getUserPosts(userId, token = null, page = 1, limit = 10) {
    try {
      const { token: storedToken } = TokenService.getTokens();
      const hasToken = storedToken || token;

      if (hasToken) {
        // Use authenticated request with auto-refresh
        const response = await ApiHelper.get('/posts/', { user: userId, page, limit }, true);
        const data = response.data;
        
        if (Array.isArray(data)) {
          return { posts: data, pagination: null };
        }
        
        return {
          posts: Array.isArray(data.posts) ? data.posts : [],
          pagination: data.pagination || null
        };
      } else {
        // Use public request for unauthenticated users
        const response = await ApiHelper.get('/posts/', { user: userId, page, limit }, false);
        const data = response.data;
        
        if (Array.isArray(data)) {
          return { posts: data, pagination: null };
        }
        
        return {
          posts: Array.isArray(data.posts) ? data.posts : [],
          pagination: data.pagination || null
        };
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Network error occurred");
    }
  }

  // Create post (with automatic token refresh)
  static async createPost(formData, token) {
    try {
      const response = await ApiHelper.post('/posts/', formData, true, {
        'Content-Type': 'multipart/form-data'
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Network error occurred");
    }
  }

  // Update post
  static async updatePost(postId, data, token) {
    try {
      const response = await axios.patch(`${API_URL}/posts/${postId}/`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });
      
      const updatedPost = response.data;
      return updatedPost;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Network error occurred");
    }
  }

  // Delete post
  static async deletePost(postId, userId, token) {
    try {
      const response = await axios.delete(`${API_URL}/posts/${postId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      return { success: true };
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Network error occurred");
    }
  }

  // Like post (with automatic token refresh)
  static async likePost(postId, userId, token) {
    try {
      const response = await ApiHelper.post(`/posts/${postId}/like/`, {}, true);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Network error occurred");
    }
  }

  // Like comment
  static async likeComment(commentId, token) {
    try {
      const response = await axios.post(`${API_URL}/comments/${commentId}/like/`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = response.data;
      return result;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Network error occurred");
    }
  }

  // Update post picture
  static async updatePostPicture(postId, formData, token) {
    try {
      const response = await axios.patch(`${API_URL}/posts/${postId}/upload_picture/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const updatedPost = response.data;
      return updatedPost;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Network error occurred");
    }
  }

  // Delete post picture
  static async deletePostPicture(postId, userId, token) {
    try {
      const response = await axios.delete(`${API_URL}/posts/${postId}/delete_picture/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: { userId },
      });

      const updatedPost = response.data;
      return updatedPost;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Network error occurred");
    }
  }

  // Add comment
  static async addComment(postId, commentData, token) {
    try {
      const response = await axios.post(`${API_URL}/posts/${postId}/comments/`, commentData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const newComment = response.data;
      return newComment;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Network error occurred");
    }
  }

  // Update comment
  static async updateComment(postId, commentId, data, token) {
    try {
      const response = await axios.patch(`${API_URL}/posts/${postId}/comments/${commentId}/`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const updatedComment = response.data;
      return updatedComment;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Network error occurred");
    }
  }

  // Delete comment
  static async deleteComment(postId, commentId, token) {
    try {
      const response = await axios.delete(`${API_URL}/posts/${postId}/comments/${commentId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return { success: true };
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Network error occurred");
    }
  }

  // Fetch image from the Django image API
  static async fetchImage(imagePath, token) {
    try {
      const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
      const response = await axios.get(`${API_URL}/images/${cleanPath}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        responseType: 'blob',
      });

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Failed to fetch image");
    }
  }

  // Get image URL for display (used by components)
  static getImageUrl(imagePath) {
    if (!imagePath) {
      return null;
    }

    // Check if it's already a full URL (Auth0 profile pictures, etc.)
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // Remove leading slash if present
    let cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    
    // Remove assets/ prefix if present since the API endpoint handles it
    if (cleanPath.startsWith('assets/')) {
      cleanPath = cleanPath.substring(7);
    }
    
    // Return the full URL to the Django image API
    return `${API_URL}/images/${cleanPath}`;
  }
}

export default PostsService;
