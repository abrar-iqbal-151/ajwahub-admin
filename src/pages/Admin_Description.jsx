import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import '../css/Admin_Description.css';
import '../css/AdminPanel.css';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

const menuItems = [
  { icon: '🏠', label: 'Dashboard', path: '/panel' },
  { icon: '📊', label: 'Analytics', path: '/admin-analytics' },
  { icon: '👥', label: 'Users', path: '/panel/users' },
  { icon: '🎬', label: 'Description Editor', path: '/description' },
  { icon: '🏡', label: 'Home Editor', path: '/home-editor' },
  { icon: '🛍️', label: 'Products', path: '/admin-products' },
  { icon: '👑', label: 'Premium', path: '/admin-premium' },
  { icon: '❤️', label: 'Wishlists', path: '/admin-wishlist' },
  { icon: '🌟', label: 'Ratings', path: '/admin-ratings' },
  { icon: '🎁', label: 'Gift Orders', path: '/admin-gift-orders' },
  { icon: '📦', label: 'Gift Boxes', path: '/admin-gift-boxes' },
  { icon: '💳', label: 'Payments', path: '/admin-payments' },
  { icon: '🎥', label: 'GymAI Videos', path: '/admin-gymai' },
  { icon: '📦', label: 'Inventory', path: '/admin-inventory' },
];

function Description_Admin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [token, setToken] = useState('');
  const [admin, setAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState('heroes');

  // Image Cropping States
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [cropActive, setCropActive] = useState(false);

  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [onCropSave, setOnCropSave] = useState(null);
  const imgRef = useRef(null);

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    const initialCrop = {
      unit: '%',
      width: 90,
      height: 90,
      x: 5,
      y: 5
    };
    setCrop(initialCrop);
  };

  const executeCrop = async () => {
    if (!cropImageSrc || !imgRef.current) return;
    try {
      const image = imgRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rc = completedCrop || crop || { unit: '%', width: 100, height: 100, x: 0, y: 0 };

      let cropX, cropY, cropW, cropH;

      if (rc.unit === '%') {
        cropX = (rc.x / 100) * image.naturalWidth;
        cropY = (rc.y / 100) * image.naturalHeight;
        cropW = (rc.width / 100) * image.naturalWidth;
        cropH = (rc.height / 100) * image.naturalHeight;
      } else {
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        cropX = rc.x * scaleX;
        cropY = rc.y * scaleY;
        cropW = rc.width * scaleX;
        cropH = rc.height * scaleY;
      }

      if (!cropW || !cropH) {
        cropX = 0;
        cropY = 0;
        cropW = image.naturalWidth;
        cropH = image.naturalHeight;
      }

      canvas.width = Math.round(cropW);
      canvas.height = Math.round(cropH);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(
        image,
        Math.round(cropX),
        Math.round(cropY),
        Math.round(cropW),
        Math.round(cropH),
        0,
        0,
        canvas.width,
        canvas.height
      );

      const croppedBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.98));
      if (croppedBlob && onCropSave) {
        await onCropSave(croppedBlob);
      }
      setCropActive(false);
      setCropImageSrc(null);
      setCompletedCrop(null);
    } catch (e) {
      console.error(e);
      showMsg("❌ Crop error");
    }
  };



  const handleLogout = () => {
    localStorage.removeItem('ajwaHub_admin');
    localStorage.removeItem('ajwaHub_adminToken');
    navigate('/login');
  };
  const [heroes, setHeroes] = useState([]);
  const [editHero, setEditHero] = useState(null);
  const [feature, setFeature] = useState(null);
  const [editFeature, setEditFeature] = useState(null);
  const [deliveryMap, setDeliveryMap] = useState(null);
  const [editDeliveryMap, setEditDeliveryMap] = useState(null);
  const [about, setAbout] = useState(null);
  const [editAbout, setEditAbout] = useState(null);
  const [paymentIcons, setPaymentIcons] = useState([]);
  const [products, setProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [aiSection, setAiSection] = useState(null);
  const [editAiSection, setEditAiSection] = useState(null);
  const [newProduct, setNewProduct] = useState({ name: '', arabicName: '', price: 4300, weight: '1kg', rating: 4.5, stock: true, image: '', detailImage: '', description: '', discount: '', category: 'dates', storageNote: '', weights: [] });

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [editReview, setEditReview] = useState(null);
  const [newReview, setNewReview] = useState({ name: '', text: '', rating: 5 });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const adminData = localStorage.getItem('ajwaHub_admin');
    const t = localStorage.getItem('ajwaHub_adminToken');
    if (!adminData || !t) { navigate('/login'); return; }
    setAdmin(JSON.parse(adminData));
    setToken(t);
    fetchAll(t);
  }, []);

  const initializeData = async () => {
    const res = await fetch(`${API}/content/initialize`, {
      method: 'POST', headers: authHeaders
    });
    const data = await res.json();
    if (res.ok) { showMsg(data.message === 'already exists' ? '⚠️ Data already exists!' : '✅ Data initialized!'); fetchAll(token); }
  };

  const fetchAll = async (t) => {
    setLoading(true);
    const [h, p, r, f, d, a, pi, ai] = await Promise.all([
      fetch(`${API}/content/heroes`).then(r => r.json()),
      fetch(`${API}/content/products`).then(r => r.json()),
      fetch(`${API}/content/reviews`).then(r => r.json()),
      fetch(`${API}/content/feature`).then(r => r.json()),
      fetch(`${API}/content/delivery-map`).then(r => r.json()),
      fetch(`${API}/content/about`).then(r => r.json()),
      fetch(`${API}/content/payment-icons`).then(r => r.json()),
      fetch(`${API}/content/ai-section`).then(r => r.json()),
    ]);

    setHeroes(h.heroes || []);
    setProducts(p.products || []);
    setReviews(r.reviews || []);
    setFeature(f.feature || null);
    setDeliveryMap(d.deliveryMap || null);
    setAbout(a.about || null);
    setPaymentIcons(pi.icons || []);
    setAiSection(ai.aiSection || null);
    setLoading(false);

  };

  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };
  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const saveHero = async (hero) => {
    const res = await fetch(`${API}/content/hero/${hero.key}`, {
      method: 'PUT', headers: authHeaders,
      body: JSON.stringify({ title: hero.title, text: hero.text, video: hero.video })
    });
    if (res.ok) { setHeroes(heroes.map(h => h.key === hero.key ? hero : h)); setEditHero(null); showMsg('✅ Hero updated!'); }
  };

  const saveFeature = async () => {
    const res = await fetch(`${API}/content/feature`, {
      method: 'PUT', headers: authHeaders,
      body: JSON.stringify({ title: editFeature.title, description: editFeature.description, images: editFeature.images, features: editFeature.features })
    });
    if (res.ok) { setFeature(editFeature); setEditFeature(null); showMsg('✅ Feature updated!'); }
  };

  const addFeatureItem = () => {
    setEditFeature({ ...editFeature, features: [...editFeature.features, { icon: '✅', text: '' }] });
  };

  const removeFeatureItem = (index) => {
    setEditFeature({ ...editFeature, features: editFeature.features.filter((_, i) => i !== index) });
  };

  const updateFeatureItem = (index, field, value) => {
    const updated = [...editFeature.features];
    updated[index][field] = value;
    setEditFeature({ ...editFeature, features: updated });
  };

  const addFeatureImage = () => {
    setEditFeature({ ...editFeature, images: [...(editFeature.images || []), ''] });
  };

  const removeFeatureImage = (index) => {
    setEditFeature({ ...editFeature, images: editFeature.images.filter((_, i) => i !== index) });
  };

  const updateFeatureImage = (index, value) => {
    const updated = [...editFeature.images];
    updated[index] = value;
    setEditFeature({ ...editFeature, images: updated });
  };

  const saveProduct = async (product) => {
    const res = await fetch(`${API}/content/product/${product.id}`, {
      method: 'PUT', headers: authHeaders,
      body: JSON.stringify({ 
        name: product.name, 
        arabicName: product.arabicName,
        price: product.price || 4300, 
        discount: product.discount, 
        stock: product.stock, 
        description: product.description, 
        rating: product.rating, 
        image: product.image,
        detailImage: product.detailImage,
        storageNote: product.storageNote,
        weights: product.weights
      })
    });
    if (res.ok) { setProducts(products.map(p => p.id === product.id ? product : p)); setEditProduct(null); showMsg('✅ Product updated!'); }
  };

  const addProduct = async () => {
    if (!newProduct.name) return showMsg('⚠️ Name required hai');
    const res = await fetch(`${API}/content/product`, {
      method: 'POST', headers: authHeaders,
      body: JSON.stringify({ ...newProduct, price: 4300 })
    });
    const data = await res.json();
    if (res.ok) { setProducts([...products, data.product]); setNewProduct({ name: '', arabicName: '', price: 4300, weight: '1kg', rating: 4.5, stock: true, image: '', detailImage: '', description: '', discount: '', category: 'dates', storageNote: '', weights: [] }); setShowAddProduct(false); showMsg('✅ Product added!'); }
    else showMsg('❌ Failed to add');
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    const res = await fetch(`${API}/content/product/${id}`, { method: 'DELETE', headers: authHeaders });
    if (res.ok) { setProducts(products.filter(p => p.id !== id)); showMsg('🗑️ Deleted!'); }
  };

  const saveReview = async (review) => {
    const res = await fetch(`${API}/content/review/${review._id}`, {
      method: 'PUT', headers: authHeaders,
      body: JSON.stringify({ name: review.name, text: review.text, rating: review.rating })
    });
    if (res.ok) { setReviews(reviews.map(r => r._id === review._id ? review : r)); setEditReview(null); showMsg('✅ Review updated!'); }
  };

  const addReview = async () => {
    if (!newReview.name || !newReview.text) return showMsg('⚠️ Fill all fields');
    const res = await fetch(`${API}/content/review`, {
      method: 'POST', headers: authHeaders,
      body: JSON.stringify(newReview)
    });
    const data = await res.json();
    if (res.ok) { setReviews([...reviews, data.review]); setNewReview({ name: '', text: '', rating: 5 }); showMsg('✅ Review added!'); }
  };

  const deleteReview = async (id) => {
    const res = await fetch(`${API}/content/review/${id}`, { method: 'DELETE', headers: authHeaders });
    if (res.ok) { setReviews(reviews.filter(r => r._id !== id)); showMsg('🗑️ Review deleted!'); }
  };

  const savePaymentIcons = async (icons) => {
    const res = await fetch(`${API}/content/payment-icons`, {
      method: 'PUT', headers: authHeaders,
      body: JSON.stringify({ icons })
    });
    if (res.ok) { setPaymentIcons(icons); showMsg('✅ Payment icons updated!'); }
  };

  const saveAbout = async () => {
    const res = await fetch(`${API}/content/about`, {
      method: 'PUT', headers: authHeaders,
      body: JSON.stringify({ title: editAbout.title, paragraphs: editAbout.paragraphs, images: editAbout.images })
    });
    if (res.ok) { setAbout(editAbout); setEditAbout(null); showMsg('✅ About section updated!'); }
  };

  const saveDeliveryMap = async () => {
    const res = await fetch(`${API}/content/delivery-map`, {
      method: 'PUT', headers: authHeaders,
      body: JSON.stringify({ title: editDeliveryMap.title, mapImage: editDeliveryMap.mapImage })
    });
    if (res.ok) { setDeliveryMap(editDeliveryMap); setEditDeliveryMap(null); showMsg('✅ Delivery map updated!'); }
  };

  const saveAiSection = async () => {
    const res = await fetch(`${API}/content/ai-section`, {
      method: 'PUT', headers: authHeaders,
      body: JSON.stringify(editAiSection)
    });
    if (res.ok) { setAiSection(editAiSection); setEditAiSection(null); showMsg('✅ AI section updated!'); }
  };

  const updateAiFeature = (index, field, value) => {
    const updated = [...editAiSection.features];
    updated[index][field] = value;
    setEditAiSection({ ...editAiSection, features: updated });
  };


  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <span key={i} style={{ color: i < Math.floor(rating) ? '#fbbf24' : '#555', fontSize: '18px' }}>★</span>
    ));

  return (
    <div className="dashboard">

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-logo">
          <img src="/LOGO.jpeg" alt="logo" className="sidebar-logo-img" />
          {sidebarOpen && <span className="sidebar-logo-text">AjwaHub</span>}
        </div>
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.path}
              className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
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

      {/* MAIN */}
      <div className="dashboard-main">
        <header className="topbar">
          <button className="topbar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
          <h1 className="topbar-title">🎬 Description Editor</h1>
          <div className="topbar-right">
            {admin && <span className="topbar-admin">👤 {admin.name}</span>}
          </div>
        </header>

        <div className="dashboard-content">
          <div className="da-body">
            {msg && <div className="da-msg">{msg}</div>}

        {heroes.length === 0 && products.length === 0 && !loading && (
          <div className="da-init-box">
            <p>Database khali hai. Pehli baar data initialize karo.</p>
            <button className="da-save-btn" onClick={initializeData}>🚀 Initialize Data</button>
          </div>
        )}

        <div className="da-tabs">
          <button className={`da-tab ${activeTab === 'heroes' ? 'active' : ''}`} onClick={() => setActiveTab('heroes')}>🎬 Hero Videos</button>
          <button className={`da-tab ${activeTab === 'feature' ? 'active' : ''}`} onClick={() => setActiveTab('feature')}>✨ Feature Section</button>
          <button className={`da-tab ${activeTab === 'ai' ? 'active' : ''}`} onClick={() => setActiveTab('ai')} data-tab="ai">🤖 AI Section</button>
          <button className={`da-tab ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>🛍️ Products</button>


          <button className={`da-tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>⭐ Reviews</button>
          <button className={`da-tab ${activeTab === 'deliveryMap' ? 'active' : ''}`} onClick={() => setActiveTab('deliveryMap')}>🗺️ Delivery Map</button>
          <button className={`da-tab ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>🌱 About Section</button>
          <button className={`da-tab ${activeTab === 'payment' ? 'active' : ''}`} onClick={() => setActiveTab('payment')}>💳 Payment Icons</button>
        </div>

        {loading && <div className="da-loading">Loading...</div>}

        {activeTab === 'heroes' && !loading && (
          <div className="da-section">
            <h2 className="da-section-title">🎬 Hero Video Sections</h2>
            
            <div className="da-video-specs-note">
              <strong>💡 Recommended Video Specs:</strong>
              <ul>
                <li><span>Resolution:</span> 1920x1080 (16:9 Aspect Ratio)</li>
                <li><span>Frame Rate:</span> 24fps or 30fps (for smooth cinematic feel)</li>
                <li><span>Format:</span> MP4 (H.264)</li>
                <li><span>Size:</span> Keep below 10MB for fast loading</li>
              </ul>
            </div>

            <div className="da-cards">
              {heroes.map(hero => (
                <div key={hero.key} className="da-card">
                  {editHero?.key === hero.key ? (
                    <div className="da-edit-form">
                      <label>Title</label>
                      <input value={editHero.title} onChange={e => setEditHero({ ...editHero, title: e.target.value })} />
                      <label>Text</label>
                      <textarea rows={4} value={editHero.text} onChange={e => setEditHero({ ...editHero, text: e.target.value })} />
                      <label>Video Path / Upload</label>
                      <input value={editHero.video} onChange={e => setEditHero({ ...editHero, video: e.target.value })} placeholder="Enter video URL or upload below" />
                      
                      <label className="da-upload-label" style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        📤 Upload Video
                        <input type="file" accept="video/*" style={{ display: 'none' }}
                          onChange={async e => {
                            const file = e.target.files[0]; if (!file) return;
                            showMsg("⌛ Uploading video, please wait...");
                            const formData = new FormData(); formData.append('file', file);
                            const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
                            const data = await res.json();
                            if (res.ok) {
                              setEditHero({ ...editHero, video: data.url || data.path });
                              showMsg("✅ Video uploaded successfully!");
                            } else {
                              showMsg("❌ Video upload failed");
                            }
                          }}
                        />
                      </label>
                      {editHero.video && (
                        <div className="da-video-preview">
                          <p className="da-preview-label">Preview:</p>
                          <video key={editHero.video} autoPlay muted loop playsInline className="da-video">
                            <source src={editHero.video} type="video/mp4" />
                          </video>
                        </div>
                      )}
                      <div className="da-form-btns">
                        <button className="da-save-btn" onClick={() => saveHero(editHero)}>💾 Save</button>
                        <button className="da-cancel-btn" onClick={() => setEditHero(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="da-card-view">
                      {hero.video && (
                        <video autoPlay muted loop playsInline className="da-video">
                          <source src={hero.video} type="video/mp4" />
                        </video>
                      )}
                      <div className="da-card-info">
                        <div className="da-card-badge">{hero.key === 'hero1' ? 'Hero 1 — Left' : 'Hero 2 — Right'}</div>
                        <h3>{hero.title}</h3>
                        <p>{hero.text}</p>
                        <span className="da-video-path">🎬 {hero.video}</span>
                      </div>
                      <div className="da-edit-btn-wrap">
                        <button className="da-edit-btn" onClick={() => setEditHero({ ...hero })}>✏️ Edit</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'feature' && !loading && feature && (
          <div className="da-section">
            <h2 className="da-section-title">✨ Feature Section (Why Choose AjwaHub)</h2>

            <div className="da-video-specs-note" style={{ borderColor: '#fb923c', background: '#fdf7f2', borderTop: '1px solid rgba(251,146,60,0.2)', borderRight: '1px solid rgba(251,146,60,0.2)', borderBottom: '1px solid rgba(251,146,60,0.2)' }}>
              <strong style={{ color: '#c2410c' }}>📸 Recommended Image Specs:</strong>
              <ul>
                <li><span>Resolution:</span> 800x800 (Square 1:1 Ratio)</li>
                <li><span>Quality:</span> High Resolution (clear and sharp)</li>
                <li><span>Format:</span> PNG or WebP (for best quality)</li>
                <li><span>Size:</span> Under 500KB for each picture</li>
              </ul>
            </div>

            <div className="da-cards">
              <div className="da-card">
                {editFeature ? (
                  <div className="da-edit-form">
                    <label>Title</label>
                    <input value={editFeature.title} onChange={e => setEditFeature({ ...editFeature, title: e.target.value })} />
                    <label>Description</label>
                    <textarea rows={4} value={editFeature.description} onChange={e => setEditFeature({ ...editFeature, description: e.target.value })} />
                    
                    <label>Product Images (P1, P2, P3, P4)</label>
                    
                    {(editFeature.images || []).map((img, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                        <label className="da-upload-label" style={{ flex: 1, margin: 0 }}>
                          📁 {img ? img.split('/').pop() : 'Choose Image'}
                          <input type="file" accept="image/*" style={{ display: 'none' }}
                            onChange={async e => {
                              const file = e.target.files[0]; if (!file) return;
                              showMsg("⌛ Uploading original image...");
                              const formData = new FormData(); formData.append('file', file);
                              const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
                              const data = await res.json();
                              if (res.ok) {
                                updateFeatureImage(i, data.url || data.path);
                                showMsg("✅ Image uploaded! Click '📐 Adjust' to crop.");
                              } else {
                                showMsg("❌ Upload failed");
                              }
                            }}
                          />
                        </label>
                        {img && (
                          <button 
                            type="button"
                            className="da-save-btn" 
                            style={{ width: 'auto', padding: '6px 12px', background: '#3b82f6', margin: 0 }}
                            onClick={() => {
                              setCropImageSrc(img);
                              setOnCropSave(() => async (croppedBlob) => {
                                const croppedFile = new File([croppedBlob], 'cropped.jpeg', { type: 'image/jpeg' });
                                const formData = new FormData(); formData.append('file', croppedFile);
                                const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
                                const data = await res.json();
                                if (res.ok) updateFeatureImage(i, data.url || data.path);
                              });
                              setCropActive(true);
                            }}
                          >
                            📐 Adjust
                          </button>
                        )}
                        {img && <img src={img} alt={`P${i+1}`} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} onError={e => e.target.style.display='none'} />}
                        <button className="da-delete-btn" style={{ padding: '6px 12px' }} onClick={() => removeFeatureImage(i)}>🗑️</button>
                      </div>
                    ))}
                    <button className="da-save-btn" style={{ marginTop: '8px', width: 'auto', padding: '6px 16px' }} onClick={addFeatureImage}>➕ Add Image</button>
                    
                    <label style={{ marginTop: '16px' }}>Features</label>
                    {editFeature.features.map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input style={{ width: '60px' }} placeholder="Icon" value={item.icon} onChange={e => updateFeatureItem(i, 'icon', e.target.value)} />
                        <input style={{ flex: 1 }} placeholder="Feature text" value={item.text} onChange={e => updateFeatureItem(i, 'text', e.target.value)} />
                        <button className="da-delete-btn" style={{ padding: '6px 12px' }} onClick={() => removeFeatureItem(i)}>🗑️</button>
                      </div>
                    ))}
                    <button className="da-save-btn" style={{ marginTop: '8px', width: 'auto', padding: '6px 16px' }} onClick={addFeatureItem}>➕ Add Feature</button>
                    <div className="da-form-btns" style={{ marginTop: '16px' }}>
                      <button className="da-save-btn" onClick={saveFeature}>💾 Save</button>
                      <button className="da-cancel-btn" onClick={() => setEditFeature(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="da-card-view">
                    <div className="da-card-info">
                      <div className="da-card-badge">Why Choose AjwaHub</div>
                      <h3>{feature.title}</h3>
                      <p style={{ color: '#374151', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>{feature.description}</p>
                      
                      <h4 style={{ color: '#fb923c', fontSize: '13px', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px' }}>🖼️ Product Images (P1 - P4):</h4>
                      <div className="da-feature-img-grid">
                        {(feature.images || []).map((img, i) => (
                          <div key={i} className="da-feature-img-box">
                            <img src={img} alt={`P${i+1}`} onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/1f2937/9ca3af?text=P'+(i+1); }} />
                            <span>P{i+1}</span>
                          </div>
                        ))}
                      </div>

                      <h4 style={{ color: '#fb923c', fontSize: '13px', textTransform: 'uppercase', marginTop: '20px', marginBottom: '12px', letterSpacing: '0.5px' }}>✅ Key Features:</h4>
                      <div className="da-feature-list">
                        {(feature.features || []).map((f, i) => (
                          <div key={i} className="da-feature-item-view">
                            <span className="da-feature-icon">{f.icon}</span>
                            <span className="da-feature-text">{f.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="da-edit-btn-wrap">
                      <button className="da-edit-btn" onClick={() => setEditFeature({ ...feature })}>✏️ Edit Section</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
 
        {activeTab === 'ai' && !loading && aiSection && (
          <div className="da-section">
            <h2 className="da-section-title">🤖 AI Powered Wellness Section</h2>
 
            <div className="da-video-specs-note" style={{ borderColor: '#8b5cf6', background: '#f5f3ff', borderTop: '1px solid rgba(139, 92, 246, 0.2)', borderRight: '1px solid rgba(139, 92, 246, 0.2)', borderBottom: '1px solid rgba(139, 92, 246, 0.2)' }}>
              <strong style={{ color: '#6d28d9' }}>🎬 AI Video Recommendation:</strong>
              <ul>
                <li><span>Resolution:</span> 1920x1080 (16:9 Landscape)</li>
                <li><span>Style:</span> High-tech / Futuristic / Health themed</li>
                <li><span>Format:</span> MP4</li>
              </ul>
            </div>
 
            <div className="da-cards">
              <div className="da-card">
                {editAiSection ? (
                  <div className="da-edit-form">
                    <label>Badge Text</label>
                    <input value={editAiSection.badge} onChange={e => setEditAiSection({ ...editAiSection, badge: e.target.value })} />
                    <label>Main Title</label>
                    <input value={editAiSection.title} onChange={e => setEditAiSection({ ...editAiSection, title: e.target.value })} />
                    <label>Description</label>
                    <textarea rows={4} value={editAiSection.description} onChange={e => setEditAiSection({ ...editAiSection, description: e.target.value })} />
                    
                    <label>Video URL / Path</label>
                    <input value={editAiSection.video} onChange={e => setEditAiSection({ ...editAiSection, video: e.target.value })} />
                    
                    <label className="da-upload-label">
                      📤 Upload AI Video
                      <input type="file" accept="video/*" style={{ display: 'none' }}
                        onChange={async e => {
                          const file = e.target.files[0]; if (!file) return;
                          const formData = new FormData(); formData.append('file', file);
                          const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
                          const data = await res.json();
                          if (res.ok) setEditAiSection({ ...editAiSection, video: data.url || data.path });
                        }}
                      />
                    </label>
 
                    <label style={{ marginTop: '20px' }}>AI Features (Icons & Text)</label>
                    {editAiSection.features.map((f, i) => (
                      <div key={i} className="da-ai-feature-edit" style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px', marginBottom: '15px' }}>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                          <input style={{ width: '60px' }} placeholder="Icon" value={f.icon} onChange={e => updateAiFeature(i, 'icon', e.target.value)} />
                          <input style={{ flex: 1 }} placeholder="Feature Title" value={f.title} onChange={e => updateAiFeature(i, 'title', e.target.value)} />
                        </div>
                        <textarea rows={2} placeholder="Feature Description" value={f.text} onChange={e => updateAiFeature(i, 'text', e.target.value)} />
                      </div>
                    ))}
 
                    <div className="da-form-btns">
                      <button className="da-save-btn da-ai-save-btn" onClick={saveAiSection}>💾 Save AI Section</button>
                      <button className="da-cancel-btn" onClick={() => setEditAiSection(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="da-card-view">
                    <div className="da-card-info">
                      <div className="da-card-badge" style={{ background: '#f5f3ff', color: '#6d28d9', borderColor: '#ddd6fe' }}>{aiSection.badge}</div>
                      <h3 style={{ fontSize: '24px', margin: '10px 0', color: '#000000' }}>{aiSection.title}</h3>
                      <p style={{ color: '#4b5563', fontSize: '15px', lineHeight: '1.7', marginBottom: '25px' }}>{aiSection.description}</p>
                      
                      <div className="da-ai-video-container">
                        <div className="da-ai-video-overlay-badge">Live Preview</div>
                        <video key={aiSection.video} autoPlay muted loop playsInline>
                          <source src={aiSection.video} type="video/mp4" />
                        </video>
                      </div>
 
                      <div className="da-ai-features-preview">
                        {aiSection.features.map((f, i) => (
                          <div key={i} className="da-ai-feature-preview-card">
                            <span className="da-ai-preview-icon">{f.icon}</span>
                            <h4 style={{ color: '#111827', fontSize: '15px', fontWeight: '700', marginBottom: '6px' }}>{f.title}</h4>
                            <p style={{ color: '#4b5563', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>{f.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="da-edit-btn-wrap" style={{ marginTop: '25px' }}>
                      <button className="da-edit-btn" style={{ borderColor: 'rgba(139, 92, 246, 0.3)', color: '#6d28d9', background: 'rgba(139, 92, 246, 0.05)' }} onClick={() => setEditAiSection({ ...aiSection })}>✏️ Edit AI Section</button>
                    </div>
                  </div>
                )}
 
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && !loading && (
          <div className="da-section">
            <h2 className="da-section-title">🛍️ Premium Collection Products</h2>

            <div className="da-video-specs-note" style={{ 
              borderColor: '#c5a059', 
              background: '#ffffff', 
              margin: '15px 0', 
              width: '100%', 
              padding: '16px', 
              borderRadius: '16px', 
              border: '1px solid rgba(197, 160, 89, 0.3)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>📸</span>
                <strong style={{ color: '#1a1a1a', fontSize: '14px', letterSpacing: '0.5px' }}>RECOMMENDED IMAGE SPECIFICATIONS</strong>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                <div style={{ background: '#fdfaf3', padding: '10px', borderRadius: '10px', border: '1px solid rgba(197, 160, 89, 0.1)' }}>
                  <p style={{ color: '#c5a059', fontSize: '11px', fontWeight: '800', marginBottom: '4px' }}>MAIN CATALOG IMAGE</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '12px', color: '#4b5563' }}>
                    <li>• Resolution: 1200 x 1200</li>
                    <li>• Format: WebP / JPG</li>
                  </ul>
                </div>
                <div style={{ background: '#fdfaf3', padding: '10px', borderRadius: '10px', border: '1px solid rgba(197, 160, 89, 0.1)' }}>
                  <p style={{ color: '#c5a059', fontSize: '11px', fontWeight: '800', marginBottom: '4px' }}>DETAIL VIEW IMAGE</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '12px', color: '#4b5563' }}>
                    <li>• Resolution: 1200 x 1200</li>
                    <li>• Style: Premium Lifestyle</li>
                  </ul>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="da-section-title" style={{ margin: 0 }}>🛍️ Products ({products.length})</h2>
              <button className="da-save-btn" style={{ width: 'auto', padding: '8px 18px' }} onClick={() => setShowAddProduct(!showAddProduct)}>
                {showAddProduct ? '✕ Cancel' : '➕ Add Product'}
              </button>
            </div>

            {showAddProduct && (
              <div className="da-add-product" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #c5a059', padding: '30px', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                <h3 className="da-section-title" style={{ fontSize: '1.2rem', marginBottom: '25px' }}>➕ Add New Boutique Product</h3>
                <div className="da-product-edit-flex">
                  <div className="da-edit-left">
                    <div className="da-image-preview-box">
                      {newProduct.image ? (
                        <img src={newProduct.image} alt="preview" />
                      ) : (
                        <div className="da-no-image">
                          <span>🖼️</span>
                          <p>Catalog Image</p>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px', marginBottom: '20px', alignItems: 'center' }}>
                      <label className="da-upload-label" style={{ flex: 1, margin: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                        📁 {newProduct.image ? 'Change Catalog Image' : 'Choose Catalog Image'}
                        <input type="file" accept="image/*" style={{ display: 'none' }}
                          onChange={async e => {
                            const file = e.target.files[0]; if (!file) return;
                            showMsg("⌛ Uploading catalog image...");
                            const formData = new FormData(); formData.append('file', file);
                            const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
                            const data = await res.json();
                            if (res.ok) {
                              setNewProduct({ ...newProduct, image: data.url || data.path });
                              showMsg("✅ Catalog image uploaded!");
                            } else {
                              showMsg("❌ Upload failed");
                            }
                          }}
                        />
                      </label>
                      {newProduct.image && (
                        <button 
                          type="button"
                          className="da-save-btn" 
                          style={{ width: 'auto', padding: '10px 16px', background: '#3b82f6', margin: 0 }}
                          onClick={() => {
                            setCropImageSrc(newProduct.image);
                            setOnCropSave(() => async (croppedBlob) => {
                              const croppedFile = new File([croppedBlob], 'cropped.jpeg', { type: 'image/jpeg' });
                              const formData = new FormData(); formData.append('file', croppedFile);
                              const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
                              const data = await res.json();
                              if (res.ok) setNewProduct({ ...newProduct, image: data.url || data.path });
                            });
                            setCropActive(true);
                          }}
                        >
                          📐 Adjust
                        </button>
                      )}
                    </div>

                    <div className="da-image-preview-box">
                      {newProduct.detailImage ? (
                        <img src={newProduct.detailImage} alt="preview" />
                      ) : (
                        <div className="da-no-image">
                          <span>🖼️</span>
                          <p>Detail Image</p>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
                      <label className="da-upload-label" style={{ flex: 1, margin: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                        📁 {newProduct.detailImage ? 'Change Detail Image' : 'Choose Detail Image'}
                        <input type="file" accept="image/*" style={{ display: 'none' }}
                          onChange={async e => {
                            const file = e.target.files[0]; if (!file) return;
                            showMsg("⌛ Uploading detail image...");
                            const formData = new FormData(); formData.append('file', file);
                            const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
                            const data = await res.json();
                            if (res.ok) {
                              setNewProduct({ ...newProduct, detailImage: data.url || data.path });
                              showMsg("✅ Detail image uploaded!");
                            } else {
                              showMsg("❌ Upload failed");
                            }
                          }}
                        />
                      </label>
                      {newProduct.detailImage && (
                        <button 
                          type="button"
                          className="da-save-btn" 
                          style={{ width: 'auto', padding: '10px 16px', background: '#3b82f6', margin: 0 }}
                          onClick={() => {
                            setCropImageSrc(newProduct.detailImage);
                            setOnCropSave(() => async (croppedBlob) => {
                              const croppedFile = new File([croppedBlob], 'cropped.jpeg', { type: 'image/jpeg' });
                              const formData = new FormData(); formData.append('file', croppedFile);
                              const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
                              const data = await res.json();
                              if (res.ok) setNewProduct({ ...newProduct, detailImage: data.url || data.path });
                            });
                            setCropActive(true);
                          }}
                        >
                          📐 Adjust
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="da-edit-right">
                    <label>Name</label>
                    <input placeholder="Product name" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
                  
                    <label>Arabic Name</label>
                    <input placeholder="عجوة بني" style={{ textAlign: 'right', fontSize: '1.2rem' }} value={newProduct.arabicName} onChange={e => setNewProduct({ ...newProduct, arabicName: e.target.value })} />

                    <label>Storage Note</label>
                    <textarea rows={3} placeholder="Storage advice..." value={newProduct.storageNote} onChange={e => setNewProduct({ ...newProduct, storageNote: e.target.value })} />

                    <label>Weights & Savings</label>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      <button type="button" style={{ background: '#c5a059', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setNewProduct({ ...newProduct, weights: [...(newProduct.weights || []), { label: '500g Mini Box', savings: '' }] })}>+ 500g Mini Box</button>
                      <button type="button" style={{ background: '#c5a059', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setNewProduct({ ...newProduct, weights: [...(newProduct.weights || []), { label: '1kg Special Box', savings: '' }] })}>+ 1kg Special Box</button>
                      <button type="button" style={{ background: '#c5a059', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setNewProduct({ ...newProduct, weights: [...(newProduct.weights || []), { label: '2kg Briefcase Box', savings: '(Save Rs 500)' }] })}>+ 2kg Briefcase Box</button>
                      <button type="button" style={{ background: '#c5a059', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setNewProduct({ ...newProduct, weights: [...(newProduct.weights || []), { label: '5kg Family Carton', savings: '(Save Rs 1500)' }] })}>+ 5kg Family Carton</button>
                    </div>
                    <div className="da-weights-editor">
                      {(newProduct.weights || []).map((w, idx) => (
                        <div key={idx} className="da-weight-row">
                          <input placeholder="Label (e.g. 1kg Box)" value={w.label} onChange={e => {
                            const ws = [...newProduct.weights]; ws[idx].label = e.target.value;
                            setNewProduct({ ...newProduct, weights: ws });
                          }} />
                          <input placeholder="Savings (e.g. Save Rs 500)" value={w.savings} onChange={e => {
                            const ws = [...newProduct.weights]; ws[idx].savings = e.target.value;
                            setNewProduct({ ...newProduct, weights: ws });
                          }} />
                          <button onClick={() => setNewProduct({ ...newProduct, weights: newProduct.weights.filter((_, i) => i !== idx) })}>✕</button>
                        </div>
                      ))}
                      <button className="da-add-btn" onClick={() => setNewProduct({ ...newProduct, weights: [...(newProduct.weights || []), { label: '', savings: '' }] })}>+ Add Custom Option</button>
                    </div>

                    <label>Rating (1-5)</label>
                    <input type="number" min="1" max="5" step="0.1" value={newProduct.rating} onChange={e => setNewProduct({ ...newProduct, rating: Number(e.target.value) })} />
                    
                    <label>Discount Tag</label>
                    <input placeholder="e.g. 50% OFF" value={newProduct.discount} onChange={e => setNewProduct({ ...newProduct, discount: e.target.value })} />
                    
                    <label>Description</label>
                    <textarea rows={2} placeholder="Product description" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
                    
                    <label className="da-stock-label">
                      <input type="checkbox" checked={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.checked })} /> In Stock
                    </label>
                    
                    <button className="da-save-btn" style={{ marginTop: '20px' }} onClick={addProduct}>➕ Add Product</button>
                  </div>
                </div>
              </div>
            )}

            <div className="da-products-grid">
              {products.map(product => (
                <div key={product.id} className={`da-product-card ${editProduct?.id === product.id ? 'editing' : ''}`}>
                  {editProduct?.id === product.id ? (
                    <div className="da-edit-form">
                      <div className="da-product-edit-flex">
                        <div className="da-edit-left">
                          <div className="da-image-preview-box">
                            <img src={editProduct.image} alt="preview" />
                          </div>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', marginBottom: '20px', alignItems: 'center' }}>
                            <label className="da-upload-label" style={{ flex: 1, margin: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                              📁 {editProduct.image ? 'Change Catalog Image' : 'Choose Catalog Image'}
                              <input type="file" accept="image/*" style={{ display: 'none' }}
                                onChange={async e => {
                                  const file = e.target.files[0]; if (!file) return;
                                  showMsg("⌛ Uploading catalog image...");
                                  const formData = new FormData(); formData.append('file', file);
                                  const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
                                  const data = await res.json();
                                  if (res.ok) {
                                    setEditProduct({ ...editProduct, image: data.url || data.path });
                                    showMsg("✅ Catalog image uploaded!");
                                  } else {
                                    showMsg("❌ Upload failed");
                                  }
                                }}
                              />
                            </label>
                            {editProduct.image && (
                              <button 
                                type="button"
                                className="da-save-btn" 
                                style={{ width: 'auto', padding: '10px 16px', background: '#3b82f6', margin: 0 }}
                                onClick={() => {
                                  setCropImageSrc(editProduct.image);
                                  setOnCropSave(() => async (croppedBlob) => {
                                    const croppedFile = new File([croppedBlob], 'cropped.jpeg', { type: 'image/jpeg' });
                                    const formData = new FormData(); formData.append('file', croppedFile);
                                    const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
                                    const data = await res.json();
                                    if (res.ok) setEditProduct({ ...editProduct, image: data.url || data.path });
                                  });
                                  setCropActive(true);
                                }}
                              >
                                📐 Adjust
                              </button>
                            )}
                          </div>

                          <div className="da-image-preview-box">
                            {editProduct.detailImage ? (
                              <img src={editProduct.detailImage} alt="detail preview" />
                            ) : (
                              <div className="da-no-image">
                                <span>🖼️</span>
                                <p>No detail image</p>
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
                            <label className="da-upload-label" style={{ flex: 1, margin: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                              📁 {editProduct.detailImage ? 'Change Detail Image' : 'Choose Detail Image'}
                              <input type="file" accept="image/*" style={{ display: 'none' }}
                                onChange={async e => {
                                  const file = e.target.files[0]; if (!file) return;
                                  showMsg("⌛ Uploading detail image...");
                                  const formData = new FormData(); formData.append('file', file);
                                  const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
                                  const data = await res.json();
                                  if (res.ok) {
                                    setEditProduct({ ...editProduct, detailImage: data.url || data.path });
                                    showMsg("✅ Detail image uploaded!");
                                  } else {
                                    showMsg("❌ Upload failed");
                                  }
                                }}
                              />
                            </label>
                            {editProduct.detailImage && (
                              <button 
                                type="button"
                                className="da-save-btn" 
                                style={{ width: 'auto', padding: '10px 16px', background: '#3b82f6', margin: 0 }}
                                onClick={() => {
                                  setCropImageSrc(editProduct.detailImage);
                                  setOnCropSave(() => async (croppedBlob) => {
                                    const croppedFile = new File([croppedBlob], 'cropped.jpeg', { type: 'image/jpeg' });
                                    const formData = new FormData(); formData.append('file', croppedFile);
                                    const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
                                    const data = await res.json();
                                    if (res.ok) setEditProduct({ ...editProduct, detailImage: data.url || data.path });
                                  });
                                  setCropActive(true);
                                }}
                              >
                                📐 Adjust
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="da-edit-right">
                          <label>Name</label>
                          <input value={editProduct.name} onChange={e => setEditProduct({ ...editProduct, name: e.target.value })} />
                          <label>Arabic Name</label>
                          <input style={{ textAlign: 'right', fontSize: '1.2rem' }} value={editProduct.arabicName} onChange={e => setEditProduct({ ...editProduct, arabicName: e.target.value })} />
                          <label>Storage Note</label>
                          <textarea rows={3} value={editProduct.storageNote} onChange={e => setEditProduct({ ...editProduct, storageNote: e.target.value })} />
                          
                          <label>Weights & Savings</label>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                             <button type="button" style={{ background: '#c5a059', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setEditProduct({ ...editProduct, weights: [...(editProduct.weights || []), { label: '500g Mini Box', savings: '' }] })}>+ 500g Mini Box</button>
                             <button type="button" style={{ background: '#c5a059', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setEditProduct({ ...editProduct, weights: [...(editProduct.weights || []), { label: '1kg Special Box', savings: '' }] })}>+ 1kg Special Box</button>
                             <button type="button" style={{ background: '#c5a059', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setEditProduct({ ...editProduct, weights: [...(editProduct.weights || []), { label: '2kg Briefcase Box', savings: '(Save Rs 500)' }] })}>+ 2kg Briefcase Box</button>
                             <button type="button" style={{ background: '#c5a059', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setEditProduct({ ...editProduct, weights: [...(editProduct.weights || []), { label: '5kg Family Carton', savings: '(Save Rs 1500)' }] })}>+ 5kg Family Carton</button>
                          </div>
                          <div className="da-weights-editor">
                            {(editProduct.weights || []).map((w, idx) => (
                              <div key={idx} className="da-weight-row">
                                <input placeholder="Label" value={w.label} onChange={e => {
                                  const ws = [...editProduct.weights]; ws[idx].label = e.target.value;
                                  setEditProduct({ ...editProduct, weights: ws });
                                }} />
                                <input placeholder="Savings" value={w.savings} onChange={e => {
                                  const ws = [...editProduct.weights]; ws[idx].savings = e.target.value;
                                  setEditProduct({ ...editProduct, weights: ws });
                                }} />
                                <button onClick={() => setEditProduct({ ...editProduct, weights: editProduct.weights.filter((_, i) => i !== idx) })}>✕</button>
                              </div>
                            ))}
                            <button className="da-add-btn" onClick={() => setEditProduct({ ...editProduct, weights: [...(editProduct.weights || []), { label: '', savings: '' }] })}>+ Add Weight Option</button>
                          </div>

                          <label>Rating (1 - 5)</label>
                          <input type="number" min="1" max="5" step="0.1" value={editProduct.rating} onChange={e => setEditProduct({ ...editProduct, rating: Number(e.target.value) })} />
                          <label>Discount Tag</label>
                          <input value={editProduct.discount} onChange={e => setEditProduct({ ...editProduct, discount: e.target.value })} />
                          <label>Description</label>
                          <textarea rows={3} value={editProduct.description} onChange={e => setEditProduct({ ...editProduct, description: e.target.value })} />
                          
                          <div className="da-form-btns" style={{ marginTop: '20px' }}>
                            <button className="da-save-btn" onClick={() => saveProduct(editProduct)}>💾 Save</button>
                            <button className="da-cancel-btn" onClick={() => setEditProduct(null)}>Cancel</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="da-card-view">
                      <div className="da-product-img-wrap">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="da-product-img"
                          onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x130/1f2937/9ca3af?text=No+Image'; }}
                        />
                      </div>
                      <div className="da-product-header">
                        <h4>{product.name}</h4>
                        <span className="da-arabic-text">{product.arabicName}</span>
                      </div>
                      <div className="da-product-meta">
                        <span className="da-price">PKR {product.price}</span>
                        <span className="da-discount">{product.discount}</span>
                        <span className={`da-stock ${product.stock ? 'in' : 'out'}`}>{product.stock ? '✅ In Stock' : '❌ Out of Stock'}</span>
                      </div>
                      <div className="da-rating-row">{renderStars(product.rating)} <span className="da-rating-val">({product.rating})</span></div>
                      
                      {product.storageNote && <p className="da-storage-preview">{product.storageNote.substring(0, 40)}...</p>}
                      
                      <div className="da-form-btns">
                        <button className="da-edit-btn" onClick={() => setEditProduct({ ...product })}>✏️ Edit</button>
                        <button className="da-delete-btn" onClick={() => deleteProduct(product.id)}>🗑️ Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && !loading && (
          <div className="da-section">
            <h2 className="da-section-title">⭐ Reviews ({reviews.length})</h2>
            <div className="da-add-review">
              <h3>➕ Add New Review</h3>
              <div className="da-edit-form">
                <label>Customer Name</label>
                <input placeholder="e.g. Ahmed Khan" value={newReview.name} onChange={e => setNewReview({ ...newReview, name: e.target.value })} />
                <label>Review Text</label>
                <textarea rows={3} placeholder="Write review..." value={newReview.text} onChange={e => setNewReview({ ...newReview, text: e.target.value })} />
                <label>Rating (1 - 5)</label>
                <input type="number" min="1" max="5" step="0.1" value={newReview.rating} onChange={e => setNewReview({ ...newReview, rating: Number(e.target.value) })} />
                <button className="da-save-btn" onClick={addReview}>➕ Add Review</button>
              </div>
            </div>
            <div className="da-cards">
              {reviews.map(review => (
                <div key={review._id} className="da-card">
                  {editReview?._id === review._id ? (
                    <div className="da-edit-form">
                      <label>Name</label>
                      <input value={editReview.name} onChange={e => setEditReview({ ...editReview, name: e.target.value })} />
                      <label>Review Text</label>
                      <textarea rows={3} value={editReview.text} onChange={e => setEditReview({ ...editReview, text: e.target.value })} />
                      <label>Rating</label>
                      <input type="number" min="1" max="5" step="0.1" value={editReview.rating} onChange={e => setEditReview({ ...editReview, rating: Number(e.target.value) })} />
                      <div className="da-form-btns">
                        <button className="da-save-btn" onClick={() => saveReview(editReview)}>💾 Save</button>
                        <button className="da-cancel-btn" onClick={() => setEditReview(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="da-card-view">
                      <div className="da-review-stars">{renderStars(review.rating)} <span className="da-rating-val">({review.rating})</span></div>
                      <p className="da-review-text">"{review.text}"</p>
                      <h4 className="da-review-author">— {review.name}</h4>
                      <div className="da-form-btns">
                        <button className="da-edit-btn" onClick={() => setEditReview({ ...review })}>✏️ Edit</button>
                        <button className="da-delete-btn" onClick={() => deleteReview(review._id)}>🗑️ Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'deliveryMap' && !loading && deliveryMap && (
          <div className="da-section">
            <h2 className="da-section-title">🗺️ Delivery Map Section</h2>

            <div className="da-video-specs-note" style={{ borderColor: '#3b82f6', background: '#eff6ff', borderTop: '1px solid rgba(59, 130, 246, 0.2)', borderRight: '1px solid rgba(59, 130, 246, 0.2)', borderBottom: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <strong style={{ color: '#1d4ed8' }}>📸 Recommended Map Image Specs:</strong>
              <ul>
                <li><span>Resolution:</span> 1200x800 (Landscape 3:2 Ratio)</li>
                <li><span>Clarity:</span> High Resolution (text must be readable)</li>
                <li><span>Format:</span> PNG or JPG</li>
                <li><span>Size:</span> Under 800KB</li>
              </ul>
            </div>

            <div className="da-cards">
              <div className="da-card">
                {editDeliveryMap ? (
                  <div className="da-edit-form">
                    <label>Title</label>
                    <input value={editDeliveryMap.title} onChange={e => setEditDeliveryMap({ ...editDeliveryMap, title: e.target.value })} />
                    <label>Map Image URL</label>
                    <input placeholder="e.g. /pakistan-delivery-map.png" value={editDeliveryMap.mapImage} onChange={e => setEditDeliveryMap({ ...editDeliveryMap, mapImage: e.target.value })} />
                    <label className="da-upload-label">
                      📤 Upload Map Image
                      <input type="file" accept="image/*" style={{ display: 'none' }}
                        onChange={async e => {
                          const file = e.target.files[0]; if (!file) return;
                          showMsg("⌛ Uploading original map...");
                          const formData = new FormData(); formData.append('file', file);
                          const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
                          const data = await res.json();
                          if (res.ok) {
                            setEditDeliveryMap({ ...editDeliveryMap, mapImage: data.url || data.path });
                            showMsg("✅ Map uploaded! Click '📐 Adjust Map' to crop.");
                          } else {
                            showMsg("❌ Upload failed");
                          }
                        }}
                      />
                    </label>
                    {editDeliveryMap.mapImage && (
                      <button 
                        type="button"
                        className="da-save-btn" 
                        style={{ width: 'auto', padding: '6px 12px', background: '#3b82f6', marginTop: '8px' }}
                        onClick={() => {
                          setCropImageSrc(editDeliveryMap.mapImage);
                          setOnCropSave(() => async (croppedBlob) => {
                            const croppedFile = new File([croppedBlob], 'cropped.jpeg', { type: 'image/jpeg' });
                            const formData = new FormData(); formData.append('file', croppedFile);
                            const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
                            const data = await res.json();
                            if (res.ok) setEditDeliveryMap({ ...editDeliveryMap, mapImage: data.url || data.path });
                          });
                          setCropActive(true);
                        }}
                      >
                        📐 Adjust Map
                      </button>
                    )}
                    {editDeliveryMap.mapImage && (
                      <div style={{ marginTop: '12px' }}>
                        <p className="da-preview-label">Preview:</p>
                        <img src={editDeliveryMap.mapImage} alt="Map Preview" style={{ width: '100%', maxWidth: '500px', height: 'auto', borderRadius: '12px', border: '2px solid rgba(251,146,60,0.3)' }} onError={e => e.target.src='/dates.png'} />
                      </div>
                    )}
                    <div className="da-form-btns" style={{ marginTop: '16px' }}>
                      <button className="da-save-btn" onClick={saveDeliveryMap}>💾 Save</button>
                      <button className="da-cancel-btn" onClick={() => setEditDeliveryMap(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="da-card-view">
                    <h3>{deliveryMap.title}</h3>
                    <div style={{ marginTop: '16px' }}>
                      <img src={deliveryMap.mapImage} alt="Delivery Map" style={{ width: '100%', maxWidth: '600px', height: 'auto', borderRadius: '12px', border: '2px solid rgba(251,146,60,0.3)' }} onError={e => e.target.src='/dates.png'} />
                    </div>
                    <p style={{ color: '#4b5563', marginTop: '12px', fontSize: '14px' }}>🗺️ {deliveryMap.mapImage}</p>
                    <div className="da-edit-btn-wrap" style={{ marginTop: '16px' }}>
                      <button className="da-edit-btn" onClick={() => setEditDeliveryMap({ ...deliveryMap })}>✏️ Edit</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'about' && !loading && about && (
          <div className="da-section">
            <h2 className="da-section-title">🌱 About Section (How Our Dates Are Grown)</h2>

            <div className="da-video-specs-note" style={{ borderColor: '#22c55e', background: '#f0fdf4', borderTop: '1px solid rgba(34, 197, 94, 0.2)', borderRight: '1px solid rgba(34, 197, 94, 0.2)', borderBottom: '1px solid rgba(34, 197, 94, 0.2)' }}>
              <strong style={{ color: '#15803d' }}>📸 Recommended Slideshow Image Specs:</strong>
              <ul>
                <li><span>Resolution:</span> 1200x800 (Landscape 3:2 Ratio)</li>
                <li><span>Aesthetic:</span> High-quality farm/process photography</li>
                <li><span>Format:</span> JPG or WebP</li>
                <li><span>Size:</span> Under 600KB for each slide</li>
              </ul>
            </div>

            <div className="da-cards">
              <div className="da-card">
                {editAbout ? (
                  <div className="da-edit-form">
                    <label>Title</label>
                    <input value={editAbout.title} onChange={e => setEditAbout({ ...editAbout, title: e.target.value })} />

                    <label>Paragraphs</label>
                    {editAbout.paragraphs.map((para, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <textarea rows={3} style={{ flex: 1 }} value={para}
                          onChange={e => {
                            const updated = [...editAbout.paragraphs];
                            updated[i] = e.target.value;
                            setEditAbout({ ...editAbout, paragraphs: updated });
                          }}
                        />
                        <button className="da-delete-btn" style={{ padding: '6px 12px', alignSelf: 'flex-start' }}
                          onClick={() => setEditAbout({ ...editAbout, paragraphs: editAbout.paragraphs.filter((_, j) => j !== i) })}>
                          🗑️
                        </button>
                      </div>
                    ))}
                    <button className="da-save-btn" style={{ width: 'auto', padding: '6px 16px', marginBottom: '16px' }}
                      onClick={() => setEditAbout({ ...editAbout, paragraphs: [...editAbout.paragraphs, ''] })}>
                      ➕ Add Paragraph
                    </button>

                    <label>Slideshow Images (4 recommended)</label>
                    {editAbout.images.map((img, i) => (
                      <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                        <input style={{ flex: 1 }} placeholder="Image URL e.g. /Product 1.png" value={img}
                          onChange={e => {
                            const updated = [...editAbout.images];
                            updated[i] = e.target.value;
                            setEditAbout({ ...editAbout, images: updated });
                          }}
                        />
                        <label className="da-upload-label" style={{ margin: 0, padding: '6px 10px', fontSize: '12px' }}>
                          📤
                          <input type="file" accept="image/*" style={{ display: 'none' }}
                            onChange={async e => {
                              const file = e.target.files[0]; if (!file) return;
                              showMsg("⌛ Uploading original slide...");
                              const formData = new FormData(); formData.append('file', file);
                              const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
                              const data = await res.json();
                              if (res.ok) {
                                const updated = [...editAbout.images];
                                updated[i] = data.url || data.path;
                                setEditAbout({ ...editAbout, images: updated });
                                showMsg("✅ Slide uploaded! Click '📐 Adjust' to crop.");
                              } else {
                                showMsg("❌ Upload failed");
                              }
                            }}
                          />
                        </label>
                        {img && (
                          <button 
                            type="button"
                            className="da-save-btn" 
                            style={{ width: 'auto', padding: '6px 12px', background: '#3b82f6', margin: 0 }}
                            onClick={() => {
                              setCropImageSrc(img);
                              setOnCropSave(() => async (croppedBlob) => {
                                const croppedFile = new File([croppedBlob], 'cropped.jpeg', { type: 'image/jpeg' });
                                const formData = new FormData(); formData.append('file', croppedFile);
                                const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
                                const data = await res.json();
                                if (res.ok) {
                                  const updated = [...editAbout.images];
                                  updated[i] = data.url || data.path;
                                  setEditAbout({ ...editAbout, images: updated });
                                }
                              });
                              setCropActive(true);
                            }}
                          >
                            📐 Adjust
                          </button>
                        )}
                        {img && <img src={img} alt={`slide${i}`} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} onError={e => e.target.style.display='none'} />}
                        <button className="da-delete-btn" style={{ padding: '6px 12px' }}
                          onClick={() => setEditAbout({ ...editAbout, images: editAbout.images.filter((_, j) => j !== i) })}>
                          🗑️
                        </button>
                      </div>
                    ))}
                    <button className="da-save-btn" style={{ width: 'auto', padding: '6px 16px', marginBottom: '16px' }}
                      onClick={() => setEditAbout({ ...editAbout, images: [...editAbout.images, ''] })}>
                      ➕ Add Image
                    </button>

                    <div className="da-form-btns">
                      <button className="da-save-btn" onClick={saveAbout}>💾 Save</button>
                      <button className="da-cancel-btn" onClick={() => setEditAbout(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="da-card-view">
                    <h3>{about.title}</h3>
                    <div style={{ margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {about.paragraphs.map((para, i) => (
                        <p key={i} style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6', padding: '10px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', margin: 0 }}>{para}</p>
                      ))}
                    </div>
                    <div style={{ marginTop: '16px' }}>
                      <h4 style={{ color: '#fb923c', fontSize: '14px', marginBottom: '8px' }}>Slideshow Images:</h4>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {about.images.map((img, i) => (
                          <img key={i} src={img} alt={`slide${i+1}`} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px', border: '2px solid rgba(251,146,60,0.3)' }} onError={e => e.target.src='/dates.png'} />
                        ))}
                      </div>
                    </div>
                    <div className="da-edit-btn-wrap" style={{ marginTop: '16px' }}>
                      <button className="da-edit-btn" onClick={() => setEditAbout({ ...about })}>✏️ Edit</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payment' && !loading && (
          <div className="da-section">
            <h2 className="da-section-title">💳 Payment Icons</h2>
            <p style={{color:'#94a3b8', marginBottom:'20px', fontSize:'14px'}}>Footer mein dikhne wale payment icons upload karo (Visa, Mastercard, EasyPaisa, JazzCash etc.)</p>
            <div style={{display:'flex', flexWrap:'wrap', gap:'16px', marginBottom:'24px'}}>
              {paymentIcons.map((icon, i) => (
                <div key={i} style={{position:'relative', display:'inline-flex', flexDirection:'column', alignItems:'center', gap:'6px'}}>
                  <div style={{background:'repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0 0 / 10px 10px', borderRadius:'8px', padding:'6px'}}>
                    <img src={icon} alt={`icon-${i}`} style={{height:'40px', width:'auto', objectFit:'contain', display:'block', borderRadius:'4px'}} onError={e => e.target.style.opacity='0.3'} />
                  </div>
                  <button onClick={() => savePaymentIcons(paymentIcons.filter((_,j) => j !== i))}
                    style={{position:'absolute', top:'-8px', right:'-8px', width:'20px', height:'20px', borderRadius:'50%', background:'#ef4444', border:'none', color:'#fff', fontSize:'12px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
                    ×
                  </button>
                </div>
              ))}
            </div>
            <label className="da-upload-label">
              📤 Upload Payment Icon
              <input type="file" accept="image/*" style={{display:'none'}}
                onChange={async e => {
                  const file = e.target.files[0]; if (!file) return;
                  const formData = new FormData(); formData.append('file', file);
                  const res = await fetch(`${API}/upload`, { method:'POST', body: formData });
                  const data = await res.json();
                  if (res.ok) savePaymentIcons([...paymentIcons, data.url || data.path]);
                }}
              />
            </label>
          </div>
        )}

        {cropActive && cropImageSrc && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              width: '100%',
              maxWidth: '650px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#1a1a1a', fontSize: '18px', fontWeight: '700' }}>✂️ Crop Image</h3>
                <button 
                  onClick={() => { setCropActive(false); setCropImageSrc(null); setCompletedCrop(null); }}
                  style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6b7280' }}
                >✕</button>
              </div>

              <div style={{ 
                position: 'relative', 
                width: '100%', 
                maxHeight: '400px', 
                background: '#f3f4f6', 
                borderRadius: '10px', 
                overflow: 'auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '10px'
              }}>
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={undefined}
                  style={{ maxWidth: '100%' }}
                >
                  <img
                    ref={imgRef}
                    src={cropImageSrc}
                    alt="Crop source"
                    onLoad={onImageLoad}
                    style={{ maxHeight: '350px', objectFit: 'contain', width: 'auto', maxWidth: '100%' }}
                    crossOrigin="anonymous"
                    draggable={false}
                  />
                  {/* Custom edge/side handles */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '14px',
                    height: '6px',
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #4b5563',
                    borderRadius: '2px',
                    pointerEvents: 'none',
                    zIndex: 1000
                  }} />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translate(-50%, 50%)',
                    width: '14px',
                    height: '6px',
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #4b5563',
                    borderRadius: '2px',
                    pointerEvents: 'none',
                    zIndex: 1000
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    right: 0,
                    transform: 'translate(50%, -50%)',
                    width: '6px',
                    height: '14px',
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #4b5563',
                    borderRadius: '2px',
                    pointerEvents: 'none',
                    zIndex: 1000
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    transform: 'translate(-50%, -50%)',
                    width: '6px',
                    height: '14px',
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #4b5563',
                    borderRadius: '2px',
                    pointerEvents: 'none',
                    zIndex: 1000
                  }} />
                </ReactCrop>
              </div>

              <div style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
                💡 Mouse pointer se image par crop area ke corners ya side center indicators ko drag kar ke select karein.
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button 
                  onClick={executeCrop}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'linear-gradient(135deg, #c5a059, #b8860b)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(197, 160, 89, 0.2)'
                  }}
                >
                  Apply Crop & Save
                </button>
                <button 
                  onClick={() => { setCropActive(false); setCropImageSrc(null); setCompletedCrop(null); }}
                  style={{
                    padding: '12px 20px',
                    background: '#f3f4f6',
                    color: '#4b5563',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}



          </div>
        </div>
      </div>
    </div>
  );
}

export default Description_Admin;
