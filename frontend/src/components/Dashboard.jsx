import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  RadialBarChart, RadialBar
} from 'recharts';

const COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'];

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

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: '#fff', border: '1px solid #d2dfd8', borderRadius: 12,
      padding: '12px 16px', boxShadow: '0 8px 24px rgba(0,0,0,.1)', fontSize: 13,
      backdropFilter: 'blur(8px)'
    }}>
      <div style={{ fontWeight: 800, color: '#1b6b3a', marginBottom: 4 }}>{d.name || d.category}</div>
      {d.earned !== undefined && <div>ได้: <b>{d.earned}</b> หน่วยกิต</div>}
      {d.required !== undefined && <div>ต้อง: <b>{d.required}</b> หน่วยกิต</div>}
      {d.remaining !== undefined && <div>เหลือ: <b>{d.remaining}</b> หน่วยกิต</div>}
      {d.value !== undefined && d.earned === undefined && <div><b>{d.value}</b> หน่วยกิต</div>}
    </div>
  );
};

export default function Dashboard({ summary }) {
  const categoriesList = summary?.categories || [];
  const totalEarned = summary?.totalCredits || 0;

  let totalRequired = 0;
  let remainingTotal = 0;

  categoriesList.forEach(c => {
    totalRequired += c.required;
    remainingTotal += c.remaining;
  });

  const pct = totalRequired === 0 ? 0 : Math.min(100, Math.round((totalEarned / totalRequired) * 100));
  const isSetup = categoriesList.length > 0;

  // Data for Pie Chart (earned vs remaining)
  const pieData = [
    { name: 'หน่วยกิตที่ได้', value: totalEarned },
    { name: 'หน่วยกิตที่เหลือ', value: Math.max(remainingTotal, 0) },
  ];

  // Data for Bar Chart (per-category comparison)
  const barData = categoriesList.map(c => ({
    category: c.category,
    earned: c.earned,
    remaining: c.remaining,
    required: c.required,
  }));

  // Data for Radial progress
  const radialData = [
    { name: 'ความคืบหน้า', value: pct, fill: '#40916c' },
  ];

  // Data for per-category pie
  const catPieData = categoriesList.map((c, i) => ({
    name: c.category,
    value: c.required,
    earned: c.earned,
    remaining: c.remaining,
    required: c.required,
  }));

  return (
    <section className="card">
      <h2>📊 Dashboard — ภาพรวมหน่วยกิต</h2>
      <p className="sub">สรุปหน่วยกิตสะสมทั้งหมด ประมวลผลผ่าน MongoDB + REST API</p>

      {/* Stat Cards */}
      <div className="stats">
        <div className="stat">
          <div className="label">✅ หน่วยกิตสะสม</div>
          <div className="value">{totalEarned}</div>
          <div className="hint">คำนวณจากวิชาที่เรียนจบ</div>
        </div>
        <div className="stat">
          <div className="label">🎯 เป้าหมาย</div>
          <div className="value">{totalRequired}</div>
          <div className="hint">ตาม Study Plan ที่ตั้งไว้</div>
        </div>
        <div className="stat">
          <div className="label">📌 คงเหลือ</div>
          <div className="value">{remainingTotal}</div>
          <div className="hint">หน่วยกิตที่ต้องเรียนเพิ่ม</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-wrap">
        <div className="progress-top">
          <div>
            <div className="title">ความคืบหน้ารวม</div>
            <div className="mini"><span>{pct}</span>% ของเป้าหมาย</div>
          </div>
          <span className={!isSetup ? "pill warn" : (pct >= 100 ? "pill" : "pill warn")}>
            {!isSetup ? "โปรดสร้าง Study Plan ก่อน" : (pct >= 100 ? "ครบตามแผนแล้ว 🎉" : "กำลังดำเนินการ")}
          </span>
        </div>
        <div className="progress" aria-label="progress bar">
          <div className="bar" style={{ width: `${pct}%` }}></div>
        </div>
      </div>

      {/* Charts Section */}
      {isSetup && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 800, color: 'var(--text)', letterSpacing: '-.2px' }}>📈 กราฟสรุปข้อมูล</h3>

          <div className="chart-grid">
            {/* Donut: Earned vs Remaining */}
            <div className="chart-card">
              <div className="chart-title">สัดส่วนหน่วยกิต ได้/เหลือ</div>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={2}
                    stroke="#fff"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#e5efe9" />
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: 12, fontWeight: 700 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ textAlign: 'center', marginTop: -10 }}>
                <span style={{ fontSize: 30, fontWeight: 900, color: 'var(--primary)', letterSpacing: '-1px' }}>{pct}%</span>
              </div>
            </div>

            {/* Pie: สัดส่วนหมวดหน่วยกิต */}
            <div className="chart-card">
              <div className="chart-title">สัดส่วนหน่วยกิตตามหมวด</div>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={catPieData}
                    cx="50%" cy="50%"
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={2}
                    stroke="#fff"
                    label={({ name, value }) => `${name} (${value})`}
                  >
                    {catPieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart: Earned vs Required per category */}
          <div className="chart-card" style={{ marginTop: 16 }}>
            <div className="chart-title">เปรียบเทียบหน่วยกิต ได้ vs ต้อง (แต่ละหมวด)</div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5efe9" />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#5a7268' }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12, fill: '#8b8680' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, fontWeight: 700, paddingBottom: 8 }}
                />
                <Bar dataKey="earned" name="ได้แล้ว" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="required" name="ต้องครบ" fill="#d1fae5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Per-category cards — grouped Major + GenEd */}
      {(() => {
        const majorCats = categoriesList.filter(c => c.category === 'Major');
        const genedCats = categoriesList.filter(c => GENED_NAMES.includes(c.category));
        const renderCatCard = (cat, idx) => {
          const catPct = cat.required === 0 ? 0 : Math.min(100, Math.round((cat.earned / cat.required) * 100));
          return (
            <div className="cat" key={idx}>
              <div className="row">
                <div>
                  <div style={{ fontWeight: 900 }}>{getCatIcon(cat.category)} {cat.category}</div>
                  <div className="mini">ได้ {cat.earned} / ต้อง {cat.required} หน่วยกิต</div>
                </div>
                {cat.completed
                  ? <span className="pill">ครบแล้ว ✅</span>
                  : <span className="pill warn">เหลือ {cat.remaining}</span>
                }
              </div>
              <div className="progress" style={{ height: '10px' }}>
                <div className="bar" style={{ width: `${catPct}%` }}></div>
              </div>
              <div className="mini" style={{ marginTop: 4, textAlign: 'right' }}>{catPct}%</div>
            </div>
          );
        };
        return (
          <>
            {majorCats.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>🎓 วิชาเอก (Major)</h3>
                <div className="cat-grid">
                  {majorCats.map(renderCatCard)}
                </div>
              </div>
            )}
            {genedCats.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>📚 หมวดศึกษาทั่วไป (GenEd)</h3>
                <div className="cat-grid">
                  {genedCats.map(renderCatCard)}
                </div>
              </div>
            )}
          </>
        );
      })()}
    </section>
  );
}
