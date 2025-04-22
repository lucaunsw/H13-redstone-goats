import { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/CreateOrderForm.css';

const AddItems = () => {

  function decodeJWT(token) {
    if (!token) return null;
    const payload = token.split('.')[1]; // JWT format: header.payload.signature
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  }

  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  const payload = decodeJWT(token);
  const sellerId = payload.userId;

  const navigate = useNavigate();
  const [formData, setFormData] = useState({    
    // Order Items 
    items: [{
      id: '', 
      name: '',
      seller: {
        id: sellerId, 
        name: '',
        email: '',
        phone: '',
        streetName: '',
        cityName: '',
        postalZone: '',
        countryCode: ''
      },
      price: 0,
      description: '',
    }],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState('');


  // Handle item changes
  const handleItemChange = (index, path, value) => {
    const paths = path.split('.');
    setFormData(prev => {
      const newItems = [...prev.items];
      
      // Handle nested paths like 'seller.name'
      if (paths.length > 1) {
        newItems[index] = {
          ...newItems[index],
          [paths[0]]: {
            ...newItems[index][paths[0]],
            [paths[1]]: value
          }
        };
      } else {
        newItems[index] = {
          ...newItems[index],
          [path]: value
        };
      }
      
      return {
        ...prev,
        items: newItems
      };
    });
  };

  // Handle form submission
  const handleSubmitConfirmed = async () => {
    setShowSubmitConfirmation(false);
    setIsSubmitting(true);
    setError('');
  
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      
      const orderData = {
        items: formData.items,
      };

      console.log(orderData);
  
      const response = await axios.post('https://h13-redstone-goats.vercel.app/v1/user/item/add', orderData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 200) {
        setSuccessMessage('Item(s) listed!');
        setTimeout(() => setSuccessMessage(''), 5000);
      }
      
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to list item(s)');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add/remove items
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: '', // Item ID if available
          name: '',
          seller: {
            id: sellerId, 
            name: '',
            streetName: '',
            cityName: '',
            postalZone: '',
            countryCode: ''
          },
          price: 0,
          description: '',
        }
      ],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const ConfirmationDialog = ({ 
    isOpen, 
    onConfirm, 
    onCancel, 
    title, 
    message 
  }) => {
    if (!isOpen) return null;
  
    return (
      <motion.div 
        className="confirmation-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="confirmation-dialog"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
        >
          <h3>{title}</h3>
          <p>{message}</p>
          <div className="confirmation-buttons">
            <button 
              onClick={onConfirm}
              className="confirm-button"
            >
              Confirm
            </button>
            <button 
              onClick={onCancel}
              className="cancel-button"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <motion.form 
      className="order-form"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Order Items Section */}
      <div className="form-section">
        <div className="section-header">
          <h3>List Item</h3>
          <button type="button" onClick={addItem} className="add-button">
            + Add Item
          </button>
        </div>
        
        {formData.items.map((item, index) => (
          <div key={index} className="item-group">
            <div className="item-header">
              <h4>Item {index + 1}</h4>
              {formData.items.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => removeItem(index)}
                  className="remove-button"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Product ID</label>
                <input
                  type="number"
                  value={item.id}
                  onChange={(e) => handleItemChange(index, 'id', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Unit Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.price}
                  onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))}
                  required
                />
              </div>
              <div className="form-group">
                  <label>Seller ID</label>
                  <input
                    type="number"
                    min={sellerId}
                    value={item.seller.id}
                    onChange={(e) => handleItemChange(index, 'seller.id', e.target.value)}
                    required
                  />
                </div>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={item.seller.name}
                  onChange={(e) => handleItemChange(index, 'seller.name', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="text"
                  value={item.seller.email}
                  onChange={(e) => handleItemChange(index, 'seller.email', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  value={item.seller.phone}
                  onChange={(e) => handleItemChange(index, 'seller.phone', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Street Address</label>
                <input
                  type="text"
                  value={item.seller.streetName}
                  onChange={(e) => handleItemChange(index, 'seller.streetName', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  value={item.seller.cityName}
                  onChange={(e) => handleItemChange(index, 'seller.cityName', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Postal Code</label>
                <input
                  type="text"
                  value={item.seller.postalZone}
                  onChange={(e) => handleItemChange(index, 'seller.postalZone', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Country Code (ISO)</label>
                <input
                  type="text"
                  value={item.seller.countryCode}
                  onChange={(e) => handleItemChange(index, 'seller.countryCode', e.target.value)}
                  required
                  maxLength="2"
                  placeholder="e.g., US, GB, DE"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showSubmitConfirmation}
        onConfirm={handleSubmitConfirmed}
        onCancel={() => setShowSubmitConfirmation(false)}
        title="Confirm Item Listing"
        message="Are you sure you want to list this item?"
      />

      {/* Cancel Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showCancelConfirmation}
        onConfirm={() => navigate('/dashboard')}
        onCancel={() => setShowCancelConfirmation(false)}
        title="Cancel Item Listing"
        message="Are you sure you want to cancel? All unsaved changes will be lost."
      />

      {error && (
        <div className="error-message">
          {error}
        </div>
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


      {/* Success Confirmation */}
      {location.state?.showConfirmation && (
        <motion.div 
          className="success-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div 
            className="success-dialog"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <div className="success-icon">✓</div>
            <h3>Item Listed Successfully!</h3>
            <p>{location.state.successMessage}</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="success-button"
            >
              Back to Dashboard
            </button>
          </motion.div>
        </motion.div>
      )}

      <div className="form-actions">
        <button 
          type="button"
          onClick={() => setShowCancelConfirmation(true)}
          className="cancel-form-button"
          disabled={isSubmitting}
        >
          Cancel Listing
        </button>
        <button 
          type="button"
          onClick={() => setShowSubmitConfirmation(true)}
          className="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Listing...' : 'Sell Item'}
        </button>
      </div>
    </motion.form>
  );
};

export default AddItems;