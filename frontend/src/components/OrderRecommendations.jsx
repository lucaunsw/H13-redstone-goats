import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiThumbsUp, FiStar, FiPlus, FiLoader } from 'react-icons/fi';
import axios from 'axios';
import '../styles/Dashboard.css';
import '../styles/OrderRecommendations.css';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      when: "beforeChildren"
    }
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

const OrderRecommendations = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [limit, setLimit] = useState(6);
  const [isOrdering, setIsOrdering] = useState(false);

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

    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axios.get(
          `https://h13-redstone-goats.vercel.app/v1/order/${payload.userId}/recommendations`,
          {
            params: { limit },
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setRecommendations(response.data.recommendations || []);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        if (err.response?.status === 401) {
          setError('Session expired. Please login again.');
        } else {
          setError(err.response?.data?.error || 'Failed to load recommendations');
        }
      } finally {
        setLoading(false);
      }
    };

    if (payload?.userId) {
      fetchRecommendations();
    }
  }, [payload?.userId, limit]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleNavigate = async (item) => {
    setIsOrdering(true);
    // Add a small delay to ensure the loading screen is visible
    await new Promise(resolve => setTimeout(resolve, 500));
    navigate('/dashboard', {
      state: {
        orderItem: item,
        activeTab: 'create'
      }
    });
    window.location.reload();
  };

  return (
    <motion.div 
      className="recommendations-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Ordering overlay */}
      <AnimatePresence>
        {isOrdering && (
          <motion.div 
            className="ordering-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="ordering-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <FiLoader className="spinner-icon" size={48} />
              <h3>Creating Order...</h3>
              <p>Please wait while we prepare your order</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="recommendations-header" variants={itemVariants}>
        <h2>Recommended For You</h2>
        <div className="recommendations-controls">
          <label>
            Show: 
            <motion.select 
              value={limit} 
              onChange={(e) => setLimit(Number(e.target.value))}
              className="limit-select"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <option value={4}>4 items</option>
              <option value={6}>6 items</option>
              <option value={8}>8 items</option>
              <option value={10}>10 items</option>
            </motion.select>
          </label>
        </div>
      </motion.div>

      {error && (
        <motion.div 
          className="error-message"
          variants={itemVariants}
        >
          {error}
        </motion.div>
      )}

      {loading ? (
        <motion.div 
          className="loading-spinner"
          variants={itemVariants}
        >
          <motion.div 
            className="spinner"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />
          <p>Loading recommendations...</p>
        </motion.div>
      ) : recommendations.length === 0 ? (
        <motion.div 
          className="no-recommendations"
          variants={itemVariants}
        >
          <FiThumbsUp size={48} />
          <p>No recommendations available yet. Start ordering to get personalized suggestions!</p>
        </motion.div>
      ) : (
        <motion.div 
          className="recommendations-grid"
          variants={containerVariants}
        >
          <AnimatePresence>
            {recommendations.map((item) => (
              <motion.div 
                key={`${item.id}-${item.seller.id}`}
                className="recommendation-card"
                variants={itemVariants}
                whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="item-image">
                  {item.imageUrl ? (
                    <motion.img 
                      src={item.imageUrl} 
                      alt={item.name}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    />
                  ) : (
                    <div className="image-placeholder">
                      <FiPlus size={32} />
                    </div>
                  )}
                </div>
                <div className="item-details">
                  <h3 className="item-name">{item.name}</h3>
                  <p className="item-description">{item.description || 'No description available'}</p>
                  <div className="item-seller">
                    <span>Sold by: {item.seller.name}</span>
                  </div>
                  <div className="item-footer">
                    <div className="item-price">
                      {formatCurrency(item.price)}
                    </div>
                    <div className="item-actions">
                      <motion.button 
                        className="add-to-cart"
                        onClick={() => handleNavigate(item)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isOrdering}
                      >
                        {isOrdering ? <FiLoader className="button-spinner" /> : <FiPlus />} 
                        {isOrdering ? 'Ordering...' : 'Order'}
                      </motion.button>
                    </div>
                  </div>
                </div>
                {item.popular && (
                  <motion.div 
                    className="popular-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <FiStar /> Popular
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
};

export default OrderRecommendations;