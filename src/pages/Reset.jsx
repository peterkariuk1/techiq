import { useState } from "react";
import "../styles/login.css";
import logoImage from "../assets/lorislogo.png";
import { Link } from "react-router-dom";
import { auth } from "../../firebase/firebaseConfig.js";
import { sendPasswordResetEmail } from "firebase/auth";

const Reset = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState(""); // success or error

  
  // Handle password reset request
  const handleForgotPassword = async () => {
    if (!email) {
      setStatusType("error");
      setStatusMessage("Please enter your email to reset password");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await sendPasswordResetEmail(auth, email);
      setStatusType("success");
      setStatusMessage("Password reset email sent. Please check your inbox.");
    } catch (error) {
      console.error("Password reset error:", error);
      setStatusType("error");
      setStatusMessage(error.message || "Failed to send reset email. Please try again.");
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

          <button 
            onClick={handleForgotPassword}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Reset Password"}
          </button>
          
          <Link style={{ textDecoration: "none" }} to="/register">
            <h2>Don't have an account? Sign up for free</h2>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Reset;
