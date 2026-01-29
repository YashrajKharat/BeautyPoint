import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader } from '../components/Loader.jsx';
import '../css/auth-premium.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('email'); // email, otp, password, success
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:5000/api`;

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/users/password-reset/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      setSuccess(`OTP sent to ${email}`);
      setOtpSent(true);
      setResendTimer(60);
      setStep('otp');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    if (otp.length < 4) {
      setError('OTP must be at least 4 digits');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/users/password-reset/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid OTP. Please try again.');
      }

      setSuccess('OTP verified successfully!');
      setStep('password');
      
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newPassword) {
      setError('Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/users/password-reset/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password. Please try again.');
      }

      setSuccess('Password reset successfully! Redirecting to login...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend timer
  const handleResendOTP = async () => {
    setError('');
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/password-reset/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      setSuccess('OTP resent to your email');
      setResendTimer(60);
      setOtp('');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Timer effect for resend OTP
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  return (
    <div className="premium-auth-container forgot-password-page">
      <Loader visible={isLoading} size="md" />
      {/* Header */}
      <div className="auth-header">
        <div className="header-content">
          <h1>Reset Your Password</h1>
          <p>Don't worry, we'll help you recover your account access</p>
        </div>
      </div>

      <div className="auth-wrapper forgot-password-wrapper">
        {/* Left Side - Process Steps */}
        <div className="auth-benefits-section">
          <div className="benefits-card forgot-steps-card">
            <h3>Password Recovery Steps</h3>

            <div className={`recovery-step ${step === 'email' || step === 'otp' || step === 'password' || step === 'success' ? 'completed' : ''}`}>
              <div className="step-number">1</div>
              <div>
                <h4>Enter Email</h4>
                <p>Provide your registered email address</p>
              </div>
            </div>

            <div className={`recovery-step ${step === 'otp' || step === 'password' || step === 'success' ? 'active' : ''} ${step === 'password' || step === 'success' ? 'completed' : ''}`}>
              <div className="step-number">2</div>
              <div>
                <h4>Verify OTP</h4>
                <p>We'll send you a one-time password</p>
              </div>
            </div>

            <div className={`recovery-step ${step === 'password' || step === 'success' ? 'active' : ''} ${step === 'success' ? 'completed' : ''}`}>
              <div className="step-number">3</div>
              <div>
                <h4>New Password</h4>
                <p>Create a secure new password</p>
              </div>
            </div>

            <div className={`recovery-step ${step === 'success' ? 'active' : ''}`}>
              <div className="step-number">4</div>
              <div>
                <h4>Complete</h4>
                <p>Your password has been reset</p>
              </div>
            </div>

            <div className="security-info">
              <span className="info-icon">🔒</span>
              <span className="info-text">Your password reset is secure and encrypted</span>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-form-section">
          <div className="auth-card forgot-password-card">
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

            {/* Step 1: Email */}
            {step === 'email' && (
              <form onSubmit={handleSendOTP} className="auth-form">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-wrapper">
                    <input
                      type="email"
                      className="form-input"
                      placeholder="Enter your registered email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                    <span className="input-icon">📧</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-mini"></span>
                      Sending OTP...
                    </>
                  ) : (
                    '→ Send OTP'
                  )}
                </button>
              </form>
            )}

            {/* Step 2: OTP */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOTP} className="auth-form">
                <div className="form-group">
                  <label className="form-label">Enter OTP</label>
                  <p className="form-hint">We sent a one-time password to {email}</p>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      className="form-input otp-input"
                      placeholder="Enter 4-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength="6"
                      disabled={isLoading}
                    />
                    <span className="input-icon">🔐</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-mini"></span>
                      Verifying...
                    </>
                  ) : (
                    '→ Verify OTP'
                  )}
                </button>

                <button
                  type="button"
                  className="auth-secondary-btn"
                  onClick={handleResendOTP}
                  disabled={isLoading || resendTimer > 0}
                >
                  {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </form>
            )}

            {/* Step 3: New Password */}
            {step === 'password' && (
              <form onSubmit={handleResetPassword} className="auth-form">
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div className="input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Create a new password (min 6 chars)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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

                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <div className="input-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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

                <button
                  type="submit"
                  className="auth-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-mini"></span>
                      Resetting...
                    </>
                  ) : (
                    '✓ Reset Password'
                  )}
                </button>
              </form>
            )}

            {/* Step 4: Success */}
            {step === 'success' && (
              <div className="success-container">
                <div className="success-icon">✅</div>
                <h2>Password Reset Complete!</h2>
                <p>Your password has been successfully reset.</p>
                <p>You can now log in with your new password.</p>
                <Link to="/login" className="auth-submit-btn" style={{ textDecoration: 'none', display: 'inline-flex', justifyContent: 'center' }}>
                  ← Back to Login
                </Link>
              </div>
            )}

            {/* Footer Links */}
            {step !== 'success' && (
              <div className="auth-footer">
                <p className="auth-link-text">
                  Remember your password?
                  <Link to="/login" className="auth-link">Log in here</Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
