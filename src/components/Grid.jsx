import "../styles/grid.css";
import { useState, useEffect } from "react";
import categoryIcon from "../assets/category-icon.png";
import shareIcon from "../assets/share-icon.png";
import addToCartIcon from "../assets/bag-icon.png";
import seeMoreIcon from "../assets/see-more.png";
import { db } from "../../firebase/firebaseConfig.js";
import { collection, getDocs, query, limit, orderBy } from "firebase/firestore";

const Grid = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 24;
  
  // Fetch products from Firestore
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        
        // Reference to products collection
        const productsRef = collection(db, "products");
        
        // Create query
        const productsQuery = query(
          productsRef,
          orderBy("created_at", "desc"),
          limit(1000)
        );
        
        // Get products
        const querySnapshot = await getDocs(productsQuery);
        
        // Process products data
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        // Calculate total pages
        const total = Math.ceil(productsData.length / itemsPerPage);
        
        setProducts(productsData);
        setTotalPages(total);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    }
    
    fetchProducts();
  }, []);
  
  // Calculate which products to display based on current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleProducts = products.slice(startIndex, startIndex + itemsPerPage);
  
  // Page navigation
  const goToPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  // Capitalize every word in the item's title
  function capitalizeWords(str) {
    if (!str) return '';
    return str
      .toString()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
  
  // Format price as currency
  const formatPrice = (price) => {
    if (price === undefined || price === null) return 'KSh 0';
    return `KSh ${Number(price).toLocaleString()}`;
  };
  
  // Default image for products without images
  const defaultImage = "https://placehold.co/300x300?text=No+Image";
  
  // Get product image with multiple possible field names
  const getProductImage = (product) => {
    // Try different possible image field names
    const imageUrl = 
      product.image || 
      product.image_url || 
      product.img ||
      product.thumbnail ||
      product.photo;
      
    // Check if URL is valid (not just a local path or empty string)
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '') {
      // If it's a relative path, convert to absolute URL
      if (imageUrl.startsWith('/')) {
        return `https://pos.loriskenya.com${imageUrl}`;
      }
      // If it's already a full URL, use it
      return imageUrl;
    }
    
    return defaultImage;
  };
  
  return (
    <div className="paginated-grid-section">
      <h2 className="grid-title">
        All Products <span>Find your Signature Scent</span>
      </h2>

      {loading ? (
        <div className="loading-container">
          <p>Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="no-products">
          <p>No products found</p>
        </div>
      ) : (
        <>
          <div className="grid-container">
            {visibleProducts.map((product) => (
              <div className="grid-item" key={product.id}>
                <div className="cart-options">
                  <div title="Share">
                    <img className="share--icon" src={shareIcon} alt="Share" />
                  </div>
                  <div title="Add to Cart">
                    <img className="cart--icon" src={addToCartIcon} alt="Add to cart" />
                  </div>
                  <div title="View Details">
                    <img className="more--icon" src={seeMoreIcon} alt="View details" />
                  </div>
                </div>
                <img
                  loading="lazy"
                  src={getProductImage(product)}
                  alt={product.name || 'Product Image'}
                  className="grid-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultImage;
                  }}
                />
                <p className="grid-name">{capitalizeWords(product.name)}</p>
                <p className="category-name">
                  <img src={categoryIcon} alt="Category" />
                  {product.category || 'Uncategorized'}
                  {product["sub-category"] && ` - ${product["sub-category"]}`}
                </p>
                <p className="grid-item-price">{formatPrice(product.selling_price)}</p>
                {/* Keep SKU display minimal on grid view */}
                <p className="grid-item-sku">
                  {product.sku_leave_blank_to_auto_generate_sku ? 
                    `SKU: ${product.sku_leave_blank_to_auto_generate_sku}` : ''}
                </p>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                return (
                  page === 1 || // always show first page
                  page === totalPages || // always show last page
                  Math.abs(currentPage - page) <= 1 // show current, previous, next
                );
              })
              .reduce((acc, page, index, array) => {
                if (index > 0 && page - array[index - 1] > 1) {
                  acc.push("ellipsis");
                }
                acc.push(page);
                return acc;
              }, [])
              .map((item, index) =>
                item === "ellipsis" ? (
                  <span key={`ellipsis-${index}`} className="ellipsis">
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    className={currentPage === item ? "active" : ""}
                    onClick={() => goToPage(item)}
                  >
                    {item}
                  </button>
                )
              )}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Grid;
