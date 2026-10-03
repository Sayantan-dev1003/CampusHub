import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useApi } from '../../admin/useApi';
import MemberLayout from './MemberLayout';
import TicketQRModal from '../../components/TicketQRModal';
import { whenTime, money } from '../../admin/format'; // Add format if needed

export default function MemberTicketsPage() {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, used, cancelled
  const [selectedTicket, setSelectedTicket] = useState(null);

  const query = useApi('/tickets/my');
  const tickets = query.data || [];

  const filteredTickets = tickets.filter(ticket => {
    if (activeTab === 'upcoming') return ticket.status === 'PAID' || ticket.status === 'PENDING';
    if (activeTab === 'used') return ticket.status === 'USED';
    if (activeTab === 'cancelled') return ticket.status === 'CANCELLED' || ticket.status === 'EXPIRED';
    return false;
  });

  const handleViewQR = (ticketId) => {
    const ticket = tickets.find(t => t.id === ticketId);
    setSelectedTicket({
      id: ticket.id,
      qrCodeData: ticket.qrToken || 'NO_TOKEN', // Adapting QR modal requirements
      eventName: ticket.eventTitle,
      date: whenTime(ticket.startsAt),
      venue: ticket.venue,
      type: ticket.ticketType,
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
        {query.loading ? (
          <div className="no-tickets-state">
            <p>Loading tickets...</p>
          </div>
        ) : filteredTickets.length > 0 ? (
          <div className="tickets-grid">
            {filteredTickets.map(ticket => (
              <div key={ticket.id} className={`ticket-card ${ticket.status.toLowerCase()}`}>
                <div className="ticket-main">
                  <div className="ticket-header">
                    <div className="ticket-date-badge">
                      <span className="month">{new Date(ticket.startsAt).toLocaleString('default', { month: 'short' })}</span>
                      <span className="day">{new Date(ticket.startsAt).getDate()}</span>
                    </div>
                    <div className="ticket-titles">
                      <h3>{ticket.eventTitle}</h3>
                      <span className="ticket-venue">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        {ticket.venue || 'TBA'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="ticket-footer">
                    <div className="ticket-detail">
                      <span className="label">Type</span>
                      <span className="value">{ticket.ticketType === 'MEMBER' ? 'Member' : 'Standard'}</span>
                    </div>
                    <div className="ticket-detail">
                      <span className="label">Paid</span>
                      <span className="value">{money(ticket.price)}</span>
                    </div>
                    <div className="ticket-detail">
                      <span className="label">Order ID</span>
                      <span className="value id">{ticket.id.slice(-8).toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                <div className="ticket-stub">
                  <div className="stub-content">
                    {(ticket.status === 'PAID' || ticket.status === 'PENDING') && (
                      <>
                        <div className="qr-icon-placeholder">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 3h8v8H3zM5 5v4h4V5zM13 3h8v8h-8zM15 5v4h4V5zM3 13h8v8H3zM5 15v4h4v-4zM18 13h3v3h-3zM13 13h3v3h-3zM13 18h3v3h-3zM18 18h3v3h-3zM16 16h2v2h-2z"/>
                          </svg>
                        </div>
                        <button className="btn-qr" onClick={() => handleViewQR(ticket.id)} disabled={ticket.status === 'PENDING'}>
                          {ticket.status === 'PAID' ? 'View QR' : 'Pending'}
                        </button>
                      </>
                    )}
                    {ticket.status === 'USED' && (
                      <div className="stub-status used">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span>Scanned</span>
                      </div>
                    )}
                    {ticket.status === 'CANCELLED' && (
                       <div className="stub-status cancelled">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        <span>Refunded</span>
                      </div>
                    )}
                  </div>
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
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(600px, 1fr));
          gap: 32px;
        }

        @media (max-width: 1024px) {
          .tickets-grid { grid-template-columns: 1fr; }
        }

        .ticket-card {
          display: flex;
          position: relative;
          filter: drop-shadow(0 6px 16px rgba(27, 67, 50, 0.08));
          transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
          color: #1b4332;
        }

        .ticket-card:hover {
          transform: translateY(-4px) scale(1.01);
          filter: drop-shadow(0 16px 32px rgba(27, 67, 50, 0.12));
        }

        .ticket-main {
          flex: 1;
          padding: 32px;
          background: radial-gradient(circle at right top, transparent 14px, #fff 14.5px) top right / 100% 51% no-repeat,
                      radial-gradient(circle at right bottom, transparent 14px, #fff 14.5px) bottom right / 100% 51% no-repeat;
          border-radius: 16px 0 0 16px;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .ticket-main::after {
          content: '';
          position: absolute;
          top: 24px;
          bottom: 24px;
          right: 0;
          border-right: 2px dashed #d3e6da;
        }

        .ticket-stub {
          width: 180px;
          padding: 32px 24px;
          background: radial-gradient(circle at left top, transparent 14px, #f4f8f5 14.5px) top left / 100% 51% no-repeat,
                      radial-gradient(circle at left bottom, transparent 14px, #f4f8f5 14.5px) bottom left / 100% 51% no-repeat;
          border-radius: 0 16px 16px 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          position: relative;
        }

        /* Add a subtle texture/gradient to the stub to distinguish it */
        .ticket-stub::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(82,183,136,0.05) 0%, rgba(45,106,79,0.1) 100%);
          border-radius: 0 16px 16px 0;
          z-index: 0;
        }

        .stub-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          width: 100%;
        }

        .ticket-header {
          display: flex;
          gap: 24px;
          align-items: center;
          margin-bottom: 32px;
        }

        .ticket-date-badge {
          background: #1b4332;
          color: #fff;
          padding: 12px 16px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 0 8px 16px rgba(27, 67, 50, 0.2);
        }

        .ticket-date-badge .month {
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          opacity: 0.9;
        }

        .ticket-date-badge .day {
          font-size: 2rem;
          font-weight: 800;
          font-family: 'Outfit', sans-serif;
          line-height: 1;
          margin-top: 2px;
        }

        .ticket-titles {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ticket-titles h3 {
          margin: 0;
          font-family: 'Fraunces', Georgia, serif;
          font-size: 1.8rem;
          color: #1b4332;
          line-height: 1.1;
        }

        .ticket-venue {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #5e8070;
          font-size: 1rem;
          font-weight: 500;
        }
        .ticket-venue svg { width: 16px; height: 16px; }

        .ticket-footer {
          display: flex;
          justify-content: space-between;
          background: #fbfefc;
          padding: 16px 24px;
          border-radius: 12px;
          border: 1px solid #eef5f0;
        }

        .ticket-detail {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .ticket-detail .label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #5e8070;
          font-weight: 700;
        }

        .ticket-detail .value {
          font-size: 1.05rem;
          font-weight: 700;
          color: #1b4332;
        }
        .ticket-detail .value.id {
          font-family: monospace;
          background: #e2ece6;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.9rem;
          color: #2d6a4f;
        }

        .qr-icon-placeholder {
          width: 64px;
          height: 64px;
          background: #fff;
          border-radius: 12px;
          padding: 12px;
          box-shadow: 0 4px 12px rgba(27,67,50,0.08);
          color: #1b4332;
        }
        .qr-icon-placeholder svg {
          width: 100%;
          height: 100%;
        }

        .btn-qr {
          width: 100%;
          padding: 12px 0;
          background: #2d6a4f;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(45, 106, 79, 0.2);
        }
        .btn-qr:hover:not(:disabled) {
          background: #1b4332;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(27, 67, 50, 0.3);
        }
        .btn-qr:disabled {
          background: #95b3a3;
          cursor: not-allowed;
          box-shadow: none;
        }

        .stub-status {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .stub-status.used { color: #5e8070; }
        .stub-status.cancelled { color: #a63a3a; }
        .stub-status svg {
          width: 48px;
          height: 48px;
          opacity: 0.5;
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
          }
          .ticket-main {
            border-radius: 16px 16px 0 0;
            background: radial-gradient(circle at bottom left, transparent 14px, #fff 14.5px) bottom left / 51% 100% no-repeat,
                        radial-gradient(circle at bottom right, transparent 14px, #fff 14.5px) bottom right / 51% 100% no-repeat;
          }
          .ticket-main::after {
            top: auto; bottom: 0; left: 24px; right: 24px; border-right: none; border-bottom: 2px dashed #d3e6da;
          }
          .ticket-stub {
            width: 100%;
            border-radius: 0 0 16px 16px;
            background: radial-gradient(circle at top left, transparent 14px, #f4f8f5 14.5px) top left / 51% 100% no-repeat,
                        radial-gradient(circle at top right, transparent 14px, #f4f8f5 14.5px) top right / 51% 100% no-repeat;
          }
          .stub-content {
            flex-direction: row;
            justify-content: space-between;
          }
          .qr-icon-placeholder { width: 48px; height: 48px; padding: 8px; }
          .btn-qr { width: auto; padding: 12px 32px; }
          .stub-status { flex-direction: row; }
        }
      `}</style>
    </MemberLayout>
  );
}
