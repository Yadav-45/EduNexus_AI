import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { API_BASE_URL, getAuthToken } from "../api/config";
import {
  BookOpen,
  FileCheck2,
  CalendarCheck,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  GraduationCap,
  Calendar,
  CreditCard,
  Bell,
  Sparkles,
  Bot,
  Check,
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();

  const [studentName, setStudentName] = useState("Aarav Sharma");
  const [studentEmail, setStudentEmail] = useState("aarav.sharma@edunexus.edu");
  const [courseProgress, setCourseProgress] = useState(72);
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      title: "Circles & Cyclic Quadrilaterals (Theorem 4 & 5 Proofs)",
      course: "Compulsory Mathematics",
      completed: true,
      dueDate: "Oct 18, 2026",
    },
    {
      id: 2,
      title: "Mendelian Genetics & Heredity Problem Sets",
      course: "Science & Technology",
      completed: false,
      dueDate: "Oct 20, 2026",
    },
    {
      id: 3,
      title: "Python Data Structures: Lists & Dictionaries Exercise",
      course: "Computer Science",
      completed: true,
      dueDate: "Oct 21, 2026",
    },
    {
      id: 4,
      title: "Constitutional Governance & Federal Structure Case Study",
      course: "Social Studies",
      completed: false,
      dueDate: "Oct 23, 2026",
    },
  ]);

  const todayClasses = [
    {
      period: "Period 1",
      time: "09:00 – 09:45 AM",
      subject: "Compulsory Mathematics",
      teacher: "Er. Suresh Adhikari",
      room: "Room 204",
      status: "Done",
    },
    {
      period: "Period 2",
      time: "09:45 – 10:30 AM",
      subject: "Science & Technology",
      teacher: "Dr. Bikas Pant",
      room: "Science Lab 2",
      status: "Done",
    },
    {
      period: "Period 3",
      time: "10:30 – 11:15 AM",
      subject: "Computer Science",
      teacher: "Tr. Anish Thapa",
      room: "IT Lab",
      status: "In Progress",
    },
    {
      period: "Break",
      time: "11:15 – 11:55 AM",
      subject: "Lunch / Refreshment Break",
      teacher: "Campus Cafeteria",
      room: "Cafeteria",
      status: "Upcoming",
    },
    {
      period: "Period 4",
      time: "11:55 – 12:40 PM",
      subject: "English Literature",
      teacher: "Ms. Sunita Karki",
      room: "Room 101",
      status: "Upcoming",
    },
    {
      period: "Period 5",
      time: "12:40 – 01:25 PM",
      subject: "Social Studies",
      teacher: "Mrs. Ranjita Shrestha",
      room: "Room 101",
      status: "Upcoming",
    },
  ];

  const loadProfile = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const profile = await response.json();
        if (profile.full_name?.trim()) setStudentName(profile.full_name.trim());
        if (profile.email?.trim()) setStudentEmail(profile.email.trim());
      }
    } catch (err) {
      // keep fallback
    }

    try {
      const aRes = await fetch(`${API_BASE_URL}/assignments`);
      if (aRes.ok) {
        const data = await aRes.json();
        if (Array.isArray(data) && data.length > 0) {
          setAssignments(data);
        }
      }
    } catch (err) {
      // keep fallback
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return (
    <AppLayout
      title={`Welcome back, ${studentName}`}
      subtitle="Class 10 (Section A) • Roll #14 • Academic Session 2025–26"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/ai-tutor")}
            className="student-top-action-btn"
          >
            <Bot size={15} />
            <span>AI Tutor</span>
          </button>
          <button
            onClick={() => navigate("/assignments")}
            className="student-top-action-btn secondary"
          >
            <FileCheck2 size={15} />
            <span>Submit Work</span>
          </button>
        </div>
      }
    >
      <div className="student-container">
        {/* ============================================================
            ROW 1: 4 CLEAR STUDENT METRICS (SCAN IN 20 SECONDS)
            ============================================================ */}
        <section className="student-stats-grid">
          <div className="student-stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Academic Attendance</span>
              <div className="stat-icon-box text-emerald-400 bg-emerald-500/10">
                <CalendarCheck size={18} />
              </div>
            </div>
            <div className="stat-val">96.4%</div>
            <div className="stat-sub text-emerald-400">
              132 Days Present <span className="text-slate-400">• 5 Absent</span>
            </div>
          </div>

          <div className="student-stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Current Academic Standing</span>
              <div className="stat-icon-box text-amber-400 bg-amber-500/10">
                <Award size={18} />
              </div>
            </div>
            <div className="stat-val">3.85 <span className="text-sm font-normal text-slate-400">/ 4.00</span></div>
            <div className="stat-sub text-amber-400">
              Grade: Distinction (A+) <span className="text-slate-400">• Top 5%</span>
            </div>
          </div>

          <div className="student-stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Assignments Due</span>
              <div className="stat-icon-box text-cyan-400 bg-cyan-500/10">
                <FileCheck2 size={18} />
              </div>
            </div>
            <div className="stat-val">2 Pending</div>
            <div className="stat-sub text-cyan-400">
              4 Completed this week <span className="text-slate-400">• On Track</span>
            </div>
          </div>

          <div className="student-stat-card">
            <div className="stat-card-top">
              <span className="stat-label">Tuition & Fee Status</span>
              <div className="stat-icon-box text-indigo-400 bg-indigo-500/10">
                <CreditCard size={18} />
              </div>
            </div>
            <div className="stat-val text-emerald-400 text-xl font-bold pt-1">Cleared</div>
            <div className="stat-sub text-slate-400">
              Receipt #REC-2081-8942 <span className="text-emerald-400">• No Dues</span>
            </div>
          </div>
        </section>

        {/* ============================================================
            ROW 2: TWO-COLUMN MAIN WORKSPACE (NO ENDLESS SCROLL)
            ============================================================ */}
        <div className="student-columns-layout">
          {/* ==================== LEFT COLUMN (TIMETABLE & COURSES - 65%) ==================== */}
          <div className="student-main-col">
            {/* TODAY'S CLASS SCHEDULE */}
            <div className="student-card">
              <div className="card-top-header">
                <div>
                  <h3 className="card-header-title">Today's Class Schedule</h3>
                  <p className="card-header-desc">
                    Daily timetable for Class 10-A • 6 Periods scheduled today
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Period 3 Active</span>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                {todayClasses.map((item, idx) => (
                  <div
                    key={idx}
                    className={`schedule-row ${
                      item.status === "In Progress"
                        ? "active-row"
                        : item.status === "Done"
                        ? "done-row"
                        : ""
                    }`}
                  >
                    <div className="schedule-left">
                      <span className="schedule-period">{item.period}</span>
                      <span className="schedule-time">{item.time}</span>
                    </div>

                    <div className="schedule-middle">
                      <h4 className="schedule-subject">{item.subject}</h4>
                      <span className="schedule-teacher">
                        {item.teacher} • {item.room}
                      </span>
                    </div>

                    <div className="schedule-right">
                      <span
                        className={`schedule-badge ${
                          item.status === "In Progress"
                            ? "badge-active"
                            : item.status === "Done"
                            ? "badge-done"
                            : "badge-upcoming"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ENROLLED COURSES */}
            <div className="student-card mt-6">
              <div className="card-top-header">
                <div>
                  <h3 className="card-header-title">Enrolled Academic Modules</h3>
                  <p className="card-header-desc">
                    National curriculum courses and completion rates
                  </p>
                </div>
                <button
                  onClick={() => navigate("/courses")}
                  className="card-link"
                >
                  <span>All Courses</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="course-box">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="course-cat">Core Curriculum</span>
                      <h4 className="course-name">Computer Science & Python</h4>
                    </div>
                    <span className="course-pct text-indigo-400">78%</span>
                  </div>
                  <div className="course-bar">
                    <div className="course-bar-fill bg-indigo-500" style={{ width: "78%" }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-3">
                    <span>14 of 18 Topics Mastered</span>
                    <button
                      onClick={() => navigate("/learning")}
                      className="text-indigo-400 font-semibold hover:underline"
                    >
                      Continue →
                    </button>
                  </div>
                </div>

                <div className="course-box">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="course-cat">Core Curriculum</span>
                      <h4 className="course-name">Compulsory Mathematics</h4>
                    </div>
                    <span className="course-pct text-cyan-400">65%</span>
                  </div>
                  <div className="course-bar">
                    <div className="course-bar-fill bg-cyan-500" style={{ width: "65%" }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-3">
                    <span>12 of 18 Topics Mastered</span>
                    <button
                      onClick={() => navigate("/learning")}
                      className="text-cyan-400 font-semibold hover:underline"
                    >
                      Continue →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ASSIGNMENTS CHECKLIST */}
            <div className="student-card mt-6">
              <div className="card-top-header">
                <div>
                  <h3 className="card-header-title">Assignments & Problem Sets</h3>
                  <p className="card-header-desc">
                    Upcoming homework submissions and graded tasks
                  </p>
                </div>
                <button
                  onClick={() => navigate("/assignments")}
                  className="card-link"
                >
                  <span>Submit Task</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className="space-y-2.5 mt-4">
                {assignments.map((item) => (
                  <div key={item.id} className="assignment-row">
                    <div className="flex items-center gap-3">
                      <div
                        className={`assign-check-circle ${
                          item.completed ? "is-done" : "is-pending"
                        }`}
                      >
                        {item.completed ? <Check size={13} /> : <Clock size={13} />}
                      </div>
                      <div>
                        <h5 className="assign-title">{item.title}</h5>
                        <span className="assign-course">
                          {item.course} • Due: {item.dueDate}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`assign-tag ${
                        item.completed ? "tag-completed" : "tag-pending"
                      }`}
                    >
                      {item.completed ? "Submitted" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ==================== RIGHT COLUMN (ANNOUNCEMENTS & SHORTCUTS - 35%) ==================== */}
          <div className="student-sidebar-col">
            {/* QUICK AI TUTOR ACCESS */}
            <div className="student-card bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border-indigo-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Bot size={18} className="text-indigo-400" />
                <h3 className="card-header-title">Need Help With Homework?</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                Your AI Subject Tutor can guide you through math proofs, science concepts, and code debugging step-by-step.
              </p>
              <button
                onClick={() => navigate("/ai-tutor")}
                className="w-full flex items-center justify-center gap-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-3 rounded-lg transition-all"
              >
                <Sparkles size={14} />
                <span>Open AI Subject Tutor</span>
              </button>
            </div>

            {/* SCHOOL ANNOUNCEMENTS */}
            <div className="student-card mt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-cyan-400" />
                  <h3 className="card-header-title">School Notices</h3>
                </div>
                <button
                  onClick={() => navigate("/communication")}
                  className="card-link"
                >
                  <span>All</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="notice-item">
                  <span className="notice-date">Oct 16, 2026 • Academic</span>
                  <h5 className="notice-title">
                    Mid-Term Examination Routine Published
                  </h5>
                  <p className="notice-snippet">
                    Exams begin on Oct 24. Collect admission admit cards from your class teacher.
                  </p>
                </div>
                <div className="notice-item">
                  <span className="notice-date">Oct 14, 2026 • Library</span>
                  <h5 className="notice-title">
                    Digital Textbook & Library Circulation
                  </h5>
                  <p className="notice-snippet">
                    Term 2 reference books available for online access through the student portal.
                  </p>
                </div>
              </div>
            </div>

            {/* QUICK PORTALS */}
            <div className="student-card mt-6">
              <h3 className="card-header-title mb-2">Academic Links</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => navigate("/courses")}
                  className="shortcut-tile"
                >
                  <BookOpen size={16} className="text-cyan-400" />
                  <span>My Courses</span>
                </button>
                <button
                  onClick={() => navigate("/assignments")}
                  className="shortcut-tile"
                >
                  <FileCheck2 size={16} className="text-emerald-400" />
                  <span>Homework</span>
                </button>
                <button
                  onClick={() => navigate("/academic/exam-results")}
                  className="shortcut-tile"
                >
                  <Award size={16} className="text-amber-400" />
                  <span>Report Cards</span>
                </button>
                <button
                  onClick={() => navigate("/attendance")}
                  className="shortcut-tile"
                >
                  <CalendarCheck size={16} className="text-indigo-400" />
                  <span>Attendance</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .student-container {
          max-width: 1360px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .student-top-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          padding: 7px 13px;
          border-radius: 8px;
          background: #4f46e5;
          color: #ffffff;
          border: none;
          cursor: pointer;
        }
        .student-top-action-btn:hover {
          background: #4338ca;
        }
        .student-top-action-btn.secondary {
          background: rgba(255, 255, 255, 0.08);
          color: #e2e8f0;
          border: 1px solid rgba(255, 255, 255, 0.12);
        }
        .student-top-action-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.14);
        }

        .student-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 16px;
        }

        .student-stat-card {
          background: #0f1523;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 16px 18px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .stat-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .stat-label {
          font-size: 12px;
          font-weight: 500;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .stat-icon-box {
          width: 30px;
          height: 30px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-val {
          font-size: 24px;
          font-weight: 700;
          color: #f8fafc;
        }

        .stat-sub {
          font-size: 11.5px;
        }

        .student-columns-layout {
          display: grid;
          grid-template-columns: 66% calc(34% - 20px);
          gap: 20px;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .student-columns-layout {
            grid-template-columns: 1fr;
          }
        }

        .student-card {
          background: #0f1523;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 18px 20px;
        }

        .card-top-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .card-header-title {
          font-size: 15px;
          font-weight: 600;
          color: #f1f5f9;
        }

        .card-header-desc {
          font-size: 12px;
          color: #94a3b8;
          margin-top: 2px;
        }

        .card-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #818cf8;
          background: none;
          border: none;
          cursor: pointer;
        }
        .card-link:hover {
          color: #a5b4fc;
          text-decoration: underline;
        }

        .schedule-row {
          display: grid;
          grid-template-columns: 130px 1fr 90px;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
        }
        .schedule-row.active-row {
          background: rgba(99, 102, 241, 0.08);
          border-color: rgba(99, 102, 241, 0.3);
        }
        .schedule-row.done-row {
          opacity: 0.7;
        }

        .schedule-period {
          font-size: 12px;
          font-weight: 700;
          color: #e2e8f0;
          display: block;
        }
        .schedule-time {
          font-size: 11px;
          color: #94a3b8;
        }

        .schedule-subject {
          font-size: 13px;
          font-weight: 600;
          color: #f1f5f9;
        }
        .schedule-teacher {
          font-size: 11px;
          color: #94a3b8;
        }

        .schedule-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 7px;
          border-radius: 5px;
          text-align: center;
        }
        .badge-active {
          color: #34d399;
          background: rgba(16, 185, 129, 0.15);
        }
        .badge-done {
          color: #94a3b8;
          background: rgba(148, 163, 184, 0.1);
        }
        .badge-upcoming {
          color: #cbd5e1;
          background: rgba(255, 255, 255, 0.06);
        }

        .course-box {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          padding: 14px;
        }
        .course-cat {
          font-size: 10.5px;
          color: #94a3b8;
          text-transform: uppercase;
        }
        .course-name {
          font-size: 13.5px;
          font-weight: 600;
          color: #f8fafc;
          margin-top: 2px;
        }
        .course-pct {
          font-size: 16px;
          font-weight: 700;
        }
        .course-bar {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 99px;
          margin-top: 10px;
          overflow: hidden;
        }
        .course-bar-fill {
          height: 100%;
          border-radius: 99px;
        }

        .assignment-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 8px;
        }
        .assign-check-circle {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .assign-check-circle.is-done {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
        }
        .assign-check-circle.is-pending {
          background: rgba(245, 158, 11, 0.15);
          color: #fbbf24;
        }
        .assign-title {
          font-size: 12.5px;
          font-weight: 600;
          color: #f1f5f9;
        }
        .assign-course {
          font-size: 11px;
          color: #94a3b8;
        }
        .assign-tag {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 7px;
          border-radius: 5px;
        }
        .tag-completed {
          color: #34d399;
          background: rgba(16, 185, 129, 0.12);
        }
        .tag-pending {
          color: #fbbf24;
          background: rgba(245, 158, 11, 0.12);
        }

        .notice-item {
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 8px;
        }
        .notice-date {
          font-size: 10.5px;
          color: #94a3b8;
        }
        .notice-title {
          font-size: 12.5px;
          font-weight: 600;
          color: #f1f5f9;
          margin: 3px 0;
        }
        .notice-snippet {
          font-size: 11.5px;
          color: #94a3b8;
          line-height: 1.4;
        }

        .shortcut-tile {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          color: #cbd5e1;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .shortcut-tile:hover {
          background: rgba(255, 255, 255, 0.07);
          color: #ffffff;
        }
      `}</style>
    </AppLayout>
  );
}