import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userAPI } from '../services/api.js';
import { Loader } from '../components/Loader.jsx';
import '../css/auth-premium.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [adminExists, setAdminExists] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  // Validation rules
  const validateForm = () => {
    const errors = {};
    
    if (!name.trim()) {
      errors.name = true;
    } else if (name.trim().length < 2 || name.trim().length > 50) {
      errors.name = true;
    }
    
    if (!email.trim()) {
      errors.email = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = true;
    }
    
    if (!phone.trim()) {
      errors.phone = true;
    } else if (!/^[0-9]{10}$/.test(phone.replace(/[- ]/g, ''))) {
      errors.phone = true;
    }
    
    if (password.length < 6) {
      errors.password = true;
    }
    
    if (password !== confirmPassword) {
      errors.confirmPassword = true;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    if (validationErrors.name) {
      setValidationErrors(prev => ({ ...prev, name: false }));
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (validationErrors.email) {
      setValidationErrors(prev => ({ ...prev, email: false }));
    }
  };

  const handlePhoneChange = (e) => {
    setPhone(e.target.value);
    if (validationErrors.phone) {
      setValidationErrors(prev => ({ ...prev, phone: false }));
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (validationErrors.password) {
      setValidationErrors(prev => ({ ...prev, password: false }));
    }
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (validationErrors.confirmPassword) {
      setValidationErrors(prev => ({ ...prev, confirmPassword: false }));
    }
  };

  // Check if admin already exists
  useEffect(() => {
    const checkAdminExists = async () => {
      try {
        const response = await userAPI.checkAdminExists();
        setAdminExists(response.data.adminExists);
      } catch (error) {
        console.error('Error checking admin existence:', error);
        // If error, assume admin doesn't exist to be safe
        setAdminExists(false);
      }
    };
    
    checkAdminExists();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setError('');
    setSuccess('');

    // Check if trying to register as admin when admin already exists
    if (role === 'admin' && adminExists) {
      setError('Admin slot is already taken. Please register as a customer.');
      return;
    }

    setIsLoading(true);

    try {
      await userAPI.register({ name, email, phone, password, role });
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      // Handle validation errors from server
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.';
      
      // If it's a validation error array, join them
      if (Array.isArray(errorMessage)) {
        setError(errorMessage.join(', '));
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="premium-auth-container">
      <Loader visible={isLoading} size="md" />
      {/* Header */}
      <div className="auth-header">
        <div className="header-content">
          <h1>Create Account</h1>
          <p>Join our community and start shopping premium products</p>
        </div>
      </div>

      <div className="auth-wrapper">
        {/* Left Side - Form */}
        <div className="auth-form-section">
          <div className="auth-card">
            {/* Account Type Selector */}
            <div className="account-type-section">
              <h3>👤 Account Type</h3>
              <div className="role-selector">
                <label className={`role-option ${role === 'user' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    value="user"
                    checked={role === 'user'}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  <span className="role-icon">👤</span>
                  <div className="role-info-box">
                    <span className="role-label">Customer</span>
                    <span className="role-desc">Shop and track orders</span>
                  </div>
                </label>
                <label className={`role-option ${role === 'admin' ? 'active' : ''} ${adminExists ? 'disabled' : ''}`}>
                  <input
                    type="radio"
                    value="admin"
                    checked={role === 'admin'}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={adminExists}
                  />
                  <span className="role-icon">🛡️</span>
                  <div className="role-info-box">
                    <span className="role-label">Admin</span>
                    <span className="role-desc">{adminExists ? 'Admin slot is full' : 'Manage products & orders'}</span>
                  </div>
                </label>
              </div>
              {role === 'admin' && (
                <div className="warning-box">
                  <span className="warning-icon">⚠️</span>
                  <span className="warning-text">Admin registration is restricted. Contact support if you need admin access.</span>
                </div>
              )}
            </div>

            {/* Error and Success Messages */}
            {error && (
              <div className="alert alert-error">
                <span className="alert-icon">❌</span>
                <div>
                  <span>{error}</span>
                  {error.includes('Valid email') && <p style={{marginTop: '5px', fontSize: '12px'}}>Please enter a valid email address (e.g., user@example.com)</p>}
                  {error.includes('at least 6 characters') && <p style={{marginTop: '5px', fontSize: '12px'}}>Password needs to be at least 6 characters long</p>}
                  {error.includes('Name') && <p style={{marginTop: '5px', fontSize: '12px'}}>Please enter a valid name (2-50 characters)</p>}
                  {error.includes('phone') && <p style={{marginTop: '5px', fontSize: '12px'}}>Please enter a valid 10-digit phone number</p>}
                </div>
              </div>
            )}
            {success && (
              <div className="alert alert-success">
                <span className="alert-icon">✅</span>
                <span>{success}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="auth-form">
              {/* Full Name */}
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    className={`form-input ${validationErrors.name ? 'input-error' : ''}`}
                    placeholder="Enter your full name"
                    value={name}
                    onChange={handleNameChange}
                    disabled={isLoading}
                  />
                  <span className="input-icon">👤</span>
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    className={`form-input ${validationErrors.email ? 'input-error' : ''}`}
                    placeholder="Enter your email"
                    value={email}
                    onChange={handleEmailChange}
                    disabled={isLoading}
                  />
                  <span className="input-icon">📧</span>
                </div>
              </div>

              {/* Contact Number */}
              <div className="form-group">
                <label className="form-label">Contact Number</label>
                <div className="input-wrapper">
                  <input
                    type="tel"
                    className={`form-input ${validationErrors.phone ? 'input-error' : ''}`}
                    placeholder="Enter your contact number"
                    value={phone}
                    onChange={handlePhoneChange}
                    disabled={isLoading}
                  />
                  <span className="input-icon">📱</span>
                </div>
              </div>

              {/* Password */}
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`form-input ${validationErrors.password ? 'input-error' : ''}`}
                    placeholder="Create a password (min 6 chars)"
                    value={password}
                    onChange={handlePasswordChange}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                <p style={{fontSize: '12px', color: '#666', marginTop: '5px'}}>Minimum 6 characters</p>
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`form-input ${validationErrors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="auth-submit-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-mini"></span>
                    Creating Account...
                  </>
                ) : (
                  '✓ Create Account'
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="auth-footer">
              <p className="auth-link-text">
                Already have an account?
                <Link to="/login" className="auth-link">Login here</Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Benefits */}
        <div className="auth-benefits-section">
          <div className="benefits-card">
            <h3>Why Join Us?</h3>

            <div className="benefit-item">
              <span className="benefit-icon">🎁</span>
              <div>
                <h4>Exclusive Deals</h4>
                <p>Access member-only offers and discounts</p>
              </div>
            </div>

            <div className="benefit-item">
              <span className="benefit-icon">🚚</span>
              <div>
                <h4>Fast Delivery</h4>
                <p>Get your orders delivered in 1-2 days</p>
              </div>
            </div>

            <div className="benefit-item">
              <span className="benefit-icon">↩️</span>
              <div>
                <h4>Easy Returns</h4>
                <p>30-day hassle-free return policy</p>
              </div>
            </div>

            <div className="benefit-item">
              <span className="benefit-icon">🔒</span>
              <div>
                <h4>Secure Shopping</h4>
                <p>Your data is protected with SSL encryption</p>
              </div>
            </div>

            <div className="benefit-item">
              <span className="benefit-icon">📱</span>
              <div>
                <h4>Track Orders</h4>
                <p>Real-time tracking for all your purchases</p>
              </div>
            </div>

            <div className="benefit-item">
              <span className="benefit-icon">⭐</span>
              <div>
                <h4>Rewards Program</h4>
                <p>Earn points on every purchase</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
