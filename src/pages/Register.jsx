import "../styles/login.css";
import logoImage from "../assets/lorislogo.png";
import {Link} from 'react-router-dom'

const Register = () => {
  return (
    <div className="login-page">
      <div className="backdrop-filter-container"></div>
      <div className="inner-login-container">
        <div className="top">
          <img src={logoImage} />
        </div>
        <div className="center">
          <h1>Get Started</h1>
          <h2>Create Your Loris Parfum Account in Simple Steps!</h2>
          <div className="register-names">
            <input type="text" placeholder="Enter your First Name" />
            <input type="text" placeholder="Enter your Last Name" />
          </div>
          <input type="email" placeholder="Enter your Email Address" />
          <input type="password" placeholder="Enter your Password" />
          <input type="number" placeholder="Enter your Phone Number" />

          <h2>Forgot Password?</h2>
          <button>Sign Up</button>
          <Link style={{ textDecoration: "none" }} to="/login">
            <h2>Already have an account? Log back to your account</h2>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
