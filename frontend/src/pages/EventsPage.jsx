import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function EventsPage() {
  const { events, navigate, user } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Social & Gala', 'Workshops & Tech', 'Leadership & Career', 'Fundraiser & Social'];

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || evt.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="events-page fade-in">
      {/* Top Banner Header */}
      <section className="page-header-banner">
        <div className="container">
          <div className="banner-content">
            <span className="badge badge-mint banner-pill">Public Calendar</span>
            <h1 className="banner-title">Campus Events & Ticket Portal</h1>
            <p className="banner-desc">
              All events are publicly accessible for visitors and students. Active CampusHub members enjoy guaranteed discounted rates on all tickets!
            </p>
          </div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="events-controls-section">
        <div className="container">
          <div className="controls-card glass-card">
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Search events by name, hall, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                  &times;
                </button>
              )}
            </div>

            <div className="category-filter-pills">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`filter-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Events List / Grid */}
      <section className="events-list-section">
        <div className="container">
          {/* Member Pricing Teaser Banner */}
          {!user?.isMember && (
            <div className="member-savings-callout glass-card">
              <div className="callout-left">
                <Sparkles size={20} className="text-sage" />
                <div>
                  <strong>Special Student Member Ticket Rates</strong>
                  <p>Active members get up to 50% discount on tickets. Enter your Student ID or login during reservation.</p>
                </div>
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('login')}>
                <span>Member Login &rarr;</span>
              </button>
            </div>
          )}

          <div className="results-count-row">
            <span>Showing <strong>{filteredEvents.length}</strong> available campus events</span>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="empty-results glass-card">
              <AlertCircle size={36} className="text-sage" />
              <h3>No events match your criteria</h3>
              <p>Try searching with another keyword or resetting the category filter.</p>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="events-catalog-grid">
              {filteredEvents.map((evt) => {
                const percentLeft = Math.round((evt.remainingSeats / evt.totalCapacity) * 100);
                const isLowSeats = evt.remainingSeats <= 25;

                return (
                  <div key={evt.id} className="event-item-card glass-card">
                    <div className="event-item-visual">
                      <img src={evt.banner || '/assets/fest.jpg'} alt={evt.title} className="item-img" />
                      <span className="item-category-tag">{evt.category}</span>
                      <div className="item-capacity-chip">
                        <Users size={13} />
                        <span>{evt.remainingSeats} / {evt.totalCapacity} seats</span>
                      </div>
                    </div>

                    <div className="event-item-details">
                      <div className="event-timing-row">
                        <Calendar size={15} className="text-sage" />
                        <span>{evt.date}</span>
                        <span className="dot-sep">•</span>
                        <Clock size={15} className="text-sage" />
                        <span>{evt.time}</span>
                      </div>

                      <h2 className="event-item-title">{evt.title}</h2>
                      <p className="event-item-description">{evt.description}</p>

                      <div className="event-item-venue">
                        <MapPin size={15} className="text-muted" />
                        <span>{evt.venue}</span>
                      </div>

                      {/* Seat Progress Bar */}
                      <div className="seat-progress-container">
                        <div className="seat-progress-header">
                          <span className="seat-status-text">
                            {isLowSeats ? (
                              <strong className="text-warning">🔥 Selling Fast! Only {evt.remainingSeats} seats left</strong>
                            ) : (
                              <span>Available capacity</span>
                            )}
                          </span>
                          <span className="seat-percent">{percentLeft}% open</span>
                        </div>
                        <div className="seat-progress-track">
                          <div
                            className={`seat-progress-bar ${isLowSeats ? 'bar-warning' : 'bar-normal'}`}
                            style={{ width: `${percentLeft}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Pricing Comparison */}
                      <div className="event-pricing-strip">
                        <div className="pricing-box-item member-highlight">
                          <span className="pricing-label">Member Price</span>
                          <span className="pricing-cost">₹{evt.memberPrice.toFixed(2)}</span>
                          <span className="pricing-savings">Save ₹{(evt.nonMemberPrice - evt.memberPrice).toFixed(2)}</span>
                        </div>

                        <div className="pricing-divider-line"></div>

                        <div className="pricing-box-item non-member-box">
                          <span className="pricing-label">Non-Member</span>
                          <span className="pricing-cost-standard">₹{evt.nonMemberPrice.toFixed(2)}</span>
                          <span className="pricing-sub">Public Rate</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="event-actions-row">
                        <button
                          className="btn btn-primary event-view-btn"
                          onClick={() => navigate('event-details', { id: evt.id })}
                        >
                          <span>View Event & Tickets</span>
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <style>{`
        .events-page {
          padding-bottom: 70px;
        }

        .page-header-banner {
          background: linear-gradient(135deg, #eaf5ee 0%, #f4f8f5 100%);
          padding: 56px 0 36px;
          border-bottom: 1px solid var(--border-light);
        }

        .banner-content {
          max-width: 680px;
        }

        .banner-pill {
          margin-bottom: 12px;
        }

        .banner-title {
          font-size: 2.6rem;
          color: var(--color-primary-dark);
          line-height: 1.15;
          margin-bottom: 12px;
        }

        .banner-desc {
          font-size: 1.05rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .events-controls-section {
          margin-top: -24px;
          margin-bottom: 32px;
        }

        .controls-card {
          padding: 16px 20px;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--bg-subtle);
          border: 1px solid var(--border-light);
          padding: 8px 14px;
          border-radius: var(--radius-sm);
          flex: 1;
          min-width: 280px;
        }

        .search-icon {
          color: var(--color-sage);
        }

        .search-input {
          border: none;
          background: transparent;
          width: 100%;
          outline: none;
          font-size: 0.92rem;
          color: var(--text-primary);
        }

        .clear-search-btn {
          background: transparent;
          border: none;
          font-size: 1.2rem;
          color: var(--text-muted);
          cursor: pointer;
        }

        .category-filter-pills {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .filter-pill-btn {
          background: var(--bg-subtle);
          border: 1px solid var(--border-light);
          color: var(--text-secondary);
          font-size: 0.84rem;
          font-weight: 600;
          padding: 8px 14px;
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .filter-pill-btn:hover {
          background: var(--color-pastel-soft);
          color: var(--color-primary);
        }

        .filter-pill-btn.active {
          background: var(--color-primary);
          color: #ffffff;
          border-color: var(--color-primary);
        }

        .member-savings-callout {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background: #ebf6ee;
          border: 1px solid var(--border-accent);
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .callout-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .callout-left strong {
          color: var(--color-primary-dark);
          font-size: 0.95rem;
          display: block;
        }

        .callout-left p {
          color: var(--text-secondary);
          font-size: 0.85rem;
          margin: 0;
        }

        .results-count-row {
          font-size: 0.88rem;
          color: var(--text-muted);
          margin-bottom: 20px;
        }

        .empty-results {
          padding: 60px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          background: #ffffff;
        }

        .empty-results h3 {
          font-size: 1.3rem;
          color: var(--color-primary-dark);
        }

        .empty-results p {
          color: var(--text-secondary);
          max-width: 440px;
        }

        /* Event Catalog Grid */
        .events-catalog-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 28px;
        }

        .event-item-card {
          background: #ffffff;
          border-radius: var(--radius-lg);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .event-item-visual {
          position: relative;
          height: 220px;
          overflow: hidden;
        }

        .item-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-smooth);
        }

        .event-item-card:hover .item-img {
          transform: scale(1.04);
        }

        .item-category-tag {
          position: absolute;
          top: 14px;
          left: 14px;
          background: rgba(27, 67, 50, 0.85);
          color: #ffffff;
          padding: 4px 12px;
          border-radius: var(--radius-full);
          font-size: 0.74rem;
          font-weight: 700;
          backdrop-filter: blur(4px);
        }

        .item-capacity-chip {
          position: absolute;
          bottom: 14px;
          right: 14px;
          background: rgba(255, 255, 255, 0.94);
          color: var(--color-primary-dark);
          padding: 5px 12px;
          border-radius: var(--radius-full);
          font-size: 0.76rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: var(--shadow-sm);
        }

        .event-item-details {
          padding: 24px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .event-timing-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.84rem;
          color: var(--text-muted);
          font-weight: 600;
          margin-bottom: 8px;
        }

        .event-item-title {
          font-size: 1.35rem;
          color: var(--color-primary-dark);
          margin-bottom: 8px;
          line-height: 1.25;
        }

        .event-item-description {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 14px;
          flex: 1;
        }

        .event-item-venue {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.84rem;
          color: var(--text-muted);
          margin-bottom: 16px;
        }

        .seat-progress-container {
          background: var(--bg-subtle);
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          margin-bottom: 16px;
        }

        .seat-progress-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.78rem;
          margin-bottom: 6px;
          color: var(--text-secondary);
        }

        .text-warning {
          color: #b75e18;
        }

        .seat-progress-track {
          width: 100%;
          height: 6px;
          background: #e2ede5;
          border-radius: 99px;
          overflow: hidden;
        }

        .seat-progress-bar {
          height: 100%;
          border-radius: 99px;
          transition: width 0.4s ease;
        }

        .bar-normal {
          background: var(--color-sage);
        }

        .bar-warning {
          background: #e76f51;
        }

        .event-pricing-strip {
          display: flex;
          align-items: center;
          background: #f4fbf6;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          padding: 10px 16px;
          margin-bottom: 18px;
        }

        .pricing-box-item {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .pricing-label {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--text-muted);
          font-weight: 600;
        }

        .pricing-cost {
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--color-primary);
          line-height: 1.1;
        }

        .pricing-savings {
          font-size: 0.74rem;
          color: #2d6a4f;
          font-weight: 700;
        }

        .pricing-divider-line {
          width: 1px;
          height: 38px;
          background: var(--border-light);
          margin: 0 16px;
        }

        .pricing-cost-standard {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .pricing-sub {
          font-size: 0.74rem;
          color: var(--text-muted);
        }

        .event-view-btn {
          width: 100%;
        }

        @media (max-width: 960px) {
          .events-catalog-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
