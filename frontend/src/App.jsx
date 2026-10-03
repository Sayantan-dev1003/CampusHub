import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import TicketModal from './components/TicketModal';
import ToastContainer from './components/ToastContainer';

// Pages
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import EventDetailsPage from './pages/EventDetailsPage';
import StorePage from './pages/StorePage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import AboutPage from './pages/AboutPage';
import AuthPage from './pages/AuthPage';
import MemberDashboardPage from './pages/member/MemberDashboardPage';
import MemberProfilePage from './pages/member/MemberProfilePage';
import MemberLayout from './pages/member/MemberLayout';

import './styles/theme.css';

function AppContent() {
  const { currentRoute } = useApp();

  const renderCurrentPage = () => {
    switch (currentRoute.page) {
      case 'home':
        return <HomePage />;
      case 'events':
        return <EventsPage />;
      case 'event-details':
        return <EventDetailsPage />;
      case 'store':
        return <StorePage />;
      case 'product-details':
        return <ProductDetailsPage />;
      case 'about':
        return <AboutPage />;
      case 'login':
        return <AuthPage initialMode="login" />;
      case 'register':
        return <AuthPage initialMode="register" />;
      case 'member-dashboard':
        return <MemberDashboardPage />;
      case 'member-profile':
        return <MemberProfilePage />;
      case 'member-membership':
      case 'member-tickets':
      case 'member-orders':
      case 'member-announcements':
      case 'member-volunteer':
      case 'member-notifications':
        return (
          <MemberLayout>
            <div style={{ padding: '40px' }}>
              <h2>Page Under Construction</h2>
              <p>This section is coming soon.</p>
            </div>
          </MemberLayout>
        );
      default:
        return <HomePage />;
    }
  };

  const isAuthPage = currentRoute.page === 'login' || currentRoute.page === 'register';
  const isMemberPage = currentRoute.page.startsWith('member-');
  const hidePublicLayout = isAuthPage || isMemberPage;

  return (
    <div className={`app-layout${hidePublicLayout ? ' auth-layout' : ''}`}>
      {!hidePublicLayout && <Navbar />}
      <main className={`app-main-content ${hidePublicLayout ? 'auth-shell' : ''}`}>
        {renderCurrentPage()}
      </main>
      {!hidePublicLayout && <Footer />}

      {/* Global Drawers & Modals */}
      <CartDrawer />
      <TicketModal />
      <ToastContainer />

      <style>{`
        .app-layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .app-main-content {
          flex: 1;
        }

        .app-layout.auth-layout {
          height: 100vh;
          height: 100dvh;
          overflow: hidden;
        }

        .app-main-content.auth-shell {
          display: flex;
          flex: 1;
          min-height: 0;
          height: 100%;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
