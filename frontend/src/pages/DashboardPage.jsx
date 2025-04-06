import '../App.css';
import '../styles/Dashboard.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiShoppingCart,
  FiDollarSign,
  FiUsers,
  FiPackage,
  FiTrendingUp,
  FiPlusCircle,
  FiClock,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';

// Reuse your existing animation variants
import {
  containerVariants,
  itemVariants,
  fadeIn,
  slideInLeft,
  popIn
} from './LandingPage';
import CreateOrderForm from '../components/CreateOrderForm';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [orders, setOrders] = useState([]);
  const [salesData, setSalesData] = useState({});
  const navigate = useNavigate();

  // Load sample data
  useEffect(() => {
    // In a real app, you would fetch this from an API
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

    // Update pending count if needed
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
      {/* Dashboard Header */}
      <motion.header className="dashboard-header" variants={itemVariants}>
        <h1>Dashboard</h1>
        <div className="user-controls">
          <button className="logout-button" onClick={() => navigate('/')}>
            Logout
          </button>
        </div>
      </motion.header>

      {/* Main Dashboard Content */}
      <div className="dashboard-content">
        {/* Sidebar */}
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

        {/* Main Panel */}
        <main className="dashboard-main">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div variants={fadeIn}>
              <h2>Business Overview</h2>
              
              <div className="stats-grid">
                <motion.div className="stat-card" variants={popIn}>
                  <div className="stat-icon">
                    <FiDollarSign />
                  </div>
                  <div className="stat-info">
                    <h3>Today's Sales</h3>
                    <p>${salesData.today?.toFixed(2) || '0.00'}</p>
                  </div>
                </motion.div>

                <motion.div className="stat-card" variants={popIn}>
                  <div className="stat-icon">
                    <FiTrendingUp />
                  </div>
                  <div className="stat-info">
                    <h3>This Month</h3>
                    <p>${salesData.month?.toFixed(2) || '0.00'}</p>
                  </div>
                </motion.div>

                <motion.div className="stat-card" variants={popIn}>
                  <div className="stat-icon">
                    <FiShoppingCart />
                  </div>
                  <div className="stat-info">
                    <h3>Total Orders</h3>
                    <p>{salesData.totalOrders || 0}</p>
                  </div>
                </motion.div>

                <motion.div className="stat-card" variants={popIn}>
                  <div className="stat-icon">
                    <FiClock />
                  </div>
                  <div className="stat-info">
                    <h3>Pending Orders</h3>
                    <p>{salesData.pendingOrders || 0}</p>
                  </div>
                </motion.div>
              </div>

              <motion.div className="recent-orders" variants={fadeIn}>
                <h3>Recent Orders</h3>
                <div className="orders-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Product</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map(order => (
                        <tr key={order.id}>
                          <td>{order.id}</td>
                          <td>{order.customer}</td>
                          <td>{order.product}</td>
                          <td>${(order.price * order.quantity).toFixed(2)}</td>
                          <td>
                            <span className={`status-badge ${order.status}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Create Order Tab */}
          {activeTab === 'create' && (
            <motion.div variants={fadeIn}>
                <h2>Order Create</h2>
                <CreateOrderForm />
            </motion.div>
          )}

          {/* Order History Tab */}
          {activeTab === 'orders' && (
            <motion.div variants={fadeIn}>
              <div className="orders-header">
                <h2>Order History</h2>
                <div className="order-filters">
                  <select>
                    <option value="all">All Orders</option>
                    <option value="pending">Pending</option>
                    <option value="shipped">Shipped</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="orders-table-container">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Customer</th>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.date}</td>
                        <td>{order.customer}</td>
                        <td>{order.product}</td>
                        <td>{order.quantity}</td>
                        <td>${(order.price * order.quantity).toFixed(2)}</td>
                        <td>
                          <span className={`status-badge ${order.status}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="order-actions">
                          {order.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => updateOrderStatus(order.id, 'shipped')}
                                className="action-button shipped"
                              >
                                <FiPackage /> Ship
                              </button>
                              <button 
                                onClick={() => updateOrderStatus(order.id, 'completed')}
                                className="action-button completed"
                              >
                                <FiCheckCircle /> Complete
                              </button>
                            </>
                          )}
                          {order.status === 'shipped' && (
                            <button 
                              onClick={() => updateOrderStatus(order.id, 'completed')}
                              className="action-button completed"
                            >
                              <FiCheckCircle /> Complete
                            </button>
                          )}
                          <button 
                            onClick={() => {
                              if (window.confirm('Are you sure you want to cancel this order?')) {
                                updateOrderStatus(order.id, 'cancelled');
                              }
                            }}
                            className="action-button cancelled"
                          >
                            <FiXCircle /> Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="sales-summary">
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
              </div>
            </motion.div>
          )}

          {/* Customers Tab */}
          {activeTab === 'customers' && (
            <motion.div variants={fadeIn}>
              <h2>Customer Management</h2>
              <p>Customer management features coming soon!</p>
            </motion.div>
          )}
        </main>
      </div>
    </motion.div>
  );
};

export default DashboardPage;