import axios from 'axios';

const API_URL = process.env.VITE_API_URL;

class RegisterService {
  static async register(formData) {
    try {
      console.log("Sending registration request to:", `${API_URL}/register/`);
      
      const response = await axios.post(`${API_URL}/register/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = response.data;
      console.log("Registration response:", response.status, data);
      return data;
    } catch (error) {
      console.error("Registration service error:", error);
      
      const data = error.response?.data;
      
      // If it's a validation error, show detailed field errors
      if (data?.errors) {
        const errorMessages = Object.entries(data.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
        throw new Error(errorMessages);
      }
      
      const errorMessage = data?.error || 
                          data?.message || 
                          `Registration failed (${error.response?.status || 'Network Error'})`;
      throw new Error(errorMessage);
    }
  }

  static validateImageFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      return "Please select a valid image file (JPEG or PNG)";
    }
    
    if (file.size > maxSize) {
      return "Image size must be less than 5MB";
    }
    
    return null;
  }

  static createFormData(values) {
    const formData = new FormData();
    
    // Backend expects these field names (camelCase, not snake_case)
    const fieldMapping = {
      "firstName": "firstName",
      "lastName": "lastName",
      "email": "email",
      "password": "password",
      "location": "location", 
      "occupation": "occupation",
      "username": "username"
    };
    
    Object.keys(fieldMapping).forEach(clientField => {
      const djangoField = fieldMapping[clientField];
      if (values[clientField]) {
        formData.append(djangoField, values[clientField].trim());
      }
    });
    
    if (values.picture) {
      formData.append("picture", values.picture);
    }

    return formData;
  }
}

export default RegisterService;
