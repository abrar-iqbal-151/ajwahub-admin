import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/Admin.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function AdminSignup() {
  const navigate = useNavigate();
  const location = useLocation();
  const inviteToken = new URLSearchParams(location.search).get('invite') || '';
  const [inviteValid, setInviteValid] = useState(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');

  useEffect(() => {
    if (!inviteToken) { setInviteValid(false); return; }
    fetch(`${API}/api/admin/invite/verify?token=${inviteToken}`)
      .then(r => r.json())
      .then(d => setInviteValid(d.valid))
      .catch(() => setInviteValid(false));
  }, [inviteToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { firstName, lastName, email, password, confirmPassword } = formData;
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields'); setLoading(false); return;
    }
    if (!/^[a-zA-Z\s'-]+$/.test(firstName.trim()) || firstName.trim().length < 2) {
      setError('Enter a valid first name'); setLoading(false); return;
    }
    if (!/^[a-zA-Z\s'-]+$/.test(lastName.trim()) || lastName.trim().length < 2) {
      setError('Enter a valid last name'); setLoading(false); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address'); setLoading(false); return;
    }
    if (password.length < 8) { setError('Password must be at least 8 characters'); setLoading(false); return; }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
      setError('Password must have uppercase, lowercase, number & special character'); setLoading(false); return;
    }
    if (password !== confirmPassword) { setError('Passwords do not match'); setLoading(false); return; }
    if (!acceptTerms) { setError('Please accept the Terms of Service'); setLoading(false); return; }

    try {
      const res = await fetch(`${API}/api/admin/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `${firstName.trim()} ${lastName.trim()}`, email: email.toLowerCase().trim(), password, inviteToken })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('ajwaHub_admin', JSON.stringify(data.admin));
        localStorage.setItem('ajwaHub_adminToken', data.token);
        navigate('/panel');
      } else {
        setError(data.message || 'Signup failed. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection.');
    }
    setLoading(false);
  };

  const handlePassword = (val) => {
    setFormData({ ...formData, password: val });
    setError('');
    if (!val) setPasswordStrength('');
    else if (val.length < 8) setPasswordStrength('weak');
    else if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(val)) setPasswordStrength('strong');
    else setPasswordStrength('medium');
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

      {inviteValid === false && (
        <div className="auth-box" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🚫</div>
          <h2 style={{ color: '#f87171', marginBottom: '8px' }}>Access Denied</h2>
          <p style={{ color: '#9ca3af' }}>Valid invite link required to create admin account.</p>
          <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '8px' }}>Contact existing admin for an invite link.</p>
        </div>
      )}

      {inviteValid === null && (
        <div className="auth-box" style={{ textAlign: 'center' }}>
          <p style={{ color: '#9ca3af' }}>⏳ Verifying invite link...</p>
        </div>
      )}

      {inviteValid === true && (
        <div className="auth-box">
          <div className="auth-header">
            <h1>Create Admin</h1>
            <p>Register as AjwaHub Administrator</p>
          </div>

          {error && <div className="auth-error"><span>⚠️</span>{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <input type="text" placeholder="First Name" className="form-input"
              value={formData.firstName}
              onChange={e => { setFormData({ ...formData, firstName: e.target.value }); setError(''); }}
              disabled={loading} required />
            <input type="text" placeholder="Last Name" className="form-input"
              value={formData.lastName}
              onChange={e => { setFormData({ ...formData, lastName: e.target.value }); setError(''); }}
              disabled={loading} required />
          </div>

          <div className="form-group">
            <input type="email" placeholder="Admin email" className="form-input"
              value={formData.email}
              onChange={e => { setFormData({ ...formData, email: e.target.value }); setError(''); }}
              disabled={loading} autoComplete="off" required />
          </div>

          <div className="form-group password-group">
            <input type={showPassword ? 'text' : 'password'} placeholder="Password (min 8 characters)" className="form-input"
              value={formData.password} onChange={e => handlePassword(e.target.value)}
              disabled={loading} autoComplete="new-password" required />
            <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} disabled={loading}>
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          {passwordStrength && (
            <div className="password-strength">
              <div className="strength-bar"><div className={`strength-fill ${passwordStrength}`}></div></div>
              <span className="strength-text">
                {passwordStrength === 'weak' && '⚠️ Weak password'}
                {passwordStrength === 'medium' && '🔶 Medium strength'}
                {passwordStrength === 'strong' && '✅ Strong password'}
              </span>
            </div>
          )}

          <div className="form-group password-group">
            <input type={showConfirm ? 'text' : 'password'} placeholder="Confirm password" className="form-input"
              value={formData.confirmPassword}
              onChange={e => { setFormData({ ...formData, confirmPassword: e.target.value }); setError(''); }}
              disabled={loading} autoComplete="new-password" required />
            <button type="button" className="password-toggle" onClick={() => setShowConfirm(!showConfirm)} disabled={loading}>
              {showConfirm ? '🙈' : '👁️'}
            </button>
          </div>

          <div className="terms-checkbox">
            <label className="checkbox-container">
              <input type="checkbox" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)} disabled={loading} />
              <span className="checkmark"></span>
              <span className="terms-text">I agree to the <span className="terms-link">Terms of Service</span> and <span className="terms-link">Privacy Policy</span></span>
            </label>
          </div>

          <button type="submit" className="signup-btn" disabled={loading || !acceptTerms}>
            {loading ? <><span className="spinner"></span>Creating Account...</> : 'Create Admin Account'}
          </button>
        </form>

          <div className="auth-switch">
            Already have an account? <span onClick={() => navigate('/login')}>Sign in</span>
          </div>
        </div>
      )}

      <footer className="footer">
        <div className="footer-content">
          <span>© 2025 Made by</span>
          <span>AjwaHub Team</span>
        </div>
      </footer>
    </div>
  );
}

export default AdminSignup;
