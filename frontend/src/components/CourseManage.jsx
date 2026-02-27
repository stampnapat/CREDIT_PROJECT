import React, { useState, useEffect } from 'react';
import { API_BASE } from '../App';

export default function CourseManage() {
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ code: '', title: '', description: '', credits: 3 });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API_BASE}/courses`);
      if (res.ok) setCourses(await res.json());
    } catch (err) { console.error(err); }
  };

  const resetForm = () => {
    setForm({ code: '', title: '', description: '', credits: 3 });
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.code || !form.title) return alert('กรุณากรอกรหัสวิชาและชื่อวิชา');

    try {
      if (editingId) {
        // Update
        const res = await fetch(`${API_BASE}/courses/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, credits: Number(form.credits) })
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Update failed');
        }
        alert('แก้ไขวิชาสำเร็จ!');
      } else {
        // Create
        const res = await fetch(`${API_BASE}/courses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, credits: Number(form.credits) })
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Create failed');
        }
        alert('เพิ่มวิชาสำเร็จ!');
      }
      resetForm();
      fetchCourses();
    } catch (err) {
      alert(err.message || 'เกิดข้อผิดพลาด');
    }
  };

  const startEdit = (course) => {
    setEditingId(course.id);
    setForm({
      code: course.code,
      title: course.title,
      description: course.description || '',
      credits: course.credits
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('ต้องการลบวิชานี้ใช่หรือไม่?')) return;
    try {
      const res = await fetch(`${API_BASE}/courses/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      fetchCourses();
      alert('ลบวิชาเรียบร้อยแล้ว');
    } catch (err) {
      alert('ไม่สามารถลบวิชาได้');
    }
  };

  return (
    <section className="card">
      <h2>📚 จัดการรายวิชา</h2>
      <p className="sub">เพิ่ม / แก้ไข / ลบ วิชาในฐานข้อมูล MySQL ผ่าน Prisma ORM</p>

      <div className="grid-2">
        <div>
          <label>รหัสวิชา (Course Code)</label>
          <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="เช่น 01418112" />
        </div>
        <div>
          <label>ชื่อวิชา (Title)</label>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="เช่น Fundamental Programming Concepts" />
        </div>
        <div>
          <label>คำอธิบาย (Description)</label>
          <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="รายละเอียดวิชา (ถ้ามี)" />
        </div>
        <div>
          <label>หน่วยกิต (Credits)</label>
          <input type="number" value={form.credits} onChange={e => setForm({ ...form, credits: e.target.value })} min="1" max="12" />
        </div>
      </div>

      <div className="form-actions">
        <button className="btn" onClick={handleSubmit}>
          {editingId ? 'อัปเดตวิชา (Update)' : 'เพิ่มวิชา (Create)'}
        </button>
        {editingId && <button className="btn secondary" onClick={resetForm}>ยกเลิกการแก้ไข</button>}
      </div>

      <div className="table-wrap">
        <div className="table-header">
          <h3>📋 รายวิชาทั้งหมด</h3>
          <span className="count">{courses.length} วิชา</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th><th>รหัสวิชา</th><th>ชื่อวิชา</th><th>คำอธิบาย</th><th>หน่วยกิต</th><th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr><td colSpan="6">
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <p>ยังไม่มีวิชาในระบบ</p>
                </div>
              </td></tr>
            ) : (
              courses.map(c => (
                <tr key={c.id}>
                  <td><span className="tag">{c.id}</span></td>
                  <td><b>{c.code}</b></td>
                  <td>{c.title}</td>
                  <td className="mini">{c.description || '-'}</td>
                  <td><span className="pill">{c.credits} หน่วยกิต</span></td>
                  <td>
                    <div className="row-actions">
                      <button className="btn-sm" onClick={() => startEdit(c)}>✏️ แก้ไข</button>
                      <button className="btn-sm danger" onClick={() => handleDelete(c.id)}>🗑️ ลบ</button>
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
