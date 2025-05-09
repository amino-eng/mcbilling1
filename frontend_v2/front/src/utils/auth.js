import axios from 'axios';
import { getApiEndpoint } from './apiConfig';

// Function to make API calls
const makeApiCall = async (endpoint, options) => {
  try {
    const url = getApiEndpoint(endpoint);
    console.log(`Making API call to: ${url}`, options);
    
    // Create a complete request config
    const config = {
      url,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };
    
    const response = await axios(config);
    console.log(`API call to ${endpoint} succeeded:`, response.status);
    return response;
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);
    throw error;
  }
};

// Login user
export const login = async (username, password) => {
  console.log('Login function called with:', { username, passwordLength: password?.length });
  
  try {
    // Make sure we're sending the credentials in the correct format
    const response = await makeApiCall('auth/login', {
      method: 'POST',
      data: { username, password }
    });
    
    console.log('Login response:', response.data);
    
    if (response.data.token) {
      // Store user details in localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Set default authorization header for future requests
      setAuthHeader(response.data.token);
      
      // Dispatch an event to notify the app about the authentication change
      window.dispatchEvent(new Event('auth-change'));
    } else {
      console.warn('Login succeeded but no token was returned');
    }
    
    return response.data;
  } catch (error) {
    console.error('Login function error:', error.message);
    throw error;
  }
};

// Logout user
export const logout = () => {
  // Remove user details from localStorage
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Remove authorization header
  axios.defaults.headers.common['Authorization'] = '';
  
  // Dispatch an event to notify the app about the authentication change
  window.dispatchEvent(new Event('auth-change'));
};

// Set authorization header
export const setAuthHeader = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Get current user
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return localStorage.getItem('isAuthenticated') === 'true';
};

// Initialize auth state from localStorage
export const initAuth = () => {
  const token = localStorage.getItem('token');
  if (token) {
    setAuthHeader(token);
  }
};
