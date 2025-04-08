import { motion } from 'framer-motion';
import { fadeIn } from '../pages/LandingPage';
import '../styles/SalesSummary.css';

const SalesSummary = ({ orders }) => {
  return (
    <motion.div className="sales-summary" variants={fadeIn}>
      <h3>Sales Summary</h3>
      <div className="summary-cards">
        <div className="summary-card">
          <h4>Total Revenue</h4>
          <p>${orders.reduce((sum, order) => 
            order.status !== 'cancelled' ? 
            sum + (order.price * order.quantity) : sum, 0).toFixed(2)}
          </p>
        </div>
        <div className="summary-card">
          <h4>Completed Orders</h4>
          <p>{orders.filter(o => o.status === 'completed').length}</p>
        </div>
        <div className="summary-card">
          <h4>Average Order Value</h4>
          <p>${(orders.reduce((sum, order) => 
            order.status !== 'cancelled' ? 
            sum + (order.price * order.quantity) : sum, 0) / 
            (orders.length || 1)).toFixed(2)}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default SalesSummary;