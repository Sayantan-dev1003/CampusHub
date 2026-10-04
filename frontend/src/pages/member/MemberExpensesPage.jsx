import React, { useState, useEffect } from 'react';
import MemberLayout from './MemberLayout';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

export default function MemberExpensesPage() {
  const { addToast } = useApp();
  const [expenses, setExpenses] = useState([]);
  const [initiatives, setInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', amount: '', category: 'SUPPLIES', initiativeId: '' });
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);

  const fetchExpenses = async () => {
    try {
      const response = await api('/finance/expenses');
      setExpenses(response.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInitiatives = async () => {
    try {
      const response = await api('/initiatives');
      setInitiatives(response.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchInitiatives();
  }, []);

  const getStatusClass = (status) => {
    switch(status) {
      case 'REIMBURSED': return 'status-completed';
      case 'APPROVED': return 'status-progress';
      case 'REJECTED': return 'status-rejected';
      default: return 'status-pending';
    }
  };

  const submitExpense = async (e) => {
    e.preventDefault();
    setBusy(true);
    
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('amount', form.amount);
      formData.append('category', form.category);
      if (form.initiativeId) {
        formData.append('initiativeId', form.initiativeId);
      }
      if (file) {
        formData.append('receipt', file);
      }

      await api('/finance/expenses', {
        method: 'POST',
        body: formData,
      });

      addToast('Expense claim submitted', 'Pending review by the treasurer.', 'success');
      setShowForm(false);
      setForm({ title: '', description: '', amount: '', category: 'SUPPLIES', initiativeId: '' });
      setFile(null);
      fetchExpenses();
    } catch (err) {
      addToast('Failed to submit claim', err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <MemberLayout>
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1>Expenses & Reimbursements</h1>
          <p>Submit your out-of-pocket expenses and track their reimbursement status.</p>
        </header>

        <section className="dashboard-panel">
          <div className="panel-heading">
            <h2>My Expense Claims</h2>
            {!showForm && (
              <button className="btn-action" onClick={() => setShowForm(true)}>+ New Claim</button>
            )}
          </div>

          {showForm && (
            <form className="expense-form" onSubmit={submitExpense}>
              <h3>Submit New Expense</h3>
              
              <div className="form-group">
                <label>Expense Title</label>
                <input 
                  type="text" 
                  required 
                  value={form.title} 
                  onChange={(e) => setForm({...form, title: e.target.value})}
                  placeholder="e.g. Baking Supplies for Bake Sale" 
                />
              </div>

              <div className="form-group">
                <label>Description (What, Why, Where)</label>
                <input 
                  type="text" 
                  required 
                  value={form.description} 
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  placeholder="e.g. Purchased flour and sugar from local mart" 
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Amount (₹)</label>
                  <input 
                    type="number" 
                    required 
                    min="1" 
                    step="0.01" 
                    value={form.amount} 
                    onChange={(e) => setForm({...form, amount: e.target.value})}
                    placeholder="e.g. 850" 
                  />
                </div>
                
                <div className="form-group">
                  <label>Category</label>
                  <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
                    <option value="SUPPLIES">Supplies</option>
                    <option value="TRANSPORT">Transport</option>
                    <option value="PRINTING">Printing</option>
                    <option value="FOOD">Food</option>
                    <option value="EVENT_COST">Event Cost</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Related Initiative (Optional)</label>
                <select value={form.initiativeId} onChange={(e) => setForm({...form, initiativeId: e.target.value})}>
                  <option value="">None</option>
                  {initiatives.map(ini => (
                    <option key={ini.id} value={ini.id}>{ini.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Upload Receipt/Bill (Image or PDF)</label>
                <input 
                  type="file" 
                  accept="image/*,.pdf" 
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-action" disabled={busy}>
                  {busy ? 'Submitting...' : 'Submit Claim'}
                </button>
                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="tasks-table-container">
            {loading ? <p>Loading claims...</p> : expenses.length === 0 ? <p>No claims submitted.</p> : (
            <table className="tasks-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(expense => (
                  <tr key={expense.id}>
                    <td>{new Date(expense.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="task-name">{expense.title}</div>
                      <div className="task-desc">{expense.description}</div>
                      {expense.receiptUrl && <a href={expense.receiptUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#2d6a4f' }}>View Receipt</a>}
                      {expense.rejectionReason && <div style={{ fontSize: '0.8rem', color: '#991b1b', marginTop: 4 }}>Rejected: {expense.rejectionReason}</div>}
                      {expense.reimbursementMode && <div style={{ fontSize: '0.8rem', color: '#5e8070', marginTop: 4 }}>Paid via {expense.reimbursementMode} {expense.transactionRef && `(${expense.transactionRef})`}</div>}
                    </td>
                    <td><div className="project-badge">{expense.category.replace('_', ' ')}</div></td>
                    <td style={{ fontWeight: 600 }}>{expense.amount}</td>
                    <td><span className={`status-pill ${getStatusClass(expense.status)}`}>{expense.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        </section>
      </div>

      <style>{`
        .dashboard-content {
          padding: 32px;
          width: 100%;
          box-sizing: border-box;
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-header { margin-bottom: 32px; }
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

        .dashboard-panel {
          background: #fff;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 4px 12px rgba(20, 53, 40, 0.04);
          border: 1px solid rgba(45, 106, 79, 0.1);
        }

        .panel-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(45, 106, 79, 0.1);
        }
        .panel-heading h2 {
          font-family: 'Fraunces', Georgia, serif;
          font-size: 1.5rem;
          color: #1b4332;
          margin: 0;
        }

        .expense-form {
          background: #f4f8f5;
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 32px;
          border: 1px solid #d3e6da;
        }
        
        .expense-form h3 {
          margin: 0 0 16px 0;
          color: #1b4332;
          font-size: 1.1rem;
        }

        .form-group {
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 0.85rem;
          font-weight: 700;
          color: #1b4332;
        }

        .form-group input, .form-group select {
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid #d3e6da;
          font-family: inherit;
          font-size: 0.95rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .project-badge {
          background: #fbfefc;
          border: 1px solid #d3e6da;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 700;
          color: #2d6a4f;
          display: inline-block;
        }

        .tasks-table-container {
          overflow-x: auto;
        }
        .tasks-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .tasks-table th {
          padding: 12px 16px;
          background: #f4f8f5;
          color: #3b5a4a;
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          border-bottom: 2px solid #e2ece6;
        }
        .tasks-table td {
          padding: 16px;
          border-bottom: 1px solid #e2ece6;
          vertical-align: middle;
          color: #1b4332;
          font-size: 0.95rem;
        }
        
        .task-name { font-weight: 700; margin-bottom: 4px; }

        .status-pill {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          display: inline-block;
        }
        .status-completed { background: #eaf5ed; color: #2d6a4f; }
        .status-progress { background: #fff8e7; color: #b75e18; }
        .status-pending { background: #f4f8f5; color: #5e8070; }
        .status-rejected { background: #fde8e8; color: #991b1b; }

        .btn-action {
          background: #2d6a4f;
          color: #fff;
          border: none;
          padding: 10px 18px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.9rem;
        }
        .btn-action:disabled {
          background: #d3e6da;
          color: #8aa898;
          cursor: not-allowed;
        }

        .btn-ghost {
          background: transparent;
          color: #1b4332;
          border: 1px solid #d3e6da;
          padding: 10px 18px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.9rem;
        }
        
        @media (max-width: 640px) {
          .form-row { grid-template-columns: 1fr; gap: 0; }
        }
      `}</style>
    </MemberLayout>
  );
}
