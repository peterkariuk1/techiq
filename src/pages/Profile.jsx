import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { FiLoader, FiEdit, FiSave, FiX, FiArrowLeft, FiUser, FiLock, FiShoppingBag, FiCheck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import '../styles/profile.css';

const Profile = () => {
  const navigate = useNavigate();

  // State for user data
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  
  // State for password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [activeSection, setActiveSection] = useState('profile');
  
  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData({
              firstName: data.firstName || '',
              lastName: data.lastName || '',
              email: currentUser.email || '',
              phone: data.phone || ''
            });
          }
        }
      } catch (error) {
        setError("Error fetching user data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;   
      setUserData({
        ...userData,
        [name]: value
      });
  };
  
  // Handle password input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };
  
  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    setSuccess(null);

    try {
      const currentUser = auth.currentUser;
      
      // Update Firestore document with firstName and lastName
      await updateDoc(doc(db, "users", currentUser.uid), {
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        updatedAt: new Date()
      });
      
      // Update email if changed by user
      if (userData.email !== currentUser.email) {
        await updateEmail(currentUser, userData.email);
      }
      
      setSuccess("Profile updated successfully!");
      setEditMode(false);
    } catch (error) {
      setError(`Error updating profile: ${error.message}`);
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };
  
  // Handle password update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setPasswordError(null);
    setPasswordSuccess(null);
    
    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords don't match");
      setUpdating(false);
      return;
    }
    
    try {
      const currentUser = auth.currentUser;
      
      // Re-authenticate user before password change
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        passwordData.currentPassword
      );
      
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, passwordData.newPassword);
      
      setPasswordSuccess("Password updated successfully!");
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        setPasswordError("Current password is incorrect");
      } else {
        setPasswordError(`Error updating password: ${error.message}`);
      }
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };
  
  if (loading) {
    return (
      <div className="profile-loading-screen">
        <div className="loading-container">
          <FiLoader className="loading-spinner" />
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Get user initials for avatar
  const getInitials = () => {
    return `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`.toUpperCase();
  };
  
  return (
    <div className="profile-page">
      <div className="profile-header">
        <button onClick={handleBack} className="back-button">
          <FiArrowLeft /> <span>Back to Home</span>
        </button>
        <h1>My Account</h1>
      </div>
      
      <div className="profile-layout">
        {/* Sidebar / Navigation */}
        <div className="profile-sidebar">
          <div className="user-avatar">
            <div className="avatar-circle">
              {getInitials()}
            </div>
            <div className="user-name">
              {userData.firstName} {userData.lastName}
            </div>
            <div className="user-email">{userData.email}</div>
          </div>
          
          <nav className="profile-nav">
            <button 
              className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveSection('profile')}
            >
              <FiUser /> <span>Personal Information</span>
            </button>
            <button 
              className={`nav-item ${activeSection === 'security' ? 'active' : ''}`}
              onClick={() => setActiveSection('security')}
            >
              <FiLock /> <span>Security</span>
            </button>
            <button 
              className={`nav-item ${activeSection === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveSection('orders')}
            >
              <FiShoppingBag /> <span>Order History</span>
            </button>
          </nav>
        </div>
        
        {/* Main Content Area */}
        <div className="profile-content">
          {/* Personal Information Section */}
          {activeSection === 'profile' && (
            <div className="content-card">
              <div className="card-header">
                <h2>Personal Information</h2>
                <button 
                  type="button" 
                  className={`edit-toggle-btn ${editMode ? 'active' : ''}`}
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? (
                    <>
                      <FiX /> <span>Cancel</span>
                    </>
                  ) : (
                    <>
                      <FiEdit /> <span>Edit</span>
                    </>
                  )}
                </button>
              </div>
              
              {error && (
                <div className="message error-message">
                  <FiX className="message-icon" />
                  {error}
                </div>
              )}
              
              {success && (
                <div className="message success-message">
                  <FiCheck className="message-icon" />
                  {success}
                </div>
              )}
              
              <form onSubmit={handleProfileUpdate}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={userData.firstName}
                      onChange={handleChange}
                      disabled={!editMode}
                      required
                      className={editMode ? 'editable' : ''}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={userData.lastName}
                      onChange={handleChange}
                      disabled={!editMode}
                      required
                      className={editMode ? 'editable' : ''}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={userData.email}
                    onChange={handleChange}
                    disabled={!editMode}
                    required
                    className={editMode ? 'editable' : ''}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={userData.phone}
                    onChange={handleChange}
                    disabled={!editMode}
                    placeholder="e.g., 0712345678"
                    className={editMode ? 'editable' : ''}
                  />
                </div>

                {editMode && (
                  <div className="form-actions">
                    <button 
                      type="submit" 
                      className="primary-button"
                      disabled={updating}
                    >
                      {updating ? (
                        <>
                          <FiLoader className="button-icon spinner" /> Updating...
                        </>
                      ) : (
                        <>
                          <FiSave className="button-icon" /> Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}
          
          {/* Password Section */}
          {activeSection === 'security' && (
            <div className="content-card">
              <div className="card-header">
                <h2>Change Password</h2>
              </div>
              
              {passwordError && (
                <div className="message error-message">
                  <FiX className="message-icon" />
                  {passwordError}
                </div>
              )}
              
              {passwordSuccess && (
                <div className="message success-message">
                  <FiCheck className="message-icon" />
                  {passwordSuccess}
                </div>
              )}
              
              <form onSubmit={handlePasswordUpdate}>
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    className="password-input"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength="8"
                      className="password-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      className="password-input"
                    />
                  </div>
                </div>
                
                <div className="password-requirements">
                  <h4>Password requirements:</h4>
                  <ul>
                    <li>At least 8 characters long</li>
                    <li>Include a mix of letters, numbers, and symbols for better security</li>
                  </ul>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="primary-button"
                    disabled={updating}
                  >
                    {updating ? (
                      <>
                        <FiLoader className="button-icon spinner" /> Updating...
                      </>
                    ) : (
                      <>
                        <FiSave className="button-icon" /> Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Order History Section */}
          {activeSection === 'orders' && (
            <div className="content-card">
              <div className="card-header">
                <h2>Order History</h2>
              </div>
              
              <div className="order-history-placeholder">
                <FiShoppingBag className="order-icon" />
                <h3>Track Your Orders</h3>
                <p>View your purchase history and check delivery status</p>
                <button 
                  className="primary-button"
                  onClick={() => navigate('/orders')}
                >
                  View All Orders
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;