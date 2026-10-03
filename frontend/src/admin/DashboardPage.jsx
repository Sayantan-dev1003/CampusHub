import React from 'react';
import { useApp } from '../context/AppContext';
import { ago, count, money, shortId, when } from './format';
import { useApi } from './useApi';

const ACTIONS = [
  { section: 'events', id: 'new', label: 'Create event' },
  { section: 'members', id: 'new', label: 'Add member' },
  { section: 'products', id: 'new', label: 'Add product' },
  { section: 'announcements', id: 'new', label: 'Create announcement' },
  { section: 'initiatives', id: 'new', label: 'Create initiative' },
];

export default function DashboardPage({ currency }) {
  const { navigate } = useApp();
  const { data, loading, error } = useApi('/dashboard/admin');
  const go = (section, id) => navigate('admin', { section, id });

  if (loading) return <p className="desk-note">Loading the desk…</p>;
  if (error) return <p className="desk-error">{error}</p>;
  if (!data) return null;

  const cards = [
    ['Total members', data.totalMembers],
    ['Active memberships', data.activeMemberships],
    ['Upcoming events', data.upcomingEvents],
    ['Tickets sold', data.ticketsSold],
    ['Pending orders', data.pendingOrders],
    ['Pending tasks', data.openTasks],
    ['Expiring memberships', data.expiringMemberships],
    ['Low stock products', data.lowStockCount],
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
        {cards.map(([label, value]) => (
          <article key={label} className="kpi-card">
            <span>{label}</span>
            <strong>{count(value)}</strong>
          </article>
        ))}
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
                <button type="button" onClick={() => go('events', event.id)}>View event</button>
              </li>
            ))}
          </ul>
        </section>

        <section className="desk-panel">
          <div className="panel-head">
            <h2>Membership</h2>
            <button type="button" onClick={() => go('memberships')}>Open</button>
          </div>
          <div className="stat-rows">
            {[
              ['Active', data.membership?.active],
              ['Expiring soon', data.membership?.expiringSoon],
              ['Expired', data.membership?.expired],
              ['Unpaid', data.membership?.unpaid],
            ].map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{count(value)}</strong>
              </div>
            ))}
          </div>
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

      <div className="desk-split">
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
            <h2>Quick actions</h2>
          </div>
          <div className="action-grid">
            {ACTIONS.map((action) => (
              <button key={action.label} type="button" onClick={() => go(action.section, action.id)}>
                + {action.label}
              </button>
            ))}
          </div>
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

export function DataTable({ columns, rows, empty }) {
  if (!rows?.length) return <p className="desk-empty">{empty || 'Nothing here yet.'}</p>;
  return (
    <div className="table-wrap">
      <table className="desk-table">
        <thead>
          <tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id || row.key}>
              {columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
