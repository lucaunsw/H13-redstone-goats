import { motion } from 'framer-motion';
import { fadeIn } from '../pages/LandingPage';
import '../styles/RecentOrders.css';

const RecentOrders = ({ orders }) => {
  return (
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
  );
};

export default RecentOrders;