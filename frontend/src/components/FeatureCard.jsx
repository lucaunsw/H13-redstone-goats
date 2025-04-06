import { motion } from 'framer-motion';

const FeatureCard = ({ feature, variants, index }) => {
  return (
    <motion.div 
      className="feature-card"
      variants={variants.scaleUp}
      whileHover={{ 
        y: -10, 
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)" 
      }}
    >
      <div className="feature-image-container">
        <img 
          src={feature.image} 
          alt={feature.title} 
          className="feature-image"
        />
      </div>
      <h3>{feature.title}</h3>
      <p>{feature.desc}</p>
    </motion.div>
  );
};

export default FeatureCard;