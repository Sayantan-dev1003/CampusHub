import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import MemberLayout from './MemberLayout';

export default function MemberOrdersPage() {
  const { navigate } = useApp();

  const [orders] = useState([
    {
      id: 'ORD1024',
      date: 'Oct 02, 2026',
      items: 2,
      total: 1048,
      status: 'Processing',
      products: ['CampusHub Hoodie (M)', 'Logo Coffee Mug (Standard)']
    },
    {
      id: 'ORD0987',
      date: 'Sep 15, 2026',
      items: 1,
      total: 399,
      status: 'Completed',
      products: ['Student Association Tee (L)']
    }
  ]);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Processing': return 'badge-processing';
      case 'Ready': return 'badge-ready';
      case 'Completed': return 'badge-completed';
      default: return 'badge-pending';
    }
  };

  return (
    <MemberLayout>
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1>My Orders</h1>
          <p>Track the status of your merchandise orders.</p>
        </header>

        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card dashboard-panel">
              <div className="order-header">
                <div className="order-info">
                  <h3>Order #{order.id}</h3>
                  <span className="order-date">{order.date}</span>
                </div>
                <div className={`status-badge ${getStatusBadge(order.status)}`}>
                  {order.status}
                </div>
              </div>
              
              <div className="order-body">
                <div className="order-details">
                  <div className="detail-item">
                    <span className="label">Total Amount</span>
                    <span className="value">₹{order.total}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Items ({order.items})</span>
                    <ul className="product-list">
                      {order.products.map((prod, idx) => (
                        <li key={idx}>{prod}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="order-actions">
                  <button className="btn-outline" onClick={() => {}}>View Invoice</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .dashboard-content {
          padding: 32px;
          width: 100%;
          box-sizing: border-box;
          max-width: 900px;
          margin: 0 auto;
        }

        .dashboard-header { margin-bottom: 32px; }
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

        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .dashboard-panel {
          background: #fff;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 4px 12px rgba(20, 53, 40, 0.04);
          border: 1px solid rgba(45, 106, 79, 0.1);
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eef5f0;
        }
        .order-info h3 {
          margin: 0 0 4px 0;
          color: #1b4332;
          font-size: 1.25rem;
        }
        .order-date {
          color: #8aa898;
          font-size: 0.9rem;
        }

        .status-badge {
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .badge-processing { background: #fff8e7; color: #b75e18; }
        .badge-completed { background: #eaf5ed; color: #2d6a4f; }
        .badge-pending { background: #f4f8f5; color: #5e8070; }

        .order-body {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        @media (max-width: 600px) {
          .order-body { flex-direction: column; align-items: flex-start; gap: 24px; }
        }

        .order-details {
          display: flex;
          gap: 48px;
        }
        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .detail-item .label {
          color: #5e8070;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
        }
        .detail-item .value {
          color: #1b4332;
          font-size: 1.5rem;
          font-weight: 800;
          font-family: 'Outfit', sans-serif;
        }
        
        .product-list {
          list-style: none;
          padding: 0;
          margin: 0;
          color: #3b5a4a;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .btn-outline {
          background: transparent;
          border: 2px solid #e2ece6;
          color: #3b5a4a;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-outline:hover {
          border-color: #2d6a4f;
          color: #2d6a4f;
        }
      `}</style>
    </MemberLayout>
  );
}
