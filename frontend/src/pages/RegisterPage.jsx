import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import '../styles/Login.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
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
  
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }
  
    if (!agreeTerms) {
      setError("You must agree to the terms and conditions");
      setLoading(false);
      return;
    }
  
    try {

      const response = await axios.post(
        `https://h13-redstone-goats.vercel.app/v1/user/register`,
        
        {
          email: formData.email.trim(),
          password: formData.password.trim(),
          nameFirst: formData.firstName.trim(),
          nameLast: formData.lastName.trim(),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );      
      
      if (response.data.token) {
        const token = response.data.token;
        document.cookie = `token=${token}; path=/; samesite=strict`;
        localStorage.setItem('authToken', response.data.token);
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
  
    } catch (err) {

      if (err.response) {
        const backendError = err.response.data;
        
        if (backendError.message) {
          setError(backendError.message);
        } else if (backendError.error) {
          setError(backendError.error);
        } else if (typeof backendError === 'string') {
          setError(backendError);
        } else if (backendError.errors) {
          setError(backendError.errors.join(', '));
        } else {
          setError('Registration failed. Please try again.');
        }
      } else if (err.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate('/');
  };

  // Animation variants
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
          <h2>Create Account</h2>
          <p>Join RedstoneCo today</p>
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
            <label htmlFor="firstName">First Name</label>
            <motion.input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter your first name"
              required
              disabled={loading}
              whileFocus={{ 
                borderColor: '#e53e3e',
                boxShadow: '0 0 0 2px rgba(229, 62, 62, 0.2)'
              }}
            />
          </motion.div>

          <motion.div className="login-form-group" variants={itemVariants}>
            <label htmlFor="lastName">Last Name</label>
            <motion.input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter your last name"
              required
              disabled={loading}
              whileFocus={{ 
                borderColor: '#e53e3e',
                boxShadow: '0 0 0 2px rgba(229, 62, 62, 0.2)'
              }}
            />
          </motion.div>

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
              placeholder="Create a password (min 8 characters)"
              required
              minLength="8"
              disabled={loading}
              whileFocus={{ 
                borderColor: '#e53e3e',
                boxShadow: '0 0 0 2px rgba(229, 62, 62, 0.2)'
              }}
            />
          </motion.div>

          <motion.div className="login-form-group" variants={itemVariants}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <motion.input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
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
                id="agreeTerms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                whileTap={{ scale: 0.9 }}
                disabled={loading}
              />
              <label htmlFor="agreeTerms">
                I agree to the <a href="/register" className="terms-link">Terms</a> and <a href="/register" className="terms-link">Privacy Policy</a>
              </label>
            </div>
          </motion.div>
          
          <motion.button 
            type="submit" 
            className="auth-login-button"
            variants={itemVariants}
            whileHover={!loading ? buttonHover : {}}
            whileTap={!loading ? buttonTap : {}}
            disabled={!agreeTerms || loading}
          >
            {loading ? (
              <span className="button-loading">
                <span className="spinner"></span> Creating Account...
              </span>
            ) : (
              'Create Account'
            )}
          </motion.button>
        </motion.form>
        
        <motion.div className="login-footer" variants={itemVariants}>
          <p>Already have an account? <motion.a 
            href="/login"
            whileHover={{ color: '#c53030' }}
          >Sign in</motion.a></p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default RegisterPage;