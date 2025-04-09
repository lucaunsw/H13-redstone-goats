import { motion } from 'framer-motion';
import { popIn } from '../pages/LandingPage';
import '../styles/StatCard.css';

const StatCard = ({ icon, title, value }) => {
  return (
    <motion.div className="stat-card" variants={popIn}>
      <div className="stat-icon">
        {icon}
      </div>
      <div className="stat-info">
        <h3>{title}</h3>
        <p>{value}</p>
      </div>
    </motion.div>
  );
};

export default StatCard;