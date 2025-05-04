import { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseConfig';
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import '../styles/update.css';
import { FiSearch, FiEdit, FiCheck, FiX } from 'react-icons/fi';

function UpdateProducts() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [activeCategory, setActiveCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsQuery = query(collection(db, 'test-products'), orderBy('name'));
        const querySnapshot = await getDocs(productsQuery);

        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Extract unique categories
        const uniqueCategories = [...new Set(productsData.map(p => p.category))].filter(Boolean);
        setCategories(uniqueCategories);

        setProducts(productsData);
        setFilteredProducts(productsData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again.");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products when search term or category changes
  useEffect(() => {
    let result = products;

    // Filter by category
    if (activeCategory !== 'all') {
      result = result.filter(product => product.category === activeCategory);
    }

    // Filter by search term
    if (searchTerm) {
      const lowercaseTerm = searchTerm.toLowerCase();
      result = result.filter(product =>
        product.name.toLowerCase().includes(lowercaseTerm) ||
        product.category?.toLowerCase().includes(lowercaseTerm) ||
        product.description?.toLowerCase().includes(lowercaseTerm)
      );
    }

    setFilteredProducts(result);
  }, [searchTerm, activeCategory, products]);

  // Start editing a product
  const handleEdit = (product) => {
    setEditingProduct(product.id);
    setEditForm({
      price: product.price,
      inStock: product.inStock
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingProduct(null);
    setEditForm({});
  };

  // Save product changes
  const handleSaveEdit = async (productId) => {
    try {
      const productRef = doc(db, 'test-products', productId);
      await updateDoc(productRef, {
        price: parseFloat(editForm.price),
        inStock: editForm.inStock
      });

      // Update local state
      const updatedProducts = products.map(product => {
        if (product.id === productId) {
          return {
            ...product,
            price: parseFloat(editForm.price),
            inStock: editForm.inStock
          };
        }
        return product;
      });

      setProducts(updatedProducts);
      setEditingProduct(null);
    } catch (err) {
      console.error("Error updating product:", err);
      alert("Failed to update product. Please try again.");
    }
  };

  // Toggle product stock status
  const toggleStockStatus = async (product) => {
    try {
      const productRef = doc(db, 'test-products', product.id);
      await updateDoc(productRef, {
        inStock: !product.inStock
      });

      // Update local state
      const updatedProducts = products.map(p => {
        if (p.id === product.id) {
          return { ...p, inStock: !p.inStock };
        }
        return p;
      });

      setProducts(updatedProducts);
    } catch (err) {
      console.error("Error updating product stock status:", err);
      alert("Failed to update stock status. Please try again.");
    }
  };

  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Filter by category
  const handleCategoryFilter = (category) => {
    setActiveCategory(category);
  };

  return (
    <div className="update-products-container">
      <div className="update-header">
        <div className="update-header-title">
          <h2>Update Products</h2>
          <p>Manage your product inventory, prices and availability</p>
        </div>

        <div className="update-actions">
          <div className="update-search-container">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiSearch className="update-search-icon" />
          </div>
        </div>
      </div>

      {/* Category filters */}
      <div className="update-category-filters">
        <button
          className={activeCategory === 'all' ? 'active' : ''}
          onClick={() => handleCategoryFilter('all')}
        >
          All Products
        </button>
        {categories.map(category => (
          <button
            key={category}
            className={activeCategory === category ? 'active' : ''}
            onClick={() => handleCategoryFilter(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Products table or grid */}
      {loading ? (
        <div className="update-loading-state">Loading products...</div>
      ) : error ? (
        <div className="update-error-state">{error}</div>
      ) : filteredProducts.length === 0 ? (
        <div className="update-empty-state">
          <p>No products found matching your criteria</p>
        </div>
      ) : (
        <div className="update-table-container">
          <table className="update-products-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id} className={editingProduct === product.id ? 'editing' : ''}>
                  <td className="update-product-image">
                    {product.image ? (
                      <img src={product.image} alt={product.name} />
                    ) : (
                      <div className="update-no-image">No Image</div>
                    )}
                  </td>
                  <td className="update-product-name">
                    <div>{product.name}</div>
                    <span className="update-product-id">{product.id}</span>
                  </td>
                  <td>{product.category || 'Uncategorized'}</td>
                  <td>
                    {editingProduct === product.id ? (
                      <input
                        type="number"
                        name="price"
                        value={editForm.price}
                        onChange={handleFormChange}
                        className="update-edit-input"
                      />
                    ) : (
                      `KSh ${parseFloat(product.price).toLocaleString()}`
                    )}
                  </td>
                  <td>
                    {editingProduct === product.id ? (
                      <label className="update-stock-toggle">
                        <input
                          type="checkbox"
                          name="inStock"
                          checked={editForm.inStock}
                          onChange={handleFormChange}
                        />
                        <span>{editForm.inStock ? 'In Stock' : 'Out of Stock'}</span>
                      </label>
                    ) : (
                      <span className={`update-status-badge ${product.inStock ? 'in-stock' : 'out-stock'}`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    )}
                  </td>
                  <td className="update-actions-cell">
                    {editingProduct === product.id ? (
                      <>
                        <button
                          className="update-action-btn update-save-btn"
                          onClick={() => handleSaveEdit(product.id)}
                        >
                          <FiCheck /> Save
                        </button>
                        <button
                          className="update-action-btn update-cancel-btn"
                          onClick={handleCancelEdit}
                        >
                          <FiX /> Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="update-action-btn update-edit-btn"
                          onClick={() => handleEdit(product)}
                        >
                          <FiEdit /> Edit
                        </button>
                        <button
                          className="update-action-btn update-stock-btn"
                          onClick={() => toggleStockStatus(product)}
                        >
                          {product.inStock ? 'Mark Out' : 'Mark In'}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default UpdateProducts;