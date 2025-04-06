import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log({ email, password, rememberMe });
  };

  const handleBackClick = () => {
    navigate(-1); // Goes back to previous page
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
        >
          <svg className="back-icon" viewBox="0 0 24 24">
            <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" fill="currentColor"/>
          </svg>
        </motion.button>
        
        <motion.div className="login-header" variants={itemVariants}>
          <h2>Welcome Back!</h2>
          <p>Sign in to your RedstoneCo account</p>
        </motion.div>
        
        <motion.form 
          onSubmit={handleSubmit} 
          className="login-form"
          variants={containerVariants}
        >
          <motion.div className="form-group" variants={itemVariants}>
            <label htmlFor="email">Email</label>
            <motion.input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
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
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                whileTap={{ scale: 0.9 }}
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
            whileHover={buttonHover}
            whileTap={buttonTap}
          >
            Sign In
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