import "../styles/admin.css";

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
        <div>
          <p>Add Image</p>
          <input type="file" />
          <p>
            Add Name of the product <strong>without the quantity (ml) </strong>
          </p>
          <input type="text" />
          <p>
            Add the quantity (ml) e.g. 100ml. If it varies list a max of 3
            quantities without commas e.g, 20ml 50ml 120ml
          </p>
          <input type="text" />
          <p>Add Price of the product</p>
          <input type="number" />
          <p>Add a short description of the product</p>
          <input type="text" />
        </div>
        <div>
          <p>Specify if item is currently stocked</p>
          <section className='label-container'>
          <label>
            <input type="radio" /> In Stock
          </label>
          <label>
            <input type="radio" /> Out of Stock
          </label>
          </section>
          <p>Specify if item is a best seller</p>
          <section className='label-container'>
          <label>
            <input type="radio" />
            Best Seller
          </label>
          <label>
            <input type="radio" />
            Not a Best Seller
          </label>
          </section>
        </div>
        <div>
          <p>Specify Gender to use the product</p>
          <section className='label-container'>
          <label>
            <input type="radio" /> Men
          </label>
          <label>
            <input type="radio" /> Women
          </label>
          <label>
            <input type="radio" /> Unisex
          </label>
          <label>
            {/* For perfumes such as car perfumes and sprays, return an empty string for this option */}
            <input type="radio" /> Unspecified
          </label>
          </section>
        </div>

        <div>
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
            </label>
            <label>
              <input type="radio" />
              Diffusers
            </label>
            <label>
              <input type="radio" />
              Dmar
            </label>
            <label>
              <input type="radio" />
              Frequence
            </label>
            <label>
              <input type="radio" />
              Loris Perfumes
            </label>
            <label>
              <input type="radio" />
              Lotion
            </label>
            <label>
              <input type="radio" />
              Mist
            </label>
            <label>
              <input type="radio" />
              Niche Perfumes
            </label>
            <label>
              <input type="radio" />
              Niche Diffusers
            </label>
            <label>
              <input type="radio" />
              Room Spray
            </label>
            <label>
              <input type="radio" />
              Mystery Perfume
            </label>
            <label>
              <input type="radio" />
              Others
            </label>
          </div>
        </div>
      </div>
      <p>
      Once submitted, changes can't be made unless you delete the entire product upload. Do you wish to continue?
      </p>
      <button>Submit</button>
    </div>
  );
};

export default Admin;
