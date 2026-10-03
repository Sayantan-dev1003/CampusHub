import React, { useState } from 'react';
import {
  ArrowLeftRight,
  BadgePercent,
  BarChart3,
  Bell,
  Boxes,
  Building2,
  CalendarCog,
  CalendarDays,
  CalendarPlus,
  ChevronDown,
  Flag,
  HandHelping,
  Hourglass,
  IdCard,
  Landmark,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Megaphone,
  Menu,
  Package,
  PieChart,
  Receipt,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Store,
  Ticket,
  UserRound,
  Users,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import DashboardPage from './DashboardPage';
import {
  AnnouncementsPage,
  EventsPage,
  ExpensesPage,
  FinancePage,
  InitiativesPage,
  InventoryPage,
  MembersPage,
  MembershipsPage,
  OrdersPage,
  ProductsPage,
  ReportsPage,
  SettingsPage,
  TasksPage,
  TicketsPage,
  TransactionsPage,
} from './ResourcePages';
import { useApi } from './useApi';

const GROUPS = [
  {
    label: 'Overview',
    icon: LayoutDashboard,
    items: [{ section: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Members',
    icon: Users,
    items: [
      { section: 'members', label: 'All Members', icon: UserRound },
      { section: 'memberships', label: 'Memberships', icon: IdCard },
      { section: 'expiring', label: 'Expiring Soon', icon: Hourglass },
    ],
  },
  {
    label: 'Events',
    icon: CalendarDays,
    items: [
      { section: 'events', label: 'All Events', icon: CalendarDays },
      { section: 'events', id: 'new', label: 'Create Event', icon: CalendarPlus },
      { section: 'tickets', label: 'Tickets & Attendance', icon: Ticket },
    ],
  },
  {
    label: 'Merchandise',
    icon: ShoppingBag,
    items: [
      { section: 'products', label: 'Products', icon: Package },
      { section: 'inventory', label: 'Inventory', icon: Boxes },
      { section: 'orders', label: 'Orders', icon: ShoppingCart },
    ],
  },
  {
    label: 'Communication',
    icon: Megaphone,
    items: [{ section: 'announcements', label: 'Announcements', icon: Megaphone }],
  },
  {
    label: 'Volunteers',
    icon: HandHelping,
    items: [
      { section: 'initiatives', label: 'Initiatives', icon: Flag },
      { section: 'tasks', label: 'Tasks', icon: ListTodo },
    ],
  },
  {
    label: 'Finance',
    icon: Landmark,
    items: [
      { section: 'finance', label: 'Financial Overview', icon: PieChart },
      { section: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
      { section: 'expenses', label: 'Expenses', icon: Receipt },
    ],
  },
  {
    label: 'Reports',
    icon: BarChart3,
    items: [{ section: 'reports', label: 'Reports', icon: BarChart3 }],
  },
  {
    label: 'Settings',
    icon: Settings,
    items: [
      { section: 'settings', id: 'organization', label: 'Organization', icon: Building2 },
      { section: 'settings', id: 'membership', label: 'Membership', icon: BadgePercent },
      { section: 'settings', id: 'events', label: 'Events', icon: CalendarCog },
      { section: 'settings', id: 'store', label: 'Store', icon: Store },
      { section: 'settings', id: 'notifications', label: 'Notifications', icon: Bell },
    ],
  },
];

function activeItem(section, id, item) {
  if (item.section !== section) return false;
  if (item.id) return item.id === id;
  if (item.section === 'events' && id) return false;
  if (item.section === 'settings') return false;
  return true;
}

export default function AdminApp() {
  const { user, authReady, navigate, logout, currentRoute } = useApp();
  const org = useApi(user?.role === 'ADMIN' ? '/settings/organization' : null, user?.role === 'ADMIN');
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState({});
  const section = currentRoute.params?.section || 'dashboard';
  const id = currentRoute.params?.id || null;
  const currency = org.data?.currency || 'INR';

  if (!authReady) {
    return <div className="desk-gate">Checking your session…</div>;
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="desk-gate">
        <h1>Organizer sign-in required</h1>
        <p>This desk is for the organization admin account.</p>
        <button type="button" className="desk-primary" onClick={() => navigate('login')}>Sign in</button>
      </div>
    );
  }

  const go = (item) => {
    navigate('admin', { section: item.section, id: item.id });
    setOpen(false);
  };

  const toggleGroup = (label) => {
    setCollapsed((current) => ({ ...current, [label]: !current[label] }));
  };

  return (
    <div className={`desk ${open ? 'nav-open' : ''}`}>
      <aside className="desk-side">
        <button type="button" className="desk-brand" onClick={() => navigate('admin', { section: 'dashboard' })}>
          <span>CampusHub</span>
          <small>{org.data?.organizationName || 'Organizer'}</small>
        </button>
        <div className="desk-user">
          <span className="desk-avatar">{user.name?.charAt(0) || 'A'}</span>
          <strong>{user.name}</strong>
        </div>
        <nav>
          {GROUPS.map((group) => {
            const GroupIcon = group.icon;
            const isOpen = !collapsed[group.label];
            return (
              <div key={group.label} className="nav-group">
                <button type="button" className="nav-toggle" onClick={() => toggleGroup(group.label)} aria-expanded={isOpen}>
                  <GroupIcon size={16} />
                  <span>{group.label}</span>
                  <ChevronDown size={15} className={isOpen ? 'chev open' : 'chev'} />
                </button>
                {isOpen && group.items.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <button
                      key={`${item.section}-${item.id || item.label}`}
                      type="button"
                      className={activeItem(section, id, item) ? 'nav-link active' : 'nav-link'}
                      onClick={() => go(item)}
                    >
                      <ItemIcon size={16} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>
        <button type="button" className="desk-logout" onClick={logout}>
          <LogOut size={16} />
          <span>Log out</span>
        </button>
      </aside>
      <div className="desk-main">
        <div className="desk-body">
          <button type="button" className="menu-btn" onClick={() => setOpen((value) => !value)}>
            <Menu size={18} />
            Menu
          </button>
          {section === 'dashboard' && <DashboardPage currency={currency} />}
          {section === 'members' && <MembersPage mode={id} />}
          {section === 'expiring' && <MembersPage mode="expiring" />}
          {section === 'memberships' && <MembershipsPage />}
          {section === 'events' && <EventsPage eventId={id} />}
          {section === 'tickets' && <TicketsPage eventId={id} />}
          {section === 'products' && <ProductsPage mode={id} />}
          {section === 'inventory' && <InventoryPage />}
          {section === 'orders' && <OrdersPage currency={currency} />}
          {section === 'announcements' && <AnnouncementsPage mode={id} />}
          {section === 'initiatives' && <InitiativesPage mode={id} />}
          {section === 'tasks' && <TasksPage />}
          {section === 'finance' && <FinancePage currency={currency} />}
          {section === 'transactions' && <TransactionsPage currency={currency} />}
          {section === 'expenses' && <ExpensesPage currency={currency} />}
          {section === 'reports' && <ReportsPage />}
          {section === 'settings' && <SettingsPage area={id || 'organization'} />}
        </div>
      </div>
      <style>{`
        .desk-gate {
          min-height: 100vh;
          display: grid;
          place-content: center;
          gap: 8px;
          text-align: center;
          background: #f4f8f5;
          color: #1b4332;
          padding: 24px;
        }
        .desk {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 248px 1fr;
          background: #f4f8f5;
          color: #132a1e;
          font-family: 'Plus Jakarta Sans', var(--font-body);
        }
        .desk-side {
          background: #1b4332;
          color: #f4faf6;
          padding: 22px 14px 28px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow: auto;
        }
        .desk-brand {
          background: transparent;
          border: 0;
          color: #fff;
          text-align: left;
          cursor: pointer;
          padding: 0 8px 8px;
        }
        .desk-brand span {
          display: block;
          font-family: 'Outfit', var(--font-heading);
          font-size: 1.35rem;
          font-weight: 700;
          letter-spacing: -0.03em;
        }
        .desk-brand small {
          display: block;
          margin-top: 2px;
          color: #b7e4c7;
          font-size: 0.72rem;
          letter-spacing: 0.04em;
        }
        .desk-user {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 4px 8px 8px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(183, 228, 199, 0.25);
        }
        .desk-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #d8f3dc;
          color: #1b4332;
          font-weight: 700;
          flex: 0 0 auto;
        }
        .desk-user strong {
          font-size: 0.95rem;
          font-weight: 650;
          line-height: 1.3;
        }
        .desk-side nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
        .nav-toggle, .nav-link, .desk-logout {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          text-align: left;
          background: transparent;
          border: 0;
          color: #e7f6ee;
          border-radius: 8px;
          padding: 8px 10px;
          font: inherit;
          cursor: pointer;
        }
        .nav-toggle {
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #b7e4c7;
        }
        .nav-toggle .chev { margin-left: auto; transition: transform 0.15s ease; }
        .nav-toggle .chev.open { transform: rotate(180deg); }
        .nav-link { font-size: 0.92rem; padding-left: 16px; }
        .nav-link.active, .nav-link:hover, .nav-toggle:hover, .desk-logout:hover {
          background: rgba(216, 243, 220, 0.14);
          color: #fff;
        }
        .desk-logout {
          margin-top: 12px;
          color: #f4faf6;
          font-weight: 650;
        }
        .desk-main { min-width: 0; display: flex; flex-direction: column; }
        .menu-btn {
          display: none;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          background: #1b4332;
          color: #fff;
          border: 0;
          border-radius: 8px;
          padding: 8px 12px;
          font: inherit;
          font-weight: 700;
        }
        .panel-head button, .linkish {
          background: none;
          border: 0;
          padding: 0;
          color: #1b4332;
          font: inherit;
          font-weight: 700;
          cursor: pointer;
        }
        .desk-body { padding: 28px 32px 48px; }
        .desk-page-head { display: flex; justify-content: space-between; gap: 16px; align-items: flex-end; margin-bottom: 22px; }
        .desk-kicker { text-transform: uppercase; letter-spacing: 0.14em; font-size: 0.72rem; font-weight: 700; color: #2d6a4f; margin-bottom: 6px; }
        .desk-page h1, .desk-gate h1 { font-family: 'Fraunces', Georgia, serif; font-weight: 560; font-size: 2.2rem; color: #1b4332; letter-spacing: -0.03em; }
        .desk-page-head p { color: #3b5a4a; max-width: 46ch; }
        .kpi-grid, .mini-kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 18px; }
        .kpi-card, .mini-kpis article, .desk-panel {
          background: #fff;
          border: 1px solid #e3efe7;
          border-radius: 14px;
          box-shadow: 0 8px 24px rgba(27, 67, 50, 0.04);
        }
        .kpi-card, .mini-kpis article { padding: 14px 16px; display: flex; flex-direction: column; gap: 6px; }
        .kpi-card span, .mini-kpis span { color: #5e8070; font-size: 0.78rem; font-weight: 650; }
        .kpi-card strong, .mini-kpis strong { font-family: 'Outfit', sans-serif; font-size: 1.7rem; color: #1b4332; letter-spacing: -0.03em; }
        .desk-split { display: grid; grid-template-columns: 1.3fr 0.9fr; gap: 14px; margin-bottom: 14px; }
        .desk-panel { padding: 16px 16px 8px; }
        .panel-head, .section-label { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 8px; }
        .desk-panel h2, .section-label { font-size: 1rem; color: #1b4332; }
        .section-label { margin: 8px 0; }
        .stack-list { list-style: none; display: flex; flex-direction: column; }
        .stack-list li { display: flex; justify-content: space-between; gap: 12px; align-items: center; padding: 12px 0; border-top: 1px solid #e7f2eb; }
        .stack-list strong, .stack-list span { display: block; }
        .stack-list span { color: #5e8070; font-size: 0.84rem; }
        .grow { flex: 1; }
        .meter { height: 6px; background: #e7f2eb; border-radius: 99px; margin: 8px 0; overflow: hidden; }
        .meter span { display: block; height: 100%; background: #2d6a4f; }
        .action-grid { display: grid; gap: 8px; padding-bottom: 10px; }
        .action-grid button, .desk-primary {
          border: 0;
          border-radius: 10px;
          background: #2d6a4f;
          color: #fff;
          font: inherit;
          font-weight: 700;
          padding: 11px 14px;
          cursor: pointer;
          text-align: left;
        }
        .desk-primary { text-align: center; }
        .desk-primary:disabled { opacity: 0.7; }
        .desk-empty, .desk-note { color: #5e8070; padding: 8px 0 14px; }
        .desk-error { color: #a63a3a; padding: 8px 0; }
        .table-wrap { overflow: auto; background: #fff; border: 1px solid #e3efe7; border-radius: 14px; }
        .desk-table { width: 100%; border-collapse: collapse; font-size: 0.92rem; }
        .desk-table th, .desk-table td { text-align: left; padding: 12px 14px; border-bottom: 1px solid #e7f2eb; white-space: nowrap; }
        .desk-table th { font-size: 0.75rem; letter-spacing: 0.04em; text-transform: uppercase; color: #5e8070; }
        .desk-form { display: flex; flex-direction: column; gap: 12px; max-width: 640px; }
        .desk-form label { display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem; font-weight: 700; color: #1b4332; }
        .desk-form input, .desk-form textarea, .desk-form select, .inline-select select {
          border: 1px solid #d3e6da;
          border-radius: 10px;
          background: #fff;
          min-height: 42px;
          padding: 8px 12px;
          font: inherit;
          font-weight: 500;
          color: #132a1e;
        }
        .desk-form textarea { min-height: 110px; resize: vertical; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .check-line { flex-direction: row !important; align-items: center; font-weight: 600 !important; }
        .inline-select { display: flex; flex-direction: column; gap: 6px; max-width: 420px; margin-bottom: 16px; font-weight: 700; color: #1b4332; font-size: 0.8rem; }
        @media (max-width: 980px) {
          .desk { grid-template-columns: 1fr; }
          .desk-side { position: fixed; z-index: 5; transform: translateX(-105%); width: min(280px, 86vw); transition: transform 0.2s ease; }
          .desk.nav-open .desk-side { transform: none; }
          .menu-btn { display: inline-flex; }
          .kpi-grid, .mini-kpis, .desk-split, .form-row { grid-template-columns: 1fr 1fr; }
          .desk-body { padding: 20px 16px 40px; }
        }
        @media (max-width: 640px) {
          .kpi-grid, .mini-kpis, .desk-split, .form-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
