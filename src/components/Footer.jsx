import "../styles/footer.css";
import addToCartIcon from "../assets/shopping.png";
import placeOrderIcon from "../assets/order.png";
import deliveryIcon from "../assets/delivery.png";
import mpesaIcon from "../assets/mpesapp.png";
import visaIcon from "../assets/visa.png";
import mastercardIcon from "../assets/mastercard.png";
import cashIcon from "../assets/cash.png";
import instagramIcon from "../assets/ig.png";
import whatsappIcon from "../assets/wapp.png";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer>
      <h2>Our Seamless 3-Step Delivery Process</h2>
      <div className="orders-desc">
        <div>
          <img src={addToCartIcon} />
          <p>Select your Favourite Products</p>
        </div>
        <div>
          <img src={placeOrderIcon} />
          <p>Place your Order</p>
        </div>
        <div>
          <img src={deliveryIcon} />
          <p>Speedy Delivery. Right to Your Doorstep.</p>
        </div>
      </div>
      <div className="centre">
        <div className="title">
          <h3>Techiq Solutions</h3>
          <p>
            Curating timeless scents that speak louder than words, designed for
            everyone, every season, every story.
          </p>
        </div>
        <div className="quick-links">
          <h3>Quick Links</h3>
          <Link to="/" style={{ textDecoration: "none", color: "#fffcf0" }}>
            {" "}
            <p>Home</p>
          </Link>

          <Link
            to="/all-products"
            style={{ textDecoration: "none", color: "#fffcf0" }}
          >
            {" "}
            <p>Products</p>
          </Link>

          <Link
            to="/login"
            style={{ textDecoration: "none", color: "#fffcf0" }}
          >
            {" "}
            <p>Login</p>
          </Link>

          <Link
            to="/register"
            style={{ textDecoration: "none", color: "#fffcf0" }}
          >
            <p>Register</p>
          </Link>

          <div className="payments-container">
            Mode of Payments
            <img title="M-PESA" src={mpesaIcon} />
            <img title="VISA" src={visaIcon} />
            <img title="MasterCard" src={mastercardIcon} />
            <img title="CASH" src={cashIcon} />
          </div>
        </div>
        <div className="contacts-section">
          <h3>Contact Us</h3>
          <Link
            to="https://www.instagram.com/lorisparfumekenya?igsh=Ymd5bTFiY3pwdG42"
            style={{ textDecoration: "none", color: "#fffcf0" }}
            target='_blank'

          >
            <img src={instagramIcon} />
          </Link>
          <Link
            to="https://wa.me/254799748449"
            target='_blank'
            style={{ textDecoration: "none", color: "#fffcf0" }}
          >
            <img src={whatsappIcon} />
          </Link>
          <p>0799 748 449</p>
          <p></p>
        </div>
      </div>
      <p>Copyright © 2025 Techiq Solutions.</p>
    </footer>
  );
};

export default Footer;
