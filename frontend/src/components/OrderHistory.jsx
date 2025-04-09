import { useState, useEffect } from 'react';
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

const OrderHistory = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    pendingOrders: 0
  });

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
        
        const totalRevenue = successfulOrders.reduce((sum, order) => sum + order.totalPrice, 0);
        const pendingOrders = successfulOrders.filter(o => o.status === 'pending').length;
  
        setStats({
          totalOrders: allOrders.length,
          totalRevenue,
          completedOrders: successfulOrders.filter(o => o.status === 'completed').length,
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
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const filteredOrders = orders.filter(order => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'completed') return order.status === 'completed';
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
    );
  };

  return (
    <div className="order-history-container">
      <div className="order-history-header">
        <h2>Order History</h2>
      </div>
      {error && <div className="error-message">{error}</div>}
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FiDollarSign />
          </div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p>{formatCurrency(stats.totalRevenue)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FiCheckCircle />
          </div>
          <div className="stat-content">
            <h3>Completed</h3>
            <p>{stats.completedOrders}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FiClock />
          </div>
          <div className="stat-content">
            <h3>Pending</h3>
            <p>{stats.pendingOrders}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FiXCircle />
          </div>
          <div className="stat-content">
            <h3>Cancelled</h3>
            <p>{stats.cancelledOrders}</p>
          </div>
        </div>
      </div>

      <div className="filter-tabs">
        <button 
          className={activeFilter === 'all' ? 'active' : ''}
          onClick={() => setActiveFilter('all')}
        >
          All ({orders.length})
        </button>
        <button 
          className={activeFilter === 'completed' ? 'active' : ''}
          onClick={() => setActiveFilter('completed')}
        >
          Completed ({stats.completedOrders})
        </button>
        <button 
          className={activeFilter === 'pending' ? 'active' : ''}
          onClick={() => setActiveFilter('pending')}
        >
          Pending ({stats.pendingOrders})
        </button>
        <button 
          className={activeFilter === 'cancelled' ? 'active' : ''}
          onClick={() => setActiveFilter('cancelled')}
        >
          Cancelled ({stats.cancelledOrders})
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading order history...</p>
        </div>
      ) : (
        <div className="orders-table-container">
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
                <>
                  <tr 
                    key={order.id} 
                    className="order-row"
                    onClick={() => toggleOrderDetails(order.id)}
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
                      <button 
                        className="print-btn" 
                        onClick={(e) => {
                          e.stopPropagation();
                          window.print();
                        }}
                      >
                        <FiPrinter />
                      </button>
                    </td>
                  </tr>
                  {expandedOrderId === order.id && (
                    <tr className="details-row">
                      <td colSpan="8">
                        {renderOrderDetails(order)}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;