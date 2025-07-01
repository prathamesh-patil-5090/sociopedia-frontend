import axios from 'axios';

// const API_URL = process.env.VITE_API_URL;

class ForgotPasswordService {
  static async resetPassword(email, newPassword) {
    try {
      // Note: This endpoint is not implemented in the Django backend yet
      // You would need to add password reset functionality to your Django backend
      throw new Error("Password reset functionality not implemented yet");
      
      /*
      const API_URL = process.env.VITE_API_URL;
      const response = await axios.post(`${API_URL}/auth/forgot-password/`, {
        email: email.trim(),
        new_password: newPassword
      });

      const data = response.data;
      return data;
      */
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Network error occurred");
    }
  }
}

export default ForgotPasswordService;
