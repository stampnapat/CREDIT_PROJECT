import React, { useState, useEffect } from 'react';
import { API_BASE } from '../App';

export default function EnrollmentManage({ studentId }) {
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ userId: '', courseId: '' });

  useEffect(() => {
    fetchEnrollments();
    fetchCourses();
    fetchUsers();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const res = await fetch(`${API_BASE}/enrollments`);
      if (res.ok) setEnrollments(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API_BASE}/courses`);
      if (res.ok) setCourses(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/users`);
      if (res.ok) setUsers(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleEnroll = async () => {
    if (!form.userId || !form.courseId) return alert('กรุณาเลือก User และ Course');
    try {
      const res = await fetch(`${API_BASE}/enrollments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: Number(form.userId), courseId: Number(form.courseId) })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Enroll failed');
      }
      alert('ลงทะเบียนสำเร็จ!');
      setForm({ userId: '', courseId: '' });
      fetchEnrollments();
    } catch (err) {
      alert(err.message || 'เกิดข้อผิดพลาด');
    }
  };

  const handleUpdateStatus = async (id, currentStatus) => {
    const statuses = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'];
    const newStatus = prompt(`เลือกสถานะใหม่:\n${statuses.join(', ')}`, currentStatus);
    if (!newStatus || !statuses.includes(newStatus.toUpperCase())) return;
    try {
      const res = await fetch(`${API_BASE}/enrollments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus.toUpperCase() })
      });
      if (!res.ok) throw new Error();
      fetchEnrollments();
    } catch (err) {
      alert('ไม่สามารถอัปเดตได้');
    }
  };

  const handleUpdateGrade = async (id, currentGrade) => {
    const newGrade = prompt('กรอกเกรดใหม่:', currentGrade || '');
    if (!newGrade) return;
    try {
      const res = await fetch(`${API_BASE}/enrollments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade: newGrade.toUpperCase() })
      });
      if (!res.ok) throw new Error();
      fetchEnrollments();
    } catch (err) {
      alert('ไม่สามารถอัปเดตเกรดได้');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('ต้องการยกเลิกการลงทะเบียนนี้ใช่หรือไม่?')) return;
    try {
      const res = await fetch(`${API_BASE}/enrollments/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      fetchEnrollments();
      alert('ลบการลงทะเบียนเรียบร้อยแล้ว');
    } catch (err) {
      alert('ไม่สามารถลบได้');
    }
  };

  const statusLabel = (s) => {
    const map = { NOT_STARTED: 'ยังไม่เริ่ม', IN_PROGRESS: 'กำลังเรียน', COMPLETED: 'เรียนจบ' };
    return map[s] || s;
  };

  const statusClass = (s) => {
    if (s === 'COMPLETED') return 'pill';
    if (s === 'IN_PROGRESS') return 'pill warn';
    return 'pill warn';
  };

  return (
    <section className="card">
      <h2>จัดการการลงทะเบียน (MySQL — CRUD)</h2>
      <p className="sub">ลงทะเบียน / แก้ไขสถานะ / แก้เกรด / ลบ Enrollment ในฐานข้อมูล MySQL</p>

      <div className="grid-2">
        <div>
          <label>เลือก User</label>
          <select value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })}>
            <option value="">-- เลือก User --</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.id} - {u.fullName || u.email}</option>
            ))}
          </select>
        </div>
        <div>
          <label>เลือกวิชา</label>
          <select value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })}>
            <option value="">-- เลือกวิชา --</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-actions">
        <button className="btn" onClick={handleEnroll}>ลงทะเบียน (Create Enrollment)</button>
      </div>

      <div style={{ marginTop: '14px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '15px' }}>รายการลงทะเบียนทั้งหมด (MySQL)</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th><th>User</th><th>วิชา</th><th>สถานะ</th><th>เกรด</th><th>วันลงทะเบียน</th><th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center' }}>ยังไม่มีการลงทะเบียน</td></tr>
            ) : (
              enrollments.map(e => (
                <tr key={e.id}>
                  <td>{e.id}</td>
                  <td>
                    <b>{e.user?.fullName || e.user?.email || e.userId}</b>
                    <br /><span className="mini">ID: {e.userId}</span>
                  </td>
                  <td>
                    <b>{e.course?.code}</b>
                    <br /><span className="mini">{e.course?.title}</span>
                  </td>
                  <td><span className={statusClass(e.status)}>{statusLabel(e.status)}</span></td>
                  <td>{e.grade || '-'}</td>
                  <td className="mini">{new Date(e.enrolledAt).toLocaleDateString('th-TH')}</td>
                  <td>
                    <button onClick={() => handleUpdateStatus(e.id, e.status)}>สถานะ</button>
                    <button onClick={() => handleUpdateGrade(e.id, e.grade)}>เกรด</button>
                    <button onClick={() => handleDelete(e.id)}>ลบ</button>
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
