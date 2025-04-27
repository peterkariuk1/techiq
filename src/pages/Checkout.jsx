import { useState } from "react";
import "../styles/checkout.css";
import logoImage from "../assets/lorislogo.png";
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from "../context/CartContext";
import axios from "axios";
import { db, auth } from "../../firebase/firebaseConfig";
import { setDoc, doc } from "firebase/firestore";

// Backend API URL
const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000/api';

const Checkout = () => {
  // Navigation and state setup
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    deliveryNotes: "",
    mpesaPhone: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [checkoutRequestID, setCheckoutRequestID] = useState(null);
  const { cart: cartItems, updateQuantity, removeFromCart: removeItem, clearCart } = useCart();
  
  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => total + (item.price ? item.price * item.quantity : item.selling_price * item.quantity), 0);
  const shipping = subtotal > 5000 ? 0 : 100; // Free shipping over KSh 5000
  const tax = subtotal * 0.16; // 16% VAT
  const total = subtotal + shipping + tax;
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Generate order ID
  const getOrderId = () => {
    return `LOR-${Date.now().toString().substring(7)}`;
  };
  
  // Handle M-PESA payment
  const handleMpesaPayment = async () => {
    if (!formData.mpesaPhone) {
      alert("Please enter your M-PESA phone number");
      return;
    }
    
    // Updated regex to handle both 07 and 01 phone numbers
    const phoneRegex = /^(0|\+254|254)[17][0-9]{8}$/;
    if (!phoneRegex.test(formData.mpesaPhone)) {
      alert("Please enter a valid M-PESA phone number (e.g., 0712345678 or 0112345678)");
      return;
    }
    
    try {
      setIsProcessing(true);
      setPaymentStatus("initiating");
      
      // Generate order ID
      const orderId = getOrderId();
      
      // Call backend to initiate STK Push
      const response = await axios.post(`${API_URL}/mpesa/initiate`, {
        phoneNumber: formData.mpesaPhone,
        amount: 1, // Round to nearest shilling
        orderId
      });
      
      if (response.data.success) {
        setCheckoutRequestID(response.data.data.CheckoutRequestID);
        setPaymentStatus("pending");
        
        // Start polling for payment status
        startPollingPaymentStatus(response.data.data.CheckoutRequestID, orderId);
      } else {
        throw new Error(response.data.message || "Failed to initiate payment");
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      setPaymentStatus("failed");
      alert("Payment failed: " + (error.message || "Unknown error"));
      setIsProcessing(false);
    }
  };
  
  // Poll for payment status
  const startPollingPaymentStatus = (requestId, orderId) => {
    let pollCount = 0;
    const maxPolls = 24; // 2 minutes (5 seconds * 24)
    
    const statusCheck = setInterval(async () => {
      try {
        pollCount++;
        
        if (pollCount >= maxPolls) {
          clearInterval(statusCheck);
          setPaymentStatus("timeout");
          setIsProcessing(false);
          return;
        }
        
        const response = await axios.post(`${API_URL}/mpesa/status`, {
          checkoutRequestID: requestId
        });
        
        const result = response.data.data;
        
        // Check if payment is complete
        if (result.ResultCode === "0") {
          // Payment successful
          clearInterval(statusCheck);
          setPaymentStatus("success");
          
          // Process order completion
          handleOrderCompletion(orderId);
        } else if (result.errorCode === "500.001.1001") {
          // Still waiting for user to respond
          console.log("Waiting for user to respond...");
        } else {
          // Payment failed
          clearInterval(statusCheck);
          setPaymentStatus("failed");
          setIsProcessing(false);
          alert("Payment failed: " + result.ResultDesc);
        }
      } catch (error) {
        console.log("Status check error:", error);
        // Don't stop polling on network errors, might just be temporary
      }
    }, 5000); // Check every 5 seconds
  };
  
  // Handle successful order completion
  const handleOrderCompletion = async (orderId) => {
    try {
      // Get current user
      const user = auth.currentUser;
      
      // Create order data
      const orderData = {
        id: orderId,
        userId: user ? user.uid : 'guest',
        userEmail: user ? user.email : formData.email,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price || item.selling_price,
          quantity: item.quantity,
          category: item.category || 'Uncategorized',
          image: item.image || ''
        })),
        subtotal,
        shipping,
        tax,
        total,
        status: "confirmed",
        paymentMethod: paymentMethod,
        shippingAddress: {
          fullName: formData.fullName,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          phone: formData.phone,
          email: formData.email,
          notes: formData.deliveryNotes
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // If user is logged in, save to their collection
      if (user) {
        // Save to user's orders collection
        await setDoc(doc(db, "users", user.uid, "orders", orderId), orderData);
      }
      
      // Always save to main orders collection (for admin access)
      await setDoc(doc(db, "orders", orderId), {
        ...orderData,
        // Add additional fields for admin filtering if user exists
        userDisplayName: user ? user.displayName || '' : formData.fullName
      });
      
      // Clear cart
      clearCart();
      
      // Redirect to success page
      navigate(`/order-success?orderId=${orderId}`);
    } catch (error) {
      console.error("Error saving order:", error);
      alert("Your payment was successful but we encountered an error saving your order. Please contact customer support.");
    }
  };
  
  // Handle checkout button click
  const handleCheckout = () => {
    // Basic form validation
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address) {
      alert("Please fill in all required fields");
      return;
    }
    
    if (paymentMethod === "mpesa") {
      handleMpesaPayment();
    } else {
      // Handle card payment (this would typically be integrated with a payment gateway)
      alert("Card payment integration not implemented yet");
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <img src={logoImage} alt="Loris Perfume" />
        <h1>Checkout</h1>
      </div>
      
      <div className="checkout-container">
        {/* Cart Items Section */}
        <div className="cart-section">
          <h2>Your Cart ({cartItems.length} items)</h2>
          
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <p>Your cart is empty</p>
              <Link to="/">Continue Shopping</Link>
            </div>
          ) : (
            <div className="cart-items">
              {cartItems.map(item => (
                <div className="cart-item" key={item.id}>
                  <div className="cart-item-image">
                    <img 
                      src={item.image || "https://placehold.co/300x300?text=No+Image"} 
                      alt={item.name} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/300x300?text=No+Image";
                      }}
                    />
                  </div>
                  <div className="cart-item-details">
                    <h3>{item.name}</h3>
                    <p className="item-category">{item.category || 'Uncategorized'}</p>
                    <p className="item-price">KSh {(item.price || item.selling_price).toLocaleString()}</p>
                    <div className="quantity-controls">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        +
                      </button>
                    </div>
                  </div>
                  <div className="cart-item-subtotal">
                    <p>KSh {((item.price || item.selling_price) * item.quantity).toLocaleString()}</p>
                    <button 
                      className="remove-item" 
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Checkout Section */}
        <div className="checkout-section">
          {/* Order Summary */}
          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>KSh {subtotal.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : `KSh ${shipping.toLocaleString()}`}</span>
            </div>
            <div className="summary-row">
              <span>Tax (16%)</span>
              <span>KSh {tax.toLocaleString()}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>KSh {total.toLocaleString()}</span>
            </div>
          </div>
          
          {/* Shipping Information */}
          <div className="shipping-info">
            <h2>Shipping Information</h2>
            <div className="form-row">
              <input 
                type="text" 
                name="fullName" 
                placeholder="Full Name" 
                value={formData.fullName} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="form-row">
              <input 
                type="email" 
                name="email" 
                placeholder="Email Address" 
                value={formData.email} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="form-row">
              <input 
                type="tel" 
                name="phone" 
                placeholder="Phone Number" 
                value={formData.phone} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="form-row">
              <input 
                type="text" 
                name="address" 
                placeholder="Delivery Address" 
                value={formData.address} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="form-row double">
              <input 
                type="text" 
                name="city" 
                placeholder="City" 
                value={formData.city} 
                onChange={handleInputChange} 
              />
              <input 
                type="text" 
                name="postalCode" 
                placeholder="Postal Code" 
                value={formData.postalCode} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="form-row">
              <textarea 
                name="deliveryNotes" 
                placeholder="Delivery Notes (Optional)" 
                value={formData.deliveryNotes} 
                onChange={handleInputChange} 
              ></textarea>
            </div>
          </div>
          
          {/* Payment Method */}
          <div className="payment-method">
            <h2>Payment Method</h2>
            <div className="payment-options">
              <div 
                className={`payment-option ${paymentMethod === 'mpesa' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('mpesa')}
              >
                <div className="option-radio">
                  {paymentMethod === 'mpesa' && <div className="radio-inner"></div>}
                </div>
                <div className="option-label">
                  <span>M-PESA</span>
                  <small>Pay via M-PESA mobile money</small>
                </div>
              </div>
              
              <div 
                className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                <div className="option-radio">
                  {paymentMethod === 'card' && <div className="radio-inner"></div>}
                </div>
                <div className="option-label">
                  <span>Card Payment</span>
                  <small>Pay with Visa, Mastercard or American Express</small>
                </div>
              </div>
            </div>
            
            {/* M-PESA Payment Form */}
            {paymentMethod === 'mpesa' && (
              <div className="mpesa-form">
                <p className="payment-instructions">
                  Enter your phone number to receive an M-PESA payment prompt
                </p>
                <div className="form-row">
                  <input 
                    type="tel" 
                    name="mpesaPhone" 
                    placeholder="Phone Number (e.g. 0712345678)" 
                    value={formData.mpesaPhone} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>
            )}
            
            {/* Card Payment Form */}
            {paymentMethod === 'card' && (
              <div className="card-form">
                <div className="form-row">
                  <input type="text" placeholder="Card Holder Name" />
                </div>
                <div className="form-row">
                  <input type="text" placeholder="Card Number" />
                </div>
                <div className="form-row double">
                  <input type="text" placeholder="Expiry Date (MM/YY)" />
                  <input type="text" placeholder="CVV" />
                </div>
              </div>
            )}
          </div>
          
          {/* Checkout Button */}
          <button 
            className="checkout-button" 
            onClick={handleCheckout} 
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : paymentMethod === 'mpesa' ? "Pay with M-PESA" : "Pay with Card"}
          </button>
          
          <p className="back-to-shopping">
            <Link to="/products">Continue Shopping</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;