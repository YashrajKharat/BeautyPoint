import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { Loader } from '../components/Loader.jsx';
import '../css/auth-premium.css';

export default function Login() {
  const { loginWithWhatsApp, login } = useContext(AuthContext); // Added login
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Admin Login State
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Handle WhatsApp Login (OTPLess)
  useEffect(() => {
    // Only verify OTPLess if NOT in Admin mode
    if (isAdminLogin) return;

    window.otpless = async (otplessUser) => {
      console.log('OTPLess User Data:', otplessUser);

      if (!otplessUser) {
        setError('Authentication failed. Please try again.');
        return;
      }

      const phone = otplessUser.waNumber ||
        otplessUser?.identities?.[0]?.identityValue ||
        otplessUser?.mobile?.number;

      const name = otplessUser.waName ||
        otplessUser?.identities?.[0]?.name ||
        otplessUser?.mobile?.name ||
        'WhatsApp User';

      if (!phone) {
        setError('Could not get phone number from WhatsApp. Please try again.');
        return;
      }

      setIsLoading(true);
      try {
        const result = await loginWithWhatsApp(phone, name);
        if (result.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } catch (err) {
        console.error('Login error:', err);
        setError('Login failed. Server response: ' + (err.message || err));
        setIsLoading(false);
      }
    };
  }, [loginWithWhatsApp, navigate, isAdminLogin]);

  // Handle Admin Email Login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(email, password, 'admin');
      if (result.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        // Fallback if a regular user tries to login via email (optional)
        navigate('/');
      }
    } catch (err) {
      setError(err || 'Admin login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="premium-auth-container login-page">
      <Loader visible={isLoading} size="md" />

      <div className="auth-wrapper" style={{ justifyContent: 'center' }}>
        <div className="auth-card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '40px 20px' }}>

          <div className="auth-header" style={{ marginBottom: '30px' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>
              {isAdminLogin ? 'Admin Login' : 'Welcome Back'}
            </h1>
            <p style={{ color: '#666' }}>
              {isAdminLogin ? 'Sign in to manage your store' : 'Login instantly with WhatsApp'}
            </p>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '20px' }}>
              <span>{error}</span>
            </div>
          )}

          {/* TOGGLE VIEW */}
          {isAdminLogin ? (
            // --- ADMIN EMAIL FORM ---
            <form onSubmit={handleAdminLogin} className="auth-form" style={{ textAlign: 'left' }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    className="form-input"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <span className="input-icon">📧</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span className="input-icon">🔒</span>
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Login as Admin'}
              </button>

              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => { setIsAdminLogin(false); setError(''); }}
                  style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  &larr; Back to WhatsApp Login
                </button>
              </div>
            </form>
          ) : (
            // --- WHATSAPP USER LOGIN ---
            <>
              <div id="otpless-login-page" style={{ minHeight: '50px' }}>
                <p style={{ fontSize: '14px', color: '#888', fontStyle: 'italic' }}>
                  Please click the WhatsApp button on the screen to login.
                </p>
              </div>

              {/* DEMO BUTTON */}
              <div style={{ marginTop: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                  ⚠️ Dashboard down? Use this to test:
                </p>
                <button
                  onClick={() => {
                    console.log('Simulating login...');
                    window.otpless({
                      waNumber: '919876543210',
                      waName: 'Test User'
                    });
                  }}
                  style={{
                    background: '#25D366',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Simulate WhatsApp Login
                </button>
              </div>

              <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <p style={{ fontSize: '12px', color: '#999', marginBottom: '10px' }}>
                  Secure Passwordless Authentication
                </p>
                <button
                  onClick={() => { setIsAdminLogin(true); setError(''); }}
                  style={{ fontSize: '12px', color: '#333', background: 'none', border: '1px solid #ddd', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Admin Login (Email)
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
