import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import MemberLayout from './MemberLayout';
import TicketQRModal from '../../components/TicketQRModal';

export default function MemberTicketsPage() {
  const { addToast, user } = useApp();
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, used, cancelled
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Mock data for user's tickets
  const [tickets] = useState([
    {
      id: 'SG-28491',
      eventName: 'Spring Gala 2026',
      date: '12 Oct 2026',
      status: 'upcoming',
      type: 'Member Ticket',
      price: '300'
    },
    {
      id: 'TH-99432',
      eventName: 'Tech Hackathon',
      date: '05 Nov 2026',
      status: 'upcoming',
      type: 'Member Ticket',
      price: '150'
    },
    {
      id: 'AL-11234',
      eventName: 'Alumni Mixer',
      date: '10 Sep 2026',
      status: 'used',
      type: 'Member Ticket',
      price: '200'
    }
  ]);

  const filteredTickets = tickets.filter(ticket => ticket.status === activeTab);

  const handleViewQR = (ticketId) => {
    const ticket = tickets.find(t => t.id === ticketId);
    setSelectedTicket({
      ...ticket,
      userName: user?.name
    });
  };

  return (
    <MemberLayout>
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1>My Tickets</h1>
          <p>Access your event tickets and QR codes for digital check-in.</p>
        </header>

        {/* Tabs */}
        <div className="tickets-tabs">
          <button 
            className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </button>
          <button 
            className={`tab-btn ${activeTab === 'used' ? 'active' : ''}`}
            onClick={() => setActiveTab('used')}
          >
            Used
          </button>
          <button 
            className={`tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
            onClick={() => setActiveTab('cancelled')}
          >
            Cancelled
          </button>
        </div>

        {/* Ticket Grid */}
        {filteredTickets.length > 0 ? (
          <div className="tickets-grid">
            {filteredTickets.map(ticket => (
              <div key={ticket.id} className="ticket-card">
                <div className="ticket-left">
                  <div className="ticket-date">
                    <span className="month">{ticket.date.split(' ')[1]}</span>
                    <span className="day">{ticket.date.split(' ')[0]}</span>
                  </div>
                  <div className="ticket-info">
                    <h3>{ticket.eventName}</h3>
                    <div className="ticket-meta">
                      <span className="ticket-id">ID: {ticket.id}</span>
                      <span className="ticket-type">{ticket.type} • ₹{ticket.price}</span>
                    </div>
                  </div>
                </div>
                <div className="ticket-right">
                  {ticket.status === 'upcoming' && (
                    <button className="btn-qr" onClick={() => handleViewQR(ticket.id)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                      </svg>
                      View QR
                    </button>
                  )}
                  {ticket.status === 'used' && (
                    <span className="status-badge used">Scanned</span>
                  )}
                  {ticket.status === 'cancelled' && (
                    <span className="status-badge cancelled">Refunded</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-tickets-state">
            <p>You have no {activeTab} tickets.</p>
          </div>
        )}
      </div>
      
      {selectedTicket && (
        <TicketQRModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
      )}

      <style>{`
        .dashboard-content {
          padding: 32px;
          width: 100%;
          box-sizing: border-box;
          max-width: 1000px;
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

        /* Tabs */
        .tickets-tabs {
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
        .tickets-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .ticket-card {
          background: #fff;
          border: 1px solid rgba(45, 106, 79, 0.1);
          border-radius: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(20, 53, 40, 0.04);
          transition: transform 0.2s;
        }

        .ticket-card:hover {
          transform: translateX(4px);
          border-color: #b7e4c7;
        }

        .ticket-left {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .ticket-date {
          background: #eef5f0;
          padding: 12px;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 60px;
        }
        .ticket-date .month {
          color: #5e8070;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .ticket-date .day {
          color: #1b4332;
          font-size: 1.5rem;
          font-weight: 800;
          font-family: 'Outfit', sans-serif;
        }

        .ticket-info h3 {
          margin: 0 0 8px 0;
          font-size: 1.25rem;
          color: #1b4332;
        }

        .ticket-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .ticket-id {
          font-size: 0.85rem;
          color: #5e8070;
          font-family: monospace;
          background: #f4f8f5;
          padding: 2px 6px;
          border-radius: 4px;
          display: inline-block;
        }

        .ticket-type {
          font-size: 0.95rem;
          color: #2d6a4f;
          font-weight: 600;
        }

        .ticket-right {
          display: flex;
          align-items: center;
        }

        .btn-qr {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #2d6a4f;
          color: #fff;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-qr:hover { background: #1b4332; }

        .status-badge {
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .status-badge.used {
          background: #e2ece6;
          color: #5e8070;
        }
        .status-badge.cancelled {
          background: #fde8e8;
          color: #a63a3a;
        }

        .no-tickets-state {
          text-align: center;
          padding: 60px 20px;
          background: #fff;
          border-radius: 16px;
          border: 1px dashed #b7e4c7;
          color: #5e8070;
          font-size: 1.1rem;
        }

        @media (max-width: 600px) {
          .ticket-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
          }
          .ticket-right {
            width: 100%;
          }
          .btn-qr {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </MemberLayout>
  );
}
