const API_URL = process.env.VITE_API_URL;

class UserService {
  // Get all users
  static async getUsers(token) {
    try {
      const response = await fetch(`${API_URL}/users/`, {
        method: "GET",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      throw new Error(error.message || "Network error occurred");
    }
  }

  // Get user comments
  static async getUserComments(userId, token) {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/comments/`, {
        method: "GET",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch user comments");
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      throw new Error(error.message || "Network error occurred");
    }
  }

  // Add friend
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

  // Remove friend
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

export default UserService;
