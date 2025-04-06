import { motion } from 'framer-motion';
import FeatureCard from './FeatureCard';
import '../styles/Features.css';
import craftImage from '../assets/craft.png';
import storeImage from '../assets/store.png';
import analyseImage from '../assets/analyse.png';

const Features = ({ variants }) => {
  const features = [
    { 
      title: "Craft", 
      desc: "Easily craft an XML Order Document by providing the required data",
      image: craftImage
    },
    { 
      title: "Store", 
      desc: "All your orders are stored for 24/7 access and retrieval at any time",
      image: storeImage
    },
    { 
      title: "Analyse", 
      desc: "Analyse recommendations for new products or view statistical data based off your orders",
      image: analyseImage
    }
  ];

  return (
    <motion.section 
      id="features" 
      className="features"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={variants.fadeIn}
    >
      <motion.h2 variants={variants.itemVariants}>Key Features</motion.h2>
      <motion.div 
        className="features-grid"
        variants={variants.containerVariants}
      >
        {features.map((feature, index) => (
          <FeatureCard 
            key={index}
            feature={feature}
            variants={variants}
            index={index}
          />
        ))}
      </motion.div>
    </motion.section>
  );
};

export default Features;