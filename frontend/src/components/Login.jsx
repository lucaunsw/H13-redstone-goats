import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import '../styles/Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Replace with your actual backend endpoint
      const response = await axios.post(
        `https://h13-redstone-goats.vercel.app/v1/user/login`,
        {
          email: formData.email.trim(),
          password: formData.password.trim()
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
        }
      );

      // Handle successful login
      const token = response.data;
      
      // Store token securely
      if (rememberMe) {
        localStorage.setItem('authToken', token); 
      } else {
        sessionStorage.setItem('authToken', token); 
      }
      
      // Redirect to dashboard or home
      navigate('/dashboard');

    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                         err.response?.data?.error || 
                         'Login failed. Please try again.';
      
      setError(errorMessage);
      
      if (err.response?.status === 401) {
        setError('Invalid email or password');
      } else if (err.response?.status === 429) {
        setError('Too many attempts. Please wait before trying again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate('/');
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const buttonHover = {
    scale: 1.02,
    transition: { duration: 0.2 }
  };

  const buttonTap = {
    scale: 0.98
  };

  return (
    <motion.div 
      className="login-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="login-card"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.button 
          onClick={handleBackClick}
          className="back-button"
          aria-label="Go back"
          whileHover={{ scale: 1.1, backgroundColor: 'rgba(229, 62, 62, 0.1)' }}
          whileTap={{ scale: 0.95 }}
          disabled={loading}
        >
          <svg className="back-icon" viewBox="0 0 24 24">
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" fill="currentColor"/>
          </svg>
        </motion.button>
        
        <motion.div className="login-header" variants={itemVariants}>
          <h2>Welcome Back!</h2>
          <p>Sign in to your RedstoneCo account</p>
        </motion.div>

        {error && (
          <motion.div 
            className="error-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}
        
        <motion.form 
          onSubmit={handleSubmit} 
          className="login-form"
          variants={containerVariants}
        >
          <motion.div className="login-form-group" variants={itemVariants}>
            <label htmlFor="email">Email</label>
            <motion.input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              disabled={loading}
              whileFocus={{ 
                borderColor: '#e53e3e',
                boxShadow: '0 0 0 2px rgba(229, 62, 62, 0.2)'
              }}
            />
          </motion.div>
          
          <motion.div className="login-form-group" variants={itemVariants}>
            <label htmlFor="password">Password</label>
            <motion.input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              disabled={loading}
              whileFocus={{ 
                borderColor: '#e53e3e',
                boxShadow: '0 0 0 2px rgba(229, 62, 62, 0.2)'
              }}
            />
          </motion.div>
          
          <motion.div className="form-options" variants={itemVariants}>
            <div className="remember-me">
              <motion.input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                whileTap={{ scale: 0.9 }}
                disabled={loading}
              />
              <label htmlFor="rememberMe">Remember me</label>
            </div>
            <motion.a 
              href="/forgot-password" 
              className="forgot-password"
              whileHover={{ color: '#c53030' }}
            >
              Forgot password?
            </motion.a>
          </motion.div>
          
          <motion.button 
            type="submit" 
            className="auth-login-button"
            variants={itemVariants}
            whileHover={!loading ? buttonHover : {}}
            whileTap={!loading ? buttonTap : {}}
            disabled={loading}
          >
            {loading ? (
              <span className="button-loading">
                <span className="spinner"></span> Signing In...
              </span>
            ) : (
              'Sign In'
            )}
          </motion.button>
        </motion.form>
        
        <motion.div className="login-footer" variants={itemVariants}>
          <p>Don't have an account? <motion.a 
            href="/register"
            whileHover={{ color: '#c53030' }}
          >Sign up</motion.a></p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Login;