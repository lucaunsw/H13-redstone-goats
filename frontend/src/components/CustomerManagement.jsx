import { motion } from 'framer-motion';
import { fadeIn } from '../pages/LandingPage';
import '../styles/CustomerManagement.css';

const CustomerManagement = () => {
  return (
    <motion.div className="customer-management" variants={fadeIn}>
      <h2>Customer Management</h2>
      <p>Customer management features coming soon!</p>
    </motion.div>
  );
};

export default CustomerManagement;