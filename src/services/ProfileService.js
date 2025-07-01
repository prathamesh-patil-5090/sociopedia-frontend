import axios from 'axios';

const API_URL = process.env.VITE_API_URL;

class ProfileService {
  static async getUser(userId, token = null) {
    try {
      const headers = {
        "Content-Type": "application/json"
      };
      
      // Only add Authorization header if token is a valid, non-empty string
      const isValidToken = token && 
                          typeof token === 'string' && 
                          token.trim() !== '' && 
                          token !== 'null' && 
                          token !== 'undefined';
      
      if (isValidToken) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.get(`${API_URL}/users/${userId}/`, {
        headers,
      });
      
      const data = response.data;
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Network error occurred");
    }
  }

  static async updateUser(userId, userData, token) {
    try {
      const response = await axios.patch(`${API_URL}/users/${userId}/`, userData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      const data = response.data;
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Network error occurred");
    }
  }

  static async updateUserPicture(userId, formData, token) {
    try {
      const response = await axios.patch(`${API_URL}/users/${userId}/upload_picture/`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const data = response.data;
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Network error occurred");
    }
  }
}

export default ProfileService;
