import React from 'react';

export default function Sidebar({ studentId, version, currentView, setCurrentView, doLogout }) {
  return (
    <aside className="sidebar">
      <div className="profile">
        <div className="name">นิสิต: <span>{studentId}</span></div>
        <div className="meta">หลักสูตร <span>{version}</span></div>
      </div>

      <div className="nav">
        <button className={currentView === 'dashboard' ? 'active' : ''} onClick={() => setCurrentView('dashboard')}>
          Dashboard <small>สรุปหน่วยกิต</small>
        </button>
        <button className={currentView === 'addCourse' ? 'active' : ''} onClick={() => setCurrentView('addCourse')}>
          เพิ่มวิชาที่เรียน <small>Completed</small>
        </button>
        <button className={currentView === 'remaining' ? 'active' : ''} onClick={() => setCurrentView('remaining')}>
          ดูวิชาที่เหลือ <small>Remaining</small>
        </button>
        <button className={currentView === 'studyPlan' ? 'active' : ''} onClick={() => setCurrentView('studyPlan')}>
          จัดการ Study Plan <small>MongoDB CRUD</small>
        </button>

        <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0', paddingTop: '4px' }}>
          <div className="mini" style={{ padding: '0 10px', marginBottom: '4px', fontWeight: 700, color: 'var(--muted)' }}>MySQL CRUD</div>
        </div>
        <button className={currentView === 'courseManage' ? 'active' : ''} onClick={() => setCurrentView('courseManage')}>
          จัดการรายวิชา <small>MySQL CRUD</small>
        </button>
        <button className={currentView === 'enrollmentManage' ? 'active' : ''} onClick={() => setCurrentView('enrollmentManage')}>
          จัดการลงทะเบียน <small>MySQL CRUD</small>
        </button>
        <button className={currentView === 'userManage' ? 'active' : ''} onClick={() => setCurrentView('userManage')}>
          จัดการผู้ใช้ <small>MySQL CRUD</small>
        </button>
      </div>

      <div style={{ marginTop: '12px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button className="btn danger" onClick={doLogout}>ออกจากระบบ</button>
      </div>
    </aside>
  );
}
