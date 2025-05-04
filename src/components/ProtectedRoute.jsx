import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from '../../firebase/firebaseConfig';
import { FiLoader } from 'react-icons/fi';

const ProtectedRoute = ({ children }) => {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
      setAuthChecked(true);
    });
    
    return () => unsubscribe();
  }, []);
  
  if (!authChecked) {
    return (
      <div className="auth-checking">
        <FiLoader className="spinner" size={32} />
        <p>Checking authentication...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;