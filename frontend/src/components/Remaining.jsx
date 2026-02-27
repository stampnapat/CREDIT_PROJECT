import React from 'react';

const CATEGORY_ICONS = {
  'Major': '🎓',
  'Wellness': '🏃',
  'Entrepreneurship': '💼',
  'Language and Communication': '🗣️',
  'Thai Citizen and Global Citizen': '🌏',
  'Aesthetics': '🎨',
};
const GENED_NAMES = ['Wellness', 'Entrepreneurship', 'Language and Communication', 'Thai Citizen and Global Citizen', 'Aesthetics'];
const getCatIcon = (name) => CATEGORY_ICONS[name] || '📘';

export default function Remaining({ summary }) {
  const categoriesList = summary?.categories || [];
  const notDone = categoriesList.filter(c => !c.completed);
  const majorRemaining = notDone.filter(c => c.category === 'Major');
  const genedRemaining = notDone.filter(c => GENED_NAMES.includes(c.category));

  const renderCard = (c, idx) => (
    <div key={idx} className="cat" style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14 }}>{getCatIcon(c.category)} {c.category}</div>
          <div className="mini">ได้ {c.earned} / ต้อง {c.required} หน่วยกิต</div>
        </div>
        <span className="pill warn">เหลือ {c.remaining}</span>
      </div>
      <div className="progress" style={{ height: '8px', marginTop: 8 }}>
        <div className="bar" style={{ width: `${c.required === 0 ? 0 : Math.min(100, Math.round((c.earned / c.required) * 100))}%` }}></div>
      </div>
    </div>
  );

  return (
    <section className="card">
      <h2>📋 ดูสิ่งที่เหลือ</h2>
      <p className="sub">แสดงหมวดยังไม่ครบ + หน่วยกิตที่ต้องเพิ่ม (แบ่งตาม Major / GenEd)</p>

      <div id="remainingBox">
        {categoriesList.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>ยังไม่มีข้อมูล กรุณาสร้าง Study Plan ก่อน</p>
          </div>
        ) : notDone.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>ครบตามแผนทุกหมวดแล้ว!</div>
            <div style={{ color: 'var(--muted)', marginTop: 4 }}>หน่วยกิตครบตามเป้าหมายที่ตั้งไว้</div>
          </div>
        ) : (
          <>
            {majorRemaining.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 8, color: 'var(--text)' }}>🎓 วิชาเอก (Major)</h3>
                {majorRemaining.map(renderCard)}
              </div>
            )}
            {genedRemaining.length > 0 && (
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 8, color: 'var(--text)' }}>📚 หมวดศึกษาทั่วไป (GenEd)</h3>
                {genedRemaining.map(renderCard)}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
