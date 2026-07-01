import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import '../css/AdminPanel.css';
import '../css/Admin_Product.css';

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
  { icon: '📦', label: 'Inventory', path: '/admin-inventory' },
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
        price: product.price || 0,
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

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to completely remove this product?")) return;
    const res = await fetch(`${API}/shop-products/${id}`, {
      method: 'DELETE', headers: authHeaders
    });
    if (res.ok) {
      showMsg('✅ Product removed!');
      fetchProducts();
    } else {
      showMsg('❌ Failed to remove');
    }
  };

  const addProduct = async () => {
    if (!newProduct.name) return showMsg('⚠️ Name required hai');
    const res = await fetch(`${API}/shop-products`, {
      method: 'POST', headers: authHeaders,
      body: JSON.stringify({
        ...newProduct,
        price: newProduct.price || 0,
        description: newProduct.description,
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
            <div className="ap-style-1">
              <p className="ap-style-2">Database mein koi product nahi. Initialize karo.</p>
              <button className="ap-save ap-style-3"  onClick={initializeData}>🚀 Initialize Products</button>
            </div>
          )}

          <div className="ap-toolbar">
            <input className="search-input" placeholder="🔍 Search products..." value={search} onChange={e => setSearch(e.target.value)} />
            <div className="da-video-specs-note ap-style-4" >
              <div className="ap-style-5">
                <span className="ap-style-6">📸</span>
                <strong className="ap-style-7">RECOMMENDED IMAGE SPECIFICATIONS</strong>
              </div>
              
              <div className="ap-style-8">
                <div className="ap-style-9">
                  <p className="ap-style-10">MAIN CATALOG IMAGE</p>
                  <ul className="ap-style-11">
                    <li>• Resolution: 1200 x 1200</li>
                    <li>• Format: WebP / JPG</li>
                    <li>• Size: Under 400KB</li>
                  </ul>
                </div>

                <div className="ap-style-12">
                  <p className="ap-style-13">DETAIL VIEW IMAGE</p>
                  <ul className="ap-style-14">
                    <li>• Resolution: 1200 x 1200</li>
                    <li>• Style: Premium Lifestyle</li>
                    <li>• Focus: Clear product detail</li>
                  </ul>
                </div>
              </div>
            </div>
            <span className="ap-count">{filtered.length} Products</span>
            <button className="ap-save ap-style-15"  onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? '✕ Cancel' : '➕ Add Product'}
            </button>
          </div>

          {showAddForm && (
            <div className="ap-add-form">
              <h3>➕ Add New Boutique Product</h3>
              <div className="ap-edit-flex">
                <div className="ap-edit-left">
                  <div className="ap-style-16">
                    {/* Spotlight Glow */}
                    <div className="ap-style-17" />

                    {newProduct.image ? (
                      <img src={newProduct.image} alt="preview" className="ap-style-18" />
                    ) : (
                      <div className="ap-style-19">
                        <span className="ap-style-20">🖼️</span>
                        <p className="ap-style-21">No image selected</p>
                      </div>
                    )}
                    <div className="ap-style-22">
                      <label className="ap-upload-label ap-style-23" >
                      📤 Upload Image
                      <input type="file" accept="image/*" className="ap-style-24"
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
                        className="ap-style-25"
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

                  <div className="ap-style-26">
                    <label>Detail View Image (Opens on click)</label>
                    <div className="ap-style-27">
                      <div className="ap-style-28" />
                      {newProduct.detailImage ? (
                        <img src={newProduct.detailImage} alt="detail preview" className="ap-style-29" />
                      ) : (
                        <div className="ap-style-30">
                          <span className="ap-style-31">🖼️</span>
                          <p className="ap-style-32">No detail image</p>
                        </div>
                      )}
                      <div className="ap-style-33">
                        <label className="ap-upload-label ap-style-34" >
                        📤 Upload Detail
                        <input type="file" accept="image/*" className="ap-style-35"
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
                          className="ap-style-36"
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
                    <input placeholder="Detail Image URL" className="ap-style-37" value={newProduct.detailImage} onChange={e => setNewProduct({ ...newProduct, detailImage: e.target.value })} />
                  </div>
                </div>

                <div className="ap-edit-right">
                  <label>Name</label>
                  <input placeholder="Product name" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />

                  <label>Arabic Name</label>
                  <input placeholder="عجوة" className="ap-style-38" value={newProduct.arabicName} onChange={e => setNewProduct({ ...newProduct, arabicName: e.target.value })} />

                  <label>Price (PKR)</label>
                  <input type="number" placeholder="e.g. 800" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: Number(e.target.value) })} />

                  <label>Description</label>
                  <textarea rows={3} placeholder="Product description..." value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />

                  <label>Category</label>
                  <select value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}>
                    <option value="dates">Dates</option>
                    <option value="dry">Dry Fruits</option>
                  </select>

                  <label>Storage Note</label>
                  <textarea rows={2} placeholder="Storage advice..." value={newProduct.storageNote} onChange={e => setNewProduct({ ...newProduct, storageNote: e.target.value })} />

                  <label>Weight Options & Savings</label>
                  <div className="ap-style-39">
                    <button type="button" className="ap-style-40" onClick={() => setNewProduct({ ...newProduct, weights: [...(newProduct.weights || []), { label: '500g Mini Box', savings: '' }] })}>+ 500g Mini Box</button>
                    <button type="button" className="ap-style-41" onClick={() => setNewProduct({ ...newProduct, weights: [...(newProduct.weights || []), { label: '1kg Special Box', savings: '' }] })}>+ 1kg Special Box</button>
                    <button type="button" className="ap-style-42" onClick={() => setNewProduct({ ...newProduct, weights: [...(newProduct.weights || []), { label: '2kg Briefcase Box', savings: '(Save Rs 500)' }] })}>+ 2kg Briefcase Box</button>
                    <button type="button" className="ap-style-43" onClick={() => setNewProduct({ ...newProduct, weights: [...(newProduct.weights || []), { label: '5kg Family Carton', savings: '(Save Rs 1500)' }] })}>+ 5kg Family Carton</button>
                  </div>
                  <div className="ap-weights-manager ap-style-44" >
                    {(newProduct.weights || []).map((w, idx) => (
                      <div key={idx} className="ap-style-45">
                        <input placeholder="e.g. 2kg Box" value={w.label} onChange={e => {
                          const newWeights = [...newProduct.weights];
                          newWeights[idx].label = e.target.value;
                          setNewProduct({ ...newProduct, weights: newWeights });
                        }} className="ap-style-46" />
                        <input placeholder="e.g. (Save Rs 500)" value={w.savings} onChange={e => {
                          const newWeights = [...newProduct.weights];
                          newWeights[idx].savings = e.target.value;
                          setNewProduct({ ...newProduct, weights: newWeights });
                        }} className="ap-style-47" />
                        <button onClick={() => {
                          const newWeights = newProduct.weights.filter((_, i) => i !== idx);
                          setNewProduct({ ...newProduct, weights: newWeights });
                        }} className="ap-style-48">✕</button>
                      </div>
                    ))}
                    <button className="ap-add-weight-btn ap-style-49" onClick={() => {
                      const newWeights = [...(newProduct.weights || []), { label: '', savings: '' }];
                      setNewProduct({ ...newProduct, weights: newWeights });
                    }} >
                      + Add Weight Option
                    </button>
                  </div>

                  <label className="ap-stock-label">
                    <input type="checkbox" checked={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.checked })} />
                    In Stock
                  </label>

                  <div className="ap-btns ap-style-50" >
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
                    <div className="ap-view-header ap-style-51" >
                      <h4 className="ap-style-52">{product.name}</h4>
                      <h4 className="ap-arabic ap-style-53" >{product.arabicName}</h4>
                    </div>
                    <div className="ap-meta">
                      <span className="ap-price">PKR {product.price.toLocaleString()}</span>
                      <span className={`ap-stock ${product.stock ? 'in' : 'out'}`}>{product.stock ? '● In Stock' : '○ Out of Stock'}</span>
                    </div>
                    <div className="ap-rating">{renderStars(product.rating)} <span>({product.rating})</span></div>
                    <div className="ap-style-54">
                      <button className="ap-edit-btn ap-style-55"  onClick={() => setEditProduct({ ...product })}>✏️ Edit</button>
                      <button 
                        className="ap-style-56" 
                        onClick={() => deleteProduct(product._id || product.id)}
                        onMouseOver={(e) => e.target.style.background = '#fecaca'}
                        onMouseOut={(e) => e.target.style.background = '#fee2e2'}
                      >🗑️ Remove</button>
                    </div>
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
                <div className="ap-style-57">
                  <div className="ap-style-58" />

                  <img src={editProduct.image} alt={editProduct.name} className="ap-img ap-style-59"  onError={e => e.target.style.display = 'none'} />
                  <div className="ap-style-60">
                    <label className="ap-upload-label ap-style-61" >
                      📸 Upload Image
                      <input type="file" accept="image/*" className="ap-style-62"
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
                        className="ap-style-63"
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

                <div className="ap-style-64">
                  <label>Detail View Image (Opens on click)</label>
                  <div className="ap-style-65">
                    <div className="ap-style-66" />
                    {editProduct.detailImage ? (
                      <img src={editProduct.detailImage} alt="detail preview" className="ap-style-67" />
                    ) : (
                      <div className="ap-style-68">
                        <span className="ap-style-69">🖼️</span>
                        <p className="ap-style-70">No detail image</p>
                      </div>
                    )}
                    <div className="ap-style-71">
                      <label className="ap-upload-label ap-style-72" >
                        📤 Upload Detail
                        <input type="file" accept="image/*" className="ap-style-73"
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
                          className="ap-style-74"
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
                  <input placeholder="Detail Image URL" className="ap-style-75" value={editProduct.detailImage} onChange={e => setEditProduct(prev => ({ ...prev, detailImage: e.target.value }))} />
                </div>
              </div>

              <div className="ap-edit-right">
                <label>English Name</label>
                <input value={editProduct.name} onChange={e => setEditProduct(prev => ({ ...prev, name: e.target.value }))} />

                <label>Arabic Name</label>
                <input className="ap-style-76" value={editProduct.arabicName} onChange={e => setEditProduct(prev => ({ ...prev, arabicName: e.target.value }))} />

                <label>Price (PKR)</label>
                <input type="number" placeholder="e.g. 800" value={editProduct.price} onChange={e => setEditProduct(prev => ({ ...prev, price: Number(e.target.value) }))} />

                <label>Description</label>
                <textarea rows={3} placeholder="Product description..." value={editProduct.description} onChange={e => setEditProduct(prev => ({ ...prev, description: e.target.value }))} />

                <label>Category</label>
                <select value={editProduct.category} onChange={e => setEditProduct(prev => ({ ...prev, category: e.target.value }))}>
                  <option value="dates">Dates</option>
                  <option value="dry">Dry Fruits</option>
                </select>

                <label>Storage Note</label>
                <textarea rows={2} value={editProduct.storageNote} onChange={e => setEditProduct(prev => ({ ...prev, storageNote: e.target.value }))} />

                <label>Weight Options & Savings</label>
                <div className="ap-style-77">
                  <button type="button" className="ap-style-78" onClick={() => setEditProduct(prev => ({ ...prev, weights: [...(prev.weights || []), { label: '500g Mini Box', savings: '' }] }))}>+ 500g Mini Box</button>
                  <button type="button" className="ap-style-79" onClick={() => setEditProduct(prev => ({ ...prev, weights: [...(prev.weights || []), { label: '1kg Special Box', savings: '' }] }))}>+ 1kg Special Box</button>
                  <button type="button" className="ap-style-80" onClick={() => setEditProduct(prev => ({ ...prev, weights: [...(prev.weights || []), { label: '2kg Briefcase Box', savings: '(Save Rs 500)' }] }))}>+ 2kg Briefcase Box</button>
                  <button type="button" className="ap-style-81" onClick={() => setEditProduct(prev => ({ ...prev, weights: [...(prev.weights || []), { label: '5kg Family Carton', savings: '(Save Rs 1500)' }] }))}>+ 5kg Family Carton</button>
                </div>
                <div className="ap-weights-manager ap-style-82" >
                  {(editProduct.weights || []).map((w, idx) => (
                    <div key={idx} className="ap-style-83">
                      <input placeholder="e.g. 2kg Box" value={w.label} onChange={e => {
                        setEditProduct(prev => {
                          const newWeights = [...prev.weights];
                          newWeights[idx] = { ...newWeights[idx], label: e.target.value };
                          return { ...prev, weights: newWeights };
                        });
                      }} className="ap-style-84" />
                      <input placeholder="e.g. (Save Rs 500)" value={w.savings} onChange={e => {
                        setEditProduct(prev => {
                          const newWeights = [...prev.weights];
                          newWeights[idx] = { ...newWeights[idx], savings: e.target.value };
                          return { ...prev, weights: newWeights };
                        });
                      }} className="ap-style-85" />
                      <button onClick={() => {
                        setEditProduct(prev => {
                          const newWeights = prev.weights.filter((_, i) => i !== idx);
                          return { ...prev, weights: newWeights };
                        });
                      }} className="ap-style-86">✕</button>
                    </div>
                  ))}
                  <button className="ap-add-weight-btn ap-style-87" onClick={() => {
                    setEditProduct(prev => ({ ...prev, weights: [...(prev.weights || []), { label: '', savings: '' }] }));
                  }} >
                    + Add Weight Option
                  </button>
                </div>

                <label className="ap-stock-label">
                  <input type="checkbox" checked={editProduct.stock} onChange={e => setEditProduct(prev => ({ ...prev, stock: e.target.checked }))} />
                  In Stock
                </label>

                <div className="ap-btns ap-style-88" >
                  <button className="ap-save" onClick={() => saveProduct(editProduct)}>💾 Save Changes</button>
                  <button className="ap-cancel" onClick={() => setEditProduct(null)}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {cropActive && (
        <div className="ap-style-89">
          <div className="ap-style-90">
            <div className="ap-style-91">
              <h3 className="ap-style-92">✂️ Crop Image</h3>
              <button 
                onClick={() => { setCropActive(false); setCropImageSrc(null); setCompletedCrop(null); }}
                className="ap-style-93"
              >✕</button>
            </div>

            <div className="ap-style-94">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={undefined}
                className="ap-style-95"
              >
                <img
                  ref={imgRef}
                  src={cropImageSrc}
                  alt="Crop source"
                  onLoad={onImageLoad}
                  className="ap-style-96"
                  crossOrigin="anonymous"
                  draggable={false}
                />
                {/* Custom edge/side handles */}
                <div className="ap-style-97" />
                <div className="ap-style-98" />
                <div className="ap-style-99" />
                <div className="ap-style-100" />
              </ReactCrop>
            </div>

            <div className="ap-style-101">
              💡 Mouse pointer se image par crop area ke corners ya side center indicators ko drag kar ke select karein.
            </div>

            <div className="ap-style-102">
              <button 
                onClick={executeCrop}
                className="ap-style-103"
              >
                Apply Crop & Save
              </button>
              <button 
                onClick={() => { setCropActive(false); setCropImageSrc(null); setCompletedCrop(null); }}
                className="ap-style-104"
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
