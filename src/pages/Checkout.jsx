import { useState } from "react";
import "../styles/checkout.css";
import logoImage from "../assets/lorislogo.png";
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from "../context/CartContext";
import { db, auth } from "../../firebase/firebaseConfig";
import { setDoc, doc } from "firebase/firestore";

const Checkout = () => {
  // Navigation and state setup
  const navigate = useNavigate();
  const [orderMethod, setOrderMethod] = useState("normal");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    deliveryNotes: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
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
  
  // Handle order submission via normal method
  const handleNormalOrder = async (orderId) => {
    try {
      setIsProcessing(true);
      
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
        status: "pending",
        orderMethod: "website",
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
      alert("We encountered an error processing your order. Please try again or contact customer support.");
      setIsProcessing(false);
    }
  };
  
  // Handle order via WhatsApp
  const handleWhatsAppOrder = (orderId) => {
    // Create WhatsApp message with order details
    let message = `Hello Loris Kenya, I would like to place an order (${orderId}):\n\n`;
    
    message += `*Order Details*\n`;
    message += `------------------\n\n`;
    
    // Add items
    cartItems.forEach((item, index) => {
      message += `${index + 1}) ${item.name} x${item.quantity} - KSh ${(item.price || item.selling_price) * item.quantity}\n`;
    });
    
    message += `\n*Order Summary*\n`;
    message += `Subtotal: KSh ${subtotal}\n`;
    message += `Shipping: ${shipping === 0 ? 'Free' : `KSh ${shipping}`}\n`;
    message += `Tax: KSh ${tax}\n`;
    message += `Total: KSh ${total}\n\n`;
    
    message += `*Delivery Information*\n`;
    message += `Name: ${formData.fullName}\n`;
    message += `Phone: ${formData.phone}\n`;
    message += `Email: ${formData.email}\n`;
    message += `Address: ${formData.address}\n`;
    message += `City: ${formData.city}\n`;
    message += formData.postalCode ? `Postal Code: ${formData.postalCode}\n` : '';
    message += formData.deliveryNotes ? `Notes: ${formData.deliveryNotes}\n` : '';
    
    // WhatsApp business number - replace with the actual business number
    const whatsappNumber = "254112713070"; // Replace with the actual number
    
    // Create WhatsApp URL
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    // Record the order in database before opening WhatsApp
    const saveOrderAndOpenWhatsApp = async () => {
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
          status: "pending",
          orderMethod: "whatsapp",
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
          userDisplayName: user ? user.displayName || '' : formData.fullName
        });
        
        // Clear cart
        clearCart();
        
        // Open WhatsApp in a new tab
        window.open(whatsappURL, '_blank');
        
        // Navigate to success page
        navigate(`/order-success?orderId=${orderId}&via=whatsapp`);
      } catch (error) {
        console.error("Error saving WhatsApp order:", error);
        alert("We encountered an error processing your order. You can still continue to WhatsApp.");
        // Open WhatsApp anyway
        window.open(whatsappURL, '_blank');
        setIsProcessing(false);
      }
    };
    
    saveOrderAndOpenWhatsApp();
  };
  
  // Handle checkout button click
  const handleCheckout = () => {
    // Basic form validation
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address) {
      alert("Please fill in all required fields");
      return;
    }
    
    // Generate order ID
    const orderId = getOrderId();
    
    // Process based on selected order method
    if (orderMethod === "whatsapp") {
      handleWhatsAppOrder(orderId);
    } else {
      handleNormalOrder(orderId);
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
          
          {/* Order Method Selection */}
          <div className="order-method">
            <h2>How would you like to place your order?</h2>
            <div className="order-options">
              <div 
                className={`order-option ${orderMethod === 'normal' ? 'selected' : ''}`}
                onClick={() => setOrderMethod('normal')}
              >
                <div className="option-radio">
                  {orderMethod === 'normal' && <div className="radio-inner"></div>}
                </div>
                <div className="option-label">
                  <span>Standard Order</span>
                  <small>Place your order through our website directly</small>
                </div>
              </div>
              
              <div 
                className={`order-option ${orderMethod === 'whatsapp' ? 'selected' : ''}`}
                onClick={() => setOrderMethod('whatsapp')}
              >
                <div className="option-radio">
                  {orderMethod === 'whatsapp' && <div className="radio-inner"></div>}
                </div>
                <div className="option-label">
                  <span>WhatsApp Order</span>
                  <small>Place your order via WhatsApp for direct communication</small>
                </div>
              </div>
            </div>
            
            {orderMethod === 'whatsapp' && (
              <div className="whatsapp-info">
                <p className="order-instructions">
                  When you click "Place Order", we'll open WhatsApp with your order details pre-filled.
                  You can add any additional comments before sending.
                </p>
              </div>
            )}
          </div>
          
          {/* Checkout Button */}
          <button 
            className="checkout-button" 
            onClick={handleCheckout} 
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : orderMethod === 'whatsapp' ? "Order via WhatsApp" : "Place Order"}
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