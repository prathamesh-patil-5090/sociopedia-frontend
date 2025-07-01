import axios from 'axios';

const API_URL = process.env.VITE_API_URL;

class UserService {
  // Get all users
  static async getUsers(token) {
    try {
      const response = await axios.get(`${API_URL}/users/`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      const data = response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Network error occurred");
    }
  }

  // Get user comments
  static async getUserComments(userId, token) {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}/comments/`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      const data = response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Network error occurred");
    }
  }

  // Add friend
  static async addFriend(userId, friendId, token) {
    try {
      const response = await axios.post(`${API_URL}/users/${userId}/add_friend/`, 
        { friend_id: friendId }, 
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );
      
      const data = response.data;
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Network error occurred");
    }
  }

  // Remove friend
  static async removeFriend(userId, friendId, token) {
    try {
      const response = await axios.post(`${API_URL}/users/${userId}/remove_friend/`, 
        { friend_id: friendId }, 
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );
      
      const data = response.data;
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Network error occurred");
    }
  }
}

export default UserService;
