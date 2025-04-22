import { useState } from "react";
import "../styles/login.css";
import logoImage from "../assets/lorislogo.png";
import { Link, Links, useNavigate } from "react-router-dom";
import { auth } from "../../firebase/firebaseConfig.js";
import { signInWithEmailAndPassword } from "firebase/auth";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState(""); // success or error

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setStatusType("error");
      setStatusMessage("Please enter both email and password");
      return;
    }
    
    setIsLoading(true);
    setStatusMessage("");
    setStatusType("");
    
    try {
      // Sign in with email and password
      await signInWithEmailAndPassword(auth, email, password);
      
      // Login successful
      setStatusType("success");
      setStatusMessage("Login successful! Redirecting...");
      
      // Redirect to home page after a delay
      setTimeout(() => {
        navigate('/');
      }, 1000);
      
    } catch (error) {
      console.error("Login error:", error);
      
      // Handle different error cases
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
        setStatusMessage("Invalid email or password. Please try again.");
      } else if (error.code === 'auth/too-many-requests') {
        setStatusMessage("Too many failed login attempts. Please try again later.");
      } else {
        setStatusMessage(error.message || "Login failed. Please try again.");
      }
      
      setStatusType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="backdrop-filter-container"></div>
      <div className="inner-login-container">
        <div className="top">
          <img src={logoImage} alt="Loris Perfume" />
        </div>
        <div className="center">
          <h1>Welcome Back!</h1>
          <p>Log back into your Loris Parfum account</p>
          
          {statusMessage && (
            <div className={`status-message ${statusType}`}>
              {statusMessage}
            </div>
          )}
          
          <input 
            type="email" 
            placeholder="Enter your Email Address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Enter your Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Link style={{ textDecoration: "none" }} to="/reset">
            <h2 style={{ cursor: 'pointer' }}>
              Forgot Password?
            </h2>
          </Link>
          
          <button 
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Log In"}
          </button>
          
          <Link style={{ textDecoration: "none" }} to="/register">
            <h2>Don't have an account? Sign up for free</h2>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
