import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useApi } from '../../admin/useApi';
import MemberLayout from './MemberLayout';
import { when, money } from '../../admin/format';

export default function MemberEventsPage() {
  const { navigate } = useApp();
  const query = useApi('/events');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'ongoing', 'past'

  const events = query.data || [];

  // Assuming categories might not exist or we mock them if not present. The backend doesn't have a strict category.
  const categories = ['All', ...new Set(events.map(e => e.category).filter(Boolean))];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          event.venue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || event.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const now = new Date();
  
  const upcomingEvents = filteredEvents.filter(e => new Date(e.startsAt) > now);
  const ongoingEvents = filteredEvents.filter(e => new Date(e.startsAt) <= now && new Date(e.endsAt) > now);
  const pastEvents = filteredEvents.filter(e => new Date(e.endsAt) <= now);

  const displayEvents = activeTab === 'upcoming' ? upcomingEvents : activeTab === 'ongoing' ? ongoingEvents : pastEvents;

  return (
    <MemberLayout>
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1>Events Discovery</h1>
          <p>Find, register, and attend events hosted by CampusHub.</p>
        </header>

        {/* Filters and Search */}
        <section className="events-controls">
          <div className="search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input 
              type="text" 
              placeholder="Search by event name or venue..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="category-select">
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </section>

        {/* Tabs */}
        <div className="events-tabs">
          <button 
            className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming Events ({upcomingEvents.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'ongoing' ? 'active' : ''}`}
            onClick={() => setActiveTab('ongoing')}
          >
            Ongoing Events ({ongoingEvents.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past Events ({pastEvents.length})
          </button>
        </div>

        {/* Events Grid */}
        {query.loading ? (
          <div className="no-events-state">
            <p>Loading events...</p>
          </div>
        ) : displayEvents.length > 0 ? (
          <div className="events-grid">
            {displayEvents.map(event => (
              <div key={event.id} className="event-card">
                <div className="event-card-header">
                  <h3>{event.title}</h3>
                  <div className="event-category-badge">{event.category || 'Event'}</div>
                </div>
                
                <div className="event-info">
                  <div className="info-row">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span>{when(event.startsAt)}</span>
                  </div>
                  <div className="info-row">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span>{event.venue}</span>
                  </div>
                </div>

                <div className="event-pricing">
                  <div className="price-item">
                    <span className="price-label">Member</span>
                    <span className="price-val text-green">{money(event.memberPrice)}</span>
                  </div>
                  <div className="price-item">
                    <span className="price-label">Non-member</span>
                    <span className="price-val">{money(event.nonMemberPrice)}</span>
                  </div>
                </div>

                <button 
                  className="btn-primary w-100" 
                  onClick={() => navigate('member-event-details', { id: event.id })}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-events-state">
            <p>No events found matching your search.</p>
          </div>
        )}
      </div>

      <style>{`
        .dashboard-content {
          padding: 32px;
          width: 100%;
          box-sizing: border-box;
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-header {
          margin-bottom: 24px;
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

        /* Controls */
        .events-controls {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }

        @media (max-width: 768px) {
          .events-controls { flex-direction: column; }
        }

        .search-box {
          flex: 1;
          display: flex;
          align-items: center;
          background: #fff;
          border: 1px solid #d3e6da;
          border-radius: 12px;
          padding: 0 16px;
          gap: 12px;
          box-shadow: 0 2px 6px rgba(20, 53, 40, 0.04);
        }
        .search-box svg { color: #8aa898; }
        .search-box input {
          flex: 1;
          border: none;
          padding: 14px 0;
          background: transparent;
          font-size: 1rem;
          color: #1b4332;
        }
        .search-box input:focus { outline: none; }
        .search-box input::placeholder { color: #8aa898; }

        .category-select select {
          height: 100%;
          min-width: 180px;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid #d3e6da;
          background: #fff;
          color: #1b4332;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          outline: none;
          box-shadow: 0 2px 6px rgba(20, 53, 40, 0.04);
        }

        /* Tabs */
        .events-tabs {
          display: flex;
          gap: 32px;
          border-bottom: 2px solid #d3e6da;
          margin-bottom: 32px;
        }
        .tab-btn {
          background: none;
          border: none;
          padding: 12px 0;
          font-size: 1.05rem;
          font-weight: 600;
          color: #5e8070;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          margin-bottom: -2px;
          transition: all 0.2s;
        }
        .tab-btn:hover { color: #2d6a4f; }
        .tab-btn.active {
          color: #1b4332;
          border-bottom-color: #2d6a4f;
        }

        /* Grid */
        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .event-card {
          background: #fff;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(20, 53, 40, 0.04);
          border: 1px solid rgba(45, 106, 79, 0.1);
          display: flex;
          flex-direction: column;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .event-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(20, 53, 40, 0.08);
        }

        .event-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 16px;
        }
        .event-card-header h3 {
          font-size: 1.25rem;
          color: #1b4332;
          margin: 0;
          line-height: 1.3;
        }
        .event-category-badge {
          background: #eaf5ed;
          color: #2d6a4f;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          white-space: nowrap;
        }

        .event-info {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 20px;
        }
        .info-row {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #5e8070;
          font-size: 0.95rem;
        }
        .info-row svg { opacity: 0.8; }

        .event-pricing {
          display: flex;
          justify-content: space-between;
          background: #fbfefc;
          border: 1px solid #e2ece6;
          border-radius: 10px;
          padding: 12px 16px;
          margin-bottom: 24px;
          margin-top: auto;
        }
        .price-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .price-item:last-child {
          text-align: right;
        }
        .price-label {
          font-size: 0.75rem;
          color: #5e8070;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.02em;
        }
        .price-val {
          font-size: 1.2rem;
          font-weight: 800;
          color: #3b5a4a;
          font-family: 'Outfit', sans-serif;
        }
        .text-green { color: #2d6a4f; }

        .btn-primary {
          background: #2d6a4f;
          color: #fff;
          border: none;
          padding: 12px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-primary:hover { background: #1b4332; }
        .w-100 { width: 100%; text-align: center; }

        .no-events-state {
          text-align: center;
          padding: 60px 20px;
          background: #fff;
          border-radius: 16px;
          border: 1px dashed #b7e4c7;
          color: #5e8070;
          font-size: 1.1rem;
        }
      `}</style>
    </MemberLayout>
  );
}
