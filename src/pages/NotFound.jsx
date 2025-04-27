import { Link } from 'react-router-dom';
import '../styles/notFound.css';


const NotFound = () => {
  return (
    <div className="notfound-container">
      <h1 className="notfound-title">404</h1>
      <p className="notfound-message">
        Oops! The page you're looking for doesn’t exist.
      </p>
      <Link to="/" className="notfound-button">
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
