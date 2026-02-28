import React, { useState, useEffect } from 'react';
import './App.css';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AddCourse from './components/AddCourse';
import Remaining from './components/Remaining';
import StudyPlan from './components/StudyPlan';
import CourseManage from './components/CourseManage';
import EnrollmentManage from './components/EnrollmentManage';
import UserManage from './components/UserManage';

export const API_BASE = "http://localhost:8080/api";

/**
 * Helper: fetch ที่แนบ JWT token อัตโนมัติ
 * ใช้แทน fetch() ในทุก component ที่ต้อง auth
 */
export function authFetch(url, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { ...(options.headers || {}) };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
}

function App() {
  const [studentId, setStudentId] = useState(localStorage.getItem("studentId") || null);
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole") || "STUDENT");
  const [currentView, setCurrentView] = useState('dashboard');
  const [summaryData, setSummaryData] = useState(null);
  const [studyPlanData, setStudyPlanData] = useState(null);

  useEffect(() => {
    if (studentId) {
      refreshAll();
    }
  }, [studentId]);

  const refreshAll = async () => {
    await fetchSummary();
    await fetchPlan();
  };

  const fetchSummary = async () => {
    try {
      const res = await authFetch(`${API_BASE}/summary/${studentId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSummaryData(data);
    } catch (err) {
      setSummaryData(null);
    }
  };

  const fetchPlan = async () => {
    try {
      const res = await authFetch(`${API_BASE}/studyplan/${studentId}`);
      if (!res.ok) throw new Error();
      const plan = await res.json();
      setStudyPlanData(plan);
    } catch (err) {
      setStudyPlanData(null);
    }
  };

  const doLogout = () => {
    if (!window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) return;
    localStorage.removeItem("studentId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("token");
    setStudentId(null);
    setUserRole("STUDENT");
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="row">
          <div className="brand">
            <div className="logo" aria-hidden="true"></div>
            <div>
              <h1>KU Credit Tracker</h1>
              <p>ระบบติดตามหน่วยกิต — MySQL + MongoDB</p>
            </div>
          </div>
          <div className="top-actions">
            <span className="chip">● Online</span>
          </div>
        </div>
      </header>

      {!studentId ? (
        <Auth setStudentId={setStudentId} setUserRole={setUserRole} />
      ) : (
        <section className="main">
          <Sidebar 
            studentId={studentId} 
            version={studyPlanData?.version || "2026"} 
            currentView={currentView} 
            setCurrentView={setCurrentView} 
            doLogout={doLogout}
            userRole={userRole}
          />
          <main className="content">
            {currentView === 'dashboard' && <Dashboard summary={summaryData} />}
            {currentView === 'addCourse' && <AddCourse studentId={studentId} refreshAll={refreshAll} />}
            {currentView === 'remaining' && <Remaining summary={summaryData} />}
            {currentView === 'studyPlan' && <StudyPlan studentId={studentId} planData={studyPlanData} refreshAll={refreshAll} />}
            {currentView === 'courseManage' && <CourseManage />}
            {currentView === 'enrollmentManage' && <EnrollmentManage studentId={studentId} />}
            {currentView === 'userManage' && <UserManage />}
          </main>
        </section>
      )}

      <div className="footer">
        🎓 KU Credit Tracker — โปรเจค 01204351 Database Systems — Built with React, Express, MySQL & MongoDB
      </div>
    </div>
  );
}

export default App;
