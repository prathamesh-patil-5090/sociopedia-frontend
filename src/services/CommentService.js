const API_URL = process.env.VITE_API_URL;

class CommentService {
  // Get all comments
  static async getComments(token) {
    try {
      const response = await fetch(`${API_URL}/comments/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      throw new Error(error.message || "Network error occurred");
    }
  }

  // Get single comment
  static async getComment(commentId, token) {
    try {
      const response = await fetch(`${API_URL}/comments/${commentId}/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch comment: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(error.message || "Network error occurred");
    }
  }

  // Create comment
  static async createComment(postId, comment, token) {
    try {
      const response = await fetch(`${API_URL}/comments/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_id: postId,
          comment: comment,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create comment");
      }

      const newComment = await response.json();
      return newComment;
    } catch (error) {
      throw new Error(error.message || "Network error occurred");
    }
  }

  // Update comment
  static async updateComment(commentId, comment, token) {
    try {
      const response = await fetch(`${API_URL}/comments/${commentId}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment }),
      });

      if (!response.ok) {
        throw new Error("Failed to update comment");
      }

      const updatedComment = await response.json();
      return updatedComment;
    } catch (error) {
      throw new Error(error.message || "Network error occurred");
    }
  }

  // Delete comment
  static async deleteComment(commentId, token) {
    try {
      const response = await fetch(`${API_URL}/comments/${commentId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      return { success: true };
    } catch (error) {
      throw new Error(error.message || "Network error occurred");
    }
  }

  // Like comment
  static async likeComment(commentId, token) {
    try {
      const response = await fetch(`${API_URL}/comments/${commentId}/like/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to like comment");
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw new Error(error.message || "Network error occurred");
    }
  }
}

export default CommentService;
