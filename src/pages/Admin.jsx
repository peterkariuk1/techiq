const Admin = () => {
  return (
    <div className="admin-page">
      <h1>Admin Page</h1>
      <div className="products-data">
        <p>Total Products: 3456</p>
        <p>Stock Products: 3420</p>
        <p>Out of Stock Products: 36</p>
      </div>
      <div className="add-products">
        <p>Add Image</p>
        <input type="file" /> 
        
        <p>Add Price of the product</p>
        <input type="number" /> 
        
        <p>Specify if item is currently stocked</p>
        <label>
                <input 
                  type="radio" 
                /> In Stock
              </label>
              <label>
                <input 
                  type="radio"  
                /> Out of Stock
              </label>        
        
        <p>Add the item's category</p>
        
      </div>
    </div>
  );
};

export default Admin;
