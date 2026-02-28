import React, { useState } from 'react';
import { API_BASE } from '../App';

export default function Auth({ setStudentId, setUserRole }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password)
      return alert("กรุณากรอกอีเมลและรหัสผ่าน");

    const loginEmail = email.trim().toLowerCase();

    try {
      const res = await fetch(`${API_BASE}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password })
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || data.message || "เข้าสู่ระบบไม่สำเร็จ");
        return;
      }

      const data = await res.json();
      const role = data.user?.role || "STUDENT";

      localStorage.setItem("studentId", loginEmail);
      localStorage.setItem("userRole", role);
      setUserRole(role);
      setStudentId(loginEmail);

    } catch (e) {
      alert("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
  };

  const demoLogin = async () => {
    setEmail("S001");
    setPassword("demo");
    try {
      await fetch(`${API_BASE}/demo/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: "S001" })
      });
    } catch (err) { console.warn("Demo reset API warning:", err); }

    const cleanId = "S001";
    localStorage.setItem("studentId", cleanId);
    setStudentId(cleanId);
  };

  return (
    <section className="auth-wrap">
      <div className="hero">
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎓</div>
        <h2>ยินดีต้อนรับสู่ KU Credit Tracker</h2>
        <p>เว็บแอปสำหรับติดตามหน่วยกิต เช็คว่า "เรียนอะไรแล้ว / เหลืออะไร" เชื่อมต่อกับ Backend API อัตโนมัติ</p>
        <ul>
          <li>📊 Dashboard สรุปหน่วยกิต พร้อมกราฟ</li>
          <li>📚 จัดการรายวิชาและหน่วยกิตตามหลักสูตร</li>
          <li>🔗 เชื่อมต่อ MySQL + MongoDB ผ่าน REST API</li>
        </ul>
        <div className="toggle">
          <button className="btn" onClick={demoLogin}>🚀 ทดลองใช้งาน (Demo)</button>
        </div>
      </div>

      <div className="card">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          🔐 เข้าสู่ระบบ
        </h2>
        <p className="sub">ใส่อีเมลและรหัสผ่าน — ถ้ายังไม่มีบัญชี ระบบจะสร้างให้อัตโนมัติ</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label>📧 อีเมล หรือ รหัสนิสิต</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="เช่น s65xxxxxx@ku.th" />
          </div>
          <div>
            <label>🔒 รหัสผ่าน</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          </div>
        </div>

        <div className="form-actions" style={{ marginTop: 20 }}>
          <button className="btn" style={{ flex: 1 }} onClick={handleLogin}>
            🔓 เข้าสู่ระบบ
          </button>
        </div>
      </div>
    </section>
  );
}
