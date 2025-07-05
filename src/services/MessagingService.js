import axios from 'axios';
import TokenRefreshService from './TokenRefreshService';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || process.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const { token } = TokenRefreshService.getTokens();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting tokens:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const MessagingService = {
  // Conversation management
  async getConversations() {
    try {
      const response = await api.get('/conversations/');
      console.log('Conversations API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  async getConversation(conversationId) {
    try {
      const response = await api.get(`/conversations/${conversationId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  },

  async createConversation(otherUserId) {
    try {
      const response = await api.post('/conversations/', {
        other_user_id: otherUserId
      });
      return response.data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  // Message management
  async getMessages(conversationId, page = 1) {
    try {
      const response = await api.get(`/conversations/${conversationId}/messages/`, {
        params: { page }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  async sendMessage(conversationId, content, image = null) {
    try {
      console.log('[MessagingService] Sending message:', {
        conversationId,
        content: content ? content.substring(0, 50) + (content.length > 50 ? '...' : '') : '',
        hasImage: !!image,
        imageType: image ? image.type : null
      });

      const formData = new FormData();
      formData.append('content', content || '');
      if (image) {
        formData.append('image', image);
      }

      const response = await api.post(
        `/conversations/${conversationId}/messages/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      console.log('[MessagingService] Message sent successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('[MessagingService] Error sending message:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  async editMessage(conversationId, messageId, newContent) {
    try {
      const response = await api.put(
        `/conversations/${conversationId}/messages/${messageId}/`,
        { content: newContent }
      );
      return response.data;
    } catch (error) {
      console.error('Error editing message:', error);
      throw error;
    }
  },

  async deleteMessage(conversationId, messageId) {
    try {
      await api.delete(`/conversations/${conversationId}/messages/${messageId}/`);
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  },

  async markMessagesAsRead(conversationId) {
    try {
      const response = await api.post(`/conversations/${conversationId}/mark-read/`);
      return response.data;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  },

  // WebSocket connection management
  createWebSocketConnection(conversationId, token) {
    // Use environment variables with fallbacks
    const wsHost = process.env.REACT_APP_WS_HOST || process.env.VITE_WS_HOST || '127.0.0.1:8000';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${protocol}//${wsHost}/ws/conversations/${conversationId}/?token=${token}`;
    
    console.log('[MessagingService] Creating WebSocket connection to:', url);
    
    const ws = new WebSocket(url);
    
    // Add connection metadata for debugging
    ws._conversationId = conversationId;
    ws._createdAt = new Date().toISOString();
    ws._userId = this.getCurrentUserId();
    
    return ws;
  },

  // Get current user ID for debugging
  getCurrentUserId() {
    try {
      const { token } = TokenRefreshService.getTokens();
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.user_id || payload.sub;
      }
    } catch (error) {
      console.error('[MessagingService] Error getting user ID:', error);
    }
    return null;
  },

  // Helper function to get current user's token
  async getCurrentUserToken() {
    try {
      let { token, refreshToken } = TokenRefreshService.getTokens();
      
      // Check if token exists
      if (!token) {
        console.error('[MessagingService] No access token found');
        return null;
      }
      
      // Check if token is about to expire (only refresh if needed)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        const timeUntilExpiry = expirationTime - currentTime;
        
        // Only refresh if token expires within the next 5 minutes
        if (timeUntilExpiry < 5 * 60 * 1000 && refreshToken) {
          try {
            const refreshResponse = await TokenRefreshService.refreshToken(refreshToken);
            if (refreshResponse.access) {
              token = refreshResponse.access;
              TokenRefreshService.setTokens(token, refreshResponse.refresh || refreshToken);
              console.log('[MessagingService] Token refreshed successfully');
            }
          } catch (refreshError) {
            console.warn('[MessagingService] Token refresh failed, using existing token:', refreshError.message);
            // Continue with existing token
          }
        }
      } catch (decodeError) {
        console.warn('[MessagingService] Could not decode token, using as-is:', decodeError.message);
      }
      
      return token;
    } catch (error) {
      console.error('[MessagingService] Error getting current user token:', error);
      return null;
    }
  }
};

export default MessagingService;
