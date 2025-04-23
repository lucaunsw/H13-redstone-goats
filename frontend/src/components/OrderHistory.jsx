import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiDollarSign,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiPrinter,
  FiChevronDown,
  FiChevronUp,
  FiCreditCard,
  FiTruck,
  FiPackage,
  FiUser
} from 'react-icons/fi';
import axios from 'axios';
import '../styles/Dashboard.css';
import '../styles/OrderHistory.css';

// Animation variants
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

const OrderHistory = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalCost: 0,
    confirmedOrders: 0,
    cancelledOrders: 0,
    pendingOrders: 0
  });
  const detailRefs = useRef({})

  function decodeJWT(token) {
    if (!token) return null;
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  }

  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  const payload = decodeJWT(token);

  useEffect(() => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    const payload = decodeJWT(token);
  
    const fetchOrderHistory = async () => {
      try {
        setLoading(true);
        const response = await axios.post(
          `https://h13-redstone-goats.vercel.app/v1/${payload.userId}/order/history`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const successfulOrders = response.data.successfulOrders || [];
        const cancelledOrders = response.data.cancelledOrders || [];
        const allOrders = [...successfulOrders, ...cancelledOrders];
  
        setOrders(allOrders);
        
        const totalCost = successfulOrders.reduce((sum, order) => sum + order.totalPrice, 0);
        const pendingOrders = successfulOrders.filter(o => o.status === 'pending').length;
  
        setStats({
          totalOrders: allOrders.length,
          totalCost,
          confirmedOrders: successfulOrders.filter(o => o.status === 'confirmed').length,
          cancelledOrders: cancelledOrders.length,
          pendingOrders
        });
  
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.error || 'Failed to load order history');
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, [payload.userId]);

  const toggleOrderDetails = (orderId) => {
    const nextId = expandedOrderId === orderId ? null : orderId;
    setExpandedOrderId(nextId);
  
    // Scroll into view after expansion
    setTimeout(() => {
      if (nextId && detailRefs.current[nextId]) {
        detailRefs.current[nextId].scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300); // allow animation to start before scrolling
  };

  const filteredOrders = orders.filter(order => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'confirmed') return order.status === 'confirmed';
    if (activeFilter === 'pending') return order.status === 'pending';
    if (activeFilter === 'cancelled') return order.status === 'cancelled';
    return true;
  });

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
        className="order-details"
        variants={expandVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="order-details">
        <div className="details-section">
          <h4><FiUser /> Customer Information</h4>
          <div className="details-grid">
            <div>
              <span className="detail-label">Name:</span>
              <span>{order.buyer?.name || 'N/A'}</span>
            </div>
            <div>
              <span className="detail-label">Email:</span>
              <span>{order.buyer?.email || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="details-section">
          <h4><FiTruck /> Delivery Information</h4>
          <div className="details-grid">
            <div>
              <span className="detail-label">Address:</span>
              <span>
                {order.delivery?.streetName || 'N/A'}, {order.delivery?.cityName || 'N/A'}, {order.delivery?.postalZone || 'N/A'}
              </span>
            </div>
            <div>
              <span className="detail-label">Delivery Dates:</span>
              <span>
                {order.delivery?.startDate ? formatDate(order.delivery.startDate) : 'N/A'} to{' '}
                {order.delivery?.endDate ? formatDate(order.delivery.endDate) : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="details-section">
          <h4><FiCreditCard /> Payment Information</h4>
          <div className="details-grid">
            <div>
              <span className="detail-label">Card:</span>
              <span>•••• •••• •••• {order.billingDetails?.creditCardNumber?.slice(-4) || 'N/A'}</span>
            </div>
            <div>
              <span className="detail-label">Expires:</span>
              <span>{order.billingDetails?.expiryDate || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="details-section">
          <h4><FiPackage /> Items ({order.items?.length || 0})</h4>
          <table className="items-table">
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
      className="order-history-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="order-history-header" variants={itemVariants}>
        <h2>Order History</h2>
      </motion.div>
      
      {error && (
        <motion.div 
          className="error-message"
          variants={itemVariants}
        >
          {error}
        </motion.div>
      )}
      
      <motion.div className="stats-grid" variants={containerVariants}>
        <motion.div className="stat-card" variants={itemVariants}>
          <div className="stat-icon">
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <h3>Total Expenditure</h3>
            <p>{formatCurrency(stats.totalCost)}</p>
          </div>
        </motion.div>
        <motion.div className="stat-card" variants={itemVariants}>
          <div className="stat-icon">
            <FiCheckCircle />
          </div>
          <div className="stat-content">
            <h3>confirmed</h3>
            <p>{stats.confirmedOrders}</p>
          </div>
        </motion.div>
        <motion.div className="stat-card" variants={itemVariants}>
          <div className="stat-icon">
            <FiClock />
          </div>
          <div className="stat-content">
            <h3>Pending</h3>
            <p>{stats.pendingOrders}</p>
          </div>
        </motion.div>
        <motion.div className="stat-card" variants={itemVariants}>
          <div className="stat-icon">
            <FiXCircle />
          </div>
          <div className="stat-content">
            <h3>Cancelled</h3>
            <p>{stats.cancelledOrders}</p>
          </div>
        </motion.div>
      </motion.div>

      <motion.div className="filter-tabs" variants={itemVariants}>
        <motion.button 
          className={activeFilter === 'all' ? 'active' : ''}
          onClick={() => setActiveFilter('all')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          All ({orders.length})
        </motion.button>
        <motion.button 
          className={activeFilter === 'confirmed' ? 'active' : ''}
          onClick={() => setActiveFilter('confirmed')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          confirmed ({stats.confirmedOrders})
        </motion.button>
        <motion.button 
          className={activeFilter === 'pending' ? 'active' : ''}
          onClick={() => setActiveFilter('pending')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          Pending ({stats.pendingOrders})
        </motion.button>
        <motion.button 
          className={activeFilter === 'cancelled' ? 'active' : ''}
          onClick={() => setActiveFilter('cancelled')}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          Cancelled ({stats.cancelledOrders})
        </motion.button>
      </motion.div>

      {loading ? (
        <motion.div 
          className="loading-spinner"
          variants={itemVariants}
        >
          <motion.div 
            className="spinner"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          ></motion.div>
          <p>Loading order history...</p>
        </motion.div>
      ) : (
        <motion.div 
          className="orders-table-container"
          variants={containerVariants}
        >
          <table className="orders-table">
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
              {filteredOrders.map((order) => (
                <motion.tr 
                  key={order.id} 
                  className="order-row"
                  onClick={() => toggleOrderDetails(order.id)}
                  variants={itemVariants}
                  whileHover={{ backgroundColor: 'rgba(198, 40, 40, 0.05)' }}
                >
                  <td className="expand-icon">
                    {expandedOrderId === order.id ? <FiChevronUp /> : <FiChevronDown />}
                  </td>
                  <td>{order.id}</td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>{order.buyer?.name || 'N/A'}</td>
                  <td>{order.items?.length || 0}</td>
                  <td>{formatCurrency(order.totalPrice)}</td>
                  <td>
                    <span className={`status-badge ${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <motion.button 
                      className="print-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.print();
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FiPrinter />
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          <AnimatePresence>
            {filteredOrders.map((order) => (
              expandedOrderId === order.id && (
                <motion.tr 
                  key={`details-${order.id}`}
                  className="details-row"
                  variants={expandVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  ref={(el) => (detailRefs.current[order.id] = el)}
                >
                  <td colSpan="8">
                    {renderOrderDetails(order)}
                  </td>
                </motion.tr>
              )
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
};

export default OrderHistory;