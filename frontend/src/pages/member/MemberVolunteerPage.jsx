import React, { useState } from 'react';
import MemberLayout from './MemberLayout';

export default function MemberVolunteerPage() {
  const [tasks] = useState([
    {
      id: 1,
      name: 'Buy ingredients',
      description: 'Purchase flour, sugar, and chocolate chips for the bake sale.',
      deadline: 'Oct 05, 2026',
      priority: 'High',
      status: 'Completed'
    },
    {
      id: 2,
      name: 'Prepare cupcakes',
      description: 'Bake and frost 100 chocolate cupcakes.',
      deadline: 'Oct 06, 2026',
      priority: 'High',
      status: 'In Progress'
    },
    {
      id: 3,
      name: 'Manage counter',
      description: 'Run the cash register and hand out cupcakes during the event.',
      deadline: 'Oct 07, 2026',
      priority: 'Medium',
      status: 'Pending'
    },
    {
      id: 4,
      name: 'Post-event Cleanup',
      description: 'Clean the tables and return equipment to storage.',
      deadline: 'Oct 07, 2026',
      priority: 'Low',
      status: 'Pending'
    }
  ]);

  const getStatusClass = (status) => {
    switch(status) {
      case 'Completed': return 'status-completed';
      case 'In Progress': return 'status-progress';
      default: return 'status-pending';
    }
  };

  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'High': return 'pri-high';
      case 'Medium': return 'pri-med';
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
            <div className="project-badge">Fundraiser: Bake Sale</div>
          </div>

          <div className="tasks-table-container">
            <table className="tasks-table">
              <thead>
                <tr>
                  <th>Task Name</th>
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
                      <div className="task-name">{task.name}</div>
                      <div className="task-desc">{task.description}</div>
                    </td>
                    <td><span className={`priority-badge ${getPriorityClass(task.priority)}`}>{task.priority}</span></td>
                    <td>{task.deadline}</td>
                    <td><span className={`status-pill ${getStatusClass(task.status)}`}>{task.status}</span></td>
                    <td>
                      <button className="btn-action" disabled={task.status === 'Completed'}>
                        {task.status === 'Completed' ? 'Done' : 'Update'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
