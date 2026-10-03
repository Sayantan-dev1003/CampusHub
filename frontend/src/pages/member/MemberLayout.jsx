import React from 'react';
import MemberSidebar from '../../components/MemberSidebar';

export default function MemberLayout({ children }) {
  return (
    <div className="member-layout">
      <MemberSidebar />
      <main className="member-main">
        {children}
      </main>

      <style>{`
        .member-layout {
          display: flex;
          flex: 1;
          width: 100%;
          min-height: 100vh;
          background: #eef5f0;
          font-family: 'Plus Jakarta Sans', var(--font-body);
        }

        .member-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
}
