import axios from 'axios';
import ApiHelper from './ApiHelper';

const API_URL = process.env.VITE_API_URL;

class ProfileService {
  static async getUser(userId, token = null) {
    try {
      // Check if token is valid and not just a string like "null" or "undefined"
      const isValidToken = token && 
                          typeof token === 'string' && 
                          token.trim() !== '' && 
                          token !== 'null' && 
                          token !== 'undefined';
      
      if (isValidToken) {
        // Use ApiHelper for automatic token refresh when authenticated
        // ApiHelper will handle token validation and refresh automatically
        const response = await ApiHelper.get(`/users/${userId}/`, {}, true);
        return response.data;
      } else {
        // For unauthenticated requests, use ApiHelper without auth
        // This allows the backend to return public user data
        const response = await ApiHelper.get(`/users/${userId}/`, {}, false);
        return response.data;
      }
    } catch (error) {
      // Check if token was considered valid for the fallback attempt
      const wasValidToken = token && 
                           typeof token === 'string' && 
                           token.trim() !== '' && 
                           token !== 'null' && 
                           token !== 'undefined';
      
      // If the error is 401 and we have a token, try once more without auth
      // This handles cases where the token might be invalid but the user data is public
      if (error.response?.status === 401 && wasValidToken) {
        try {
          const response = await ApiHelper.get(`/users/${userId}/`, {}, false);
          return response.data;
        } catch (fallbackError) {
          throw new Error(fallbackError.response?.data?.message || fallbackError.message || "Network error occurred");
        }
      }
      throw new Error(error.response?.data?.message || error.message || "Network error occurred");
    }
  }

  static async updateUser(userId, userData, token) {
    try {
      const response = await ApiHelper.patch(`/users/${userId}/`, userData, true);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Network error occurred");
    }
  }

  static async updateUserPicture(userId, formData, token) {
    try {
      const response = await ApiHelper.patch(`/users/${userId}/upload_picture/`, formData, true, {
        'Content-Type': 'multipart/form-data',
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Network error occurred");
    }
  }
}

export default ProfileService;
