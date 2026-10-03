import React, { useState, useEffect } from 'react';
import MemberLayout from './MemberLayout';
import { api } from '../../services/api';

export default function MemberAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await api('/announcements?limit=100');
        setAnnouncements(res.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleRead = async (ann) => {
    try {
      await api(`/announcements/${ann.id}/read`, { method: 'POST' });
    } catch (e) {
      // ignore
    }
  };

  return (
    <MemberLayout>
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1>Announcements</h1>
          <p>Stay up to date with the latest news, updates, and notices.</p>
        </header>

        {loading && <p>Loading announcements...</p>}
        {error && <p className="error-text">{error}</p>}

        <div className="announcements-list">
          {!loading && announcements.length === 0 && (
            <div className="dashboard-panel"><p>No announcements available.</p></div>
          )}
          {announcements.map(item => (
            <div 
              key={item.id} 
              className={`announcement-card dashboard-panel ${item.priority === 'URGENT' ? 'urgent-announcement' : ''}`}
              onClick={() => handleRead(item)}
            >
              {item.priority === 'URGENT' && <div className="urgent-badge">URGENT</div>}
              <div className="announcement-header">
                <h2>{item.title}</h2>
                <span className="announcement-category">{item.category || 'General'}</span>
              </div>
              
              <div className="announcement-meta">
                <span className="meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  {new Date(item.publishedAt || item.createdAt).toLocaleDateString()}
                </span>
                <span className="meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  CampusHub
                </span>
              </div>

              <div className="announcement-content">
                <p>{item.content}</p>
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

        .error-text { color: #e53e3e; }

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

        .announcements-list {
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
          position: relative;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .dashboard-panel:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(20, 53, 40, 0.08);
        }

        .urgent-announcement {
          border-color: #fca5a5;
          background: #fef2f2;
        }
        
        .urgent-badge {
          position: absolute;
          top: -12px;
          right: 24px;
          background: #ef4444;
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: bold;
          text-transform: uppercase;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
        }

        .announcement-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 12px;
        }
        .announcement-header h2 {
          font-size: 1.4rem;
          color: #1b4332;
          margin: 0;
          line-height: 1.3;
        }
        .announcement-category {
          background: #eaf5ed;
          color: #2d6a4f;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          white-space: nowrap;
        }
        .urgent-announcement .announcement-category {
          background: #fee2e2;
          color: #b91c1c;
        }

        .announcement-meta {
          display: flex;
          gap: 16px;
          margin-bottom: 20px;
          color: #8aa898;
          font-size: 0.9rem;
          font-weight: 500;
        }
        .urgent-announcement .announcement-meta {
          color: #9ca3af;
        }
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .announcement-content p {
          color: #3b5a4a;
          line-height: 1.7;
          font-size: 1.05rem;
          margin: 0;
          white-space: pre-wrap;
        }
        .urgent-announcement .announcement-content p {
          color: #7f1d1d;
        }
      `}</style>
    </MemberLayout>
  );
}
