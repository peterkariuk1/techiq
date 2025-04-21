import '../styles/admin.css';

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
          <input type="radio" /> In Stock
        </label>
        <label>
          <input type="radio" /> Out of Stock
        </label>

        <p>Add the item's category</p>
        <div className="scent-categories-radio-buttons">
          <label>
            <input type="radio" />
            Auto Perfumes
          </label>
          <label>
            <input type="radio" />
            Body Care
          </label>
          <label>
            <input type="radio" />
            Cologne
          </label><label>
            <input type="radio" />
            Diffusers
          </label><label>
            <input type="radio" />
            Dmar
          </label><label>
            <input type="radio" />
            Frequence
          </label><label>
            <input type="radio" />
            Loris Perfumes
          </label><label>
            <input type="radio" />
            Lotion
          </label><label>
            <input type="radio" />
            Mist
          </label><label>
            <input type="radio" />
            Niche Perfumes
          </label><label>
            <input type="radio" />
            Niche Diffusers
          </label><label>
            <input type="radio" />
            Room Spray
          </label><label>
            <input type="radio" />
            Mystery Perfume
          </label><label>
            <input type="radio" />
            Others
          </label>
        </div>
      </div>
    </div>
  );
};

export default Admin;
