import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Star,
  Plus,
  Minus,
  Truck,
  RotateCcw,
  Tag,
  ArrowRight
} from 'lucide-react';

export default function ProductDetailsPage() {
  const { currentRoute, navigate, products: mockProducts, addToCart, setIsCartOpen, user, addToast } = useApp();
  const productId = currentRoute.params?.id;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('OS');
  const [quantity, setQuantity] = useState(1);

  React.useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch('/api/products/' + productId)
      .then(res => res.json())
      .then(res => {
         if (res.data) {
           setProduct(res.data);
           if (res.data.variants && res.data.variants.length > 0) {
             setSelectedSize(res.data.variants[0].size);
           }
         }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Loading product...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Product not found</h2>
        <button className="btn btn-primary" onClick={() => navigate('store')}>
          Back to Store
        </button>
      </div>
    );
  }

  // Get specific stock for selected size variant
  const currentVariant = product.variants?.find((v) => v.size === selectedSize);
  const sizeStock = currentVariant ? currentVariant.stockQuantity : 0;
  const isSizeOutOfStock = sizeStock <= 0;
  const isSizeLowStock = sizeStock > 0 && sizeStock <= 15;

  const handleSizeChange = (sz) => {
    setSelectedSize(sz);
    setQuantity(1); // reset quantity when switching sizes
  };

  const handleQtyChange = (delta) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= sizeStock) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = () => {
    if (isSizeOutOfStock) {
      addToast('Out of Stock', `Size ${selectedSize} is currently sold out`, 'warning');
      return;
    }
    addToCart(product, selectedSize, quantity);
  };

  const handleBuyNow = () => {
    if (isSizeOutOfStock) {
      addToast('Out of Stock', `Size ${selectedSize} is currently sold out`, 'warning');
      return;
    }
    addToCart(product, selectedSize, quantity);
    setIsCartOpen(true);
  };

  const relatedProducts = products
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="product-details-page fade-in">
      {/* Top Breadcrumb & Back bar */}
      <div className="details-top-bar">
        <div className="container">
          <div className="breadcrumb-strip">
            <button className="back-link-btn" onClick={() => navigate('store')}>
              <ArrowLeft size={16} />
              <span>Back to Merchandise</span>
            </button>
            <div className="breadcrumbs">
              <span onClick={() => navigate('home')}>Home</span>
              <span className="bc-sep">/</span>
              <span onClick={() => navigate('store')}>Store</span>
              <span className="bc-sep">/</span>
              <span className="bc-active">{product.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Product Showcase Section */}
      <div className="container">
        <div className="product-showcase-grid">
          {/* Left Column: Product Image Gallery */}
          <div className="product-visual-col">
            <div className="main-image-display glass-card">
              <img src={product.imageUrl || 'https://via.placeholder.com/400x400/1b4332/ffffff?text=Merchandise'} alt={product.name} className="product-hero-image" />
              {product.badge && (
                <span className="badge badge-mint image-badge">{product.badge}</span>
              )}
            </div>
            <div className="image-thumbnails-strip">
              <div className="thumb-item active-thumb">
                <img src={product.imageUrl || 'https://via.placeholder.com/400x400/1b4332/ffffff?text=Merchandise'} alt="Thumbnail 1" />
              </div>
            </div>
          </div>

          {/* Right Column: Information, Pricing, Size Picker, Stock, Add to Cart */}
          <div className="product-info-col">
            <span className="product-category-tag">{product.category}</span>
            <h1 className="product-title">{product.name}</h1>
            <p className="product-tagline">{product.tagline}</p>

            {/* Rating & Reviews */}
            <div className="rating-row">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} className="star-filled" />
                ))}
              </div>
              <span className="rating-val">{product.rating}</span>
              <span className="reviews-count">({product.reviewsCount} verified student reviews)</span>
            </div>

            {/* Pricing Section with Member Callout */}
            <div className="pricing-container glass-card">
              <div className="pricing-values">
                <div className="standard-price-wrap">
                  <span className="price-label">Public Price</span>
                  <span className="big-price">₹{product.price.toFixed(2)}</span>
                </div>
                {product.memberPrice && product.memberPrice < product.price && (
                  <>
                    <div className="price-v-sep"></div>
                    <div className="member-price-wrap">
                      <div className="member-chip-row">
                        <span className="price-label">Member Price</span>
                        <span className="badge badge-mint">Save ₹{(product.price - product.memberPrice).toFixed(0)}</span>
                      </div>
                      <span className="member-big-price">₹{product.memberPrice.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              {!user?.isMember && product.memberPrice && product.memberPrice < product.price && (
                <div className="member-savings-tip">
                  <Sparkles size={14} className="text-sage" />
                  <span>
                    Enrolled members save ₹{(product.price - product.memberPrice).toFixed(2)} on this product!
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="product-description">{product.description}</p>

            {/* Available Sizes Selector */}
            <div className="size-selector-section">
              <div className="size-header">
                <label className="size-label-title">Available Sizes</label>
                <span className="size-selected-note">Selected: <strong>{selectedSize}</strong></span>
              </div>

              <div className="size-buttons-grid">
                {(product.variants || []).map((variant) => {
                  const sz = variant.size;
                  const isAvailable = variant.stockQuantity > 0;
                  const isSelected = selectedSize === sz;

                  return (
                    <button
                      key={sz}
                      type="button"
                      disabled={!isAvailable}
                      className={`size-btn ${isSelected ? 'selected' : ''} ${!isAvailable ? 'disabled' : ''}`}
                      onClick={() => handleSizeChange(sz)}
                    >
                      <span className="sz-letter">{sz}</span>
                      <span className="sz-stock-hint">
                        {isAvailable ? `${variant.stockQuantity} left` : 'Sold out'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stock Availability Indicator for Selected Size */}
            <div className="stock-status-box">
              <div className="stock-status-indicator">
                <span
                  className={`stock-dot ${
                    isSizeOutOfStock
                      ? 'dot-out'
                      : isSizeLowStock
                      ? 'dot-low'
                      : 'dot-in'
                  }`}
                ></span>
                <span className="stock-status-text">
                  {isSizeOutOfStock ? (
                    <strong className="text-danger">Size {selectedSize} is currently Out of Stock</strong>
                  ) : isSizeLowStock ? (
                    <strong className="text-warning">Low Stock — Only {sizeStock} units remaining in Size {selectedSize}!</strong>
                  ) : (
                    <span>In Stock — {sizeStock} units available for Size {selectedSize}</span>
                  )}
                </span>
              </div>
            </div>

            {/* Quantity Selector and Add to Cart Row */}
            <div className="cart-action-group">
              <div className="qty-picker">
                <button
                  type="button"
                  className="qty-step-btn"
                  onClick={() => handleQtyChange(-1)}
                  disabled={quantity <= 1 || isSizeOutOfStock}
                >
                  <Minus size={15} />
                </button>
                <span className="qty-number">{quantity}</span>
                <button
                  type="button"
                  className="qty-step-btn"
                  onClick={() => handleQtyChange(1)}
                  disabled={quantity >= sizeStock || isSizeOutOfStock}
                >
                  <Plus size={15} />
                </button>
              </div>

              <button
                type="button"
                className="btn btn-primary btn-lg add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={isSizeOutOfStock}
              >
                <ShoppingBag size={18} />
                <span>Add to Cart • ₹{( (user?.isMember ? product.memberPrice : product.price) * quantity ).toFixed(2)}</span>
              </button>
            </div>

            {/* Buy Now / Quick Pickup CTA */}
            <button
              type="button"
              className="btn btn-outline btn-lg quick-pickup-btn"
              onClick={handleBuyNow}
              disabled={isSizeOutOfStock}
            >
              <span>Instant Reserve & Campus Pickup</span>
            </button>

            {/* Service & Pickup Guarantees */}
            <div className="product-perks-list">
              <div className="perk-row">
                <Truck size={17} className="text-sage" />
                <span>Free same-day pickup at Student Center, Room 304</span>
              </div>
              <div className="perk-row">
                <RotateCcw size={17} className="text-sage" />
                <span>14-day hassle-free size exchange on campus</span>
              </div>
              <div className="perk-row">
                <ShieldCheck size={17} className="text-sage" />
                <span>100% Certified Official Skyline Student Association apparel</span>
              </div>
            </div>

            {/* Specifications Details */}
            {product.details && (
              <div className="product-specs-card glass-card">
                <h3>Product Specifications</h3>
                <ul>
                  {product.details.map((detail, idx) => (
                    <li key={idx}>
                      <CheckCircle2 size={14} className="text-sage" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Related Merchandise */}
        <div className="related-merch-section">
          <div className="section-header-row">
            <div>
              <h2 className="section-heading">More Campus Gear</h2>
              <p className="section-subtext">Students also ordered these pastel collection essentials</p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('store')}>
              View All
            </button>
          </div>

          <div className="related-grid">
            {relatedProducts.map((rel) => (
              <div
                key={rel.id}
                className="related-card glass-card"
                onClick={() => navigate('product-details', { id: rel.id })}
              >
                <img src={rel.imageUrl || 'https://via.placeholder.com/400x400/1b4332/ffffff?text=Merchandise'} alt={rel.name} className="rel-img" />
                <div className="rel-info">
                  <h4>{rel.name}</h4>
                  <div className="rel-price-row">
                    <span className="rel-price">₹{rel.price.toFixed(2)}</span>
                    {rel.memberPrice && rel.memberPrice < rel.price && (
                       <span className="rel-member">Member: ₹{rel.memberPrice.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .product-details-page {
          padding-bottom: 80px;
        }

        .details-top-bar {
          background: #ebf5ee;
          border-bottom: 1px solid var(--border-light);
          padding: 14px 0;
          margin-bottom: 36px;
        }

        .breadcrumb-strip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .back-link-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: none;
          color: var(--color-primary);
          font-weight: 700;
          font-size: 0.92rem;
          cursor: pointer;
        }

        .back-link-btn:hover {
          text-decoration: underline;
        }

        .breadcrumbs {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .breadcrumbs span {
          cursor: pointer;
        }

        .breadcrumbs span:hover {
          color: var(--color-primary);
        }

        .bc-sep {
          color: var(--border-light);
          cursor: default !important;
        }

        .bc-active {
          color: var(--text-primary);
          font-weight: 600;
          cursor: default !important;
        }

        .product-showcase-grid {
          display: grid;
          grid-template-columns: 1fr 1.15fr;
          gap: 48px;
          margin-bottom: 60px;
          align-items: flex-start;
        }

        .main-image-display {
          position: relative;
          height: 440px;
          background: #ffffff;
          padding: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .product-hero-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .image-badge {
          position: absolute;
          top: 16px;
          left: 16px;
        }

        .image-thumbnails-strip {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }

        .thumb-item {
          width: 72px;
          height: 72px;
          border-radius: var(--radius-sm);
          border: 2px solid transparent;
          cursor: pointer;
          padding: 4px;
          background: #ffffff;
        }

        .thumb-item.active-thumb {
          border-color: var(--color-primary);
        }

        .thumb-item img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .product-category-tag {
          font-size: 0.76rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-sage);
          font-weight: 700;
          margin-bottom: 6px;
          display: block;
        }

        .product-title {
          font-size: 2.3rem;
          color: var(--color-primary-dark);
          line-height: 1.2;
          margin-bottom: 6px;
        }

        .product-tagline {
          font-size: 1rem;
          color: var(--text-secondary);
          margin-bottom: 12px;
        }

        .rating-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
          font-size: 0.85rem;
        }

        .stars {
          display: flex;
          gap: 2px;
          color: #e9c46a;
        }

        .star-filled {
          fill: #e9c46a;
        }

        .rating-val {
          font-weight: 700;
          color: var(--text-primary);
        }

        .reviews-count {
          color: var(--text-muted);
        }

        .pricing-container {
          background: #ffffff;
          padding: 16px 20px;
          border-radius: var(--radius-md);
          margin-bottom: 20px;
        }

        .pricing-values {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .price-label {
          font-size: 0.74rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--text-muted);
          font-weight: 600;
          display: block;
        }

        .big-price {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .price-v-sep {
          width: 1px;
          height: 36px;
          background: var(--border-light);
        }

        .member-price-wrap {
          display: flex;
          flex-direction: column;
        }

        .member-chip-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .member-big-price {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--color-primary);
        }

        .member-savings-tip {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px dashed var(--border-light);
          font-size: 0.82rem;
          color: var(--color-primary);
          font-weight: 600;
        }

        .product-description {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.65;
          margin-bottom: 24px;
        }

        /* Size Selector */
        .size-selector-section {
          margin-bottom: 20px;
        }

        .size-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .size-label-title {
          font-size: 0.84rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .size-selected-note {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .size-buttons-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .size-btn {
          padding: 8px 16px;
          border: 1.5px solid var(--border-light);
          background: #ffffff;
          border-radius: var(--radius-sm);
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          min-width: 68px;
          transition: all var(--transition-fast);
        }

        .size-btn:hover:not(.disabled) {
          border-color: var(--color-sage);
        }

        .size-btn.selected {
          border-color: var(--color-primary);
          background: #ebf6ee;
        }

        .size-btn.disabled {
          opacity: 0.45;
          cursor: not-allowed;
          background: #f7f7f7;
        }

        .sz-letter {
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--color-primary-dark);
        }

        .sz-stock-hint {
          font-size: 0.68rem;
          color: var(--text-muted);
        }

        /* Stock Status Box */
        .stock-status-box {
          margin-bottom: 24px;
        }

        .stock-status-indicator {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: var(--bg-subtle);
          border-radius: var(--radius-sm);
        }

        .stock-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
        }

        .dot-in {
          background: #2d6a4f;
          box-shadow: 0 0 0 3px rgba(45, 106, 79, 0.2);
        }

        .dot-low {
          background: #b75e18;
          box-shadow: 0 0 0 3px rgba(183, 94, 24, 0.2);
        }

        .dot-out {
          background: #a63a3a;
        }

        .stock-status-text {
          font-size: 0.84rem;
          color: var(--text-secondary);
        }

        .text-danger {
          color: #a63a3a;
        }

        .text-warning {
          color: #b75e18;
        }

        /* Cart actions */
        .cart-action-group {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }

        .qty-picker {
          display: flex;
          align-items: center;
          background: #ffffff;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          padding: 4px;
        }

        .qty-step-btn {
          width: 36px;
          height: 36px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .qty-step-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .qty-number {
          font-size: 1rem;
          font-weight: 700;
          min-width: 32px;
          text-align: center;
        }

        .add-to-cart-btn {
          flex: 1;
        }

        .quick-pickup-btn {
          width: 100%;
          margin-bottom: 24px;
        }

        /* Perks List */
        .product-perks-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 24px;
          padding: 16px 0;
          border-top: 1px solid var(--border-light);
          border-bottom: 1px solid var(--border-light);
        }

        .perk-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        /* Specs */
        .product-specs-card {
          padding: 20px;
          background: #ffffff;
        }

        .product-specs-card h3 {
          font-size: 1.05rem;
          color: var(--color-primary-dark);
          margin-bottom: 12px;
        }

        .product-specs-card ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .product-specs-card li {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.86rem;
          color: var(--text-secondary);
        }

        /* Related Grid */
        .related-merch-section {
          border-top: 1px solid var(--border-light);
          padding-top: 48px;
        }

        .related-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .related-card {
          cursor: pointer;
          padding: 16px;
          background: #ffffff;
          border-radius: var(--radius-md);
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .rel-img {
          width: 80px;
          height: 80px;
          object-fit: contain;
          background: #f7faf8;
          border-radius: var(--radius-sm);
        }

        .rel-info h4 {
          font-size: 0.95rem;
          color: var(--color-primary-dark);
          margin-bottom: 4px;
        }

        .rel-price-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .rel-price {
          font-weight: 700;
          color: var(--text-primary);
        }

        .rel-member {
          font-size: 0.78rem;
          color: var(--color-primary);
          font-weight: 600;
        }

        @media (max-width: 900px) {
          .product-showcase-grid {
            grid-template-columns: 1fr;
          }
          .related-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
