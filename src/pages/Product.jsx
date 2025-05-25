import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { db } from "../../firebase/firebaseConfig.js";
import { doc, getDoc } from "firebase/firestore";
import { useCart } from "../context/CartContext.jsx";
import "../styles/product.css"; // New stylesheet
import {
  FiChevronLeft, FiChevronRight, FiShare2, FiShoppingCart,
  FiArrowLeft, FiChevronDown, FiCheckCircle, FiCpu, FiHardDrive
} from "react-icons/fi";
import { TbDeviceLaptop } from "react-icons/tb";
import { HiOutlineChip, HiOutlineDesktopComputer } from "react-icons/hi";

const Product = () => {
  // Use both route params and search params
  const { id: routeId } = useParams();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("pid") || routeId;
  const categoryFromUrl = searchParams.get("category");

  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [notification, setNotification] = useState({
    visible: false,
    message: '',
  });

  // Image gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [showFullSpecs, setShowFullSpecs] = useState(false);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setError("No product ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const productRef = doc(db, "products", productId);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          setProduct({ id: productSnap.id, ...productSnap.data() });
        } else {
          setError("Product not found");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Update quantity
  const updateQuantity = (newQty) => {
    if (newQty >= 1) {
      setQuantity(newQty);
    }
  };

  // Add to cart
  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);

      setNotification({
        visible: true,
        message: `Added ${quantity} ${quantity > 1 ? 'items' : 'item'} to cart`,
      });

      setTimeout(() => {
        setNotification(prev => ({ ...prev, visible: false }));
      }, 3000);
    }
  };

  // Share product
  const handleShare = async () => {
    if (!product) return;

    const productUrl = `${window.location.origin}/product/${product.id}`;
    const title = product.name;
    const text = `Check out this ${product.model} ${product.category} at TechIQ!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: productUrl,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(productUrl);

        setNotification({
          visible: true,
          message: 'Link copied to clipboard!',
        });

        setTimeout(() => {
          setNotification(prev => ({ ...prev, visible: false }));
        }, 3000);
      } catch (error) {
        console.error('Clipboard copy failed:', error);
        alert(`Share this link: ${productUrl}`);
      }
    }
  };

  // Navigation for image gallery
  const nextImage = () => {
    if (product?.images?.length) {
      setActiveImageIndex((prevIndex) =>
        prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (product?.images?.length) {
      setActiveImageIndex((prevIndex) =>
        prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
      );
    }
  };

  // Helper functions
  const formatPrice = (price) => {
    if (price === undefined || price === null) return 'KSh 0';
    return `KSh ${Number(price).toLocaleString()}`;
  };

  // Handle back navigation
  const handleBackNavigation = () => {
    if (categoryFromUrl) {
      navigate(`/?category=${encodeURIComponent(categoryFromUrl)}`);
    } else {
      navigate(-1);
    }
  };

  // Parse specifications string into structured format
  const parseSpecifications = (specs) => {
    if (!specs) return [];

    return specs.split('\n')
      .filter(line => line.trim())
      .map(line => {
        const parts = line.split(':');
        if (parts.length > 1) {
          return {
            label: parts[0].trim(),
            value: parts.slice(1).join(':').trim()
          };
        }
        return { label: '', value: line.trim() };
      });
  };

  // Get icon for specification based on label
  const getSpecIcon = (label) => {
    if (!label) return null;

    const lowerLabel = label.toLowerCase();

    if (lowerLabel.includes('processor') || lowerLabel.includes('cpu'))
      return <HiOutlineChip className="techpd-spec-icon" />;
    if (lowerLabel.includes('memory') || lowerLabel.includes('ram'))
      return <FiCpu className="techpd-spec-icon" />;
    if (lowerLabel.includes('storage') || lowerLabel.includes('ssd') || lowerLabel.includes('hdd'))
      return <FiHardDrive className="techpd-spec-icon" />;
    if (lowerLabel.includes('display') || lowerLabel.includes('screen'))
      return <HiOutlineDesktopComputer className="techpd-spec-icon" />;

    return null;
  };

  if (loading) {
    return (
      <div className="techpd-page techpd-loading">
        <div className="techpd-header">
          <div className="techpd-container">
            <Link to="/" className="techpd-logo">
              <TbDeviceLaptop /> TechIQ
            </Link>
          </div>
        </div>
        <div className="techpd-loading-container">
          <div className="techpd-loading-spinner"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="techpd-page techpd-error">
        <div className="techpd-header">
          <div className="techpd-container">
            <Link to="/" className="techpd-logo">
              <TbDeviceLaptop /> TechIQ
            </Link>
          </div>
        </div>
        <div className="techpd-error-container">
          <h2>Oops! {error || "Something went wrong"}</h2>
          <button onClick={() => navigate('/')} className="techpd-back-button">
            <FiArrowLeft /> Back to Products
          </button>
        </div>
      </div>
    );
  }

  const productImages = product.images && product.images.length
    ? product.images
    : ["https://placehold.co/600x400?text=No+Image"];

  // Get parsed specifications
  const parsedSpecs = parseSpecifications(product.specifications);
  const displaySpecs = showFullSpecs ? parsedSpecs : parsedSpecs.slice(0, 6);

  return (
    <div className="techpd-page">
      {/* Notification */}
      {notification.visible && (
        <div className="techpd-notification">
          <div className="techpd-notification-content">
            <div className="techpd-notification-icon">
              <FiCheckCircle />
            </div>
            <div className="techpd-notification-message">{notification.message}</div>
            <button
              className="techpd-notification-close"
              onClick={() => setNotification(prev => ({ ...prev, visible: false }))}
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="techpd-header">
        <div className="techpd-container">
          <Link to="/" className="techpd-logo">
            <TbDeviceLaptop /> TechIQ
          </Link>
          <Link to="/checkout" className="techpd-cart-link">
            <FiShoppingCart />
            <span>Cart</span>
          </Link>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="techpd-breadcrumb techpd-container">
        <button onClick={handleBackNavigation} className="techpd-back-link">
          <FiArrowLeft />
          {categoryFromUrl ? `Back to ${categoryFromUrl}` : 'Back to Products'}
        </button>
      </div>

      <div className="techpd-content techpd-container">
        <div className="techpd-grid">
          {/* Left column: Image gallery */}
          <div className="techpd-gallery">
            {product.isBestSeller && (
              <div className="techpd-badge">
                <span>★ Best Seller</span>
              </div>
            )}

            <div className="techpd-main-image-container">
              <img
                src={productImages[activeImageIndex]}
                alt={`${product.name} - View ${activeImageIndex + 1}`}
                className="techpd-main-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/600x400?text=No+Image";
                }}
              />

              {productImages.length > 1 && (
                <>
                  <button className="techpd-gallery-nav techpd-prev" onClick={prevImage} aria-label="Previous image">
                    <FiChevronLeft />
                  </button>
                  <button className="techpd-gallery-nav techpd-next" onClick={nextImage} aria-label="Next image">
                    <FiChevronRight />
                  </button>
                  <div className="techpd-image-counter">
                    {activeImageIndex + 1}/{productImages.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail navigation */}
            {productImages.length > 1 && (
              <div className="techpd-thumbnail-container">
                {productImages.map((img, index) => (
                  <div
                    key={index}
                    className={`techpd-thumbnail ${index === activeImageIndex ? 'techpd-active' : ''}`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/100x100?text=No+Image";
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column: Product info and actions */}
          <div className="techpd-info">
            <div className="techpd-meta">
              <span className="techpd-category">{product.category}</span>
              {product.inStock ? (
                <span className="techpd-stock techpd-in-stock">In Stock</span>
              ) : (
                <span className="techpd-stock techpd-out-of-stock">Out of Stock</span>
              )}
            </div>

            <h1 className="techpd-title">{product.name}</h1>
            {product.model && <h2 className="techpd-model">{product.model}</h2>}

            <div className="techpd-pricing">
              {product.salePrice !== null &&
                product.salePrice !== undefined &&
                product.salePrice > 0 &&
                product.price > 0 &&
                product.salePrice < product.price ? (
                <>
                  <span className="techpd-sale-price">{formatPrice(product.salePrice)}</span>
                  <span className="techpd-regular-price">{formatPrice(product.price)}</span>
                  {/* Only show discount if it's meaningful (more than 1%) */}
                  {(product.price - product.salePrice) / product.price > 0.01 && (
                    <span className="techpd-discount">
                      {Math.min(Math.round((1 - product.salePrice / product.price) * 100), 99)}% OFF
                    </span>
                  )}
                </>
              ) : (
                <span className="techpd-regular-price techpd-only">{formatPrice(product.price > 0 ? product.price : 0)}</span>
              )}
            </div>

            <div className="techpd-key-specs">
              <h3>Key Specifications</h3>
              <div className="techpd-key-specs-list">
                {parsedSpecs.slice(0, 3).map((spec, index) => (
                  <div key={index} className="techpd-key-spec-item">
                    {getSpecIcon(spec.label)}
                    <div className="techpd-key-spec-text">
                      {spec.label && <span className="techpd-key-spec-label">{spec.label}</span>}
                      <span className="techpd-key-spec-value">{spec.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="techpd-actions">
              <div className="techpd-quantity-selector">
                <span className="techpd-quantity-label">Quantity:</span>
                <div className="techpd-quantity-controls">
                  <button
                    className="techpd-quantity-btn"
                    onClick={() => updateQuantity(quantity - 1)}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="techpd-quantity-value">{quantity}</span>
                  <button
                    className="techpd-quantity-btn"
                    onClick={() => updateQuantity(quantity + 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="techpd-action-buttons">
                <button
                  className="techpd-add-to-cart-btn"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  <FiShoppingCart /> {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>

                <button className="techpd-share-btn" onClick={handleShare} aria-label="Share product">
                  <FiShare2 />
                </button>
              </div>
            </div>

            {/* Product details tabs */}
            <div className="techpd-tabs">
              <div className="techpd-tab-buttons">
                <button
                  className={`techpd-tab-btn ${activeTab === 'description' ? 'techpd-active' : ''}`}
                  onClick={() => setActiveTab('description')}
                >
                  Description
                </button>
                <button
                  className={`techpd-tab-btn ${activeTab === 'specifications' ? 'techpd-active' : ''}`}
                  onClick={() => setActiveTab('specifications')}
                >
                  Specifications
                </button>
              </div>

              <div className="techpd-tab-content">
                {activeTab === 'description' && (
                  <div className="techpd-tab-pane">
                    <p className="techpd-description">{product.description}</p>
                  </div>
                )}

                {activeTab === 'specifications' && (
                  <div className="techpd-tab-pane">
                    <div className="techpd-specs-table">
                      {displaySpecs.map((spec, index) => (
                        <div key={index} className="techpd-spec-row">
                          {spec.label && (
                            <div className="techpd-spec-label">
                              {getSpecIcon(spec.label)}
                              {spec.label}
                            </div>
                          )}
                          <div className="techpd-spec-value">{spec.value}</div>
                        </div>
                      ))}
                    </div>

                    {parsedSpecs.length > 6 && (
                      <button
                        className="techpd-show-more-btn"
                        onClick={() => setShowFullSpecs(!showFullSpecs)}
                      >
                        {showFullSpecs ? 'Show Less' : 'Show All Specifications'}
                        <FiChevronDown className={showFullSpecs ? 'techpd-rotate' : ''} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;