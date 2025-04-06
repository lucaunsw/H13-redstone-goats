import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../styles/Header.css';
import logo from '../assets/logo.png';

const Header = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleRegisterClick = () => {
    navigate('/register'); // You might want to create a register page later
  };

  return (
    <header className="header"> 
      <nav className="navbar"> 
        <motion.div 
          className="logo"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')} // Add navigation to home on logo click
        >
          <img 
            src={logo}
            alt="logo here"
            className="logo-image"
          />
        </motion.div>
        <ul className="nav-links">
          {['Features', 'Pricing', 'Contact'].map((item) => (
            <motion.li
              key={item}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <a href={`#${item.toLowerCase()}`}>{item}</a>
            </motion.li>
          ))}
        </ul>
        <div className="auth-buttons">
          <motion.button 
            className="login-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLoginClick}
          >
            Login
          </motion.button>
          <motion.button 
            className="register-button"
            whileHover={{ scale: 1.05, backgroundColor: '#b71c1c' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRegisterClick}
          >
            Register
          </motion.button>
        </div>
      </nav>
    </header>
  );
};

export default Header;