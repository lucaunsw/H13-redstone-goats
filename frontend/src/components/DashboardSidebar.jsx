import { motion } from 'framer-motion';
import { slideInLeft } from '../pages/LandingPage';
import {
  FiTrendingUp,
  FiPlusCircle,
  FiPackage,
  FiUsers
} from 'react-icons/fi';
import '../styles/DashboardSideBar.css';

const DashboardSidebar = ({ activeTab, setActiveTab }) => {
  return (
    <motion.aside className="dashboard-sidebar" variants={slideInLeft}>
      <nav>
        <ul>
          <li 
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            <FiTrendingUp /> Overview
          </li>
          <li 
            className={activeTab === 'create' ? 'active' : ''}
            onClick={() => setActiveTab('create')}
          >
            <FiPlusCircle /> Create Order
          </li>
          <li 
            className={activeTab === 'orders' ? 'active' : ''}
            onClick={() => setActiveTab('orders')}
          >
            <FiPackage /> Order History
          </li>
          <li 
            className={activeTab === 'customers' ? 'active' : ''}
            onClick={() => setActiveTab('customers')}
          >
            <FiUsers /> Customers
          </li>
        </ul>
      </nav>
    </motion.aside>
  );
};

export default DashboardSidebar;