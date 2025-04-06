import { motion } from 'framer-motion';

const PriceCard = ({ plan, variants }) => {
  const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#4CAF50">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
    </svg>
  );

  const XIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#e53935">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
    </svg>
  );

  return (
    <motion.div 
      className={`price-card ${plan.popular ? 'popular' : ''}`}
      variants={variants.popIn}
      whileHover={{ 
        y: plan.popular ? -15 : -10,
        boxShadow: plan.popular 
          ? "0 20px 40px rgba(198, 40, 40, 0.15)"
          : "0 15px 35px rgba(0,0,0,0.1)"
      }}
    >
      <h3>{plan.title}</h3>
      <div className="price">
        <span className="currency"></span>
        {plan.price.split('/')[0]}
        <span className="period">/{plan.price.split('/')[1]}</span>
      </div>
      
      <ul className="feature-list">
        {plan.features.map((feature, i) => (
          <li 
            key={i} 
            className={`feature-item ${feature.disabled ? 'disabled' : ''}`}
          >
            <div className="feature-icon">
              {feature.disabled ? <XIcon /> : <CheckIcon />}
            </div>
            <span className="feature-text">
              {feature.text}
              {feature.tooltip && (
                <span className="feature-tooltip"> ({feature.tooltip})</span>
              )}
            </span>
          </li>
        ))}
      </ul>
      
      <button className="price-cta">
        Choose Plan
      </button>
    </motion.div>
  );
};

export default PriceCard;