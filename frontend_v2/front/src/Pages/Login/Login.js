import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../utils/auth';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState(''); // 'auth_error', 'access_denied', 'network_error'
  const [loading, setLoading] = useState(false);
  const [year] = useState(new Date().getFullYear());
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const navigate = useNavigate();
  
  // Animation effect when component mounts
  useEffect(() => {
    document.querySelector('.login-container').classList.add('fade-in');
  }, []);

  // Reset error states when user starts typing
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (errorType) setErrorType('');
    if (error) setError('');
  };
  
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errorType) setErrorType('');
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorType('');
    setShowAccessDenied(false);
    setLoading(true);

    // Basic validation
    if (!username && !password) {
      setErrorType('both');
      setError('Veuillez saisir votre nom d\'utilisateur et votre mot de passe');
      setLoading(false);
      return;
    }

    if (!username) {
      setErrorType('username');
      setError('Veuillez saisir votre nom d\'utilisateur');
      setLoading(false);
      return;
    }

    if (!password) {
      setErrorType('password');
      setError('Veuillez saisir votre mot de passe');
      setLoading(false);
      return;
    }

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      console.error('Login error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });

      const errorData = err.response?.data || {};
      const errorMessage = errorData.error || 'Échec de la connexion. Veuillez réessayer.';
      
      // Set error type based on response
      if (errorData.errorType === 'access_denied') {
        setErrorType('access_denied');
        setShowAccessDenied(true);
        // Hide the animation after 2 seconds
        setTimeout(() => setShowAccessDenied(false), 2000);
      } else if (errorData.errorType === 'auth_error' || err.response?.status === 401) {
        setErrorType('auth_error');
      } else if (err.message.includes('Network Error')) {
        setErrorType('network_error');
        setError('Impossible de se connecter au serveur. Veuillez vérifier votre connexion réseau.');
        return;
      }
      
      setError(errorMessage);
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
          <p>Tableau de bord d'administration</p>
        </div>
        
        <div className={`login-form-container ${showAccessDenied ? 'access-denied' : ''}`}>
          <div className="login-header">
            <h2>Bienvenue</h2>
            <p>Veuillez vous connecter pour continuer</p>
          </div>
          
          {error && (
            <div className={`error-message ${errorType === 'access_denied' ? 'error-access-denied' : ''}`}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="login-form">
            <div className={`form-group ${errorType === 'username' || errorType === 'both' ? 'error-username' : ''}`}>
              <div className="input-icon-wrapper">
                <FaUser className="input-icon" />
                <input
                  type="text"
                  placeholder="Nom d'utilisateur"
                  value={username}
                  onChange={handleUsernameChange}
                  className="form-control"
                  disabled={loading}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className={`form-group ${errorType === 'password' || errorType === 'both' ? 'error-password' : ''}`}>
              <div className="input-icon-wrapper">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={handlePasswordChange}
                  className="form-control"
                  disabled={loading}
                  autoComplete="current-password"
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
                  <span>Se connecter</span>
                  <FaSignInAlt />
                </>
              )}
            </button>
          </form>
        </div>
        
        <div className="login-footer">
          <p>&copy; {year} MCBILLING. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
