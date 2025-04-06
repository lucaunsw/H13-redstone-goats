import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/Login.css'; // Reusing the same CSS file

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle registration logic here
    console.log({ ...formData, agreeTerms });
  };

  const handleBackClick = () => {
    navigate('/');
  };

  // Animation variants (same as login page)
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
        >
          <svg className="back-icon" viewBox="0 0 24 24">
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" fill="currentColor"/>
          </svg>
        </motion.button>
        
        <motion.div className="login-header" variants={itemVariants}>
          <h2>Create Account</h2>
          <p>Join RedstoneCo today</p>
        </motion.div>
        
        <motion.form 
          onSubmit={handleSubmit} 
          className="login-form"
          variants={containerVariants}
        >
          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="name">First Name</label>
            <motion.input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your first name"
              required
              whileFocus={{ 
                borderColor: '#e53e3e',
                boxShadow: '0 0 0 2px rgba(229, 62, 62, 0.2)'
              }}
            />
          </motion.div>

          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="name">Last Name</label>
            <motion.input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your last name"
              required
              whileFocus={{ 
                borderColor: '#e53e3e',
                boxShadow: '0 0 0 2px rgba(229, 62, 62, 0.2)'
              }}
            />
          </motion.div>

          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="email">Email</label>
            <motion.input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              whileFocus={{ 
                borderColor: '#e53e3e',
                boxShadow: '0 0 0 2px rgba(229, 62, 62, 0.2)'
              }}
            />
          </motion.div>
          
          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="password">Password</label>
            <motion.input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
              whileFocus={{ 
                borderColor: '#e53e3e',
                boxShadow: '0 0 0 2px rgba(229, 62, 62, 0.2)'
              }}
            />
          </motion.div>

          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <motion.input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
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
              />
              <label htmlFor="agreeTerms">
                I agree to the <a href="\register" className="terms-link">Terms</a> and <a href="\register" className="terms-link">Privacy Policy</a>
              </label>
            </div>
          </motion.div>
          
          <motion.button 
            type="submit" 
            className="auth-login-button"
            variants={itemVariants}
            whileHover={buttonHover}
            whileTap={buttonTap}
            disabled={!agreeTerms}
          >
            Create Account
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