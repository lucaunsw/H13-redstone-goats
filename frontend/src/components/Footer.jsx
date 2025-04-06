import { motion } from 'framer-motion';
import '../styles/Footer.css';
import logo from '../assets/logo.png'

const Footer = () => {
  return (
    <motion.footer 
      className="footer"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="footer-content">
        <motion.div 
          className="footer-logo"
          whileHover={{ scale: 1.05, color: "#c62828" }}
        >
          <img src={logo}
            alt="Redstone Co"
            className="footer-image"
          />
        </motion.div>
        <div className="footer-links">
          {['Privacy Policy', 'Terms of Service', 'FAQ'].map((item) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase().replace(' ', '-')}`}
              whileHover={{ scale: 1.05, color: "#c62828" }}
            >
              {item}
            </motion.a>
          ))}
        </div>
        <div className="social-links">
          {['Twitter', 'Facebook', 'LinkedIn'].map((item) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase()}`}
              whileHover={{ scale: 1.1, color: "#c62828" }}
            >
              {item}
            </motion.a>
          ))}
        </div>
      </div>
      <div className="copyright">
        © {new Date().getFullYear()} Redstone Co. All rights reserved.
      </div>
    </motion.footer>
  );
};

export default Footer;