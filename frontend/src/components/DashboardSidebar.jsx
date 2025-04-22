import { motion } from 'framer-motion';
import { slideInLeft } from '../pages/LandingPage';
import {
  FiTrendingUp,
  FiPlus,
  FiPackage,
  FiGrid,
  FiHelpCircle,
  FiCheckCircle
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
        
        {/* Overview Section */}
        <div className="sidebar-section">
          <nav className="sidebar-nav">
              <ul>
                <li 
                  className={activeTab === 'overview' ? 'active' : ''}
                  onClick={() => setActiveTab('overview')}
                >
                  <FiGrid /> Overview
                </li>
              </ul>
          </nav>
        </div>

        


        {/* Seller Section */}
        <div className="sidebar-section">
          <h3 className="section-title">Seller Tools</h3>
          <button 
          className="create-order-button"
          onClick={() => setActiveTab('item')}
          >
            <FiPlus /> Sell Items
          </button>
          <nav className="sidebar-nav">
              <ul>
                <li 
                  className={activeTab === 'sales' ? 'active' : ''}
                  onClick={() => setActiveTab('sales')}
                >
                  <FiTrendingUp /> Item Sales
                </li>
              </ul>
          </nav>
        </div>

        {/* Buyer Section */}
        <div className="sidebar-section">
          <h3 className="section-title">Buyer Tools</h3>
          <button 
          className="create-order-button"
          onClick={() => setActiveTab('create')}
          >
            <FiPlus /> Create Order
          </button>

          <nav className="sidebar-nav">
            <ul>
              <li 
                className={activeTab === 'confirm' ? 'active' : ''}
                onClick={() => setActiveTab('confirm')}
              >
                <FiCheckCircle /> Order Confirm
              </li>
              <li 
                className={activeTab === 'orders' ? 'active' : ''}
                onClick={() => setActiveTab('orders')}
              >
                <FiPackage /> Order History
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
      </div>
    </motion.aside>
  );
};

export default DashboardSidebar;