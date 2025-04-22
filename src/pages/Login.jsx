import "../styles/login.css";
import logoImage from "../assets/lorislogo.png";
import { Link } from "react-router-dom";

const Login = () => {
  return (
    <div className="login-page">
      <div className="backdrop-filter-container"></div>
      <div className="inner-login-container">
        <div className="top">
          <img src={logoImage} />
        </div>
        <div className="center">
          <h1>Welcome Back!</h1>
          <p>Log back into your Loris Parfum account</p>
          <input type="email" placeholder="Enter your Email Adress" />
          <input type="password" placeholder="Enter your Password" />
          <h2>Forgot Password?</h2>
          <button>Log In</button>
          <Link style={{ textDecoration: "none" }} to="/create-your-account">
            <h2>Don't have an account? Sign up for free</h2>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
