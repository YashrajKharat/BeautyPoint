import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { Loader } from '../components/Loader.jsx';
import '../css/auth-premium.css';

export default function Login() {
  const { login, loginWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Admin Login State
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
              {isAdminLogin ? 'Admin Login' : 'Welcome to Beauty Point'}
            </h1>
            <p style={{ color: '#666' }}>
              {isAdminLogin ? 'Sign in to manage your store' : 'Sign in to access your account'}
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
                  &larr; Back to User Login
                </button>
              </div>
            </form>
          ) : (
            // --- GOOGLE USER LOGIN ---
            <>
              {/* GOOGLE LOGIN BUTTON */}
              <div style={{ marginBottom: '20px' }}>
                <button
                  onClick={() => loginWithGoogle()}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#fff',
                    color: '#757575',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    style={{ width: '18px', marginRight: '10px' }}
                  />
                  Continue with Google
                </button>
              </div>

              <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <p style={{ fontSize: '12px', color: '#999', marginBottom: '10px' }}>
                  Are you an Administrator?
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
