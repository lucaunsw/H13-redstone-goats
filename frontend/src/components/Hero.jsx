import { motion } from 'framer-motion';
import heroImage1 from '../assets/hero.png';
import heroImage2 from '../assets/hero2.png'; 
import '../styles/Hero.css';

const Hero = ({ variants }) => {
  return (
    <motion.section 
      className="hero"
      initial="hidden"
      animate="visible"
      variants={variants.containerVariants}
    >
      <motion.div className="hero-content" variants={variants.slideInLeft}>
        <motion.h1 variants={variants.itemVariants}>Craft orders the Redstone way</motion.h1>
        <motion.p variants={variants.itemVariants}>
          Learn how to craft, store and manage your redstone orders efficiently and easily.
        </motion.p>
        <motion.button 
          className="cta-button"
          variants={variants.itemVariants}
          whileHover={{ 
            scale: 1.05, 
            boxShadow: "0 5px 15px rgba(74, 107, 255, 0.4)" 
          }}
          whileTap={{ scale: 0.95 }}
        >
          Get Started
        </motion.button>
      </motion.div>
      
      <div className="hero-images-container">
        <motion.div 
          className="hero-image"
          variants={variants.slideInRight}
          whileHover={{ scale: 1.02 }}
          initial={{ y: 0 }}
          animate={{ 
            y: [-10, 10, -10],
            transition: {
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        >
          <img 
            src={heroImage1}
            alt="Redstone crafting"
            className="hero-image-content"
          />
        </motion.div>
        
        <motion.div 
          className="hero-image secondary-image"
          variants={variants.slideInRight}
          whileHover={{ scale: 1.02 }}
          initial={{ y: 0 }}
          animate={{ 
            y: [10, -10, 10],
            transition: {
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }
          }}
        >
          <img 
            src={heroImage2}
            alt="Redstone components"
            className="hero-image-content"
          />
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Hero;