import axios from 'axios';

const API_URL = process.env.VITE_API_URL;

class CommentService {
  // Get all comments
  static async getComments(token) {
    try {
      const response = await axios.get(`${API_URL}/comments/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });

      const data = response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Network error occurred");
    }
  }

  // Get single comment
  static async getComment(commentId, token) {
    try {
      const response = await axios.get(`${API_URL}/comments/${commentId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });

      const data = response.data;
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Network error occurred");
    }
  }

  // Create comment
  static async createComment(postId, comment, token) {
    try {
      const response = await axios.post(`${API_URL}/comments/`, {
        post_id: postId,
        comment: comment,
      }, {
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
  static async updateComment(commentId, comment, token) {
    try {
      const response = await axios.patch(`${API_URL}/comments/${commentId}/`, 
        { comment }, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const updatedComment = response.data;
      return updatedComment;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Network error occurred");
    }
  }

  // Delete comment
  static async deleteComment(commentId, token) {
    try {
      const response = await axios.delete(`${API_URL}/comments/${commentId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return { success: true };
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
}

export default CommentService;
