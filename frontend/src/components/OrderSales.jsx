import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    FiDownload, 
    FiFileText, 
    FiPieChart, 
    FiPrinter,
    FiDollarSign,
    FiShoppingCart,
    FiClock
 } from 'react-icons/fi';
import '../styles/OrderSales.css';
import StatCard from './StatCard';
import axios from 'axios';

const OrderSales = () => {
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('month');
  const [format, setFormat] = useState('table');
  const [salesData, setSalesData] = useState([]);
  const [summaryData, setSummaryData] = useState({});
  const [loading, setLoading] = useState(true);

  function decodeJWT(token) {
    if (!token) return null;
    const payload = token.split('.')[1]; // JWT format: header.payload.signature
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  }

  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  const payload = decodeJWT(token);

  

  // Calculate summary statistics
  const calculateSummary = (data) => {
    const summary = {
      totalSales: data.reduce((sum, order) => sum + Number(order.price)*order.amountSold, 0),
      completedOrders: data.filter(o => o.status === 'completed').length,
      pendingOrders: data.filter(o => o.status === 'pending').length,
      averageOrder: data.length > 0 
        ? data.reduce((sum, order) => sum + Number(order.price)*order.amountSold, 0) / data.length 
        : 0
    };
    setSummaryData(summary);
  };

  // Handle export download
  const handleExport = async (type) => {
    try {
      const response = await axios.get(
        `https://h13-redstone-goats.vercel.app/v1/order/${payload.userId}/sales`,
        {
          params: { [type]: true },
          responseType: type === 'pdf' ? 'blob' : 'json',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      

      if (type === 'pdf') {
        // Handle PDF download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `sales_report_${new Date().toISOString().split('T')[0]}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else if (type === 'csv') {
        // Handle CSV download
        const url = response.data.CSVurl;
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error(`Error exporting ${type}:`, error);
      alert(`Failed to export ${type.toUpperCase()} report`);
    }
  };

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setLoading(true);
  
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  
        const response = await axios.get(
          `https://h13-redstone-goats.vercel.app/v1/order/${payload.userId}/sales`,
          {
            params: { json: true },
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        console.log(response.data);
        setSalesData(response.data.sales || []);
        calculateSummary(response.data.sales || []);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.error || 'Failed to load order sales');
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchSalesData();
  }, [timeRange, payload.userId]);
  

  return (
    <motion.div 
      className="dashboard-container"
      initial="hidden"
      animate="visible"
    >
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
         <main className="dashboard-main order-sales">
        <div className="sales-header">
          <div className="controls">
            <div className="time-range">
              {['week', 'month', 'year'].map((range) => (
                <button
                  key={range}
                  className={timeRange === range ? 'active' : ''}
                  onClick={() => setTimeRange(range)}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>

            <div className="export-options">
              <button onClick={() => handleExport('csv')}>
                <FiDownload /> CSV
              </button>
              <button onClick={() => handleExport('pdf')}>
                <FiFileText /> PDF
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading sales data...</p>
          </div>
        ) : (
          <>
            <div className="stats-grid">
              <StatCard
                icon={<FiDollarSign />}
                title="Total Sales"
                value={`$${summaryData.totalSales?.toFixed(2) || '0.00'}`}
                trend="up"
              />
              <StatCard
                icon={<FiShoppingCart />}
                title="Completed Orders"
                value={summaryData.completedOrders || 0}
              />
              <StatCard
                icon={<FiClock />}
                title="Pending Orders"
                value={summaryData.pendingOrders || 0}
              />
              <StatCard
                icon={<FiPieChart />}
                title="Avg. Order Value"
                value={`$${summaryData.averageOrder?.toFixed(2) || '0.00'}`}
              />
            </div>

            <div className="view-options">
              {['table', 'chart'].map((view) => (
                <button
                  key={view}
                  className={format === view ? 'active' : ''}
                  onClick={() => setFormat(view)}
                >
                  {view === 'table' ? <FiFileText /> : <FiPieChart />}{" "}
                  {view.charAt(0).toUpperCase() + view.slice(1)} View
                </button>
              ))}
            </div>

            {format === 'table' ? (
              <div className="sales-table-container">
                <table className="sales-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Product</th>
                      <th>Description</th>
                      <th>Amount Sold</th>
                      <th>Price</th>
                      <th>Total</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesData?.length > 0 ? (
                      salesData.map((order) => (
                        <tr key={order.id}>
                          <td>{order.id}</td>
                          <td>
                            {order.name}
                          </td>
                          <td>{order.description}</td>
                          <td>{order.amountSold}</td>
                          <td>${Number(order.price).toFixed(2)}</td>
                          <td>${Number(order.price).toFixed(2)*order.amountSold}</td>
                          <td>
                            <button
                              className="print-btn"
                              onClick={() => window.print()}
                              aria-label="Print Order"
                            >
                              <FiPrinter />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7">No sales data available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="chart-placeholder">
                <div className="chart-mockup">
                  {salesData?.slice(0, 5).map((order, index) => {
                    const heightPercentage =
                      summaryData.totalSales && summaryData.totalSales !== 0
                        ? (Number(order.amount) / summaryData.totalSales) * 100
                        : 0;

                    return (
                      <div
                        key={index}
                        className="chart-bar"
                        style={{
                          height: `${heightPercentage}%`,
                          backgroundColor: `hsl(${index * 70}, 70%, 50%)`,
                        }}
                      ></div>
                    );
                  })}
                </div>
                <p>Sales visualization for {timeRange}</p>
              </div>
            )}
          </>
        )}
      </main>
    </motion.div>
  );
};

export default OrderSales;