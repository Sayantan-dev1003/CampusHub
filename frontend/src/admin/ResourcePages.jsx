import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { money, shortId, toOffsetIso, when, whenTime } from './format';
import { Breakdown, DataTable, LoadState, PageFrame } from './DashboardPage';
import { useApi } from './useApi';

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

  return (
    <PageFrame
      kicker="Events"
      title={event.data?.title || 'Event'}
      lede={event.data ? `${whenTime(event.data.startsAt)} · ${event.data.venue}` : ''}
      action={event.data ? (
        <div className="row-actions">

        </div>
      ) : null}
    >
      <LoadState loading={event.loading || stats.loading} error={event.error || stats.error}>
        <div className="mini-kpis">
          <article><span>Sold</span><strong>{stats.data?.ticketsSold ?? 0}</strong></article>
          <article><span>Checked in</span><strong>{stats.data?.checkedIn ?? 0}</strong></article>
          <article><span>Seats left</span><strong>{stats.data?.remainingSeats ?? '—'}</strong></article>
          <article><span>Sold (Member)</span><strong>{stats.data?.memberTicketsSold ?? 0}</strong></article>
          <article><span>Sold (Non-member)</span><strong>{stats.data?.nonMemberTicketsSold ?? 0}</strong></article>
          <article><span>Ticket revenue</span><strong>{money(stats.data?.revenue)}</strong></article>
        </div>
        <h2 className="section-label">Attendance</h2>
        <LoadState loading={attendance.loading} error={attendance.error}>
          <DataTable
            empty="No one has checked in."
            rows={attendance.data || []}
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'email', label: 'Email', render: (row) => row.email || '—' },
              { key: 'ticketType', label: 'Type', render: (row) => row.ticketType === 'MEMBER' ? 'Member' : 'Standard' },
              { key: 'purchasedAt', label: 'Purchased', render: (row) => whenTime(row.purchasedAt) },
              { key: 'price', label: 'Paid', render: (row) => money(row.price) },
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
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const checkIn = async (event) => {
    event.preventDefault();
    if (!eventId) return;
    setBusy(true);
    setError('');
    try {
      await api('/tickets/check-in', { method: 'POST', body: { qrToken: token.trim() } });
      addToast('Checked in', 'Ticket marked as used', 'success');
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
    <PageFrame kicker="Events" title="Tickets and attendance" lede="Pick an event to see sold seats and the door list.">
      <LoadState loading={events.loading} error={events.error}>
        <label className="inline-select">Event
          <select value={eventId || ''} onChange={(event) => navigate('admin', { section: 'tickets', id: event.target.value || undefined })}>
            <option value="">Select an event</option>
            {(events.data || []).map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
        </label>
        {eventId && (
          <LoadState loading={stats.loading || attendance.loading} error={stats.error || attendance.error}>
            <form className="desk-toolbar" onSubmit={checkIn}>
              <input value={token} onChange={(event) => setToken(event.target.value)} placeholder="Paste a ticket QR token" required />
              <button className="desk-primary" type="submit" disabled={busy}>{busy ? 'Checking…' : 'Check in'}</button>
            </form>
            {error && <p className="desk-error">{error}</p>}
            <div className="mini-kpis">
              <article><span>Tickets sold</span><strong>{stats.data?.ticketsSold ?? 0}</strong></article>
              <article><span>Checked in</span><strong>{stats.data?.checkedIn ?? 0}</strong></article>
              <article><span>Capacity</span><strong>{stats.data?.capacity ?? '—'}</strong></article>
            </div>
            <DataTable
              empty="No check-ins for this event."
              rows={attendance.data || []}
              columns={[
                { key: 'name', label: 'Name' },
                { key: 'email', label: 'Email', render: (row) => row.email || '—' },
                { key: 'ticketType', label: 'Type', render: (row) => row.ticketType === 'MEMBER' ? 'Member' : 'Standard' },
                { key: 'purchasedAt', label: 'Purchased', render: (row) => whenTime(row.purchasedAt) },
                { key: 'price', label: 'Paid', render: (row) => money(row.price) },
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
            { key: 'stock', label: 'Stock', render: (row) => (row.variants || []).reduce((sum, variant) => sum + variant.stockQuantity, 0) },
            { key: 'status', label: 'Status' },
          ]}
        />
      </LoadState>
    </PageFrame>
  );
}

function ProductForm() {
  const { navigate, addToast } = useApp();
  const [form, setForm] = useState({ name: '', description: '', category: '', price: '', size: 'M', stockQuantity: 0 });
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
  const [form, setForm] = useState({ title: '', content: '', audience: 'PUBLIC', publish: true });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const created = await api('/announcements', {
        method: 'POST',
        body: { title: form.title.trim(), content: form.content.trim(), audience: form.audience },
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
        <label>Audience
          <select value={form.audience} onChange={(event) => setForm({ ...form, audience: event.target.value })}>
            <option value="PUBLIC">Public</option>
            <option value="MEMBERS">Members</option>
          </select>
        </label>
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
            { key: 'name', label: 'Name' },
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
  return (
    <PageFrame kicker="Finance" title="Financial overview" lede="Posted ledger totals. Approval and reimbursement stay with the treasurer.">
      <LoadState loading={query.loading} error={query.error}>
        <div className="mini-kpis">
          <article><span>Income</span><strong>{money(query.data?.income, currency)}</strong></article>
          <article><span>Expenses</span><strong>{money(query.data?.expenses, currency)}</strong></article>
          <article><span>Balance</span><strong>{money(query.data?.balance, currency)}</strong></article>
          <article><span>Pending reimbursements</span><strong>{money(query.data?.pendingReimbursements, currency)}</strong></article>
        </div>
        <div className="desk-split">
          <Breakdown title="Revenue by source" rows={query.data?.revenueBySource} currency={currency} />
          <Breakdown title="Expenses by category" rows={query.data?.expensesByCategory} currency={currency} />
        </div>
        <h2 className="section-label">Recent transactions</h2>
        <DataTable
          empty="No posted transactions."
          rows={query.data?.recentTransactions || []}
          columns={[
            { key: 'createdAt', label: 'Date', render: (row) => when(row.createdAt) },
            { key: 'type', label: 'Type' },
            { key: 'category', label: 'Category' },
            { key: 'description', label: 'Description' },
            { key: 'amount', label: 'Amount', render: (row) => money(row.amount, row.currency || currency) },
          ]}
        />
      </LoadState>
    </PageFrame>
  );
}

export function TransactionsPage({ currency }) {
  const query = useApi('/finance/transactions?limit=100');
  return (
    <PageFrame kicker="Finance" title="Transactions" lede="Posted income and expenses from the ledger.">
      <LoadState loading={query.loading} error={query.error}>
        <DataTable
          empty="No transactions."
          rows={query.data || []}
          columns={[
            { key: 'createdAt', label: 'Date', render: (row) => whenTime(row.createdAt) },
            { key: 'type', label: 'Type' },
            { key: 'category', label: 'Category' },
            { key: 'description', label: 'Description' },
            { key: 'amount', label: 'Amount', render: (row) => money(row.amount, row.currency || currency) },
            { key: 'status', label: 'Status' },
          ]}
        />
      </LoadState>
    </PageFrame>
  );
}

export function ExpensesPage({ currency }) {
  const query = useApi('/finance/expenses?limit=100');
  return (
    <PageFrame kicker="Finance" title="Expenses" lede="Claims submitted for review.">
      <LoadState loading={query.loading} error={query.error}>
        <DataTable
          empty="No expenses."
          rows={query.data || []}
          columns={[
            { key: 'description', label: 'Description' },
            { key: 'category', label: 'Category' },
            { key: 'submitterName', label: 'Submitted by', render: (row) => row.submitterName || '—' },
            { key: 'amount', label: 'Amount', render: (row) => money(row.amount, currency) },
            { key: 'status', label: 'Status' },
            { key: 'createdAt', label: 'Date', render: (row) => when(row.createdAt) },
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
