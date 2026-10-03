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
      default:
        return <HomePage />;
    }
  };

  const isAuthPage = currentRoute.page === 'login' || currentRoute.page === 'register';
  const isAdminPage = currentRoute.page === 'admin';

  return (
    <div className={`app-layout${isAuthPage ? ' auth-layout' : ''}`}>
      {!isAuthPage && !isAdminPage && <Navbar />}
      <main className={`app-main-content ${isAuthPage ? 'auth-shell' : ''}`}>
        {renderCurrentPage()}
      </main>
      {!isAuthPage && !isAdminPage && <Footer />}

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
