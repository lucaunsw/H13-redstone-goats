import { motion } from 'framer-motion';
import { fadeIn } from '../pages/LandingPage';
import {
  FiPackage,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';
import '../styles/OrdersTable.css';

const OrdersTable = ({ orders, updateOrderStatus }) => {
  return (
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
    </motion.div>
  );
};

export default OrdersTable;