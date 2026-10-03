import React, { useState, useEffect } from 'react';
import MemberLayout from './MemberLayout';

export default function MemberNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedNotif, setSelectedNotif] = useState(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const { api } = await import('../../services/api');
      const res = await api('/notifications?limit=50');
      setNotifications(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const { api } = await import('../../services/api');
      await api(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      // ignore
    }
  };

  const markAllRead = async () => {
    try {
      const { api } = await import('../../services/api');
      await api('/notifications/read-all', { method: 'POST' });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      // ignore
    }
  };

  const getIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'event': return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      );
      case 'order': return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
      );
      case 'ticket': return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      );
      case 'announcement': return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      );
      default: return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      );
    }
  };

  const timeAgo = (dateStr) => {
    const d = new Date(dateStr);
    const diff = (new Date() - d) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff/60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)} hours ago`;
    return `${Math.floor(diff/86400)} days ago`;
  };

  const handleNotifClick = (notif) => {
    if (!notif.isRead) markAsRead(notif.id);
    setSelectedNotif(notif);
  };

  const closeModal = () => setSelectedNotif(null);

  return (
    <MemberLayout>
      <div className="dashboard-content">
        <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1>Notifications</h1>
            <p>Your recent alerts and updates.</p>
          </div>
          {notifications.some(n => !n.isRead) && (
            <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#2d6a4f', cursor: 'pointer', fontWeight: 'bold' }}>Mark all as read</button>
          )}
        </header>

        {loading && <p>Loading notifications...</p>}
        {error && <p style={{color: 'red'}}>{error}</p>}

        {!loading && notifications.length === 0 && (
          <div className="dashboard-panel" style={{ padding: '32px', textAlign: 'center', color: '#5e8070' }}>
            <p>You have no notifications.</p>
          </div>
        )}

        <div className="notifications-list dashboard-panel">
          {notifications.map(notif => (
            <div 
              key={notif.id} 
              className={`notification-item ${!notif.isRead ? 'unread' : ''} ${notif.priority === 'URGENT' ? 'urgent-item' : ''}`}
              onClick={() => handleNotifClick(notif)}
            >
              <div className="notif-icon">
                {getIcon(notif.referenceType || notif.type)}
              </div>
              <div className="notif-content">
                <div className="notif-header">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {notif.title}
                    {notif.priority === 'URGENT' && <span className="urgent-badge">URGENT</span>}
                  </h3>
                  <span className="notif-time">{timeAgo(notif.createdAt)}</span>
                </div>
                <p>{notif.message}</p>
                {notif.publisherName && (
                  <div className="notif-publisher">By: {notif.publisherName}</div>
                )}
              </div>
              {!notif.isRead && <div className="unread-dot"></div>}
            </div>
          ))}
        </div>
      </div>

      {selectedNotif && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>&times;</button>
            <div className="modal-header">
              <h2>
                {selectedNotif.title}
                {selectedNotif.priority === 'URGENT' && <span className="urgent-badge large">URGENT</span>}
              </h2>
            </div>
            
            {selectedNotif.category && (
              <div className="modal-category">
                <span className="category-pill">{selectedNotif.category}</span>
              </div>
            )}
            
            <div className="modal-body">
              <p>{selectedNotif.fullContent || selectedNotif.message}</p>
            </div>
            
            <div className="modal-footer">
              <span className="modal-time">Received: {new Date(selectedNotif.createdAt).toLocaleString()}</span>
              {selectedNotif.publisherName && (
                <span className="modal-publisher">By: {selectedNotif.publisherName}</span>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .dashboard-content {
          padding: 32px;
          width: 100%;
          box-sizing: border-box;
          max-width: 800px;
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

        .dashboard-panel {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(20, 53, 40, 0.04);
          border: 1px solid rgba(45, 106, 79, 0.1);
          overflow: hidden;
        }

        .notifications-list {
          display: flex;
          flex-direction: column;
        }

        .notification-item {
          display: flex;
          gap: 16px;
          padding: 24px;
          border-bottom: 1px solid #eef5f0;
          position: relative;
          transition: background 0.2s;
        }
        .notification-item:last-child { border-bottom: none; }
        .notification-item:hover { background: #fbfefc; cursor: pointer; }
        
        .notification-item.unread {
          background: #f4f8f5;
        }
        .notification-item.urgent-item {
          background: #fef2f2;
          border-left: 4px solid #ef4444;
        }
        .notification-item.urgent-item:hover {
          background: #fee2e2;
        }

        .notif-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #eaf5ed;
          color: #2d6a4f;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .urgent-item .notif-icon {
          background: #fee2e2;
          color: #ef4444;
        }
        .notif-icon svg { width: 24px; height: 24px; }

        .notif-content {
          flex: 1;
        }

        .notif-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }
        .notif-header h3 {
          margin: 0;
          font-size: 1.1rem;
          color: #1b4332;
        }
        
        .urgent-badge {
          background: #ef4444;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: bold;
          text-transform: uppercase;
        }
        .urgent-badge.large {
          font-size: 0.85rem;
          padding: 4px 12px;
          margin-left: 12px;
        }

        .notif-time {
          font-size: 0.8rem;
          color: #8aa898;
          font-weight: 500;
        }

        .notif-content p {
          margin: 0;
          color: #5e8070;
          font-size: 0.95rem;
          line-height: 1.5;
        }
        
        .notif-publisher {
          margin-top: 8px;
          text-align: right;
          font-size: 0.85rem;
          color: #8aa898;
          font-style: italic;
        }

        .unread-dot {
          width: 10px;
          height: 10px;
          background: #52b788;
          border-radius: 50%;
          position: absolute;
          top: 24px;
          right: 24px;
          box-shadow: 0 0 0 4px rgba(82, 183, 136, 0.2);
        }
        
        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(27, 67, 50, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: #fff;
          border-radius: 16px;
          padding: 32px;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 10px 40px rgba(27, 67, 50, 0.15);
          position: relative;
        }
        .modal-close {
          position: absolute;
          top: 20px; right: 20px;
          background: none; border: none;
          font-size: 1.5rem;
          color: #8aa898;
          cursor: pointer;
        }
        .modal-close:hover { color: #1b4332; }
        
        .modal-header h2 {
          font-size: 1.5rem;
          color: #1b4332;
          margin: 0 0 16px 0;
          display: flex;
          align-items: center;
        }
        
        .modal-category {
          margin-bottom: 20px;
        }
        .category-pill {
          background: #eaf5ed;
          color: #2d6a4f;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 700;
        }
        
        .modal-body {
          font-size: 1.05rem;
          color: #3b5a4a;
          line-height: 1.6;
          margin-bottom: 32px;
          white-space: pre-wrap;
        }
        
        .modal-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
          color: #8aa898;
          border-top: 1px solid #eef5f0;
          padding-top: 16px;
        }
        .modal-publisher {
          font-weight: 600;
          color: #2d6a4f;
        }
      `}</style>
    </MemberLayout>
  );
}
