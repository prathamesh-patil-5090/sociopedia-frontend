const API_URL = process.env.VITE_API_URL;

class FriendsListService {
  static async getFriends(userId, token) {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/`, {
        method: "GET",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch user data");
      }
      
      // Return the friends array from the user data
      return Array.isArray(data.friends) ? data.friends : [];
    } catch (error) {
      throw new Error(error.message || "Network error occurred");
    }
  }

  static async addFriend(userId, friendId, token) {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/add_friend/`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ friend_id: friendId }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to add friend");
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(error.message || "Network error occurred");
    }
  }

  static async removeFriend(userId, friendId, token) {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/remove_friend/`, {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ friend_id: friendId }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to remove friend");
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(error.message || "Network error occurred");
    }
  }
}

export default FriendsListService;
