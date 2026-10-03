import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Tag,
  AlertCircle,
  HelpCircle,
  Ticket
} from 'lucide-react';

export default function EventDetailsPage() {
  const { currentRoute, navigate, getEvent, bookTicket, user, addToast } = useApp();
  const eventId = currentRoute.params?.id || 'evt-cultural-fest-2026';
  const event = getEvent(eventId);

  const [ticketType, setTicketType] = useState(user?.isMember ? 'MEMBER' : 'NON_MEMBER');
  const [quantity, setQuantity] = useState(1);
  const [attendeeName, setAttendeeName] = useState(user ? user.name : '');
  const [attendeeEmail, setAttendeeEmail] = useState(user ? user.email : '');
  const [studentIdInput, setStudentIdInput] = useState(user?.studentId || '');
  const [verifiedMemberId, setVerifiedMemberId] = useState(user?.isMember || false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!event) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Event not found</h2>
        <button className="btn btn-primary" onClick={() => navigate('events')}>
          Back to Events
        </button>
      </div>
    );
  }

  // Quick verification simulator for members without logging in
  const handleVerifyStudentId = () => {
    if (!studentIdInput.trim()) {
      addToast('Input Required', 'Please enter your student ID to verify membership', 'warning');
      return;
    }
    // STU-001 or any STU- id unlocks verification
    if (studentIdInput.trim().toUpperCase().startsWith('STU')) {
      setVerifiedMemberId(true);
      setTicketType('MEMBER');
      addToast('Membership Verified!', `Member ID ${studentIdInput} confirmed. Unlocked member pricing!`, 'success');
    } else {
      addToast('Not Found', 'Student ID not found in member directory. (Demo: try STU-001)', 'warning');
    }
  };

  // Price calculation
  const isMemberRateApplicable = user?.isMember || verifiedMemberId;
  let unitPrice = event.nonMemberPrice;
  if (ticketType === 'MEMBER') {
    unitPrice = event.memberPrice;
  } else if (ticketType === 'VIP') {
    unitPrice = event.vipPrice || event.nonMemberPrice * 1.5;
  }

  const totalPrice = unitPrice * quantity;
  const isSoldOut = event.remainingSeats <= 0;
  const maxAvailableToSelect = Math.min(6, event.remainingSeats);

  const handleBookingSubmit = (e) => {
    e.preventDefault();

    if (!attendeeName.trim() || !attendeeEmail.trim()) {
      addToast('Details Missing', 'Please enter your name and email address', 'warning');
      return;
    }

    if (ticketType === 'MEMBER' && !isMemberRateApplicable) {
      addToast('Member Verification Required', 'Please login or verify your Student ID to claim the member discount', 'warning');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const ticketResult = bookTicket(event.id, ticketType, quantity, {
        name: attendeeName,
        email: attendeeEmail,
        studentId: studentIdInput || 'GUEST'
      });
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="event-details-page fade-in">
      {/* Back button header */}
      <div className="details-top-bar">
        <div className="container">
          <button className="back-link-btn" onClick={() => navigate('events')}>
            <ArrowLeft size={16} />
            <span>Back to All Events</span>
          </button>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="container details-container">
        <div className="details-grid">
          {/* Left Column: Event Hero, Agenda, Logistics */}
          <div className="details-main-col">
            <div className="event-hero-media glass-card">
              <img src={event.banner || '/assets/gala.jpg'} alt={event.title} className="hero-banner-img" />
              <div className="media-overlay-tags">
                <span className="badge badge-mint">{event.category}</span>
                <span className="badge badge-member">
                  {event.remainingSeats > 0 ? `${event.remainingSeats} Seats Available` : 'Sold Out'}
                </span>
              </div>
            </div>

            <div className="event-header-info">
              <div className="event-meta-pill-strip">
                <div className="meta-pill">
                  <Calendar size={15} className="text-sage" />
                  <span>{event.date}</span>
                </div>
                <div className="meta-pill">
                  <Clock size={15} className="text-sage" />
                  <span>{event.time}</span>
                </div>
                <div className="meta-pill">
                  <MapPin size={15} className="text-sage" />
                  <span>{event.venue}</span>
                </div>
              </div>

              <h1 className="event-full-title">{event.title}</h1>
              <p className="event-full-desc">{event.description}</p>
            </div>

            {/* Event Agenda & Schedule */}
            {event.agenda && (
              <div className="detail-section-card glass-card">
                <h3 className="section-subheading">Event Schedule & Itinerary</h3>
                <div className="agenda-timeline">
                  {event.agenda.map((item, idx) => (
                    <div key={idx} className="timeline-item">
                      <div className="timeline-time">{item.time}</div>
                      <div className="timeline-bullet"></div>
                      <div className="timeline-content">{item.activity}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Perks & Inclusions */}
            {event.perks && (
              <div className="detail-section-card glass-card">
                <h3 className="section-subheading">What's Included With Your Ticket</h3>
                <div className="perks-grid">
                  {event.perks.map((perk, idx) => (
                    <div key={idx} className="perk-item">
                      <CheckCircle2 size={16} className="text-sage" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Venue & Location Details */}
            <div className="detail-section-card glass-card">
              <h3 className="section-subheading">Venue & Entry Information</h3>
              <p className="venue-detail-text">
                <strong>{event.venue}</strong>
                <br />
                {event.address}
              </p>
              <div className="venue-notes">
                <span>🚪 Doors open 30 minutes prior to scheduled start time.</span>
                <span>📱 Please present your digital QR pass from CampusHub at check-in.</span>
                <span>♿ Accessible seating and elevators available via Grand Foyer.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Ticket Purchase & Member vs Non-Member Pricing */}
          <div className="details-sidebar-col">
            <div className="ticket-checkout-box glass-card">
              <div className="ticket-box-header">
                <div className="ticket-badge-row">
                  <Ticket size={18} className="text-sage" />
                  <span className="ticket-box-title">Reserve Tickets</span>
                </div>
                <span className="capacity-pill">
                  Capacity: {event.totalCapacity}
                </span>
              </div>

              {/* Explicit Pricing Challenge Comparison Box */}
              <div className="pricing-tier-comparison">
                <div className="pricing-tier-card member-tier">
                  <div className="tier-header">
                    <span className="tier-name">CampusHub Member</span>
                    <span className="badge badge-mint">Discounted</span>
                  </div>
                  <div className="tier-price">
                    <span className="currency">₹</span>
                    <span className="amount">{event.memberPrice.toFixed(2)}</span>
                    <span className="per">/ ticket</span>
                  </div>
                  <span className="tier-savings">Save ₹{(event.nonMemberPrice - event.memberPrice).toFixed(2)} per ticket</span>
                </div>

                <div className="pricing-tier-card non-member-tier">
                  <div className="tier-header">
                    <span className="tier-name">Non-Member Rate</span>
                    <span className="badge badge-subtle">Public</span>
                  </div>
                  <div className="tier-price">
                    <span className="currency">₹</span>
                    <span className="amount">{event.nonMemberPrice.toFixed(2)}</span>
                    <span className="per">/ ticket</span>
                  </div>
                  <span className="tier-subtext">Standard visitor pricing</span>
                </div>
              </div>

              {/* Member Discount Prompt for Visitors */}
              {!isMemberRateApplicable ? (
                <div className="member-unlock-banner">
                  <div className="unlock-top">
                    <Sparkles size={16} className="text-sage" />
                    <strong>Want the ₹{event.memberPrice.toFixed(2)} Member Rate?</strong>
                  </div>
                  <p>
                    Log in with your student account, or verify your Student ID below to unlock member pricing and save ₹{(event.nonMemberPrice - event.memberPrice).toFixed(2)}.
                  </p>
                  <div className="unlock-actions">
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('login')}>
                      Member Login
                    </button>
                  </div>

                  {/* Student ID fast verify */}
                  <div className="fast-verify-row">
                    <span>Already a member?</span>
                    <div className="verify-input-group">
                      <input
                        type="text"
                        placeholder="Student ID (STU-001)"
                        value={studentIdInput}
                        onChange={(e) => setStudentIdInput(e.target.value)}
                      />
                      <button type="button" onClick={handleVerifyStudentId}>
                        Verify
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="member-status-confirmed">
                  <CheckCircle2 size={16} />
                  <span>
                    <strong>Member Rate Active:</strong> Verified as {user ? user.name : studentIdInput}
                  </span>
                </div>
              )}

              {/* Booking Form */}
              {isSoldOut ? (
                <div className="sold-out-box">
                  <AlertCircle size={24} />
                  <h4>This Event is Sold Out</h4>
                  <p>All {event.totalCapacity} seats have been reserved. Check back for cancellations or join the waitlist.</p>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="ticket-form">
                  {/* Ticket Type Select */}
                  <div className="form-field">
                    <label>Select Ticket Type</label>
                    <div className="ticket-type-options">
                      {isMemberRateApplicable && (
                        <label className={`type-option-radio ${ticketType === 'MEMBER' ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="ticketType"
                            value="MEMBER"
                            checked={ticketType === 'MEMBER'}
                            onChange={() => setTicketType('MEMBER')}
                          />
                          <div className="option-label-wrap">
                            <span className="opt-title">Member Admission</span>
                            <span className="opt-price">₹{event.memberPrice.toFixed(2)}</span>
                          </div>
                        </label>
                      )}

                      <label className={`type-option-radio ${ticketType === 'NON_MEMBER' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="ticketType"
                          value="NON_MEMBER"
                          checked={ticketType === 'NON_MEMBER'}
                          onChange={() => setTicketType('NON_MEMBER')}
                        />
                        <div className="option-label-wrap">
                          <span className="opt-title">Non-Member Admission</span>
                          <span className="opt-price">₹{event.nonMemberPrice.toFixed(2)}</span>
                        </div>
                      </label>

                      {event.vipPrice && (
                        <label className={`type-option-radio ${ticketType === 'VIP' ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="ticketType"
                            value="VIP"
                            checked={ticketType === 'VIP'}
                            onChange={() => setTicketType('VIP')}
                          />
                          <div className="option-label-wrap">
                            <span className="opt-title">VIP Reserved Seat</span>
                            <span className="opt-price">₹{event.vipPrice.toFixed(2)}</span>
                          </div>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="form-field">
                    <div className="label-with-seats">
                      <label>Number of Tickets</label>
                      <span className="seats-avail-note">({event.remainingSeats} seats remain)</span>
                    </div>
                    <select
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                      className="quantity-select"
                    >
                      {Array.from({ length: maxAvailableToSelect }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? 'Ticket' : 'Tickets'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Attendee Details */}
                  <div className="form-field">
                    <label>Primary Attendee Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alice Johnson"
                      value={attendeeName}
                      onChange={(e) => setAttendeeName(e.target.value)}
                      className="text-input"
                    />
                  </div>

                  <div className="form-field">
                    <label>Contact Email (for Digital Pass delivery)</label>
                    <input
                      type="email"
                      required
                      placeholder="student@university.edu"
                      value={attendeeEmail}
                      onChange={(e) => setAttendeeEmail(e.target.value)}
                      className="text-input"
                    />
                  </div>

                  {/* Pricing Total Summary */}
                  <div className="pricing-summary-box">
                    <div className="summary-row">
                      <span>Rate:</span>
                      <span>₹{unitPrice.toFixed(2)} × {quantity}</span>
                    </div>
                    <div className="summary-row total-row">
                      <strong>Total Due:</strong>
                      <strong className="final-price">₹{totalPrice.toFixed(2)}</strong>
                    </div>
                    <span className="fee-waiver-note">No additional booking or handling fees.</span>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg book-submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span>Reserving Seat...</span>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        <span>Reserve & Generate QR Ticket</span>
                      </>
                    )}
                  </button>

                  <div className="guarantee-note">
                    <ShieldCheck size={14} className="text-sage" />
                    <span>Instant Digital QR pass generated upon reservation</span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .event-details-page {
          padding-bottom: 80px;
        }

        .details-top-bar {
          background: #ebf5ee;
          border-bottom: 1px solid var(--border-light);
          padding: 14px 0;
          margin-bottom: 32px;
        }

        .back-link-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: none;
          color: var(--color-primary);
          font-weight: 700;
          font-size: 0.92rem;
          cursor: pointer;
        }

        .back-link-btn:hover {
          text-decoration: underline;
        }

        .details-grid {
          display: grid;
          grid-template-columns: 1.35fr 0.9fr;
          gap: 40px;
          align-items: flex-start;
        }

        .event-hero-media {
          position: relative;
          height: 340px;
          overflow: hidden;
          margin-bottom: 24px;
        }

        .hero-banner-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .media-overlay-tags {
          position: absolute;
          top: 18px;
          left: 18px;
          display: flex;
          gap: 8px;
        }

        .event-header-info {
          margin-bottom: 28px;
        }

        .event-meta-pill-strip {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 14px;
        }

        .meta-pill {
          display: flex;
          align-items: center;
          gap: 7px;
          background: #ffffff;
          border: 1px solid var(--border-light);
          padding: 6px 14px;
          border-radius: var(--radius-full);
          font-size: 0.84rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .event-full-title {
          font-size: 2.2rem;
          color: var(--color-primary-dark);
          line-height: 1.2;
          margin-bottom: 14px;
        }

        .event-full-desc {
          font-size: 1.05rem;
          color: var(--text-secondary);
          line-height: 1.65;
        }

        .detail-section-card {
          padding: 24px;
          margin-bottom: 24px;
          background: #ffffff;
        }

        .section-subheading {
          font-size: 1.2rem;
          color: var(--color-primary-dark);
          margin-bottom: 18px;
          border-bottom: 1px solid var(--border-light);
          padding-bottom: 10px;
        }

        /* Agenda Timeline */
        .agenda-timeline {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .timeline-item {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .timeline-time {
          width: 110px;
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--color-primary);
        }

        .timeline-bullet {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--color-sage);
        }

        .timeline-content {
          flex: 1;
          font-size: 0.92rem;
          color: var(--text-primary);
        }

        /* Perks */
        .perks-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .perk-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        /* Venue */
        .venue-detail-text {
          font-size: 0.95rem;
          color: var(--text-primary);
          margin-bottom: 12px;
          line-height: 1.5;
        }

        .venue-notes {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 0.84rem;
          color: var(--text-muted);
        }

        /* Right Column Ticket Checkout */
        .ticket-checkout-box {
          background: #ffffff;
          padding: 24px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-accent);
          position: sticky;
          top: 90px;
        }

        .ticket-box-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .ticket-badge-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ticket-box-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--color-primary-dark);
        }

        .capacity-pill {
          background: #ebf6ee;
          color: var(--color-primary);
          padding: 4px 10px;
          border-radius: var(--radius-full);
          font-size: 0.76rem;
          font-weight: 700;
        }

        /* Tier Comparison */
        .pricing-tier-comparison {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }

        .pricing-tier-card {
          padding: 14px;
          border-radius: var(--radius-sm);
          display: flex;
          flex-direction: column;
          border: 1px solid var(--border-light);
        }

        .member-tier {
          background: #f1f8f3;
          border-color: var(--color-sage);
        }

        .non-member-tier {
          background: var(--bg-subtle);
        }

        .tier-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .tier-name {
          font-size: 0.76rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .badge-subtle {
          background: #e2ede5;
          color: var(--text-muted);
        }

        .tier-price {
          display: flex;
          align-items: baseline;
          line-height: 1;
          margin-bottom: 4px;
        }

        .currency {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--color-primary);
        }

        .amount {
          font-size: 1.45rem;
          font-weight: 800;
          color: var(--color-primary-dark);
        }

        .per {
          font-size: 0.72rem;
          color: var(--text-muted);
          margin-left: 4px;
        }

        .tier-savings {
          font-size: 0.72rem;
          color: var(--color-primary);
          font-weight: 700;
        }

        .tier-subtext {
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        /* Member Unlock Banner */
        .member-unlock-banner {
          background: #fff8e8;
          border: 1px solid #f6e2b3;
          padding: 14px;
          border-radius: var(--radius-sm);
          margin-bottom: 20px;
        }

        .unlock-top {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #92540c;
          font-size: 0.86rem;
          margin-bottom: 4px;
        }

        .member-unlock-banner p {
          font-size: 0.8rem;
          color: #724b17;
          margin-bottom: 10px;
          line-height: 1.35;
        }

        .unlock-actions {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .fast-verify-row {
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 0.76rem;
          color: #724b17;
          border-top: 1px dashed #e6c88b;
          padding-top: 8px;
        }

        .verify-input-group {
          display: flex;
          gap: 6px;
        }

        .verify-input-group input {
          flex: 1;
          padding: 6px 10px;
          border-radius: 4px;
          border: 1px solid #d4b882;
          font-size: 0.78rem;
        }

        .verify-input-group button {
          background: #724b17;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 0.76rem;
          font-weight: 700;
          cursor: pointer;
        }

        .member-status-confirmed {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--color-pastel-soft);
          color: var(--color-primary-dark);
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          font-size: 0.84rem;
          margin-bottom: 20px;
        }

        /* Sold Out */
        .sold-out-box {
          background: #fdf2f2;
          border: 1px solid #facdcd;
          padding: 24px;
          border-radius: var(--radius-sm);
          text-align: center;
          color: #9c2e2e;
        }

        .sold-out-box h4 {
          margin: 8px 0;
          color: #9c2e2e;
        }

        /* Ticket Form */
        .ticket-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-field label {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .label-with-seats {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .seats-avail-note {
          font-size: 0.76rem;
          color: var(--color-primary);
          font-weight: 600;
        }

        .ticket-type-options {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .type-option-radio {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border: 1.5px solid var(--border-light);
          border-radius: var(--radius-sm);
          cursor: pointer;
          background: #ffffff;
          transition: all var(--transition-fast);
        }

        .type-option-radio.selected {
          border-color: var(--color-primary);
          background: #f1f8f3;
        }

        .option-label-wrap {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .opt-title {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .opt-price {
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--color-primary-dark);
        }

        .quantity-select, .text-input {
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
          background: #ffffff;
          font-size: 0.9rem;
          outline: none;
        }

        .quantity-select:focus, .text-input:focus {
          border-color: var(--color-sage);
        }

        .pricing-summary-box {
          background: var(--bg-subtle);
          padding: 14px;
          border-radius: var(--radius-sm);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.88rem;
          color: var(--text-secondary);
        }

        .summary-row.total-row {
          border-top: 1px dashed var(--border-light);
          padding-top: 8px;
          margin-top: 4px;
          font-size: 1.05rem;
          color: var(--color-primary-dark);
        }

        .final-price {
          font-size: 1.25rem;
          color: var(--color-primary);
        }

        .fee-waiver-note {
          font-size: 0.72rem;
          color: var(--color-sage);
          font-weight: 600;
        }

        .book-submit-btn {
          width: 100%;
        }

        .guarantee-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 0.76rem;
          color: var(--text-muted);
          text-align: center;
        }

        @media (max-width: 960px) {
          .details-grid {
            grid-template-columns: 1fr;
          }
          .ticket-checkout-box {
            position: static;
          }
        }
      `}</style>
    </div>
  );
}
