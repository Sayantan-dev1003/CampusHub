import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Compass,
  Heart,
  Target,
  Sparkles,
  Users,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { LEADERSHIP_TEAM, FAQS } from '../data/mockData';

export default function AboutPage() {
  const { addToast } = useApp();

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('General Inquiry');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      addToast('Missing Fields', 'Please complete all required fields.', 'warning');
      return;
    }

    setIsSubmittingContact(true);
    setTimeout(() => {
      setIsSubmittingContact(false);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      addToast('Message Dispatched!', 'Thank you! The executive committee will respond within 24 business hours.', 'success');
    }, 600);
  };

  const toggleFaq = (idx) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  return (
    <div className="about-page fade-in">
      {/* Header Banner */}
      <section className="about-header-banner">
        <div className="container">
          <div className="about-header-content text-center">
            <span className="badge badge-mint banner-pill">Our Organization</span>
            <h1 className="about-title">Skyline Student Association</h1>
            <p className="about-lead">
              Serving as the heart of university student life since 2012. We foster student empowerment, vibrant campus traditions, and unified club operations through CampusHub.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-grid">
            <div className="mission-card glass-card">
              <div className="icon-circle">
                <Target size={24} className="text-sage" />
              </div>
              <h3>Our Mission</h3>
              <p>
                To advocate for student welfare, cultivate inclusive campus communities, and deliver seamless access to cultural events, academic hackathons, and student services through transparent digital leadership.
              </p>
            </div>

            <div className="mission-card glass-card">
              <div className="icon-circle">
                <Sparkles size={24} className="text-sage" />
              </div>
              <h3>Our Vision</h3>
              <p>
                A connected campus where every student has an equal voice, club organizers can operate effortlessly without paperwork bottlenecks, and school spirit flourishes.
              </p>
            </div>

            <div className="mission-card glass-card">
              <div className="icon-circle">
                <Heart size={24} className="text-sage" />
              </div>
              <h3>Core Values</h3>
              <p>
                Integrity, inclusivity, student-led innovation, financial transparency for every dollar raised, and sustainable campus stewardship.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The CampusHub Origin Story */}
      <section className="story-section">
        <div className="container">
          <div className="story-box glass-card">
            <div className="story-content">
              <span className="badge badge-mint story-badge">The Central Operating System</span>
              <h2>Why We Built CampusHub</h2>
              <p>
                In previous years, student activities were scattered across confusing spreadsheets, manual cash ticket sales, paper notebooks for treasurer ledgers, and fragmented WhatsApp groups.
              </p>
              <p>
                <strong>CampusHub brings it all into one central operating system.</strong> From public event discovery with tiered member pricing, to digital QR ticketing, official merchandise orders, volunteer task coordination, and transparent budgeting, everything works harmoniously together.
              </p>
            </div>
            <div className="story-stats-box">
              <div className="story-stat-item">
                <strong>100%</strong>
                <span>Paperless Digital Ticketing</span>
              </div>
              <div className="story-stat-item">
                <strong>1,250+</strong>
                <span>Enrolled Active Students</span>
              </div>
              <div className="story-stat-item">
                <strong>18</strong>
                <span>Affiliated Campus Societies</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership & Executive Committee */}
      <section className="leadership-section">
        <div className="container">
          <div className="section-header-row text-center" style={{ display: 'block', maxWidth: '700px', margin: '0 auto 48px' }}>
            <span className="badge badge-mint section-pill">Student Leaders</span>
            <h2 className="section-heading">Executive Leadership Board</h2>
            <p className="section-subtext">
              Elected by students, for students. Meet the committee dedicated to driving campus life this academic year.
            </p>
          </div>

          <div className="leadership-grid">
            {LEADERSHIP_TEAM.map((member) => (
              <div key={member.name} className="leader-card glass-card">
                <div className="leader-img-wrapper">
                  <img src={member.image} alt={member.name} className="leader-photo" />
                  <span className="leader-role-tag">{member.role}</span>
                </div>
                <div className="leader-body">
                  <h3 className="leader-name">{member.name}</h3>
                  <span className="leader-major">{member.major}</span>
                  <p className="leader-bio">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Campus Activities & Initiatives */}
      <section className="activities-section">
        <div className="container">
          <div className="section-header-row">
            <div>
              <span className="badge badge-mint section-pill">What We Do</span>
              <h2 className="section-heading">Key Activities & Signature Initiatives</h2>
              <p className="section-subtext">
                Every semester, the association hosts a wide array of programs covering all aspects of university experience.
              </p>
            </div>
          </div>

          <div className="activities-grid">
            <div className="activity-card glass-card">
              <div className="activity-number">01</div>
              <h3>Annual Spring Gala</h3>
              <p>
                Our signature black-tie event celebrating student achievements, club milestones, and senior farewells in the University Grand Hall.
              </p>
            </div>

            <div className="activity-card glass-card">
              <div className="activity-number">02</div>
              <h3>Innovation Hackathon & Tech Expo</h3>
              <p>
                A 24-hour inter-disciplinary challenge connecting engineering, design, and business students to build real software and hardware prototypes.
              </p>
            </div>

            <div className="activity-card glass-card">
              <div className="activity-number">03</div>
              <h3>Charity Drives & Bake Sales</h3>
              <p>
                Grassroots fundraising projects led by student volunteers that provide scholarships and support local community educational causes.
              </p>
            </div>

            <div className="activity-card glass-card">
              <div className="activity-number">04</div>
              <h3>Student Leadership Summits</h3>
              <p>
                Workshops on budgeting, conflict resolution, public speaking, and project management with alumni mentors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="faqs-section">
        <div className="container">
          <div className="section-header-row text-center" style={{ display: 'block', maxWidth: '640px', margin: '0 auto 40px' }}>
            <span className="badge badge-mint section-pill">Got Questions?</span>
            <h2 className="section-heading">Frequently Asked Questions</h2>
            <p className="section-subtext">Everything you need to know about joining and navigating CampusHub.</p>
          </div>

          <div className="faqs-list">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className={`faq-accordion-item glass-card ${activeFaq === idx ? 'expanded' : ''}`}
                onClick={() => toggleFaq(idx)}
              >
                <div className="faq-question-row">
                  <span className="faq-q-text">{faq.q}</span>
                  <ChevronDown size={18} className={`faq-chevron ${activeFaq === idx ? 'rotated' : ''}`} />
                </div>
                {activeFaq === idx && (
                  <div className="faq-answer-body fade-in">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Information & Interactive Form */}
      <section className="contact-section">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Info Col */}
            <div className="contact-info-col">
              <span className="badge badge-mint section-pill">Get In Touch</span>
              <h2 className="contact-heading">Visit Us or Send a Note</h2>
              <p className="contact-subtext">
                Whether you have questions about joining, want to sponsor an event, or have ideas for student life, our executive team is here for you.
              </p>

              <div className="contact-details-list">
                <div className="contact-block">
                  <div className="c-icon-wrap">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <strong>Headquarters</strong>
                    <p>Student Center, Room 304, 3rd Floor East Wing<br />100 University Avenue</p>
                  </div>
                </div>

                <div className="contact-block">
                  <div className="c-icon-wrap">
                    <Clock size={20} />
                  </div>
                  <div>
                    <strong>Office Hours</strong>
                    <p>Monday – Friday: 10:00 AM – 4:00 PM<br />Saturday: 11:00 AM – 2:00 PM</p>
                  </div>
                </div>

                <div className="contact-block">
                  <div className="c-icon-wrap">
                    <Phone size={20} />
                  </div>
                  <div>
                    <strong>Telephone</strong>
                    <p>+1 (555) 234-5678</p>
                  </div>
                </div>

                <div className="contact-block">
                  <div className="c-icon-wrap">
                    <Mail size={20} />
                  </div>
                  <div>
                    <strong>Electronic Mail</strong>
                    <p>info@campushub.edu • president@campushub.edu</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Form Col */}
            <div className="contact-form-col">
              <form onSubmit={handleContactSubmit} className="contact-form-card glass-card">
                <h3 className="form-card-title">Send a Direct Message</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maya Lin"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Student Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="student@university.edu"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Subject / Topic</label>
                  <select
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Membership & Dues">Membership & Dues</option>
                    <option value="Event Tickets & Galas">Event Tickets & Galas</option>
                    <option value="Merchandise Inquiries">Merchandise Inquiries</option>
                    <option value="Volunteer Opportunities">Volunteer Opportunities</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Message / Details *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="How can we assist you today? Feel free to share feedback or event questions."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg submit-contact-btn"
                  disabled={isSubmittingContact}
                >
                  {isSubmittingContact ? (
                    <span>Sending Message...</span>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Send Message to Committee</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .about-page {
          padding-bottom: 80px;
        }

        .about-header-banner {
          background: linear-gradient(135deg, #eaf5ee 0%, #f4f8f5 100%);
          padding: 64px 0 44px;
          border-bottom: 1px solid var(--border-light);
        }

        .about-header-content {
          max-width: 720px;
          margin: 0 auto;
        }

        .about-title {
          font-size: 2.8rem;
          color: var(--color-primary-dark);
          line-height: 1.15;
          margin-bottom: 14px;
        }

        .about-lead {
          font-size: 1.12rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .mission-section {
          margin-top: -30px;
          margin-bottom: 60px;
        }

        .mission-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .mission-card {
          padding: 32px 24px;
          background: #ffffff;
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .icon-circle {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: var(--color-pastel-soft);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mission-card h3 {
          font-size: 1.25rem;
          color: var(--color-primary-dark);
        }

        .mission-card p {
          font-size: 0.92rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* Story */
        .story-section {
          padding-bottom: 60px;
        }

        .story-box {
          background: #ffffff;
          padding: 44px;
          border-radius: var(--radius-lg);
          display: grid;
          grid-template-columns: 1.4fr 0.9fr;
          gap: 40px;
          align-items: center;
        }

        .story-badge {
          margin-bottom: 12px;
        }

        .story-content h2 {
          font-size: 1.9rem;
          color: var(--color-primary-dark);
          margin-bottom: 14px;
        }

        .story-content p {
          font-size: 0.96rem;
          color: var(--text-secondary);
          line-height: 1.65;
          margin-bottom: 12px;
        }

        .story-stats-box {
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: #f1f8f3;
          border: 1px solid var(--border-accent);
          padding: 24px;
          border-radius: var(--radius-md);
        }

        .story-stat-item {
          display: flex;
          flex-direction: column;
        }

        .story-stat-item strong {
          font-size: 2rem;
          font-weight: 800;
          color: var(--color-primary);
          line-height: 1;
        }

        .story-stat-item span {
          font-size: 0.84rem;
          color: var(--text-secondary);
          font-weight: 600;
        }

        /* Leadership */
        .leadership-section {
          padding: 60px 0;
          background: #ebf5ee;
          border-top: 1px solid var(--border-light);
          border-bottom: 1px solid var(--border-light);
        }

        .leadership-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .leader-card {
          overflow: hidden;
          background: #ffffff;
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
        }

        .leader-img-wrapper {
          position: relative;
          height: 240px;
        }

        .leader-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .leader-role-tag {
          position: absolute;
          bottom: 12px;
          left: 12px;
          background: rgba(27, 67, 50, 0.9);
          color: white;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          font-size: 0.74rem;
          font-weight: 700;
          backdrop-filter: blur(4px);
        }

        .leader-body {
          padding: 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .leader-name {
          font-size: 1.15rem;
          color: var(--color-primary-dark);
          margin-bottom: 4px;
        }

        .leader-major {
          font-size: 0.78rem;
          color: var(--color-sage);
          font-weight: 600;
          margin-bottom: 12px;
          display: block;
        }

        .leader-bio {
          font-size: 0.84rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        /* Activities */
        .activities-section {
          padding: 70px 0;
        }

        .activities-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .activity-card {
          padding: 24px;
          background: #ffffff;
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
        }

        .activity-number {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--color-pastel-light);
          margin-bottom: 12px;
        }

        .activity-card h3 {
          font-size: 1.15rem;
          color: var(--color-primary-dark);
          margin-bottom: 8px;
        }

        .activity-card p {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        /* FAQs */
        .faqs-section {
          padding: 60px 0;
          background: #ffffff;
          border-top: 1px solid var(--border-light);
          border-bottom: 1px solid var(--border-light);
        }

        .faqs-list {
          max-width: 780px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .faq-accordion-item {
          padding: 18px 24px;
          background: var(--bg-subtle);
          border-radius: var(--radius-sm);
          cursor: pointer;
        }

        .faq-question-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .faq-q-text {
          font-weight: 700;
          font-size: 1rem;
          color: var(--color-primary-dark);
        }

        .faq-chevron {
          color: var(--text-muted);
          transition: transform var(--transition-fast);
        }

        .faq-chevron.rotated {
          transform: rotate(180deg);
        }

        .faq-answer-body {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid var(--border-light);
          font-size: 0.92rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* Contact Section */
        .contact-section {
          padding: 70px 0;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 48px;
        }

        .contact-heading {
          font-size: 2.1rem;
          color: var(--color-primary-dark);
          margin-bottom: 12px;
        }

        .contact-subtext {
          font-size: 1rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 28px;
        }

        .contact-details-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .contact-block {
          display: flex;
          gap: 16px;
        }

        .c-icon-wrap {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: var(--color-pastel-soft);
          color: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .contact-block strong {
          font-size: 0.95rem;
          color: var(--color-primary-dark);
          display: block;
          margin-bottom: 2px;
        }

        .contact-block p {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.45;
        }

        /* Form Card */
        .contact-form-card {
          padding: 32px;
          background: #ffffff;
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-card-title {
          font-size: 1.35rem;
          color: var(--color-primary-dark);
          margin-bottom: 8px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .form-group input, .form-group select, .form-group textarea {
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
          font-size: 0.9rem;
          outline: none;
        }

        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
          border-color: var(--color-sage);
        }

        .submit-contact-btn {
          margin-top: 8px;
          width: 100%;
        }

        @media (max-width: 1024px) {
          .leadership-grid, .activities-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .story-box {
            grid-template-columns: 1fr;
          }
          .contact-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .mission-grid {
            grid-template-columns: 1fr;
          }
          .leadership-grid, .activities-grid {
            grid-template-columns: 1fr;
          }
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
