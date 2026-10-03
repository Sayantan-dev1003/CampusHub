import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    regularSubtotal,
    memberSavings,
    user,
    checkoutCart,
    navigate
  } = useApp();

  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [pickupNote, setPickupNote] = useState('');

  if (!isCartOpen) return null;

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    checkoutCart();
    setCheckoutModalOpen(false);
  };

  return (
    <div className="cart-backdrop" onClick={() => setIsCartOpen(false)}>
      <div className="cart-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-header">
          <div className="cart-title-row">
            <ShoppingBag size={20} className="text-sage" />
            <h3 className="cart-title">Your Merchandise Cart</h3>
            <span className="cart-count-pill">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
          </div>
          <button className="cart-close-btn" onClick={() => setIsCartOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Member Discount Notification Strip */}
        <div className="cart-member-strip">
          {user && user.isMember ? (
            <div className="member-banner active-member">
              <Sparkles size={16} />
              <span><strong>Member Pricing Active:</strong> Special discount applied to club gear!</span>
            </div>
          ) : (
            <div className="member-banner guest-member">
              <Sparkles size={16} />
              <div>
                <span><strong>Special Member Discounts:</strong> Members get up to ₹200 off per product.</span>
              </div>
            </div>
          )}
        </div>

        {/* Cart Items List */}
        <div className="cart-items-container">
          {cart.length === 0 ? (
            <div className="cart-empty-state">
              <div className="empty-cart-icon">🌿</div>
              <h4>Your cart is empty</h4>
              <p>Explore our soft pastel hoodies, vintage tees, and campus accessories.</p>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setIsCartOpen(false);
                  navigate(user ? 'member-store' : 'store');
                }}
              >
                Browse Merchandise
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const { product, size, quantity } = item;
              const isMember = user && user.isMember;
              const itemPrice = isMember ? product.memberPrice : product.price;

              return (
                <div key={`${product.id}-${size}`} className="cart-item-card">
                  <img src={product.image} alt={product.name} className="cart-item-img" />
                  <div className="cart-item-info">
                    <div className="cart-item-top">
                      <h4 className="cart-item-name">{product.name}</h4>
                      <button
                        className="item-remove-btn"
                        onClick={() => removeFromCart(product.id, size)}
                        title="Remove Item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="cart-item-meta">
                      <span className="cart-size-badge">Size: {size}</span>
                      <span className="cart-item-price">₹{(itemPrice * quantity).toFixed(2)}</span>
                    </div>

                    <div className="cart-quantity-row">
                      <div className="qty-stepper">
                        <button
                          className="qty-btn"
                          onClick={() => updateCartQuantity(product.id, size, quantity - 1)}
                        >
                          <Minus size={13} />
                        </button>
                        <span className="qty-val">{quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => updateCartQuantity(product.id, size, quantity + 1)}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <span className="unit-price-note">₹{itemPrice.toFixed(2)} each</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer & Checkout Breakdown */}
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cost-breakdown">
              <div className="cost-row">
                <span>Subtotal</span>
                <span>₹{(user && user.isMember ? regularSubtotal : cartSubtotal).toFixed(2)}</span>
              </div>

              {user && user.isMember && memberSavings > 0 && (
                <div className="cost-row member-discount-row">
                  <span>Member Savings</span>
                  <span>-₹{memberSavings.toFixed(2)}</span>
                </div>
              )}

              <div className="cost-row">
                <span>Campus Pickup (Room 304)</span>
                <span className="free-text">FREE</span>
              </div>

              <div className="cost-row total-row">
                <strong>Total Amount</strong>
                <strong className="total-price">₹{cartSubtotal.toFixed(2)}</strong>
              </div>
            </div>

            <button
              className="btn btn-primary btn-lg checkout-btn"
              onClick={() => setCheckoutModalOpen(true)}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={17} />
            </button>
          </div>
        )}

        {/* Checkout Modal Confirmation */}
        {checkoutModalOpen && (
          <div className="checkout-submodal-backdrop" onClick={() => setCheckoutModalOpen(false)}>
            <div className="checkout-submodal glass-card fade-in" onClick={(e) => e.stopPropagation()}>
              <div className="submodal-header">
                <h3>Campus Pickup Order</h3>
                <button className="cart-close-btn" onClick={() => setCheckoutModalOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              <div className="pickup-notice-box">
                <CheckCircle2 size={18} className="text-sage" />
                <span>Pickup available at <strong>Student Center Rm 304</strong> (Mon-Fri 10AM - 4PM)</span>
              </div>

              <form onSubmit={handleCheckoutSubmit} className="checkout-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alice Johnson"
                    defaultValue={user ? user.name : customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Student / Contact Email</label>
                  <input
                    type="email"
                    required
                    placeholder="student@university.edu"
                    defaultValue={user ? user.email : customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Special Instructions or Student ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. STU-001 or preferred pickup day"
                    value={pickupNote}
                    onChange={(e) => setPickupNote(e.target.value)}
                  />
                </div>

                <div className="order-summary-box">
                  <div className="summary-line">
                    <span>Order Total:</span>
                    <strong>₹{cartSubtotal.toFixed(2)}</strong>
                  </div>
                  <span className="pay-method-note">Payment method: UPI / Cash / Student Card on campus pickup</span>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => setCheckoutModalOpen(false)}>
                    Back to Cart
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Confirm Order & Reserve
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .cart-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(19, 42, 30, 0.45);
          backdrop-filter: blur(4px);
          z-index: 2000;
          display: flex;
          justify-content: flex-end;
          animation: fadeIn 0.2s ease-out;
        }

        .cart-panel {
          width: 100%;
          max-width: 440px;
          height: 100%;
          background: #ffffff;
          box-shadow: -10px 0 35px rgba(27, 67, 50, 0.15);
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .cart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-light);
        }

        .cart-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .text-sage {
          color: var(--color-primary);
        }

        .cart-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--color-primary-dark);
        }

        .cart-count-pill {
          background: var(--color-pastel-soft);
          color: var(--color-primary);
          font-size: 0.78rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-full);
        }

        .cart-close-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
        }

        .cart-close-btn:hover {
          background: var(--bg-subtle);
          color: var(--text-primary);
        }

        .cart-member-strip {
          padding: 10px 24px;
          background: #f3faf5;
          border-bottom: 1px solid var(--border-light);
        }

        .member-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.82rem;
        }

        .active-member {
          color: var(--color-primary);
        }

        .guest-member {
          color: #406253;
        }

        .inline-link-btn {
          background: transparent;
          border: none;
          color: var(--color-primary);
          font-weight: 700;
          cursor: pointer;
          text-decoration: underline;
          padding: 0;
        }

        .cart-items-container {
          flex: 1;
          overflow-y: auto;
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .cart-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          color: var(--text-muted);
          gap: 12px;
          padding: 40px 20px;
        }

        .empty-cart-icon {
          font-size: 3rem;
          background: var(--color-pastel-soft);
          width: 72px;
          height: 72px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cart-item-card {
          display: flex;
          gap: 14px;
          padding: 12px;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          background: var(--bg-subtle);
        }

        .cart-item-img {
          width: 76px;
          height: 76px;
          object-fit: cover;
          border-radius: var(--radius-xs);
          background: #ffffff;
        }

        .cart-item-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .cart-item-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
        }

        .cart-item-name {
          font-size: 0.92rem;
          font-weight: 700;
          line-height: 1.25;
          color: var(--text-primary);
        }

        .item-remove-btn {
          background: transparent;
          border: none;
          color: #a45353;
          cursor: pointer;
          padding: 3px;
        }

        .cart-item-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 4px 0;
        }

        .cart-size-badge {
          background: #ffffff;
          border: 1px solid var(--border-light);
          padding: 2px 7px;
          border-radius: 4px;
          font-size: 0.74rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .cart-item-price {
          font-weight: 700;
          color: var(--color-primary-dark);
          font-size: 0.95rem;
        }

        .cart-quantity-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .qty-stepper {
          display: flex;
          align-items: center;
          background: #ffffff;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-xs);
        }

        .qty-btn {
          background: transparent;
          border: none;
          padding: 4px 8px;
          cursor: pointer;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
        }

        .qty-val {
          font-size: 0.84rem;
          font-weight: 700;
          min-width: 22px;
          text-align: center;
        }

        .unit-price-note {
          font-size: 0.74rem;
          color: var(--text-muted);
        }

        .cart-footer {
          border-top: 1px solid var(--border-light);
          padding: 20px 24px;
          background: #ffffff;
        }

        .cost-breakdown {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }

        .cost-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.88rem;
          color: var(--text-secondary);
        }

        .member-discount-row {
          color: var(--color-primary);
          font-weight: 600;
        }

        .free-text {
          color: var(--color-primary);
          font-weight: 700;
        }

        .total-row {
          border-top: 1px dashed var(--border-light);
          padding-top: 10px;
          margin-top: 4px;
          font-size: 1.1rem;
          color: var(--color-primary-dark);
        }

        .total-price {
          font-size: 1.25rem;
          color: var(--color-primary);
        }

        .checkout-btn {
          width: 100%;
        }

        /* Submodal */
        .checkout-submodal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.4);
          z-index: 2100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .checkout-submodal {
          background: #ffffff;
          width: 100%;
          max-width: 440px;
          padding: 24px;
          border-radius: var(--radius-md);
        }

        .submodal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }

        .pickup-notice-box {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--color-pastel-soft);
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          font-size: 0.82rem;
          color: var(--color-primary-dark);
          margin-bottom: 16px;
        }

        .checkout-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .form-group input {
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
          font-size: 0.9rem;
          outline: none;
        }

        .form-group input:focus {
          border-color: var(--color-sage);
        }

        .order-summary-box {
          background: var(--bg-subtle);
          padding: 12px 14px;
          border-radius: var(--radius-sm);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .summary-line {
          display: flex;
          justify-content: space-between;
          font-size: 0.95rem;
        }

        .pay-method-note {
          font-size: 0.74rem;
          color: var(--text-muted);
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
}
