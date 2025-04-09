import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { containerVariants } from './LandingPage';
import DashboardHeader from '../components/DashboardHeader';
import DashboardSidebar from '../components/DashboardSidebar';
import StatCard from '../components/StatCard';
import RecentOrders from '../components/RecentOrders';
import OrdersTable from '../components/OrdersTable';
import SalesSummary from '../components/SalesSummary';
import CustomerManagement from '../components/CustomerManagement';
import CreateOrderForm from '../components/CreateOrderForm';
import { 
  FiDollarSign,
  FiTrendingUp,
  FiShoppingCart,
  FiClock
} from 'react-icons/fi';
import '../styles/Dashboard.css';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [salesData, setSalesData] = useState({});

  // Load sample data
  useEffect(() => {
    const sampleOrders = [
      {
        id: 'ORD-1001',
        customer: 'John Smith',
        product: 'Premium Widget',
        quantity: 2,
        price: 49.99,
        date: '2023-05-15',
        status: 'completed'
      },
      {
        id: 'ORD-1002',
        customer: 'Sarah Johnson',
        product: 'Basic Widget',
        quantity: 5,
        price: 19.99,
        date: '2023-05-16',
        status: 'shipped'
      },
      {
        id: 'ORD-1003',
        customer: 'Michael Brown',
        product: 'Deluxe Widget',
        quantity: 1,
        price: 99.99,
        date: '2023-05-17',
        status: 'pending'
      },
    ];

    const sampleSales = {
      today: 245.67,
      week: 1845.32,
      month: 7542.89,
      totalOrders: sampleOrders.length,
      pendingOrders: sampleOrders.filter(o => o.status === 'pending').length
    };

    setOrders(sampleOrders);
    setSalesData(sampleSales);
  }, []);

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));

    if (newStatus === 'completed' || newStatus === 'shipped') {
      setSalesData(prev => ({
        ...prev,
        pendingOrders: prev.pendingOrders - 1
      }));
    }
  };

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
              <h2>Business Overview</h2>
              
              <div className="stats-grid">
                <StatCard 
                  icon={<FiDollarSign />}
                  title="Today's Sales"
                  value={`$${salesData.today?.toFixed(2) || '0.00'}`}
                />
                <StatCard 
                  icon={<FiTrendingUp />}
                  title="This Month"
                  value={`$${salesData.month?.toFixed(2) || '0.00'}`}
                />
                <StatCard 
                  icon={<FiShoppingCart />}
                  title="Total Orders"
                  value={salesData.totalOrders || 0}
                />
                <StatCard 
                  icon={<FiClock />}
                  title="Pending Orders"
                  value={salesData.pendingOrders || 0}
                />
              </div>

              <RecentOrders orders={orders} />
            </>
          )}

          {/* Create Order Tab */}
          {activeTab === 'create' && (
            <>
              <h2>Create Order</h2>
              <CreateOrderForm />
            </>
          )}

          {/* Order History Tab */}
          {activeTab === 'orders' && (
            <>
              <OrdersTable orders={orders} updateOrderStatus={updateOrderStatus} />
              <SalesSummary orders={orders} />
            </>
          )}

          {/* Customers Tab */}
          {activeTab === 'customers' && <CustomerManagement />}
        </main>
      </div>
    </motion.div>
  );
};

export default DashboardPage;