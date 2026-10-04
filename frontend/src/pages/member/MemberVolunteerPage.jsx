import React, { useState, useEffect } from 'react';
import MemberLayout from './MemberLayout';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

export default function MemberVolunteerPage() {
  const { addToast } = useApp();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const response = await api('/tasks/my');
      setTasks(response.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const updateStatus = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'TODO' ? 'IN_PROGRESS' : 'DONE';
    try {
      await api(`/tasks/${taskId}`, { method: 'PATCH', body: { status: newStatus } });
      addToast('Status updated', newStatus, 'success');
      fetchTasks();
    } catch (err) {
      addToast('Error', err.message, 'error');
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'DONE': return 'status-completed';
      case 'IN_PROGRESS': return 'status-progress';
      default: return 'status-pending';
    }
  };

  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'HIGH': return 'pri-high';
      case 'MEDIUM': return 'pri-med';
      default: return 'pri-low';
    }
  };

  return (
    <MemberLayout>
      <div className="dashboard-content">
        <header className="dashboard-header">
          <h1>Volunteer Dashboard</h1>
          <p>Track your organization activities and responsibilities.</p>
        </header>

        <section className="dashboard-panel">
          <div className="panel-heading">
            <h2>My Tasks</h2>
          </div>

          <div className="tasks-table-container">
            {loading ? <p>Loading tasks...</p> : tasks.length === 0 ? <p>No tasks assigned.</p> : (
            <table className="tasks-table">
              <thead>
                <tr>
                  <th>Task Name</th>
                  <th>Initiative</th>
                  <th>Priority</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id}>
                    <td>
                      <div className="task-name">{task.title}</div>
                      <div className="task-desc">{task.description}</div>
                    </td>
                    <td><div className="project-badge">{task.initiativeName}</div></td>
                    <td><span className={`priority-badge ${getPriorityClass(task.priority)}`}>{task.priority}</span></td>
                    <td>{task.dueDate ? new Date(task.dueDate).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                    <td><span className={`status-pill ${getStatusClass(task.status)}`}>{task.status.replace('_', ' ')}</span></td>
                    <td>
                      <button 
                        className="btn-action" 
                        disabled={task.status === 'DONE' || task.status === 'CANCELLED'}
                        onClick={() => updateStatus(task.id, task.status)}
                      >
                        {task.status === 'DONE' ? 'Done' : (task.status === 'TODO' ? 'Start' : 'Complete')}
                      </button>
                    </td>
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
        .project-badge {
          background: #fbfefc;
          border: 1px solid #d3e6da;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 700;
          color: #2d6a4f;
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
        .task-desc { font-size: 0.85rem; color: #5e8070; max-width: 300px; }

        .priority-badge {
          font-size: 0.8rem;
          font-weight: 700;
        }
        .pri-high { color: #a63a3a; }
        .pri-med { color: #b75e18; }
        .pri-low { color: #2d6a4f; }

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

        .btn-action {
          background: #2d6a4f;
          color: #fff;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.85rem;
        }
        .btn-action:disabled {
          background: #d3e6da;
          color: #8aa898;
          cursor: not-allowed;
        }
      `}</style>
    </MemberLayout>
  );
}
