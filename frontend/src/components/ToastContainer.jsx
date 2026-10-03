import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let iconColor = '#2d6a4f';

        if (toast.type === 'warning') {
          Icon = AlertCircle;
          iconColor = '#b75e18';
        } else if (toast.type === 'info') {
          Icon = Info;
          iconColor = '#3273a0';
        }

        return (
          <div key={toast.id} className={`toast-card toast-${toast.type} fade-in`}>
            <div className="toast-icon-area" style={{ color: iconColor }}>
              <Icon size={20} />
            </div>
            <div className="toast-content">
              <span className="toast-title">{toast.title}</span>
              <p className="toast-desc">{toast.message}</p>
            </div>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              <X size={15} />
            </button>
          </div>
        );
      })}

      <style>{`
        .toast-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 380px;
          width: calc(100% - 48px);
          pointer-events: none;
        }

        .toast-card {
          pointer-events: auto;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          background: #ffffff;
          border-radius: var(--radius-sm);
          box-shadow: 0 10px 30px rgba(27, 67, 50, 0.16);
          border: 1px solid var(--border-light);
        }

        .toast-success {
          border-left: 4px solid var(--color-primary);
        }

        .toast-warning {
          border-left: 4px solid #b75e18;
        }

        .toast-info {
          border-left: 4px solid #3273a0;
        }

        .toast-icon-area {
          margin-top: 1px;
        }

        .toast-content {
          flex: 1;
        }

        .toast-title {
          font-weight: 700;
          font-size: 0.88rem;
          color: var(--text-primary);
          display: block;
        }

        .toast-desc {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-top: 2px;
          line-height: 1.35;
        }

        .toast-close {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 2px;
        }

        .toast-close:hover {
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}
