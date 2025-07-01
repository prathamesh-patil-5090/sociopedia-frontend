import axios from 'axios';

const API_URL = process.env.VITE_API_URL;

class ImageService {
  // Get image URL for display
  static getImageUrl(imagePath) {
    if (!imagePath) return null;
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If it starts with /media, construct full URL
    if (imagePath.startsWith('/media')) {
      return `${API_URL.replace('/api', '')}${imagePath}`;
    }
    
    // If it's just a filename, construct the images API URL
    return `${API_URL}/images/${imagePath}`;
  }

  // Download image
  static async downloadImage(filename, outputName = null) {
    try {
      const response = await axios.get(`${API_URL}/images/${filename}`, {
        responseType: 'blob',
      });
      
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = outputName || filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Failed to download image");
    }
  }

  // Check if image exists
  static async checkImageExists(filename) {
    try {
      const response = await axios.head(`${API_URL}/images/${filename}`);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  // Get image metadata
  static async getImageInfo(filename) {
    try {
      const response = await axios.head(`${API_URL}/images/${filename}`);
      
      return {
        exists: true,
        contentType: response.headers['content-type'],
        contentLength: response.headers['content-length'],
        lastModified: response.headers['last-modified'],
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Failed to get image info");
    }
  }
}

export default ImageService;
