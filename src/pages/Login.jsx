import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { Loader } from '../components/Loader.jsx';
import '../css/auth-premium.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Validation rules
  const validateForm = () => {
    const errors = {};
    
    if (!email.trim()) {
      errors.email = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = true;
    }
    
    if (!password) {
      errors.password = true;
    } else if (password.length < 6) {
      errors.password = true;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (validationErrors.email) {
      setValidationErrors(prev => ({ ...prev, email: false }));
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (validationErrors.password) {
      setValidationErrors(prev => ({ ...prev, password: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setError('');
    setSuccess('');

    setIsLoading(true);

    try {
      const result = await login(email, password, role);
      setSuccess('Login successful! Redirecting...');
      
      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberEmail', email);
      } else {
        localStorage.removeItem('rememberEmail');
      }

      // Redirect based on role
      setTimeout(() => {
        if (result.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }, 1500);
    } catch (err) {
      setError(err || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="premium-auth-container login-page">
      <Loader visible={isLoading} size="md" />
      {/* Header */}
      <div className="auth-header">
        <div className="header-content">
          <h1>Welcome Back</h1>
          <p>Log in to access your account and track your orders</p>
        </div>
      </div>

      <div className="auth-wrapper">
        {/* Left Side - Benefits */}
        <div className="auth-benefits-section">
          <div className="benefits-card">
            <h3>Your Account Benefits</h3>

            <div className="benefit-item">
              <span className="benefit-icon">📦</span>
              <div>
                <h4>Track Orders</h4>
                <p>Real-time tracking of your purchases</p>
              </div>
            </div>

            <div className="benefit-item">
              <span className="benefit-icon">❤️</span>
              <div>
                <h4>Saved Wishlist</h4>
                <p>Keep your favorite items organized</p>
              </div>
            </div>

            <div className="benefit-item">
              <span className="benefit-icon">🔒</span>
              <div>
                <h4>Secure Account</h4>
                <p>Your data is always protected</p>
              </div>
            </div>

            <div className="benefit-item">
              <span className="benefit-icon">🎁</span>
              <div>
                <h4>Exclusive Offers</h4>
                <p>Personalized deals just for you</p>
              </div>
            </div>

            <div className="benefit-item">
              <span className="benefit-icon">⚡</span>
              <div>
                <h4>Quick Checkout</h4>
                <p>Saved addresses for faster ordering</p>
              </div>
            </div>

            <div className="benefit-item">
              <span className="benefit-icon">💳</span>
              <div>
                <h4>Payment Methods</h4>
                <p>Multiple secure payment options</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-form-section">
          <div className="auth-card">
            {/* Error and Success Messages */}
            {error && (
              <div className="alert alert-error">
                <span className="alert-icon">❌</span>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="alert alert-success">
                <span className="alert-icon">✅</span>
                <span>{success}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="auth-form">
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

              {/* Password */}
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`form-input ${validationErrors.password ? 'input-error' : ''}`}
                    placeholder="Enter your password"
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
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="login-options">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                  />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
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
                    Logging in...
                  </>
                ) : (
                  '✓ Login'
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="auth-footer">
              <p className="auth-link-text">
                Don't have an account?
                <Link to="/register" className="auth-link">Create one now</Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
