import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiChevronDown,
  FiChevronUp,
  FiCreditCard,
  FiTruck,
  FiPackage,
  FiUser
} from 'react-icons/fi';
import axios from 'axios';
import '../styles/Dashboard.css';
import '../styles/OrderConfirm.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, when: "beforeChildren" }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

const expandVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: { 
    height: "auto", 
    opacity: 1,
    transition: { duration: 0.3, ease: "easeInOut" }
  },
  exit: { 
    height: 0, 
    opacity: 0,
    transition: { duration: 0.3, ease: "easeInOut" }
  }
};

const OrderConfirm = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0
  });
  const [successMessage, setSuccessMessage] = useState('');


  function decodeJWT(token) {
    if (!token) return null;
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  }

  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  const payload = decodeJWT(token);

  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        setLoading(true);
        const response = await axios.post(
          `https://h13-redstone-goats.vercel.app/v1/${payload.userId}/order/history`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const pendingOrders = (response.data.successfulOrders || [])
          .filter(order => order.status === 'pending');

        setOrders(pendingOrders);
        setStats({
          totalOrders: pendingOrders.length,
          pendingOrders: pendingOrders.length
        });

      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.error || 'Failed to load pending orders');
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPendingOrders();
  }, [payload.userId, token]);

  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const handleOrderAction = async (orderId, action) => {
    try {
      setLoading(true);

      let response;
      let reason = '';

      if (action === 'confirm') {
        response = await axios.post(
          `https://h13-redstone-goats.vercel.app/v1/${payload.userId}/order/${orderId}/confirm`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        response = await axios.put(
          `https://h13-redstone-goats.vercel.app/v1/${payload.userId}/order/${orderId}/cancel`,
          reason,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }   

      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      setStats(prevStats => ({
        ...prevStats,
        totalOrders: prevStats.totalOrders - 1,
        pendingOrders: prevStats.pendingOrders - 1
      }));

      if (response.status === 200) {
        setSuccessMessage('Order sucessfully' + action +  '!');
        setTimeout(() => setSuccessMessage(''), 5000);
      }

    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || `Failed to ${action} order`);
      } else {
        setError(`An error occurred while trying to ${action} the order`);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const renderOrderDetails = (order) => {
    return (
      <motion.div 
        className="order-details-expanded"
        variants={expandVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="order-details-expanded-content">
          <div className="details-section-expanded">
            <h4><FiUser /> Customer Information</h4>
            <div className="details-grid-expanded">
              <div>
                <span className="detail-label-expanded">Name:</span>
                <span>{order.buyer?.name || 'N/A'}</span>
              </div>
              <div>
                <span className="detail-label-expanded">Email:</span>
                <span>{order.buyer?.email || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="details-section-expanded">
            <h4><FiTruck /> Delivery Information</h4>
            <div className="details-grid-expanded">
              <div>
                <span className="detail-label-expanded">Address:</span>
                <span>
                  {order.delivery?.streetName || 'N/A'}, {order.delivery?.cityName || 'N/A'}, {order.delivery?.postalZone || 'N/A'}
                </span>
              </div>
              <div>
                <span className="detail-label-expanded">Delivery Dates:</span>
                <span>
                  {order.delivery?.startDate ? formatDate(order.delivery.startDate) : 'N/A'} to{' '}
                  {order.delivery?.endDate ? formatDate(order.delivery.endDate) : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="details-section-expanded">
            <h4><FiCreditCard /> Payment Information</h4>
            <div className="details-grid-expanded">
              <div>
                <span className="detail-label-expanded">Card:</span>
                <span>•••• •••• •••• {order.billingDetails?.creditCardNumber?.slice(-4) || 'N/A'}</span>
              </div>
              <div>
                <span className="detail-label-expanded">Expires:</span>
                <span>{order.billingDetails?.expiryDate || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="details-section-expanded">
            <h4><FiPackage /> Items ({order.items?.length || 0})</h4>
            <table className="items-table-expanded">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name || 'N/A'}</td>
                    <td>{item.description || 'N/A'}</td>
                    <td>{order.quantities?.[index] || 0}</td>
                    <td>{formatCurrency(item.price)}</td>
                    <td>{formatCurrency((order.quantities?.[index] || 0) * item.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div 
      className="order-history-expanded-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="order-history-header-expanded" variants={itemVariants}>
        <h2>Order Confirmation</h2>
        <p>Review and confirm or cancel pending orders</p>
      </motion.div>

      {error && (
        <motion.div 
          className="error-message-expanded"
          variants={itemVariants}
        >
          {error}
        </motion.div>
      )}

      {successMessage && (
        <motion.div
        className="success-message"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        >
        <div className="success-icon">✓</div>
        {successMessage}
        </motion.div>
    )}
      
      <motion.div className="stats-grid-expanded" variants={containerVariants}>
        <motion.div className="stat-card-expanded" variants={itemVariants}>
          <div className="stat-icon-expanded">
            <FiClock />
          </div>
          <div className="stat-content-expanded">
            <h3>Pending Orders</h3>
            <p>{stats.pendingOrders}</p>
          </div>
        </motion.div>
      </motion.div>

      {loading ? (
        <motion.div className="loading-spinner-expanded" variants={itemVariants}>
          <motion.div 
            className="spinner-expanded"
            // animate={{ rotate: 360 }}
            // transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          ></motion.div>
          <p>Loading pending orders...</p>
        </motion.div>
      ) : (
        <motion.div className="orders-table-container-expanded" variants={containerVariants}>
          {orders.length === 0 ? (
            <motion.div className="no-orders-message-expanded" variants={itemVariants}>
              <FiCheckCircle size={48} />
              <h3>No pending orders to confirm</h3>
              <p>All pending orders have been processed</p>
            </motion.div>
          ) : (
            <>
              <table className="orders-table-expanded">
                <thead>
                  <tr>
                    <th></th>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <motion.tr 
                      key={order.id} 
                      className="order-row-expanded"
                      onClick={() => toggleOrderDetails(order.id)}
                      variants={itemVariants}
                      whileHover={{ backgroundColor: 'rgba(198, 40, 40, 0.05)' }}
                    >
                      <td className="expand-icon-expanded">
                        {expandedOrderId === order.id ? <FiChevronUp /> : <FiChevronDown />}
                      </td>
                      <td>{order.id}</td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>{order.buyer?.name || 'N/A'}</td>
                      <td>{order.items?.length || 0}</td>
                      <td>{formatCurrency(order.totalPrice)}</td>
                      <td>
                        <span className={`status-badge-expanded ${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="action-buttons-expanded">
                        <motion.button 
                          className="confirm-btn-expanded"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOrderAction(order.id, 'confirm');
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FiCheckCircle /> Confirm
                        </motion.button>
                        <motion.button 
                          className="cancel-btn-expanded"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOrderAction(order.id, 'cancel');
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FiXCircle /> Cancel
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              <AnimatePresence>
                {orders.map((order) => (
                  expandedOrderId === order.id && (
                    <motion.tr 
                      key={`details-${order.id}`}
                      className="details-row-expanded"
                      variants={expandVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <td colSpan="8">
                        {renderOrderDetails(order)}
                      </td>
                    </motion.tr>
                  )
                ))}
              </AnimatePresence>
            </>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default OrderConfirm;

