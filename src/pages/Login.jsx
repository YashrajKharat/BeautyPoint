import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { Loader } from '../components/Loader.jsx';
import '../css/auth-premium.css';

export default function Login() {
  const { loginWithWhatsApp } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Define the global callback for OTPLess
    window.otpless = async (otplessUser) => {
      console.log('OTPLess User Data:', otplessUser);
      // alert('WhatsApp Callback Triggered! ' + JSON.stringify(otplessUser)); // Debugging line

      if (!otplessUser) {
        setError('Authentication failed. Please try again.');
        return;
      }

      // Extract phone number and name safely
      // OTPLess structure can vary slightly, so we check multiple fields
      const phone = otplessUser.waNumber ||
        otplessUser?.identities?.[0]?.identityValue ||
        otplessUser?.mobile?.number;

      const name = otplessUser.waName ||
        otplessUser?.identities?.[0]?.name ||
        otplessUser?.mobile?.name ||
        'WhatsApp User';

      // alert(`Detected Phone: ${phone}, Name: ${name}`); // Debugging line

      if (!phone) {
        setError('Could not get phone number from WhatsApp. Please try again.');
        return;
      }

      setIsLoading(true);
      try {
        const result = await loginWithWhatsApp(phone, name);
        // Redirect based on role
        if (result.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } catch (err) {
        console.error('Login error:', err);
        setError('Login failed. Server response: ' + (err.message || err));
        // alert('Login API Error: ' + (err.message || err)); // Debugging line
        setIsLoading(false);
      }
    };

    // Cleanup if needed (though window.otpless usually stays)
    return () => {
      // window.otpless = null; // Don't remove for better UX on re-renders
    };
  }, [loginWithWhatsApp, navigate]);

  return (
    <div className="premium-auth-container login-page">
      <Loader visible={isLoading} size="md" />

      <div className="auth-wrapper" style={{ justifyContent: 'center' }}>
        <div className="auth-card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '40px 20px' }}>

          <div className="auth-header" style={{ marginBottom: '30px' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Welcome Back</h1>
            <p style={{ color: '#666' }}>Login instantly with WhatsApp</p>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '20px' }}>
              <span>{error}</span>
            </div>
          )}

          <div id="otpless-login-page" style={{ minHeight: '50px' }}>
            {/* OTPLess Widget will likely interact here or be floating */}
            <p style={{ fontSize: '14px', color: '#888', fontStyle: 'italic' }}>
              Please click the WhatsApp button on the screen to login.
            </p>
          </div>

          {/* DEMO BUTTON - Remove this after you get the App ID */}
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
            <p style={{ fontSize: '12px', color: '#999' }}>
              Secure Passwordless Authentication
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
