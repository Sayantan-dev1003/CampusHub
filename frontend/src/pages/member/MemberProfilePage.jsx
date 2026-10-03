import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import MemberLayout from './MemberLayout';

export default function MemberProfilePage() {
  const { user, addToast } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    studentId: '',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        studentId: user.studentId || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const saveProfile = (e) => {
    e.preventDefault();
    // Mock save logic
    addToast('Profile Updated', 'Your personal information has been saved successfully.', 'success');
  };

  const savePassword = (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      addToast('Error', 'New passwords do not match.', 'warning');
      return;
    }
    // Mock save logic
    setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    addToast('Password Changed', 'Your password has been updated successfully.', 'success');
  };

  return (
    <MemberLayout>
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1>My Profile</h1>
          <p>Manage your personal information and account settings.</p>
        </header>

        <div className="profile-grid">
          {/* Left Column: Photo & Brief Info */}
          <div className="profile-sidebar">
            <section className="dashboard-panel text-center">
              <div className="profile-photo-container">
                <div className="profile-avatar-large">
                  {formData.name ? formData.name.charAt(0).toUpperCase() : 'M'}
                </div>
              </div>
              <h3 className="profile-name-display">{formData.name || 'Member User'}</h3>
              <p className="profile-role-display">{user?.isMember ? 'Active Member' : 'Member'}</p>
            </section>
          </div>

          {/* Right Column: Forms */}
          <div className="profile-main">
            <section className="dashboard-panel">
              <h2>Personal Information</h2>
              <form onSubmit={saveProfile} className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleProfileChange}
                      placeholder="(123) 456-7890"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="studentId">Student ID</label>
                    <input
                      type="text"
                      id="studentId"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleProfileChange}
                      placeholder="e.g. 800123456"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary">Save Changes</button>
                </div>
              </form>
            </section>

            <section className="dashboard-panel mt-4">
              <h2>Change Password</h2>
              <form onSubmit={savePassword} className="profile-form">
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwords.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwords.newPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwords.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-outline-green">Update Password</button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-content {
          padding: 32px;
          width: 100%;
          box-sizing: border-box;
        }

        .dashboard-header {
          margin-bottom: 32px;
        }
        .dashboard-header h1 {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 2.2rem;
          color: #1b4332;
          margin-bottom: 8px;
        }
        .dashboard-header p {
          color: #5e8070;
          font-size: 1.05rem;
        }

        .profile-grid {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 900px) {
          .profile-grid { grid-template-columns: 1fr; }
        }

        .dashboard-panel {
          background: #fff;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(20, 53, 40, 0.04);
          border: 1px solid rgba(45, 106, 79, 0.1);
        }

        .dashboard-panel h2 {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 1.4rem;
          color: #1b4332;
          margin-bottom: 24px;
          border-bottom: 1px solid rgba(45, 106, 79, 0.1);
          padding-bottom: 12px;
        }

        .text-center { text-align: center; }
        .mt-4 { margin-top: 24px; }

        /* Avatar Section */
        .profile-photo-container {
          position: relative;
          width: 120px;
          height: 120px;
          margin: 0 auto 20px;
        }

        .profile-avatar-large {
          width: 100%;
          height: 100%;
          background: #74c69d;
          color: #1b4332;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          font-weight: 700;
          box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.3);
        }

        .profile-name-display {
          font-size: 1.3rem;
          color: #1b4332;
          margin-bottom: 4px;
        }
        
        .profile-role-display {
          font-size: 0.9rem;
          color: #5e8070;
          font-weight: 500;
        }

        /* Forms */
        .profile-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 600px) {
          .form-row { grid-template-columns: 1fr; }
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 0.85rem;
          font-weight: 650;
          color: #3b5a4a;
        }

        .form-group input {
          padding: 12px 16px;
          border: 1px solid #d3e6da;
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.95rem;
          color: #1b4332;
          background: #fbfefc;
          transition: all 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #52b788;
          box-shadow: 0 0 0 3px rgba(82, 183, 136, 0.15);
          background: #fff;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 10px;
        }

        .btn-primary {
          background: #2d6a4f;
          color: #fff;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-primary:hover { background: #1b4332; }

        .btn-outline-green {
          background: transparent;
          color: #2d6a4f;
          border: 2px solid #2d6a4f;
          padding: 10px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-outline-green:hover {
          background: #2d6a4f;
          color: #fff;
        }
      `}</style>
    </MemberLayout>
  );
}
