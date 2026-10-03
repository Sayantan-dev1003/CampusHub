import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import MemberLayout from './MemberLayout';

export default function MemberCheckoutPage() {
  const { navigate, addToast, cart, updateCartQuantity, clearCart, user } = useApp();

  const subtotal = cart.reduce((acc, item) => {
    const isMember = user && user.isMember;
    const price = isMember ? (item.product.memberPrice || item.product.price) : item.product.price;
    return acc + (price * item.quantity);
  }, 0);
  
  const [step, setStep] = useState(1); // 1 = Cart, 2 = Checkout, 3 = Confirmation
  const [fulfillment, setFulfillment] = useState('PICKUP');
  const deliveryFee = fulfillment === 'DELIVERY' ? 50 : 0;
  const total = subtotal + deliveryFee;
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    setIsProcessing(true);
    try {
      const items = cart.map(item => {
        const variants = item.product.variants || [];
        const variant = variants.find(v => v.size === item.size);
        return { variantId: variant?.id, quantity: item.quantity };
      }).filter(item => item.variantId);

      const res = await api('/payments/orders', {
        method: 'POST',
        body: {
          purpose: 'ORDER',
          items,
          fulfillment
        }
      });
      
      // If payment is required (not free) and Razorpay is configured, we'd open Razorpay popup here.
      // For free orders or mock mode, it returns confirmed directly.
      if (!res.data.confirmed) {
        await api('/payments/verify', {
          method: 'POST',
          body: {
            razorpayOrderId: res.data.razorpayOrderId,
            razorpayPaymentId: 'mock_pay_123',
            razorpaySignature: 'mock_sig_123',
          },
        });
      }

      addToast('Success', 'Order placed successfully.', 'success');
      setOrderId(res.data.referenceId || res.data.order?.id || 'ORD-' + Math.floor(Math.random() * 10000));
      clearCart();
      setStep(3);
    } catch (err) {
      addToast('Error', err.message || 'Checkout failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const getPrice = (item) => {
    const isMember = user && user.isMember;
    return isMember ? (item.product.memberPrice || item.product.price) : item.product.price;
  };

  return (
    <MemberLayout>
      <div className="dashboard-content">
        
        {step === 1 && (
          <div className="checkout-step">
            <header className="dashboard-header">
              <button className="btn-back" onClick={() => navigate('member-store')}>
                ← Back to Store
              </button>
              <h1>Your Cart</h1>
            </header>

            {cart.length === 0 ? (
              <div className="dashboard-panel text-center" style={{padding: '60px 20px'}}>
                <h2>Your cart is empty</h2>
                <p style={{color: '#5e8070', marginBottom: 24}}>Looks like you haven't added any merchandise to your cart yet.</p>
                <button className="btn-primary" onClick={() => navigate('member-store')}>Browse Store</button>
              </div>
            ) : (
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
                      {cart.map((item, idx) => (
                        <tr key={idx}>
                          <td>
                            <strong>{item.product.name}</strong>
                            <div className="item-price">₹{getPrice(item)} each</div>
                          </td>
                          <td>{item.size}</td>
                          <td>
                            <div className="qty-controls">
                              <button onClick={() => updateCartQuantity(item.product.id, item.size, item.quantity - 1)}>-</button>
                              <input type="number" value={item.quantity} readOnly />
                              <button onClick={() => updateCartQuantity(item.product.id, item.size, item.quantity + 1)}>+</button>
                            </div>
                          </td>
                          <td className="item-total">₹{getPrice(item) * item.quantity}</td>
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
                  {fulfillment === 'DELIVERY' && (
                    <div className="summary-row">
                      <span>Delivery Fee</span>
                      <span>₹50</span>
                    </div>
                  )}
                  <div className="summary-row total">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                  <button className="btn-primary w-100" onClick={() => setStep(2)}>Proceed to Checkout</button>
                </div>
              </div>
            )}
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
                  <select value={fulfillment} onChange={(e) => setFulfillment(e.target.value)}>
                    <option value="PICKUP">Pick up at Student Association Office (Free)</option>
                    <option value="DELIVERY">Deliver to Dormitory Room (+₹50)</option>
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

                <button type="submit" className="btn-primary w-100 mt-4" disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : `Confirm & Pay ₹${total}`}
                </button>
              </form>

              <div className="cart-summary dashboard-panel">
                <h2>Order Summary</h2>
                <div className="summary-row">
                  <span>{cart.reduce((sum, item) => sum + item.quantity, 0)} Items</span>
                  <span>₹{subtotal}</span>
                </div>
                {fulfillment === 'DELIVERY' && (
                  <div className="summary-row">
                    <span>Delivery Fee</span>
                    <span>₹50</span>
                  </div>
                )}
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
              <p>Your order <strong>#{orderId}</strong> has been placed successfully.</p>
              <div className="success-actions">
                <button className="btn-primary" onClick={() => navigate('member-orders')}>View My Orders</button>
                <button className="btn-outline" onClick={() => navigate('member-store')}>Continue Shopping</button>
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
        .btn-primary:hover:not(:disabled) { background: #1b4332; }
        .btn-primary:disabled { background: #8aa898; cursor: not-allowed; }
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
