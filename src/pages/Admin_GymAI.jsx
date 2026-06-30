import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/AdminPanel.css';
import '../css/Admin_Product.css';
import '../css/Admin_GymAI.css';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

const menuItems = [
  { icon: '🏠', label: 'Dashboard', path: '/panel' },
  { icon: '📊', label: 'Analytics', path: '/admin-analytics' },
  { icon: '👥', label: 'Users', path: '/panel/users' },
  { icon: '🎬', label: 'Description Editor', path: '/description' },
  { icon: '🏡', label: 'Home Editor', path: '/home-editor' },
  { icon: '🛍️', label: 'Products', path: '/admin-products' },
  { icon: '❤️', label: 'Wishlists', path: '/admin-wishlist' },
  { icon: '🌟', label: 'Ratings', path: '/admin-ratings' },
  { icon: '🎁', label: 'Gift Orders', path: '/admin-gift-orders' },
  { icon: '📦', label: 'Gift Boxes', path: '/admin-gift-boxes' },
  { icon: '💳', label: 'Payments', path: '/admin-payments' },
  { icon: '🎥', label: 'GymAI Videos', path: '/admin-gymai' },
  { icon: '📦', label: 'Inventory', path: '/admin-inventory' },
];

const emptyVideo = { title: '', description: '', url: '', thumbnail: '', category: 'health' };
const categories = ['health', 'diet', 'fitness', 'dates', 'dry-fruits', 'recipes'];

function Admin_GymAI() {
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyVideo);

  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  useEffect(() => {
    const adminData = localStorage.getItem('ajwaHub_admin');
    const t = localStorage.getItem('ajwaHub_adminToken');
    if (!adminData || !t) { navigate('/login'); return; }
    setAdmin(JSON.parse(adminData));
    setToken(t);
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/gymai/videos`);
      const data = await res.json();
      setVideos(data.videos || []);
    } catch {}
    setLoading(false);
  };

  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };

  const uploadVideo = async (file) => {
    setUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API}/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
      const data = await res.json();
      if (data.path) setForm(p => ({ ...p, url: data.path }));
      else showMsg('❌ Video upload failed');
    } catch { showMsg('❌ Upload error'); }
    setUploadingVideo(false);
  };

  const uploadThumbnail = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API}/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
      const data = await res.json();
      if (data.path) setForm(p => ({ ...p, thumbnail: data.path }));
      else showMsg('❌ Upload failed');
    } catch { showMsg('❌ Upload error'); }
    setUploading(false);
  };

  const addVideo = async () => {
    if (!form.title || !form.url) return showMsg('⚠️ Title aur URL required hai');
    try {
      const res = await fetch(`${API}/gymai/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        showMsg('✅ Video added!');
        setShowForm(false);
        setForm(emptyVideo);
        fetchVideos();
      } else showMsg('❌ Failed to add');
    } catch { showMsg('❌ Server error'); }
  };

  const deleteVideo = async (id) => {
    if (!window.confirm('Delete this video?')) return;
    try {
      await fetch(`${API}/gymai/videos/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      setVideos(videos.filter(v => v._id !== id));
      showMsg('✅ Deleted!');
    } catch {}
  };

  const handleLogout = () => {
    localStorage.removeItem('ajwaHub_admin');
    localStorage.removeItem('ajwaHub_adminToken');
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-logo">
          <img src="/LOGO.jpeg" alt="logo" className="sidebar-logo-img" />
          {sidebarOpen && <span className="sidebar-logo-text">AjwaHub</span>}
        </div>
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button key={item.path} className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`} onClick={() => navigate(item.path)}>
              <span className="sidebar-icon">{item.icon}</span>
              {sidebarOpen && <span className="sidebar-label">{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="sidebar-item sidebar-logout" onClick={handleLogout}>
            <span className="sidebar-icon">🚪</span>
            {sidebarOpen && <span className="sidebar-label">Logout</span>}
          </button>
        </div>
      </aside>

      <div className="dashboard-main">
        <header className="topbar">
          <button className="topbar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>{sidebarOpen ? '◀' : '▶'}</button>
          <h1 className="topbar-title">🎥 GymAI Videos</h1>
          <div className="topbar-right">
            {admin && <span className="topbar-admin">👤 {admin.name}</span>}
          </div>
        </header>

        <div className="dashboard-content">
          {msg && <div className="ap-msg">{msg}</div>}

          <div className="ap-toolbar">
            <span className="ap-count">{videos.length} Videos</span>
            <button className="ap-save gym-ai-style-1"  onClick={() => setShowForm(!showForm)}>
              {showForm ? '✕ Cancel' : '➕ Add Video'}
            </button>
          </div>

          <div className="da-video-specs-note gym-ai-style-2" >
            <strong className="gym-ai-style-3">🎥 Recommended GymAI Video Specs:</strong>
            <ul className="gym-ai-style-4">
              <li className="gym-ai-style-5"><span className="gym-ai-style-6">Video Format:</span> MP4 (H.264)</li>
              <li className="gym-ai-style-7"><span className="gym-ai-style-8">Video Size:</span> Keep under 15MB</li>
              <li className="gym-ai-style-9"><span className="gym-ai-style-10">Thumbnail:</span> 16:9 Landscape (under 300KB)</li>
            </ul>
          </div>

          {showForm && (
            <div className="gym-ai-style-11">
              <h3 className="gym-ai-style-12">🎥 Add New Video</h3>
              <div className="gym-ai-style-13">
                <div className="gym-ai-style-14">
                  <label className="gym-ai-style-15">📝 Title *</label>
                  <input className="gym-ai-style-16"
                    value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Benefits of Ajwa Dates" />
                </div>
                <div className="gym-ai-style-17">
                  <label className="gym-ai-style-18">🏷️ Category</label>
                  <select className="gym-ai-style-19"
                    value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    {categories.map(c => <option key={c} value={c} className="gym-ai-style-20">{c}</option>)}
                  </select>
                </div>
                <div className="gym-ai-style-21">
                  <label className="gym-ai-style-22">🔗 Video URL *</label>
                  <div className="gym-ai-style-23">
                    <input className="gym-ai-style-24"
                      value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} placeholder="https://youtube.com/watch?v=... ya upload karein" />
                    <label style={{ padding: '11px 16px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#f1f5f9', fontSize: '13px', fontWeight: 600, cursor: uploadingVideo ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', opacity: uploadingVideo ? 0.6 : 1 }}>
                      {uploadingVideo ? '⏳ Uploading...' : '📤 Upload'}
                      <input type="file" accept="video/*" className="gym-ai-style-25" disabled={uploadingVideo}
                        onChange={e => e.target.files[0] && uploadVideo(e.target.files[0])} />
                    </label>
                  </div>
                </div>
                <div className="gym-ai-style-26">
                  <label className="gym-ai-style-27">🖼️ Thumbnail</label>
                  <div className="gym-ai-style-28">
                    <input className="gym-ai-style-29"
                      value={form.thumbnail} onChange={e => setForm(p => ({ ...p, thumbnail: e.target.value }))} placeholder="Paste URL ya upload karein..." />
                    <label style={{ padding: '11px 16px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#f1f5f9', fontSize: '13px', fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', opacity: uploading ? 0.6 : 1 }}>
                      {uploading ? '⏳ Uploading...' : '📤 Upload'}
                      <input type="file" accept="image/*" className="gym-ai-style-30" disabled={uploading}
                        onChange={e => e.target.files[0] && uploadThumbnail(e.target.files[0])} />
                    </label>
                  </div>
                  {form.thumbnail && <img src={form.thumbnail} alt="preview" className="gym-ai-style-31" onError={e => e.target.style.display='none'} />}
                </div>
                <div className="gym-ai-style-32">
                  <label className="gym-ai-style-33">📄 Description</label>
                  <input className="gym-ai-style-34"
                    value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Short description about the video..." />
                </div>
              </div>
              <button onClick={addVideo}
                className="gym-ai-style-35">
                💾 Save Video
              </button>
            </div>
          )}

          {loading ? <div className="panel-loading">Loading...</div> : (
            <div className="ap-grid">
              {videos.map(video => (
                <div key={video._id} className="ap-card">
                  <div className="ap-view">
                    {video.thumbnail && <img src={video.thumbnail} alt={video.title} className="ap-img" onError={e => e.target.style.display='none'} />}
                    <h4>{video.title}</h4>
                    <div className="ap-meta">
                      <span className="ap-discount">{video.category}</span>
                    </div>
                    <p className="gym-ai-style-36">{video.description}</p>
                    <a href={video.url} target="_blank" rel="noopener noreferrer" className="gym-ai-style-37">
                      🔗 {video.url}
                    </a>
                    <button className="ap-cancel gym-ai-style-38"  onClick={() => deleteVideo(video._id)}>🗑️ Delete</button>
                  </div>
                </div>
              ))}
              {videos.length === 0 && (
                <div className="gym-ai-style-39">
                  Koi video nahi. ➕ Add Video se banao.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin_GymAI;

