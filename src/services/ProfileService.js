const API_URL = process.env.VITE_API_URL;

class ProfileService {
  static async getUser(userId, token) {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/`, {
        method: "GET",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(error.message || "Network error occurred");
    }
  }

  static async updateUser(userId, userData, token) {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/`, {
        method: "PATCH",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update user data");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(error.message || "Network error occurred");
    }
  }

  static async updateUserPicture(userId, formData, token) {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/upload_picture/`, {
        method: "PATCH",
        headers: { 
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to update profile picture");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(error.message || "Network error occurred");
    }
  }
}

export default ProfileService;
