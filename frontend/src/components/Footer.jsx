import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, ShoppingBag, Mail, MapPin, Phone, Heart, ArrowRight, ShieldCheck, Check } from 'lucide-react';

export default function Footer() {
  const { navigate, addToast } = useApp();
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      addToast('Invalid Email', 'Please enter a valid email address', 'warning');
      return;
    }
    setSubscribed(true);
    addToast('Subscribed!', 'You will now receive weekly campus event alerts and merchandise drops.', 'success');
  };

  return (
    <footer className="footer-section">
      <div className="container">
        {/* Footer Top Grid */}
        <div className="footer-grid">
          {/* Col 1: Brand & Purpose */}
          <div className="footer-col brand-col">
            <div className="footer-brand" onClick={() => navigate('home')}>
              <div className="brand-logo-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-0-5H20" />
                  <path d="m9 10 2 2 4-4" />
                </svg>
              </div>
              <div className="brand-title">CampusHub</div>
            </div>
            <p className="footer-bio">
              The unified digital platform and central operating system for Skyline Student Association. Connecting campus events, digital ticketing, club merchandise, and member activities.
            </p>
            <div className="contact-capsules">
              <div className="contact-item">
                <MapPin size={15} />
                <span>Student Center, Room 304</span>
              </div>
              <div className="contact-item">
                <Phone size={15} />
                <span>+1 (555) 234-5678</span>
              </div>
              <div className="contact-item">
                <Mail size={15} />
                <span>info@campushub.edu</span>
              </div>
            </div>
          </div>

          {/* Col 2: Navigation & Quick Actions */}
          <div className="footer-col">
            <h4 className="footer-heading">Public Portals</h4>
            <ul className="footer-links">
              <li><button onClick={() => navigate('home')}>Home Overview</button></li>
              <li><button onClick={() => navigate('events')}>Upcoming Events & Tickets</button></li>
              <li><button onClick={() => navigate('store')}>Campus Merchandise Store</button></li>
              <li><button onClick={() => navigate('about')}>About Skyline Association</button></li>
              <li><button onClick={() => navigate('login')}>Student Portal Login</button></li>
            </ul>
          </div>

          {/* Col 3: Community & Benefits */}
          <div className="footer-col">
            <h4 className="footer-heading">Member Privileges</h4>
            <ul className="footer-links">
              <li><span className="bullet-leaf">🌱</span> Up to 50% Off Event Tickets</li>
              <li><span className="bullet-leaf">🌱</span> Special Member Store Discounts</li>
              <li><span className="bullet-leaf">🌱</span> Instant QR Digital Passes</li>
              <li><span className="bullet-leaf">🌱</span> Priority Fest Pre-sales</li>
              <li><span className="bullet-leaf">🌱</span> Volunteer Grants & Funding</li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div className="footer-col newsletter-col">
            <h4 className="footer-heading">Stay in the Loop</h4>
            <p className="newsletter-text">
              Subscribe to weekly announcements, ticket releases, and volunteer opportunities directly to your student inbox.
            </p>
            {!subscribed ? (
              <form onSubmit={handleSubscribe} className="newsletter-form">
                <input
                  type="email"
                  placeholder="student@university.edu"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="newsletter-input"
                  required
                />
                <button type="submit" className="btn btn-primary btn-sm newsletter-submit">
                  <span>Subscribe</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            ) : (
              <div className="subscribed-success">
                <Check size={16} />
                <span>Thank you for subscribing! Check your inbox soon.</span>
              </div>
            )}
            <div className="trust-indicator">
              <ShieldCheck size={16} />
              <span>Official Skyline Student Association Service</span>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-text">
            © {new Date().getFullYear()} CampusHub • Skyline Student Association. All rights reserved.
          </div>
          <div className="footer-bottom-links">
            <span>Pastel Green Theme</span>
            <span>•</span>
            <button onClick={() => navigate('about')}>Executive Board</button>
            <span>•</span>
            <button onClick={() => navigate('events')}>Public Calendar</button>
          </div>
        </div>
      </div>

      <style>{`
        .footer-section {
          background-color: #ebf5ee;
          border-top: 1px solid var(--border-light);
          padding: 64px 0 24px;
          margin-top: 80px;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1.3fr;
          gap: 40px;
          padding-bottom: 48px;
          border-bottom: 1px solid #d8ebd9;
        }

        .brand-col .footer-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          margin-bottom: 14px;
        }

        .brand-col .brand-title {
          font-family: var(--font-heading);
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--color-primary-dark);
        }

        .footer-bio {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 18px;
        }

        .contact-capsules {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.84rem;
          color: var(--text-muted);
        }

        .footer-heading {
          font-size: 0.95rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-primary-dark);
          margin-bottom: 18px;
        }

        .footer-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .footer-links li button {
          background: transparent;
          border: none;
          padding: 0;
          font-size: 0.88rem;
          color: var(--text-secondary);
          cursor: pointer;
          text-align: left;
          transition: color var(--transition-fast);
        }

        .footer-links li button:hover {
          color: var(--color-primary);
          text-decoration: underline;
        }

        .footer-links li span {
          font-size: 0.88rem;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .bullet-leaf {
          font-size: 0.8rem;
        }

        .newsletter-text {
          font-size: 0.88rem;
          color: var(--text-secondary);
          margin-bottom: 14px;
          line-height: 1.5;
        }

        .newsletter-form {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .newsletter-input {
          flex: 1;
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
          background: #ffffff;
          font-size: 0.88rem;
          outline: none;
        }

        .newsletter-input:focus {
          border-color: var(--color-sage);
        }

        .subscribed-success {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--color-pastel-soft);
          color: var(--color-primary-dark);
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          font-size: 0.84rem;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .trust-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          color: var(--color-sage);
          font-weight: 600;
        }

        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 24px;
          font-size: 0.82rem;
          color: var(--text-muted);
          flex-wrap: wrap;
          gap: 12px;
        }

        .footer-bottom-links {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .footer-bottom-links button {
          background: transparent;
          border: none;
          color: inherit;
          cursor: pointer;
        }

        .footer-bottom-links button:hover {
          color: var(--color-primary);
        }

        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 32px;
          }
        }

        @media (max-width: 600px) {
          .footer-grid {
            grid-template-columns: 1fr;
          }
          .footer-bottom {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
