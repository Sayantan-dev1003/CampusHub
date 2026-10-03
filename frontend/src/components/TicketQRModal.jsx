import React from 'react';

export default function TicketQRModal({ ticket, onClose }) {
  if (!ticket) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content ticket-modal" onClick={e => e.stopPropagation()}>
        <button className="btn-close" onClick={onClose}>×</button>
        
        <div className="ticket-header">
          <h2>{ticket.eventName || 'Event'}</h2>
        </div>
        
        <div className="qr-container">
          <svg viewBox="0 0 100 100" className="qr-code">
            <rect width="100" height="100" fill="#fff" />
            <path d="M10,10 h20 v20 h-20 z M15,15 h10 v10 h-10 z" fill="#1b4332"/>
            <path d="M70,10 h20 v20 h-20 z M75,15 h10 v10 h-10 z" fill="#1b4332"/>
            <path d="M10,70 h20 v20 h-20 z M15,75 h10 v10 h-10 z" fill="#1b4332"/>
            <rect x="40" y="10" width="20" height="10" fill="#1b4332" />
            <rect x="10" y="40" width="10" height="20" fill="#1b4332" />
            <rect x="40" y="40" width="30" height="30" fill="#1b4332" />
            <rect x="70" y="50" width="20" height="10" fill="#1b4332" />
            <rect x="80" y="70" width="10" height="20" fill="#1b4332" />
            <rect x="30" y="80" width="30" height="10" fill="#1b4332" />
          </svg>
        </div>

        <div className="ticket-details">
          <p><strong>Ticket ID:</strong> {ticket.id}</p>
          <p><strong>Name:</strong> {ticket.userName || 'Member Name'}</p>
          <p><strong>Date:</strong> {ticket.date}</p>
          <p><strong>Venue:</strong> {ticket.venue || 'Main Auditorium'}</p>
          
          <div className="ticket-status valid">
            STATUS: VALID
          </div>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(27, 67, 50, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }

        .ticket-modal {
          background: #fff;
          border-radius: 20px;
          width: 100%;
          max-width: 400px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 24px 50px rgba(0,0,0,0.2);
          text-align: center;
        }

        .btn-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(255,255,255,0.2);
          border: none;
          color: #fff;
          font-size: 1.5rem;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .btn-close:hover { background: rgba(255,255,255,0.4); }

        .ticket-header {
          background: #1b4332;
          padding: 32px 24px 40px;
          color: #fff;
        }
        .ticket-header h2 {
          font-family: 'Fraunces', serif;
          font-size: 1.5rem;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .qr-container {
          background: #fff;
          margin: -24px auto 24px;
          padding: 16px;
          border-radius: 12px;
          width: 200px;
          height: 200px;
          box-shadow: 0 4px 12px rgba(27, 67, 50, 0.1);
          border: 1px solid #e2ece6;
        }
        .qr-code { width: 100%; height: 100%; }

        .ticket-details {
          padding: 0 32px 32px;
        }
        .ticket-details p {
          margin: 0 0 12px 0;
          color: #3b5a4a;
          font-size: 1.05rem;
          display: flex;
          justify-content: space-between;
          border-bottom: 1px dashed #e2ece6;
          padding-bottom: 8px;
        }
        .ticket-details strong { color: #1b4332; }

        .ticket-status.valid {
          margin-top: 24px;
          background: #eaf5ed;
          color: #2d6a4f;
          padding: 12px;
          border-radius: 8px;
          font-weight: 800;
          letter-spacing: 0.05em;
          border: 2px solid #52b788;
        }
      `}</style>
    </div>
  );
}
