import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  MapPin,
  Search,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Radio,
  History
} from 'lucide-react';

export default function EventsPage() {
  const { events, navigate, user } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All',
    'Workshops & Tech',
    'Campus Life & Social',
    'Cultural & Music',
    'Leadership & Career',
    'Sports & Wellness'
  ];

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || evt.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Strictly order events: 1. Live Events, 2. Upcoming Events, 3. Past Events
  const liveEvents = filteredEvents.filter((evt) => evt.timing === 'live');
  const upcomingEvents = filteredEvents.filter((evt) => evt.timing === 'upcoming');
  const pastEvents = filteredEvents.filter((evt) => evt.timing === 'past');

  const renderEventCard = (evt) => {
    const isLive = evt.timing === 'live';
    const isPast = evt.timing === 'past';
    const memberPriceLabel = evt.memberPrice === 0 ? 'FREE' : `₹${evt.memberPrice}`;
    const nonMemberPriceLabel = evt.nonMemberPrice === 0 ? 'FREE' : `₹${evt.nonMemberPrice}`;

    return (
      <div key={evt.id} className={`event-pure-card glass-card ${isLive ? 'card-live' : isPast ? 'card-past' : ''}`}>

        {/* Status + Category Badges */}
        <div className="card-top-strip">
          <div className="badge-group-left">
            {isLive && (
              <span className="badge badge-live">
                <span className="live-dot-pulse"></span>
                Live Now
              </span>
            )}
            {!isLive && !isPast && (
              <span className="badge badge-upcoming">Upcoming</span>
            )}
            {isPast && (
              <span className="badge badge-past">Concluded</span>
            )}
            <span className="badge badge-mint">{evt.category}</span>
          </div>
        </div>

        {/* Event Title */}
        <h3 className="event-pure-title">{evt.title}</h3>

        {/* Compact Meta: Date + Venue */}
        <div className="event-compact-meta">
          <span className="compact-meta-item">
            <Calendar size={12} className="meta-icon" />
            {evt.date}
          </span>
          <span className="compact-meta-sep">·</span>
          <span className="compact-meta-item">
            <MapPin size={12} className="meta-icon" />
            {evt.venue}
          </span>
        </div>

        {/* Simple Price Tag */}
        {!isPast ? (
          <div className="card-price-tag">
            <span className="price-tag-member">Member: {memberPriceLabel}</span>
            <span className="price-tag-divider">|</span>
            <span className="price-tag-public">Public: {nonMemberPriceLabel}</span>
          </div>
        ) : (
          <div className="card-price-tag past-price-tag">
            <span>Event Completed</span>
          </div>
        )}

        {/* Action Button */}
        <button
          className={`btn ${isPast ? 'btn-outline' : 'btn-primary'} event-action-btn`}
          onClick={() => navigate('event-details', { id: evt.id })}
        >
          <span>{isLive ? 'View Live & Pass' : isPast ? 'View Recap' : 'View & Register'}</span>
          <ArrowRight size={14} />
        </button>
      </div>
    );
  };

  return (
    <div className="events-page fade-in">
      {/* Top Banner Header */}
      <section className="page-header-banner">
        <div className="container">
          <div className="banner-content">
            <span className="badge badge-mint banner-pill">Public Calendar</span>
            <h1 className="banner-title">Campus Events & Ticket Portal</h1>
            <p className="banner-desc">
              All events are publicly accessible for visitors and students. Explore currently active live events, upcoming semester highlights, and past archives. Active CampusHub members enjoy guaranteed discounted rates on all tickets!
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

      {/* Events Sections (Strictly ordered: Live -> Upcoming -> Past) */}
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

          {filteredEvents.length === 0 ? (
            <div className="empty-results glass-card">
              <AlertCircle size={36} className="text-sage" />
              <h3>No events match your search</h3>
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
            <div className="events-ordered-sections">
              {/* SECTION 1: LIVE EVENTS (FIRST) */}
              {liveEvents.length > 0 && (
                <div className="event-group-section">
                  <div className="group-header-row">
                    <div className="group-header-title">
                      <div className="live-header-icon-box">
                        <Radio size={18} className="live-icon-pulsing" />
                      </div>
                      <h2>Live Events (Happening Now)</h2>
                      <span className="badge badge-live-pill">{liveEvents.length} Active Now</span>
                    </div>
                    <span className="group-subtext">Happening today on campus &bull; Instant check-in open</span>
                  </div>

                  <div className="events-cards-grid">
                    {liveEvents.map(renderEventCard)}
                  </div>
                </div>
              )}

              {/* SECTION 2: UPCOMING EVENTS (SECOND) */}
              {upcomingEvents.length > 0 && (
                <div className="event-group-section">
                  <div className="group-header-row">
                    <div className="group-header-title">
                      <div className="upcoming-header-icon-box">
                        <Calendar size={18} />
                      </div>
                      <h2>Upcoming Campus Events</h2>
                      <span className="badge badge-mint">{upcomingEvents.length} Scheduled</span>
                    </div>
                    <span className="group-subtext">Reserve tickets and secure early-bird member seats</span>
                  </div>

                  <div className="events-cards-grid">
                    {upcomingEvents.map(renderEventCard)}
                  </div>
                </div>
              )}

              {/* SECTION 3: PAST EVENTS (LASTLY) */}
              {pastEvents.length > 0 && (
                <div className="event-group-section">
                  <div className="group-header-row">
                    <div className="group-header-title">
                      <div className="past-header-icon-box">
                        <History size={18} />
                      </div>
                      <h2>Past Events & Highlights</h2>
                      <span className="badge badge-past">{pastEvents.length} Concluded</span>
                    </div>
                    <span className="group-subtext">Completed campus events and society archives</span>
                  </div>

                  <div className="events-cards-grid">
                    {pastEvents.map(renderEventCard)}
                  </div>
                </div>
              )}
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

        /* Ordered Event Sections */
        .events-ordered-sections {
          display: flex;
          flex-direction: column;
          gap: 48px;
        }

        .event-group-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .group-header-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          border-bottom: 2px solid var(--border-light);
          padding-bottom: 12px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .group-header-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .group-header-title h2 {
          font-size: 1.55rem;
          color: var(--color-primary-dark);
          letter-spacing: -0.01em;
          margin: 0;
        }

        .live-header-icon-box {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          background: #ebf6ee;
          color: var(--color-primary);
          border-radius: var(--radius-sm);
        }

        .upcoming-header-icon-box {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          background: #ebf6ee;
          color: var(--color-primary);
          border-radius: var(--radius-sm);
        }

        .past-header-icon-box {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          background: #f1f3f2;
          color: var(--text-muted);
          border-radius: var(--radius-sm);
        }

        .group-subtext {
          font-size: 0.86rem;
          color: var(--text-muted);
        }

        .badge-live-pill {
          background: var(--color-pastel-soft);
          color: var(--color-primary-dark);
          font-weight: 700;
          border: 1px solid var(--border-accent);
          font-size: 0.76rem;
          padding: 3px 10px;
          border-radius: var(--radius-full);
        }

        /* Event Cards Grid (No Images) */
        .events-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .event-pure-card {
          background: #ffffff;
          border-radius: var(--radius-md);
          border: 1px solid rgba(82, 183, 136, 0.22);
          box-shadow: 0 2px 8px rgba(35, 78, 59, 0.04);
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: transform var(--transition-normal), box-shadow var(--transition-normal), border-color var(--transition-normal);
        }

        .event-pure-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(35, 78, 59, 0.08);
          border-color: var(--color-primary-light);
        }

        .event-pure-card.card-live {
          border-left: 4px solid var(--color-sage);
          background: linear-gradient(180deg, #f7fbf8 0%, #ffffff 100%);
        }

        .event-pure-card.card-past {
          opacity: 0.88;
          background: #fafcfb;
          border-color: #dbe5df;
        }

        .event-pure-card.card-past:hover {
          opacity: 1;
        }

        /* Card Top Strip */
        .card-top-strip {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          flex-wrap: wrap;
          gap: 6px;
        }

        .badge-group-left {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .badge-live {
          background: var(--color-pastel-soft);
          color: var(--color-primary-dark);
          font-weight: 700;
          font-size: 0.72rem;
          padding: 3px 9px;
          border-radius: var(--radius-full);
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border: 1px solid var(--border-accent);
        }

        .live-dot-pulse {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--color-primary);
          box-shadow: 0 0 0 rgba(45, 106, 79, 0.5);
          animation: pulseGreen 1.8s infinite;
        }

        @keyframes pulseGreen {
          0% { box-shadow: 0 0 0 0 rgba(45, 106, 79, 0.7); }
          70% { box-shadow: 0 0 0 8px rgba(45, 106, 79, 0); }
          100% { box-shadow: 0 0 0 0 rgba(45, 106, 79, 0); }
        }

        .badge-upcoming {
          background: var(--color-pastel-soft);
          color: var(--color-primary-dark);
          font-weight: 700;
          font-size: 0.74rem;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-light);
        }

        .badge-past {
          background: #eef1f0;
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.74rem;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .capacity-chip {
          background: var(--bg-subtle);
          color: var(--color-primary-dark);
          border: 1px solid var(--border-light);
          padding: 4px 10px;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .capacity-chip.past-chip {
          color: var(--text-muted);
          background: #f4f6f5;
        }

        /* Card Content */
        .card-content-body {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .event-pure-title {
          font-size: 0.98rem;
          font-weight: 700;
          color: var(--color-primary-dark);
          line-height: 1.35;
          letter-spacing: -0.01em;
          margin: 0;
        }

        /* Compact meta row */
        .event-compact-meta {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
          font-size: 0.76rem;
          color: var(--text-secondary);
        }

        .compact-meta-item {
          display: flex;
          align-items: center;
          gap: 3px;
        }

        .compact-meta-sep {
          color: var(--border-light);
          font-size: 0.9rem;
        }

        .meta-icon {
          color: var(--color-sage);
          flex-shrink: 0;
        }

        /* Simple price tag */
        .card-price-tag {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.78rem;
          background: #f4fbf6;
          border: 1px solid rgba(82, 183, 136, 0.25);
          border-radius: var(--radius-sm);
          padding: 6px 10px;
        }

        .price-tag-member {
          font-weight: 700;
          color: var(--color-primary-dark);
        }

        .price-tag-divider {
          color: var(--border-light);
          font-size: 0.85rem;
        }

        .price-tag-public {
          color: var(--text-secondary);
        }

        .past-price-tag {
          background: #f5f6f5;
          border-color: #e2e5e3;
          color: var(--text-muted);
          font-style: italic;
        }

        /* Card Action */
        .event-action-btn {
          width: 100%;
          padding: 9px 14px;
          font-size: 0.85rem;
        }

        @media (max-width: 1100px) {
          .events-cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 700px) {
          .events-cards-grid {
            grid-template-columns: 1fr;
          }

          .group-header-row {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
