import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { INITIAL_EVENTS, INITIAL_PRODUCTS } from '../data/mockData';
import { api } from '../services/api';

const AppContext = createContext();

function toSessionUser(account) {
  if (!account) return null;
  return {
    ...account,
    isMember: account.membership?.status === 'ACTIVE',
    membershipType: account.membership?.planName || null,
    expiryDate: account.membership?.endDate || null,
  };
}

export function AppProvider({ children }) {
  // Navigation / Router State
  const [currentRoute, setCurrentRoute] = useState({ page: 'home', params: {} });
  
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // Events State (with remaining seat tracking)
  const [events, setEvents] = useState(() => {
    try {
      const saved = localStorage.getItem('campushub_events_v3');
      return saved ? JSON.parse(saved) : INITIAL_EVENTS;
    } catch {
      return INITIAL_EVENTS;
    }
  });

  // Products State (with variant inventory tracking)
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('campushub_products_v2');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Cart State
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('campushub_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Tickets History
  const [tickets, setTickets] = useState(() => {
    try {
      const saved = localStorage.getItem('campushub_tickets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active Ticket Modal preview
  const [activeTicketModal, setActiveTicketModal] = useState(null);

  // Toasts
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    localStorage.removeItem('campushub_user');
    api('/auth/me')
      .then((result) => {
        const session = toSessionUser(result.data);
        setUser(session);
        const hash = (window.location.hash.replace('#', '') || 'home').replace(/^\/+/, '');
        const page = hash.split('/').filter(Boolean)[0] || 'home';
        if (['home', 'login', 'register'].includes(page)) {
          if (session?.role === 'ADMIN') window.location.hash = 'admin/dashboard';
          else if (session?.role === 'MEMBER') window.location.hash = 'member-dashboard';
        }
      })
      .catch(() => setUser(null))
      .finally(() => setAuthReady(true));
  }, []);

  useEffect(() => {
    localStorage.setItem('campushub_events_v3', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('campushub_products_v2', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('campushub_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('campushub_tickets', JSON.stringify(tickets));
  }, [tickets]);

  // URL Hash Sync for standard browser navigation & bookmarking
  useEffect(() => {
    const handleHashChange = () => {
      let hash = (window.location.hash.replace('#', '') || 'home').replace(/^\/+/, '');
      hash = hash.split('?')[0]; // Strip query parameters for routing purposes
      const parts = hash.split('/').filter(Boolean);
      const page = parts[0] || 'home';
      const paramId = parts[1] || null;

      if (page === 'admin') {
        setCurrentRoute({ page: 'admin', params: { section: parts[1] || 'dashboard', id: parts[2] || null } });
        return;
      }

  
      if (['home', 'events', 'store', 'about', 'login', 'register'].includes(page) || page.startsWith('member-')) {
        if (page === 'events' && paramId) {
          setCurrentRoute({ page: 'event-details', params: { id: paramId } });
        } else if (page === 'member-event-details' && paramId) {
          setCurrentRoute({ page: 'member-event-details', params: { id: paramId } });
        } else if (page === 'store' && paramId) {
          setCurrentRoute({ page: 'product-details', params: { id: paramId } });
        } else {
          setCurrentRoute({ page, params: {} });
        }
      } else {
        setCurrentRoute({ page: 'home', params: {} });
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // initial check

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (page, params = {}) => {
    setCurrentRoute({ page, params });
    window.scrollTo({ top: 0, behavior: 'smooth' });

    let hash = page;
    if (page === 'event-details' && params.id) {
      hash = `events/${params.id}`;
    } else if (page === 'member-event-details' && params.id) {
      hash = `member-event-details/${params.id}`;
    } else if (page === 'product-details' && params.id) {
      hash = `store/${params.id}`;
    } else if (page === 'admin') {
      const section = params.section || 'dashboard';
      hash = params.id ? `admin/${section}/${params.id}` : `admin/${section}`;
    }
    
    const queryParams = { ...params };
    delete queryParams.id;
    delete queryParams.section;
    if (Object.keys(queryParams).length > 0) {
      const searchParams = new URLSearchParams(queryParams);
      hash += `?${searchParams.toString()}`;
    }

    window.location.hash = hash;
  };

  // Toast Helpers
  const addToast = (title, message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Confetti
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2d6a4f', '#52b788', '#74c69d', '#b7e4c7', '#d8f3dc', '#f3c053']
      });
    } catch {
      // safe fallback
    }
  };

  const signIn = async ({ email, password, remember }) => {
    const result = await api('/auth/login', {
      method: 'POST',
      body: { email, password, remember },
    });
    const session = toSessionUser(result.data.user);
    setUser(session);
    addToast('Signed in', session.name, 'success');
    if (session.role === 'ADMIN') navigate('admin', { section: 'dashboard' });
    else if (session.role === 'MEMBER') navigate('member-dashboard');
    else navigate('home');
    return session;
  };

  const signUp = async (account) => {
    const result = await api('/auth/register', {
      method: 'POST',
      body: account,
    });
    const session = toSessionUser(result.data.user);
    setUser(session);
    addToast('Account created', session.name, 'success');
    if (session.role === 'ADMIN') navigate('admin', { section: 'dashboard' });
    else if (session.role === 'MEMBER') navigate('member-dashboard');
    else navigate('home');
  };

  const logout = async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch {
      // The cookie is cleared when the request succeeds. A failed call still ends the local session.
    }
    setUser(null);
    addToast('Signed out', 'You have been logged out of CampusHub', 'info');
    navigate('home');
  };

  // Event & Ticket Booking
  const getEvent = (id) => {
    return events.find((e) => e.id === id) || events[0];
  };

  const bookTicket = (eventId, ticketType, quantity, attendeeInfo) => {
    const targetEvent = events.find((e) => e.id === eventId);
    if (!targetEvent) {
      addToast('Booking error', 'Event not found', 'warning');
      return null;
    }

    if (targetEvent.remainingSeats < quantity) {
      addToast('Sold Out', `Only ${targetEvent.remainingSeats} seats remaining for this event!`, 'warning');
      return null;
    }

    // Determine unit price
    let unitPrice = targetEvent.nonMemberPrice;
    if (ticketType === 'MEMBER' || (user && user.isMember)) {
      unitPrice = targetEvent.memberPrice;
    } else if (ticketType === 'VIP') {
      unitPrice = targetEvent.vipPrice || targetEvent.nonMemberPrice * 1.5;
    }

    const totalAmount = unitPrice * quantity;

    // Decrement remaining seats
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? { ...e, remainingSeats: Math.max(0, e.remainingSeats - quantity) }
          : e
      )
    );

    const ticketRecord = {
      id: `TCK-${Math.floor(100000 + Math.random() * 900000)}`,
      eventId,
      eventTitle: targetEvent.title,
      eventDate: targetEvent.date,
      eventTime: targetEvent.time,
      venue: targetEvent.venue,
      ticketType,
      quantity,
      unitPrice,
      totalAmount,
      bookingDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      attendeeName: attendeeInfo.name || (user ? user.name : 'Guest Visitor'),
      attendeeEmail: attendeeInfo.email || (user ? user.email : 'guest@campus.edu'),
      studentId: attendeeInfo.studentId || (user ? user.studentId : 'GUEST-TKT'),
      status: 'CONFIRMED',
      qrCodeData: `CAMPUSHUB:TKT:${targetEvent.id}:${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    };

    setTickets((prev) => [ticketRecord, ...prev]);
    setActiveTicketModal(ticketRecord);
    triggerConfetti();
    addToast('Ticket Confirmed!', `Reserved ${quantity} seat(s) for ${targetEvent.title}`, 'success');

    return ticketRecord;
  };

  // Cart Operations
  const getProduct = (id) => {
    return products.find((p) => p.id === id) || products[0];
  };

  const addToCart = (product, size, quantity = 1) => {
    // Check variant stock
    const variant = (product.variants || []).find((v) => v.size === size);
    const availableStock = variant ? variant.stockQuantity : 99;

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.size === size
      );

      if (existingIndex > -1) {
        const newQty = prev[existingIndex].quantity + quantity;
        if (newQty > availableStock) {
          addToast('Stock limit', `Only ${availableStock} units available for size ${size}`, 'warning');
          return prev;
        }
        const updated = [...prev];
        updated[existingIndex].quantity = newQty;
        return updated;
      } else {
        if (quantity > availableStock) {
          addToast('Stock limit', `Only ${availableStock} units available for size ${size}`, 'warning');
          return prev;
        }
        return [...prev, { product, size, quantity }];
      }
    });

    addToast('Added to Cart', `${product.name} (Size: ${size}) added!`, 'success');
  };

  const updateCartQuantity = (productId, size, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId && item.size === size) {
          const variant = (item.product.variants || []).find((v) => v.size === size);
          const maxStock = variant ? variant.stockQuantity : 99;
          const safeQty = Math.min(quantity, maxStock);
          return { ...item, quantity: safeQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId, size) => {
    setCart((prev) =>
      prev.filter((item) => !(item.product.id === productId && item.size === size))
    );
    addToast('Removed item', 'Item removed from your cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  const checkoutCart = () => {
    if (cart.length === 0) return;

    // Decrement product inventory
    setProducts((prevProducts) => {
      return prevProducts.map((prod) => {
        const cartItemsForProd = cart.filter((item) => item.product.id === prod.id);
        if (cartItemsForProd.length === 0) return prod;

        const updatedVariants = prod.variants.map((v) => {
          const matchingCartItem = cartItemsForProd.find((ci) => ci.size === v.size);
          if (matchingCartItem) {
            return {
              ...v,
              quantity: Math.max(0, v.quantity - matchingCartItem.quantity)
            };
          }
          return v;
        });

        return { ...prod, variants: updatedVariants };
      });
    });

    clearCart();
    setIsCartOpen(false);
    triggerConfetti();
    addToast('Order Placed!', 'Your merchandise order was placed successfully! Pick up at Room 304.', 'success');
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const cartSubtotal = cart.reduce((sum, item) => {
    const isMember = user && user.isMember;
    const price = isMember ? (item.product.memberPrice || item.product.price) : item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const regularSubtotal = cart.reduce((sum, item) => {
    return sum + item.product.price * item.quantity;
  }, 0);

  const memberSavings = regularSubtotal - cartSubtotal;

  const refreshUser = async () => {
    try {
      const { data } = await api('/auth/me');
      setUser(toSessionUser(data));
    } catch {
      setUser(null);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentRoute,
        navigate,
        user,
        refreshUser,
        authReady,
        signIn,
        signUp,
        logout,
        events,
        getEvent,
        bookTicket,
        products,
        getProduct,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        checkoutCart,
        cartCount,
        cartSubtotal,
        regularSubtotal,
        memberSavings,
        isCartOpen,
        setIsCartOpen,
        tickets,
        activeTicketModal,
        setActiveTicketModal,
        toasts,
        addToast,
        removeToast,
        triggerConfetti
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
