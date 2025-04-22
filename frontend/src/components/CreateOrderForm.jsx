import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/CreateOrderForm.css';

const CreateOrderForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Buyer Information
    buyer: {
      id: '', 
      name: '',
      email: '',
      phone: '',
      streetName: '',
      cityName: '',
      postalZone: '',
      countryCode: ''
    },
    
    // Billing Details (added to match backend requirements)
    billingDetails: {
      creditCardNumber: '',
      cardHolderName: '',
      expirationDate: '',
      cvv: ''
    },
    
    // Delivery Information
    delivery: {
      streetName: '',
      cityName: '',
      postalZone: '',
      countrySubentity: '',
      addressLine: '',
      countryCode: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: ''
    },
    
    // Order Items 
    items: [{
      id: '', 
      name: '',
      seller: {
        id: '', 
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
      quantity: 1
    }],
    
    // Order Metadata
    issueDate: new Date().toISOString().split('T')[0],
    note: '',
    totalPrice: 0,
    taxAmount: 10,
    taxTotal: 0,
    currency: 'AUD',
    paymentAccountId: 0,
    paymentAccountName: '',
    financialInstitutionBranch: '',
    createdAt: new Date().toISOString()
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState('');
  const [items, setItems] = useState([]);

  // Helper function to update nested state
  const handleInputChange = (path, value) => {
    const paths = path.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      let current = newData;
      
      for (let i = 0; i < paths.length - 1; i++) {
        if (!current[paths[i]]) current[paths[i]] = {};
        current = current[paths[i]];
      }
      
      current[paths[paths.length - 1]] = value;
      return newData;
    });
  };

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
        items: newItems,
        totalPrice: calculateTotal(newItems)
      };
    });
  };

  // Calculate total price
  const calculateTotal = (items = []) => {
    return items.reduce((sum, item) => {
      const quantity = item.quantity || 0;
      const price = item.price || 0;
      return sum + (price * quantity);
    }, 0);
  };

  // Add/remove items
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: '',
          name: '',
          seller: {
            id: '', 
            name: '',
            streetName: '',
            cityName: '',
            postalZone: '',
            countryCode: ''
          },
          price: 0,
          description: '',
          quantity: 1
        }
      ]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
      totalPrice: calculateTotal(prev.items.filter((_, i) => i !== index))
    }));
  };

  function decodeJWT(token) {
    if (!token) return null;
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  }

  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  const payload = decodeJWT(token);

  // Fetch all items from the API when the component mounts
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get(`https://h13-redstone-goats.vercel.app/v1/${payload.userId}/item/all/details`);
        setItems(response.data || []);
      } catch (err) {
        setError('Failed to fetch items');
      }
    };

    fetchItems();
  }, [payload.userId]);

  // Handle item selection from dropdown
  const handleItemSelection = (e, index) => {
    const itemId = e.target.value;
    
    // Find the selected item by ID
    const selectedItemData = items.find(item => item.id === parseInt(itemId));
    
    if (selectedItemData) {
      setFormData(prev => {
        const newItems = [...prev.items];
        
        // Update the specific item at the given index
        newItems[index] = {
          id: selectedItemData.id,
          name: selectedItemData.name,
          description: selectedItemData.description,
          price: selectedItemData.price,
          seller: selectedItemData.seller,
          quantity: newItems[index]?.quantity || 1 // Keep existing quantity or default to 1
        };
        
        return {
          ...prev,
          items: newItems,
          totalPrice: calculateTotal(newItems)
        };
      });
    }
  };

  // Handle form submission
  const handleSubmitConfirmed = async () => {
    setShowSubmitConfirmation(false);
    setIsSubmitting(true);
    setError('');
  
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const payload = decodeJWT(token);
      
      const orderData = {
        items: formData.items,
        quantities: formData.items.map(item => item.quantity),
        buyer: {
          id: payload.userId,  
          name: formData.buyer.name.trim(),
          streetName: formData.buyer.streetName,
          cityName: formData.buyer.cityName,
          postalZone: formData.buyer.postalZone,
          cbcCode: formData.buyer.countryCode  
        },
        billingDetails: {
          creditCardNumber: formData.billingDetails.creditCardNumber,
          CVV: formData.billingDetails.cvv,  
          expiryDate: formData.billingDetails.expirationDate, 
        },
        totalPrice: calculateTotal(formData.items),
        delivery: {
          streetName: formData.delivery.streetName,
          cityName: formData.delivery.cityName,
          postalZone: formData.delivery.postalZone,
          countrySubentity: formData.delivery.countrySubentity,
          addressLine: formData.delivery.addressLine,
          cbcCode: formData.delivery.countryCode,  
          startDate: formData.delivery.startDate,
          startTime: formData.delivery.startTime,
          endDate: formData.delivery.endDate,
          endTime: formData.delivery.endTime
        },
        createdAt: new Date().toISOString(), 
        status: 'pending',
        taxAmount: formData.taxAmount,
        taxTotal: (calculateTotal(formData.items) * (formData.taxAmount / 100)).toFixed(2),
        currency: formData.currency,
        paymentAccountId: formData.paymentAccountId,
        paymentAccountName: formData.paymentAccountName,
        financialInstitutionBranch: formData.financialInstitutionBranch,
        lastEdited: new Date().toISOString() 
      };

      const response = await axios.post('https://h13-redstone-goats.vercel.app/v2/order/create', orderData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data?.orderId) {
        const orderId = response.data.orderId;
        setSuccessMessage('Order created! OrderId: ' + orderId);
        setTimeout(() => setSuccessMessage(''), 5000);
      }
      
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to create order');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
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
      {/* Buyer Information Section */}
      <div className="form-section">
        <h3>Buyer Information</h3>
        <div className="form-grid">
        <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={formData.buyer.name}
              onChange={(e) => handleInputChange('buyer.name', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="text"
              value={formData.buyer.email}
              onChange={(e) => handleInputChange('buyer.email', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="text"
              value={formData.buyer.phone}
              onChange={(e) => handleInputChange('buyer.phone', e.target.value)}
              required
            />
          </div>  
          <div className="form-group">
            <label>Street Address</label>
            <input
              type="text"
              value={formData.buyer.streetName}
              onChange={(e) => handleInputChange('buyer.streetName', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              value={formData.buyer.cityName}
              onChange={(e) => handleInputChange('buyer.cityName', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Postal Code</label>
            <input
              type="text"
              value={formData.buyer.postalZone}
              onChange={(e) => handleInputChange('buyer.postalZone', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Country Code (ISO)</label>
            <input
              type="text"
              value={formData.buyer.countryCode}
              onChange={(e) => handleInputChange('buyer.countryCode', e.target.value)}
              required
              maxLength="2"
              placeholder="e.g., US, GB, DE"
            />
          </div>
        </div>
      </div>

      {/* Order Items Section */}
      <div className="form-section">
        <div className="section-header">
          <h3>Order Items</h3>
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

            {/* Item Selection Dropdown */}
            <div className="form-group">
              <label>Select Item</label>
              <div className="select-group">
                <select 
                  value={item.id || ''}
                  onChange={(e) => handleItemSelection(e, index)}
                >
                  <option value="">-- Select an Item --</option>
                  {items.map((itemOption) => (
                    <option key={itemOption.id} value={itemOption.id}>
                      {itemOption.name} (${itemOption.price})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Item Details (auto-filled when item is selected) */}
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
                <label>Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
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
                <label>Line Total</label>
                <div className="calculated-value">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
              {/* Seller Information Fields */}
              
              <div className="form-group">
                <label>Seller ID</label>
                <input
                  type="number"
                  value={item.seller?.id || ''}
                  onChange={(e) => handleItemChange(index, 'seller.id', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Seller Name</label>
                <input
                  type="text"
                  value={item.seller?.name || ''}
                  onChange={(e) => handleItemChange(index, 'seller.name', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Seller Email</label>
                <input
                  type="email"
                  value={item.seller?.email || ''}
                  onChange={(e) => handleItemChange(index, 'seller.email', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Seller Phone</label>
                <input
                  type="text"
                  value={item.seller?.phone || ''}
                  onChange={(e) => handleItemChange(index, 'seller.phone', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Seller Street Address</label>
                <input
                  type="text"
                  value={item.seller?.streetName || ''}
                  onChange={(e) => handleItemChange(index, 'seller.streetName', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Seller City</label>
                <input
                  type="text"
                  value={item.seller?.cityName || ''}
                  onChange={(e) => handleItemChange(index, 'seller.cityName', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Seller Postal Code</label>
                <input
                  type="text"
                  value={item.seller?.postalZone || ''}
                  onChange={(e) => handleItemChange(index, 'seller.postalZone', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Seller Country Code</label>
                <input
                  type="text"
                  value={item.seller?.countryCode || ''}
                  onChange={(e) => handleItemChange(index, 'seller.countryCode', e.target.value)}
                  maxLength="2"
                  placeholder="e.g., US, GB, DE"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="form-section">
        <h3>Billing Details</h3>
        <div className="form-grid">
          <div className="form-group">
              <label>Payment Account ID</label>
              <input
                type="number"
                value={formData.paymentAccountId}
                onChange={(e) => handleInputChange('paymentAccountId', e.target.value)}
                required
              />
          </div>
          <div className="form-group">
              <label>Payment Account Name</label>
              <input
                type="text"
                value={formData.paymentAccountName}
                onChange={(e) => handleInputChange('paymentAccountName', e.target.value)}
                required
              />
          </div>
          <div className="form-group">
            <label>Credit Card Number</label>
            <input
              type="text"
              value={formData.billingDetails.creditCardNumber}
              onChange={(e) => handleInputChange('billingDetails.creditCardNumber', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Card Holder Name</label>
            <input
              type="text"
              value={formData.billingDetails.cardHolderName}
              onChange={(e) => handleInputChange('billingDetails.cardHolderName', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Expiration Date (MM/YY)</label>
            <input
              type="text"
              value={formData.billingDetails.expirationDate}
              onChange={(e) => handleInputChange('billingDetails.expirationDate', e.target.value)}
              required
              placeholder="MM/YY"
            />
          </div>
          <div className="form-group">
            <label>CVV</label>
            <input
              type="text"
              value={formData.billingDetails.cvv}
              onChange={(e) => handleInputChange('billingDetails.cvv', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Financial Institution Branch</label>
            <input
              type="text"
              value={formData.financialInstitutionBranch}
              onChange={(e) => handleInputChange('financialInstitutionBranch', e.target.value)}
              required
              placeholder="e.g., ANZ, CommBank, NAB"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Tax Rate</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Tax Rate (%)</label>
                <input
                  type="number"
                  min="10"
                  step="0.1"
                  value={formData.taxAmount}
                  onChange={(e) => handleInputChange('taxAmount', e.target.value)}
                  required
                />
          </div>
          <div className="form-group">
                <label>Tax Total</label>
                <div className="calculated-value">
                  ${(calculateTotal(formData.items, formData.quantities).toFixed(2) * (formData.taxAmount / 100).toFixed(2))}
                </div>
              </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Order Summary</h3>
        <div className="summary-grid">
          <div className="form-group">
            <label>Issue Date</label>
            <input
              type="date"
              value={formData.issueDate}
              onChange={(e) => handleInputChange('issueDate', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={formData.note}
              onChange={(e) => handleInputChange('note', e.target.value)}
              rows="3"
            />
          </div>
          <div className="total-summary">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>${calculateTotal(formData.items, formData.quantities).toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>Tax:</span>
              <span>${(calculateTotal(formData.items, formData.quantities).toFixed(2) * (formData.taxAmount / 100).toFixed(2))}</span>
            </div>
            <div className="total-row grand-total">
              <span>Total Amount:</span>
              <span>${(calculateTotal(formData.items, formData.quantities).toFixed(2) * ((100 - formData.taxAmount) / 100).toFixed(2))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showSubmitConfirmation}
        onConfirm={handleSubmitConfirmed}
        onCancel={() => setShowSubmitConfirmation(false)}
        title="Confirm Order Submission"
        message="Are you sure you want to submit this order?"
      />

      {/* Cancel Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showCancelConfirmation}
        onConfirm={() => navigate('/dashboard')}
        onCancel={() => setShowCancelConfirmation(false)}
        title="Cancel Order Creation"
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
            <h3>Order Created Successfully!</h3>
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
          Cancel Order
        </button>
        <button 
          type="button"
          onClick={() => setShowSubmitConfirmation(true)}
          className="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Order...' : 'Create Order'}
        </button>
      </div>
    </motion.form>
  );
};

export default CreateOrderForm;