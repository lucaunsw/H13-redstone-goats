import { motion } from 'framer-motion';
import { slideInLeft } from '../pages/LandingPage';
import {
  FiTrendingUp,
  FiPlus,
  FiPackage,
  FiGrid,
  FiHelpCircle 
} from 'react-icons/fi';
import '../styles/DashboardSideBar.css';

const DashboardSidebar = ({ activeTab, setActiveTab }) => {
  return (
    <motion.aside 
      className="dashboard-sidebar" 
      variants={slideInLeft}
      initial="hidden"
      animate="visible"
    >
      <div className="sidebar-content">
        <button 
          className="create-order-button"
          onClick={() => setActiveTab('create')}
        >
          <FiPlus /> Create Order
        </button>

        <button 
          className="create-order-button"
          onClick={() => setActiveTab('item')}
        >
          <FiPlus /> Sell Item
        </button>

        <nav className="sidebar-nav">
          <ul>
            <li 
              className={activeTab === 'overview' ? 'active' : ''}
              onClick={() => setActiveTab('overview')}
            >
              <FiGrid /> Overview
            </li>
            <li 
              className={activeTab === 'orders' ? 'active' : ''}
              onClick={() => setActiveTab('orders')}
            >
              <FiPackage /> Order History
            </li>
            <li 
              className={activeTab === 'sales' ? 'active' : ''}
              onClick={() => setActiveTab('sales')}
            >
              <FiTrendingUp /> Order Sales
            </li>
            <li 
              className={activeTab === 'recommendations' ? 'active' : ''}
              onClick={() => setActiveTab('recommendations')}
            >
              <FiHelpCircle /> Order Recommendations
            </li>
          </ul>
        </nav>
      </div>
    </motion.aside>
  );
};

export default DashboardSidebar;