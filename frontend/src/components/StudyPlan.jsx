import React, { useState, useEffect } from 'react';
import { API_BASE } from '../App';

export default function StudyPlan({ studentId, planData, refreshAll }) {
  const [form, setForm] = useState({
    program: 'Computer Science', version: '2026', core: 30, major: 45, free: 6
  });
  const [hasDeleted, setHasDeleted] = useState(false);
  const [deletedAt, setDeletedAt] = useState(null);

  useEffect(() => {
    if (planData) {
      const core = planData.categories.find(c => c.name === "Core")?.requiredCredits || 0;
      const major = planData.categories.find(c => c.name === "Major")?.requiredCredits || 0;
      const free = planData.categories.find(c => c.name === "Free")?.requiredCredits || 0;
      setForm({ program: planData.program || '', version: planData.version || '', core, major, free });
    }
    // If no planData, check whether a deleted plan exists so we can show Restore button
    if (!planData && studentId) {
      (async () => {
        try {
          const res = await fetch(`${API_BASE}/studyplan/student/${studentId}/deleted`);
          if (!res.ok) {
            setHasDeleted(false);
            return;
          }
          const json = await res.json();
          setHasDeleted(!!json.deleted);
          setDeletedAt(json.deletedAt ? new Date(json.deletedAt) : null);
        } catch (err) {
          setHasDeleted(false);
        }
      })();
    } else {
      setHasDeleted(false);
      setDeletedAt(null);
    }
  }, [planData]);

  const savePlan = async () => {
    const payload = {
      studentId, program: form.program, version: form.version,
      categories: [
        { name: "Core", requiredCredits: Number(form.core) },
        { name: "Major", requiredCredits: Number(form.major) },
        { name: "Free", requiredCredits: Number(form.free) }
      ]
    };

    try {
      const res = await fetch(`${API_BASE}/studyplan`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });
      if(!res.ok) throw new Error("ข้อมูลไม่ตรง Schema");
      alert("บันทึก Study Plan สำเร็จ!");
      refreshAll();
    } catch (err) { alert("ไม่สามารถบันทึก Study Plan ได้"); }
  };

  const softDeletePlan = async () => {
  if (!window.confirm("แน่ใจหรือไม่ว่าต้องการลบ Study Plan ของคุณ?")) return;

  try {
    const res = await fetch(
      `${API_BASE}/studyplan/student/${studentId}`,
      { method: "DELETE" }
    );

    if (!res.ok) {
      const text = await res.text();
      console.error("DELETE ERROR:", text);
      alert("ลบไม่สำเร็จ");
      return;
    }

    alert("ลบ Study Plan เรียบร้อยแล้ว");
    refreshAll();

  } catch (err) {
    console.error(err);
    alert("เกิดข้อผิดพลาด");
  }
};

  const restorePlan = async () => {
    if (!window.confirm("ต้องการคืน Study Plan ที่ลบไว้หรือไม่?")) return;

    try {
      const res = await fetch(`${API_BASE}/studyplan/student/${studentId}/restore`, { method: 'POST' });
      if (!res.ok) throw new Error('restore failed');
      alert('คืน Study Plan เรียบร้อย');
      refreshAll();
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถคืนแผนได้');
    }
  };

  return (
    <section className="card">
      <h2>Study Plan (CRUD)</h2>
      <p className="sub">ตั้งค่าแผนหน่วยกิตตามหมวดของนิสิต (ตรงกับ Schema ของ Backend)</p>

      <div className="grid-2">
        <div>
          <label>Program (หลักสูตร)</label>
          <input value={form.program} onChange={e => setForm({...form, program: e.target.value})} />
        </div>
        <div>
          <label>Version (ปีที่ปรับปรุง)</label>
          <input value={form.version} onChange={e => setForm({...form, version: e.target.value})} />
        </div>
      </div>

      <div style={{ marginTop: '12px' }} className="grid-2">
        <div>
          <label>Core Required Credits</label>
          <input type="number" value={form.core} onChange={e => setForm({...form, core: e.target.value})} min="0" />
        </div>
        <div>
          <label>Major Required Credits</label>
          <input type="number" value={form.major} onChange={e => setForm({...form, major: e.target.value})} min="0" />
        </div>
        <div>
          <label>Free Required Credits</label>
          <input type="number" value={form.free} onChange={e => setForm({...form, free: e.target.value})} min="0" />
        </div>
      </div>

      <div className="form-actions">
        <button className="btn" onClick={savePlan}>บันทึก / อัปเดต Study Plan</button>
        <button className="btn ghost" onClick={refreshAll}>โหลด Study Plan ซ้ำ</button>
        <button className="btn danger" onClick={softDeletePlan}>ลบแผน (Soft Delete)</button>
        {hasDeleted && <button className="btn" onClick={restorePlan}>คืนแผน (Restore)</button>}
      </div>

      <div style={{ marginTop: '12px' }}>
        {hasDeleted && (
          <div style={{ marginBottom: 8 }} className="mini">แผนถูกลบเมื่อ: <b>{deletedAt ? deletedAt.toLocaleString() : 'ไม่ทราบเวลา'}</b></div>
        )}
        <div className="mini"><b>Mongo Document Preview:</b></div>
        <pre style={{ background: '#0b1220', color: '#e5e7eb', padding: '12px', borderRadius: '14px', overflow: 'auto', border: '1px solid rgba(255,255,255,.06)' }}>
          {planData ? JSON.stringify(planData, null, 2) : "ยังไม่ได้โหลดข้อมูล"}
        </pre>
      </div>
    </section>
  );
}
