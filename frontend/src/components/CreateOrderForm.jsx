import { useState } from 'react';
import { motion } from 'framer-motion';
import '../styles/CreateOrderForm.css';


const CreateOrderForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    // Buyer Information
    buyer: {
      name: '',
      streetName: '',
      cityName: '',
      postalZone: '',
      countryCode: ''
    },
    
    // Seller Information (can be multiple)
    sellers: [{
      name: '',
      streetName: '',
      cityName: '',
      postalZone: '',
      countryCode: ''
    }],
    
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
      name: '',
      description: '',
      quantity: 1,
      price: 0
    }],
    
    // Order Metadata
    issueDate: new Date().toISOString().split('T')[0],
    note: ''
  });

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

  const handleSellerChange = (index, field, value) => {
    setFormData(prev => {
      const newSellers = [...prev.sellers];
      newSellers[index][field] = value;
      return { ...prev, sellers: newSellers };
    });
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index][field] = value;
      return { ...prev, items: newItems };
    });
  };

  const addSeller = () => {
    setFormData(prev => ({
      ...prev,
      sellers: [
        ...prev.sellers,
        {
          name: '',
          streetName: '',
          cityName: '',
          postalZone: '',
          countryCode: ''
        }
      ]
    }));
  };

  const removeSeller = (index) => {
    if (formData.sellers.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      sellers: prev.sellers.filter((_, i) => i !== index)
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          name: '',
          description: '',
          quantity: 1,
          price: 0
        }
      ]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const total = calculateTotal();
    const orderData = {
      ...formData,
      totalAmount: total
    };
    onSubmit(orderData);
  };

  return (
    <motion.form 
      onSubmit={handleSubmit}
      className="order-form"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="form-section">
        <h3>Buyer Information</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Company Name</label>
            <input
              type="text"
              value={formData.buyer.name}
              onChange={(e) => handleInputChange('buyer.name', e.target.value)}
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

      <div className="form-section">
        <div className="section-header">
          <h3>Seller Information</h3>
          <button type="button" onClick={addSeller} className="add-button">
            + Add Seller
          </button>
        </div>
        
        {formData.sellers.map((seller, index) => (
          <div key={index} className="seller-group">
            <div className="seller-header">
              <h4>Seller {index + 1}</h4>
              {formData.sellers.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => removeSeller(index)}
                  className="remove-button"
                >
                  Remove
                </button>
              )}
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  value={seller.name}
                  onChange={(e) => handleSellerChange(index, 'name', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Street Address</label>
                <input
                  type="text"
                  value={seller.streetName}
                  onChange={(e) => handleSellerChange(index, 'streetName', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  value={seller.cityName}
                  onChange={(e) => handleSellerChange(index, 'cityName', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Postal Code</label>
                <input
                  type="text"
                  value={seller.postalZone}
                  onChange={(e) => handleSellerChange(index, 'postalZone', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Country Code (ISO)</label>
                <input
                  type="text"
                  value={seller.countryCode}
                  onChange={(e) => handleSellerChange(index, 'countryCode', e.target.value)}
                  required
                  maxLength="2"
                  placeholder="e.g., US, GB, DE"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="form-section">
        <h3>Delivery Information</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Street Address</label>
            <input
              type="text"
              value={formData.delivery.streetName}
              onChange={(e) => handleInputChange('delivery.streetName', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              value={formData.delivery.cityName}
              onChange={(e) => handleInputChange('delivery.cityName', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Postal Code</label>
            <input
              type="text"
              value={formData.delivery.postalZone}
              onChange={(e) => handleInputChange('delivery.postalZone', e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>State/Region</label>
            <input
              type="text"
              value={formData.delivery.countrySubentity}
              onChange={(e) => handleInputChange('delivery.countrySubentity', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Address Line</label>
            <input
              type="text"
              value={formData.delivery.addressLine}
              onChange={(e) => handleInputChange('delivery.addressLine', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Country Code (ISO)</label>
            <input
              type="text"
              value={formData.delivery.countryCode}
              onChange={(e) => handleInputChange('delivery.countryCode', e.target.value)}
              required
              maxLength="2"
              placeholder="e.g., US, GB, DE"
            />
          </div>
          <div className="form-group">
            <label>Delivery Start Date</label>
            <input
              type="date"
              value={formData.delivery.startDate}
              onChange={(e) => handleInputChange('delivery.startDate', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Start Time</label>
            <input
              type="time"
              value={formData.delivery.startTime}
              onChange={(e) => handleInputChange('delivery.startTime', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Delivery End Date</label>
            <input
              type="date"
              value={formData.delivery.endDate}
              onChange={(e) => handleInputChange('delivery.endDate', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>End Time</label>
            <input
              type="time"
              value={formData.delivery.endTime}
              onChange={(e) => handleInputChange('delivery.endTime', e.target.value)}
            />
          </div>
        </div>
      </div>

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
            <div className="form-grid">
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
                  onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
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
            </div>
          </div>
        ))}
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
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>Tax:</span>
              <span>$0.00</span>
            </div>
            <div className="total-row grand-total">
              <span>Total Amount:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="submit-button">
          Create Order
        </button>
      </div>
    </motion.form>
  );
};

export default CreateOrderForm;