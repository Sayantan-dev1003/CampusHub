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
import AdminApp from './admin/AdminApp';
import MemberDashboardPage from './pages/member/MemberDashboardPage';
import MemberProfilePage from './pages/member/MemberProfilePage';
import MemberMembershipPage from './pages/member/MemberMembershipPage';
import MemberEventsPage from './pages/member/MemberEventsPage';
import MemberEventDetailsPage from './pages/member/MemberEventDetailsPage';
import MemberTicketsPage from './pages/member/MemberTicketsPage';
import MemberStorePage from './pages/member/MemberStorePage';
import MemberCheckoutPage from './pages/member/MemberCheckoutPage';
import MemberOrdersPage from './pages/member/MemberOrdersPage';
import MemberAnnouncementsPage from './pages/member/MemberAnnouncementsPage';
import MemberVolunteerPage from './pages/member/MemberVolunteerPage';
import MemberExpensesPage from './pages/member/MemberExpensesPage';
import MemberNotificationsPage from './pages/member/MemberNotificationsPage';
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
      case 'admin':
        return <AdminApp />;
      case 'member-dashboard':
        return <MemberDashboardPage />;
      case 'member-profile':
        return <MemberProfilePage />;
      case 'member-membership':
        return <MemberMembershipPage />;
      case 'member-events':
        return <MemberEventsPage />;
      case 'member-event-details':
        return <MemberEventDetailsPage />;
      case 'member-tickets':
        return <MemberTicketsPage />;
      case 'member-store':
        return <MemberStorePage />;
      case 'member-checkout':
        return <MemberCheckoutPage />;
      case 'member-orders':
        return <MemberOrdersPage />;
      case 'member-announcements':
        return <MemberAnnouncementsPage />;
      case 'member-volunteer':
        return <MemberVolunteerPage />;
      case 'member-expenses':
        return <MemberExpensesPage />;
      case 'member-notifications':
        return <MemberNotificationsPage />;
      default:
        return <HomePage />;
    }
  };

  const isAuthPage = currentRoute.page === 'login' || currentRoute.page === 'register';
  const isAdminPage = currentRoute.page === 'admin';
  const isMemberPage = currentRoute.page.startsWith('member-');
  const hidePublicLayout = isAuthPage || isAdminPage || isMemberPage;

  return (
    <div className={`app-layout${isAuthPage ? ' auth-layout' : ''}`}>
      {!hidePublicLayout && <Navbar />}
      <main className={`app-main-content ${isAuthPage ? 'auth-shell' : ''}`}>
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
