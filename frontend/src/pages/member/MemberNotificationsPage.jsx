import React, { useState } from 'react';
import MemberLayout from './MemberLayout';

export default function MemberNotificationsPage() {
  const [notifications] = useState([
    {
      id: 1,
      type: 'event',
      title: 'Event Reminder: Tech Hackathon',
      message: 'The Tech Hackathon starts tomorrow at 9:00 AM. Don\'t forget your laptop and charger!',
      time: '2 hours ago',
      unread: true
    },
    {
      id: 2,
      type: 'order',
      title: 'Order Status Update',
      message: 'Your order #ORD1024 is now Ready for Pickup.',
      time: '1 day ago',
      unread: true
    },
    {
      id: 3,
      type: 'volunteer',
      title: 'New Volunteer Task Assigned',
      message: 'You have been assigned to "Manage counter" for the Bake Sale.',
      time: '3 days ago',
      unread: false
    },
    {
      id: 4,
      type: 'ticket',
      title: 'Ticket Purchase Confirmed',
      message: 'Your ticket for Spring Gala (SG-28491) has been confirmed.',
      time: '1 week ago',
      unread: false
    }
  ]);

  const getIcon = (type) => {
    switch(type) {
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
      default: return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
      );
    }
  };

  return (
    <MemberLayout>
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1>Notifications</h1>
          <p>Your recent alerts and updates.</p>
        </header>

        <div className="notifications-list dashboard-panel">
          {notifications.map(notif => (
            <div key={notif.id} className={`notification-item ${notif.unread ? 'unread' : ''}`}>
              <div className="notif-icon">
                {getIcon(notif.type)}
              </div>
              <div className="notif-content">
                <div className="notif-header">
                  <h3>{notif.title}</h3>
                  <span className="notif-time">{notif.time}</span>
                </div>
                <p>{notif.message}</p>
              </div>
              {notif.unread && <div className="unread-dot"></div>}
            </div>
          ))}
        </div>
      </div>

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
      `}</style>
    </MemberLayout>
  );
}
