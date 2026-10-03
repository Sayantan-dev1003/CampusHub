import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Tag,
  Clock,
  MapPin,
  TrendingUp,
  Award,
  Bell,
  HeartHandshake,
  User
} from 'lucide-react';
import { MEMBERSHIP_BENEFITS, INITIAL_ANNOUNCEMENTS } from '../data/mockData';

export default function HomePage() {
  const { navigate, events, products, user } = useApp();

  const featuredEvents = events.slice(0, 3);
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="home-page fade-in">
      {/* =========================================================================
          HERO SECTION
          ========================================================================= */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="pulsing-dot"></span>
              <span>Skyline Student Association Operating System</span>
            </div>

            <h1 className="hero-title">
              Empowering Student Life, <span className="highlight-text">Campus Events</span> & Community.
            </h1>

            <p className="hero-subtitle">
              CampusHub is the unified platform for the Skyline Student Association. Discover high-energy galas, grab discounted official merchandise, connect with student clubs, and unlock member perks with your digital student pass.
            </p>

            {/* Quick Actions */}
            <div className="hero-quick-actions">
              <button
                className="btn btn-primary btn-lg"
                onClick={() => navigate('events')}
              >
                <Calendar size={18} />
                <span>View Events & Tickets</span>
              </button>

              <button
                className="btn btn-secondary btn-lg"
                onClick={() => navigate('store')}
              >
                <ShoppingBag size={18} />
                <span>View Merchandise</span>
              </button>

              {!user && (
                <button
                  className="btn btn-outline btn-lg"
                  onClick={() => navigate('login')}
                >
                  <User size={18} />
                  <span>Student Login</span>
                </button>
              )}
            </div>

            {/* Trust Points */}
            <div className="hero-trust-row">
              <div className="trust-pill">
                <CheckCircle2 size={16} className="text-sage" />
                <span>Official Campus System</span>
              </div>
              <div className="trust-pill">
                <CheckCircle2 size={16} className="text-sage" />
                <span>Tiered Member Pricing</span>
              </div>
              <div className="trust-pill">
                <CheckCircle2 size={16} className="text-sage" />
                <span>Instant QR Check-ins</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Card / Showcase */}
          <div className="hero-visual">
            <div className="hero-card-stack">
              <div className="hero-main-card glass-card">
                <div className="hero-card-badge">
                  <span className="badge badge-mint">Annual College Fest</span>
                  <span className="badge badge-member">142 Seats Left</span>
                </div>
                <img
                  src="/assets/fest.jpg"
                  alt="Annual Cultural Fest Preview"
                  className="hero-card-img"
                />
                <div className="hero-card-details">
                  <h3>Skyline Annual Cultural Fest & Band Night 2026</h3>
                  <div className="hero-card-meta">
                    <span><Calendar size={13} /> Apr 15 • Main Auditorium</span>
                    <span className="price-tag-highlight">Member: ₹149.00 <span className="strike">₹299.00</span></span>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', marginTop: '10px' }}
                    onClick={() => navigate('event-details', { id: 'evt-cultural-fest-2026' })}
                  >
                    <span>View Event & Reserve Seat</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* Floating Merch Teaser Card */}
              <div className="hero-float-card glass-card">
                <img src="/assets/hoodie.jpg" alt="Collegiate Hoodie" className="float-thumb" />
                <div className="float-info">
                  <span className="float-label">Official Apparel</span>
                  <strong>Pastel Sage Hoodie</strong>
                  <span className="float-price">₹1,099 Member Price</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          KEY STATS RIBBON
          ========================================================================= */}
      <section className="stats-ribbon">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <Users size={22} />
              </div>
              <div>
                <h3 className="stat-number">1,250+</h3>
                <span className="stat-label">Active Members Enrolled</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <Calendar size={22} />
              </div>
              <div>
                <h3 className="stat-number">48+</h3>
                <span className="stat-label">Annual Campus Events</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <Tag size={22} />
              </div>
              <div>
                <h3 className="stat-number">Up to 40%</h3>
                <span className="stat-label">Member Ticket Discounts</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper">
                <HeartHandshake size={22} />
              </div>
              <div>
                <h3 className="stat-number">₹1,20,000+</h3>
                <span className="stat-label">Raised for Student Initiatives</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          UPCOMING EVENTS PREVIEW
          ========================================================================= */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header-row">
            <div>
              <div className="badge badge-mint section-pill">Live Calendar</div>
              <h2 className="section-heading">Upcoming Campus Events</h2>
              <p className="section-subtext">
                Browse publicly available events, reserve tickets early, and access exclusive member savings.
              </p>
            </div>
            <button className="btn btn-outline" onClick={() => navigate('events')}>
              <span>View All Events</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="events-grid">
            {featuredEvents.map((evt) => (
              <div key={evt.id} className="event-card glass-card">
                <div className="event-card-media">
                  <img src={evt.banner || '/assets/gala.jpg'} alt={evt.title} className="event-img" />
                  <span className="event-category-tag">{evt.category}</span>
                  <div className="event-seat-indicator">
                    <span className="seat-pulse"></span>
                    <span>{evt.remainingSeats} seats available</span>
                  </div>
                </div>

                <div className="event-card-body">
                  <div className="event-date-row">
                    <Calendar size={14} className="text-sage" />
                    <span>{evt.date}</span>
                    <span className="dot-sep">•</span>
                    <Clock size={14} className="text-sage" />
                    <span>{evt.time}</span>
                  </div>

                  <h3 className="event-card-title">{evt.title}</h3>
                  <p className="event-card-desc">{evt.description.substring(0, 110)}...</p>

                  <div className="event-venue-row">
                    <MapPin size={14} className="text-muted" />
                    <span>{evt.venue}</span>
                  </div>

                  {/* Member vs Non-Member Pricing Display */}
                  <div className="event-pricing-box">
                    <div className="price-item member-price-item">
                      <span className="price-type">Member Rate</span>
                      <strong className="price-value">₹{evt.memberPrice.toFixed(2)}</strong>
                    </div>
                    <div className="price-divider"></div>
                    <div className="price-item non-member-price-item">
                      <span className="price-type">Non-Member</span>
                      <span className="price-value-standard">₹{evt.nonMemberPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="event-card-action">
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                      onClick={() => navigate('event-details', { id: evt.id })}
                    >
                      <span>View Event & Register</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          MEMBERSHIP BENEFITS SECTION
          ========================================================================= */}
      <section className="benefits-section">
        <div className="container">
          <div className="benefits-header text-center">
            <div className="badge badge-mint section-pill">Why Join?</div>
            <h2 className="section-heading">Skyline Membership Privileges</h2>
            <p className="section-subtext">
              Becoming an active CampusHub member pays for itself immediately with discounted tickets, store perks, and leadership opportunities.
            </p>
          </div>

          <div className="benefits-grid">
            {MEMBERSHIP_BENEFITS.map((ben) => (
              <div key={ben.id} className="benefit-card glass-card">
                <div className="benefit-icon-box">
                  <Sparkles size={20} className="text-sage" />
                </div>
                <h3 className="benefit-title">{ben.title}</h3>
                <p className="benefit-desc">{ben.description}</p>
              </div>
            ))}
          </div>

          <div className="membership-cta-banner glass-card">
            <div className="cta-banner-text">
              <h3>Experience vibrant college campus life</h3>
              <p>Explore upcoming fests, hackathons, and exclusive student merchandise.</p>
            </div>
            <div className="cta-banner-actions">
              <button className="btn btn-primary btn-lg" onClick={() => navigate('events')}>
                <span>Browse Campus Events</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FEATURED MERCHANDISE STORE
          ========================================================================= */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header-row">
            <div>
              <div className="badge badge-mint section-pill">Student Store</div>
              <h2 className="section-heading">Featured Club Merchandise</h2>
              <p className="section-subtext">
                Wear your school pride. Handcrafted apparel in signature pastel sage & mint shades with sustainable organic fabrics.
              </p>
            </div>
            <button className="btn btn-outline" onClick={() => navigate('store')}>
              <span>Visit Full Store</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="products-grid">
            {featuredProducts.map((prod) => {
              const totalStock = prod.variants.reduce((sum, v) => sum + v.quantity, 0);
              const isLowStock = totalStock > 0 && totalStock <= 25;
              const isOutOfStock = totalStock === 0;

              return (
                <div
                  key={prod.id}
                  className="product-card glass-card"
                  onClick={() => navigate('product-details', { id: prod.id })}
                >
                  <div className="product-media">
                    <img src={prod.image} alt={prod.name} className="product-img" />
                    {prod.badge && (
                      <span className="product-badge-pill">{prod.badge}</span>
                    )}
                    <span className={`stock-badge ${isOutOfStock ? 'badge-outstock' : isLowStock ? 'badge-lowstock' : 'badge-instock'}`}>
                      {isOutOfStock ? 'Out of Stock' : isLowStock ? `Only ${totalStock} left!` : 'In Stock'}
                    </span>
                  </div>

                  <div className="product-card-body">
                    <span className="product-category">{prod.category}</span>
                    <h3 className="product-name">{prod.name}</h3>

                    <div className="product-price-row">
                      <div className="price-primary">
                        ₹{prod.price.toFixed(2)}
                      </div>
                      <div className="price-member-tag">
                        Member: ₹{prod.memberPrice.toFixed(2)}
                      </div>
                    </div>

                    <div className="product-sizes-row">
                      <span className="size-label">Sizes:</span>
                      <div className="size-chips">
                        {prod.sizes.map((s) => (
                          <span key={s} className="size-chip">{s}</span>
                        ))}
                      </div>
                    </div>

                    <div className="product-btn-row">
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ width: '100%' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('product-details', { id: prod.id });
                        }}
                      >
                        <span>View Product</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          LATEST ANNOUNCEMENTS
          ========================================================================= */}
      <section className="announcements-section">
        <div className="container">
          <div className="section-header-row">
            <div>
              <div className="badge badge-mint section-pill">Official Updates</div>
              <h2 className="section-heading">Latest Announcements</h2>
              <p className="section-subtext">
                Official notices, deadline reminders, and volunteer opportunities from the executive committee.
              </p>
            </div>
            <div className="bell-badge-pill">
              <Bell size={16} />
              <span>Official Feed</span>
            </div>
          </div>

          <div className="announcements-grid">
            {INITIAL_ANNOUNCEMENTS.map((ann) => (
              <div key={ann.id} className="announcement-card glass-card">
                <div className="ann-card-header">
                  <span className="badge badge-mint">{ann.category}</span>
                  <span className="ann-date">{ann.date}</span>
                </div>
                <h3 className="ann-title">{ann.title}</h3>
                <p className="ann-summary">{ann.summary}</p>
                <div className="ann-author-row">
                  <span className="ann-author">Published by: {ann.author}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        /* Hero */
        .hero-section {
          padding: 60px 0 70px;
          background: var(--bg-hero-gradient);
          position: relative;
          overflow: hidden;
          border-bottom: 1px solid var(--border-light);
        }

        .hero-container {
          display: grid;
          grid-template-columns: 1.15fr 0.9fr;
          gap: 48px;
          align-items: center;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: #ebf6ee;
          border: 1px solid var(--border-accent);
          border-radius: var(--radius-full);
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--color-primary-dark);
          margin-bottom: 20px;
        }

        .pulsing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #52b788;
          box-shadow: 0 0 0 3px rgba(82, 183, 136, 0.35);
          animation: pulseSubtle 1.8s infinite;
        }

        .hero-title {
          font-size: 3.1rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--color-primary-dark);
          line-height: 1.15;
          margin-bottom: 18px;
        }

        .highlight-text {
          background: linear-gradient(135deg, #2d6a4f 0%, #52b788 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
          font-size: 1.1rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 30px;
          max-width: 580px;
        }

        .hero-quick-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 32px;
        }

        .hero-trust-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }

        .trust-pill {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 0.86rem;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .hero-visual {
          display: flex;
          justify-content: center;
          position: relative;
        }

        .hero-card-stack {
          position: relative;
          width: 100%;
          max-width: 440px;
        }

        .hero-main-card {
          padding: 16px;
          overflow: hidden;
          border-radius: var(--radius-lg);
          background: #ffffff;
        }

        .hero-card-badge {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .hero-card-img {
          width: 100%;
          height: 220px;
          object-fit: cover;
          border-radius: var(--radius-md);
        }

        .hero-card-details {
          padding-top: 14px;
        }

        .hero-card-details h3 {
          font-size: 1.15rem;
          color: var(--color-primary-dark);
          margin-bottom: 6px;
        }

        .hero-card-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.84rem;
          color: var(--text-muted);
        }

        .price-tag-highlight {
          font-weight: 700;
          color: var(--color-primary);
        }

        .strike {
          text-decoration: line-through;
          color: var(--text-muted);
          font-weight: 400;
          font-size: 0.78rem;
          margin-left: 4px;
        }

        .hero-float-card {
          position: absolute;
          bottom: -24px;
          left: -20px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 18px;
          border-radius: var(--radius-md);
          background: rgba(255, 255, 255, 0.95);
          box-shadow: var(--shadow-lg);
          animation: floatSlow 4s ease-in-out infinite alternate;
        }

        @keyframes floatSlow {
          0% { transform: translateY(0); }
          100% { transform: translateY(-8px); }
        }

        .float-thumb {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          object-fit: cover;
        }

        .float-info {
          display: flex;
          flex-direction: column;
          font-size: 0.82rem;
        }

        .float-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--color-sage);
          font-weight: 700;
        }

        .float-price {
          color: var(--color-primary);
          font-weight: 700;
        }

        /* Stats Ribbon */
        .stats-ribbon {
          background: #ffffff;
          padding: 32px 0;
          border-bottom: 1px solid var(--border-light);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stat-icon-wrapper {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          background: var(--color-pastel-soft);
          color: var(--color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-number {
          font-size: 1.55rem;
          font-weight: 800;
          color: var(--color-primary-dark);
          line-height: 1.1;
        }

        .stat-label {
          font-size: 0.82rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        /* Section Global */
        .section-padding {
          padding: 70px 0;
        }

        .section-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 36px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .section-pill {
          margin-bottom: 10px;
        }

        .section-heading {
          font-size: 2.1rem;
          color: var(--color-primary-dark);
          letter-spacing: -0.02em;
          margin-bottom: 8px;
        }

        .section-subtext {
          font-size: 1rem;
          color: var(--text-secondary);
          max-width: 600px;
        }

        /* Events Grid */
        .events-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
        }

        .event-card {
          overflow: hidden;
          display: flex;
          flex-direction: column;
          border-radius: var(--radius-lg);
          background: #ffffff;
        }

        .event-card-media {
          position: relative;
          height: 190px;
          overflow: hidden;
        }

        .event-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-smooth);
        }

        .event-card:hover .event-img {
          transform: scale(1.05);
        }

        .event-category-tag {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(27, 67, 50, 0.85);
          color: #ffffff;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          font-size: 0.74rem;
          font-weight: 700;
          backdrop-filter: blur(4px);
        }

        .event-seat-indicator {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: rgba(255, 255, 255, 0.92);
          color: var(--color-primary-dark);
          padding: 4px 10px;
          border-radius: var(--radius-full);
          font-size: 0.74rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: var(--shadow-xs);
        }

        .seat-pulse {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #52b788;
        }

        .event-card-body {
          padding: 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .event-date-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 600;
          margin-bottom: 8px;
        }

        .dot-sep {
          color: var(--border-light);
        }

        .event-card-title {
          font-size: 1.15rem;
          color: var(--color-primary-dark);
          margin-bottom: 8px;
          line-height: 1.3;
        }

        .event-card-desc {
          font-size: 0.86rem;
          color: var(--text-secondary);
          margin-bottom: 14px;
          line-height: 1.5;
          flex: 1;
        }

        .event-venue-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 16px;
        }

        .event-pricing-box {
          display: flex;
          align-items: center;
          background: #f1f8f3;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          padding: 8px 14px;
          margin-bottom: 16px;
        }

        .price-item {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .price-type {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--text-muted);
        }

        .member-price-item .price-value {
          font-size: 1.15rem;
          color: var(--color-primary);
          font-weight: 800;
        }

        .price-value-standard {
          font-size: 1rem;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .price-divider {
          width: 1px;
          height: 28px;
          background: var(--border-light);
          margin: 0 12px;
        }

        /* Benefits */
        .benefits-section {
          background: #ebf5ee;
          padding: 80px 0;
          border-top: 1px solid var(--border-light);
          border-bottom: 1px solid var(--border-light);
        }

        .benefits-header {
          max-width: 680px;
          margin: 0 auto 48px;
        }

        .text-center {
          text-align: center;
        }

        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-bottom: 40px;
        }

        .benefit-card {
          padding: 24px;
          background: #ffffff;
          border-radius: var(--radius-md);
        }

        .benefit-icon-box {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: var(--color-pastel-soft);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
        }

        .benefit-title {
          font-size: 1.1rem;
          color: var(--color-primary-dark);
          margin-bottom: 8px;
        }

        .benefit-desc {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .membership-cta-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 32px 40px;
          background: linear-gradient(135deg, #ffffff 0%, #f4fbf6 100%);
          border: 1px solid var(--border-accent);
          flex-wrap: wrap;
          gap: 20px;
        }

        .cta-banner-text h3 {
          font-size: 1.45rem;
          color: var(--color-primary-dark);
          margin-bottom: 6px;
        }

        .cta-banner-text p {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        /* Products Grid */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .product-card {
          cursor: pointer;
          overflow: hidden;
          background: #ffffff;
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
        }

        .product-media {
          position: relative;
          padding: 16px;
          background: #f7faf8;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 230px;
        }

        .product-img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          transition: transform var(--transition-smooth);
        }

        .product-card:hover .product-img {
          transform: scale(1.06);
        }

        .product-badge-pill {
          position: absolute;
          top: 12px;
          left: 12px;
          background: var(--color-primary-dark);
          color: #ffffff;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: var(--radius-full);
        }

        .stock-badge {
          position: absolute;
          bottom: 12px;
          right: 12px;
          padding: 3px 8px;
          border-radius: var(--radius-full);
          font-size: 0.72rem;
          font-weight: 700;
        }

        .product-card-body {
          padding: 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .product-category {
          font-size: 0.74rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.04em;
          margin-bottom: 4px;
        }

        .product-name {
          font-size: 0.98rem;
          color: var(--color-primary-dark);
          margin-bottom: 8px;
          line-height: 1.3;
        }

        .product-price-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 10px;
        }

        .price-primary {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--color-primary-dark);
        }

        .price-member-tag {
          font-size: 0.8rem;
          color: var(--color-primary);
          font-weight: 700;
          background: #ebf6ee;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .product-sizes-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.76rem;
          color: var(--text-muted);
          margin-bottom: 14px;
        }

        .size-chips {
          display: flex;
          gap: 4px;
        }

        .size-chip {
          background: #f0f4f1;
          padding: 1px 6px;
          border-radius: 4px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .product-btn-row {
          margin-top: auto;
        }

        /* Announcements */
        .announcements-section {
          background: #ffffff;
          padding: 70px 0;
          border-top: 1px solid var(--border-light);
        }

        .bell-badge-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--color-pastel-soft);
          color: var(--color-primary);
          padding: 6px 14px;
          border-radius: var(--radius-full);
          font-size: 0.84rem;
          font-weight: 700;
        }

        .announcements-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .announcement-card {
          padding: 24px;
          background: var(--bg-subtle);
          border-radius: var(--radius-md);
          display: flex;
          flex-direction: column;
        }

        .ann-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .ann-date {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .ann-title {
          font-size: 1.15rem;
          color: var(--color-primary-dark);
          margin-bottom: 8px;
          line-height: 1.3;
        }

        .ann-summary {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 16px;
          flex: 1;
        }

        .ann-author-row {
          font-size: 0.78rem;
          color: var(--text-muted);
          font-weight: 600;
          border-top: 1px solid var(--border-light);
          padding-top: 10px;
        }

        @media (max-width: 1024px) {
          .hero-container {
            grid-template-columns: 1fr;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .events-grid, .benefits-grid, .announcements-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .products-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .hero-title {
            font-size: 2.3rem;
          }
          .stats-grid, .events-grid, .benefits-grid, .announcements-grid, .products-grid {
            grid-template-columns: 1fr;
          }
          .hero-float-card {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
