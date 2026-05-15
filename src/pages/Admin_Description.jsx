import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Admin_Description.css';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

function Description_Admin() {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [admin, setAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState('heroes');
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
  const [newProduct, setNewProduct] = useState({ name: '', arabicName: '', price: '', weight: '1kg', rating: 4.5, stock: true, image: '', description: '', discount: '', category: 'dates', storageNote: '', weights: [] });
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
    const [h, p, r, f, d, a, pi] = await Promise.all([
      fetch(`${API}/content/heroes`).then(r => r.json()),
      fetch(`${API}/content/products`).then(r => r.json()),
      fetch(`${API}/content/reviews`).then(r => r.json()),
      fetch(`${API}/content/feature`).then(r => r.json()),
      fetch(`${API}/content/delivery-map`).then(r => r.json()),
      fetch(`${API}/content/about`).then(r => r.json()),
      fetch(`${API}/content/payment-icons`).then(r => r.json()),
    ]);
    setHeroes(h.heroes || []);
    setProducts(p.products || []);
    setReviews(r.reviews || []);
    setFeature(f.feature || null);
    setDeliveryMap(d.deliveryMap || null);
    setAbout(a.about || null);
    setPaymentIcons(pi.icons || []);
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
        price: product.price, 
        discount: product.discount, 
        stock: product.stock, 
        description: product.description, 
        rating: product.rating, 
        image: product.image,
        storageNote: product.storageNote,
        weights: product.weights
      })
    });
    if (res.ok) { setProducts(products.map(p => p.id === product.id ? product : p)); setEditProduct(null); showMsg('✅ Product updated!'); }
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price) return showMsg('⚠️ Name aur Price required hai');
    const res = await fetch(`${API}/content/product`, {
      method: 'POST', headers: authHeaders,
      body: JSON.stringify({ ...newProduct, price: Number(newProduct.price) })
    });
    const data = await res.json();
    if (res.ok) { setProducts([...products, data.product]); setNewProduct({ name: '', arabicName: '', price: '', weight: '1kg', rating: 4.5, stock: true, image: '', description: '', discount: '', category: 'dates', storageNote: '', weights: [] }); setShowAddProduct(false); showMsg('✅ Product added!'); }
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

  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <span key={i} style={{ color: i < Math.floor(rating) ? '#fbbf24' : '#555', fontSize: '18px' }}>★</span>
    ));

  return (
    <div className="da-page">
      <nav className="da-nav">
        <div className="da-nav-left">
          <button className="da-back-btn" onClick={() => navigate('/panel')}>
            ←
          </button>
          <div className="da-nav-divider" />
          <img src="/LOGO.jpeg" alt="Logo" className="da-nav-logo" />
          <span className="da-nav-title">Description Editor</span>
        </div>
        <div className="da-nav-right">
          {admin && <span className="da-admin-name">👤 {admin.name}</span>}
          <button className="da-logout-btn" onClick={() => { localStorage.removeItem('ajwaHub_admin'); localStorage.removeItem('ajwaHub_adminToken'); navigate('/login'); }}>🚪 Logout</button>
        </div>
      </nav>

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
            <div className="da-cards">
              {heroes.map(hero => (
                <div key={hero.key} className="da-card">
                  {editHero?.key === hero.key ? (
                    <div className="da-edit-form">
                      <label>Title</label>
                      <input value={editHero.title} onChange={e => setEditHero({ ...editHero, title: e.target.value })} />
                      <label>Text</label>
                      <textarea rows={4} value={editHero.text} onChange={e => setEditHero({ ...editHero, text: e.target.value })} />
                      <label>Video Path</label>
                      <input value={editHero.video} onChange={e => setEditHero({ ...editHero, video: e.target.value })} />
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
                              const formData = new FormData(); formData.append('file', file);
                              const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
                              const data = await res.json();
                              if (res.ok) updateFeatureImage(i, data.url || data.path);
                            }}
                          />
                        </label>
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
                    <h3>{feature.title}</h3>
                    <p style={{ color: '#cbd5e1', marginBottom: '16px' }}>{feature.description}</p>
                    
                    {feature.images && feature.images.length > 0 && (
                      <div style={{ marginBottom: '16px' }}>
                        <h4 style={{ color: '#fb923c', fontSize: '14px', marginBottom: '8px' }}>Product Images:</h4>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {feature.images.map((img, i) => (
                            <div key={i} style={{ position: 'relative' }}>
                              <img src={img} alt={`P${i+1}`} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px', border: '2px solid rgba(251,146,60,0.3)' }} onError={e => e.target.src='/dates.png'} />
                              <span style={{ position: 'absolute', bottom: '4px', right: '4px', background: 'rgba(0,0,0,0.7)', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>P{i+1}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {feature.features.map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', background: 'rgba(251,146,60,0.1)', borderRadius: '8px' }}>
                          <span style={{ fontSize: '18px' }}>{item.icon}</span>
                          <p style={{ margin: 0, color: '#f1f5f9' }}>{item.text}</p>
                        </div>
                      ))}
                    </div>
                    <div className="da-edit-btn-wrap" style={{ marginTop: '16px' }}>
                      <button className="da-edit-btn" onClick={() => setEditFeature({ ...feature, images: feature.images || [] })}>✏️ Edit</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && !loading && (
          <div className="da-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className="da-section-title" style={{ margin: 0 }}>🛍️ Products ({products.length})</h2>
              <button className="da-save-btn" style={{ width: 'auto', padding: '8px 18px' }} onClick={() => setShowAddProduct(!showAddProduct)}>
                {showAddProduct ? '✕ Cancel' : '➕ Add Product'}
              </button>
            </div>

            {showAddProduct && (
              <div className="da-add-review" style={{ marginBottom: '24px' }}>
                <h3>➕ Add New Product</h3>
                <div className="da-edit-form">
                  <label>Name</label>
                  <input placeholder="Product name" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
                  
                  <label>Arabic Name</label>
                  <input placeholder="عجوة بني" style={{ textAlign: 'right' }} value={newProduct.arabicName} onChange={e => setNewProduct({ ...newProduct, arabicName: e.target.value })} />

                  <label>Price (PKR)</label>
                  <input type="number" placeholder="e.g. 1200" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
                  
                  <label>Storage Note</label>
                  <textarea rows={3} placeholder="Storage advice..." value={newProduct.storageNote} onChange={e => setNewProduct({ ...newProduct, storageNote: e.target.value })} />

                  <label>Weights & Savings</label>
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
                    <button className="da-add-btn" onClick={() => setNewProduct({ ...newProduct, weights: [...(newProduct.weights || []), { label: '', savings: '' }] })}>+ Add Weight Option</button>
                  </div>

                  <label>Rating (1-5)</label>
                  <input type="number" min="1" max="5" step="0.1" value={newProduct.rating} onChange={e => setNewProduct({ ...newProduct, rating: Number(e.target.value) })} />
                  
                  <label>Discount Tag</label>
                  <input placeholder="e.g. 50% OFF" value={newProduct.discount} onChange={e => setNewProduct({ ...newProduct, discount: e.target.value })} />
                  
                  <label>Description</label>
                  <textarea rows={2} placeholder="Product description" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
                  
                  <label>Image URL</label>
                  <input placeholder="e.g. /Product 1.png" value={newProduct.image} onChange={e => setNewProduct({ ...newProduct, image: e.target.value })} />
                  
                  <label className="da-stock-label">
                    <input type="checkbox" checked={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.checked })} /> In Stock
                  </label>
                  
                  <button className="da-save-btn" onClick={addProduct}>➕ Add Product</button>
                </div>
              </div>
            )}

            <div className="da-products-grid">
              {products.map(product => (
                <div key={product.id} className="da-product-card">
                  {editProduct?.id === product.id ? (
                    <div className="da-edit-form">
                      <label>Name</label>
                      <input value={editProduct.name} onChange={e => setEditProduct({ ...editProduct, name: e.target.value })} />
                      <label>Arabic Name</label>
                      <input style={{ textAlign: 'right' }} value={editProduct.arabicName} onChange={e => setEditProduct({ ...editProduct, arabicName: e.target.value })} />
                      <label>Price (PKR)</label>
                      <input type="number" value={editProduct.price} onChange={e => setEditProduct({ ...editProduct, price: Number(e.target.value) })} />
                      <label>Storage Note</label>
                      <textarea rows={3} value={editProduct.storageNote} onChange={e => setEditProduct({ ...editProduct, storageNote: e.target.value })} />
                      
                      <label>Weights & Savings</label>
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
                      <label>Image URL</label>
                      <input placeholder="Image URL" value={editProduct.image} onChange={e => setEditProduct({ ...editProduct, image: e.target.value })} />
                      <div className="da-form-btns">
                        <button className="da-save-btn" onClick={() => saveProduct(editProduct)}>💾 Save</button>
                        <button className="da-cancel-btn" onClick={() => setEditProduct(null)}>Cancel</button>
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
                          const formData = new FormData(); formData.append('file', file);
                          const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
                          const data = await res.json();
                          if (res.ok) setEditDeliveryMap({ ...editDeliveryMap, mapImage: data.url || data.path });
                        }}
                      />
                    </label>
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
                    <p style={{ color: '#94a3b8', marginTop: '12px', fontSize: '14px' }}>🗺️ {deliveryMap.mapImage}</p>
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
            <h2 className="da-section-title">🌱 About Section</h2>
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
                              const formData = new FormData(); formData.append('file', file);
                              const res = await fetch(`${API}/upload`, { method: 'POST', body: formData });
                              const data = await res.json();
                              if (res.ok) {
                                const updated = [...editAbout.images];
                                updated[i] = data.url || data.path;
                                setEditAbout({ ...editAbout, images: updated });
                              }
                            }}
                          />
                        </label>
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
      </div>
    </div>
  );
}

export default Description_Admin;
