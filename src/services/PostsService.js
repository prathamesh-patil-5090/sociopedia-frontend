const API_URL = process.env.VITE_API_URL;

class PostsService {
  // Get all posts
  static async getPosts(token = null) {
    try {
      const headers = {
        "Content-Type": "application/json",
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

      const response = await fetch(`${API_URL}/posts/`, {
        method: "GET",
        headers
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      throw new Error(error.message || "Network error occurred");
    }
  }

  // Get user posts
  static async getUserPosts(userId, token = null) {
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

      const response = await fetch(`${API_URL}/posts/?user=${userId}`, {
        method: "GET",
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user posts: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      throw new Error(error.message || "Network error occurred");
    }
  }

  // Create post
  static async createPost(formData, token) {
    try {
      const response = await fetch(`${API_URL}/posts/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      const post = await response.json();
      return post;
    } catch (error) {
      throw new Error(error.message || "Network error occurred");
    }
  }

  // Update post
  static async updatePost(postId, data, token) {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const updatedPost = await response.json();
      return updatedPost;
    } catch (error) {
      throw new Error(error.message || "Network error occurred");
    }
  }

  // Delete post
  static async deletePost(postId, userId, token) {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete post");
      }
      
      return { success: true };
    } catch (error) {
      throw new Error(error.message || "Network error occurred");
    }
  }

  // Like post
  static async likePost(postId, userId, token) {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}/like/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to like post");
      }

      const result = await response.json();
      return result;
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

  // Update post picture
  static async updatePostPicture(postId, formData, token) {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}/upload_picture/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to update picture");

      const updatedPost = await response.json();
      return updatedPost;
    } catch (error) {
      throw new Error(error.message || "Network error occurred");
    }
  }

  // Delete post picture
  static async deletePostPicture(postId, userId, token) {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ picture: null }),
      });

      if (!response.ok) throw new Error("Failed to delete picture");

      const updatedPost = await response.json();
      return updatedPost;
    } catch (error) {
      throw new Error(error.message || "Network error occurred");
    }
  }

  // Add comment
  static async addComment(postId, commentData, token) {
    try {
      const response = await fetch(`${API_URL}/comments/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_id: postId,
          comment: commentData.comment,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      const newComment = await response.json();
      return newComment;
    } catch (error) {
      throw new Error(error.message || "Network error occurred");
    }
  }

  // Update comment
  static async updateComment(postId, commentId, data, token) {
    try {
      const response = await fetch(`${API_URL}/comments/${commentId}/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || "Failed to update comment");
      }

      return responseData;
    } catch (error) {
      throw new Error(error.message || "Network error occurred");
    }
  }

  // Delete comment
  static async deleteComment(postId, commentId, token) {
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

  // Fetch image from the Django image API
  static async fetchImage(imagePath, token) {
    try {
      if (!imagePath) {
        throw new Error("Image path is required");
      }

      // Remove leading slash if present
      const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
      
      const response = await fetch(`${API_URL}/images/${cleanPath}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }

      // Return the response so it can be used to get the blob or URL
      return response;
    } catch (error) {
      throw new Error(error.message || "Network error occurred");
    }
  }

  // Get image URL for display (used by components)
  static getImageUrl(imagePath) {
    if (!imagePath) {
      return null;
    }

    // Remove leading slash if present
    let cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    
    // Remove assets/ prefix if present since the API endpoint handles it
    if (cleanPath.startsWith('assets/')) {
      cleanPath = cleanPath.slice(7); // Remove 'assets/'
    }
    
    // Return the full URL to the Django image API
    return `${API_URL}/images/${cleanPath}`;
  }
}

export default PostsService;
