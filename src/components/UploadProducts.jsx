import { useState, useRef, useEffect } from "react";
import "../styles/upload.css";
import { FiPlus, FiCheckCircle, FiX, FiTrash2, FiCpu, FiHardDrive, FiServer, FiDatabase } from "react-icons/fi";
import { BiImageAdd } from "react-icons/bi";
import { MdOutlineInventory2, MdOutlineSell, MdDashboard } from "react-icons/md";
import { TbCategory, TbDeviceLaptop } from "react-icons/tb";
import { HiOutlineChip, HiOutlineDesktopComputer } from "react-icons/hi";
import { db } from "../../firebase/firebaseConfig";
import { collection, addDoc, getDocs, query, where, Timestamp } from "firebase/firestore";
import axios from "axios";

const BACKEND_URL = "https://techiq-backend.onrender.com";

const UploadProducts = () => {
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    model: "",
    price: "",
    salePrice: "",
    description: "",
    specifications: "",
    inStock: true,
    isBestSeller: false,
    category: "",
    images: []
  });

  // UI state
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Stats (from Firestore)
  const [productStats, setProductStats] = useState({
    total: 0,
    inStock: 0,
    outOfStock: 0
  });

  // Refs
  const fileInputRef = useRef(null);

  // Fetch product stats from Firestore
  useEffect(() => {
    const fetchProductStats = async () => {
      try {
        // Get all products
        const productsRef = collection(db, "products");
        const productsSnapshot = await getDocs(productsRef);

        // Count products
        const total = productsSnapshot.size;

        // Count in-stock products
        const inStockQuery = query(productsRef, where("inStock", "==", true));
        const inStockSnapshot = await getDocs(inStockQuery);
        const inStockCount = inStockSnapshot.size;

        // Update stats
        setProductStats({
          total,
          inStock: inStockCount,
          outOfStock: total - inStockCount
        });
      } catch (error) {
        console.error("Error fetching product stats:", error);
      }
    };

    fetchProductStats();
  }, [uploadSuccess]); // Refresh stats after successful upload

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when field is updated
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Handle radio button changes
  const handleRadioChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle multiple image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Validate files
    const newFiles = files.filter(file => {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors(prev => ({
          ...prev,
          image: "Images should be less than 5MB each"
        }));
        return false;
      }

      // Check file type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setFormErrors(prev => ({
          ...prev,
          image: "Please upload valid images (JPEG, PNG, or WEBP)"
        }));
        return false;
      }

      return true;
    });

    if (!newFiles.length) return;

    // Update file state
    setImageFiles(prev => [...prev, ...newFiles]);

    // Create previews
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);

    // Clear error
    setFormErrors(prev => ({
      ...prev,
      image: null
    }));

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove image
  const removeImage = (index) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index]);

    // Remove file and preview
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) errors.name = "Product name is required";
    if (!formData.model.trim()) errors.model = "Model is required";
    if (!formData.price || formData.price <= 0) errors.price = "Valid price is required";
    if (!formData.description.trim()) errors.description = "Description is required";
    if (!formData.specifications.trim()) errors.specifications = "Specifications are required";
    if (!formData.category) errors.category = "Category is required";
    if (imageFiles.length === 0) errors.image = "At least one product image is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector('.tech-admin-error-message');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setShowConfirmation(true);
  };

  // Cancel confirmation
  const handleCancel = () => {
    setShowConfirmation(false);
  };

  // Upload single image to B2 through the backend API
  const uploadImageToB2 = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('category', 'products');

    const response = await axios.post(
      `${BACKEND_URL}/storage/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      }
    );

    return response.data;
  };

  // Process upload after confirmation
  const handleConfirmedUpload = async () => {
    setUploading(true);
    setUploadProgress(0);
    setShowConfirmation(false);

    try {
      // 1. Upload multiple images to Backblaze B2 via backend API
      const imageUrls = [];
      const fileNames = [];

      // Calculate progress increment per image
      const progressIncrement = 90 / imageFiles.length;

      // Upload each image
      for (let i = 0; i < imageFiles.length; i++) {
        const uploadResult = await uploadImageToB2(imageFiles[i]);

        if (!uploadResult.success) {
          throw new Error(uploadResult.message || "Failed to upload image");
        }

        imageUrls.push(uploadResult.data.fileUrl);
        fileNames.push(uploadResult.data.fileName);

        // Update progress
        setUploadProgress((i + 1) * progressIncrement);
      }

      // 2. Add product to Firestore with B2 image URLs
      const productData = {
        name: formData.name,
        model: formData.model,
        price: parseFloat(formData.price),
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        description: formData.description,
        specifications: formData.specifications,
        inStock: formData.inStock,
        isBestSeller: formData.isBestSeller,
        category: formData.category,
        images: imageUrls, // Array of B2 image URLs
        fileNames: fileNames, // Store the B2 filenames for potential deletion later
        createdAt: Timestamp.now()
      };

      await addDoc(collection(db, "products"), productData);

      // Success!
      setUploadProgress(100);
      setUploading(false);
      setUploadSuccess(true);

      // Reset form after 2 seconds
      setTimeout(() => {
        resetForm();
        setUploadSuccess(false);
      }, 2000);

    } catch (error) {
      console.error("Upload error:", error);
      setFormErrors(prev => ({
        ...prev,
        upload: error.message || "Upload failed"
      }));
      setUploading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      model: "",
      price: "",
      salePrice: "",
      description: "",
      specifications: "",
      inStock: true,
      isBestSeller: false,
      category: ""
    });

    // Revoke all object URLs to prevent memory leaks
    imagePreviews.forEach(preview => URL.revokeObjectURL(preview));

    setImageFiles([]);
    setImagePreviews([]);
    setFormErrors({});

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Get icon for category
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Laptops': return <TbDeviceLaptop />;
      case 'Desktop PCs': case 'Gaming PCs': return <HiOutlineDesktopComputer />;
      case 'Processors': return <HiOutlineChip />;
      case 'Graphics Cards': return <FiCpu />;
      case 'Storage': return <FiHardDrive />;
      case 'RAM': return <FiDatabase />;
      case 'Motherboards': case 'Networking': return <FiServer />;
      default: return <TbCategory />;
    }
  };

  return (
    <div className="tech-admin-container">
      <div className="tech-admin-header">
        <div className="tech-admin-title">
          <h1><MdDashboard className="tech-admin-title-icon" /> Product Management</h1>
          <p>Add new computers and accessories to your inventory</p>
        </div>

        <div className="tech-admin-stats">
          <div className="tech-admin-stat-card">
            <div className="tech-admin-stat-icon">
              <FiDatabase />
            </div>
            <div className="tech-admin-stat-content">
              <div className="tech-admin-stat-value">{productStats.total}</div>
              <div className="tech-admin-stat-label">Total Products</div>
            </div>
          </div>
          <div className="tech-admin-stat-card tech-admin-in-stock">
            <div className="tech-admin-stat-icon">
              <FiCheckCircle />
            </div>
            <div className="tech-admin-stat-content">
              <div className="tech-admin-stat-value">{productStats.inStock}</div>
              <div className="tech-admin-stat-label">In Stock</div>
            </div>
          </div>
          <div className="tech-admin-stat-card tech-admin-out-of-stock">
            <div className="tech-admin-stat-icon">
              <FiX />
            </div>
            <div className="tech-admin-stat-content">
              <div className="tech-admin-stat-value">{productStats.outOfStock}</div>
              <div className="tech-admin-stat-label">Out of Stock</div>
            </div>
          </div>
        </div>
      </div>

      <div className="tech-admin-form-container">
        <div className="tech-admin-form-header">
          <h2>Add New Product</h2>
          <p>Complete all fields to add a new product to your inventory</p>
        </div>

        <div className="tech-admin-form">
          <div className="tech-admin-section tech-admin-image-section">
            <div className="tech-admin-section-header">
              <BiImageAdd className="tech-admin-section-icon" />
              <h3>Product Images</h3>
            </div>
            <div
              className={`tech-admin-image-dropzone ${formErrors.image ? 'tech-admin-error' : ''} ${imagePreviews.length > 0 ? 'tech-admin-has-images' : ''}`}
              onClick={() => fileInputRef.current.click()}
            >
              {imagePreviews.length > 0 ? (
                <div className="tech-admin-image-grid">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="tech-admin-image-item">
                      <img src={preview} alt={`Product preview ${index + 1}`} className="tech-admin-image-preview" />
                      <button
                        className="tech-admin-image-remove"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(index);
                        }}
                        aria-label="Remove image"
                      >
                        <FiTrash2 />
                      </button>
                      <div className="tech-admin-image-number">{index + 1}</div>
                    </div>
                  ))}
                  <div className="tech-admin-image-add">
                    <BiImageAdd className="tech-admin-image-add-icon" />
                    <span>Add More</span>
                  </div>
                </div>
              ) : (
                <div className="tech-admin-image-placeholder">
                  <BiImageAdd className="tech-admin-image-icon" />
                  <h4>Drop images here or click to browse</h4>
                  <p>JPEG, PNG or WEBP, max 5MB each</p>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/jpeg,image/png,image/webp"
                className="tech-admin-hidden-input"
                multiple
              />
            </div>
            {formErrors.image && <div className="tech-admin-error-message">{formErrors.image}</div>}
          </div>

          <div className="tech-admin-form-layout">
            <div className="tech-admin-section tech-admin-product-details">
              <div className="tech-admin-section-header">
                <TbDeviceLaptop className="tech-admin-section-icon" />
                <h3>Basic Information</h3>
              </div>

              <div className="tech-admin-form-group">
                <label htmlFor="name">Product Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. MacBook Pro"
                  className={formErrors.name ? 'tech-admin-error' : ''}
                />
                {formErrors.name && <div className="tech-admin-error-message">{formErrors.name}</div>}
              </div>

              <div className="tech-admin-form-group">
                <label htmlFor="model">Model</label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g. 14-inch M3 Pro 2023"
                  className={formErrors.model ? 'tech-admin-error' : ''}
                />
                {formErrors.model && <div className="tech-admin-error-message">{formErrors.model}</div>}
              </div>

              <div className="tech-admin-form-row">
                <div className="tech-admin-form-group">
                  <label htmlFor="price">Regular Price (KSh)</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="e.g. 150000"
                    className={formErrors.price ? 'tech-admin-error' : ''}
                  />
                  {formErrors.price && <div className="tech-admin-error-message">{formErrors.price}</div>}
                </div>

                <div className="tech-admin-form-group">
                  <label htmlFor="salePrice">Sale Price (KSh, optional)</label>
                  <input
                    type="number"
                    id="salePrice"
                    name="salePrice"
                    value={formData.salePrice}
                    onChange={handleChange}
                    placeholder="e.g. 135000"
                  />
                </div>
              </div>

              <div className="tech-admin-form-group">
                <label htmlFor="description">Product Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the product's features, benefits, etc."
                  rows="4"
                  className={formErrors.description ? 'tech-admin-error' : ''}
                ></textarea>
                {formErrors.description && <div className="tech-admin-error-message">{formErrors.description}</div>}
              </div>

              <div className="tech-admin-form-group">
                <label htmlFor="specifications">
                  <span>Technical Specifications</span>
                  <span className="tech-admin-label-hint">Enter detailed specs (CPU, RAM, etc.)</span>
                </label>
                <textarea
                  id="specifications"
                  name="specifications"
                  value={formData.specifications}
                  onChange={handleChange}
                  placeholder="CPU: Intel Core i7-13700H
RAM: 16GB DDR5
Storage: 512GB SSD
Display: 14-inch Retina
Graphics: Intel Iris Xe"
                  rows="7"
                  className={formErrors.specifications ? 'tech-admin-error' : ''}
                ></textarea>
                {formErrors.specifications && <div className="tech-admin-error-message">{formErrors.specifications}</div>}
              </div>
            </div>

            <div className="tech-admin-section tech-admin-product-attributes">
              <div className="tech-admin-section-header">
                <MdOutlineSell className="tech-admin-section-icon" />
                <h3>Product Attributes</h3>
              </div>

              <div className="tech-admin-attribute-section">
                <div className="tech-admin-attribute-header">
                  <MdOutlineInventory2 className="tech-admin-attribute-icon" />
                  <label>Availability</label>
                </div>
                <div className="tech-admin-toggle-group">
                  <div
                    className={`tech-admin-toggle-option ${formData.inStock ? 'tech-admin-active' : ''}`}
                    onClick={() => handleRadioChange('inStock', true)}
                  >
                    <div className="tech-admin-toggle-indicator"></div>
                    <span>In Stock</span>
                  </div>
                  <div
                    className={`tech-admin-toggle-option ${!formData.inStock ? 'tech-admin-active' : ''}`}
                    onClick={() => handleRadioChange('inStock', false)}
                  >
                    <div className="tech-admin-toggle-indicator"></div>
                    <span>Out of Stock</span>
                  </div>
                </div>
              </div>

              <div className="tech-admin-attribute-section">
                <div className="tech-admin-attribute-header">
                  <MdOutlineSell className="tech-admin-attribute-icon" />
                  <label>Featured Status</label>
                </div>
                <div className="tech-admin-toggle-group">
                  <div
                    className={`tech-admin-toggle-option ${formData.isBestSeller ? 'tech-admin-active' : ''}`}
                    onClick={() => handleRadioChange('isBestSeller', true)}
                  >
                    <div className="tech-admin-toggle-indicator"></div>
                    <span>Featured Product</span>
                  </div>
                  <div
                    className={`tech-admin-toggle-option ${!formData.isBestSeller ? 'tech-admin-active' : ''}`}
                    onClick={() => handleRadioChange('isBestSeller', false)}
                  >
                    <div className="tech-admin-toggle-indicator"></div>
                    <span>Regular Product</span>
                  </div>
                </div>
              </div>

              <div className="tech-admin-attribute-section">
                <div className="tech-admin-attribute-header">
                  <TbCategory className="tech-admin-attribute-icon" />
                  <label>Product Category</label>
                </div>
                <div className={`tech-admin-category-grid ${formErrors.category ? 'tech-admin-error' : ''}`}>
                  {[
                    'Laptops', 'Desktop PCs', 'Gaming PCs', 'Monitors',
                    'Keyboards', 'Mice', 'Headphones', 'Speakers',
                    'Networking', 'Storage', 'Graphics Cards', 'Processors',
                    'Motherboards', 'RAM', 'Accessories', 'Others'
                  ].map(cat => (
                    <div
                      key={cat}
                      className={`tech-admin-category-item ${formData.category === cat ? 'tech-admin-active' : ''}`}
                      onClick={() => handleRadioChange('category', cat)}
                    >
                      <span className="tech-admin-category-icon">{getCategoryIcon(cat)}</span>
                      <span className="tech-admin-category-name">{cat}</span>
                    </div>
                  ))}
                </div>
                {formErrors.category && <div className="tech-admin-error-message tech-admin-category-error">{formErrors.category}</div>}
              </div>
            </div>
          </div>
        </div>

        <div className="tech-admin-form-actions">
          {formErrors.upload && <div className="tech-admin-error-message tech-admin-upload-error">{formErrors.upload}</div>}

          {uploading ? (
            <div className="tech-admin-upload-progress">
              <div className="tech-admin-progress-bar">
                <div
                  className="tech-admin-progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <span className="tech-admin-progress-text">{Math.round(uploadProgress)}% Uploading product...</span>
            </div>
          ) : uploadSuccess ? (
            <div className="tech-admin-upload-success">
              <FiCheckCircle className="tech-admin-success-icon" />
              <span>Product uploaded successfully!</span>
            </div>
          ) : (
            <div className="tech-admin-buttons">
              <button
                className="tech-admin-reset-button"
                onClick={resetForm}
                type="button"
              >
                <FiX className="tech-admin-button-icon" />
                Reset Form
              </button>
              <button
                className="tech-admin-submit-button"
                onClick={handleSubmit}
                disabled={uploading}
                type="button"
              >
                <FiPlus className="tech-admin-button-icon" />
                Add Product
              </button>
            </div>
          )}
        </div>
      </div>

      {showConfirmation && (
        <div className="tech-admin-modal-overlay">
          <div className="tech-admin-modal">
            <div className="tech-admin-modal-header">
              <h3>Confirm Product Upload</h3>
              <button
                className="tech-admin-modal-close"
                onClick={handleCancel}
                aria-label="Close"
              >
                <FiX />
              </button>
            </div>
            <div className="tech-admin-modal-body">
              <p>You're about to add <strong>{formData.name}</strong> to your product catalog.</p>
              <p>Please verify all information is correct before proceeding.</p>
            </div>
            <div className="tech-admin-modal-footer">
              <button className="tech-admin-modal-cancel" onClick={handleCancel}>Cancel</button>
              <button className="tech-admin-modal-confirm" onClick={handleConfirmedUpload}>
                <FiCheckCircle className="tech-admin-button-icon" />
                Confirm Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadProducts;
