import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/AdminPanel.css';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

function Admin_Inventory() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    const adminData = localStorage.getItem('ajwaHub_admin');
    const tok = localStorage.getItem('ajwaHub_adminToken');
    if (!adminData || !tok) { navigate('/login'); return; }

    fetchProducts();
  }, [navigate]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/shop-products`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleUpdate = async (product) => {
    setSavingId(product.id);
    const tok = localStorage.getItem('ajwaHub_adminToken');
    try {
      // Send the updated stock management fields along with existing fields
      const res = await fetch(`${API}/shop-products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tok}`
        },
        body: JSON.stringify(product)
      });
      
      if (res.ok) {
        alert('Stock settings updated successfully! ✅');
      } else {
        alert('Failed to update. ❌');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating. ❌');
    }
    setSavingId(null);
  };

  const handleChange = (id, field, value) => {
    setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  return (
    <div className="dashboard-content" style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      <button onClick={() => navigate('/panel')} className="btn-back" style={{ marginBottom: '20px', padding: '10px 20px', background: '#333', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
        ← Back to Dashboard
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: '#1a1a1a', marginBottom: '10px' }}>Inventory & Auto-Stock Management 📦</h1>
          <p style={{ color: '#666', fontSize: '15px' }}>Configure automatic out-of-stock logic. Set the total stock in Kg and the threshold at which the system will automatically mark the product as Out of Stock.</p>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', fontSize: '18px', color: '#666' }}>Loading products...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {products.map(product => (
            <div key={product.id} style={{
              background: 'white',
              borderRadius: '15px',
              padding: '20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
              border: product.autoStockManagement ? '2px solid #4CAF50' : '2px solid transparent',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                <img src={product.image} alt={product.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '10px', background: '#f5f5f5' }} />
                <div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#333' }}>{product.name}</h3>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '20px', 
                    fontSize: '12px', 
                    fontWeight: 'bold',
                    background: product.stock ? '#E8F5E9' : '#FFEBEE',
                    color: product.stock ? '#2E7D32' : '#C62828'
                  }}>
                    {product.stock ? '🟢 In Stock' : '🔴 Out of Stock'}
                  </span>
                </div>
              </div>

              <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '15px', fontWeight: 'bold', color: '#333' }}>
                  <input 
                    type="checkbox" 
                    checked={product.autoStockManagement || false}
                    onChange={(e) => handleChange(product.id, 'autoStockManagement', e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#4CAF50' }}
                  />
                  Enable Auto-Stock Management
                </label>

                {product.autoStockManagement && (
                  <div style={{ display: 'flex', gap: '15px', animation: 'fadeIn 0.3s ease' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px' }}>Total Stock (Kg)</label>
                      <input 
                        type="number" 
                        value={product.totalStockKg || 0}
                        onChange={(e) => handleChange(product.id, 'totalStockKg', Number(e.target.value))}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px' }}>Un-stock At (Kg)</label>
                      <input 
                        type="number" 
                        value={product.thresholdKg || 0}
                        onChange={(e) => handleChange(product.id, 'thresholdKg', Number(e.target.value))}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={() => handleUpdate(product)}
                disabled={savingId === product.id}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#1a1a1a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  cursor: savingId === product.id ? 'not-allowed' : 'pointer',
                  opacity: savingId === product.id ? 0.7 : 1,
                  transition: 'background 0.2s'
                }}
              >
                {savingId === product.id ? 'Saving...' : '💾 Save Settings'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Admin_Inventory;
