import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  ShoppingBag,
  Sparkles,
  Info,
  User,
  LogOut,
  Menu,
  X,
  Compass,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const { currentRoute, navigate, user, logout, cartCount, setIsCartOpen } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (page) => {
    if (page === 'events' && (currentRoute.page === 'events' || currentRoute.page === 'event-details')) return true;
    if (page === 'store' && (currentRoute.page === 'store' || currentRoute.page === 'product-details')) return true;
    return currentRoute.page === page;
  };

  const handleNav = (page, params = {}) => {
    navigate(page, params);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <header className="navbar-wrapper">
      {/* Top Banner Notice for Visitor Orientation */}
      <div className="top-announcement-strip">
        <div className="container strip-content">
          <div className="strip-left">
            <span className="strip-tag">Spring 2026</span>
            <span>🌿 Welcome to <strong>Skyline Student Association</strong> — Central Operating System</span>
          </div>
          <div className="strip-right">
            {!user ? (
              <span className="strip-info">
                ✨ Public Visitor Access • Campus Events & Official Merchandise
              </span>
            ) : (
              <span className="strip-member">
                ⭐ Welcome, <strong>{user.name}</strong> ({user.role})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="main-nav">
        <div className="container nav-container">
          {/* Brand Logo */}
          <div className="nav-brand" onClick={() => handleNav('home')}>
            <div className="brand-logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-0-5H20" />
                <path d="m9 10 2 2 4-4" />
              </svg>
            </div>
            <div className="brand-text">
              <span className="brand-title">CampusHub</span>
              <span className="brand-sub">Skyline Association</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="nav-links">
            <button
              className={`nav-link-btn ${isActive('home') ? 'active' : ''}`}
              onClick={() => handleNav('home')}
            >
              <Compass size={17} />
              <span>Home</span>
            </button>

            <button
              className={`nav-link-btn ${isActive('events') ? 'active' : ''}`}
              onClick={() => handleNav('events')}
            >
              <Calendar size={17} />
              <span>Events</span>
              <span className="nav-pill-badge">Live</span>
            </button>

            <button
              className={`nav-link-btn ${isActive('store') ? 'active' : ''}`}
              onClick={() => handleNav('store')}
            >
              <ShoppingBag size={17} />
              <span>Merchandise</span>
            </button>

            <button
              className={`nav-link-btn ${isActive('about') ? 'active' : ''}`}
              onClick={() => handleNav('about')}
            >
              <Info size={17} />
              <span>About Us</span>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="nav-actions">
            {/* Cart Trigger */}
            <button
              className="cart-btn"
              onClick={() => setIsCartOpen(true)}
              aria-label="Shopping Cart"
              title="View Cart"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className="cart-badge-count">{cartCount}</span>}
            </button>

            {/* User State */}
            {!user ? (
              <div className="auth-btns-group">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleNav('login')}
                >
                  <User size={16} />
                  <span>Student Login</span>
                </button>
              </div>
            ) : (
              <div className="user-profile-menu">
                <button
                  className="user-profile-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                >
                  <div className="avatar-chip">
                    {user.name.charAt(0)}
                  </div>
                  <div className="user-meta-summary">
                    <span className="user-meta-name">{user.name.split(' ')[0]}</span>
                    <span className="user-meta-role">{user.role}</span>
                  </div>
                  <ChevronDown size={14} className={`chevron-icon ${userDropdownOpen ? 'rotated' : ''}`} />
                </button>

                {userDropdownOpen && (
                  <div className="user-dropdown-panel glass-card fade-in">
                    <div className="dropdown-user-header">
                      <strong>{user.name}</strong>
                      <span className="dropdown-user-email">{user.email}</span>
                      <div className="dropdown-badges">
                        <span className="badge badge-mint">{user.role}</span>
                        {user.isMember && <span className="badge badge-member">Active Member</span>}
                      </div>
                    </div>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item" onClick={() => handleNav('events')}>
                      <Calendar size={16} />
                      <span>Browse Events</span>
                    </button>
                    <button className="dropdown-item" onClick={() => handleNav('store')}>
                      <ShoppingBag size={16} />
                      <span>Club Store</span>
                    </button>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item logout-item" onClick={logout}>
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="mobile-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu-drawer glass-card fade-in">
            <div className="mobile-nav-links">
              <button
                className={`mobile-nav-item ${isActive('home') ? 'active' : ''}`}
                onClick={() => handleNav('home')}
              >
                <Compass size={18} />
                <span>Home</span>
              </button>
              <button
                className={`mobile-nav-item ${isActive('events') ? 'active' : ''}`}
                onClick={() => handleNav('events')}
              >
                <Calendar size={18} />
                <span>Events & Tickets</span>
              </button>
              <button
                className={`mobile-nav-item ${isActive('store') ? 'active' : ''}`}
                onClick={() => handleNav('store')}
              >
                <ShoppingBag size={18} />
                <span>Merchandise Store</span>
              </button>
              <button
                className={`mobile-nav-item ${isActive('about') ? 'active' : ''}`}
                onClick={() => handleNav('about')}
              >
                <Info size={18} />
                <span>About Skyline Association</span>
              </button>
            </div>

            <div className="mobile-auth-section">
              {!user ? (
                <div className="mobile-auth-buttons">
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => handleNav('login')}
                  >
                    <User size={16} />
                    <span>Student Login</span>
                  </button>
                </div>
              ) : (
                <div className="mobile-user-actions">
                  <div className="mobile-user-card">
                    <div className="avatar-chip">{user.name.charAt(0)}</div>
                    <div>
                      <strong>{user.name}</strong>
                      <div className="mobile-role-label">{user.role} • {user.email}</div>
                    </div>
                  </div>
                  <button className="btn btn-outline btn-sm" style={{ width: '100%', marginTop: '12px' }} onClick={logout}>
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <style>{`
        .navbar-wrapper {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border-light);
          box-shadow: 0 4px 20px rgba(35, 78, 59, 0.04);
        }

        .top-announcement-strip {
          background: #ebf6ee;
          border-bottom: 1px solid #d4ebd9;
          font-size: 0.8rem;
          color: var(--text-secondary);
          padding: 6px 0;
        }

        .strip-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
        }

        .strip-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .strip-tag {
          background-color: var(--color-primary);
          color: white;
          padding: 2px 7px;
          border-radius: var(--radius-full);
          font-weight: 700;
          font-size: 0.72rem;
          letter-spacing: 0.03em;
        }

        .strip-link {
          font-weight: 600;
          color: var(--color-primary);
          cursor: pointer;
          transition: color var(--transition-fast);
        }

        .strip-link:hover {
          text-decoration: underline;
        }

        .strip-member {
          color: var(--color-primary-dark);
        }

        .main-nav {
          padding: 12px 0;
          position: relative;
        }

        .nav-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          user-select: none;
        }

        .brand-logo-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #2d6a4f 0%, #52b788 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 12px rgba(45, 106, 79, 0.25);
          transition: transform var(--transition-normal);
        }

        .nav-brand:hover .brand-logo-icon {
          transform: rotate(-5deg) scale(1.05);
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-title {
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 1.35rem;
          letter-spacing: -0.02em;
          color: var(--color-primary-dark);
          line-height: 1.1;
        }

        .brand-sub {
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-sage);
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .nav-link-btn {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 9px 16px;
          border-radius: var(--radius-sm);
          font-weight: 600;
          font-size: 0.92rem;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .nav-link-btn:hover {
          background-color: var(--color-pastel-soft);
          color: var(--color-primary-dark);
        }

        .nav-link-btn.active {
          background-color: #d8f3dc;
          color: var(--color-primary-dark);
          font-weight: 700;
        }

        .nav-pill-badge {
          background-color: #52b788;
          color: white;
          font-size: 0.68rem;
          padding: 2px 6px;
          border-radius: var(--radius-full);
          font-weight: 700;
          text-transform: uppercase;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .cart-btn {
          position: relative;
          width: 42px;
          height: 42px;
          border-radius: 12px;
          border: 1px solid var(--border-light);
          background: var(--bg-subtle);
          color: var(--color-primary-dark);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-normal);
        }

        .cart-btn:hover {
          background: var(--color-pastel-soft);
          border-color: var(--color-sage);
          transform: translateY(-2px);
        }

        .cart-badge-count {
          position: absolute;
          top: -4px;
          right: -4px;
          background: var(--color-primary);
          color: white;
          font-size: 0.72rem;
          font-weight: 700;
          min-width: 19px;
          height: 19px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          border: 2px solid white;
        }

        .auth-btns-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .join-btn {
          border-radius: 999px;
        }

        .user-profile-menu {
          position: relative;
        }

        .user-profile-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 5px 12px 5px 6px;
          border-radius: var(--radius-full);
          background: #ebf7ed;
          border: 1px solid var(--border-accent);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .user-profile-btn:hover {
          background: #d8f3dc;
        }

        .avatar-chip {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--color-primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
        }

        .user-meta-summary {
          display: flex;
          flex-direction: column;
          text-align: left;
          font-size: 0.82rem;
          line-height: 1.2;
        }

        .user-meta-name {
          font-weight: 700;
          color: var(--color-primary-dark);
        }

        .user-meta-role {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .chevron-icon {
          color: var(--text-muted);
          transition: transform var(--transition-fast);
        }

        .chevron-icon.rotated {
          transform: rotate(180deg);
        }

        .user-dropdown-panel {
          position: absolute;
          right: 0;
          top: calc(100% + 10px);
          width: 240px;
          padding: 12px;
          border-radius: var(--radius-md);
          z-index: 100;
        }

        .dropdown-user-header {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding-bottom: 8px;
        }

        .dropdown-user-email {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .dropdown-badges {
          display: flex;
          gap: 6px;
          margin-top: 4px;
        }

        .dropdown-divider {
          height: 1px;
          background: var(--border-light);
          margin: 8px 0;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 10px;
          border-radius: var(--radius-xs);
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .dropdown-item:hover {
          background: var(--color-pastel-soft);
          color: var(--color-primary-dark);
        }

        .dropdown-item.logout-item:hover {
          background: #ffebeb;
          color: #c92a2a;
        }

        .mobile-toggle-btn {
          display: none;
          background: transparent;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          padding: 4px;
        }

        .mobile-menu-drawer {
          display: none;
          padding: 18px 24px;
          margin-top: 10px;
          border-top: 1px solid var(--border-light);
        }

        .mobile-nav-links {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .mobile-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: var(--radius-sm);
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          text-align: left;
          cursor: pointer;
        }

        .mobile-nav-item.active {
          background: var(--color-pastel-soft);
          color: var(--color-primary-dark);
        }

        .mobile-auth-section {
          margin-top: 18px;
          padding-top: 18px;
          border-top: 1px solid var(--border-light);
        }

        .mobile-auth-buttons {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .mobile-user-card {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .mobile-role-label {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        @media (max-width: 900px) {
          .nav-links, .auth-btns-group, .user-profile-menu {
            display: none;
          }

          .mobile-toggle-btn {
            display: block;
          }

          .mobile-menu-drawer {
            display: block;
          }
        }
      `}</style>
    </header>
  );
}
