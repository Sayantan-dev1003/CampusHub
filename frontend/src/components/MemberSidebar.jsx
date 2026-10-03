import React from 'react';
import { useApp } from '../context/AppContext';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', path: 'member-dashboard', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
  { id: 'profile', label: 'My Profile', path: 'member-profile', icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' },
  { id: 'membership', label: 'My Membership', path: 'member-membership', icon: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z' },
  { id: 'events', label: 'Events', path: 'events', icon: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z' },
  { id: 'tickets', label: 'My Tickets', path: 'member-tickets', icon: 'M22 10V6a2 2 0 0 0-2-2H4c-1.1 0-1.99.89-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2zm-2 7.02H4V15c1.47-1.17 1.47-3.17 0-4.34V6.98h16v3.68c-1.47 1.17-1.47 3.17 0 4.34v3.02z' },
  { id: 'merchandise', label: 'Merchandise', path: 'store', icon: 'M21.16 7.26l-1.41-1.41-3.52 3.52-1.41-1.41 3.52-3.52-1.41-1.41L15.52 1.6 11.28 5.84l4.24 4.24 1.41-1.41-3.52-3.52 1.41-1.41 3.52 3.52 1.41 1.41-1.41 1.41zM7.76 13.59l4.24-4.24-4.24-4.24-4.24 4.24 4.24 4.24zm0-2.83l-1.41-1.41 1.41-1.41 1.41 1.41-1.41 1.41z' },
  { id: 'orders', label: 'My Orders', path: 'member-orders', icon: 'M18 17H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2zM3 22l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20z' },
  { id: 'announcements', label: 'Announcements', path: 'member-announcements', icon: 'M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z' },
  { id: 'volunteer', label: 'Volunteer', path: 'member-volunteer', icon: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z' },
  { id: 'notifications', label: 'Notifications', path: 'member-notifications', icon: 'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z' },
];

export default function MemberSidebar() {
  const { currentRoute, navigate, logout, user } = useApp();
  
  return (
    <aside className="member-sidebar">
      <div className="sidebar-brand">
        <button type="button" onClick={() => navigate('home')}>
          <span className="gate-brand-text" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
            <span className="gate-brand-name" style={{ fontSize: '1.7rem', fontFamily: 'Outfit, var(--font-heading)', fontWeight: '700', letterSpacing: '-0.03em', lineHeight: '1' }}>CampusHub</span>
            <span className="gate-brand-sub" style={{ fontSize: '0.85rem', color: '#b7e4c7', marginTop: '4px' }}>Skyline Student Association</span>
          </span>
        </button>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">{user?.name ? user.name.charAt(0).toUpperCase() : 'M'}</div>
        <div className="user-info">
          <div className="user-name">{user?.name || 'Member User'}</div>
          <div className="user-role">{user?.isMember ? 'Active Member' : 'Member'}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <button 
                className={currentRoute.page === item.path ? 'active' : ''}
                onClick={() => navigate(item.path)}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d={item.icon} />
                </svg>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={logout}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
          </svg>
          Logout
        </button>
      </div>

      <style>{`
        .member-sidebar {
          width: 260px;
          height: 100vh;
          height: 100dvh;
          background: #1b4332;
          color: #f4faf6;
          display: flex;
          flex-direction: column;
          border-right: 1px solid #143528;
          flex-shrink: 0;
          overflow-y: auto;
          font-family: 'Plus Jakarta Sans', var(--font-body);
        }

        .sidebar-brand {
          padding: 24px;
        }

        .sidebar-brand button {
          display: flex;
          align-items: center;
          gap: 12px;
          background: none;
          border: none;
          color: #fff;
          cursor: pointer;
          padding: 0;
        }

        .sidebar-user {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 12px;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #74c69d;
          color: #1b4332;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.2rem;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: 600;
          font-size: 0.95rem;
          color: #fff;
        }

        .user-role {
          font-size: 0.75rem;
          color: #b7e4c7;
        }

        .sidebar-nav {
          flex: 1;
          padding: 0 12px;
        }

        .sidebar-nav ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sidebar-nav button {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          background: transparent;
          border: none;
          color: #d8f3dc;
          padding: 12px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.95rem;
          font-family: inherit;
          font-weight: 500;
          transition: all 0.2s ease;
          text-align: left;
        }

        .sidebar-nav button:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
        }

        .sidebar-nav button.active {
          background: #2d6a4f;
          color: #fff;
          font-weight: 600;
        }

        .sidebar-nav svg {
          opacity: 0.8;
        }

        .sidebar-nav button.active svg {
          opacity: 1;
        }

        .sidebar-footer {
          padding: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          background: transparent;
          border: none;
          color: #b7e4c7;
          padding: 12px 0;
          cursor: pointer;
          font-size: 0.95rem;
          font-family: inherit;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .logout-btn:hover {
          color: #fff;
        }
      `}</style>
    </aside>
  );
}
