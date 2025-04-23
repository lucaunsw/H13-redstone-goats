import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { containerVariants } from './LandingPage';
import { useLocation } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import Overview from '../components/Overview';
import OrderHistory from '../components/OrderHistory';
import OrderRecommendations from '../components/OrderRecommendations';
import CreateOrderForm from '../components/CreateOrderForm';
import OrderSales from '../components/OrderSales';
import '../styles/Dashboard.css';
import AddItems from '../components/AddItems';
import OrderConfirm from '../components/OrderConfirm';

const DashboardPage = () => {
  const location = useLocation();
  const [orderItem, setOrderItem] = useState(location.state?.orderItem || null);
  const { activeTab: stateTab } = location.state || {};
  const [activeTab, setActiveTab] = useState(stateTab || 'overview');

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

  useEffect(() => {
    if (activeTab !== 'create') {
      setOrderItem(null);
    }
  }, [activeTab]);

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
            <div class = "main-content">
              <Overview />
            </div>
          )}

          {/* Create Order Tab */}
          {activeTab === 'create' && (
            <div class = "main-content">
              <CreateOrderForm orderItem={orderItem}/>
            </div>
          )}
          {/* Create Order Tab */}
          {activeTab === 'item' && (
            <div class = "main-content">
              <AddItems />
            </div>
          )}

          {/* Order History Tab */}
          {activeTab === 'orders' && (
            <div class = "main-content">
              <OrderHistory />
            </div>
          )}

          {/* Order Sales Tab */}
          {activeTab === 'sales' && (
            <div class = "main-content">
              <OrderSales />
            </div>
          )}
          {/* Order History Tab */}
          {activeTab === 'recommendations' && (
            <div class = "main-content">
              <OrderRecommendations />
            </div>
          )}
          {/* Order Confirm Tab */}
          {activeTab === 'confirm' && (
            <div class = "main-content">
              <OrderConfirm />
            </div>
          )}
        </main>
      </div>
    </motion.div>
  );
};

export default DashboardPage;