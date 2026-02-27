import React, { useState, useEffect } from 'react';
import { API_BASE } from '../App';

export default function AddCourse({ studentId, refreshAll }) {
  const [coursesMaster, setCoursesMaster] = useState([]);
  const [completedList, setCompletedList] = useState([]);
  
  const MAJOR_OPTIONS = ['Major'];
  const GENED_OPTIONS = [
    'Wellness',
    'Entrepreneurship',
    'Language and Communication',
    'Thai Citizen and Global Citizen',
    'Aesthetics',
  ];

  const [form, setForm] = useState({
    courseId: '', courseName: '', category: 'Major', credits: '', grade: 'A', term: ''
  });

  useEffect(() => {
    fetchMasterCourses();
    fetchCompleted();
  }, [studentId]);

  const fetchMasterCourses = async () => {
    try {
      const res = await fetch(`${API_BASE}/courses`);
      if(!res.ok) throw new Error();
      setCoursesMaster(await res.json());
    } catch (err) {
      setCoursesMaster([
        { code: "01418112", title: "Programming I", credits: 3 },
        { code: "01418113", title: "Programming II", credits: 3 },
        { code: "01418211", title: "Software Engineering", credits: 3 },
        { code: "01355112", title: "English I", credits: 3 }
      ]);
    }
  };

  const fetchCompleted = async () => {
    try {
      const res = await fetch(`${API_BASE}/completed-courses/by-student/${studentId}`);
      if (res.ok) setCompletedList(await res.json());
    } catch (err) { console.error(err); }
  };

  const autoFillCourseDetails = (e) => {
    const val = e.target.value;
    const c = coursesMaster.find(x => x.code === val);
    if(c) {
      setForm({ ...form, courseId: c.code, courseName: c.title, credits: c.credits, category: 'Major' });
    }
  };

  const addCompleted = async () => {
    if(!form.courseId || !form.courseName || !form.term) return alert("กรุณากรอกข้อมูลให้ครบถ้วน");

    const payload = { ...form, studentId, credits: Number(form.credits) };

    try {
      const res = await fetch(`${API_BASE}/completed-courses`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });
      if(!res.ok) throw new Error("ข้อมูลไม่ตรง Schema");

      setForm({ courseId: '', courseName: '', category: 'Major', credits: '', grade: 'A', term: '' });
      fetchCompleted();
      refreshAll();
      alert("บันทึกวิชาเรียบร้อยแล้ว");
    } catch (err) { alert("ไม่สามารถบันทึกข้อมูลได้"); }
  };

  const updateGrade = async (id, oldGrade) => {
    const newGrade = prompt(`กรุณากรอกเกรดใหม่:`, oldGrade);
    if(!newGrade) return;
    try {
      await fetch(`${API_BASE}/completed-courses/${id}/grade`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ grade: newGrade.toUpperCase() })
      });
      fetchCompleted();
      refreshAll();
    } catch (err) { alert("ไม่สามารถแก้ไขเกรดได้"); }
  };

  const softDeleteCourse = async (id) => {
    if(!window.confirm("ต้องการลบวิชานี้ใช่ไหม?")) return;
    try {
      await fetch(`${API_BASE}/completed-courses/${id}`, { method: "DELETE" });
      fetchCompleted();
      refreshAll();
    } catch (err) { console.error(err); }
  };

  return (
    <section className="card">
      <h2>📝 เพิ่มวิชาที่เรียนแล้ว</h2>
      <p className="sub">บันทึกวิชาที่เรียนจบแล้วลงฐานข้อมูล MongoDB</p>

      <div className="grid-2">
        <div style={{ gridColumn: '1 / -1' }}>
          <label>เลือกวิชา (จากข้อมูล Master)</label>
          <select onChange={autoFillCourseDetails}>
            <option value="">-- โปรดเลือกวิชา --</option>
            {coursesMaster.map(c => <option key={c.code} value={c.code}>{c.code} - {c.title}</option>)}
          </select>
        </div>
        <div>
          <label>รหัสวิชา</label>
          <input value={form.courseId} onChange={e => setForm({...form, courseId: e.target.value})} placeholder="เช่น 01418112" />
        </div>
        <div>
          <label>ชื่อวิชา</label>
          <input value={form.courseName} onChange={e => setForm({...form, courseName: e.target.value})} placeholder="เช่น Programming I" />
        </div>
        <div>
          <label>หมวดหมู่ (อ้างอิงตาม Study Plan)</label>
          <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
            <optgroup label="🎓 วิชาเอก">
              {MAJOR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </optgroup>
            <optgroup label="📚 หมวดศึกษาทั่วไป (GenEd)">
              {GENED_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </optgroup>
          </select>
        </div>
        <div>
          <label>หน่วยกิต</label>
          <input type="number" value={form.credits} onChange={e => setForm({...form, credits: e.target.value})} placeholder="เช่น 3" />
        </div>
        <div>
          <label>เกรดที่ได้</label>
          <select value={form.grade} onChange={e => setForm({...form, grade: e.target.value})}>
            <option>A</option><option>B+</option><option>B</option><option>C+</option><option>C</option><option>D+</option><option>D</option><option>F</option>
          </select>
        </div>
        <div>
          <label>ปีการศึกษา/เทอม</label>
          <input value={form.term} onChange={e => setForm({...form, term: e.target.value})} placeholder="1/2026" />
        </div>
      </div>

      <div className="form-actions">
        <button className="btn" onClick={addCompleted}>บันทึกรายวิชา</button>
      </div>

      <div className="table-wrap">
        <div className="table-header">
          <h3>✅ รายการวิชาที่เรียนแล้ว</h3>
          <span className="count">{completedList.length} วิชา</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>วิชา</th><th>หมวด</th><th>หน่วยกิต</th><th>เกรด</th><th>เทอม</th><th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {completedList.length === 0 ? (
              <tr><td colSpan="6">
                <div className="empty-state">
                  <div className="empty-icon">📚</div>
                  <p>ยังไม่มีวิชาที่บันทึก</p>
                </div>
              </td></tr>
            ) : (
              completedList.map(c => (
                <tr key={c._id}>
                  <td><b>{c.courseId}</b><br/><span className="mini">{c.courseName}</span></td>
                  <td><span className="tag">{c.category === 'Major' ? '🎓' : '📚'} {c.category}</span></td><td>{c.credits}</td><td>{c.grade}</td><td>{c.term}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn-sm" onClick={() => updateGrade(c._id, c.grade)}>✏️ เกรด</button>
                      <button className="btn-sm danger" onClick={() => softDeleteCourse(c._id)}>🗑️ ลบ</button>
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
