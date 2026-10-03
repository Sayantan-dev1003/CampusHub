import React from 'react';

export default function TicketQRModal({ ticket, onClose }) {
  if (!ticket) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content ticket-modal" onClick={e => e.stopPropagation()}>
        
        <div className="modal-top">
          <div className="status-badge-inline">Valid Ticket</div>
          <button className="btn-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="modal-header">
          <h2>{ticket.eventName || 'Event'}</h2>
          <p>{ticket.venue || 'Main Auditorium'} • {ticket.date}</p>
        </div>

        <div className="qr-section">
          <div className="qr-frame">
            <svg viewBox="0 0 100 100" className="qr-code">
               <rect x="10" y="10" width="25" height="25" rx="3" fill="none" stroke="#1b4332" strokeWidth="4"/>
               <rect x="15" y="15" width="15" height="15" rx="2" fill="#1b4332" />
               <rect x="65" y="10" width="25" height="25" rx="3" fill="none" stroke="#1b4332" strokeWidth="4"/>
               <rect x="70" y="15" width="15" height="15" rx="2" fill="#1b4332" />
               <rect x="10" y="65" width="25" height="25" rx="3" fill="none" stroke="#1b4332" strokeWidth="4"/>
               <rect x="15" y="70" width="15" height="15" rx="2" fill="#1b4332" />
               
               <rect x="45" y="10" width="10" height="10" rx="1" fill="#1b4332" />
               <rect x="45" y="25" width="10" height="10" rx="1" fill="#1b4332" />
               <rect x="10" y="45" width="10" height="10" rx="1" fill="#1b4332" />
               <rect x="25" y="45" width="25" height="10" rx="1" fill="#1b4332" />
               <rect x="60" y="45" width="30" height="10" rx="1" fill="#1b4332" />
               <rect x="45" y="60" width="10" height="30" rx="1" fill="#1b4332" />
               <rect x="65" y="65" width="10" height="10" rx="1" fill="#1b4332" />
               <rect x="80" y="65" width="10" height="10" rx="1" fill="#1b4332" />
               <rect x="65" y="80" width="25" height="10" rx="1" fill="#1b4332" />
            </svg>
          </div>
        </div>
        
        <div className="qr-token-display">
          <span className="token-label">CHECK-IN TOKEN</span>
          <code className="token-value" title="Click to copy" onClick={(e) => {
            navigator.clipboard.writeText(ticket.qrCodeData);
            e.target.style.background = '#d3e6da';
            setTimeout(() => e.target.style.background = '#f4f8f5', 500);
          }}>
            {ticket.qrCodeData}
          </code>
        </div>

        <div className="ticket-divider"></div>

        <div className="ticket-details-grid">
          <div className="detail-item">
            <span className="label">Attendee</span>
            <span className="value">{ticket.userName || 'Member Name'}</span>
          </div>
          <div className="detail-item">
            <span className="label">Ticket Type</span>
            <span className="value">{ticket.type === 'MEMBER' ? 'Member' : 'Standard'}</span>
          </div>
          <div className="detail-item full">
            <span className="label">Ticket ID</span>
            <span className="value id">{ticket.id.toUpperCase()}</span>
          </div>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(27, 67, 50, 0.75);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }

        .ticket-modal {
          background: #ffffff;
          border-radius: 24px;
          width: 100%;
          max-width: 420px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 32px 64px rgba(0,0,0,0.3);
          text-align: center;
          display: flex;
          flex-direction: column;
        }

        .modal-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px 0;
        }

        .status-badge-inline {
          background: #eaf5ed;
          color: #2d6a4f;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .btn-close {
          background: #f4f8f5;
          border: none;
          color: #5e8070;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .btn-close:hover {
          background: #e2ece6;
          color: #1b4332;
          transform: rotate(90deg);
        }

        .modal-header {
          padding: 16px 32px 16px;
        }
        .modal-header h2 {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 1.8rem;
          color: #1b4332;
          margin: 0 0 8px 0;
          line-height: 1.2;
        }
        .modal-header p {
          color: #5e8070;
          margin: 0;
          font-size: 0.95rem;
          font-weight: 500;
        }

        .qr-section {
          padding: 16px 32px 24px;
          display: flex;
          justify-content: center;
        }

        .qr-frame {
          background: #fff;
          padding: 20px;
          border-radius: 20px;
          box-shadow: 0 8px 24px rgba(27, 67, 50, 0.08), inset 0 0 0 1px rgba(45,106,79,0.1);
          width: 200px;
          height: 200px;
          position: relative;
        }
        .qr-frame::before, .qr-frame::after {
          content: ''; position: absolute; width: 24px; height: 24px; border: 3px solid #2d6a4f; border-radius: 4px;
        }
        .qr-frame::before { top: 12px; left: 12px; border-right: none; border-bottom: none; }
        .qr-frame::after { bottom: 12px; right: 12px; border-left: none; border-top: none; }

        .qr-code { width: 100%; height: 100%; }

        .qr-token-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 0 32px 32px;
        }
        .token-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #5e8070;
          letter-spacing: 1px;
        }
        .token-value {
          background: #f4f8f5;
          padding: 12px 16px;
          border-radius: 12px;
          font-family: monospace;
          font-size: 0.95rem;
          color: #1b4332;
          border: 1px solid rgba(45,106,79,0.15);
          cursor: pointer;
          user-select: all;
          transition: all 0.2s;
          width: 100%;
          box-sizing: border-box;
          word-break: break-all;
          line-height: 1.4;
        }
        .token-value:hover {
          background: #e2ece6;
          border-color: rgba(45,106,79,0.3);
        }

        .ticket-divider {
          height: 0;
          border-top: 2px dashed #d3e6da;
          margin: 0;
          position: relative;
        }
        .ticket-divider::before, .ticket-divider::after {
          content: '';
          position: absolute;
          top: -12px;
          width: 24px;
          height: 24px;
          background: rgba(27, 67, 50, 0.75);
          border-radius: 50%;
        }
        .ticket-divider::before { left: -12px; }
        .ticket-divider::after { right: -12px; }

        .ticket-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          padding: 32px;
          background: #fbfefc;
          text-align: left;
        }
        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .detail-item.full {
          grid-column: span 2;
        }
        .detail-item .label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #5e8070;
          font-weight: 700;
        }
        .detail-item .value {
          font-size: 1rem;
          font-weight: 600;
          color: #1b4332;
        }
        .detail-item .value.id {
          font-family: monospace;
          background: #e2ece6;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.95rem;
          display: inline-block;
          width: fit-content;
        }
      `}</style>
    </div>
  );
}
