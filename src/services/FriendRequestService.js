import axios from 'axios';
import TokenRefreshService from './TokenRefreshService';

const API_URL = process.env.VITE_API_URL;

class FriendRequestService {
  
  // Get all friend requests (received and sent)
  static async getFriendRequests() {
    try {
      const { token } = TokenRefreshService.getTokens();
      const response = await axios.get(`${API_URL}/friend-requests/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      throw error;
    }
  }

  // Send a friend request
  static async sendFriendRequest(userId) {
    try {
      const { token } = TokenRefreshService.getTokens();
      const response = await axios.post(`${API_URL}/friend-request/send/${userId}/`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  }

  // Respond to a friend request (accept or decline)
  static async respondToFriendRequest(requestId, action) {
    try {
      const { token } = TokenRefreshService.getTokens();
      const response = await axios.post(`${API_URL}/friend-request/respond/${requestId}/`, {
        action: action // 'accept' or 'decline'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error responding to friend request:', error);
      throw error;
    }
  }

  // Cancel a sent friend request
  static async cancelFriendRequest(requestId) {
    try {
      const { token } = TokenRefreshService.getTokens();
      const response = await axios.delete(`${API_URL}/friend-request/cancel/${requestId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error canceling friend request:', error);
      throw error;
    }
  }

  // Remove a friend
  static async removeFriend(userId) {
    try {
      const { token } = TokenRefreshService.getTokens();
      const response = await axios.delete(`${API_URL}/friend/remove/${userId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  }

  // Get friend status with another user
  static async getFriendStatus(userId) {
    try {
      const { token } = TokenRefreshService.getTokens();
      const response = await axios.get(`${API_URL}/friend-status/${userId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting friend status:', error);
      throw error;
    }
  }

  // Get user's friends list
  static async getUserFriends(userId) {
    try {
      const { token } = TokenRefreshService.getTokens();
      const response = await axios.get(`${API_URL}/users/${userId}/friends/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting user friends:', error);
      throw error;
    }
  }
}

export default FriendRequestService;
