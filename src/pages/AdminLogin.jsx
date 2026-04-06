import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Admin.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all fields'); setLoading(false); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address'); setLoading(false); return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters'); setLoading(false); return;
    }

    try {
      const res = await fetch(`${API}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('ajwaHub_admin', JSON.stringify(data.admin));
        localStorage.setItem('ajwaHub_adminToken', data.token);
        navigate('/panel');
      } else {
        setError(data.message || 'Invalid email or password.');
      }
    } catch {
      setError('Server connection failed. Please try again.');
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
          <button className="btn btn-primary" onClick={() => navigate('/signup')}>Create Admin</button>
        </div>
      </nav>

      <div className="auth-box">
        <div className="auth-header">
          <h1>Admin Panel</h1>
          <p>Sign in to your admin account</p>
        </div>

        {error && <div className="auth-error"><span>⚠️</span>{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email" placeholder="Admin email"
              className={`form-input ${error ? 'error' : ''}`}
              value={formData.email}
              onChange={e => { setFormData({ ...formData, email: e.target.value }); setError(''); }}
              disabled={loading} autoComplete="off" required
            />
          </div>
          <div className="form-group password-group">
            <input
              type={showPassword ? 'text' : 'password'} placeholder="Password"
              className={`form-input ${error ? 'error' : ''}`}
              value={formData.password}
              onChange={e => { setFormData({ ...formData, password: e.target.value }); setError(''); }}
              disabled={loading} autoComplete="new-password" required
            />
            <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} disabled={loading}>
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <><span className="spinner"></span>Signing In...</> : 'Sign In'}
          </button>
        </form>

        <div className="forgot-link-wrap">
          <button className="forgot-link" onClick={() => navigate('/forgot-password')}>Forgot Password?</button>
        </div>

        <div className="auth-switch">
          Don't have an account? <span onClick={() => navigate('/signup')}>Create one</span>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <span>© 2025 Made by</span>
          <span>AjwaHub Team</span>
        </div>
      </footer>
    </div>
  );
}

export default AdminLogin;
