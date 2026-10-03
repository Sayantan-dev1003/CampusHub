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
          <small>{org.data?.organizationName || 'Skyline Student Association'}</small>
        </button>
        <div className="desk-user">
          <span className="desk-avatar">{user.name?.charAt(0)?.toUpperCase() || 'A'}</span>
          <span className="desk-user-copy">
            <strong>{user.name}</strong>
            <em>Admin</em>
          </span>
        </div>
        <nav className="desk-nav">
          {GROUPS.map((group) => {
            const GroupIcon = group.icon;
            const isOpen = !collapsed[group.label];
            const groupActive = group.items.some((item) => activeItem(section, id, item));
            return (
              <div key={group.label} className="nav-group">
                <button type="button" className={groupActive && !isOpen ? 'nav-toggle active' : 'nav-toggle'} onClick={() => toggleGroup(group.label)} aria-expanded={isOpen}>
                  <GroupIcon size={20} />
                  <span>{group.label}</span>
                  <ChevronDown size={16} className={isOpen ? 'chev open' : 'chev'} />
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
                      <ItemIcon size={20} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>
        <div className="desk-foot">
          <button type="button" className="desk-logout" onClick={logout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
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
          position: fixed;
          inset: 0;
          height: 100vh;
          height: 100dvh;
          display: grid;
          grid-template-columns: 260px minmax(0, 1fr);
          background: #eef5f0;
          color: #132a1e;
          font-family: 'Plus Jakarta Sans', var(--font-body);
          overflow: hidden;
        }
        .desk-side {
          background: #1b4332;
          color: #f4faf6;
          display: flex;
          flex-direction: column;
          border-right: 1px solid #143528;
          height: 100%;
          min-height: 0;
          overflow: hidden;
        }
        .desk-brand {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
          background: transparent;
          border: 0;
          color: #fff;
          text-align: left;
          cursor: pointer;
          padding: 24px 24px 8px;
        }
        .desk-brand span {
          font-family: 'Outfit', var(--font-heading);
          font-size: 1.7rem;
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1;
        }
        .desk-brand small {
          color: #b7e4c7;
          font-size: 0.85rem;
          font-weight: 500;
        }
        .desk-user {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 24px;
          margin-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .desk-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #74c69d;
          color: #1b4332;
          font-weight: 700;
          font-size: 1.2rem;
          flex: 0 0 auto;
        }
        .desk-user-copy { display: flex; flex-direction: column; min-width: 0; }
        .desk-user strong {
          font-size: 0.95rem;
          font-weight: 600;
          color: #fff;
          line-height: 1.3;
        }
        .desk-user em {
          font-style: normal;
          font-size: 0.75rem;
          color: #b7e4c7;
        }
        .desk-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          min-height: 0;
          padding: 0 12px 16px;
          overflow-y: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .desk-nav::-webkit-scrollbar { width: 0; height: 0; display: none; }
        .nav-toggle, .nav-link {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          text-align: left;
          background: transparent;
          border: 0;
          color: #d8f3dc;
          border-radius: 8px;
          padding: 12px 16px;
          font: inherit;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
        }
        .nav-link { padding-left: 28px; }
        .nav-toggle .chev { margin-left: auto; opacity: 0.8; transition: transform 0.15s ease; }
        .nav-toggle .chev.open { transform: rotate(180deg); }
        .nav-toggle:hover, .nav-link:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
        }
        .nav-link.active, .nav-toggle.active {
          background: #2d6a4f;
          color: #fff;
          font-weight: 600;
        }
        .desk-foot {
          padding: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .desk-logout {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          background: transparent;
          border: 0;
          color: #b7e4c7;
          padding: 12px 0;
          font: inherit;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
        }
        .desk-logout:hover { color: #fff; }
        .desk-main {
          min-width: 0;
          min-height: 0;
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
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
        .desk-body {
          flex: 1;
          min-height: 0;
          overflow-x: hidden;
          overflow-y: auto;
          padding: 28px 32px 56px;
          scrollbar-width: thin;
          scrollbar-color: #b7d4c4 transparent;
        }
        .desk-page-head { display: flex; justify-content: space-between; gap: 16px; align-items: flex-end; margin-bottom: 22px; flex-wrap: wrap; }
        .desk-kicker { text-transform: uppercase; letter-spacing: 0.14em; font-size: 0.72rem; font-weight: 700; color: #2d6a4f; margin-bottom: 6px; }
        .desk-page h1, .desk-gate h1 { font-family: 'Fraunces', Georgia, serif; font-weight: 560; font-size: 2.15rem; color: #1b4332; letter-spacing: -0.03em; line-height: 1.15; }
        .desk-page-head p { color: #4d6b5c; max-width: 52ch; margin-top: 6px; line-height: 1.5; }
        .kpi-grid, .mini-kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; margin-bottom: 16px; }
        .kpi-card, .mini-kpis article, .desk-panel, .desk-empty-card, .desk-form, .table-wrap {
          background: #fff;
          border: 1px solid #e3efe7;
          border-radius: 16px;
          box-shadow: 0 10px 28px rgba(27, 67, 50, 0.05);
        }
        .kpi-card, .mini-kpis article { padding: 16px 16px 18px; display: flex; flex-direction: column; gap: 8px; min-height: 108px; }
        .kpi-ico { width: 36px; height: 36px; border-radius: 10px; background: #e7f6ee; color: #1b4332; display: grid; place-items: center; }
        .kpi-card span, .mini-kpis span { color: #5e8070; font-size: 0.78rem; font-weight: 650; }
        .kpi-card strong, .mini-kpis strong { font-family: 'Outfit', sans-serif; font-size: 1.75rem; color: #1b4332; letter-spacing: -0.03em; line-height: 1; }
        .ledger-strip { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-bottom: 16px; }
        .ledger-strip article { background: #1b4332; color: #f4faf6; border-radius: 16px; padding: 16px 18px; display: flex; flex-direction: column; gap: 6px; }
        .ledger-strip span { color: #b7e4c7; font-size: 0.78rem; font-weight: 650; }
        .ledger-strip strong { font-family: 'Outfit', sans-serif; font-size: 1.35rem; letter-spacing: -0.03em; }
        .desk-split { display: grid; grid-template-columns: 1.35fr 0.85fr; gap: 14px; margin-bottom: 14px; align-items: start; }
        .desk-panel { padding: 18px 18px 10px; }
        .panel-head, .section-label { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 4px; }
        .desk-panel h2, .section-label { font-size: 1.02rem; color: #1b4332; font-weight: 700; }
        .section-label { margin: 18px 0 10px; }
        .panel-head button { font-size: 0.84rem; color: #2d6a4f; }
        .stack-list, .stat-rows, .bar-list { list-style: none; display: flex; flex-direction: column; }
        .stack-list li, .stat-rows li { display: flex; justify-content: space-between; gap: 16px; align-items: center; padding: 14px 0; border-top: 1px solid #e7f2eb; }
        .stack-list strong { display: block; color: #132a1e; }
        .stack-list span { display: block; color: #5e8070; font-size: 0.84rem; margin-top: 2px; }
        .stat-rows span { color: #3b5a4a; font-weight: 600; }
        .stat-rows strong { font-family: 'Outfit', sans-serif; font-size: 1.2rem; color: #1b4332; min-width: 2ch; text-align: right; }
        .grow { flex: 1; min-width: 0; }
        .meter { height: 8px; background: #e7f2eb; border-radius: 99px; margin: 8px 0 4px; overflow: hidden; }
        .meter span { display: block; height: 100%; background: #2d6a4f; border-radius: inherit; }
        .bar-list li { padding: 10px 0 6px; }
        .bar-list li > div:first-child { display: flex; justify-content: space-between; gap: 12px; font-size: 0.9rem; }
        .action-row { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px; margin-bottom: 14px; }
        .action-row button, .desk-primary, .ghost-btn {
          border: 0;
          border-radius: 10px;
          font: inherit;
          font-weight: 700;
          cursor: pointer;
        }
        .action-row button, .desk-primary {
          background: #2d6a4f;
          color: #fff;
          padding: 12px 14px;
        }
        .action-row button { display: flex; align-items: center; justify-content: center; gap: 8px; text-align: center; white-space: nowrap; }
        .action-row button:hover, .desk-primary:hover { background: #1b4332; }
        .desk-primary { text-align: center; white-space: nowrap; }
        .desk-primary:disabled { opacity: 0.7; cursor: default; }
        .ghost-btn {
          background: #fff;
          color: #1b4332;
          border: 1px solid #cfe3d7;
          padding: 7px 12px;
          font-size: 0.82rem;
          white-space: nowrap;
        }
        .ghost-btn:hover { background: #f3faf6; }
        .desk-empty, .desk-note { color: #5e8070; padding: 8px 0 14px; }
        .desk-empty-card { padding: 28px 20px; text-align: center; color: #5e8070; margin-bottom: 8px; }
        .desk-error { color: #a63a3a; padding: 8px 0; }
        .desk-toolbar { display: flex; gap: 10px; align-items: center; margin-bottom: 14px; flex-wrap: wrap; }
        .desk-toolbar input, .desk-toolbar select { border: 1px solid #d3e6da; border-radius: 10px; background: #fff; min-height: 42px; padding: 8px 12px; font: inherit; color: #132a1e; min-width: min(320px, 100%); }
        .table-wrap { overflow: auto; }
        .desk-table { width: 100%; border-collapse: collapse; font-size: 0.92rem; }
        .desk-table th, .desk-table td { text-align: left; padding: 13px 14px; border-bottom: 1px solid #e7f2eb; white-space: nowrap; vertical-align: middle; }
        .desk-table th { font-size: 0.72rem; letter-spacing: 0.05em; text-transform: uppercase; color: #5e8070; background: #f7fbf8; }
        .desk-table tbody tr:hover { background: #f8fcf9; }
        .desk-table tr:last-child td { border-bottom: 0; }
        .desk-pill { display: inline-flex; align-items: center; border-radius: 999px; padding: 4px 10px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.01em; text-transform: capitalize; }
        .tone-ok { background: #e5f6ec; color: #166534; }
        .tone-wait { background: #fff4d6; color: #92400e; }
        .tone-bad { background: #fde8e8; color: #991b1b; }
        .tone-muted { background: #eef2f0; color: #3f5d4e; }
        .row-actions { display: flex; gap: 6px; align-items: center; }
        .row-actions select, .stock-field { border: 1px solid #d3e6da; border-radius: 8px; min-height: 34px; padding: 4px 8px; font: inherit; background: #fff; }
        .desk-form { display: flex; flex-direction: column; gap: 14px; max-width: 720px; padding: 22px; }
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
          .kpi-grid, .mini-kpis, .desk-split, .form-row, .ledger-strip { grid-template-columns: 1fr 1fr; }
          .action-row { grid-template-columns: 1fr 1fr; }
          .desk-body { padding: 20px 16px 40px; }
        }
        @media (max-width: 640px) {
          .kpi-grid, .mini-kpis, .desk-split, .form-row, .ledger-strip, .action-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
