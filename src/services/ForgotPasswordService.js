// const API_URL = process.env.VITE_API_URL;

class ForgotPasswordService {
  static async resetPassword(email, newPassword) {
    try {
      // Note: This endpoint is not implemented in the Django backend yet
      // You would need to add password reset functionality to your Django backend
      throw new Error("Password reset functionality not implemented yet");
      
      /*
      const API_URL = process.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/auth/forgot-password/`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.trim(),
          new_password: newPassword
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || "Password reset failed");
      }

      return data;
      */
    } catch (error) {
      throw new Error(error.message || "Network error occurred");
    }
  }
}

export default ForgotPasswordService;
