import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShoppingBag,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  Tag,
  ShieldCheck,
  Star,
  Check
} from 'lucide-react';

export default function StorePage() {
  const { products, navigate, user } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  const categories = ['All', 'Hoodies & Sweats', 'T-Shirts', 'Bags & Accessories', 'Accessories'];

  const filteredProducts = products
    .filter((prod) => {
      const matchesCategory = selectedCategory === 'All' || prod.category === selectedCategory;
      const matchesSearch =
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // default featured
    });

  return (
    <div className="store-page fade-in">
      {/* Store Header Banner */}
      <section className="store-header-banner">
        <div className="container">
          <div className="store-header-content">
            <span className="badge badge-mint banner-pill">Official Apparel & Gear</span>
            <h1 className="store-title">CampusHub Merchandise Store</h1>
            <p className="store-subtitle">
              Sustainably crafted collegiate hoodies, heavyweight organic t-shirts, and campus accessories in signature pastel sage and mint palettes.
            </p>
          </div>
        </div>
      </section>

      {/* Controls & Filter Strip */}
      <section className="store-controls-section">
        <div className="container">
          <div className="controls-card glass-card">
            {/* Search */}
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search hoodies, t-shirts, totes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                  &times;
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="category-filter-pills">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`filter-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="sort-dropdown-wrap">
              <label>Sort By:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
                <option value="featured">Featured Drops</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog */}
      <section className="store-catalog-section">
        <div className="container">
          {/* Member 15% Discount Banner */}
          <div className="member-perk-banner glass-card">
            <div className="perk-banner-left">
              <Sparkles size={20} className="text-sage" />
              <div>
                <strong>Skyline Member Privilege: Special Discounts on All Merchandise</strong>
                <p>Members save up to ₹200 per item automatically applied to orders.</p>
              </div>
            </div>
            {!user?.isMember && (
              <button className="btn btn-outline btn-sm" onClick={() => navigate('login')}>
                <span>Member Login &rarr;</span>
              </button>
            )}
          </div>

          <div className="results-count-row">
            <span>Showing <strong>{filteredProducts.length}</strong> official campus products</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="empty-results glass-card">
              <h3>No products found</h3>
              <p>Try clearing your search query or choosing another category.</p>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
              >
                Reset Store Filters
              </button>
            </div>
          ) : (
            <div className="store-grid">
              {filteredProducts.map((prod) => {
                const totalStock = prod.variants.reduce((sum, v) => sum + v.quantity, 0);
                const isOutOfStock = totalStock === 0;
                const isLowStock = totalStock > 0 && totalStock <= 25;

                return (
                  <div
                    key={prod.id}
                    className="store-card glass-card"
                    onClick={() => navigate('product-details', { id: prod.id })}
                  >
                    {/* 1. Product Image */}
                    <div className="store-card-media">
                      <img src={prod.image} alt={prod.name} className="store-product-img" />
                      {prod.badge && (
                        <span className="product-top-badge">{prod.badge}</span>
                      )}
                      {/* Stock Indicator Badge */}
                      <span
                        className={`stock-indicator-badge ${
                          isOutOfStock
                            ? 'badge-outstock'
                            : isLowStock
                            ? 'badge-lowstock'
                            : 'badge-instock'
                        }`}
                      >
                        {isOutOfStock
                          ? 'Out of Stock'
                          : isLowStock
                          ? `Low Stock (${totalStock} left)`
                          : `In Stock (${totalStock})`}
                      </span>
                    </div>

                    <div className="store-card-body">
                      <span className="store-category-label">{prod.category}</span>

                      {/* 2. Product Name */}
                      <h3 className="store-product-title">{prod.name}</h3>

                      {/* 3. Price & Member Price */}
                      <div className="store-pricing-row">
                        <div className="price-tag-wrap">
                          <span className="store-main-price">₹{prod.price.toFixed(2)}</span>
                          <span className="store-member-price">
                            Member: ₹{prod.memberPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* 4. Available Sizes */}
                      <div className="store-sizes-container">
                        <span className="sizes-title">Available Sizes:</span>
                        <div className="sizes-chip-list">
                          {prod.sizes.map((sz) => (
                            <span key={sz} className="store-size-chip">
                              {sz}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* 5. View Product Button */}
                      <div className="store-card-actions">
                        <button
                          className="btn btn-secondary btn-sm view-product-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('product-details', { id: prod.id });
                          }}
                        >
                          <span>View Product</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <style>{`
        .store-page {
          padding-bottom: 80px;
        }

        .store-header-banner {
          background: linear-gradient(135deg, #eaf5ee 0%, #f4f8f5 100%);
          padding: 56px 0 36px;
          border-bottom: 1px solid var(--border-light);
        }

        .store-header-content {
          max-width: 680px;
        }

        .banner-pill {
          margin-bottom: 12px;
        }

        .store-title {
          font-size: 2.6rem;
          color: var(--color-primary-dark);
          line-height: 1.15;
          margin-bottom: 12px;
        }

        .store-subtitle {
          font-size: 1.05rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .store-controls-section {
          margin-top: -24px;
          margin-bottom: 32px;
        }

        .controls-card {
          padding: 16px 20px;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--bg-subtle);
          border: 1px solid var(--border-light);
          padding: 8px 14px;
          border-radius: var(--radius-sm);
          flex: 1;
          min-width: 250px;
        }

        .search-icon {
          color: var(--color-sage);
        }

        .search-input {
          border: none;
          background: transparent;
          width: 100%;
          outline: none;
          font-size: 0.92rem;
          color: var(--text-primary);
        }

        .clear-search-btn {
          background: transparent;
          border: none;
          font-size: 1.2rem;
          color: var(--text-muted);
          cursor: pointer;
        }

        .category-filter-pills {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .filter-pill-btn {
          background: var(--bg-subtle);
          border: 1px solid var(--border-light);
          color: var(--text-secondary);
          font-size: 0.84rem;
          font-weight: 600;
          padding: 8px 14px;
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .filter-pill-btn:hover {
          background: var(--color-pastel-soft);
          color: var(--color-primary);
        }

        .filter-pill-btn.active {
          background: var(--color-primary);
          color: #ffffff;
          border-color: var(--color-primary);
        }

        .sort-dropdown-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.84rem;
          color: var(--text-secondary);
        }

        .sort-select {
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
          background: var(--bg-subtle);
          font-size: 0.84rem;
          outline: none;
        }

        .member-perk-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background: #ebf6ee;
          border: 1px solid var(--border-accent);
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .perk-banner-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .perk-banner-left strong {
          color: var(--color-primary-dark);
          font-size: 0.95rem;
          display: block;
        }

        .perk-banner-left p {
          color: var(--text-secondary);
          font-size: 0.85rem;
          margin: 0;
        }

        .results-count-row {
          font-size: 0.88rem;
          color: var(--text-muted);
          margin-bottom: 20px;
        }

        /* Store Grid */
        .store-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 26px;
        }

        .store-card {
          cursor: pointer;
          overflow: hidden;
          background: #ffffff;
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
        }

        .store-card-media {
          position: relative;
          height: 250px;
          background: #f7faf8;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .store-product-img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          transition: transform var(--transition-smooth);
        }

        .store-card:hover .store-product-img {
          transform: scale(1.06);
        }

        .product-top-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: var(--color-primary-dark);
          color: white;
          padding: 3px 8px;
          border-radius: var(--radius-full);
          font-size: 0.72rem;
          font-weight: 700;
        }

        .stock-indicator-badge {
          position: absolute;
          bottom: 12px;
          right: 12px;
          padding: 4px 9px;
          border-radius: var(--radius-full);
          font-size: 0.72rem;
          font-weight: 700;
        }

        .store-card-body {
          padding: 18px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .store-category-label {
          font-size: 0.72rem;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: 700;
          letter-spacing: 0.04em;
          margin-bottom: 4px;
        }

        .store-product-title {
          font-size: 1.05rem;
          color: var(--color-primary-dark);
          margin-bottom: 10px;
          line-height: 1.3;
        }

        .store-pricing-row {
          margin-bottom: 12px;
        }

        .price-tag-wrap {
          display: flex;
          align-items: baseline;
          gap: 8px;
          flex-wrap: wrap;
        }

        .store-main-price {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--color-primary-dark);
        }

        .store-member-price {
          font-size: 0.82rem;
          color: var(--color-primary);
          background: #ebf6ee;
          padding: 2px 7px;
          border-radius: 4px;
          font-weight: 700;
        }

        .store-sizes-container {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          color: var(--text-muted);
          margin-bottom: 16px;
        }

        .sizes-chip-list {
          display: flex;
          gap: 4px;
        }

        .store-size-chip {
          background: #f0f4f1;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.74rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .store-card-actions {
          margin-top: auto;
        }

        .view-product-btn {
          width: 100%;
        }

        @media (max-width: 1100px) {
          .store-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 780px) {
          .store-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 520px) {
          .store-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
