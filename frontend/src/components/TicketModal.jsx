import React from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCircle, Calendar, MapPin, QrCode, Download, Printer } from 'lucide-react';

export default function TicketModal() {
  const { activeTicketModal, setActiveTicketModal } = useApp();

  if (!activeTicketModal) return null;

  const t = activeTicketModal;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="ticket-modal-backdrop" onClick={() => setActiveTicketModal(null)}>
      <div className="ticket-modal-content glass-card fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Top Status */}
        <div className="ticket-top-banner">
          <div className="success-icon-badge">
            <CheckCircle size={20} />
          </div>
          <div>
            <h3>Ticket Confirmed!</h3>
            <span className="ticket-booking-id">Booking ID: {t.id}</span>
          </div>
          <button className="ticket-close-btn" onClick={() => setActiveTicketModal(null)}>
            <X size={20} />
          </button>
        </div>

        {/* Boarding Pass Style Digital Ticket */}
        <div className="ticket-pass-card">
          <div className="pass-header">
            <div className="pass-org">
              <span>CampusHub • Skyline Association</span>
              <span className="badge badge-mint">{t.ticketType} PASS</span>
            </div>
            <h2 className="pass-event-title">{t.eventTitle}</h2>
          </div>

          <div className="pass-body">
            <div className="pass-grid">
              <div className="pass-cell">
                <span className="pass-label">Date & Time</span>
                <span className="pass-val">
                  <Calendar size={14} className="inline-icon" /> {t.eventDate}
                </span>
                <span className="pass-subval">{t.eventTime}</span>
              </div>

              <div className="pass-cell">
                <span className="pass-label">Venue</span>
                <span className="pass-val">
                  <MapPin size={14} className="inline-icon" /> {t.venue}
                </span>
              </div>

              <div className="pass-cell">
                <span className="pass-label">Ticket Holder</span>
                <span className="pass-val">{t.attendeeName}</span>
                <span className="pass-subval">{t.attendeeEmail}</span>
              </div>

              <div className="pass-cell">
                <span className="pass-label">Seats & Total</span>
                <span className="pass-val">{t.quantity} Seat(s)</span>
                <span className="pass-subval">₹{t.totalAmount.toFixed(2)} ({t.ticketType})</span>
              </div>
            </div>

            {/* Perforated divider */}
            <div className="pass-perforation">
              <div className="perf-circle-left"></div>
              <div className="perf-line"></div>
              <div className="perf-circle-right"></div>
            </div>

            {/* QR Scan Section */}
            <div className="pass-qr-section">
              <div className="qr-wrapper">
                {/* Visual SVG QR Representation */}
                <svg width="110" height="110" viewBox="0 0 100 100" className="qr-svg">
                  <rect width="100" height="100" fill="#ffffff" />
                  {/* Outer markers */}
                  <rect x="10" y="10" width="26" height="26" fill="#1b4332" rx="3" />
                  <rect x="15" y="15" width="16" height="16" fill="#ffffff" rx="2" />
                  <rect x="19" y="19" width="8" height="8" fill="#1b4332" />

                  <rect x="64" y="10" width="26" height="26" fill="#1b4332" rx="3" />
                  <rect x="69" y="15" width="16" height="16" fill="#ffffff" rx="2" />
                  <rect x="73" y="19" width="8" height="8" fill="#1b4332" />

                  <rect x="10" y="64" width="26" height="26" fill="#1b4332" rx="3" />
                  <rect x="15" y="69" width="16" height="16" fill="#ffffff" rx="2" />
                  <rect x="19" y="73" width="8" height="8" fill="#1b4332" />

                  {/* QR Matrix Bits */}
                  <rect x="42" y="12" width="6" height="6" fill="#1b4332" />
                  <rect x="52" y="16" width="6" height="6" fill="#1b4332" />
                  <rect x="42" y="26" width="6" height="6" fill="#1b4332" />
                  <rect x="48" y="36" width="6" height="6" fill="#1b4332" />
                  <rect x="12" y="44" width="6" height="6" fill="#1b4332" />
                  <rect x="24" y="52" width="6" height="6" fill="#1b4332" />
                  <rect x="64" y="44" width="6" height="6" fill="#1b4332" />
                  <rect x="78" y="54" width="6" height="6" fill="#1b4332" />
                  <rect x="44" y="66" width="6" height="6" fill="#1b4332" />
                  <rect x="56" y="74" width="6" height="6" fill="#1b4332" />
                  <rect x="68" y="82" width="6" height="6" fill="#1b4332" />
                  <rect x="84" y="70" width="6" height="6" fill="#1b4332" />
                </svg>
              </div>
              <div className="qr-instructions">
                <span className="qr-title">Digital Entry Pass</span>
                <span className="qr-code-text">{t.qrCodeData}</span>
                <span className="qr-hint">Scan at door with CampusHub scanner for instant entrance verification.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="ticket-modal-actions">
          <button className="btn btn-outline btn-sm" onClick={handlePrint}>
            <Printer size={15} />
            <span>Print Pass</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setActiveTicketModal(null)}>
            <span>Close & Done</span>
          </button>
        </div>
      </div>

      <style>{`
        .ticket-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(19, 42, 30, 0.55);
          backdrop-filter: blur(6px);
          z-index: 3000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .ticket-modal-content {
          background: #ffffff;
          width: 100%;
          max-width: 520px;
          border-radius: var(--radius-lg);
          padding: 24px;
          box-shadow: 0 20px 50px rgba(27, 67, 50, 0.2);
        }

        .ticket-top-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          position: relative;
        }

        .success-icon-badge {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--color-pastel-soft);
          color: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ticket-booking-id {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .ticket-close-btn {
          margin-left: auto;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }

        .ticket-pass-card {
          border: 2px dashed #b7e4c7;
          border-radius: 16px;
          background: #f7fbf8;
          overflow: hidden;
        }

        .pass-header {
          background: #eaf5ed;
          padding: 16px 20px;
          border-bottom: 1px solid #d4ebd9;
        }

        .pass-org {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--color-primary);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 6px;
        }

        .pass-event-title {
          font-size: 1.15rem;
          color: var(--color-primary-dark);
          line-height: 1.25;
        }

        .pass-body {
          padding: 20px;
        }

        .pass-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .pass-cell {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .pass-label {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--text-muted);
          font-weight: 600;
        }

        .pass-val {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--color-primary-dark);
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .pass-subval {
          font-size: 0.78rem;
          color: var(--text-secondary);
        }

        .inline-icon {
          color: var(--color-sage);
        }

        .pass-perforation {
          position: relative;
          height: 24px;
          display: flex;
          align-items: center;
          margin: 12px -20px;
        }

        .perf-circle-left {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ffffff;
          position: absolute;
          left: -10px;
          box-shadow: inset -2px 0 3px rgba(0,0,0,0.05);
        }

        .perf-circle-right {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ffffff;
          position: absolute;
          right: -10px;
          box-shadow: inset 2px 0 3px rgba(0,0,0,0.05);
        }

        .perf-line {
          width: 100%;
          border-top: 2px dashed #b7e4c7;
        }

        .pass-qr-section {
          display: flex;
          align-items: center;
          gap: 16px;
          padding-top: 6px;
        }

        .qr-wrapper {
          padding: 6px;
          background: #ffffff;
          border: 1px solid var(--border-light);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .qr-instructions {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .qr-title {
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--color-primary-dark);
        }

        .qr-code-text {
          font-family: monospace;
          font-size: 0.75rem;
          color: var(--color-primary);
          background: #e8f5ed;
          padding: 2px 6px;
          border-radius: 4px;
          width: fit-content;
        }

        .qr-hint {
          font-size: 0.76rem;
          color: var(--text-muted);
          line-height: 1.3;
        }

        .ticket-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
}
