import React from 'react';
import { Boxes, CalendarDays, CalendarPlus, Flag, Hourglass, IdCard, ListTodo, Megaphone, Package, ShoppingCart, Ticket, UserRound, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ago, count, money, shortId, when } from './format';
import { useApi } from './useApi';

const ACTIONS = [
  { section: 'events', id: 'new', label: 'Create event', icon: CalendarPlus },
  { section: 'products', id: 'new', label: 'Add product', icon: Package },
  { section: 'announcements', id: 'new', label: 'Create announcement', icon: Megaphone },
  { section: 'initiatives', id: 'new', label: 'Create initiative', icon: Flag },
];

const STATUS = {
  ACTIVE: 'ok', PAID: 'ok', PUBLISHED: 'ok', COMPLETED: 'ok', DONE: 'ok', REIMBURSED: 'ok', USED: 'ok', READY: 'ok', POSTED: 'ok',
  PENDING: 'wait', DRAFT: 'wait', PROCESSING: 'wait', IN_PROGRESS: 'wait', APPROVED: 'wait', PLANNED: 'wait',
  EXPIRED: 'bad', CANCELLED: 'bad', REJECTED: 'bad', SUSPENDED: 'bad',
  ARCHIVED: 'muted', MEMBER: 'muted', ADMIN: 'ok', TREASURER: 'wait', PUBLIC: 'muted', MEMBERS: 'ok',
  FUNDRAISER: 'wait', GENERAL: 'muted', INCOME: 'ok', EXPENSE: 'bad', NONE: 'muted',
};

export function StatusPill({ value }) {
  if (value == null || value === '' || value === '—') return '—';
  const key = String(value).toUpperCase();
  const tone = STATUS[key];
  if (!tone) return value;
  return <span className={`desk-pill tone-${tone}`}>{key.toLowerCase().replace(/_/g, ' ')}</span>;
}

export default function DashboardPage({ currency }) {
  const { navigate } = useApp();
  const { data, loading, error } = useApi('/dashboard/admin');
  const go = (section, id) => navigate('admin', { section, id });

  if (loading) return <p className="desk-note">Loading the desk…</p>;
  if (error) return <p className="desk-error">{error}</p>;
  if (!data) return null;

  const cards = [
    ['Total members', data.totalMembers, Users],
    ['Active memberships', data.activeMemberships, IdCard],
    ['Upcoming events', data.upcomingEvents, CalendarDays],
    ['Tickets sold', data.ticketsSold, Ticket],
    ['Pending orders', data.pendingOrders, ShoppingCart],
    ['Pending tasks', data.openTasks, ListTodo],
    ['Expiring memberships', data.expiringMemberships, Hourglass],
    ['Low stock products', data.lowStockCount, Boxes],
  ];

  const cardStyles = [
    { bg: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)', color: '#3730a3', iconBg: '#a5b4fc', text: '#312e81' },
    { bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', color: '#065f46', iconBg: '#6ee7b7', text: '#064e3b' },
    { bg: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)', color: '#5b21b6', iconBg: '#d8b4fe', text: '#4c1d95' },
    { bg: 'linear-gradient(135deg, #ffedd5, #fed7aa)', color: '#9a3412', iconBg: '#fdba74', text: '#7c2d12' },
    { bg: 'linear-gradient(135deg, #fce7f3, #fbcfe8)', color: '#9d174d', iconBg: '#f9a8d4', text: '#831843' },
    { bg: 'linear-gradient(135deg, #fef3c7, #fde68a)', color: '#b45309', iconBg: '#fcd34d', text: '#92400e' },
    { bg: 'linear-gradient(135deg, #fee2e2, #fecaca)', color: '#991b1b', iconBg: '#fca5a5', text: '#7f1d1d' },
    { bg: 'linear-gradient(135deg, #ccfbf1, #99f6e4)', color: '#115e59', iconBg: '#5eead4', text: '#134e4a' },
  ];

  return (
    <div className="desk-page">
      <header className="desk-page-head">
        <div>
          <p className="desk-kicker">Overview</p>
          <h1>Today on the desk</h1>
          <p>Membership, tickets, orders, and volunteer work in one place.</p>
        </div>
      </header>

      <section className="kpi-grid" style={{ gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '32px' }}>
        {cards.map(([label, value, Icon], idx) => {
          const style = cardStyles[idx % cardStyles.length];
          return (
            <article key={label} className="kpi-card" style={{ 
              background: style.bg, 
              color: style.text, 
              border: 'none', 
              boxShadow: '0 8px 16px rgba(0,0,0,0.06)',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.2s ease-in-out'
            }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', position: 'relative', zIndex: 2 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                <span className="kpi-ico" aria-hidden="true" style={{ background: style.iconBg, color: style.color, padding: '10px', borderRadius: '12px' }}>
                  <Icon size={20} />
                </span>
              </div>
              <strong style={{ fontSize: '2.5rem', fontFamily: 'Outfit, sans-serif', fontWeight: 700, position: 'relative', zIndex: 2 }}>{count(value)}</strong>
              <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', width: '120px', height: '120px', background: style.color, opacity: 0.05, borderRadius: '50%', zIndex: 1 }} />
            </article>
          );
        })}
      </section>

      <section className="action-row" aria-label="Quick actions" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button key={action.label} type="button" onClick={() => go(action.section, action.id)} style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 24px',
              background: 'linear-gradient(135deg, #1b4332, #2d6a4f)',
              color: '#fff', border: 'none', borderRadius: '12px',
              fontWeight: 600, fontSize: '0.95rem',
              boxShadow: '0 4px 12px rgba(45, 106, 79, 0.2)',
              cursor: 'pointer', transition: 'all 0.2s ease-in-out'
            }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(45, 106, 79, 0.3)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(45, 106, 79, 0.2)'; }}>
              <Icon size={18} />
              {action.label}
            </button>
          );
        })}
      </section>

      <div className="desk-split">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <section className="desk-panel">
            <div className="panel-head">
              <h2>Upcoming events</h2>
              <button type="button" onClick={() => go('events')}>All events</button>
            </div>
            {(data.upcomingEventList || []).length === 0 && <p className="desk-empty">No published events ahead.</p>}
            <ul className="stack-list">
              {(data.upcomingEventList || []).map((event) => (
                <li key={event.id}>
                  <div>
                    <strong>{event.title}</strong>
                    <span>{when(event.startsAt)}{event.venue ? ` · ${event.venue}` : ''}</span>
                    <span>{count(event.ticketsSold)} / {count(event.capacity)} tickets sold · {count(event.checkedIn)} checked in</span>
                  </div>
                  <button type="button" className="ghost-btn" onClick={() => go('events', event.id)}>View event</button>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <section className="desk-panel">
            <div className="panel-head">
              <h2>Recent announcements</h2>
              <button type="button" onClick={() => go('announcements')}>All</button>
            </div>
            {(data.announcements || []).length === 0 && <p className="desk-empty">Nothing published.</p>}
            <ul className="stack-list">
              {(data.announcements || []).map((item) => (
                <li key={item.id}>
                  <div>
                    <strong>{item.title}</strong>
                    <span>{ago(item.publishedAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="desk-panel">
            <div className="panel-head">
              <h2>Volunteer activity</h2>
              <button type="button" onClick={() => go('initiatives')}>Initiatives</button>
            </div>
            {(data.initiatives || []).length === 0 && <p className="desk-empty">No open initiatives.</p>}
            <ul className="stack-list">
              {(data.initiatives || []).map((item) => (
                <li key={item.id}>
                  <div className="grow">
                    <strong>{item.name}</strong>
                    <div className="meter" aria-hidden="true"><span style={{ width: `${item.percent}%` }} /></div>
                    <span>{item.percent}% complete · {item.completed} completed · {item.inProgress} in progress · {item.pending} pending</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="desk-panel">
            <div className="panel-head">
              <h2>Recent orders</h2>
              <button type="button" onClick={() => go('orders')}>All orders</button>
            </div>
            {(data.recentOrders || []).length === 0 && <p className="desk-empty">No orders yet.</p>}
            <ul className="stack-list">
              {(data.recentOrders || []).map((order) => {
                const summary = (order.items || []).map((item) => `${item.name} x${item.quantity}`).join(', ') || 'Order';
                return (
                  <li key={order.id}>
                    <div>
                      <strong>{shortId(order.id)} · {summary}</strong>
                      <span>{money(order.totalAmount, currency)} · {titleCase(order.orderStatus)}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>

    </div>
  );
}

function titleCase(value) {
  return String(value || '').toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase());
}

export function PageFrame({ kicker, title, lede, action, children }) {
  return (
    <div className="desk-page">
      <header className="desk-page-head">
        <div>
          {kicker && <p className="desk-kicker">{kicker}</p>}
          <h1>{title}</h1>
          {lede && <p>{lede}</p>}
        </div>
        {action}
      </header>
      {children}
    </div>
  );
}

function present(value) {
  if (value == null || value === '') return '—';
  if (typeof value === 'string' || typeof value === 'number') return <StatusPill value={value} />;
  return value;
}

export function DataTable({ columns, rows, empty }) {
  if (!rows?.length) return <div className="desk-empty-card"><p>{empty || 'Nothing here yet.'}</p></div>;
  return (
    <div className="table-wrap">
      <table className="desk-table">
        <thead>
          <tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id || row.key}>
              {columns.map((column) => <td key={column.key}>{present(column.render ? column.render(row) : row[column.key])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Breakdown({ title, rows, currency }) {
  const items = rows || [];
  const max = Math.max(...items.map((row) => Number(row.amount) || 0), 1);
  return (
    <section className="desk-panel">
      <div className="panel-head"><h2>{title}</h2></div>
      {items.length === 0 && <p className="desk-empty">No figures yet.</p>}
      <ul className="bar-list">
        {items.map((row) => (
          <li key={row.category}>
            <div>
              <span>{String(row.category || '').toLowerCase().replace(/_/g, ' ')}</span>
              <strong>{money(row.amount, currency)}</strong>
            </div>
            <div className="meter" aria-hidden="true"><span style={{ width: `${((Number(row.amount) || 0) / max) * 100}%` }} /></div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function LoadState({ loading, error, children }) {
  if (loading) return <p className="desk-note">Loading…</p>;
  if (error) return <p className="desk-error">{error}</p>;
  return children;
}

export function useCurrency() {
  const org = useApi('/settings/organization');
  return org.data?.currency || 'INR';
}
