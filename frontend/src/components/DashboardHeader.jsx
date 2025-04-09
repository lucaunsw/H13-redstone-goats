import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemVariants } from '../pages/LandingPage';
import { 
  FiBell,
  FiUser,
  FiLogOut,
  FiSettings,
  FiChevronDown 
} from 'react-icons/fi';
import '../styles/DashboardHeader.css';
import axios from 'axios';

const DashboardHeader = () => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState({ user: {} });
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);


  // Sample notifications data
  const notifications = [
    { id: 1, text: 'New order received from John Doe', time: '2 mins ago', read: false },
    { id: 2, text: 'Your product has been shipped', time: '1 hour ago', read: true },
    { id: 3, text: 'Payment received for order #12345', time: '3 hours ago', read: true },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };

   
  }, []);



  useEffect(() => {

    const getAuthToken = () => {
      return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    };
    
    const fetchUserDetails = async () => {
        
      const token = getAuthToken();

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
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <motion.header className="dashboard-header" variants={itemVariants}>
      <h1>Dashboard</h1>
      <div className="user-controls">
        {/* Notifications */}
        <div className="notifications-wrapper" ref={notificationsRef}>
          <button 
            className="notifications-button"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <FiBell />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>
          
          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <h3>Notifications</h3>
                <span className="mark-all-read">Mark all as read</span>
              </div>
              <div className="notifications-list">
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`notification-item ${notification.read ? '' : 'unread'}`}
                  >
                    <p>{notification.text}</p>
                    <span className="notification-time">{notification.time}</span>
                  </div>
                ))}
              </div>
              <div className="notifications-footer">
                <button className="view-all">View All Notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div className="profile-menu-wrapper" ref={profileRef}>
          <button 
            className="profile-button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="profile-avatar">
              <FiUser />
            </div>
            <span>{currentUser.user.name}</span>
            <FiChevronDown className={`dropdown-icon ${showProfileMenu ? 'open' : ''}`} />
          </button>
          
          {showProfileMenu && (
            <div className="profile-dropdown">
              <div className="profile-info">
                <div className="profile-avatar large">
                  <FiUser />
                </div>
                <div className="profile-details">
                  <h4>{currentUser.user.name}</h4>
                  <p>{currentUser.user.email}</p>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item">
                <FiSettings /> Settings
              </button>
              <button 
                className="dropdown-item"
                onClick={() => navigate('/')}
              >
                <FiLogOut /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default DashboardHeader;