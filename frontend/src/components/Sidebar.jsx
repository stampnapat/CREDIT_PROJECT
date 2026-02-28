import React from 'react';

export default function Sidebar({ studentId, version, currentView, setCurrentView, doLogout, userRole }) {
  const navItems = [
    { key: 'dashboard', icon: '📊', label: 'Dashboard', badge: 'สรุป' },
    { key: 'addCourse', icon: '📝', label: 'เพิ่มวิชาที่เรียน', badge: 'Mongo' },
    { key: 'remaining', icon: '📋', label: 'ดูวิชาที่เหลือ', badge: 'สถิติ' },
    { key: 'studyPlan', icon: '🎯', label: 'จัดการ Study Plan', badge: 'Mongo' },
  ];

  const mysqlItems = [
    { key: 'courseManage', icon: '📚', label: 'จัดการรายวิชา', badge: 'MySQL' },
    { key: 'enrollmentManage', icon: '✏️', label: 'จัดการลงทะเบียน', badge: 'MySQL' },
    { key: 'userManage', icon: '👤', label: 'จัดการผู้ใช้', badge: 'MySQL' },
  ];

  const initials = studentId ? studentId.substring(0, 2).toUpperCase() : '??';

  return (
    <aside className="sidebar">
      <div className="profile">
        <div className="avatar">{initials}</div>
        <div className="name">{studentId}</div>
        <div className="meta">หลักสูตร {version}</div>
      </div>

      <nav className="nav">
        <div className="nav-section">📌 ระบบหลัก</div>
        {navItems.map(item => (
          <button
            key={item.key}
            className={currentView === item.key ? 'active' : ''}
            onClick={() => setCurrentView(item.key)}
          >
            <span className="icon">{item.icon}</span>
            <span className="nav-label">
              {item.label}
              <small>{item.badge}</small>
            </span>
          </button>
        ))}

        <div className="nav-section">🗄️ ฐานข้อมูล MySQL</div>
        {userRole === 'ADMIN' ? mysqlItems.map(item => (
          <button
            key={item.key}
            className={currentView === item.key ? 'active' : ''}
            onClick={() => setCurrentView(item.key)}
          >
            <span className="icon">{item.icon}</span>
            <span className="nav-label">
              {item.label}
              <small>{item.badge}</small>
            </span>
          </button>
        )) : (
          <div style={{ padding: '8px 16px', fontSize: 12, color: '#999' }}>🔒 เฉพาะ Admin เท่านั้น</div>
        )}
      </nav>

      <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-light)' }}>
        <button className="btn danger" style={{ width: '100%', fontSize: '12px' }} onClick={doLogout}>
          🚪 ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}
