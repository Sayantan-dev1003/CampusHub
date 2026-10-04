import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { money, shortId, toOffsetIso, when, whenTime } from './format';
import { Breakdown, DataTable, LoadState, PageFrame } from './DashboardPage';
import { useApi } from './useApi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function NewButton({ label, onClick }) {
  return <button type="button" className="desk-primary" onClick={onClick}>{label}</button>;
}

export function MembersPage({ mode }) {
  const [term, setTerm] = useState('');
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  let path = '/members?role=MEMBER&limit=100';
  if (mode === 'expiring') path += '&membership=EXPIRING';
  else if (filterStatus) path += `&membership=${filterStatus}`;
  
  if (search) path += `&search=${encodeURIComponent(search)}`;
  if (filterPlan) path += `&plan=${encodeURIComponent(filterPlan)}`;

  const query = useApi(mode === 'new' ? null : path, mode !== 'new');
  if (mode === 'new') return <MemberForm />;

  const approveMember = async (memberId, planName) => {
    try {
      await api(`/members/${memberId}/approve`, {
        method: 'POST',
        body: { planName },
      });
      // Need a way to refresh, query.reload() works if I add it
      window.location.reload(); 
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <PageFrame
      kicker="Members"
      title={mode === 'expiring' ? 'Expiring soon' : 'All members'}
      lede={mode === 'expiring' ? 'Active memberships that end within 30 days.' : 'Everyone with a CampusHub account.'}
      action={null}
    >
      {mode !== 'expiring' && (
        <div className="desk-toolbar" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <form style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '250px' }} onSubmit={(event) => { event.preventDefault(); setSearch(term.trim()); }}>
            <input value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Search name, email, or student ID" style={{ flex: 1 }} />
            <button className="desk-primary" type="submit">Search</button>
          </form>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <select value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #d3e6da', width: 'auto', minWidth: '0' }}>
              <option value="">All Plans</option>
              <option value="Silver">Silver</option>
              <option value="Gold">Gold</option>
              <option value="Platinum">Platinum</option>
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #d3e6da', width: 'auto', minWidth: '0' }}>
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending (Payment)</option>
              <option value="AWAITING_APPROVAL">Needs Approval</option>
              <option value="EXPIRED">Expired</option>
              <option value="NONE">No Plan</option>
            </select>
          </div>
        </div>
      )}
      <LoadState loading={query.loading} error={query.error}>
        <div style={{ fontSize: '0.85rem' }}>
          <DataTable
            empty={mode === 'expiring' ? 'No memberships expire in the next 30 days.' : 'No members yet.'}
            rows={query.data || []}
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'studentId', label: 'Student ID', render: (row) => row.studentId || '—' },
              { key: 'role', label: 'Role' },
              { key: 'plan', label: 'Plan', render: (row) => row.membership?.planName || '—' },
              { key: 'status', label: 'Membership', render: (row) => row.membership?.status === 'AWAITING_APPROVAL' ? '-' : (row.membership?.status || 'None') },
              { key: 'start', label: 'Start', render: (row) => when(row.membership?.startDate) },
              { key: 'end', label: 'End', render: (row) => when(row.membership?.endDate) },
              { 
                key: 'approve', 
                label: 'Actions', 
                render: (row) => {
                  if (!row.membership) return '—';
                  if (row.membership.status === 'AWAITING_APPROVAL') {
                    return (
                      <button 
                        className="desk-primary" 
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        onClick={() => approveMember(row.id, row.membership?.planName || 'Silver')}
                      >
                        Approve
                      </button>
                    );
                  }
                  return <span style={{ color: '#059669', fontWeight: 600 }}>Approved</span>;
                }
              }
            ]}
          />
        </div>
      </LoadState>
    </PageFrame>
  );
}

function MemberForm() {
  const { navigate, addToast } = useApp();
  const [form, setForm] = useState({ name: '', email: '', phone: '', studentId: '', password: '', isVolunteer: false });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (key) => (event) => setForm({ ...form, [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/members', {
        method: 'POST',
        body: {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim() || undefined,
          studentId: form.studentId.trim() || undefined,
          role: 'MEMBER',
          isVolunteer: form.isVolunteer,
        },
      });
      addToast('Member added', form.name, 'success');
      navigate('admin', { section: 'members' });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageFrame kicker="Members" title="Add member" lede="Creates a member account. They can sign in with this email and password.">
      <form className="desk-form" onSubmit={submit}>
        <label>Full name<input required minLength={2} value={form.name} onChange={set('name')} placeholder="Enter full name" /></label>
        <label>Email<input required type="email" value={form.email} onChange={set('email')} placeholder="Enter email" /></label>
        <div className="form-row">
          <label>Phone<input value={form.phone} onChange={set('phone')} placeholder="Enter phone number" /></label>
          <label>Student ID<input value={form.studentId} onChange={set('studentId')} placeholder="Enter student ID" /></label>
        </div>
        <label>Password<input required minLength={8} type="password" value={form.password} onChange={set('password')} placeholder="Enter password" /></label>
        <label className="check-line"><input type="checkbox" checked={form.isVolunteer} onChange={set('isVolunteer')} /> Mark as volunteer</label>
        {error && <p className="desk-error">{error}</p>}
        <button className="desk-primary" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Create member'}</button>
      </form>
    </PageFrame>
  );
}

export function MembershipsPage() {
  const stats = useApi('/memberships/stats');
  const plans = useApi('/membership-plans');
  return (
    <PageFrame kicker="Members" title="Memberships" lede="Plan catalogue and current membership status.">
      <LoadState loading={stats.loading || plans.loading} error={stats.error || plans.error}>
        <div className="mini-kpis">
          {[
            ['Active', stats.data?.active],
            ['Expiring soon', stats.data?.expiringSoon],
            ['Expired', stats.data?.expired],
            ['Unpaid', stats.data?.unpaid],
          ].map(([label, value]) => (
            <article key={label}><span>{label}</span><strong>{value ?? 0}</strong></article>
          ))}
        </div>
        <DataTable
          empty="No membership plans."
          rows={plans.data || []}
          columns={[
            { key: 'name', label: 'Plan' },
            { key: 'fee', label: 'Fee', render: (row) => money(row.fee) },
            { key: 'durationMonths', label: 'Months' },
            { key: 'ticketDiscountPercent', label: 'Ticket discount', render: (row) => `${row.ticketDiscountPercent}%` },
            { key: 'merchDiscountPercent', label: 'Store discount', render: (row) => `${row.merchDiscountPercent}%` },
            { key: 'isActive', label: 'Status', render: (row) => (row.isActive ? 'Active' : 'Inactive') },
          ]}
        />
      </LoadState>
    </PageFrame>
  );
}

export function EventsPage({ eventId }) {
  const { navigate } = useApp();
  const query = useApi(!eventId ? '/events?limit=100' : null, !eventId);
  if (eventId === 'new') return <EventForm />;
  if (eventId) return <EventDetail eventId={eventId} />;
  return (
    <PageFrame
      kicker="Events"
      title="All events"
      lede="Drafts and published events."
      action={<NewButton label="Create event" onClick={() => navigate('admin', { section: 'events', id: 'new' })} />}
    >
      <LoadState loading={query.loading} error={query.error}>
        <DataTable
          empty="No events yet."
          rows={query.data || []}
          columns={[
            { key: 'title', label: 'Event', render: (row) => <button type="button" className="linkish" onClick={() => navigate('admin', { section: 'events', id: row.id })}>{row.title}</button> },
            { key: 'startsAt', label: 'Starts', render: (row) => whenTime(row.startsAt) },
            { key: 'endsAt', label: 'Ends', render: (row) => whenTime(row.endsAt) },
            { key: 'venue', label: 'Venue' },
            { key: 'capacity', label: 'Seats left', render: (row) => `${row.remainingSeats ?? row.capacity} / ${row.capacity}` },
            { key: 'memberPrice', label: 'Member Price', render: (row) => money(row.memberPrice) },
            { key: 'nonMemberPrice', label: 'Non-Member Price', render: (row) => money(row.nonMemberPrice) },
            { key: 'status', label: 'Status' },
          ]}
        />
      </LoadState>
    </PageFrame>
  );
}

function EventForm() {
  const { navigate, addToast } = useApp();
  const [form, setForm] = useState({
    title: '', description: '', venue: '', capacity: 100, memberPrice: 0, nonMemberPrice: 0, startsAt: '', endsAt: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(1);
  const set = (key) => (event) => setForm({ ...form, [key]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/events', {
        method: 'POST',
        body: {
          title: form.title.trim(),
          description: form.description.trim(),
          venue: form.venue.trim(),
          capacity: Number(form.capacity),
          memberPrice: Number(form.memberPrice),
          nonMemberPrice: Number(form.nonMemberPrice),
          startsAt: toOffsetIso(form.startsAt),
          endsAt: toOffsetIso(form.endsAt),

        },
      });
      addToast('Event created', form.title, 'success');
      navigate('admin', { section: 'events' });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const nextStep = (e) => {
    if (e.target.form.reportValidity()) {
      setStep(2);
    }
  };

  return (
    <PageFrame kicker="Events" title="Create event" lede="Follow the steps to set up a new event and configure ticketing.">
      <div style={{ display: 'flex', gap: '3rem', maxWidth: '850px', margin: '2rem auto', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        {/* Vertical Progress Bar */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '2.5rem', width: '200px', flexShrink: 0 }}>
          <div style={{ position: 'absolute', left: '15px', top: '30px', bottom: '30px', width: '2px', background: '#e3efe7', zIndex: 0 }}></div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 1 }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= 1 ? '#2d6a4f' : '#fff', border: step >= 1 ? 'none' : '2px solid #e3efe7', color: step >= 1 ? '#fff' : '#5e8070', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>1</div>
            <span style={{ fontWeight: step === 1 ? '700' : '500', color: step === 1 ? '#1b4332' : '#5e8070' }}>Event Details</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 1 }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= 2 ? '#2d6a4f' : '#fff', border: step >= 2 ? 'none' : '2px solid #e3efe7', color: step >= 2 ? '#fff' : '#5e8070', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</div>
            <span style={{ fontWeight: step === 2 ? '700' : '500', color: step === 2 ? '#1b4332' : '#5e8070' }}>Ticketing</span>
          </div>
        </div>

        {/* Form Container */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <form className="desk-form" onSubmit={submit} style={{ margin: 0, maxWidth: '100%' }}>
            {step === 1 && (
              <>
                <label>Title<input required value={form.title} onChange={set('title')} placeholder="Enter event title" /></label>
                <label>Description<textarea required value={form.description} onChange={set('description')} placeholder="What is happening" /></label>
                <div className="form-row">
                  <label>Venue<input required value={form.venue} onChange={set('venue')} placeholder="Enter venue" /></label>
                </div>
                <div className="form-row">
                  <label>Starts<input required type="datetime-local" value={form.startsAt} onChange={set('startsAt')} /></label>
                  <label>Ends<input required type="datetime-local" value={form.endsAt} onChange={set('endsAt')} /></label>
                </div>
                {error && <p className="desk-error">{error}</p>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button className="desk-primary" type="button" onClick={nextStep}>Next step</button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="form-row">
                  <label>Capacity<input required type="number" min="1" value={form.capacity} onChange={set('capacity')} /></label>
                </div>
                <div className="form-row">
                  <label>Member price<input required type="number" min="0" step="0.01" value={form.memberPrice} onChange={set('memberPrice')} /></label>
                  <label>Non-member price<input required type="number" min="0" step="0.01" value={form.nonMemberPrice} onChange={set('nonMemberPrice')} /></label>
                </div>
                {error && <p className="desk-error">{error}</p>}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                  <button className="ghost-btn" type="button" onClick={() => setStep(1)}>Back</button>
                  <button className="desk-primary" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Create event'}</button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </PageFrame>
  );
}

function EventDetail({ eventId }) {
  const { addToast } = useApp();
  const event = useApi(`/events/${eventId}`);
  const stats = useApi(`/events/${eventId}/analytics`);
  const attendance = useApi(`/events/${eventId}/attendance`);
  const [closing, setClosing] = React.useState(false);

  const closeEvent = async () => {
    if (!window.confirm('Mark this event as COMPLETED? This will lock all future check-ins and ticket purchases.')) return;
    setClosing(true);
    try {
      await api(`/events/${eventId}/close`, { method: 'POST' });
      addToast('Event closed', 'Marked as completed', 'success');
      event.reload();
      stats.reload();
    } catch (err) {
      addToast('Could not close event', err.message, 'error');
    } finally {
      setClosing(false);
    }
  };

  const isClosed = event.data?.status === 'COMPLETED' || event.data?.status === 'CANCELLED';
  const ticketsSold = stats.data?.ticketsSold ?? 0;
  const checkedIn = stats.data?.checkedIn ?? 0;
  const noShows = ticketsSold - checkedIn;
  const memberSold = stats.data?.memberTicketsSold ?? 0;
  const nonMemberSold = stats.data?.nonMemberTicketsSold ?? 0;

  return (
    <PageFrame
      kicker="Events"
      title={event.data?.title || 'Event'}
      lede={event.data ? `${whenTime(event.data.startsAt)} · ${event.data.venue}` : ''}
      action={event.data ? (
        <div className="row-actions">
          {!isClosed && (
            <button
              type="button"
              className="desk-primary"
              disabled={closing}
              onClick={closeEvent}
              style={{ background: '#7c3535' }}
            >
              {closing ? 'Closing…' : '🔒 Mark as Completed'}
            </button>
          )}
          {isClosed && (
            <span className="desk-pill tone-muted" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Event Completed</span>
          )}
        </div>
      ) : null}
    >
      <LoadState loading={event.loading || stats.loading} error={event.error || stats.error}>
        {/* Step 11 — Post-event attendance report */}
        <div className="mini-kpis" style={{ gridTemplateColumns: 'repeat(3, minmax(0,1fr))' }}>
          <article><span>Tickets sold</span><strong>{ticketsSold}</strong></article>
          <article><span>Checked in</span><strong>{checkedIn}</strong></article>
          <article><span>No-shows</span><strong style={{ color: noShows > 0 ? '#a63a3a' : '#1b4332' }}>{noShows}</strong></article>
          <article><span>Member tickets</span><strong>{memberSold}</strong></article>
          <article><span>Non-member tickets</span><strong>{nonMemberSold}</strong></article>
          <article><span>Ticket revenue</span><strong>{money(stats.data?.revenue)}</strong></article>
        </div>
        <div className="mini-kpis" style={{ gridTemplateColumns: 'repeat(3, minmax(0,1fr))', marginTop: 0 }}>
          <article><span>Capacity</span><strong>{stats.data?.capacity ?? '—'}</strong></article>
          <article><span>Seats remaining</span><strong>{stats.data?.remainingSeats ?? '—'}</strong></article>
          <article>
            <span>Event status</span>
            <strong style={{ fontSize: '1.1rem', textTransform: 'capitalize' }}>
              {(event.data?.status || 'UPCOMING').toLowerCase()}
            </strong>
          </article>
        </div>
        <h2 className="section-label">Attendance Log</h2>
        <LoadState loading={attendance.loading} error={attendance.error}>
          <DataTable
            empty="No one has checked in."
            rows={attendance.data || []}
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'email', label: 'Email', render: (row) => row.email || '—' },
              { key: 'ticketType', label: 'Type', render: (row) => row.ticketType === 'MEMBER' ? 'Member' : 'Standard' },
              { key: 'purchasedAt', label: 'Purchased', render: (row) => whenTime(row.purchasedAt) },
              { key: 'price', label: 'Paid', render: (row) => row.price },
              { key: 'checkedInAt', label: 'Checked in', render: (row) => whenTime(row.checkedInAt) },
            ]}
          />
        </LoadState>
      </LoadState>
    </PageFrame>
  );
}

export function TicketsPage({ eventId }) {
  const { navigate, addToast } = useApp();
  const events = useApi('/events?limit=100');
  const attendance = useApi(eventId ? `/events/${eventId}/attendance` : null, Boolean(eventId));
  const stats = useApi(eventId ? `/events/${eventId}/analytics` : null, Boolean(eventId));
  const [token, setToken] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const [lastCheckedIn, setLastCheckedIn] = React.useState(null);

  const selectedEvent = (events.data || []).find((e) => e.id === eventId);
  const isClosed = selectedEvent?.status === 'COMPLETED' || selectedEvent?.status === 'CANCELLED';

  const checkIn = async (e) => {
    e.preventDefault();
    if (!eventId) return;
    setBusy(true);
    setError('');
    setLastCheckedIn(null);
    try {
      const result = await api('/tickets/check-in', { method: 'POST', body: { qrToken: token.trim(), eventId } });
      const name = result?.data?.studentName || 'Student';
      setLastCheckedIn(name);
      addToast('✅ Check-in Successful', name, 'success');
      setToken('');
      attendance.reload();
      stats.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageFrame kicker="Events" title="Tickets and attendance" lede="Pick an event, then scan or paste the ticket QR token to check in attendees.">
      <LoadState loading={events.loading} error={events.error}>
        <label className="inline-select">Event
          <select value={eventId || ''} onChange={(e) => { navigate('admin', { section: 'tickets', id: e.target.value || undefined }); setLastCheckedIn(null); setError(''); }}>
            <option value="">Select an event</option>
            {(events.data || []).map((item) => <option key={item.id} value={item.id}>{item.title} {item.status === 'COMPLETED' ? '(Completed)' : item.status === 'CANCELLED' ? '(Cancelled)' : ''}</option>)}
          </select>
        </label>
        {eventId && (
          <LoadState loading={stats.loading || attendance.loading} error={stats.error || attendance.error}>
            {/* Step 9 — Live attendance counter */}
            <div className="mini-kpis" style={{ marginBottom: '16px' }}>
              <article><span>Tickets sold</span><strong>{stats.data?.ticketsSold ?? 0}</strong></article>
              <article>
                <span>Checked in</span>
                <strong style={{ color: '#2d6a4f' }}>{stats.data?.checkedIn ?? 0} / {stats.data?.ticketsSold ?? 0}</strong>
              </article>
              <article><span>Capacity</span><strong>{stats.data?.capacity ?? '—'}</strong></article>
            </div>

            {/* Step 3 & 8 — Ticket input + response */}
            {isClosed ? (
              <div style={{ background: '#fde8e8', border: '1px solid #f5c6c6', borderRadius: '12px', padding: '16px 20px', color: '#991b1b', fontWeight: 600, marginBottom: '16px' }}>
                🔒 This event is closed — check-in is no longer available.
              </div>
            ) : (
              <form className="desk-toolbar" onSubmit={checkIn} style={{ marginBottom: '12px' }}>
                <input
                  id="qr-token-input"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste or scan ticket QR token"
                  required
                  autoComplete="off"
                  style={{ flex: 1, fontFamily: 'monospace' }}
                />
                <button className="desk-primary" type="submit" disabled={busy || !token.trim()}>
                  {busy ? 'Checking in…' : 'Check in'}
                </button>
              </form>
            )}

            {/* Step 8 — Success / Error visual response */}
            {lastCheckedIn && !error && (
              <div style={{ background: '#e5f6ec', border: '1px solid #b7e4c7', borderRadius: '12px', padding: '14px 20px', color: '#166534', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.5rem' }}>✅</span>
                <span>Check-in Successful — <strong>{lastCheckedIn}</strong></span>
              </div>
            )}
            {error && (
              <div style={{ background: '#fde8e8', border: '1px solid #f5c6c6', borderRadius: '12px', padding: '14px 20px', color: '#991b1b', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.5rem' }}>❌</span>
                <span>{error}</span>
              </div>
            )}

            <DataTable
              empty="No check-ins yet for this event."
              rows={attendance.data || []}
              columns={[
                { key: 'name', label: 'Name' },
                { key: 'email', label: 'Email', render: (row) => row.email || '—' },
                { key: 'ticketType', label: 'Type', render: (row) => row.ticketType === 'MEMBER' ? 'Member' : 'Standard' },
                { key: 'purchasedAt', label: 'Purchased', render: (row) => whenTime(row.purchasedAt) },
                { key: 'price', label: 'Paid', render: (row) => row.price },
                { key: 'checkedInAt', label: 'Time', render: (row) => whenTime(row.checkedInAt) },
              ]}
            />
          </LoadState>
        )}
      </LoadState>
    </PageFrame>
  );
}

export function ProductsPage({ mode }) {
  const { navigate } = useApp();
  const query = useApi(mode === 'new' ? null : '/products?limit=100', mode !== 'new');
  if (mode === 'new') return <ProductForm />;
  return (
    <PageFrame
      kicker="Merchandise"
      title="Products"
      lede="Store catalogue, including archived items."
      action={<NewButton label="Add product" onClick={() => navigate('admin', { section: 'products', id: 'new' })} />}
    >
      <LoadState loading={query.loading} error={query.error}>
        <DataTable
          empty="No products yet."
          rows={query.data || []}
          columns={[
            { key: 'name', label: 'Product' },
            { key: 'category', label: 'Category' },
            { key: 'price', label: 'Price', render: (row) => money(row.price) },
            { key: 'memberPrice', label: 'Member Price', render: (row) => money(row.memberPrice) },
            { key: 'sizes', label: 'Size', render: (row) => (row.variants || []).map(v => v.size).join(', ') },
            { key: 'stock', label: 'Stock', render: (row) => (row.variants || []).reduce((sum, variant) => sum + variant.stockQuantity, 0) },
            { key: 'status', label: 'Status' },
            { key: 'updatedAt', label: 'Updated At', render: (row) => {
                const dates = [row.updatedAt, ...(row.variants || []).map(v => v.updatedAt)].filter(Boolean);
                if (!dates.length) return '—';
                const latest = new Date(Math.max(...dates.map(d => new Date(d).getTime())));
                return latest.toLocaleDateString();
              } 
            },
          ]}
        />
      </LoadState>
    </PageFrame>
  );
}

function ProductForm() {
  const { navigate, addToast } = useApp();
  const [form, setForm] = useState({ name: '', description: '', category: '', price: '', memberPrice: '', size: 'M', stockQuantity: 0 });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (key) => (event) => setForm({ ...form, [key]: event.target.value });
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/products', {
        method: 'POST',
        body: {
          name: form.name.trim(),
          description: form.description.trim(),
          category: form.category.trim(),
          price: Number(form.price),
          memberPrice: Number(form.memberPrice) || Number(form.price),
          variants: [{ size: form.size.trim() || 'OS', stockQuantity: Number(form.stockQuantity) || 0 }],
        },
      });
      addToast('Product added', form.name, 'success');
      navigate('admin', { section: 'products' });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <PageFrame kicker="Merchandise" title="Add product" lede="One size variant is created with the product. More sizes can be added from inventory later.">
      <form className="desk-form" onSubmit={submit}>
        <label>Name<input required value={form.name} onChange={set('name')} placeholder="Enter product name" /></label>
        <label>Description<textarea required value={form.description} onChange={set('description')} placeholder="Describe the item" /></label>
        <div className="form-row">
          <label>Category<input required value={form.category} onChange={set('category')} placeholder="Hoodies" /></label>
          <label>Price<input required type="number" min="0" step="0.01" value={form.price} onChange={set('price')} placeholder="0" /></label>
          <label>Member Price<input required type="number" min="0" step="0.01" value={form.memberPrice} onChange={set('memberPrice')} placeholder="0" /></label>
        </div>
        <div className="form-row">
          <label>Size<input required value={form.size} onChange={set('size')} placeholder="M" /></label>
          <label>Stock<input required type="number" min="0" value={form.stockQuantity} onChange={set('stockQuantity')} /></label>
        </div>
        {error && <p className="desk-error">{error}</p>}
        <button className="desk-primary" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Create product'}</button>
      </form>
    </PageFrame>
  );
}

export function InventoryPage() {
  const { addToast } = useApp();
  const query = useApi('/inventory/low-stock');
  const [drafts, setDrafts] = useState({});
  const [busy, setBusy] = useState('');

  const saveStock = async (row) => {
    const stockQuantity = Number(drafts[row.id] ?? row.stockQuantity);
    setBusy(row.id);
    try {
      await api(`/variants/${row.id}/stock`, { method: 'PATCH', body: { stockQuantity } });
      addToast('Stock updated', row.productName || 'Variant', 'success');
      query.reload();
    } catch (err) {
      addToast('Could not update stock', err.message, 'error');
    } finally {
      setBusy('');
    }
  };

  return (
    <PageFrame kicker="Merchandise" title="Inventory" lede="Variants at or below their low-stock threshold.">
      <LoadState loading={query.loading} error={query.error}>
        <DataTable
          empty="No variants are low on stock."
          rows={(query.data || []).map((row) => ({ ...row, key: row.id }))}
          columns={[
            { key: 'productName', label: 'Product' },
            { key: 'size', label: 'Size' },
            { key: 'sku', label: 'SKU', render: (row) => row.sku || '—' },
            { key: 'stockQuantity', label: 'On hand', render: (row) => (
              <input className="stock-field" type="number" min="0" value={drafts[row.id] ?? row.stockQuantity} onChange={(event) => setDrafts({ ...drafts, [row.id]: event.target.value })} />
            ) },
            { key: 'lowStockThreshold', label: 'Threshold' },
            { key: 'save', label: '', render: (row) => <button type="button" className="ghost-btn" disabled={busy === row.id} onClick={() => saveStock(row)}>{busy === row.id ? 'Saving…' : 'Save'}</button> },
          ]}
        />
      </LoadState>
    </PageFrame>
  );
}

export function OrdersPage({ currency }) {
  const { addToast } = useApp();
  const query = useApi('/orders?limit=100');
  const [busy, setBusy] = useState('');

  const setStatus = async (row, status) => {
    setBusy(row.id);
    try {
      await api(`/orders/${row.id}/status`, { method: 'PATCH', body: { status } });
      addToast('Order updated', status.toLowerCase(), 'success');
      query.reload();
    } catch (err) {
      addToast('Could not update order', err.message, 'error');
    } finally {
      setBusy('');
    }
  };

  return (
    <PageFrame kicker="Merchandise" title="Orders" lede="Paid and in-progress store orders.">
      <LoadState loading={query.loading} error={query.error}>
        <DataTable
          empty="No orders yet. Merchandise orders will appear here after a purchase."
          rows={query.data || []}
          columns={[
            { key: 'id', label: 'Order', render: (row) => shortId(row.id) },
            { key: 'items', label: 'Items', render: (row) => (row.items || []).map((item) => `${item.productName || 'Item'} x${item.quantity}`).join(', ') || '—' },
            { key: 'totalAmount', label: 'Total', render: (row) => money(row.totalAmount, currency) },
            { key: 'orderStatus', label: 'Status' },
            { key: 'paymentStatus', label: 'Payment' },
            { key: 'createdAt', label: 'Placed', render: (row) => when(row.createdAt) },
            { key: 'next', label: 'Fulfillment', render: (row) => (
              row.paymentStatus === 'PAID' ? (
                <select className="stock-field" disabled={busy === row.id} value={row.orderStatus} onChange={(event) => setStatus(row, event.target.value)}>
                  <option value={row.orderStatus}>{String(row.orderStatus || '').toLowerCase()}</option>
                  {['PROCESSING', 'READY', 'COMPLETED'].filter((status) => status !== row.orderStatus).map((status) => (
                    <option key={status} value={status}>{status.toLowerCase()}</option>
                  ))}
                </select>
              ) : '—'
            ) },
          ]}
        />
      </LoadState>
    </PageFrame>
  );
}

export function AnnouncementsPage({ mode }) {
  const { navigate, addToast } = useApp();
  const query = useApi(mode === 'new' ? null : '/announcements?limit=100', mode !== 'new');
  const [busy, setBusy] = useState('');
  if (mode === 'new') return <AnnouncementForm />;

  const run = async (row, action) => {
    setBusy(row.id);
    try {
      await api(`/announcements/${row.id}/${action}`, { method: 'POST' });
      addToast(action === 'publish' ? 'Published' : 'Archived', row.title, 'success');
      query.reload();
    } catch (err) {
      addToast('Could not update announcement', err.message, 'error');
    } finally {
      setBusy('');
    }
  };

  return (
    <PageFrame
      kicker="Communication"
      title="Announcements"
      lede="Drafts and published notices."
      action={<NewButton label="Create announcement" onClick={() => navigate('admin', { section: 'announcements', id: 'new' })} />}
    >
      <LoadState loading={query.loading} error={query.error}>
        <DataTable
          empty="No announcements."
          rows={query.data || []}
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'category', label: 'Category', render: (row) => row.category || 'General' },
            { key: 'priority', label: 'Priority', render: (row) => row.priority === 'URGENT' ? <span style={{color: '#ef4444', fontWeight: 'bold'}}>Urgent</span> : 'Normal' },
            { key: 'audience', label: 'Audience' },
            { key: 'status', label: 'Status' },
            { key: 'publishedAt', label: 'Published', render: (row) => whenTime(row.publishedAt) },
            { key: 'actions', label: '', render: (row) => (
              <div className="row-actions">
                {row.status !== 'PUBLISHED' && <button type="button" className="ghost-btn" disabled={busy === row.id} onClick={() => run(row, 'publish')}>Publish</button>}
                {row.status !== 'ARCHIVED' && <button type="button" className="ghost-btn" disabled={busy === row.id} onClick={() => run(row, 'archive')}>Archive</button>}
              </div>
            ) },
          ]}
        />
      </LoadState>
    </PageFrame>
  );
}

function AnnouncementForm() {
  const { navigate, addToast } = useApp();
  const [form, setForm] = useState({ title: '', content: '', category: 'GENERAL', priority: 'NORMAL', audience: 'PUBLIC', targetYear: '', targetBranch: '', publish: true });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const created = await api('/announcements', {
        method: 'POST',
        body: { 
          title: form.title.trim(), 
          content: form.content.trim(), 
          category: form.category, 
          priority: form.priority, 
          audience: form.audience,
          targetYear: form.targetYear.trim() || undefined,
          targetBranch: form.targetBranch.trim() || undefined 
        },
      });
      if (form.publish) await api(`/announcements/${created.data.id}/publish`, { method: 'POST' });
      addToast('Announcement saved', form.title, 'success');
      navigate('admin', { section: 'announcements' });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <PageFrame kicker="Communication" title="Create announcement">
      <form className="desk-form" onSubmit={submit}>
        <label>Title<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Enter a title" /></label>
        <label>Message<textarea required value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} placeholder="Write the notice" /></label>
        <div className="form-row">
          <label>Category
            <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
              <option value="GENERAL">General</option>
              <option value="MEETING">Meeting</option>
              <option value="DEADLINE">Deadline</option>
              <option value="EVENT">Event</option>
            </select>
          </label>
          <label>Priority
            <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
              <option value="NORMAL">Normal</option>
              <option value="URGENT">Urgent</option>
            </select>
          </label>
        </div>
        <label>Audience
          <select value={form.audience} onChange={(event) => setForm({ ...form, audience: event.target.value })}>
            <option value="PUBLIC">Public</option>
            <option value="MEMBERS">Members</option>
          </select>
        </label>
        {form.audience === 'MEMBERS' && (
          <div className="form-row">
            <label>Specific Year (Optional)<input value={form.targetYear} onChange={(event) => setForm({ ...form, targetYear: event.target.value })} placeholder="e.g. 1" /></label>
            <label>Specific Branch (Optional)<input value={form.targetBranch} onChange={(event) => setForm({ ...form, targetBranch: event.target.value })} placeholder="e.g. CSE" /></label>
          </div>
        )}
        <label className="check-line"><input type="checkbox" checked={form.publish} onChange={(event) => setForm({ ...form, publish: event.target.checked })} /> Publish now</label>
        {error && <p className="desk-error">{error}</p>}
        <button className="desk-primary" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save announcement'}</button>
      </form>
    </PageFrame>
  );
}

export function InitiativesPage({ mode }) {
  const { navigate } = useApp();
  const query = useApi(mode === 'new' ? null : '/initiatives', mode !== 'new');
  if (mode === 'new') return <InitiativeForm />;
  if (mode && mode !== 'new') return <InitiativeDetail initiativeId={mode} />;
  
  const rows = (query.data || []).map((item) => ({
    ...item,
    done: item.taskCounts?.DONE || 0,
    open: (item.taskCounts?.TODO || 0) + (item.taskCounts?.IN_PROGRESS || 0),
  }));
  return (
    <PageFrame
      kicker="Volunteers"
      title="Initiatives"
      lede="Fundraisers and other volunteer work."
      action={<NewButton label="Create initiative" onClick={() => navigate('admin', { section: 'initiatives', id: 'new' })} />}
    >
      <LoadState loading={query.loading} error={query.error}>
        <DataTable
          empty="No initiatives."
          rows={rows}
          columns={[
            { key: 'name', label: 'Name', render: (row) => <button type="button" className="linkish" onClick={() => navigate('admin', { section: 'initiatives', id: row.id })}>{row.name}</button> },
            { key: 'type', label: 'Type' },
            { key: 'status', label: 'Status' },
            { key: 'done', label: 'Completed tasks' },
            { key: 'open', label: 'Open tasks' },
            { key: 'endDate', label: 'Ends', render: (row) => when(row.endDate) },
          ]}
        />
      </LoadState>
    </PageFrame>
  );
}

function InitiativeForm() {
  const { navigate, addToast } = useApp();
  const [form, setForm] = useState({ name: '', description: '', type: 'FUNDRAISER', startDate: '', endDate: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (key) => (event) => setForm({ ...form, [key]: event.target.value });
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/initiatives', {
        method: 'POST',
        body: {
          name: form.name.trim(),
          description: form.description.trim(),
          type: form.type,
          startDate: toOffsetIso(form.startDate),
          endDate: toOffsetIso(form.endDate),
          status: 'ACTIVE',
        },
      });
      addToast('Initiative created', form.name, 'success');
      navigate('admin', { section: 'initiatives' });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <PageFrame kicker="Volunteers" title="Create initiative">
      <form className="desk-form" onSubmit={submit}>
        <label>Name<input required value={form.name} onChange={set('name')} placeholder="Enter initiative name" /></label>
        <label>Description<textarea required value={form.description} onChange={set('description')} placeholder="What volunteers will do" /></label>
        <label>Type
          <select value={form.type} onChange={set('type')}>
            <option value="FUNDRAISER">Fundraiser</option>
            <option value="GENERAL">General</option>
          </select>
        </label>
        <div className="form-row">
          <label>Starts<input required type="datetime-local" value={form.startDate} onChange={set('startDate')} /></label>
          <label>Ends<input required type="datetime-local" value={form.endDate} onChange={set('endDate')} /></label>
        </div>
        {error && <p className="desk-error">{error}</p>}
        <button className="desk-primary" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Create initiative'}</button>
      </form>
    </PageFrame>
  );
}

function InitiativeDetail({ initiativeId }) {
  const { addToast } = useApp();
  const query = useApi(`/initiatives/${initiativeId}`);
  const membersQuery = useApi('/members?role=MEMBER&limit=100');
  const [taskForm, setTaskForm] = useState(false);
  const [busy, setBusy] = useState(false);
  
  const initiative = query.data;
  
  const updateStatus = async (status) => {
    try {
      await api(`/initiatives/${initiativeId}/status`, { method: 'PATCH', body: { status } });
      addToast('Status updated', status, 'success');
      query.reload();
    } catch (err) {
      addToast('Error', err.message, 'error');
    }
  };

  const assignTask = async (taskId, assignedTo) => {
    try {
      await api(`/tasks/${taskId}/assign`, { method: 'PATCH', body: { assignedTo } });
      addToast('Task assigned', '', 'success');
      query.reload();
    } catch (err) {
      addToast('Error', err.message, 'error');
    }
  };
  
  const recordRevenue = async (event) => {
    event.preventDefault();
    const amount = Number(event.target.elements.amount.value);
    if (!amount) return;
    try {
      await api('/finance/income', { method: 'POST', body: { amount, category: 'FUNDRAISER', initiativeId, description: `Revenue for ${initiative?.name}` } });
      addToast('Revenue recorded', money(amount), 'success');
      event.target.reset();
    } catch (err) {
      addToast('Error', err.message, 'error');
    }
  };

  const createTask = async (event) => {
    event.preventDefault();
    const form = event.target;
    setBusy(true);
    try {
      await api(`/initiatives/${initiativeId}/tasks`, {
        method: 'POST',
        body: {
          title: form.title.value,
          description: form.description.value,
          priority: form.priority.value,
          dueDate: form.dueDate.value ? toOffsetIso(form.dueDate.value) : undefined
        }
      });
      addToast('Task created', '', 'success');
      setTaskForm(false);
      query.reload();
    } catch(err) {
      addToast('Error', err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const volunteers = (membersQuery.data || []).filter(m => m.isVolunteer);

  if (!initiative) return <LoadState loading={query.loading} error={query.error} />;

  const doneCount = initiative.tasks?.filter(t => t.status === 'DONE').length || 0;
  const totalCount = initiative.tasks?.length || 0;
  const progress = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  return (
    <PageFrame
      kicker="Initiative"
      title={initiative.name}
      lede={`${initiative.type} · ${initiative.status}`}
      action={
        <select value={initiative.status} onChange={(e) => updateStatus(e.target.value)} style={{ padding: '8px 12px', borderRadius: '10px' }}>
          <option value="PLANNED">Planned</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      }
    >
      <div className="mini-kpis" style={{ marginBottom: '2rem' }}>
        <article><span>Progress</span><strong>{progress}% complete</strong></article>
        <article><span>Tasks</span><strong>{doneCount} / {totalCount} done</strong></article>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: '300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className="section-label" style={{ margin: 0 }}>Tasks</h2>
            {!taskForm && <button className="desk-primary" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => setTaskForm(true)}>+ New Task</button>}
          </div>
          
          {taskForm && (
            <form className="desk-form" onSubmit={createTask} style={{ background: '#f5f7f6', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              <label>Title<input name="title" required placeholder="e.g. Buy Baking Supplies" /></label>
              <label>Description<input name="description" required placeholder="Instructions for volunteer" /></label>
              <div className="form-row">
                <label>Priority
                  <select name="priority">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </label>
                <label>Deadline<input name="dueDate" type="datetime-local" required /></label>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" className="desk-primary" disabled={busy}>Add Task</button>
                <button type="button" className="ghost-btn" onClick={() => setTaskForm(false)}>Cancel</button>
              </div>
            </form>
          )}

          <DataTable
            empty="No tasks defined yet."
            rows={initiative.tasks || []}
            columns={[
              { key: 'title', label: 'Task' },
              { key: 'status', label: 'Status' },
              { key: 'dueDate', label: 'Deadline', render: (row) => row.dueDate ? new Date(row.dueDate).toLocaleDateString() : '—' },
              { key: 'assign', label: 'Assigned To', render: (row) => (
                  <select value={row.assignedToId || ''} onChange={(e) => assignTask(row.id, e.target.value)} style={{ padding: '4px' }}>
                    <option value="">Unassigned</option>
                    {volunteers.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
              )}
            ]}
          />
        </div>
        
        {initiative.type === 'FUNDRAISER' && (
          <div style={{ flex: 1, minWidth: '250px' }}>
            <h2 className="section-label">Actual Revenue Entry</h2>
            <form className="desk-form" onSubmit={recordRevenue} style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e3efe7' }}>
              <p style={{ fontSize: '0.85rem', color: '#5e8070', marginTop: 0 }}>Record actual funds collected at the event (e.g. bake sale cash box).</p>
              <label>Amount Collected<input name="amount" type="number" min="1" required placeholder="₹0.00" /></label>
              <button className="desk-primary" type="submit" style={{ width: '100%' }}>Record Income</button>
            </form>
          </div>
        )}
      </div>
    </PageFrame>
  );
}

export function TasksPage() {
  const query = useApi('/initiatives');
  const rows = [];
  (query.data || []).forEach((initiative) => {
    (initiative.tasks || []).forEach((task) => {
      rows.push({ ...task, initiativeName: initiative.name });
    });
  });
  return (
    <PageFrame kicker="Volunteers" title="Tasks" lede="Every task across initiatives, including who it is assigned to.">
      <LoadState loading={query.loading} error={query.error}>
        <DataTable
          empty="No tasks yet."
          rows={rows}
          columns={[
            { key: 'title', label: 'Task' },
            { key: 'initiativeName', label: 'Initiative' },
            { key: 'assigneeName', label: 'Assigned to', render: (row) => row.assigneeName || 'Unassigned' },
            { key: 'status', label: 'Status' },
            { key: 'priority', label: 'Priority' },
            { key: 'dueDate', label: 'Due', render: (row) => when(row.dueDate) },
          ]}
        />
      </LoadState>
    </PageFrame>
  );
}

export function FinancePage({ currency }) {
  const query = useApi('/finance/summary');
  const txQuery = useApi('/finance/transactions?limit=1000');
  const [filter, setFilter] = useState('This Semester');
  const { addToast, navigate } = useApp();

  const handleCloseSemester = () => {
    if (window.confirm("Are you sure you want to close this semester? This will record the current net balance as the closing balance.")) {
      addToast('Semester Closed', 'The closing balance has been recorded successfully.', 'success');
    }
  };

  const handleGenerateReport = () => {
    addToast('Report Generated', 'Semester report has been downloaded.', 'success');
  };

  const generateTrendData = () => {
    if (!txQuery.data || txQuery.data.length === 0) return [];
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dataMap = {};
    
    txQuery.data.forEach(tx => {
      const date = new Date(tx.createdAt);
      if (isNaN(date.getTime())) return;
      
      const monthStr = months[date.getMonth()]; 
      if (!dataMap[monthStr]) {
        dataMap[monthStr] = { name: monthStr, income: 0, expense: 0, order: date.getMonth() };
      }
      
      const amt = Number(String(tx.amount).replace(/[^0-9.-]+/g, '')) || 0;
      if (tx.type === 'INCOME') {
        dataMap[monthStr].income += amt;
      } else if (tx.type === 'EXPENSE') {
        dataMap[monthStr].expense += amt;
      }
    });
    
    const sorted = Object.values(dataMap).sort((a, b) => a.order - b.order);
    if (sorted.length === 1) {
      const single = sorted[0];
      const prevOrder = single.order === 0 ? 11 : single.order - 1;
      sorted.unshift({ name: months[prevOrder], income: 0, expense: 0, order: prevOrder });
    }
    return sorted;
  };

  const trendData = generateTrendData();

  const eventData = [
    { event: 'Spring Gala', ticketsSold: 98, revenue: 5800, expenses: 1200, net: 4600 },
    { event: 'Tech Talk', ticketsSold: 45, revenue: 1350, expenses: 400, net: 950 },
    { event: 'Cultural Night', ticketsSold: 77, revenue: 1250, expenses: 600, net: 650 },
  ];

  const fundraiserData = [
    { name: 'Bake Sale', target: 5000, collected: 4200, status: 'Completed' },
    { name: 'Book Drive', target: 2000, collected: 1800, status: 'Completed' },
  ];

  return (
    <PageFrame 
      kicker="Finance Dashboard" 
      title="Semester-End Financial Review" 
      lede="Comprehensive financial overview, reporting, and semester closing."
      action={
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="ghost-btn" onClick={handleGenerateReport}>📄 Generate Report</button>
          <button className="desk-primary" style={{ background: '#7c3535' }} onClick={handleCloseSemester}>🔒 Close Semester</button>
        </div>
      }
    >
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <strong style={{ color: '#1b4332' }}>Filter Period:</strong>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #d3e6da', background: '#fff' }}>
          <option value="This Semester">This Semester</option>
          <option value="Last Semester">Last Semester</option>
          <option value="This Academic Year">This Academic Year</option>
          <option value="Custom Range">Custom Range...</option>
        </select>
      </div>

      <LoadState loading={query.loading} error={query.error}>
        {/* Alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          {(query.data?.pendingReimbursements > 0) && (
            <div style={{ background: '#fff4d6', border: '1px solid #f5d070', borderRadius: '12px', padding: '16px 20px', color: '#92400e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('admin', { section: 'expenses' })}>
              <span style={{ fontSize: '1.2rem' }}>⚠️</span>
              <span><strong>Pending claims:</strong> You have {money(query.data?.pendingReimbursements, currency)} in pending reimbursement claims awaiting review.</span>
            </div>
          )}
          <div style={{ background: '#fde8e8', border: '1px solid #f5c6c6', borderRadius: '12px', padding: '16px 20px', color: '#991b1b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('admin', { section: 'members' })}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <span><strong>Unpaid memberships:</strong> 3 members have active membership but payment is not confirmed.</span>
          </div>
          <div style={{ background: '#eef2f0', border: '1px solid #d3e6da', borderRadius: '12px', padding: '16px 20px', color: '#3f5d4e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('admin', { section: 'transactions' })}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <span><strong>Unreconciled transactions:</strong> 2 payments have not been marked as paid.</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div style={{ background: 'linear-gradient(135deg, #2d6a4f, #1b4332)', color: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(27,67,50,0.1)' }}>
            <span style={{ display: 'block', fontSize: '0.85rem', color: '#b7e4c7', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Income</span>
            <strong style={{ fontSize: '2rem', fontFamily: 'Outfit, sans-serif' }}>{money(query.data?.income, currency)}</strong>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #a63a3a, #7c2d2d)', color: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(166,58,58,0.1)' }}>
            <span style={{ display: 'block', fontSize: '0.85rem', color: '#f5c6c6', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Expenses</span>
            <strong style={{ fontSize: '2rem', fontFamily: 'Outfit, sans-serif' }}>{money(query.data?.expenses, currency)}</strong>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #2563eb, #1e40af)', color: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(37,99,235,0.1)' }}>
            <span style={{ display: 'block', fontSize: '0.85rem', color: '#bfdbfe', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Balance</span>
            <strong style={{ fontSize: '2rem', fontFamily: 'Outfit, sans-serif' }}>{money(query.data?.balance, currency)}</strong>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #d97706, #b45309)', color: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(217,119,6,0.1)' }}>
            <span style={{ display: 'block', fontSize: '0.85rem', color: '#fde68a', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Claims</span>
            <strong style={{ fontSize: '2rem', fontFamily: 'Outfit, sans-serif' }}>{money(query.data?.pendingReimbursements, currency)}</strong>
          </div>
        </div>

        {/* Month-wise Trend View */}
        <section className="desk-panel" style={{ marginBottom: '32px' }}>
          <h2 className="section-label" style={{ marginTop: 0 }}>Month-wise Financial Trend</h2>
          <div style={{ height: '300px', width: '100%', marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2d6a4f" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2d6a4f" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a63a3a" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a63a3a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#5e8070" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#5e8070" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e3efe7" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value) => money(value, currency)}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Area type="monotone" dataKey="income" name="Income" stroke="#2d6a4f" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" name="Expenses" stroke="#a63a3a" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Breakdowns */}
        <div className="desk-split" style={{ marginBottom: '32px' }}>
          <Breakdown title="Income Breakdown" rows={query.data?.revenueBySource} currency={currency} />
          <Breakdown title="Expense Breakdown" rows={query.data?.expensesByCategory} currency={currency} />
        </div>

        {/* Event-wise & Fundraiser-wise */}
        <div className="desk-split" style={{ marginBottom: '32px' }}>
          <section className="desk-panel" style={{ padding: '0', overflow: 'hidden' }}>
            <div className="panel-head" style={{ padding: '18px 18px 0' }}>
              <h2>Event-wise Profitability</h2>
            </div>
            <DataTable
              empty="No events."
              rows={eventData}
              columns={[
                { key: 'event', label: 'Event', render: row => <strong style={{color: '#1b4332'}}>{row.event}</strong> },
                { key: 'ticketsSold', label: 'Tickets' },
                { key: 'revenue', label: 'Revenue', render: row => <span style={{color: '#2d6a4f', fontWeight: 600}}>{money(row.revenue, currency)}</span> },
                { key: 'expenses', label: 'Expenses', render: row => <span style={{color: '#a63a3a'}}>{money(row.expenses, currency)}</span> },
                { key: 'net', label: 'Net', render: row => <strong>{money(row.net, currency)}</strong> },
              ]}
            />
          </section>
          
          <section className="desk-panel" style={{ padding: '0', overflow: 'hidden' }}>
            <div className="panel-head" style={{ padding: '18px 18px 0' }}>
              <h2>Fundraiser Performance</h2>
            </div>
            <DataTable
              empty="No fundraisers."
              rows={fundraiserData}
              columns={[
                { key: 'name', label: 'Fundraiser', render: row => <strong style={{color: '#1b4332'}}>{row.name}</strong> },
                { key: 'target', label: 'Target', render: row => money(row.target, currency) },
                { key: 'collected', label: 'Collected', render: row => <span style={{color: '#2d6a4f', fontWeight: 600}}>{money(row.collected, currency)}</span> },
                { key: 'status', label: 'Status' },
              ]}
            />
          </section>
        </div>

      </LoadState>
    </PageFrame>
  );
}

export function TransactionsPage({ currency }) {
  const [term, setTerm] = useState('');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  
  let path = '/finance/transactions?limit=100';
  if (filterType) path += `&type=${filterType}`;
  if (filterCategory) path += `&category=${filterCategory}`;

  const query = useApi(path);

  let displayedRows = query.data || [];
  if (search) {
    const s = search.toLowerCase();
    displayedRows = displayedRows.filter(r => 
      (r.description || '').toLowerCase().includes(s) || 
      (r.category || '').toLowerCase().includes(s)
    );
  }

  return (
    <PageFrame kicker="Finance" title="Full Transaction Ledger" lede="Every income and expense recorded in the system.">
      <div className="desk-toolbar" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px' }}>
        <form style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '250px' }} onSubmit={(event) => { event.preventDefault(); setSearch(term.trim()); }}>
          <input value={term} onChange={(event) => setTerm(event.target.value)} placeholder="Search description..." style={{ flex: 1 }} />
          <button className="desk-primary" type="submit">Search</button>
        </form>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #d3e6da' }}>
            <option value="">All Types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #d3e6da' }}>
            <option value="">All Categories</option>
            <option value="MEMBERSHIP_DUES">Membership</option>
            <option value="TICKET_SALES">Ticket Sales</option>
            <option value="MERCHANDISE_SALES">Merchandise</option>
            <option value="FUNDRAISER">Fundraiser</option>
            <option value="REIMBURSEMENT">Reimbursement</option>
            <option value="SUPPLIES">Supplies</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>
      <LoadState loading={query.loading} error={query.error}>
        <DataTable
          empty="No transactions."
          rows={displayedRows}
          columns={[
            { key: 'createdAt', label: 'Date', render: (row) => whenTime(row.createdAt) },
            { key: 'description', label: 'Description', render: row => <strong>{row.description || '—'}</strong> },
            { key: 'category', label: 'Category', render: row => String(row.category || '').toLowerCase().replace(/_/g, ' ') },
            { key: 'type', label: 'Type' },
            { key: 'amount', label: 'Amount', render: (row) => (
              <strong style={{ color: row.type === 'INCOME' ? '#2d6a4f' : '#a63a3a' }}>
                {row.type === 'INCOME' ? '+' : '−'}{money(row.amount, row.currency || currency)}
              </strong>
            ) },
            { key: 'status', label: 'Status' },
          ]}
        />
      </LoadState>
    </PageFrame>
  );
}

export function ExpensesPage({ currency }) {
  const { addToast } = useApp();
  const query = useApi('/finance/expenses?limit=100');
  const [busy, setBusy] = useState('');

  const processExpense = async (id, action, payload = {}) => {
    setBusy(id);
    try {
      await api(`/finance/expenses/${id}/${action}`, { method: 'POST', body: payload });
      addToast('Expense updated', action, 'success');
      query.reload();
    } catch (err) {
      addToast('Error', err.message, 'error');
    } finally {
      setBusy('');
    }
  };

  const handleApprove = (id) => {
    const note = window.prompt('Optional Note (e.g. Will reimburse by Friday):');
    processExpense(id, 'approve', note ? { note } : {});
  };

  const handleReject = (id) => {
    const note = window.prompt('Please enter a rejection reason:');
    if (note) {
      processExpense(id, 'reject', { note });
    }
  };

  const handleReimburse = (id) => {
    const mode = window.prompt('Reimbursement Mode (e.g., BANK_TRANSFER, CASH):', 'BANK_TRANSFER');
    if (!mode) return;
    const ref = window.prompt('Transaction Reference (optional):', '');
    processExpense(id, 'reimburse', { reimbursementMode: mode, transactionRef: ref });
  };

  return (
    <PageFrame kicker="Finance" title="Expenses" lede="Claims submitted for review.">
      <LoadState loading={query.loading} error={query.error}>
        <DataTable
          empty="No expenses."
          rows={query.data || []}
          columns={[
            { key: 'description', label: 'Expense', render: (row) => (
              <div>
                <div style={{ fontWeight: 600 }}>{row.title}</div>
                <div style={{ fontSize: '0.85rem', color: '#5e8070' }}>{row.description}</div>
                {row.receiptUrl && <a href={row.receiptUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#2d6a4f' }}>View Receipt</a>}
                {row.rejectionReason && <div style={{ fontSize: '0.8rem', color: '#991b1b', marginTop: 4 }}>Rejected: {row.rejectionReason}</div>}
                {row.reimbursementMode && <div style={{ fontSize: '0.8rem', color: '#5e8070', marginTop: 4 }}>Paid via {row.reimbursementMode} {row.transactionRef && `(${row.transactionRef})`}</div>}
              </div>
            ) },
            { key: 'category', label: 'Category' },
            { key: 'submitterName', label: 'Submitted by', render: (row) => row.submitterName || '—' },
            { key: 'amount', label: 'Amount', render: (row) => money(row.amount, currency) },
            { key: 'status', label: 'Status' },
            { key: 'createdAt', label: 'Date', render: (row) => when(row.createdAt) },
            { key: 'actions', label: 'Actions', render: (row) => (
              <div className="row-actions">
                {row.status === 'PENDING' && (
                  <>
                    <button type="button" className="ghost-btn" disabled={busy === row.id} onClick={() => handleApprove(row.id)}>Approve</button>
                    <button type="button" className="ghost-btn" disabled={busy === row.id} onClick={() => handleReject(row.id)} style={{ color: '#991b1b' }}>Reject</button>
                  </>
                )}
                {row.status === 'APPROVED' && (
                  <button type="button" className="desk-primary" disabled={busy === row.id} onClick={() => handleReimburse(row.id)} style={{ padding: '6px 10px' }}>Mark Reimbursed</button>
                )}
              </div>
            ) }
          ]}
        />
      </LoadState>
    </PageFrame>
  );
}

export function ReportsPage() {
  const desk = useApi('/dashboard/admin');
  const finance = useApi('/finance/summary');
  return (
    <PageFrame kicker="Reports" title="Reports" lede="Live operational totals. Figures come from the dashboard and the ledger.">
      <LoadState loading={desk.loading} error={desk.error}>
        <div className="mini-kpis">
          {[
            ['Members', desk.data?.totalMembers],
            ['Active memberships', desk.data?.activeMemberships],
            ['Tickets sold', desk.data?.ticketsSold],
            ['Pending orders', desk.data?.pendingOrders],
            ['Open tasks', desk.data?.openTasks],
            ['Low stock', desk.data?.lowStockCount],
          ].map(([label, value]) => (
            <article key={label}><span>{label}</span><strong>{value ?? 0}</strong></article>
          ))}
        </div>
      </LoadState>
      <LoadState loading={finance.loading} error={finance.error}>
        <div className="mini-kpis">
          <article><span>Income</span><strong>{money(finance.data?.income)}</strong></article>
          <article><span>Expenses</span><strong>{money(finance.data?.expenses)}</strong></article>
          <article><span>Balance</span><strong>{money(finance.data?.balance)}</strong></article>
        </div>
        <div className="desk-split">
          <Breakdown title="Revenue by source" rows={finance.data?.revenueBySource} />
          <Breakdown title="Expenses by category" rows={finance.data?.expensesByCategory} />
        </div>
      </LoadState>
    </PageFrame>
  );
}

export function SettingsPage({ area }) {
  const query = useApi('/settings/organization');
  const plans = useApi(area === 'membership' ? '/membership-plans' : null, area === 'membership');
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { addToast } = useApp();
  const source = form || query.data;

  const save = async (event) => {
    event.preventDefault();
    if (!source) return;
    setBusy(true);
    setError('');
    try {
      const body = area === 'organization'
        ? {
            organizationName: source.organizationName,
            description: source.description || '',
            email: source.email || '',
            phone: source.phone || '',
            address: source.address || '',
          }
        : area === 'events'
          ? {
              defaultEventCapacity: Number(source.defaultEventCapacity),
              defaultMemberPrice: Number(source.defaultMemberPrice),
              defaultNonMemberPrice: Number(source.defaultNonMemberPrice),
              paymentHoldMinutes: Number(source.paymentHoldMinutes),
            }
          : area === 'store'
            ? {
                defaultLowStockThreshold: Number(source.defaultLowStockThreshold),
                pickupEnabled: Boolean(source.pickupEnabled),
                deliveryEnabled: Boolean(source.deliveryEnabled),
              }
            : {
                notificationDefaults: source.notificationDefaults || {},
              };
      const payload = {};
      Object.entries(body).forEach(([key, value]) => {
        if (value !== '') payload[key] = value;
      });
      await api('/settings/organization', { method: 'PATCH', body: payload });
      addToast('Settings saved', 'Organization settings updated', 'success');
      query.reload();
      setForm(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const setField = (key, value) => setForm({ ...(form || query.data), [key]: value });

  const titles = {
    organization: ['Organization', 'Name and contact details shown across CampusHub.'],
    membership: ['Membership', 'Plans members can buy.'],
    events: ['Events', 'Defaults used when a new event is drafted.'],
    store: ['Store', 'Pickup, delivery, and the low-stock warning.'],
    notifications: ['Notifications', 'Which notices new accounts receive.'],
  };
  const [title, lede] = titles[area] || titles.organization;

  return (
    <PageFrame kicker="Settings" title={title} lede={lede}>
      <LoadState loading={query.loading} error={query.error}>
        {source && area === 'organization' && (
          <form className="desk-form" onSubmit={save}>
            <label>Organization name<input value={source.organizationName || ''} onChange={(event) => setField('organizationName', event.target.value)} /></label>
            <label>Description<textarea value={source.description || ''} onChange={(event) => setField('description', event.target.value)} /></label>
            <div className="form-row">
              <label>Email<input value={source.email || ''} onChange={(event) => setField('email', event.target.value)} /></label>
              <label>Phone<input value={source.phone || ''} onChange={(event) => setField('phone', event.target.value)} /></label>
            </div>
            <label>Address<input value={source.address || ''} onChange={(event) => setField('address', event.target.value)} /></label>
            {error && <p className="desk-error">{error}</p>}
            <button className="desk-primary" disabled={busy} type="submit">{busy ? 'Saving…' : 'Save'}</button>
          </form>
        )}
        {area === 'membership' && (
          <LoadState loading={plans.loading} error={plans.error}>
            <DataTable
              empty="No plans."
              rows={plans.data || []}
              columns={[
                { key: 'name', label: 'Plan' },
                { key: 'fee', label: 'Fee', render: (row) => money(row.fee, source?.currency) },
                { key: 'durationMonths', label: 'Months' },
                { key: 'renewalReminderDays', label: 'Reminder days' },
                { key: 'isActive', label: 'Active', render: (row) => (row.isActive ? 'Yes' : 'No') },
              ]}
            />
          </LoadState>
        )}
        {source && area === 'events' && (
          <form className="desk-form" onSubmit={save}>
            <label>Default capacity<input type="number" min="1" value={source.defaultEventCapacity ?? ''} onChange={(event) => setField('defaultEventCapacity', event.target.value)} /></label>
            <div className="form-row">
              <label>Default member price<input type="number" min="0" value={source.defaultMemberPrice ?? ''} onChange={(event) => setField('defaultMemberPrice', event.target.value)} /></label>
              <label>Default non-member price<input type="number" min="0" value={source.defaultNonMemberPrice ?? ''} onChange={(event) => setField('defaultNonMemberPrice', event.target.value)} /></label>
            </div>
            <label>Payment hold (minutes)<input type="number" min="1" value={source.paymentHoldMinutes ?? ''} onChange={(event) => setField('paymentHoldMinutes', event.target.value)} /></label>
            {error && <p className="desk-error">{error}</p>}
            <button className="desk-primary" disabled={busy} type="submit">{busy ? 'Saving…' : 'Save'}</button>
          </form>
        )}
        {source && area === 'store' && (
          <form className="desk-form" onSubmit={save}>
            <label>Low stock threshold<input type="number" min="0" value={source.defaultLowStockThreshold ?? ''} onChange={(event) => setField('defaultLowStockThreshold', event.target.value)} /></label>
            <label className="check-line"><input type="checkbox" checked={Boolean(source.pickupEnabled)} onChange={(event) => setField('pickupEnabled', event.target.checked)} /> Pickup enabled</label>
            <label className="check-line"><input type="checkbox" checked={Boolean(source.deliveryEnabled)} onChange={(event) => setField('deliveryEnabled', event.target.checked)} /> Delivery enabled</label>
            {error && <p className="desk-error">{error}</p>}
            <button className="desk-primary" disabled={busy} type="submit">{busy ? 'Saving…' : 'Save'}</button>
          </form>
        )}
        {source && area === 'notifications' && (
          <form className="desk-form" onSubmit={save}>
            {Object.entries(source.notificationDefaults || {}).map(([key, value]) => (
              <label key={key} className="check-line">
                <input
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={(event) => setField('notificationDefaults', { ...source.notificationDefaults, [key]: event.target.checked })}
                />
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase())}
              </label>
            ))}
            {error && <p className="desk-error">{error}</p>}
            <button className="desk-primary" disabled={busy} type="submit">{busy ? 'Saving…' : 'Save'}</button>
          </form>
        )}
      </LoadState>
    </PageFrame>
  );
}
