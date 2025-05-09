import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../utils/auth';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const navigate = useNavigate();
  
  // Animation effect when component mounts
  useEffect(() => {
    document.querySelector('.login-container').classList.add('fade-in');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Log the credentials being sent (remove in production)
    console.log('Attempting login with:', { username });

    try {
      // Use the login utility function with direct parameters
      await login(username, password);
      
      // Redirect to dashboard
      navigate('/');
    } catch (err) {
      console.error('Login error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });

      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message.includes('Network Error')) {
        setError('Cannot connect to the server. Please check your network connection.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-brand">
          <div className="logo">
            <span className="logo-icon">MC</span>
          </div>
          <h1>MCBILLING</h1>
          <p>Admin Dashboard</p>
        </div>
        
        <div className="login-form-container">
          <div className="login-header">
            <h2>Welcome Back</h2>
            <p>Please sign in to continue</p>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <div className="input-icon-wrapper">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <div className="input-icon-wrapper">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              className="login-button" 
              disabled={loading}
            >
              {loading ? (
                <span className="loading-spinner"></span>
              ) : (
                <>
                  <span>Sign In</span>
                  <FaSignInAlt />
                </>
              )}
            </button>
          </form>
        </div>
        
        <div className="login-footer">
          <p>&copy; {year} MCBILLING. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
