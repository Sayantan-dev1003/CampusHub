import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import MemberLayout from './MemberLayout';
import { api } from '../../services/api';

export default function MemberMembershipPage() {
  const { user, addToast, refreshUser } = useApp();
  const [loading, setLoading] = useState(false);
  
  const m = user?.membership;
  const status = m?.status || 'NONE';
  const type = m?.planName || 'None';
  
  // Helper to format dates
  const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '—';
  
  const membershipDetails = {
    status,
    type,
    started: formatDate(m?.startDate),
    expires: formatDate(m?.endDate),
    duesPaid: m?.duesAmount ? `₹${m.duesAmount}` : '—',
    benefits: m?.planName === 'Platinum' ? [
      '15% Ticket Discounts',
      '10% Merchandise Discounts',
      '5 days Renewal Reminder'
    ] : m?.planName === 'Gold' ? [
      '8% Ticket Discounts',
      '5% Merchandise Discounts',
      '10 days Renewal Reminder'
    ] : [
      '5% Ticket Discounts',
      '2% Merchandise Discounts',
      '20 days Renewal Reminder'
    ]
  };

  const isExpiringSoon = false; // Add real logic if needed

  const handleRequest = async (planName) => {
    try {
      setLoading(true);
      await api('/memberships/request', { method: 'POST', body: { planName } });
      await refreshUser();
      addToast('Request Sent', 'Your membership request has been sent for approval.', 'success');
    } catch (err) {
      addToast('Request Failed', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    try {
      setLoading(true);
      await api('/memberships/my/pay', { method: 'POST' });
      await refreshUser();
      addToast('Payment Successful', 'Your membership is now active!', 'success');
    } catch (err) {
      addToast('Payment Failed', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MemberLayout>
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1>My Membership</h1>
          <p>View your membership details, status, and exclusive benefits.</p>
        </header>

        {isExpiringSoon && (
          <div className="renewal-reminder">
            <div className="reminder-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div className="reminder-content">
              <h3>Membership Expiring Soon!</h3>
              <p>Your {membershipDetails.type} membership expires on <strong>{membershipDetails.expires}</strong>. Renew now to avoid losing access to your benefits.</p>
            </div>
            <button className="btn-primary" disabled={loading}>Renew Now</button>
          </div>
        )}

        {!user?.isMember && status === 'NONE' ? (
          <div className="plans-section">
            <h2>Select a Membership Plan</h2>
            <div className="plans-grid">
              {[
                { name: 'Silver', price: '₹4000', features: ['5% Ticket Discounts', '2% Merchandise Discounts', '20 days Renewal Reminder'] },
                { name: 'Gold', price: '₹8000', features: ['8% Ticket Discounts', '5% Merchandise Discounts', '10 days Renewal Reminder'] },
                { name: 'Platinum', price: '₹12000', features: ['15% Ticket Discounts', '10% Merchandise Discounts', '5 days Renewal Reminder'] }
              ].map(plan => (
                <div key={plan.name} className="plan-card">
                  <h3>{plan.name}</h3>
                  <p className="plan-price">{plan.price}</p>
                  <ul className="benefits-list" style={{ marginBottom: '24px', textAlign: 'left' }}>
                    {plan.features.map((feature, i) => (
                      <li key={i}>
                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button className="btn-primary w-100" onClick={() => handleRequest(plan.name)} disabled={loading}>
                    {loading ? 'Requesting...' : 'Select Plan'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="membership-grid">
          {/* Membership Details Card */}
          <section className="dashboard-panel">
            <h2>Membership Details</h2>
            <div className="details-list">
              <div className="detail-row">
                <span className="detail-label">Status</span>
                <span className={`detail-value ${membershipDetails.status === 'ACTIVE' ? 'status-active' : membershipDetails.status === 'PENDING' ? 'status-pending' : membershipDetails.status === 'EXPIRED' ? 'status-expired' : ''}`}>
                  {membershipDetails.status === 'AWAITING_APPROVAL' ? '-' : membershipDetails.status}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Type</span>
                <span className="detail-value">{membershipDetails.type}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Started</span>
                <span className="detail-value">{membershipDetails.started}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Expires</span>
                <span className="detail-value">{membershipDetails.expires}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Dues Paid</span>
                <span className="detail-value">{membershipDetails.duesPaid}</span>
              </div>
            </div>
            
            <div className="panel-actions">
              {membershipDetails.status === 'PENDING' ? (
                <button className="btn-primary w-100" onClick={handlePay} disabled={loading}>
                  {loading ? 'Processing...' : 'Pay Now'}
                </button>
              ) : membershipDetails.status === 'ACTIVE' ? (
                <button className="btn-outline-green w-100" disabled>
                  Membership Active
                </button>
              ) : membershipDetails.status === 'AWAITING_APPROVAL' ? (
                <button className="btn-outline-green w-100" disabled>
                  Waiting for Approval
                </button>
              ) : (
                <button className="btn-outline-green w-100" disabled>
                  No Membership Request Found
                </button>
              )}
            </div>
          </section>

          {/* Benefits Card */}
          <section className="dashboard-panel panel-green">
            <h2>Your Benefits</h2>
            <p className="benefits-subtitle">As a {membershipDetails.type} member, you enjoy the following perks:</p>
            <ul className="benefits-list">
              {membershipDetails.benefits.map((benefit, index) => (
                <li key={index}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  {benefit}
                </li>
              ))}
            </ul>
          </section>
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

        .dashboard-header {
          margin-bottom: 32px;
        }
        .dashboard-header h1 {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 2.2rem;
          color: #1b4332;
          margin-bottom: 8px;
        }
        .dashboard-header p {
          color: #5e8070;
          font-size: 1.05rem;
        }

        /* Renewal Reminder Banner */
        .renewal-reminder {
          background: #fff8e7;
          border: 1px solid #f6e2b3;
          border-radius: 12px;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 32px;
          box-shadow: 0 4px 12px rgba(200, 150, 62, 0.08);
        }

        .reminder-icon {
          color: #c8963e;
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }
        .reminder-icon svg { width: 32px; height: 32px; }

        .reminder-content { flex: 1; }
        .reminder-content h3 {
          color: #8c6014;
          font-size: 1.1rem;
          margin-bottom: 4px;
        }
        .reminder-content p {
          color: #9f7528;
          font-size: 0.95rem;
          margin: 0;
        }
        .reminder-content strong { color: #8c6014; }

        @media (max-width: 768px) {
          .renewal-reminder {
            flex-direction: column;
            align-items: flex-start;
            text-align: left;
            gap: 16px;
          }
        }

        /* Membership Grid */
        .membership-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: start;
        }

        .plans-section {
          margin-top: 32px;
        }

        .plans-section h2 {
          font-family: 'Fraunces', Georgia, serif;
          color: #1b4332;
          margin-bottom: 24px;
          text-align: center;
        }

        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
        }

        .plan-card {
          background: #fff;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 4px 12px rgba(20, 53, 40, 0.04);
          border: 1px solid rgba(45, 106, 79, 0.1);
          text-align: center;
        }

        .plan-card h3 {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 1.5rem;
          color: #1b4332;
          margin-bottom: 16px;
        }

        .plan-price {
          font-size: 2rem;
          color: #2d6a4f;
          font-weight: 700;
          margin-bottom: 24px;
        }

        @media (max-width: 900px) {
          .membership-grid { grid-template-columns: 1fr; }
        }

        .dashboard-panel {
          background: #fff;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 4px 12px rgba(20, 53, 40, 0.04);
          border: 1px solid rgba(45, 106, 79, 0.1);
        }

        .dashboard-panel h2 {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 1.5rem;
          color: #1b4332;
          margin-bottom: 24px;
          border-bottom: 1px solid rgba(45, 106, 79, 0.1);
          padding-bottom: 16px;
        }

        .details-list {
          display: flex;
          flex-direction: column;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 16px 0;
          border-bottom: 1px solid rgba(45, 106, 79, 0.08);
          font-size: 1.05rem;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-label {
          color: #5e8070;
          font-weight: 500;
        }

        .detail-value {
          color: #1b4332;
          font-weight: 700;
        }

        .status-active { color: #2d6a4f; }
        .status-expired { color: #a63a3a; }

        .panel-actions { margin-top: 32px; }

        /* Benefits Panel */
        .panel-green {
          background: #eaf5ed;
          border-color: #b7e4c7;
        }
        
        .benefits-subtitle {
          color: #3b5a4a;
          margin-bottom: 24px;
          font-size: 1rem;
        }

        .benefits-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .benefits-list li {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #1b4332;
          font-size: 1.05rem;
          font-weight: 500;
        }

        .benefits-list svg {
          color: #52b788;
          flex-shrink: 0;
        }

        /* Buttons */
        .btn-primary {
          background: #2d6a4f;
          color: #fff;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
        }
        .btn-primary:hover { background: #1b4332; }

        .btn-outline-green {
          background: transparent;
          color: #2d6a4f;
          border: 2px solid #2d6a4f;
          padding: 14px 24px;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 1.05rem;
        }
        .btn-outline-green:hover {
          background: #2d6a4f;
          color: #fff;
        }

        .w-100 { width: 100%; text-align: center; }
      `}</style>
    </MemberLayout>
  );
}
