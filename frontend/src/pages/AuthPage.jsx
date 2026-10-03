import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  Lock,
  Mail,
  GraduationCap,
  Sparkles,
  Phone,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound
} from 'lucide-react';
import { DEMO_USERS } from '../data/mockData';

export default function AuthPage({ initialMode = 'login' }) {
  const { currentRoute, navigate, login, registerUser, loginAsDemo, addToast } = useApp();

  const [activeTab, setActiveTab] = useState(
    currentRoute.page === 'register' ? 'register' : initialMode
  );

  useEffect(() => {
    if (currentRoute.page === 'register') {
      setActiveTab('register');
    } else if (currentRoute.page === 'login') {
      setActiveTab('login');
    }
  }, [currentRoute.page]);

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form States (Student Details + Account Creation)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [academicYear, setAcademicYear] = useState('Junior (3rd Year)');
  const [phone, setPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('MEMBER'); // 'MEMBER' ($25) or 'GUEST' ($0)

  // Handle Login
  const handleLoginSubmit = (e) => {
    e.preventDefault();

    if (!loginEmail.trim() || !loginPassword.trim()) {
      addToast('Input Required', 'Please enter your email and password', 'warning');
      return;
    }

    // Check if matches known demo or create a session
    let matchedRole = 'MEMBER';
    let userName = 'Student Member';

    if (loginEmail.toLowerCase().includes('admin')) {
      matchedRole = 'ADMIN';
      userName = 'Administrator';
    } else if (loginEmail.toLowerCase().includes('treasurer')) {
      matchedRole = 'TREASURER';
      userName = 'Treasurer David';
    } else if (loginEmail.toLowerCase().includes('alice')) {
      userName = 'Alice Johnson';
    }

    const loggedUser = {
      name: userName,
      email: loginEmail,
      studentId: 'STU-001',
      department: 'Computer Science',
      role: matchedRole,
      isMember: true,
      membershipType: 'Standard Active',
      expiryDate: 'Dec 31, 2026'
    };

    login(loggedUser);
    navigate('home');
  };

  // Handle Registration
  const handleRegisterSubmit = (e) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !registerEmail.trim() || !registerPassword.trim()) {
      addToast('Missing Details', 'Please complete all required student fields', 'warning');
      return;
    }

    if (registerPassword !== confirmPassword) {
      addToast('Password Mismatch', 'Passwords do not match. Please verify.', 'warning');
      return;
    }

    const studentRecord = {
      firstName,
      lastName,
      email: registerEmail,
      studentId: studentId.trim() || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
      department,
      year: academicYear,
      phone,
      membershipType: selectedPlan === 'MEMBER' ? 'Standard Active (₹299/yr)' : 'Free Visitor Account'
    };

    registerUser(studentRecord);
  };

  return (
    <div className="auth-page fade-in">
      <div className="container">
        <div className="auth-card-wrapper">
          <div className="auth-card glass-card">
            {/* Header Tabs */}
            <div className="auth-tabs">
              <button
                type="button"
                className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('login');
                  navigate('login');
                }}
              >
                <User size={18} />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('register');
                  navigate('register');
                }}
              >
                <Sparkles size={18} />
                <span>Join & Register</span>
              </button>
            </div>

            {/* TAB 1: LOGIN */}
            {activeTab === 'login' ? (
              <div className="login-tab-content fade-in">
                <div className="auth-header-text">
                  <h2>Welcome Back to CampusHub</h2>
                  <p>Log in with your university credentials or demo test account.</p>
                </div>

                {/* 1-Click Demo Accounts Strip */}
                <div className="demo-accounts-box">
                  <span className="demo-label">✨ Quick 1-Click Demo Credentials:</span>
                  <div className="demo-btns-grid">
                    <button
                      type="button"
                      className="demo-btn"
                      onClick={() => loginAsDemo('member')}
                    >
                      <strong>Alice Johnson</strong>
                      <span>Member (STU-001)</span>
                    </button>

                    <button
                      type="button"
                      className="demo-btn"
                      onClick={() => loginAsDemo('admin')}
                    >
                      <strong>Sarah Connor</strong>
                      <span>Administrator</span>
                    </button>

                    <button
                      type="button"
                      className="demo-btn"
                      onClick={() => loginAsDemo('treasurer')}
                    >
                      <strong>David Miller</strong>
                      <span>Treasurer</span>
                    </button>
                  </div>
                </div>

                <div className="or-divider">
                  <span>or enter student email</span>
                </div>

                <form onSubmit={handleLoginSubmit} className="auth-form">
                  <div className="form-group">
                    <label>Student / University Email</label>
                    <div className="input-with-icon">
                      <Mail size={17} className="input-icon" />
                      <input
                        type="email"
                        required
                        placeholder="alice@student.edu"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="label-with-link">
                      <label>Password</label>
                      <button
                        type="button"
                        className="inline-link"
                        onClick={() => addToast('Password Reset', 'Password recovery instructions sent to student email', 'info')}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="input-with-icon">
                      <Lock size={17} className="input-icon" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="pwd-toggle-btn"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-checkbox-row">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <span>Keep me signed in on this device</span>
                    </label>
                  </div>

                  <button type="submit" className="btn btn-primary btn-lg auth-submit-btn">
                    <span>Sign In to Account</span>
                    <ArrowRight size={16} />
                  </button>
                </form>

                <div className="auth-footer-prompt">
                  <span>Don't have an account yet?</span>
                  <button
                    className="inline-switch-btn"
                    onClick={() => {
                      setActiveTab('register');
                      navigate('register');
                    }}
                  >
                    Create a Student Account &rarr;
                  </button>
                </div>
              </div>
            ) : (
              /* TAB 2: REGISTER (Student Details + Account Creation) */
              <div className="register-tab-content fade-in">
                <div className="auth-header-text">
                  <h2>Create Your Student Account</h2>
                  <p>Register as a student to unlock member event rates, merchandise discounts, and campus perks.</p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="auth-form">
                  {/* Membership Plan Selection */}
                  <div className="plan-selection-container">
                    <label className="section-label">Select Membership Plan</label>
                    <div className="plan-options-grid">
                      <div
                        className={`plan-card ${selectedPlan === 'MEMBER' ? 'selected' : ''}`}
                        onClick={() => setSelectedPlan('MEMBER')}
                      >
                        <div className="plan-header">
                          <span className="plan-title">Annual Student Member</span>
                          <span className="badge badge-mint">Recommended</span>
                        </div>
                        <div className="plan-cost">
                          <strong>₹299.00</strong>
                          <span>/ academic year</span>
                        </div>
                        <ul className="plan-benefits">
                          <li><CheckCircle2 size={13} /> Up to 50% Off Fest & Event Tickets</li>
                          <li><CheckCircle2 size={13} /> Exclusive Member Merch Pricing</li>
                          <li><CheckCircle2 size={13} /> Digital QR Fast-Track Entry Pass</li>
                        </ul>
                      </div>

                      <div
                        className={`plan-card ${selectedPlan === 'GUEST' ? 'selected' : ''}`}
                        onClick={() => setSelectedPlan('GUEST')}
                      >
                        <div className="plan-header">
                          <span className="plan-title">Visitor / Guest</span>
                          <span className="badge badge-subtle">Free</span>
                        </div>
                        <div className="plan-cost">
                          <strong>₹0.00</strong>
                          <span>/ no dues</span>
                        </div>
                        <ul className="plan-benefits">
                          <li><CheckCircle2 size={13} /> Standard Public Event Pricing</li>
                          <li><CheckCircle2 size={13} /> Full Storefront Access</li>
                          <li><CheckCircle2 size={13} /> Upgrade to Member Anytime</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Student Personal Details */}
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Alice"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Last Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Johnson"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Student ID Number *</label>
                      <div className="input-with-icon">
                        <GraduationCap size={17} className="input-icon" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. STU-2026-881"
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Phone Number (Optional)</label>
                      <div className="input-with-icon">
                        <Phone size={17} className="input-icon" />
                        <input
                          type="tel"
                          placeholder="+1 (555) 019-2834"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Department & Year */}
                  <div className="form-row">
                    <div className="form-group">
                      <label>Department / Major *</label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                      >
                        <option value="Computer Science">Computer Science & Software</option>
                        <option value="Business & Finance">Business & Finance</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                        <option value="Biomedical Sciences">Biomedical Sciences</option>
                        <option value="Design & Architecture">Design & Architecture</option>
                        <option value="Political Science & Law">Political Science & Law</option>
                        <option value="Humanities & Arts">Humanities & Arts</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Academic Standing / Year *</label>
                      <select
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                      >
                        <option value="Freshman (1st Year)">Freshman (1st Year)</option>
                        <option value="Sophomore (2nd Year)">Sophomore (2nd Year)</option>
                        <option value="Junior (3rd Year)">Junior (3rd Year)</option>
                        <option value="Senior (4th Year)">Senior (4th Year)</option>
                        <option value="Graduate / Masters">Graduate / Masters</option>
                      </select>
                    </div>
                  </div>

                  {/* Email & Passwords */}
                  <div className="form-group">
                    <label>University Email *</label>
                    <div className="input-with-icon">
                      <Mail size={17} className="input-icon" />
                      <input
                        type="email"
                        required
                        placeholder="student@university.edu"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Create Password *</label>
                      <div className="input-with-icon">
                        <Lock size={17} className="input-icon" />
                        <input
                          type="password"
                          required
                          placeholder="Min 6 characters"
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Confirm Password *</label>
                      <div className="input-with-icon">
                        <Lock size={17} className="input-icon" />
                        <input
                          type="password"
                          required
                          placeholder="Re-enter password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary btn-lg auth-submit-btn">
                    <Sparkles size={18} />
                    <span>Create Student Account</span>
                  </button>

                  <div className="trust-footnote">
                    <ShieldCheck size={14} className="text-sage" />
                    <span>Your student information is encrypted and secured by Skyline Student Association.</span>
                  </div>
                </form>

                <div className="auth-footer-prompt">
                  <span>Already an active member?</span>
                  <button
                    className="inline-switch-btn"
                    onClick={() => {
                      setActiveTab('login');
                      navigate('login');
                    }}
                  >
                    Log In Here &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .auth-page {
          padding: 48px 0 80px;
          min-height: calc(100vh - 200px);
          display: flex;
          align-items: center;
        }

        .auth-card-wrapper {
          max-width: 640px;
          margin: 0 auto;
        }

        .auth-card {
          background: #ffffff;
          border-radius: var(--radius-lg);
          padding: 36px 40px;
          border: 1px solid var(--border-accent);
          box-shadow: var(--shadow-lg);
        }

        .auth-tabs {
          display: flex;
          background: var(--bg-subtle);
          padding: 4px;
          border-radius: var(--radius-sm);
          margin-bottom: 28px;
        }

        .auth-tab-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px;
          border-radius: var(--radius-xs);
          border: none;
          background: transparent;
          font-weight: 700;
          font-size: 0.92rem;
          color: var(--text-muted);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .auth-tab-btn.active {
          background: #ffffff;
          color: var(--color-primary-dark);
          box-shadow: var(--shadow-xs);
        }

        .auth-header-text {
          margin-bottom: 24px;
        }

        .auth-header-text h2 {
          font-size: 1.85rem;
          color: var(--color-primary-dark);
          margin-bottom: 6px;
        }

        .auth-header-text p {
          font-size: 0.92rem;
          color: var(--text-secondary);
        }

        /* Demo Accounts Box */
        .demo-accounts-box {
          background: #f1f8f3;
          border: 1px solid var(--border-accent);
          padding: 14px 16px;
          border-radius: var(--radius-sm);
          margin-bottom: 20px;
        }

        .demo-label {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--color-primary);
          display: block;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .demo-btns-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .demo-btn {
          background: #ffffff;
          border: 1px solid var(--border-light);
          padding: 8px 10px;
          border-radius: var(--radius-xs);
          text-align: left;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          transition: all var(--transition-fast);
        }

        .demo-btn:hover {
          border-color: var(--color-primary);
          background: #ebf6ee;
        }

        .demo-btn strong {
          font-size: 0.82rem;
          color: var(--color-primary-dark);
        }

        .demo-btn span {
          font-size: 0.72rem;
          color: var(--color-sage);
        }

        .or-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 20px 0;
          position: relative;
        }

        .or-divider::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 1px;
          background: var(--border-light);
        }

        .or-divider span {
          background: #ffffff;
          padding: 0 12px;
          position: relative;
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        /* Auth Form */
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label, .section-label {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .label-with-link {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .inline-link {
          background: transparent;
          border: none;
          color: var(--color-primary);
          font-size: 0.78rem;
          cursor: pointer;
          font-weight: 600;
        }

        .inline-link:hover {
          text-decoration: underline;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          color: var(--color-sage);
        }

        .input-with-icon input {
          width: 100%;
          padding: 10px 14px 10px 38px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
          font-size: 0.9rem;
          outline: none;
        }

        .form-group input, .form-group select {
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
          font-size: 0.9rem;
          outline: none;
        }

        .input-with-icon input:focus, .form-group input:focus, .form-group select:focus {
          border-color: var(--color-sage);
        }

        .pwd-toggle-btn {
          position: absolute;
          right: 12px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }

        .form-checkbox-row {
          display: flex;
          align-items: center;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.84rem;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .auth-submit-btn {
          width: 100%;
          margin-top: 8px;
        }

        .auth-footer-prompt {
          margin-top: 24px;
          text-align: center;
          font-size: 0.88rem;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .inline-switch-btn {
          background: transparent;
          border: none;
          color: var(--color-primary);
          font-weight: 700;
          cursor: pointer;
        }

        .inline-switch-btn:hover {
          text-decoration: underline;
        }

        /* Plan Selection */
        .plan-selection-container {
          margin-bottom: 8px;
        }

        .plan-options-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-top: 6px;
        }

        .plan-card {
          padding: 14px;
          border: 1.5px solid var(--border-light);
          border-radius: var(--radius-sm);
          cursor: pointer;
          background: #ffffff;
          transition: all var(--transition-fast);
        }

        .plan-card.selected {
          border-color: var(--color-primary);
          background: #f1f8f3;
        }

        .plan-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .plan-title {
          font-size: 0.86rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .badge-subtle {
          background: #eef3f0;
          color: var(--text-muted);
          font-size: 0.72rem;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .plan-cost {
          display: flex;
          align-items: baseline;
          gap: 4px;
          margin-bottom: 8px;
        }

        .plan-cost strong {
          font-size: 1.2rem;
          color: var(--color-primary);
        }

        .plan-cost span {
          font-size: 0.74rem;
          color: var(--text-muted);
        }

        .plan-benefits {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-size: 0.76rem;
          color: var(--text-secondary);
        }

        .plan-benefits li {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .trust-footnote {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 0.75rem;
          color: var(--text-muted);
          text-align: center;
          margin-top: 4px;
        }

        @media (max-width: 640px) {
          .auth-card {
            padding: 24px 20px;
          }
          .form-row, .plan-options-grid, .demo-btns-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
