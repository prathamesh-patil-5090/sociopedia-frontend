import axios from 'axios';

const API_URL = process.env.VITE_API_URL;

class FriendsListService {
  static async getFriends(userId, token) {
    try {
      const response = await axios.get(`${API_URL}/users/${userId}/`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      const data = response.data;
      
      // Return the friends array from the user data
      return Array.isArray(data.friends) ? data.friends : [];
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Network error occurred");
    }
  }

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

export default FriendsListService;
