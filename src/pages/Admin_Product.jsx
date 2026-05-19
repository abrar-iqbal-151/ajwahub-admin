import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import '../css/AdminPanel.css';
import '../css/Admin_Product.css';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

const menuItems = [
  { icon: '🏠', label: 'Dashboard', path: '/panel' },
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
];

function Admin_Product() {
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [editProduct, setEditProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Image Cropping States & Ref
  const imgRef = useRef(null);
  const [crop, setCrop] = useState(null);
  const [completedCrop, setCompletedCrop] = useState(null);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [cropActive, setCropActive] = useState(false);
  const [onCropSave, setOnCropSave] = useState(null);

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


  useEffect(() => {
    const adminData = localStorage.getItem('ajwaHub_admin');
    const t = localStorage.getItem('ajwaHub_adminToken');
    if (!adminData || !t) { navigate('/login'); return; }
    setAdmin(JSON.parse(adminData));
    setToken(t);
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/shop-products`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch { }
    setLoading(false);
  };

  const authHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };

  const initializeData = async () => {
    const res = await fetch(`${API}/shop-products/initialize`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    showMsg(data.message === 'already exists' ? '⚠️ Already initialized!' : '✅ Data initialized!');
    fetchProducts();
  };

  const [newProduct, setNewProduct] = useState({ name: '', price: 4300, weight: '1kg', rating: 4.5, stock: true, image: '', detailImage: '', description: '', category: 'dates', storageNote: 'To maintain freshness and softness, store dates in the refrigerator after receiving the parcel....', weights: [], arabicName: '' });

  const saveProduct = async (product) => {
    const res = await fetch(`${API}/shop-products/${product._id}`, {
      method: 'PUT', headers: authHeaders,
      body: JSON.stringify({
        name: product.name,
        price: 4300,
        discount: product.discount,
        stock: product.stock,
        description: product.description,
        rating: product.rating,
        image: product.image,
        detailImage: product.detailImage,
        category: product.category,
        storageNote: product.storageNote,
        weights: product.weights,
        arabicName: product.arabicName
      })
    });
    if (res.ok) { fetchProducts(); setEditProduct(null); showMsg('✅ Product updated!'); }
    else showMsg('❌ Failed to update');
  };

  const addProduct = async () => {
    if (!newProduct.name) return showMsg('⚠️ Name required hai');
    const res = await fetch(`${API}/shop-products`, {
      method: 'POST', headers: authHeaders,
      body: JSON.stringify({
        ...newProduct,
        price: 4300,
        storageNote: newProduct.storageNote,
        weights: newProduct.weights,
        arabicName: newProduct.arabicName
      })
    });
    if (res.ok) {
      showMsg('✅ Product added!');
      setShowAddForm(false);
      setNewProduct({ name: '', price: 4300, weight: '1kg', rating: 4.5, stock: true, image: '', detailImage: '', description: '', category: 'dates', storageNote: 'To maintain freshness and softness, store dates in the refrigerator after receiving the parcel....', weights: [], arabicName: '' });
      fetchProducts();
    } else showMsg('❌ Failed to add');
  };

  const handleLogout = () => {
    localStorage.removeItem('ajwaHub_admin');
    localStorage.removeItem('ajwaHub_adminToken');
    navigate('/login');
  };

  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <span key={i} style={{ color: i < Math.floor(rating) ? '#fbbf24' : '#555', fontSize: '16px' }}>★</span>
    ));

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

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
          <h1 className="topbar-title">🛍️ Products Editor</h1>
          <div className="topbar-right">
            {admin && <span className="topbar-admin">👤 {admin.name}</span>}
          </div>
        </header>

        <div className="dashboard-content">
          {msg && <div className="ap-msg">{msg}</div>}

          {products.length === 0 && !loading && (
            <div style={{ background: '#111827', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '14px', padding: '30px', textAlign: 'center', marginBottom: '20px' }}>
              <p style={{ color: '#9ca3af', marginBottom: '16px' }}>Database mein koi product nahi. Initialize karo.</p>
              <button className="ap-save" style={{ width: 'auto', padding: '10px 24px' }} onClick={initializeData}>🚀 Initialize Products</button>
            </div>
          )}

          <div className="ap-toolbar">
            <input className="search-input" placeholder="🔍 Search products..." value={search} onChange={e => setSearch(e.target.value)} />
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
                    <li>• Size: Under 400KB</li>
                  </ul>
                </div>

                <div style={{ background: '#fdfaf3', padding: '10px', borderRadius: '10px', border: '1px solid rgba(197, 160, 89, 0.1)' }}>
                  <p style={{ color: '#c5a059', fontSize: '11px', fontWeight: '800', marginBottom: '4px' }}>DETAIL VIEW IMAGE</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '12px', color: '#4b5563' }}>
                    <li>• Resolution: 1200 x 1200</li>
                    <li>• Style: Premium Lifestyle</li>
                    <li>• Focus: Clear product detail</li>
                  </ul>
                </div>
              </div>
            </div>
            <span className="ap-count">{filtered.length} Products</span>
            <button className="ap-save" style={{ width: 'auto', padding: '8px 18px' }} onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? '✕ Cancel' : '➕ Add Product'}
            </button>
          </div>

          {showAddForm && (
            <div className="ap-add-form">
              <h3>➕ Add New Boutique Product</h3>
              <div className="ap-edit-flex">
                <div className="ap-edit-left">
                  <div style={{ 
                    position: 'relative', 
                    background: '#fdfaf3', 
                    borderRadius: '24px', 
                    height: '350px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    border: '1px solid rgba(197, 160, 89, 0.2)',
                    overflow: 'hidden',
                    padding: '20px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
                  }}>
                    {/* Spotlight Glow */}
                    <div style={{ 
                      position: 'absolute', 
                      top: 0, left: 0, right: 0, bottom: 0, 
                      background: 'radial-gradient(circle at center, rgba(197, 160, 89, 0.08) 0%, transparent 70%)',
                      pointerEvents: 'none'
                    }} />

                    {newProduct.image ? (
                      <img src={newProduct.image} alt="preview" style={{ 
                        maxWidth: '90%', 
                        maxHeight: '90%', 
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 15px 25px rgba(0, 0, 0, 0.15))',
                        position: 'relative',
                        zIndex: 1
                      }} />
                    ) : (
                      <div style={{ color: '#ccc', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                        <span style={{ fontSize: '48px' }}>🖼️</span>
                        <p style={{ color: '#94a3b8' }}>No image selected</p>
                      </div>
                    )}
                    <div style={{ position: 'absolute', bottom: '10px', right: '10px', display: 'flex', gap: '6px', zIndex: 10 }}>
                      <label className="ap-upload-label" style={{ width: 'auto', background: 'rgba(255,255,255,0.9)', margin: 0, padding: '6px 12px', fontSize: '12px' }}>
                      📤 Upload Image
                      <input type="file" accept="image/*" style={{ display: 'none' }}
                        onChange={async e => {
                          const file = e.target.files[0];
                          if (!file) return;
                          const formData = new FormData();
                          formData.append('file', file);
                          const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
                          const data = await res.json();
                          if (res.ok) setNewProduct({ ...newProduct, image: data.path });
                        }}
                      />
                    </label>
                    {newProduct.image && (
                      <button
                        type="button"
                        style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                        onClick={() => {
                          setCropImageSrc(newProduct.image);
                          setOnCropSave(() => async (croppedBlob) => {
                            const croppedFile = new File([croppedBlob], 'cropped.jpeg', { type: 'image/jpeg' });
                            const formData = new FormData(); formData.append('file', croppedFile);
                            const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
                            const data = await res.json();
                            if (res.ok) setNewProduct({ ...newProduct, image: data.path });
                          });
                          setCropActive(true);
                        }}
                      >
                        📐 Adjust
                      </button>
                    )}
                  </div>
                  </div>
                  <label>Image URL (Main Catalog)</label>
                  <input placeholder="e.g. /Product 1.png" value={newProduct.image} onChange={e => setNewProduct({ ...newProduct, image: e.target.value })} />

                  <div style={{ marginTop: '20px' }}>
                    <label>Detail View Image (Opens on click)</label>
                    <div style={{ 
                      position: 'relative', 
                      background: '#fdfaf3', 
                      borderRadius: '24px', 
                      height: '200px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      border: '1px solid rgba(197, 160, 89, 0.2)',
                      overflow: 'hidden',
                      padding: '10px',
                      marginTop: '8px'
                    }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at center, rgba(197, 160, 89, 0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
                      {newProduct.detailImage ? (
                        <img src={newProduct.detailImage} alt="detail preview" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))', position: 'relative', zIndex: 1 }} />
                      ) : (
                        <div style={{ color: '#ccc', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                          <span style={{ fontSize: '32px' }}>🖼️</span>
                          <p style={{ fontSize: '10px', color: '#94a3b8' }}>No detail image</p>
                        </div>
                      )}
                      <div style={{ position: 'absolute', bottom: '10px', right: '10px', display: 'flex', gap: '6px', zIndex: 10 }}>
                        <label className="ap-upload-label" style={{ width: 'auto', background: 'rgba(255,255,255,0.9)', margin: 0, padding: '6px 12px', fontSize: '12px' }}>
                        📤 Upload Detail
                        <input type="file" accept="image/*" style={{ display: 'none' }}
                          onChange={async e => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const formData = new FormData();
                            formData.append('file', file);
                            const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
                            const data = await res.json();
                            if (res.ok) setNewProduct({ ...newProduct, detailImage: data.path });
                          }}
                        />
                      </label>
                      {newProduct.detailImage && (
                        <button
                          type="button"
                          style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                          onClick={() => {
                            setCropImageSrc(newProduct.detailImage);
                            setOnCropSave(() => async (croppedBlob) => {
                              const croppedFile = new File([croppedBlob], 'cropped.jpeg', { type: 'image/jpeg' });
                              const formData = new FormData(); formData.append('file', croppedFile);
                              const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
                              const data = await res.json();
                              if (res.ok) setNewProduct({ ...newProduct, detailImage: data.path });
                            });
                            setCropActive(true);
                          }}
                        >
                          📐 Adjust
                        </button>
                      )}
                    </div>
                    </div>
                    <input placeholder="Detail Image URL" style={{ marginTop: '8px' }} value={newProduct.detailImage} onChange={e => setNewProduct({ ...newProduct, detailImage: e.target.value })} />
                  </div>
                </div>

                <div className="ap-edit-right">
                  <label>Name</label>
                  <input placeholder="Product name" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />

                  <label>Arabic Name</label>
                  <input placeholder="عجوة" style={{ textAlign: 'right', fontSize: '18px' }} value={newProduct.arabicName} onChange={e => setNewProduct({ ...newProduct, arabicName: e.target.value })} />

                  <label>Category</label>
                  <select value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}>
                    <option value="dates">Dates</option>
                    <option value="dry">Dry Fruits</option>
                  </select>

                  <label>Storage Note</label>
                  <textarea rows={2} placeholder="Storage advice..." value={newProduct.storageNote} onChange={e => setNewProduct({ ...newProduct, storageNote: e.target.value })} />

                  <label>Weight Options & Savings</label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px', marginTop: '6px' }}>
                    <button type="button" style={{ background: '#c5a059', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setNewProduct({ ...newProduct, weights: [...(newProduct.weights || []), { label: '500g Mini Box', savings: '' }] })}>+ 500g Mini Box</button>
                    <button type="button" style={{ background: '#c5a059', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setNewProduct({ ...newProduct, weights: [...(newProduct.weights || []), { label: '1kg Special Box', savings: '' }] })}>+ 1kg Special Box</button>
                    <button type="button" style={{ background: '#c5a059', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setNewProduct({ ...newProduct, weights: [...(newProduct.weights || []), { label: '2kg Briefcase Box', savings: '(Save Rs 500)' }] })}>+ 2kg Briefcase Box</button>
                    <button type="button" style={{ background: '#c5a059', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setNewProduct({ ...newProduct, weights: [...(newProduct.weights || []), { label: '5kg Family Carton', savings: '(Save Rs 1500)' }] })}>+ 5kg Family Carton</button>
                  </div>
                  <div className="ap-weights-manager" style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#fdfaf3', padding: '12px', borderRadius: '8px', border: '1px solid #c5a059' }}>
                    {(newProduct.weights || []).map((w, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input placeholder="e.g. 2kg Box" value={w.label} onChange={e => {
                          const newWeights = [...newProduct.weights];
                          newWeights[idx].label = e.target.value;
                          setNewProduct({ ...newProduct, weights: newWeights });
                        }} style={{ flex: 2, fontSize: '12px' }} />
                        <input placeholder="e.g. (Save Rs 500)" value={w.savings} onChange={e => {
                          const newWeights = [...newProduct.weights];
                          newWeights[idx].savings = e.target.value;
                          setNewProduct({ ...newProduct, weights: newWeights });
                        }} style={{ flex: 1, fontSize: '12px' }} />
                        <button onClick={() => {
                          const newWeights = newProduct.weights.filter((_, i) => i !== idx);
                          setNewProduct({ ...newProduct, weights: newWeights });
                        }} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>✕</button>
                      </div>
                    ))}
                    <button className="ap-add-weight-btn" onClick={() => {
                      const newWeights = [...(newProduct.weights || []), { label: '', savings: '' }];
                      setNewProduct({ ...newProduct, weights: newWeights });
                    }} style={{ background: '#c5a059', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', fontSize: '12px', marginTop: '5px' }}>
                      + Add Weight Option
                    </button>
                  </div>

                  <label className="ap-stock-label">
                    <input type="checkbox" checked={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.checked })} />
                    In Stock
                  </label>

                  <div className="ap-btns" style={{ marginTop: 'auto' }}>
                    <button className="ap-save" onClick={addProduct}>➕ Add Product</button>
                    <button className="ap-cancel" onClick={() => setShowAddForm(false)}>Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading ? <div className="panel-loading">Loading boutique inventory...</div> : (
            <div className="ap-grid">
              {filtered.map(product => (
                <div key={product._id} className="ap-card">
                  <div className="ap-view">
                    <img src={product.image} alt={product.name} className="ap-img" onError={e => e.target.style.display = 'none'} />
                    <div className="ap-view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h4 style={{ margin: 0 }}>{product.name}</h4>
                      <h4 className="ap-arabic" style={{ margin: 0, color: '#c5a059', fontFamily: "'Playfair Display', serif" }}>{product.arabicName}</h4>
                    </div>
                    <div className="ap-meta">
                      <span className="ap-price">PKR {product.price.toLocaleString()}</span>
                      <span className={`ap-stock ${product.stock ? 'in' : 'out'}`}>{product.stock ? '● In Stock' : '○ Out of Stock'}</span>
                    </div>
                    <div className="ap-rating">{renderStars(product.rating)} <span>({product.rating})</span></div>
                    <button className="ap-edit-btn" onClick={() => setEditProduct({ ...product })}>✏️ Edit Product</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {editProduct && (
        <div className="ap-modal-overlay">
          <div className="ap-modal-container">
            <div className="ap-modal-header">
              <h3>✏️ Edit Boutique Product</h3>
              <button className="ap-modal-close" onClick={() => setEditProduct(null)}>✕</button>
            </div>
            <div className="ap-edit-flex">
              <div className="ap-edit-left">
                <div style={{ 
                  position: 'relative', 
                  background: '#fdfaf3', 
                  borderRadius: '24px', 
                  height: '350px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  border: '1px solid rgba(197, 160, 89, 0.2)',
                  overflow: 'hidden',
                  padding: '20px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ 
                    position: 'absolute', 
                    top: 0, left: 0, right: 0, bottom: 0, 
                    background: 'radial-gradient(circle at center, rgba(197, 160, 89, 0.08) 0%, transparent 70%)',
                    pointerEvents: 'none'
                  }} />

                  <img src={editProduct.image} alt={editProduct.name} className="ap-img" style={{ 
                    maxWidth: '90%', 
                    maxHeight: '90%', 
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 15px 25px rgba(0, 0, 0, 0.15))',
                    position: 'relative',
                    zIndex: 1,
                    background: 'transparent',
                    border: 'none',
                    height: 'auto',
                    marginBottom: 0
                  }} onError={e => e.target.style.display = 'none'} />
                  <div style={{ position: 'absolute', bottom: '10px', right: '10px', display: 'flex', gap: '6px', zIndex: 10 }}>
                    <label className="ap-upload-label" style={{ width: 'auto', background: 'rgba(255,255,255,0.9)', margin: 0, padding: '6px 12px', fontSize: '12px' }}>
                      📸 Upload Image
                      <input type="file" accept="image/*" style={{ display: 'none' }}
                        onChange={async e => {
                          const file = e.target.files[0];
                          if (!file) return;
                          const formData = new FormData();
                          formData.append('file', file);
                          const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
                          const data = await res.json();
                          if (res.ok) setEditProduct(prev => ({ ...prev, image: data.url || data.path }));
                        }}
                      />
                    </label>
                    {editProduct.image && (
                      <button
                        type="button"
                        style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                        onClick={() => {
                          setCropImageSrc(editProduct.image);
                          setOnCropSave(() => async (croppedBlob) => {
                            const croppedFile = new File([croppedBlob], 'cropped.jpeg', { type: 'image/jpeg' });
                            const formData = new FormData(); formData.append('file', croppedFile);
                            const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
                            const data = await res.json();
                            if (res.ok) setEditProduct(prev => ({ ...prev, image: data.url || data.path }));
                          });
                          setCropActive(true);
                        }}
                      >
                        📐 Adjust
                      </button>
                    )}
                  </div>
                </div>
                <label>Image URL (Main Catalog)</label>
                <input value={editProduct.image} onChange={e => setEditProduct(prev => ({ ...prev, image: e.target.value }))} />

                <div style={{ marginTop: '20px' }}>
                  <label>Detail View Image (Opens on click)</label>
                  <div style={{ 
                    position: 'relative', 
                    background: '#fdfaf3', 
                    borderRadius: '24px', 
                    height: '200px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    border: '1px solid rgba(197, 160, 89, 0.2)',
                    overflow: 'hidden',
                    padding: '10px',
                    marginTop: '8px'
                  }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at center, rgba(197, 160, 89, 0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
                    {editProduct.detailImage ? (
                      <img src={editProduct.detailImage} alt="detail preview" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))', position: 'relative', zIndex: 1 }} />
                    ) : (
                      <div style={{ color: '#ccc', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                        <span style={{ fontSize: '32px' }}>🖼️</span>
                        <p style={{ fontSize: '10px', color: '#94a3b8' }}>No detail image</p>
                      </div>
                    )}
                    <div style={{ position: 'absolute', bottom: '10px', right: '10px', display: 'flex', gap: '6px', zIndex: 10 }}>
                      <label className="ap-upload-label" style={{ width: 'auto', background: 'rgba(255,255,255,0.9)', margin: 0, padding: '6px 12px', fontSize: '12px' }}>
                        📤 Upload Detail
                        <input type="file" accept="image/*" style={{ display: 'none' }}
                          onChange={async e => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const formData = new FormData();
                            formData.append('file', file);
                            const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
                            const data = await res.json();
                            if (res.ok) setEditProduct(prev => ({ ...prev, detailImage: data.url || data.path }));
                          }}
                        />
                      </label>
                      {editProduct.detailImage && (
                        <button
                          type="button"
                          style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                          onClick={() => {
                            setCropImageSrc(editProduct.detailImage);
                            setOnCropSave(() => async (croppedBlob) => {
                              const croppedFile = new File([croppedBlob], 'cropped.jpeg', { type: 'image/jpeg' });
                              const formData = new FormData(); formData.append('file', croppedFile);
                              const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
                              const data = await res.json();
                              if (res.ok) setEditProduct(prev => ({ ...prev, detailImage: data.url || data.path }));
                            });
                            setCropActive(true);
                          }}
                        >
                          📐 Adjust
                        </button>
                      )}
                    </div>
                  </div>
                  <input placeholder="Detail Image URL" style={{ marginTop: '8px' }} value={editProduct.detailImage} onChange={e => setEditProduct(prev => ({ ...prev, detailImage: e.target.value }))} />
                </div>
              </div>

              <div className="ap-edit-right">
                <label>English Name</label>
                <input value={editProduct.name} onChange={e => setEditProduct(prev => ({ ...prev, name: e.target.value }))} />

                <label>Arabic Name</label>
                <input style={{ textAlign: 'right', fontSize: '18px' }} value={editProduct.arabicName} onChange={e => setEditProduct(prev => ({ ...prev, arabicName: e.target.value }))} />

                <label>Category</label>
                <select value={editProduct.category} onChange={e => setEditProduct(prev => ({ ...prev, category: e.target.value }))}>
                  <option value="dates">Dates</option>
                  <option value="dry">Dry Fruits</option>
                </select>

                <label>Storage Note</label>
                <textarea rows={2} value={editProduct.storageNote} onChange={e => setEditProduct(prev => ({ ...prev, storageNote: e.target.value }))} />

                <label>Weight Options & Savings</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px', marginTop: '6px' }}>
                  <button type="button" style={{ background: '#c5a059', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setEditProduct(prev => ({ ...prev, weights: [...(prev.weights || []), { label: '500g Mini Box', savings: '' }] }))}>+ 500g Mini Box</button>
                  <button type="button" style={{ background: '#c5a059', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setEditProduct(prev => ({ ...prev, weights: [...(prev.weights || []), { label: '1kg Special Box', savings: '' }] }))}>+ 1kg Special Box</button>
                  <button type="button" style={{ background: '#c5a059', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setEditProduct(prev => ({ ...prev, weights: [...(prev.weights || []), { label: '2kg Briefcase Box', savings: '(Save Rs 500)' }] }))}>+ 2kg Briefcase Box</button>
                  <button type="button" style={{ background: '#c5a059', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setEditProduct(prev => ({ ...prev, weights: [...(prev.weights || []), { label: '5kg Family Carton', savings: '(Save Rs 1500)' }] }))}>+ 5kg Family Carton</button>
                </div>
                <div className="ap-weights-manager" style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#fdfaf3', padding: '12px', borderRadius: '8px', border: '1px solid #c5a059' }}>
                  {(editProduct.weights || []).map((w, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input placeholder="e.g. 2kg Box" value={w.label} onChange={e => {
                        setEditProduct(prev => {
                          const newWeights = [...prev.weights];
                          newWeights[idx] = { ...newWeights[idx], label: e.target.value };
                          return { ...prev, weights: newWeights };
                        });
                      }} style={{ flex: 2, fontSize: '12px' }} />
                      <input placeholder="e.g. (Save Rs 500)" value={w.savings} onChange={e => {
                        setEditProduct(prev => {
                          const newWeights = [...prev.weights];
                          newWeights[idx] = { ...newWeights[idx], savings: e.target.value };
                          return { ...prev, weights: newWeights };
                        });
                      }} style={{ flex: 1, fontSize: '12px' }} />
                      <button onClick={() => {
                        setEditProduct(prev => {
                          const newWeights = prev.weights.filter((_, i) => i !== idx);
                          return { ...prev, weights: newWeights };
                        });
                      }} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>✕</button>
                    </div>
                  ))}
                  <button className="ap-add-weight-btn" onClick={() => {
                    setEditProduct(prev => ({ ...prev, weights: [...(prev.weights || []), { label: '', savings: '' }] }));
                  }} style={{ background: '#c5a059', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', fontSize: '12px', marginTop: '5px' }}>
                    + Add Weight Option
                  </button>
                </div>

                <label className="ap-stock-label">
                  <input type="checkbox" checked={editProduct.stock} onChange={e => setEditProduct(prev => ({ ...prev, stock: e.target.checked }))} />
                  In Stock
                </label>

                <div className="ap-btns" style={{ marginTop: 'auto' }}>
                  <button className="ap-save" onClick={() => saveProduct(editProduct)}>💾 Save Changes</button>
                  <button className="ap-cancel" onClick={() => setEditProduct(null)}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {cropActive && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000,
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
  );
}

export default Admin_Product;
