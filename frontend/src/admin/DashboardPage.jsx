import React from 'react';
import { Boxes, CalendarDays, CalendarPlus, Flag, Hourglass, IdCard, ListTodo, Megaphone, Package, ShoppingCart, Ticket, UserRound, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ago, count, money, shortId, when } from './format';
import { useApi } from './useApi';

const ACTIONS = [
  { section: 'events', id: 'new', label: 'Create event', icon: CalendarPlus },
  { section: 'members', id: 'new', label: 'Add member', icon: UserRound },
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

  return (
    <div className="desk-page">
      <header className="desk-page-head">
        <div>
          <p className="desk-kicker">Overview</p>
          <h1>Today on the desk</h1>
          <p>Membership, tickets, orders, and volunteer work in one place.</p>
        </div>
      </header>

      <section className="kpi-grid">
        {cards.map(([label, value, Icon]) => (
          <article key={label} className="kpi-card">
            <span className="kpi-ico" aria-hidden="true"><Icon size={18} /></span>
            <span>{label}</span>
            <strong>{count(value)}</strong>
          </article>
        ))}
      </section>

      <section className="ledger-strip">
        <article>
          <span>Ledger income</span>
          <strong>{money(data.revenue, currency)}</strong>
        </article>
        <article>
          <span>Pending expenses</span>
          <strong>{count(data.pendingExpenses)}</strong>
        </article>
        <article>
          <span>Open orders</span>
          <strong>{count(data.openOrders)}</strong>
        </article>
      </section>

      <section className="action-row" aria-label="Quick actions">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button key={action.label} type="button" onClick={() => go(action.section, action.id)}>
              <Icon size={16} />
              {action.label}
            </button>
          );
        })}
      </section>

      <div className="desk-split">
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
      </div>

      <div className="desk-split">
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
