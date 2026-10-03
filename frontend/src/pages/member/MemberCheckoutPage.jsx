import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import MemberLayout from './MemberLayout';

export default function MemberCheckoutPage() {
  const { navigate, addToast } = useApp();

  const [cartItems] = useState([
    { id: 1, name: 'CampusHub Hoodie', size: 'M', quantity: 1, price: 799 },
    { id: 2, name: 'Logo Coffee Mug', size: 'Standard', quantity: 1, price: 249 }
  ]);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = Math.round(subtotal * 0.05); // 5% mock tax
  const total = subtotal + tax;

  const [step, setStep] = useState(1); // 1 = Cart, 2 = Checkout, 3 = Confirmation

  const handleCheckout = (e) => {
    e.preventDefault();
    addToast('Success', 'Payment processed successfully.', 'success');
    setStep(3);
  };

  return (
    <MemberLayout>
      <div className="dashboard-content">
        
        {step === 1 && (
          <div className="checkout-step">
            <header className="dashboard-header">
              <button className="btn-back" onClick={() => navigate('store')}>
                ← Back to Store
              </button>
              <h1>Your Cart</h1>
            </header>

            <div className="cart-grid">
              <div className="cart-items dashboard-panel">
                <table className="cart-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Size</th>
                      <th>Quantity</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map(item => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.name}</strong>
                          <div className="item-price">₹{item.price} each</div>
                        </td>
                        <td>{item.size}</td>
                        <td>
                          <div className="qty-controls">
                            <button>-</button>
                            <input type="number" value={item.quantity} readOnly />
                            <button>+</button>
                          </div>
                        </td>
                        <td className="item-total">₹{item.price * item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="cart-summary dashboard-panel">
                <h2>Order Summary</h2>
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="summary-row">
                  <span>Taxes (5%)</span>
                  <span>₹{tax}</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
                <button className="btn-primary w-100" onClick={() => setStep(2)}>Proceed to Checkout</button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="checkout-step">
            <header className="dashboard-header">
              <button className="btn-back" onClick={() => setStep(1)}>
                ← Back to Cart
              </button>
              <h1>Checkout</h1>
            </header>

            <div className="checkout-grid">
              <form className="checkout-form dashboard-panel" onSubmit={handleCheckout}>
                <h2>Shipping / Pickup Details</h2>
                
                <div className="form-group">
                  <label>Delivery Method</label>
                  <select>
                    <option>Pick up at Student Association Office (Free)</option>
                    <option>Deliver to Dormitory Room (+₹50)</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Phone Number (for updates)</label>
                  <input type="tel" required placeholder="Enter your phone number" />
                </div>

                <h2 className="mt-4">Payment Method</h2>
                <div className="form-group">
                  <select>
                    <option>Credit/Debit Card (Visa ending in 1234)</option>
                    <option>UPI</option>
                    <option>Net Banking</option>
                  </select>
                </div>

                <button type="submit" className="btn-primary w-100 mt-4">Confirm & Pay ₹{total}</button>
              </form>

              <div className="cart-summary dashboard-panel">
                <h2>Order Summary</h2>
                <div className="summary-row">
                  <span>{cartItems.length} Items</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="summary-row">
                  <span>Taxes</span>
                  <span>₹{tax}</span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="checkout-step success-step">
            <div className="dashboard-panel text-center success-panel">
              <svg viewBox="0 0 24 24" fill="none" stroke="#2d6a4f" strokeWidth="2" width="64" height="64">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <h1>Order Confirmed!</h1>
              <p>Your order <strong>#ORD1024</strong> has been placed successfully.</p>
              <div className="success-actions">
                <button className="btn-primary" onClick={() => navigate('member-orders')}>View My Orders</button>
                <button className="btn-outline" onClick={() => navigate('store')}>Continue Shopping</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .dashboard-content {
          padding: 32px;
          width: 100%;
          box-sizing: border-box;
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-header { margin-bottom: 24px; }
        .dashboard-header h1 {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 2.2rem;
          color: #1b4332;
          margin-top: 12px;
        }

        .btn-back {
          background: none;
          border: none;
          color: #5e8070;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          padding: 0;
        }
        .btn-back:hover { color: #1b4332; }

        .dashboard-panel {
          background: #fff;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 4px 12px rgba(20, 53, 40, 0.04);
          border: 1px solid rgba(45, 106, 79, 0.1);
        }

        .cart-grid, .checkout-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 32px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .cart-grid, .checkout-grid { grid-template-columns: 1fr; }
        }

        .cart-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .cart-table th {
          padding-bottom: 16px;
          border-bottom: 2px solid #e2ece6;
          color: #5e8070;
          font-weight: 600;
        }
        .cart-table td {
          padding: 24px 0;
          border-bottom: 1px solid #e2ece6;
          vertical-align: middle;
        }
        .cart-table td strong { color: #1b4332; font-size: 1.1rem; }
        .item-price { color: #8aa898; font-size: 0.85rem; margin-top: 4px; }
        .item-total { font-weight: 800; color: #2d6a4f; font-size: 1.1rem; }

        .qty-controls {
          display: inline-flex;
          align-items: center;
          border: 1px solid #d3e6da;
          border-radius: 8px;
          overflow: hidden;
        }
        .qty-controls button {
          background: #f4f8f5;
          border: none;
          width: 32px;
          height: 32px;
          cursor: pointer;
          font-weight: bold;
        }
        .qty-controls input {
          width: 40px;
          height: 32px;
          border: none;
          text-align: center;
          font-weight: 700;
          pointer-events: none;
        }

        .cart-summary h2, .checkout-form h2 {
          font-family: 'Fraunces', serif;
          font-size: 1.4rem;
          color: #1b4332;
          margin-bottom: 24px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
          color: #5e8070;
        }
        .summary-row.total {
          padding-top: 16px;
          border-top: 1px dashed #b7e4c7;
          color: #1b4332;
          font-size: 1.25rem;
          font-weight: 800;
          margin-bottom: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 20px;
        }
        .form-group label {
          font-weight: 600;
          color: #3b5a4a;
          font-size: 0.9rem;
        }
        .form-group input, .form-group select {
          padding: 12px 16px;
          border: 1px solid #d3e6da;
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.95rem;
        }

        .mt-4 { margin-top: 32px; }

        .btn-primary {
          background: #2d6a4f;
          color: #fff;
          border: none;
          padding: 14px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 1.05rem;
        }
        .btn-primary:hover { background: #1b4332; }
        .w-100 { width: 100%; }

        .success-panel {
          max-width: 600px;
          margin: 60px auto;
          text-align: center;
        }
        .success-panel svg { margin-bottom: 20px; }
        .success-panel h1 { color: #2d6a4f; margin-bottom: 12px; }
        .success-panel p { color: #5e8070; font-size: 1.1rem; margin-bottom: 32px; }
        .success-actions {
          display: flex;
          justify-content: center;
          gap: 16px;
        }
        .btn-outline {
          background: transparent;
          border: 2px solid #2d6a4f;
          color: #2d6a4f;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-outline:hover { background: #f4f8f5; }
      `}</style>
    </MemberLayout>
  );
}
