import { motion } from 'framer-motion';
import '../styles/Header.css';
import logo from '../assets/logo.png'

const Header = () => {
  return (
    <header className="header"> 
      <nav className="navbar"> 
        <motion.div 
          className="logo"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <img src={logo}
            alt = "logo here"
            className = "logo-image"
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
          >
            Login
          </motion.button>
          <motion.button 
            className="register-button"
            whileHover={{ scale: 1.05, backgroundColor: '#b71c1c' }}
            whileTap={{ scale: 0.95 }}
          >
            Register
          </motion.button>
        </div>
      </nav>
    </header>
  );
};

export default Header;