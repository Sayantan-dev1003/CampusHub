import React, { useState } from 'react';
import MemberLayout from './MemberLayout';

export default function MemberAnnouncementsPage() {
  const [announcements] = useState([
    {
      id: 1,
      title: 'Spring Gala Registration Opens Today!',
      content: 'We are thrilled to announce that registration for the annual Spring Gala is now officially open! Members get early access and exclusive discounts. Book your tickets now before they sell out!',
      date: 'Oct 01, 2026',
      author: 'Event Committee',
      category: 'Events'
    },
    {
      id: 2,
      title: 'New Merchandise In Store',
      content: 'Our highly anticipated winter collection, including the new CampusHub hoodies and beanies, has arrived. Check out the Merchandise store to grab yours.',
      date: 'Sep 28, 2026',
      author: 'Merch Team',
      category: 'Store'
    },
    {
      id: 3,
      title: 'Volunteer Meeting Scheduled',
      content: 'All volunteers for the upcoming Bake Sale fundraiser are required to attend a brief orientation meeting this Friday at 4 PM in Room 102.',
      date: 'Sep 25, 2026',
      author: 'Volunteer Coordinator',
      category: 'Volunteering'
    }
  ]);

  return (
    <MemberLayout>
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1>Announcements</h1>
          <p>Stay up to date with the latest news, updates, and notices.</p>
        </header>

        <div className="announcements-list">
          {announcements.map(item => (
            <div key={item.id} className="announcement-card dashboard-panel">
              <div className="announcement-header">
                <h2>{item.title}</h2>
                <span className="announcement-category">{item.category}</span>
              </div>
              
              <div className="announcement-meta">
                <span className="meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  {item.date}
                </span>
                <span className="meta-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  By {item.author}
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

        .announcement-meta {
          display: flex;
          gap: 16px;
          margin-bottom: 20px;
          color: #8aa898;
          font-size: 0.9rem;
          font-weight: 500;
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
        }
      `}</style>
    </MemberLayout>
  );
}
