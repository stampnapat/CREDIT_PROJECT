import React, { useState, useEffect } from 'react';
import { API_BASE } from '../App';

export default function UserManage() {
  const [users, setUsers] = useState([]);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/users`);
      if (res.ok) setUsers(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleUpdateName = async (id, currentName) => {
    const newName = prompt('กรอกชื่อใหม่:', currentName || '');
    if (newName === null) return;
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: newName })
      });
      if (!res.ok) throw new Error();
      fetchUsers();
      alert('แก้ไขชื่อสำเร็จ');
    } catch (err) {
      alert('ไม่สามารถแก้ไขได้');
    }
  };

  const handleUpdateRole = async (id, currentRole) => {
    const roles = ['STUDENT', 'INSTRUCTOR', 'ADMIN'];
    const newRole = prompt(`เลือก Role ใหม่:\n${roles.join(', ')}`, currentRole);
    if (!newRole || !roles.includes(newRole.toUpperCase())) return;
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole.toUpperCase() })
      });
      if (!res.ok) throw new Error();
      fetchUsers();
      alert('แก้ไข Role สำเร็จ');
    } catch (err) {
      alert('ไม่สามารถแก้ไข Role ได้');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('ต้องการลบ User นี้ใช่หรือไม่?')) return;
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      fetchUsers();
      alert('ลบ User เรียบร้อยแล้ว');
    } catch (err) {
      alert('ไม่สามารถลบได้');
    }
  };

  const roleClass = (role) => {
    if (role === 'ADMIN') return 'pill';
    if (role === 'INSTRUCTOR') return 'pill warn';
    return 'pill';
  };

  return (
    <section className="card">
      <h2>👤 จัดการผู้ใช้งาน</h2>
      <p className="sub">ดู / แก้ไข / ลบ ข้อมูลผู้ใช้ในฐานข้อมูล MySQL ผ่าน Prisma ORM</p>

      <div className="table-wrap">
        <div className="table-header">
          <h3>📋 รายชื่อผู้ใช้ทั้งหมด</h3>
          <span className="count">{users.length} คน</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Email</th><th>ชื่อ</th><th>Role</th><th>วันสมัคร</th><th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan="6">
                <div className="empty-state">
                  <div className="empty-icon">👥</div>
                  <p>ไม่มีผู้ใช้ในระบบ</p>
                </div>
              </td></tr>
            ) : (
              users.map(u => (
                <tr key={u.id}>
                  <td><span className="tag">{u.id}</span></td>
                  <td>{u.email}</td>
                  <td><b>{u.fullName || '-'}</b></td>
                  <td><span className={roleClass(u.role)}>{u.role}</span></td>
                  <td className="mini">{new Date(u.createdAt).toLocaleDateString('th-TH')}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn-sm" onClick={() => handleUpdateName(u.id, u.fullName)}>✏️ ชื่อ</button>
                      <button className="btn-sm" onClick={() => handleUpdateRole(u.id, u.role)}>🔑 Role</button>
                      <button className="btn-sm danger" onClick={() => handleDelete(u.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
