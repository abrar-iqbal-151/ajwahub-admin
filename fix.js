const fs = require('fs');

let code = fs.readFileSync('src/pages/Admin_Premium.jsx', 'utf8');

// The replacement for the Add/Edit Modal
const newModal = `          {(showForm || editId) && (
            <div className="ap-modal-overlay">
              <div className="ap-modal-container" style={{ maxWidth: '900px' }}>
                <div className="ap-modal-header">
                  <h3>{editId ? '✏️ Edit Premium Product' : '➕ Add Premium Product'}</h3>
                  <button className="ap-modal-close" onClick={() => { setShowForm(false); setEditId(null); setForm(empty); }}>✕</button>
                </div>
                <div className="ap-edit-flex" style={{ display: 'flex', gap: '24px', padding: '20px', flexWrap: 'wrap' }}>
                  <div className="ap-edit-left" style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ position: 'relative', background: '#fdfaf3', borderRadius: '24px', height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(197, 160, 89, 0.2)', overflow: 'hidden', padding: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at center, rgba(197, 160, 89, 0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
                      {form.image ? (
                        <img src={form.image} alt="preview" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', filter: 'drop-shadow(0 15px 25px rgba(0, 0, 0, 0.15))', position: 'relative', zIndex: 1 }} />
                      ) : (
                        <div style={{ color: '#ccc', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                          <span style={{ fontSize: '48px' }}>🖼️</span>
                          <p style={{ color: '#94a3b8' }}>No image selected</p>
                        </div>
                      )}
                      <div style={{ position: 'absolute', bottom: '10px', right: '10px', zIndex: 10 }}>
                        <label className="ap-upload-label" style={{ background: 'rgba(255,255,255,0.9)', margin: 0, padding: '8px 12px', fontSize: '12px', cursor: 'pointer', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          📤 Upload Image
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) uploadImage(e.target.files[0]); }} />
                        </label>
                      </div>
                    </div>
                    <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '-10px' }}>Image URL</label>
                    <input style={{ background: '#ffffff', border: '1px solid #e2e8f0', color: '#1e293b', padding: '10px', borderRadius: '8px' }} value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} placeholder="Image URL" />
                  </div>

                  <div className="ap-edit-right" style={{ flex: '1.2', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Name</label>
                        <input style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Product name" />
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Weight</label>
                        <input style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} placeholder="e.g. 500g" />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Price (PKR)</label>
                        <input type="number" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="e.g. 2500" />
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Original Price</label>
                        <input type="number" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} value={form.originalPrice} onChange={e => setForm(p => ({ ...p, originalPrice: e.target.value }))} placeholder="e.g. 3000" />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Badge</label>
                        <input style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} value={form.badge} onChange={e => setForm(p => ({ ...p, badge: e.target.value }))} placeholder="e.g. Premium" />
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Rating (1-5)</label>
                        <input type="number" min="1" max="5" step="0.1" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }} value={form.rating} onChange={e => setForm(p => ({ ...p, rating: Number(e.target.value) }))} />
                      </div>
                    </div>

                    <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', marginTop: '5px' }}>Category</label>
                    <select style={{ background: '#ffffff', border: '1px solid #e2e8f0', color: '#1e293b', padding: '10px', borderRadius: '8px', width: '100%' }} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                      <option value="dates">Dates</option>
                      <option value="dry">Dry Fruits</option>
                    </select>

                    <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', marginTop: '5px' }}>Description</label>
                    <textarea rows={3} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', resize: 'vertical' }} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Premium product description..." />

                    <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                      <label className="ap-stock-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', padding: 0 }}>
                        <input type="checkbox" checked={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.checked }))} style={{ width: '18px', height: '18px', cursor: 'pointer' }} /> In Stock
                      </label>
                      <label className="ap-stock-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: '#d97706', padding: 0 }}>
                        <input type="checkbox" checked={form.featured} onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))} style={{ width: '18px', height: '18px', cursor: 'pointer' }} /> ⭐ Featured
                      </label>
                    </div>

                    <div className="ap-btns" style={{ marginTop: 'auto', paddingTop: '15px' }}>
                      <button className="ap-save" onClick={handleSave} style={{ flex: 2, padding: '12px', background: 'linear-gradient(135deg, #c5a059, #b08d4f)' }}>{editId ? '💾 Save Changes' : '➕ Create Product'}</button>
                      <button className="ap-cancel" onClick={() => { setShowForm(false); setEditId(null); setForm(empty); }} style={{ flex: 1, padding: '12px' }}>Cancel</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}`;

const newCard = `                  <div className="ap-view">
                    <img src={p.image} alt={p.name} className="ap-img" onError={e => e.target.style.display='none'} />
                    {p.featured && <span style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 700, position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.7)', padding: '4px 8px', borderRadius: '4px' }}>⭐ Featured</span>}
                    <h4>{p.name}</h4>
                    <div className="ap-meta">
                      <span className="ap-price">PKR {p.price?.toLocaleString()}</span>
                      {p.originalPrice > p.price && <span style={{ color: '#4ade80', fontSize: '11px' }}>Save PKR {(p.originalPrice - p.price).toLocaleString()}</span>}
                      <span className={\`ap-stock \${p.stock ? 'in' : 'out'}\`}>{p.stock ? '✅ In Stock' : '❌ Out of Stock'}</span>
                    </div>
                    <div className="ap-rating">{[...Array(5)].map((_, i) => <span key={i} style={{ color: i < Math.floor(p.rating) ? '#fbbf24' : '#555', fontSize: '14px' }}>★</span>)} <span>({p.rating})</span></div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                      <button className="ap-edit-btn" style={{ flex: 1 }} onClick={() => { setEditId(p._id); setShowForm(true); setForm({ name: p.name, description: p.description, price: p.price, originalPrice: p.originalPrice, image: p.image, category: p.category, badge: p.badge, stock: p.stock, rating: p.rating, weight: p.weight, featured: p.featured }); }}>✏️ Edit</button>
                      <button className="ap-cancel" style={{ flex: 1, color: '#dc2626', background: '#fee2e2', border: '1px solid rgba(220, 38, 38, 0.2)', fontWeight: 'bold' }} onClick={() => handleDelete(p._id)}>🗑️ Remove</button>
                    </div>
                  </div>`;

const newMap = \`{filtered.map(p => (
                <div key={p._id} className="ap-card">
\` + newCard + \`
                </div>
              ))}\`;

// Regex replacement
const addFormRegex = /\\{\\s*showForm\\s*&&\\s*\\([\\s\\S]*?(?:<\\/div>\\s*<\\/div>\\s*<\\/div>\\s*\\)\\s*\\})\\s*(?=\\{loading \\?)/;
code = code.replace(addFormRegex, newModal + '\\n\\n');

const mapRegex = /\\{\\s*filtered\\.map\\(p => \\([\\s\\S]*?\\}\\s*\\)\\s*\\}/;
code = code.replace(mapRegex, newMap);

fs.writeFileSync('src/pages/Admin_Premium.jsx', code);
console.log('Update Complete');
