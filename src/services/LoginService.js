const API_URL = process.env.VITE_API_URL;

class LoginService {
  static async login(credentials) {
    try {
      const response = await fetch(`${API_URL}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: credentials.usernameOrEmail.trim(),
          password: credentials.password,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Invalid credentials');
      }

      return data;
    } catch (error) {
      throw new Error(error.message || "Network error occurred");
    }
  }
}

export default LoginService;
