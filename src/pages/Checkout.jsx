import { useState, useEffect } from "react";
import "../styles/checkout.css";
import logoImage from "../assets/techiq-logo.png";
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from "../context/CartContext";
import { db, auth } from "../../firebase/firebaseConfig";
import { setDoc, doc, getDoc } from "firebase/firestore";
import emailjs from '@emailjs/browser';
import { 
  FiShoppingCart, FiUser, FiMail, FiPhone, 
  FiMessageSquare, FiCheckCircle, FiTrash2, 
  FiChevronLeft, FiChevronRight, FiArrowRight, 
  FiShoppingBag, FiCreditCard
} from "react-icons/fi";
import { RiWhatsappLine } from "react-icons/ri";
import { HiOutlineDeviceTablet, HiOutlineChip } from "react-icons/hi";

const Checkout = () => {
  const navigate = useNavigate();
  const [orderMethod, setOrderMethod] = useState("normal");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    deliveryNotes: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const { cart: cartItems, updateQuantity, removeFromCart: removeItem, clearCart } = useCart();
  const [emailStatus, setEmailStatus] = useState(null);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [formErrors, setFormErrors] = useState({});

  const EMAILJS_SERVICE_ID = "service_dcl2ixr";
  const EMAILJS_TEMPLATE_ID = "template_n8yvs08";
  const EMAILJS_USER_ID = "v5NvpmkGpBwe7W6nZ";

  // Calculate the total without separate tax and shipping
  const total = cartItems.reduce((total, item) => total + (item.price ? item.price * item.quantity : item.selling_price * item.quantity), 0);
  
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const getOrderId = () => {
    return `TQ-${Date.now().toString().substring(7)}`;
  };

  const sendOrderConfirmationEmail = async (orderData) => {
    try {
      const formattedItems = orderData.items.map(item => ({
        name: item.name,
        image_url: getProductImage(item),
        units: item.quantity,
        price: item.price.toLocaleString()
      }));

      // Simplified costs without tax and shipping
      const formattedCosts = {
        total: orderData.total.toLocaleString()
      };

      const templateParams = {
        order_id: orderData.id,
        orders: formattedItems,
        cost: formattedCosts,
        email: orderData.shippingAddress.email,
        to_name: orderData.shippingAddress.fullName,
        reply_to: "techiqsolutionslimited@gmail.com",
        logo_url: "https://f003.backblazeb2.com/file/Techiq/techiq-logo.png",
      };

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_USER_ID
      );

      console.log('Email sent successfully:', response);
      setEmailStatus('success');
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      setEmailStatus('error');
      return false;
    }
  };

  const handleNormalOrder = async (orderId) => {
    try {
      setIsProcessing(true);

      const user = auth.currentUser;

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
          image: item.image || '',
          images: item.images || []
        })),
        total,
        status: "pending",
        orderMethod: "website",
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          notes: formData.deliveryNotes
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (user) {
        await setDoc(doc(db, "users", user.uid, "orders", orderId), orderData);
      }

      await setDoc(doc(db, "orders", orderId), {
        ...orderData,
        userDisplayName: user ? user.displayName || '' : formData.fullName
      });

      await sendOrderConfirmationEmail(orderData);

      clearCart();

      navigate(`/order-success?orderId=${orderId}`);
    } catch (error) {
      console.error("Error saving order:", error);
      alert("We encountered an error processing your order. Please try again or contact customer support.");
      setIsProcessing(false);
    }
  };

  const handleWhatsAppOrder = (orderId) => {
    let message = `Hello Techiq Solutions, I would like to place an order (${orderId}):\n\n`;

    message += `*Order Details*\n`;
    message += `------------------\n\n`;

    cartItems.forEach((item, index) => {
      message += `${index + 1}) ${item.name} x${item.quantity} - KSh ${(item.price || item.selling_price) * item.quantity}\n`;
    });
    
    message += `\n*Order Summary*\n`;
    message += `Total: KSh ${total}\n\n`;

    const whatsappNumber = "254799748449";
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    const OpenWhatsApp = async () => {
      clearCart();
      window.open(whatsappURL, '_blank');
    };

    OpenWhatsApp();
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required";
    }
    
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email format is invalid";
    }
    
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^[0-9+\s()-]{9,15}$/.test(formData.phone)) {
      errors.phone = "Phone number format is invalid";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCheckout = () => {
    if (orderMethod === "normal" && !validateForm()) {
      return;
    }

    const orderId = getOrderId();

    if (orderMethod === "whatsapp") {
      handleWhatsAppOrder(orderId);
    } else {
      handleNormalOrder(orderId);
    }
  };

  const nextStep = () => {
    if (checkoutStep === 1) {
      if (cartItems.length === 0) {
        alert("Your cart is empty");
        return;
      }
      setCheckoutStep(2); // Go to order method selection
    } else if (checkoutStep === 2) {
      if (orderMethod === "whatsapp") {
        // Skip info collection for WhatsApp orders
        setCheckoutStep(4); // Jump to final review
      } else {
        setCheckoutStep(3); // Go to information collection
      }
    } else if (checkoutStep === 3) {
      // Validate form before proceeding to review
      if (!validateForm()) {
        return;
      }
      setCheckoutStep(4); // Go to review
    }
  };

  const prevStep = () => {
    if (checkoutStep === 4) {
      // When going back from review
      if (orderMethod === "whatsapp") {
        setCheckoutStep(2); // Go back to order method
      } else {
        setCheckoutStep(3); // Go back to information
      }
    } else if (checkoutStep === 3) {
      setCheckoutStep(2); // Go back to order method
    } else if (checkoutStep === 2) {
      setCheckoutStep(1); // Go back to cart
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();

            setFormData(prev => ({
              ...prev,
              fullName: userData.firstName && userData.lastName ?
                `${userData.firstName} ${userData.lastName}` :
                prev.fullName,
              email: user.email || prev.email,
              phone: userData.phone || prev.phone
            }));
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, []);

  // Helper function to handle both image formats
  const getProductImage = (product) => {
    // Check if product has images array
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0]; // Return the first image
    }
    
    // Fallback to single image field if exists
    if (product.image && typeof product.image === 'string' && product.image.trim() !== '') {
      return product.image;
    }

    return "https://placehold.co/300x300?text=No+Image";
  };

  // Get icon for category
  const getCategoryIcon = (category) => {
    if (!category) return <HiOutlineDeviceTablet />;
    
    const lowerCategory = category.toLowerCase();
    
    if (lowerCategory.includes('laptop')) return <HiOutlineDeviceTablet />;
    if (lowerCategory.includes('processor') || lowerCategory.includes('cpu')) return <HiOutlineChip />;
    
    return <HiOutlineDeviceTablet />;
  };

  return (
    <div className="tech-checkout-page">
      <div className="tech-checkout-header">
        <Link to="/" className="tech-logo">
          <img src={logoImage} alt="Techiq Solutions" />
        </Link>
        <div className="tech-checkout-steps">
          <div className={`tech-step ${checkoutStep >= 1 ? 'active' : ''}`}>
            <div className="tech-step-number">1</div>
            <span className="tech-step-name">Cart</span>
          </div>
          <div className="tech-step-connector"></div>
          <div className={`tech-step ${checkoutStep >= 2 ? 'active' : ''}`}>
            <div className="tech-step-number">2</div>
            <span className="tech-step-name">Order Method</span>
          </div>
          <div className="tech-step-connector"></div>
          {orderMethod === "normal" && (
            <>
              <div className={`tech-step ${checkoutStep >= 3 ? 'active' : ''}`}>
                <div className="tech-step-number">3</div>
                <span className="tech-step-name">Information</span>
              </div>
              <div className="tech-step-connector"></div>
            </>
          )}
          <div className={`tech-step ${checkoutStep >= 4 ? 'active' : ''}`}>
            <div className="tech-step-number">{orderMethod === "normal" ? "4" : "3"}</div>
            <span className="tech-step-name">{orderMethod === "normal" ? "Review" : "WhatsApp Order"}</span>
          </div>
        </div>
        <div className="tech-cart-count">
          <FiShoppingCart />
          <span>{itemCount}</span>
        </div>
      </div>

      <div className="tech-checkout-container">
        <div className="tech-checkout-main">
          {/* Step 1: Cart */}
          {checkoutStep === 1 && (
            <div className="tech-cart-section">
              <div className="tech-section-header">
                <h2><FiShoppingCart /> Your Tech Cart</h2>
                <div className="tech-item-count">{itemCount} {itemCount === 1 ? 'item' : 'items'}</div>
              </div>

              {cartItems.length === 0 ? (
                <div className="tech-empty-cart">
                  <div className="tech-empty-icon">
                    <FiShoppingBag />
                  </div>
                  <p>Your cart is empty</p>
                  <Link to="/all-products" className="tech-continue-shopping">Browse Products</Link>
                </div>
              ) : (
                <div className="tech-cart-items">
                  {cartItems.map(item => (
                    <div className="tech-cart-item" key={item.id}>
                      <div className="tech-cart-item-image">
                        <img
                          src={getProductImage(item)}
                          alt={item.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/300x300?text=No+Image";
                          }}
                        />
                      </div>
                      <div className="tech-cart-item-details">
                        <h3>{item.name}</h3>
                        <div className="tech-item-category">
                          {getCategoryIcon(item.category)}
                          <span>{item.category || 'Computer Hardware'}</span>
                        </div>
                        <div className="tech-item-price-row">
                          <div className="tech-item-price">KSh {(item.price || item.selling_price).toLocaleString()}</div>
                          <div className="tech-quantity-controls">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              aria-label="Decrease quantity"
                            >
                              -
                            </button>
                            <span>{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="tech-cart-item-subtotal">
                        <div className="tech-subtotal-value">
                          KSh {((item.price || item.selling_price) * item.quantity).toLocaleString()}
                        </div>
                        <button
                          className="tech-remove-item"
                          onClick={() => removeItem(item.id)}
                          aria-label="Remove item"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Order Method Selection */}
          {checkoutStep === 2 && (
            <div className="tech-order-method-section">
              <div className="tech-section-header">
                <h2><FiCreditCard /> Select Order Method</h2>
              </div>
              
              <div className="tech-order-options">
                <div
                  className={`tech-order-option ${orderMethod === 'normal' ? 'selected' : ''}`}
                  onClick={() => setOrderMethod('normal')}
                >
                  <div className="tech-option-icon">
                    <FiCreditCard />
                  </div>
                  <div className="tech-option-content">
                    <div className="tech-option-title">Standard Order</div>
                    <div className="tech-option-desc">Place your order through our website</div>
                  </div>
                  <div className="tech-option-check">
                    {orderMethod === 'normal' && <FiCheckCircle />}
                  </div>
                </div>

                <div
                  className={`tech-order-option ${orderMethod === 'whatsapp' ? 'selected' : ''}`}
                  onClick={() => setOrderMethod('whatsapp')}
                >
                  <div className="tech-option-icon whatsapp">
                    <RiWhatsappLine />
                  </div>
                  <div className="tech-option-content">
                    <div className="tech-option-title">WhatsApp Order</div>
                    <div className="tech-option-desc">Place your order via WhatsApp for direct communication</div>
                  </div>
                  <div className="tech-option-check">
                    {orderMethod === 'whatsapp' && <FiCheckCircle />}
                  </div>
                </div>
              </div>
              
              {orderMethod === 'whatsapp' && (
                <div className="tech-whatsapp-info">
                  <p>
                    <strong>About WhatsApp Orders:</strong>
                  </p>
                  <ul>
                    <li>Your order details will be sent to our sales team via WhatsApp</li>
                    <li>You'll provide your contact information directly in the chat</li>
                    <li>Our team will respond promptly to confirm your order</li>
                    <li>Payment and delivery details will be arranged through WhatsApp</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Information (Only for Standard Orders) */}
          {checkoutStep === 3 && orderMethod === "normal" && (
            <div className="tech-info-section">
              <div className="tech-section-header">
                <h2><FiUser /> Contact Information</h2>
              </div>

              <div className="tech-form">
                <div className="tech-form-group">
                  <label htmlFor="fullName">
                    <FiUser className="tech-input-icon" />
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={formErrors.fullName ? 'tech-input-error' : ''}
                  />
                  {formErrors.fullName && (
                    <div className="tech-error-message">{formErrors.fullName}</div>
                  )}
                </div>

                <div className="tech-form-group">
                  <label htmlFor="email">
                    <FiMail className="tech-input-icon" />
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={formErrors.email ? 'tech-input-error' : ''}
                  />
                  {formErrors.email && (
                    <div className="tech-error-message">{formErrors.email}</div>
                  )}
                </div>

                <div className="tech-form-group">
                  <label htmlFor="phone">
                    <FiPhone className="tech-input-icon" />
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={formErrors.phone ? 'tech-input-error' : ''}
                  />
                  {formErrors.phone && (
                    <div className="tech-error-message">{formErrors.phone}</div>
                  )}
                </div>

                <div className="tech-form-group">
                  <label htmlFor="deliveryNotes">
                    <FiMessageSquare className="tech-input-icon" />
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    id="deliveryNotes"
                    name="deliveryNotes"
                    placeholder="Any special instructions or delivery notes"
                    value={formData.deliveryNotes}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Final Review */}
          {checkoutStep === 4 && (
            <div className="tech-review-section">
              <div className="tech-section-header">
                <h2>
                  {orderMethod === "whatsapp" ? (
                    <><RiWhatsappLine /> WhatsApp Order</>
                  ) : (
                    <><FiCheckCircle /> Review Your Order</>
                  )}
                </h2>
              </div>

              <div className="tech-review-container">
                {/* Only show contact info for standard orders */}
                {orderMethod === "normal" && (
                  <div className="tech-review-info">
                    <h3>Contact Information</h3>
                    <div className="tech-info-row">
                      <span className="tech-info-label"><FiUser /> Name:</span>
                      <span className="tech-info-value">{formData.fullName}</span>
                    </div>
                    <div className="tech-info-row">
                      <span className="tech-info-label"><FiMail /> Email:</span>
                      <span className="tech-info-value">{formData.email}</span>
                    </div>
                    <div className="tech-info-row">
                      <span className="tech-info-label"><FiPhone /> Phone:</span>
                      <span className="tech-info-value">{formData.phone}</span>
                    </div>
                    {formData.deliveryNotes && (
                      <div className="tech-info-row">
                        <span className="tech-info-label"><FiMessageSquare /> Notes:</span>
                        <span className="tech-info-value">{formData.deliveryNotes}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="tech-review-items">
                  <h3>Order Items</h3>
                  <div className="tech-review-items-list">
                    {cartItems.map(item => (
                      <div className="tech-review-item" key={item.id}>
                        <div className="tech-review-item-image">
                          <img src={getProductImage(item)} alt={item.name} />
                        </div>
                        <div className="tech-review-item-details">
                          <h4>{item.name}</h4>
                          <div className="tech-review-item-meta">
                            <span>Qty: {item.quantity}</span>
                            <span>×</span>
                            <span>KSh {(item.price || item.selling_price).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="tech-review-item-price">
                          KSh {((item.price || item.selling_price) * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {orderMethod === "whatsapp" && (
                  <div className="tech-whatsapp-final-info">
                    <h3>About Your WhatsApp Order</h3>
                    <p>
                      When you click "Order via WhatsApp", your cart details will be forwarded to our sales team on WhatsApp.
                      You'll need to provide your contact information and delivery details directly in the chat.
                    </p>
                    <div className="tech-whatsapp-contact">
                      <div className="tech-contact-icon">
                        <RiWhatsappLine />
                      </div>
                      <div className="tech-contact-details">
                        <span>TechIQ Solutions</span>
                        <span>+254 799 748 449</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="tech-navigation-buttons">
            {checkoutStep > 1 && (
              <button className="tech-back-button" onClick={prevStep}>
                <FiChevronLeft /> Back
              </button>
            )}
            
            {/* Show different buttons based on step and order method */}
            {checkoutStep < 4 ? (
              <button 
                className="tech-next-button" 
                onClick={nextStep} 
                disabled={cartItems.length === 0 && checkoutStep === 1}
              >
                Continue <FiChevronRight />
              </button>
            ) : (
              <button 
                className="tech-submit-button" 
                onClick={handleCheckout}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>Processing...</>
                ) : orderMethod === 'whatsapp' ? (
                  <>Order via WhatsApp <RiWhatsappLine /></>
                ) : (
                  <>Complete Order <FiArrowRight /></>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="tech-checkout-sidebar">
          <div className="tech-summary-card">
            <h3>Order Summary</h3>
            
            <div className="tech-summary-items">
              <div className="tech-summary-item-count">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </div>
              
              <div className="tech-summary-item-list">
                {cartItems.map(item => (
                  <div className="tech-summary-item" key={item.id}>
                    <div className="tech-summary-item-image">
                      <img src={getProductImage(item)} alt={item.name} />
                      <span className="tech-summary-item-quantity">{item.quantity}</span>
                    </div>
                    <div className="tech-summary-item-name">{item.name.length > 25 ? `${item.name.substring(0, 25)}...` : item.name}</div>
                    <div className="tech-summary-item-price">
                      KSh {((item.price || item.selling_price) * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="tech-summary-total">
              <div className="tech-total-row">
                <span>Total</span>
                <span>KSh {total.toLocaleString()}</span>
              </div>
              <div className="tech-tax-note">Prices are inclusive of all taxes</div>
            </div>
            
            <div className="tech-security-info">
              <div className="tech-security-icon">
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1Z M12,7C13.4,7 14.8,8.1 14.8,9.5V11C15.4,11 16,11.6 16,12.3V15.8C16,16.4 15.4,17 14.7,17H9.2C8.6,17 8,16.4 8,15.7V12.2C8,11.6 8.6,11 9.2,11V9.5C9.2,8.1 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,9.5V11H13.5V9.5C13.5,8.7 12.8,8.2 12,8.2Z" />
                </svg>
              </div>
              <div className="tech-security-text">
                Secure checkout with end-to-end encryption
              </div>
            </div>
          </div>
          
          <div className="tech-help-section">
            <h4>Need Help?</h4>
            <p>Our tech support team is available to assist you with your order.</p>
            <a href="tel:254799748449" className="tech-support-link">
              <FiPhone /> Call Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;