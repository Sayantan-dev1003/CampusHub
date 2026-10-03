import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';

const ROLES = [
  { value: 'MEMBER', label: 'Member', note: 'Buy tickets, join events, and shop.' },
  { value: 'ADMIN', label: 'Admin', note: 'Run events, inventory, and members.' },
  { value: 'TREASURER', label: 'Treasurer', note: 'Review money, expenses, and reimbursements.' },
];

const emptySignup = {
  name: '',
  email: '',
  phone: '',
  studentId: '',
  year: '',
  branch: '',
  role: 'MEMBER',
  isVolunteer: false,
  password: '',
  confirmPassword: '',
};

export default function AuthPage({ initialMode = 'login' }) {
  const { currentRoute, navigate, signIn, signUp, addToast } = useApp();
  const mode = currentRoute.page === 'register' || initialMode === 'register' ? 'register' : 'login';
  
  const hash = window.location.hash;
  let urlPlan = '';
  if (hash.includes('?')) {
    const searchParams = new URLSearchParams(hash.split('?')[1]);
    urlPlan = searchParams.get('plan') || '';
  }

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [form, setForm] = useState(emptySignup);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
  }, [mode]);

  const switchMode = (next) => {
    setError('');
    navigate(next);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signIn({ email: email.trim(), password, remember: true });
    } catch (err) {
      setError(err.message || 'Could not sign in');
      addToast('Sign in failed', err.message, 'warning');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await signUp({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
        studentId: form.studentId.trim() || undefined,
        year: form.year.trim() || undefined,
        branch: form.branch.trim() || undefined,
        role: form.role,
        isVolunteer: form.role === 'MEMBER' ? form.isVolunteer : false,
        planName: urlPlan || undefined,
      });
    } catch (err) {
      setError(err.message || 'Could not create the account');
      addToast('Sign up failed', err.message, 'warning');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedRole = ROLES.find((role) => role.value === form.role) || ROLES[0];

  return (
    <div className="gate">
      <section className="gate-panel" aria-hidden="true">
        <button type="button" className="gate-brand" onClick={() => navigate('home')}>
          <span className="gate-mark">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              <path d="m9 10 2 2 4-4" />
            </svg>
          </span>
          <span className="gate-brand-text">
            <span className="gate-brand-name">CampusHub</span>
            <span className="gate-brand-sub">Skyline Association</span>
          </span>
        </button>
        <div className="gate-copy">
          <p className="gate-kicker">Event desk</p>
          <h1>Tickets, check-in, and the night itself.</h1>
          <p>Sign in to manage seats, passes, and the people running the event.</p>
        </div>
        <ul className="gate-points">
          <li>Published events and seat counts</li>
          <li>QR tickets at the door</li>
          <li>Merchandise and volunteer tasks</li>
        </ul>
      </section>

      <section className="gate-form">
        <div className="gate-form-inner">
          <button type="button" className="gate-back" onClick={() => navigate('home')}>
            Back to events
          </button>

          {mode === 'login' ? (
            <form onSubmit={handleLogin}>
              <h2>Sign in</h2>
              <p className="gate-lead">Use the email and password for your CampusHub account.</p>

              <div className="gate-field">
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Enter email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              <div className="gate-field">
                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>

              {error && <p className="gate-error">{error}</p>}

              <button className="gate-submit" type="submit" disabled={submitting}>
                {submitting ? 'Signing in…' : 'Sign in'}
              </button>

              <p className="gate-switch">
                New here?{' '}
                <button type="button" onClick={() => switchMode('register')}>
                  Create an account
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignup}>
              <h2>Create an account</h2>
              <p className="gate-lead">Choose a role. It is saved on your account and controls what you can open.</p>

              <div className="gate-field">
                <label htmlFor="signup-role">Role</label>
                <select
                  id="signup-role"
                  value={form.role}
                  onChange={(event) => setForm({ ...form, role: event.target.value })}
                >
                  {ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <p className="gate-hint">{selectedRole.note}</p>
              </div>

              <div className="gate-field">
                <label htmlFor="signup-name">Full name</label>
                <input
                  id="signup-name"
                  type="text"
                  required
                  minLength={2}
                  autoComplete="name"
                  placeholder="Enter full name"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                />
              </div>

              <div className="gate-field">
                <label htmlFor="signup-email">Email</label>
                <input
                  id="signup-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="Enter email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                />
              </div>

              <div className="gate-row">
                <div className="gate-field">
                  <label htmlFor="signup-phone">Phone</label>
                  <input
                    id="signup-phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="Enter phone number"
                    value={form.phone}
                    onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  />
                </div>
                <div className="gate-field">
                  <label htmlFor="signup-student">Student ID</label>
                  <input
                    id="signup-student"
                    type="text"
                    autoComplete="off"
                    placeholder="Enter student ID"
                    value={form.studentId}
                    onChange={(event) => setForm({ ...form, studentId: event.target.value })}
                  />
                </div>
              </div>

              <div className="gate-row">
                <div className="gate-field">
                  <label htmlFor="signup-year">Year</label>
                  <input
                    id="signup-year"
                    type="text"
                    autoComplete="off"
                    placeholder="Enter year"
                    value={form.year}
                    onChange={(event) => setForm({ ...form, year: event.target.value })}
                  />
                </div>
                <div className="gate-field">
                  <label htmlFor="signup-branch">Branch</label>
                  <input
                    id="signup-branch"
                    type="text"
                    autoComplete="off"
                    placeholder="Enter branch"
                    value={form.branch}
                    onChange={(event) => setForm({ ...form, branch: event.target.value })}
                  />
                </div>
              </div>



              {form.role === 'MEMBER' && (
                <label className="gate-check">
                  <input
                    type="checkbox"
                    checked={form.isVolunteer}
                    onChange={(event) => setForm({ ...form, isVolunteer: event.target.checked })}
                  />
                  I will take volunteer tasks
                </label>
              )}

              <div className="gate-row">
                <div className="gate-field">
                  <label htmlFor="signup-password">Password</label>
                  <input
                    id="signup-password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="Enter password"
                    value={form.password}
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                  />
                </div>
                <div className="gate-field">
                  <label htmlFor="signup-confirm">Confirm password</label>
                  <input
                    id="signup-confirm"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    value={form.confirmPassword}
                    onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
                  />
                </div>
              </div>

              {error && <p className="gate-error">{error}</p>}

              <button className="gate-submit" type="submit" disabled={submitting}>
                {submitting ? 'Creating account…' : 'Create account'}
              </button>

              <p className="gate-switch">
                Already have an account?{' '}
                <button type="button" onClick={() => switchMode('login')}>
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </section>

      <style>{`
        .gate {
          display: grid;
          grid-template-columns: minmax(320px, 0.9fr) 1.1fr;
          grid-template-rows: minmax(0, 1fr);
          width: 100%;
          height: 100%;
          min-height: 100vh;
          min-height: 100dvh;
          background: #eef5f0;
          font-family: 'Plus Jakarta Sans', var(--font-body);
          overflow: hidden;
        }

        .gate-panel {
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(circle at 18% 12%, rgba(116, 198, 157, 0.28), transparent 34%),
            linear-gradient(165deg, #245c45 0%, #1b4332 48%, #143528 100%);
          color: #f4faf6;
          padding: 28px 44px 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 36px;
        }

        .gate-panel::after {
          content: '';
          position: absolute;
          right: -80px;
          bottom: -90px;
          width: 280px;
          height: 280px;
          border: 1px solid rgba(183, 228, 199, 0.22);
          border-radius: 50%;
          pointer-events: none;
        }

        .gate-brand {
          position: relative;
          z-index: 1;
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          gap: 14px;
          background: transparent;
          border: 0;
          color: #fff;
          cursor: pointer;
          text-align: left;
        }

        .gate-mark {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          background: #d8f3dc;
          color: #1b4332;
          flex: 0 0 auto;
        }

        .gate-brand-text {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .gate-brand-name {
          font-family: 'Outfit', var(--font-heading);
          font-size: 1.85rem;
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1;
          color: #fff;
        }

        .gate-brand-sub {
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #b7e4c7;
        }

        .gate-copy {
          position: relative;
          z-index: 1;
        }

        .gate-kicker {
          text-transform: uppercase;
          letter-spacing: 0.16em;
          font-size: 0.72rem;
          font-weight: 600;
          color: #b7e4c7;
          margin-bottom: 14px;
        }

        .gate-panel h1,
        .gate-panel p,
        .gate-panel li {
          color: #f7fbf8;
        }

        .gate-copy h1 {
          font-family: 'Fraunces', Georgia, serif;
          font-size: clamp(2.1rem, 3.4vw, 3rem);
          font-weight: 560;
          line-height: 1.02;
          letter-spacing: -0.03em;
          max-width: 9.5ch;
          margin-bottom: 16px;
          color: #ffffff;
        }

        .gate-copy p:last-child {
          max-width: 32ch;
          color: #d5eee2;
          font-size: 1.02rem;
          line-height: 1.55;
        }

        .gate-points {
          position: relative;
          z-index: 1;
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
          font-size: 0.94rem;
          color: #e7f6ee;
        }

        .gate-points li {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .gate-points li::before {
          content: '';
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #95d5b2;
          flex: 0 0 auto;
        }

        .gate-form {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 0;
          height: 100%;
          padding: 20px 40px;
          overflow: auto;
        }

        .gate-form-inner {
          width: min(480px, 100%);
          background: transparent;
          border: 0;
          box-shadow: none;
        }

        .gate-back {
          background: transparent;
          border: 0;
          padding: 0;
          margin-bottom: 10px;
          color: #5e8070;
          font-size: 0.84rem;
          font-weight: 600;
          cursor: pointer;
        }

        .gate-back:hover { color: #1b4332; }

        .gate-form h2 {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 1.85rem;
          font-weight: 560;
          letter-spacing: -0.03em;
          color: #1b4332;
          margin-bottom: 6px;
        }

        .gate-lead {
          color: #3b5a4a;
          font-size: 0.92rem;
          line-height: 1.5;
          margin-bottom: 12px;
        }

        .gate-form form {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .gate-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0;
        }

        .gate-field label {
          font-size: 0.78rem;
          font-weight: 650;
          letter-spacing: 0.01em;
          color: #1b4332;
        }

        .gate-field input,
        .gate-field select {
          width: 100%;
          height: 42px;
          border: 1px solid #d3e6da;
          border-radius: 10px;
          padding: 0 14px;
          background: #fbfefc;
          color: #132a1e;
          font: inherit;
          font-size: 0.95rem;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }

        .gate-field input::placeholder {
          color: #8aa898;
        }

        .gate-field select {
          appearance: none;
          background-image: linear-gradient(45deg, transparent 50%, #2d6a4f 50%), linear-gradient(135deg, #2d6a4f 50%, transparent 50%);
          background-position: calc(100% - 18px) 18px, calc(100% - 12px) 18px;
          background-size: 6px 6px, 6px 6px;
          background-repeat: no-repeat;
          padding-right: 36px;
          cursor: pointer;
        }

        .gate-field input:focus,
        .gate-field select:focus {
          outline: none;
          border-color: #52b788;
          background-color: #fff;
          box-shadow: 0 0 0 3px rgba(82, 183, 136, 0.18);
        }

        .gate-hint {
          margin: 0;
          color: #5e8070;
          font-size: 0.78rem;
        }

        .gate-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .gate-check {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.88rem;
          font-weight: 500;
          color: #3b5a4a;
        }

        .gate-check input {
          width: 16px;
          height: 16px;
          accent-color: #2d6a4f;
        }

        .gate-error {
          color: #a63a3a;
          font-size: 0.84rem;
          margin: 0;
        }

        .gate-submit {
          height: 44px;
          border: 0;
          border-radius: 10px;
          background: #2d6a4f;
          color: #fff;
          font: inherit;
          font-size: 0.98rem;
          font-weight: 700;
          cursor: pointer;
        }

        .gate-submit:hover { background: #22543d; }
        .gate-submit:disabled { opacity: 0.7; cursor: wait; }

        .gate-switch {
          margin: 2px 0 0;
          text-align: center;
          font-size: 0.88rem;
          color: #3b5a4a;
        }

        .gate-switch button {
          background: none;
          border: 0;
          padding: 0;
          color: #1b4332;
          font: inherit;
          font-weight: 700;
          text-decoration: underline;
          text-underline-offset: 3px;
          cursor: pointer;
        }

        @media (max-width: 860px) {
          .gate { grid-template-columns: 1fr; grid-template-rows: auto; height: auto; min-height: 100vh; overflow: visible; }
          .gate-panel { min-height: 0; padding: 24px 22px; }
          .gate-copy h1 { max-width: none; font-size: 2.1rem; }
          .gate-points { display: none; }
          .gate-form { height: auto; padding: 20px 16px 28px; overflow: visible; }
          .gate-brand-name { font-size: 1.55rem; }
        }

        @media (max-width: 560px) {
          .gate-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
