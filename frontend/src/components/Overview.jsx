import { useState, useEffect } from 'react';
import { 
  FiDollarSign,
  FiTrendingUp,
  FiShoppingCart,
  FiClock,
  FiUser,
  FiPackage,
  FiCalendar
} from 'react-icons/fi';
import axios from 'axios';
import StatCard from './StatCard';
import '../styles/Overview.css';

const Overview = () => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState({ user: {} });
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    today: 0,
    month: 0,
    totalOrders: 0,
    pendingOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);

  function decodeJWT(token) {
    if (!token) return null;
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  }

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

      if (!token) {
      console.warn("No token found, skipping user details fetch");
      return;
      }

      try {
      const response = await axios.get('https://h13-redstone-goats.vercel.app/v1/user/details', {
          headers: {
          'Authorization': `Bearer ${token}`,
          }
      });
      console.log(response.data);
      setCurrentUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user details:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
      }
    };
  
      fetchUserDetails();

    const fetchOverviewData = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const payload = decodeJWT(token);

        const response = await axios.post(
            `https://h13-redstone-goats.vercel.app/v1/${payload.userId}/order/history`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log(response.data);

        setStats({
          today: response.data.todaySales || 0,
          month: response.data.monthSales || 0,
          totalOrders: response.data.totalOrders || 0,
          pendingOrders: response.data.pendingOrders || 0
        });

        const allOrders = [
          ...(response.data.successfulOrders || []),
          ...(response.data.cancelledOrders || [])
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
         .slice(0, 3);

        setRecentOrders(allOrders);

      } catch (err) {
        console.error('Error fetching overview data:', err);
        setError(err.response?.data?.error || 'Failed to load overview data');
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="overview-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return <div className="overview-error">{error}</div>;
  }

  return (
    <div className="overview-container">
      <div className="overview-header">
        <h2>Business Overview</h2>
        <h3>Welcome {currentUser.user.name}!</h3>
      </div>
      
      <div className="stats-grid">
        <StatCard 
          icon={<FiDollarSign />}
          title="Today's Sales"
          value={formatCurrency(stats.today)}
        />
        <StatCard 
          icon={<FiTrendingUp />}
          title="This Month"
          value={formatCurrency(stats.month)}
        />
        <StatCard 
          icon={<FiShoppingCart />}
          title="Total Orders"
          value={stats.totalOrders}
        />
        <StatCard 
          icon={<FiClock />}
          title="Pending Orders"
          value={stats.pendingOrders}
        />
      </div>

      <div className="recent-orders-section">
        <h3>Recent Orders</h3>
        {recentOrders.length > 0 ? (
          <div className="recent-orders-grid">
            {recentOrders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <span className="order-id">#{order.id}</span>
                  <span className={`status-badge ${order.status}`}>
                    {order.status}
                  </span>
                </div>
                <div className="order-details">
                  <div className="customer">
                    <FiUser size={16} />
                    <span>{order.buyer?.name || 'N/A'}</span>
                  </div>
                  <div className="order-meta">
                    <div className="meta-item">
                      <FiCalendar size={14} />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="meta-item">
                      <FiPackage size={14} />
                      <span>{order.items?.length || 0} items</span>
                    </div>
                  </div>
                  <div className="order-total">
                    {formatCurrency(order.totalPrice)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-orders">
            <p>No recent orders found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Overview;