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
  const [products, setProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
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
    const [h, p, r] = await Promise.all([
      fetch(`${API}/content/heroes`).then(r => r.json()),
      fetch(`${API}/content/products`).then(r => r.json()),
      fetch(`${API}/content/reviews`).then(r => r.json()),
    ]);
    setHeroes(h.heroes || []);
    setProducts(p.products || []);
    setReviews(r.reviews || []);
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

  const saveProduct = async (product) => {
    const res = await fetch(`${API}/content/product/${product.id}`, {
      method: 'PUT', headers: authHeaders,
      body: JSON.stringify({ name: product.name, price: product.price, discount: product.discount, stock: product.stock, description: product.description, rating: product.rating })
    });
    if (res.ok) { setProducts(products.map(p => p.id === product.id ? product : p)); setEditProduct(null); showMsg('✅ Product updated!'); }
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
          <button className={`da-tab ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>🛍️ Products</button>
          <button className={`da-tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>⭐ Reviews</button>
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
                            <source src={`http://localhost:5173${editHero.video}`} type="video/mp4" />
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
                          <source src={`http://localhost:5173${hero.video}`} type="video/mp4" />
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

        {activeTab === 'products' && !loading && (
          <div className="da-section">
            <h2 className="da-section-title">🛍️ Products ({products.length})</h2>
            <div className="da-products-grid">
              {products.map(product => (
                <div key={product.id} className="da-product-card">
                  {editProduct?.id === product.id ? (
                    <div className="da-edit-form">
                      <label>Name</label>
                      <input value={editProduct.name} onChange={e => setEditProduct({ ...editProduct, name: e.target.value })} />
                      <label>Price (PKR)</label>
                      <input type="number" value={editProduct.price} onChange={e => setEditProduct({ ...editProduct, price: Number(e.target.value) })} />
                      <label>Rating (1 - 5)</label>
                      <input type="number" min="1" max="5" step="0.1" value={editProduct.rating} onChange={e => setEditProduct({ ...editProduct, rating: Number(e.target.value) })} />
                      <label>Discount Tag</label>
                      <input value={editProduct.discount} onChange={e => setEditProduct({ ...editProduct, discount: e.target.value })} />
                      <label>Description</label>
                      <textarea rows={3} value={editProduct.description} onChange={e => setEditProduct({ ...editProduct, description: e.target.value })} />
                      <label className="da-stock-label">
                        <input type="checkbox" checked={editProduct.stock} onChange={e => setEditProduct({ ...editProduct, stock: e.target.checked })} />
                        In Stock
                      </label>
                      <div className="da-form-btns">
                        <button className="da-save-btn" onClick={() => saveProduct(editProduct)}>💾 Save</button>
                        <button className="da-cancel-btn" onClick={() => setEditProduct(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="da-card-view">
                      <div className="da-product-img-wrap">
                        <img
                          src={`http://localhost:5173${product.image}`}
                          alt={product.name}
                          className="da-product-img"
                          onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x130/1f2937/9ca3af?text=No+Image'; }}
                        />
                      </div>
                      <h4>{product.name}</h4>
                      <div className="da-product-meta">
                        <span className="da-price">PKR {product.price}</span>
                        <span className="da-discount">{product.discount}</span>
                        <span className={`da-stock ${product.stock ? 'in' : 'out'}`}>{product.stock ? '✅ In Stock' : '❌ Out of Stock'}</span>
                      </div>
                      <div className="da-rating-row">{renderStars(product.rating)} <span className="da-rating-val">({product.rating})</span></div>
                      <button className="da-edit-btn" onClick={() => setEditProduct({ ...product })}>✏️ Edit</button>
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
      </div>
    </div>
  );
}

export default Description_Admin;
