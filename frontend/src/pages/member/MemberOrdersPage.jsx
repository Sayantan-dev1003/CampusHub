import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import MemberLayout from './MemberLayout';

export default function MemberOrdersPage() {
  const { navigate, addToast } = useApp();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api('/orders/my')
      .then(res => setOrders(res.data || []))
      .catch(err => addToast('Error', err.message, 'error'))
      .finally(() => setLoading(false));
  }, [addToast]);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'PENDING': return 'badge-pending';
      case 'PAID':
      case 'PROCESSING': return 'badge-processing';
      case 'READY': return 'badge-ready';
      case 'COMPLETED': return 'badge-completed';
      default: return 'badge-pending';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'PENDING': return 'Pending Payment';
      case 'PAID': return 'Paid (Processing)';
      case 'PROCESSING': return 'Processing';
      case 'READY': return 'Ready for Pickup';
      case 'COMPLETED': return 'Completed';
      default: return status;
    }
  };

  return (
    <MemberLayout>
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1>My Orders</h1>
          <p>Track the status of your merchandise orders.</p>
        </header>

        {loading ? (
          <div className="dashboard-panel text-center">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="dashboard-panel text-center">
            <h3>No orders found</h3>
            <p style={{color: '#5e8070', marginBottom: '20px'}}>You haven't placed any merchandise orders yet.</p>
            <button className="btn-outline" onClick={() => navigate('member-store')}>Browse Merchandise</button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="order-card dashboard-panel">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                    <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className={`status-badge ${getStatusBadge(order.orderStatus || order.paymentStatus)}`}>
                    {getStatusText(order.orderStatus || order.paymentStatus)}
                  </div>
                </div>
                
                <div className="order-body">
                  <div className="order-details">
                    <div className="detail-item">
                      <span className="label">Total Amount</span>
                      <span className="value">₹{order.totalAmount}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Items ({order.items.reduce((sum, item) => sum + item.quantity, 0)})</span>
                      <ul className="product-list">
                        {order.items.map((item) => (
                          <li key={item.id}>
                            {item.quantity}x {item.productName} ({item.size})
                          </li>
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
        )}
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
        .badge-ready { background: #e0f2fe; color: #0369a1; }

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
