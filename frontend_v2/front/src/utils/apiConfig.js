// API configuration utility
import axios from 'axios';

// Default API configuration
const apiConfig = {
  apiPort: 5000, 
  apiUrl: 'http://localhost:5000/api'
};

// Function to load API configuration
export const loadApiConfig = async () => {
  try {
    // Skip external config loading and use hardcoded defaults
    console.log('Using default API configuration:', apiConfig);
    
    // Set the base URL for axios
    axios.defaults.baseURL = apiConfig.apiUrl;
    
    return apiConfig;
  } catch (error) {
    console.warn('Error setting API configuration:', error.message);
    // Continue with default configuration
    return apiConfig;
  }
};

// Function to get the API URL
export const getApiUrl = () => {
  return apiConfig.apiUrl;
};

// Function to get a specific API endpoint URL
export const getApiEndpoint = (endpoint) => {
  return `${apiConfig.apiUrl}/${endpoint}`;
};

// Initialize the API configuration
loadApiConfig();

export default apiConfig;
