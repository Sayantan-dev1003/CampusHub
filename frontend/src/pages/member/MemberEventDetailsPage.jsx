import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useApi } from '../../admin/useApi';
import { api } from '../../services/api';
import MemberLayout from './MemberLayout';
import { when, whenTime, money } from '../../admin/format';

export default function MemberEventDetailsPage() {
  const { currentRoute, user, addToast, navigate, triggerConfetti } = useApp();
  
  const eventId = currentRoute.params?.id;
  const query = useApi(eventId ? `/events/${eventId}` : null);
  const event = query.data;

  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);

  if (query.loading) {
    return (
      <MemberLayout>
        <div className="dashboard-content">
          <h2>Loading...</h2>
        </div>
      </MemberLayout>
    );
  }

  if (!event) {
    return (
      <MemberLayout>
        <div className="dashboard-content">
          <h2>Event not found</h2>
        </div>
      </MemberLayout>
    );
  }

  const ticketType = event.viewerTicketType === 'MEMBER' ? 'Member' : 'Standard';
  const pricePerTicket = event.viewerPrice;
  const totalPrice = pricePerTicket * quantity;
  const isSoldOut = event.remainingSeats === 0;

  const handlePayment = async () => {
    setBusy(true);
    try {
      // Step 1: Create Order
      const res = await api('/payments/orders', {
        method: 'POST',
        body: { purpose: 'TICKET', eventId: event.id, quantity },
      });
      const orderData = res.data;

      // Step 2: Verify Mock Payment if not already confirmed
      if (!orderData.confirmed) {
        await api('/payments/verify', {
          method: 'POST',
          body: {
            razorpayOrderId: orderData.razorpayOrderId,
            razorpayPaymentId: 'mock_pay_123',
            razorpaySignature: 'mock_signature_123',
          },
        });
      }

      triggerConfetti();
      addToast('Payment Successful!', `Successfully purchased ${quantity} ticket(s) for ${event.title}.`, 'success');
      navigate('member-tickets');
    } catch (err) {
      addToast('Purchase failed', err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <MemberLayout>
      <div className="dashboard-content">
        <button className="btn-back" onClick={() => navigate('member-events')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to Events
        </button>

        <div className="event-details-grid">
          {/* Main Info */}
          <div className="event-main">
            <div className="event-banner">
              <div className="banner-placeholder">
                <h2>{event.title}</h2>
              </div>
            </div>

            <div className="event-body dashboard-panel">
              <div className="event-header">
                <h1>{event.title}</h1>
                <div className="category-badge">{event.category || 'Special Event'}</div>
              </div>
              
              <div className="event-meta">
                <div className="meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span>{whenTime(event.startsAt)}</span>
                </div>
                <div className="meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>{event.venue}</span>
                </div>
              </div>

              <div className="event-description">
                <h3>About This Event</h3>
                <p>{event.description || `Join us for the ${event.title}! This is a placeholder description that provides all the necessary details about the event.`}</p>
              </div>
            </div>
          </div>

          {/* Ticket Purchase Sidebar */}
          <div className="event-sidebar">
            <div className="dashboard-panel purchase-panel">
              <h2>Purchase Tickets</h2>
              
              <div className="seats-info">
                <span className="seats-dot" style={{ background: isSoldOut ? '#e63946' : '#52b788', boxShadow: isSoldOut ? '0 0 0 4px rgba(230, 57, 70, 0.2)' : '0 0 0 4px rgba(82, 183, 136, 0.2)' }}></span>
                <strong style={{ color: isSoldOut ? '#e63946' : 'inherit' }}>{isSoldOut ? 'Sold Out' : `${event.remainingSeats} seats available`}</strong>
              </div>

              <div className="ticket-options">
                <label className="ticket-option selected">
                  <div className="option-radio">
                    <input 
                      type="radio" 
                      name="ticketType" 
                      value="selected" 
                      checked
                      readOnly
                    />
                  </div>
                  <div className="option-details">
                    <span className="option-name">{ticketType} Ticket</span>
                    <span className="option-desc">
                      {event.viewerTicketType === 'MEMBER' ? 'Exclusive pricing for active members.' : 'General admission for non-members.'}
                    </span>
                  </div>
                  <div className="option-price">{money(pricePerTicket)}</div>
                </label>
              </div>

              <div className="quantity-selector">
                <label>Quantity</label>
                <div className="qty-controls">
                  <button disabled={isSoldOut} onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                  <input type="number" value={isSoldOut ? 0 : quantity} readOnly />
                  <button disabled={isSoldOut} onClick={() => setQuantity(Math.min(Math.min(10, event.remainingSeats), quantity + 1))}>+</button>
                </div>
              </div>

              <div className="purchase-summary">
                <div className="summary-row">
                  <span>{isSoldOut ? 0 : quantity} × {ticketType} Ticket</span>
                  <span>{money(isSoldOut ? 0 : totalPrice)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total Amount</span>
                  <span>{money(isSoldOut ? 0 : totalPrice)}</span>
                </div>
              </div>

              <button 
                className="btn-primary btn-pay w-100" 
                onClick={handlePayment} 
                disabled={isSoldOut || busy}
                style={{ opacity: (isSoldOut || busy) ? 0.6 : 1, cursor: (isSoldOut || busy) ? 'not-allowed' : 'pointer', background: isSoldOut ? '#e63946' : '#2d6a4f' }}
              >
                {isSoldOut ? 'Sold Out' : busy ? 'Processing...' : `Pay ${money(totalPrice)} & Generate Ticket`}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-content {
          padding: 32px;
          width: 100%;
          box-sizing: border-box;
          max-width: 1400px;
          margin: 0 auto;
        }

        .btn-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          color: #5e8070;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          margin-bottom: 24px;
          padding: 0;
          transition: color 0.2s;
        }
        .btn-back:hover { color: #1b4332; }

        .event-details-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 32px;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .event-details-grid {
            grid-template-columns: 1fr;
          }
        }

        .dashboard-panel {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(20, 53, 40, 0.04);
          border: 1px solid rgba(45, 106, 79, 0.1);
        }

        /* Banner */
        .event-banner {
          width: 100%;
          height: 300px;
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 24px;
        }
        .banner-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          text-align: center;
        }
        .banner-placeholder h2 {
          color: #fff;
          font-family: 'Fraunces', Georgia, serif;
          font-size: 3rem;
          margin: 0;
          text-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        /* Main Event Body */
        .event-body {
          padding: 32px;
        }
        
        .event-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 24px;
        }
        .event-header h1 {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 2.2rem;
          color: #1b4332;
          margin: 0;
        }
        .category-badge {
          background: #eaf5ed;
          color: #2d6a4f;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 700;
          white-space: nowrap;
        }

        .event-meta {
          display: flex;
          gap: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid #eef5f0;
          margin-bottom: 24px;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #3b5a4a;
          font-size: 1.05rem;
          font-weight: 500;
        }
        .meta-item svg { color: #52b788; width: 20px; height: 20px; }

        .event-description h3 {
          font-size: 1.3rem;
          color: #1b4332;
          margin-bottom: 12px;
        }
        .event-description p {
          color: #5e8070;
          line-height: 1.7;
          font-size: 1.05rem;
        }

        /* Purchase Panel */
        .purchase-panel {
          padding: 24px;
          position: sticky;
          top: 24px;
        }
        .purchase-panel h2 {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 1.5rem;
          color: #1b4332;
          margin-bottom: 20px;
        }

        .seats-info {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fbfefc;
          padding: 12px 16px;
          border-radius: 8px;
          border: 1px solid #d3e6da;
          margin-bottom: 24px;
          color: #3b5a4a;
        }
        .seats-dot {
          width: 10px;
          height: 10px;
          background: #52b788;
          border-radius: 50%;
          box-shadow: 0 0 0 4px rgba(82, 183, 136, 0.2);
        }

        .ticket-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }
        .ticket-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border: 2px solid #e2ece6;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .ticket-option:hover:not(:disabled) {
          border-color: #b7e4c7;
          background: #fbfefc;
        }
        .ticket-option.selected {
          border-color: #2d6a4f;
          background: #f4f8f5;
        }
        .ticket-option input[type="radio"] {
          width: 18px;
          height: 18px;
          accent-color: #2d6a4f;
          cursor: pointer;
        }
        .option-details {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .option-name {
          font-weight: 700;
          color: #1b4332;
          font-size: 1rem;
        }
        .option-desc {
          font-size: 0.8rem;
          color: #5e8070;
        }
        .option-price {
          font-size: 1.25rem;
          font-weight: 800;
          font-family: 'Outfit', sans-serif;
          color: #2d6a4f;
        }

        .quantity-selector {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .quantity-selector label {
          font-weight: 600;
          color: #3b5a4a;
        }
        .qty-controls {
          display: flex;
          align-items: center;
          border: 1px solid #d3e6da;
          border-radius: 8px;
          overflow: hidden;
        }
        .qty-controls button {
          background: #f4f8f5;
          border: none;
          width: 40px;
          height: 40px;
          font-size: 1.2rem;
          color: #1b4332;
          cursor: pointer;
          transition: background 0.2s;
        }
        .qty-controls button:hover { background: #e2ece6; }
        .qty-controls input {
          width: 50px;
          height: 40px;
          border: none;
          text-align: center;
          font-size: 1.1rem;
          font-weight: 700;
          color: #1b4332;
          pointer-events: none;
          background: #fff;
        }

        .purchase-summary {
          background: #f4f8f5;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          color: #5e8070;
          font-size: 0.95rem;
          margin-bottom: 12px;
        }
        .summary-row.total {
          margin-bottom: 0;
          padding-top: 12px;
          border-top: 1px dashed #b7e4c7;
          color: #1b4332;
          font-size: 1.15rem;
          font-weight: 800;
        }

        .btn-primary {
          background: #2d6a4f;
          color: #fff;
          border: none;
          padding: 16px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 1.05rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-primary:hover { background: #1b4332; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(45,106,79,0.2); }
        .w-100 { width: 100%; text-align: center; }
      `}</style>
    </MemberLayout>
  );
}
