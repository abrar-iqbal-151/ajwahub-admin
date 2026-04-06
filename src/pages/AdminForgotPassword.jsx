import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Admin.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function AdminForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // email → reset
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleCheckEmail = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    if (!email.trim()) { setError('Please enter your email'); setLoading(false); return; }
    try {
      const res = await fetch(`${API}/api/admin/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() })
      });
      const data = await res.json();
      if (data.exists) {
        setStep('reset');
      } else {
        setError('No admin account found with this email');
      }
    } catch {
      setError('Server error. Please try again.');
    }
    setLoading(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); setLoading(false); return; }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(newPassword)) {
      setError('Must have uppercase, lowercase, number & special character'); setLoading(false); return;
    }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); setLoading(false); return; }
    try {
      const res = await fetch(`${API}/api/admin/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch {
      setError('Server error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <nav className="navbar">
        <div className="nav-logo">
          <img src="/LOGO.jpeg" alt="AjwaHub" className="nav-logo-icon" />
          <span className="nav-logo-text">AjwaHub</span>
        </div>
        <div className="nav-buttons">
          <button className="btn btn-secondary" onClick={() => navigate('/login')}>← Back to Login</button>
        </div>
      </nav>

      <div className="auth-box">
        <div className="auth-header">
          <h1>Reset Password</h1>
          <p>{step === 'email' ? 'Enter your admin email' : 'Set new password'}</p>
        </div>

        {error && <div className="auth-error"><span>⚠️</span>{error}</div>}
        {success && <div className="auth-success"><span>✅</span>{success}</div>}

        {step === 'email' && (
          <form className="auth-form" onSubmit={handleCheckEmail}>
            <div className="form-group">
              <input type="email" placeholder="Admin email" className="form-input"
                value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                disabled={loading} required autoFocus />
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? <><span className="spinner"></span>Checking...</> : 'Continue →'}
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form className="auth-form" onSubmit={handleReset}>
            <div className="form-group" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '8px', padding: '10px 14px', marginBottom: '8px' }}>
              <span style={{ color: '#60a5fa', fontSize: '13px' }}>📧 {email}</span>
            </div>
            <div className="form-group password-group">
              <input type={showPassword ? 'text' : 'password'} placeholder="New password (min 8 characters)"
                className="form-input" value={newPassword}
                onChange={e => { setNewPassword(e.target.value); setError(''); }}
                disabled={loading} required autoFocus />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} disabled={loading}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <div className="form-group password-group">
              <input type={showPassword ? 'text' : 'password'} placeholder="Confirm new password"
                className="form-input" value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                disabled={loading} required />
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? <><span className="spinner"></span>Resetting...</> : '🔑 Reset Password'}
            </button>
          </form>
        )}

        <div className="auth-switch">
          Remember password? <span onClick={() => navigate('/login')}>Sign in</span>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <span>© 2025 AjwaHub</span>
        </div>
      </footer>
    </div>
  );
}

export default AdminForgotPassword;
