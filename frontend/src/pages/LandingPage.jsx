import '../App.css';
import '../styles/Header.css';
import '../styles/Hero.css';
import '../styles/Features.css';
import '../styles/Pricing.css';
import '../styles/Contact.css';
import '../styles/Footer.css';
import '../styles/Buttons.css';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Pricing from '../components/Pricing';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

// Animation variants
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 }
  }
};

export const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } }
};

export const slideInLeft = {
  hidden: { x: -50, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.6 } }
};

export const slideInRight = {
  hidden: { x: 50, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.6 } }
};

export const scaleUp = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.5 } }
};

export const popIn = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1, 
    transition: { 
      type: 'spring', 
      stiffness: 200,
      damping: 10
    } 
  }
};

const LandingPage = () => {
  const variants = {
    containerVariants,
    itemVariants,
    fadeIn,
    slideInLeft,
    slideInRight,
    scaleUp,
    popIn
  };

  return (
    <div className="App">
      <Header />
      <Hero variants={variants} />
      <Features variants={variants} />
      <Pricing variants={variants} />
      <Contact variants={variants} />
      <Footer />
    </div>
  );
};

export default LandingPage;