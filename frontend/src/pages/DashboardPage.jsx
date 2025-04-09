import { useState } from 'react';
import { motion } from 'framer-motion';
import { containerVariants } from './LandingPage';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import Overview from '../components/Overview';
import OrderHistory from '../components/OrderHistory';
import OrderRecommendations from '../components/OrderRecommendations';
import CreateOrderForm from '../components/CreateOrderForm';
import OrderSales from '../components/OrderSales';
import '../styles/Dashboard.css';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  // const updateOrderStatus = (orderId, newStatus) => {
  //   setOrders(orders.map(order => 
  //     order.id === orderId ? { ...order, status: newStatus } : order
  //   ));

  //   if (newStatus === 'completed' || newStatus === 'shipped') {
  //     setSalesData(prev => ({
  //       ...prev,
  //       pendingOrders: prev.pendingOrders - 1
  //     }));
  //   }
  // };

  return (
    <motion.div 
      className="dashboard-container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <DashboardHeader />
      
      <div className="dashboard-content">
        <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="dashboard-main">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              <Overview />
            </>
          )}

          {/* Create Order Tab */}
          {activeTab === 'create' && (
            <>
              <CreateOrderForm />
            </>
          )}

          {/* Order History Tab */}
          {activeTab === 'orders' && (
            <>
              <OrderHistory />
            </>
          )}

          {/* Order Sales Tab */}
          {activeTab === 'sales' && (
            <>
              <OrderSales />
            </>
          )}
          {/* Order History Tab */}
          {activeTab === 'recommendations' && (
            <>
              <OrderRecommendations />
            </>
          )}
        </main>
      </div>
    </motion.div>
  );
};

export default DashboardPage;