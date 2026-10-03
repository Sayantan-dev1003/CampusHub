import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import MemberLayout from './MemberLayout';

export default function MemberStorePage() {
  const { navigate, addToast, cartCount } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api('/products?limit=100')
      .then(res => setProducts(res.data || []))
      .catch(err => addToast('Error', err.message, 'error'))
      .finally(() => setLoading(false));
  }, [addToast]);

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const [selectedSizes, setSelectedSizes] = useState({});

  const handleSizeSelect = (productId, size) => {
    setSelectedSizes(prev => ({ ...prev, [productId]: size }));
  };

  const { addToCart } = useApp();

  const handleAddToCart = (product) => {
    const size = selectedSizes[product.id];
    const variants = product.variants || [];
    if (variants.length > 1 && !size) {
      addToast('Error', 'Please select a size first.', 'warning');
      return;
    }
    const finalSize = size || (variants.length > 0 ? variants[0].size : 'OS');
    addToCart(product, finalSize, 1);
  };

  return (
    <MemberLayout>
      <div className="dashboard-content">
        <header className="dashboard-header">
          <div className="header-flex">
            <div>
              <h1>Merchandise Store</h1>
              <p>Show your CampusHub pride with our official gear.</p>
            </div>
            <button className="btn-cart" onClick={() => navigate('member-checkout')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              View Cart ({cartCount || 0})
            </button>
          </div>
        </header>

        <section className="store-controls">
          <div className="search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input 
              type="text" 
              placeholder="Search merchandise..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="category-select">
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </section>

        {loading ? (
          <p>Loading products...</p>
        ) : (
          <div className="products-grid">
            {filteredProducts.map(product => {
              const variants = product.variants || [];
              const totalStock = variants.reduce((sum, v) => sum + v.stockQuantity, 0);
              return (
                <div key={product.id} className="product-card" onClick={() => navigate('product-details', { id: product.id })} style={{cursor: 'pointer'}}>
                  <div className="product-image" style={{ backgroundImage: `url(${product.imageUrl || 'https://via.placeholder.com/400x400/1b4332/ffffff?text=Merchandise'})` }}>
                    {totalStock < 10 && totalStock > 0 && <span className="stock-badge low-stock">Low Stock: {totalStock} left</span>}
                    {totalStock === 0 && <span className="stock-badge low-stock" style={{background: '#b71818'}}>Out of stock</span>}
                  </div>
                  <div className="product-details" onClick={(e) => e.stopPropagation()}>
                    <div className="prod-head">
                      <h3>{product.name}</h3>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
                      {(product.variants || []).length > 0 ? (
                        <div className="prod-sizes" style={{ marginBottom: 0 }}>
                          <span className="size-label">Sizes:</span>
                          <div className="size-options">
                            {(product.variants || []).map(v => (
                              <button 
                                key={v.id}
                                className={`size-btn ${selectedSizes[product.id] === v.size ? 'selected' : ''}`}
                                disabled={v.stockQuantity === 0}
                                onClick={() => handleSizeSelect(product.id, v.size)}
                                style={{ opacity: v.stockQuantity === 0 ? 0.5 : 1 }}
                              >
                                {v.size}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : <div />}
                      
                      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
                        <span className="prod-price">₹{product.memberPrice || product.price}</span>
                        {product.memberPrice && product.memberPrice < product.price && (
                           <span style={{textDecoration: 'line-through', color: '#888', fontSize: '0.85rem'}}>₹{product.price}</span>
                        )}
                      </div>
                    </div>
                    
                    <button className="btn-primary w-100" onClick={() => handleAddToCart(product)} disabled={totalStock === 0}>
                      {totalStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .dashboard-content {
          padding: 32px;
          width: 100%;
          box-sizing: border-box;
          max-width: 1400px;
          margin: 0 auto;
        }

        .header-flex {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }
        .header-flex h1 {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 2.2rem;
          color: #1b4332;
          margin: 0 0 8px 0;
        }
        .header-flex p { color: #5e8070; margin: 0; font-size: 1.05rem; }

        .btn-cart {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #2d6a4f;
          color: #fff;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1.05rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-cart:hover { background: #1b4332; }

        .store-controls {
          display: flex;
          gap: 16px;
          margin-bottom: 32px;
        }
        
        .search-box {
          flex: 1;
          display: flex;
          align-items: center;
          background: #fff;
          border: 1px solid #d3e6da;
          border-radius: 12px;
          padding: 0 16px;
          gap: 12px;
        }
        .search-box svg { color: #8aa898; }
        .search-box input {
          flex: 1;
          border: none;
          padding: 14px 0;
          background: transparent;
          font-size: 1rem;
        }
        .search-box input:focus { outline: none; }

        .category-select select {
          height: 100%;
          min-width: 180px;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid #d3e6da;
          background: #fff;
          font-size: 1rem;
          cursor: pointer;
          outline: none;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }

        .product-card {
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(20, 53, 40, 0.04);
          border: 1px solid rgba(45, 106, 79, 0.1);
          transition: transform 0.2s;
        }
        .product-card:hover { transform: translateY(-4px); }

        .product-image {
          height: 240px;
          background-size: cover;
          background-position: center;
          position: relative;
        }
        .stock-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #fff;
        }
        .low-stock { background: #b75e18; }

        .product-details { padding: 24px; }
        .prod-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }
        .prod-head h3 {
          margin: 0;
          font-size: 1.15rem;
          color: #1b4332;
        }
        .prod-price {
          font-size: 1.25rem;
          font-weight: 800;
          color: #2d6a4f;
          font-family: 'Outfit', sans-serif;
        }

        .prod-sizes {
          margin-bottom: 20px;
        }
        .size-label {
          display: block;
          font-size: 0.85rem;
          color: #5e8070;
          margin-bottom: 8px;
        }
        .size-options {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .size-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid #d3e6da;
          background: #fbfefc;
          color: #1b4332;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .size-btn:hover:not(:disabled) { border-color: #52b788; }
        .size-btn.selected {
          background: #2d6a4f;
          color: #fff;
          border-color: #2d6a4f;
        }

        .btn-primary {
          background: #2d6a4f;
          color: #fff;
          border: none;
          padding: 12px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-primary:hover:not(:disabled) { background: #1b4332; }
        .btn-primary:disabled {
          background: #a9b9b0;
          cursor: not-allowed;
        }
        .w-100 { width: 100%; }

        @media (max-width: 600px) {
          .header-flex { flex-direction: column; gap: 16px; }
          .store-controls { flex-direction: column; }
        }
      `}</style>
    </MemberLayout>
  );
}
