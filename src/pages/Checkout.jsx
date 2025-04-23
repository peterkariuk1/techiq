import { useState } from "react";
import "../styles/checkout.css";
import logoImage from "../assets/lorislogo.png";
import { Link } from 'react-router-dom';
import { useCart } from "../context/CartContext";

const Checkout = () => {
  // State for payment method selection
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  
  // Get cart data from context
  const { 
    cart: cartItems, 
    updateQuantity, 
    removeFromCart: removeItem 
  } = useCart();
  
  // Helper function to get product image
  const getProductImage = (product) => {
    // Try different possible image field names
    const imageUrl = 
      product.image || 
      product.image_url || 
      product.img ||
      product.thumbnail ||
      product.photo;

    // Check if URL is valid
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '') {
      // If it's a relative path, convert to absolute URL
      if (imageUrl.startsWith('/')) {
        return `https://pos.loriskenya.com${imageUrl}`;
      }
      // If it's already a full URL, use it
      return imageUrl;
    }

    return "https://placehold.co/300x300?text=No+Image";
  };
  
  // Calculate totals
  const subtotal = cartItems.reduce((total, item) => total + (item.price ? item.price * item.quantity : item.selling_price * item.quantity), 0);
  const shipping = subtotal > 5000 ? 0 : 100; // Free shipping over KSh 5000
  const tax = subtotal * 0.16; // 16% VAT
  const total = subtotal + shipping + tax;

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
                      src={getProductImage(item)} 
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
              <input type="text" placeholder="Full Name" />
            </div>
            <div className="form-row">
              <input type="email" placeholder="Email Address" />
            </div>
            <div className="form-row">
              <input type="tel" placeholder="Phone Number" />
            </div>
            <div className="form-row">
              <input type="text" placeholder="Delivery Address" />
            </div>
            <div className="form-row double">
              <input type="text" placeholder="City" />
              <input type="text" placeholder="Postal Code" />
            </div>
            <div className="form-row">
              <textarea placeholder="Delivery Notes (Optional)"></textarea>
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
                  <input type="tel" placeholder="Phone Number (e.g. 0712345678)" />
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
          <button className="checkout-button">
            {paymentMethod === 'mpesa' ? "Pay with M-PESA" : "Pay with Card"}
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