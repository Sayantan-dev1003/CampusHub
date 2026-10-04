import React from 'react';
import { useApp } from '../../context/AppContext';
import MemberLayout from './MemberLayout';

export default function MemberDashboardPage() {
  const { user, navigate } = useApp();
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadDash() {
      try {
        const { api } = await import('../../services/api');
        const res = await api('/dashboard/member');
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadDash();
  }, []);

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatMonth = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short' }) : '';
  const formatDay = (d) => d ? new Date(d).toLocaleDateString('en-US', { day: '2-digit' }) : '';

  if (loading) {
    return (
      <MemberLayout>
        <div style={{ padding: '40px', color: '#1b4332' }}>Loading dashboard...</div>
      </MemberLayout>
    );
  }

  const upcoming = data?.upcomingEvents || [];
  const announcements = data?.announcements || [];
  const membership = data?.membership;

  return (
    <MemberLayout>
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1>Welcome back, {user?.name?.split(' ')[0] || 'Member'}!</h1>
          <p>Here's what's happening around CampusHub.</p>
        </header>

        {/* Summary Cards */}
        <section className="summary-grid">
          <div className="summary-card" style={{ background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)' }}>
            <div className="summary-icon" style={{ background: '#a5b4fc', color: '#312e81' }}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" /></svg>
            </div>
            <div className="summary-info">
              <h3 style={{ color: '#3730a3' }}>Membership</h3>
              <div className="summary-value" style={{ color: '#312e81' }}>{membership ? membership.status : 'NONE'}</div>
              <div className="summary-sub" style={{ color: '#4338ca' }}>
                {membership ? `Expires ${formatDate(membership.endDate)}` : 'Join today'}
              </div>
            </div>
          </div>

          <div className="summary-card" style={{ background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' }}>
            <div className="summary-icon" style={{ background: '#6ee7b7', color: '#064e3b' }}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" /></svg>
            </div>
            <div className="summary-info">
              <h3 style={{ color: '#065f46' }}>Upcoming Events</h3>
              <div className="summary-value" style={{ color: '#064e3b' }}>{data?.upcomingEventCount || 0} Events</div>
              <div className="summary-sub" style={{ color: '#047857' }}>
                {upcoming[0] ? `Next: ${formatDate(upcoming[0].startsAt)}` : 'No upcoming events'}
              </div>
            </div>
          </div>

          <div className="summary-card" style={{ background: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)' }}>
            <div className="summary-icon" style={{ background: '#d8b4fe', color: '#4c1d95' }}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 10V6a2 2 0 0 0-2-2H4c-1.1 0-1.99.89-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2zm-2 7.02H4V15c1.47-1.17 1.47-3.17 0-4.34V6.98h16v3.68c-1.47 1.17-1.47 3.17 0 4.34v3.02z" /></svg>
            </div>
            <div className="summary-info">
              <h3 style={{ color: '#5b21b6' }}>My Tickets</h3>
              <div className="summary-value" style={{ color: '#4c1d95' }}>{data?.ticketCount || 0} Tickets</div>
              <div className="summary-sub" style={{ color: '#6d28d9' }}>Ready to use</div>
            </div>
          </div>

          <div className="summary-card" style={{ background: 'linear-gradient(135deg, #ffedd5, #fed7aa)' }}>
            <div className="summary-icon" style={{ background: '#fdba74', color: '#7c2d12' }}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 17H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2zM3 22l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20z" /></svg>
            </div>
            <div className="summary-info">
              <h3 style={{ color: '#9a3412' }}>My Orders</h3>
              <div className="summary-value" style={{ color: '#7c2d12' }}>{data?.orders?.length || 0} Orders</div>
              <div className="summary-sub" style={{ color: '#c2410c' }}>Recent purchases</div>
            </div>
          </div>
        </section>

        <div className="dashboard-main-grid">
          {/* Main Left Column */}
          <div className="grid-col-left">
            <section className="quick-actions-section">
              <div className="action-buttons">
                <button onClick={() => navigate('member-events')}>Browse Events</button>
                <button onClick={() => navigate('member-store')}>Buy Merchandise</button>
                <button onClick={() => navigate('member-tickets')}>My Tickets</button>
              </div>
            </section>

            <section className="dashboard-panel">
              <div className="panel-header">
                <h2>Upcoming Events</h2>
                <button className="btn-text" onClick={() => navigate('member-events')}>View All</button>
              </div>
              <div className="event-list">
                {upcoming.length === 0 && <p style={{ color: '#5e8070' }}>No upcoming events right now.</p>}
                {upcoming.map((event) => (
                  <div key={event.id} className="event-item">
                    <div className="event-date-block">
                      <span className="event-month">{formatMonth(event.startsAt)}</span>
                      <span className="event-day">{formatDay(event.startsAt)}</span>
                    </div>
                    <div className="event-details">
                      <h4>{event.title}</h4>
                      <p className="event-meta">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        {event.venue || 'TBD'}
                      </p>
                    </div>
                    <div className="event-actions">
                      <button className="btn-primary" onClick={() => navigate('member-event-details', { id: event.id })}>
                        Register
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {data?.tasks?.length > 0 && (
              <section className="dashboard-panel" style={{ marginTop: '24px' }}>
                <div className="panel-header">
                  <h2>My Tasks</h2>
                </div>
                <div className="event-list">
                  {data.tasks.map((task) => (
                    <div key={task.id} className="event-item" style={{ padding: '12px' }}>
                      <div className="event-details">
                        <h4>{task.title}</h4>
                        <p className="event-meta">Status: {task.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column */}
          <div className="grid-col-right">
            <section className="dashboard-panel panel-green">
              <h2>Membership Status</h2>
              <div className="member-status-details">
                {membership ? (
                  <>
                    <div className="status-row">
                      <span>Type</span>
                      <strong>{membership.planName || 'Annual'}</strong>
                    </div>
                    <div className="status-row">
                      <span>Status</span>
                      <strong className={membership.status === 'ACTIVE' ? 'status-active' : ''}>{membership.status}</strong>
                    </div>
                    <div className="status-row">
                      <span>Valid Until</span>
                      <strong>{formatDate(membership.endDate)}</strong>
                    </div>
                    <div className="status-benefits">
                      <strong>Benefits:</strong>
                      <ul>
                        <li>Ticket & merchandise discounts</li>
                        <li>Early event access</li>
                        <li>Voting rights</li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <div style={{ padding: '20px 0', textAlign: 'center', color: '#1b4332' }}>
                    <p style={{ marginBottom: '16px' }}>You don't have an active membership yet.</p>
                    <button className="btn-primary" style={{ width: '100%' }} onClick={() => navigate('member-membership')}>Join Now</button>
                  </div>
                )}
                {membership && (
                  <button className="btn-outline-green mt-3" onClick={() => navigate('member-membership')}>Renew Membership</button>
                )}
              </div>
            </section>

            <section className="dashboard-panel">
              <div className="panel-header">
                <h2>Recent Announcements</h2>
                <button className="btn-text" onClick={() => navigate('member-announcements')}>View All</button>
              </div>
              <ul className="announcement-list">
                {announcements.length === 0 && <p style={{ color: '#5e8070', fontSize: '0.9rem' }}>No announcements.</p>}
                {announcements.map((ann) => (
                  <li key={ann.id}>
                    <div className="anno-date">{formatDate(ann.publishedAt)}</div>
                    <div className="anno-title">{ann.title}</div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
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

        /* Summary Cards */
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .summary-card {
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 16px rgba(0,0,0,0.06);
          transition: transform 0.2s ease;
          border: none;
        }
        
        .summary-card:hover {
          transform: translateY(-4px);
        }

        .summary-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          z-index: 2;
        }
        .summary-icon svg { width: 24px; height: 24px; }
        
        .summary-info { z-index: 2; }
        
        .summary-info h3 {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
          font-weight: 700;
        }

        .summary-value {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 4px;
          font-family: 'Outfit', sans-serif;
        }

        .summary-sub {
          font-size: 0.85rem;
          font-weight: 500;
        }

        .status-active {
          color: #2d6a4f;
          font-weight: 700;
        }

        /* Main Grid Layout */
        .dashboard-main-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .dashboard-main-grid { grid-template-columns: 1fr; }
        }

        .dashboard-panel {
          background: #fff;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(20, 53, 40, 0.04);
          border: 1px solid rgba(45, 106, 79, 0.1);
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .dashboard-panel h2 {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 1.4rem;
          color: #1b4332;
        }

        .btn-text {
          background: none;
          border: none;
          color: #2d6a4f;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
        }
        .btn-text:hover { text-decoration: underline; }

        /* Event List */
        .event-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .event-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          border: 1px solid #e2ece6;
          border-radius: 12px;
          transition: background 0.2s;
        }
        .event-item:hover { background: #f7fbf8; }

        .event-date-block {
          background: #eef5f0;
          border-radius: 10px;
          min-width: 60px;
          height: 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #1b4332;
        }
        .event-month { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
        .event-day { font-size: 1.4rem; font-weight: 800; line-height: 1; }

        .event-details { flex: 1; }
        .event-details h4 { font-size: 1.1rem; color: #1b4332; margin-bottom: 6px; }
        .event-meta { 
          font-size: 0.85rem; 
          color: #5e8070; 
          display: flex; 
          align-items: center; 
          gap: 6px;
          margin-bottom: 4px;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #1b4332, #2d6a4f);
          color: #fff;
          border: none;
          padding: 10px 18px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(45, 106, 79, 0.2);
        }
        .btn-primary:hover { 
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(45, 106, 79, 0.3);
        }

        /* Membership Panel */
        .panel-green {
          background: linear-gradient(135deg, #d8f3dc, #b7e4c7);
          border: none;
          box-shadow: 0 8px 16px rgba(45, 106, 79, 0.1);
        }
        .panel-green h2 { margin-bottom: 20px; color: #1b4332; }
        
        .status-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid rgba(27, 67, 50, 0.1);
          font-size: 0.95rem;
        }
        .status-row span { color: #3b5a4a; }
        .status-row strong { color: #1b4332; }

        .status-benefits {
          margin-top: 16px;
          font-size: 0.9rem;
          color: #1b4332;
        }
        .status-benefits ul { margin-top: 8px; padding-left: 20px; color: #2d6a4f; }
        .status-benefits li { margin-bottom: 6px; font-weight: 500; }

        .btn-outline-green {
          width: 100%;
          background: #fff;
          border: 1px solid rgba(45, 106, 79, 0.2);
          color: #1b4332;
          padding: 12px;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 20px;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .btn-outline-green:hover {
          border-color: #2d6a4f;
          background: #f7fbf8;
        }

        /* Announcements */
        .announcement-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .announcement-list li {
          padding: 14px 0;
          border-bottom: 1px solid #e2ece6;
        }
        .announcement-list li:last-child { border-bottom: none; }
        
        .anno-date {
          font-size: 0.75rem;
          color: #2d6a4f;
          font-weight: 700;
          margin-bottom: 4px;
          text-transform: uppercase;
        }
        .anno-title {
          font-size: 0.95rem;
          color: #1b4332;
          font-weight: 600;
          line-height: 1.4;
        }

        /* Quick Actions */
        .action-buttons {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 24px;
        }
        .action-buttons button {
          flex: 1;
          background: #fff;
          border: 1px solid #d3e6da;
          color: #1b4332;
          padding: 14px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
          box-shadow: 0 2px 8px rgba(20, 53, 40, 0.03);
        }
        .action-buttons button:hover {
          background: #f7fbf8;
          border-color: #b7e4c7;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(20, 53, 40, 0.06);
        }
      `}</style>
    </MemberLayout>
  );
}
