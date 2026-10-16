import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import AppLayout from "../components/AppLayout";
import {
  Users,
  GraduationCap,
  Briefcase,
  UserCheck,
  CalendarCheck,
  CreditCard,
  MessageSquare,
  BookOpen,
  FolderOpen,
  ArrowRight,
  TrendingUp,
  Activity,
  Clock,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Building2,
  Plus,
  Bus,
  Package,
  Award,
  Check,
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await api.get("/users");
        const data = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.items)
          ? response.data.items
          : [];
        setUsers(data);
      } catch (error) {
        console.error("Unable to load user directory:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const stats = useMemo(() => {
    const studentCount = users.filter((u) => u.role === "STUDENT").length || 1248;
    const teacherCount = users.filter((u) => u.role === "TEACHER").length || 78;
    const parentCount = users.filter((u) => u.role === "PARENT").length || 890;
    const activeCount = users.filter((u) => u.is_active).length || 1195;

    return {
      students: studentCount,
      faculty: teacherCount,
      parents: parentCount,
      active: activeCount,
      attendanceRate: 94.2,
      presentToday: Math.round(studentCount * 0.942),
      absentToday: Math.round(studentCount * 0.058),
    };
  }, [users]);

  // Operational Modules Directory
  const coreModules = [
    {
      title: "Students 360°",
      desc: "Enrollment records, cohorts, student profiles, and academic dossiers.",
      icon: GraduationCap,
      color: "text-indigo-400 bg-indigo-500/10",
      path: "/students",
      badge: `${stats.students} Enrolled`,
    },
    {
      title: "Admissions Hub",
      desc: "Candidate onboarding pipeline, document checks, and status tracking.",
      icon: UserCheck,
      color: "text-cyan-400 bg-cyan-500/10",
      path: "/admissions",
      badge: "Intake Active",
    },
    {
      title: "Daily Attendance",
      desc: "Section-by-section presence tracking, absence logs, and SMS notifications.",
      icon: CalendarCheck,
      color: "text-emerald-400 bg-emerald-500/10",
      path: "/attendance",
      badge: `${stats.attendanceRate}% Present`,
    },
    {
      title: "Tuition & Fee Desk",
      desc: "Student fee accounts, online payments, receipts, and aging balances.",
      icon: CreditCard,
      color: "text-amber-400 bg-amber-500/10",
      path: "/fees",
      badge: "Billing Live",
    },
    {
      title: "Faculty & Staff HR",
      desc: "Faculty roster, shift allocations, leaves, and monthly payroll slips.",
      icon: Briefcase,
      color: "text-purple-400 bg-purple-500/10",
      path: "/staff",
      badge: `${stats.faculty} Faculty`,
    },
    {
      title: "Academic Exams",
      desc: "Term exam scheduling, marks entry, report card generation, and ranks.",
      icon: Award,
      color: "text-rose-400 bg-rose-500/10",
      path: "/academic/exam",
      badge: "Term 2 Schedule",
    },
    {
      title: "Campus Inventory",
      desc: "Stock tracking, educational supplies, vendor orders, and movements.",
      icon: Package,
      color: "text-teal-400 bg-teal-500/10",
      path: "/inventory",
      badge: "Supplies Stocked",
    },
    {
      title: "Transport & Fleets",
      desc: "Bus routes, driver allocations, vehicle maintenance, and student transit.",
      icon: Bus,
      color: "text-orange-400 bg-orange-500/10",
      path: "/transport",
      badge: "12 Routes Active",
    },
  ];

  // Daily Administrative Action Checklist
  const dailyTasks = [
    { id: 1, title: "Review 3 incoming admissions applications", time: "Morning Priority", done: false },
    { id: 2, title: "Verify morning bus transit route arrivals", time: "08:45 AM", done: true },
    { id: 3, title: "Trigger daily absence alerts to parents", time: "10:30 AM", done: true },
    { id: 4, title: "Reconcile daily fee receipts with bank statements", time: "03:30 PM", done: false },
  ];

  // Recent Activity Log
  const activityLogs = [
    { id: 1, text: "Fee receipt #REC-2081-8942 issued for Aarav Sharma ($1,250)", time: "15m ago" },
    { id: 2, text: "New student admission registered: Siddhartha Joshi (Grade 11)", time: "1h ago" },
    { id: 3, text: "Staff leave approved: Er. Suresh Adhikari (Math Dept, 1 day)", time: "2h ago" },
    { id: 4, text: "Mid-Term Examination schedule circular dispatched to parents", time: "Yesterday" },
  ];

  return (
    <AppLayout
      title="Administrative Operations Hub"
      subtitle="School Management Console • Session 2025–2026"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/attendance")}
            className="admin-btn secondary"
          >
            <CalendarCheck size={14} />
            <span>Mark Attendance</span>
          </button>
          <button
            onClick={() => navigate("/admissions/new")}
            className="admin-btn primary"
          >
            <Plus size={14} />
            <span>New Admission</span>
          </button>
        </div>
      }
    >
      <div className="admin-container">
        {/* ============================================================
            ROW 1: 4 CLEAR OPERATIONAL KPIS (UNDERSTAND IN 20 SECONDS)
            ============================================================ */}
        <section className="admin-kpi-grid">
          <div className="admin-kpi-card">
            <div className="kpi-top">
              <span className="kpi-tag">Enrolled Students</span>
              <div className="kpi-icon-pill text-indigo-400 bg-indigo-500/10">
                <GraduationCap size={18} />
              </div>
            </div>
            <div className="kpi-number">{loading ? "..." : stats.students.toLocaleString()}</div>
            <div className="kpi-meta text-slate-400">
              Grade 1 through 12 • <strong className="text-emerald-400">{stats.active} Active</strong>
            </div>
          </div>

          <div className="admin-kpi-card">
            <div className="kpi-top">
              <span className="kpi-tag">Today's Attendance</span>
              <div className="kpi-icon-pill text-emerald-400 bg-emerald-500/10">
                <CalendarCheck size={18} />
              </div>
            </div>
            <div className="kpi-number">{stats.attendanceRate}%</div>
            <div className="kpi-meta text-emerald-400">
              {stats.presentToday} Present <span className="text-slate-400">• {stats.absentToday} Absent</span>
            </div>
          </div>

          <div className="admin-kpi-card">
            <div className="kpi-top">
              <span className="kpi-tag">Faculty & Staff</span>
              <div className="kpi-icon-pill text-cyan-400 bg-cyan-500/10">
                <Briefcase size={18} />
              </div>
            </div>
            <div className="kpi-number">{stats.faculty}</div>
            <div className="kpi-meta text-cyan-400">
              96% Biometric Presence <span className="text-slate-400">• Full Shift</span>
            </div>
          </div>

          <div className="admin-kpi-card">
            <div className="kpi-top">
              <span className="kpi-tag">Tuition Collection</span>
              <div className="kpi-icon-pill text-amber-400 bg-amber-500/10">
                <CreditCard size={18} />
              </div>
            </div>
            <div className="kpi-number">$48,650</div>
            <div className="kpi-meta text-amber-400">
              92.4% Target Met <span className="text-slate-400">• Month-to-date</span>
            </div>
          </div>
        </section>

        {/* ============================================================
            ROW 2: TWO-COLUMN MAIN WORKSPACE (BALANCED & FAST TO SCAN)
            ============================================================ */}
        <div className="admin-layout-grid">
          {/* ==================== LEFT COLUMN (CORE MODULES & ACTIONS - 65%) ==================== */}
          <div className="admin-main-column">
            {/* CORE MODULES DIRECTORY */}
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h3 className="admin-card-title">School Operational Modules</h3>
                  <p className="admin-card-desc">
                    Centralized management portals for daily administration
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3">
                {coreModules.map((mod, idx) => {
                  const Icon = mod.icon;
                  return (
                    <div
                      key={idx}
                      onClick={() => navigate(mod.path)}
                      className="module-card-box"
                    >
                      <div className="flex items-start justify-between">
                        <div className={`module-icon-wrap ${mod.color}`}>
                          <Icon size={18} />
                        </div>
                        <span className="module-badge">{mod.badge}</span>
                      </div>
                      <h4 className="module-card-name">{mod.title}</h4>
                      <p className="module-card-detail">{mod.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* GRADE COHORT HEADCOUNT OVERVIEW */}
            <div className="admin-card mt-6">
              <div className="admin-card-header">
                <div>
                  <h3 className="admin-card-title">Student Cohort Distribution</h3>
                  <p className="admin-card-desc">
                    Enrollment counts and section allocations by grade level
                  </p>
                </div>
                <button
                  onClick={() => navigate("/students")}
                  className="card-text-link"
                >
                  <span>Student Registry</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                <div className="cohort-item">
                  <span className="cohort-level">Primary (Grades 1-5)</span>
                  <strong className="cohort-val">412 Students</strong>
                  <span className="cohort-sub">12 Sections • 96% Pres.</span>
                </div>
                <div className="cohort-item">
                  <span className="cohort-level">Middle (Grades 6-8)</span>
                  <strong className="cohort-val">348 Students</strong>
                  <span className="cohort-sub">9 Sections • 94% Pres.</span>
                </div>
                <div className="cohort-item">
                  <span className="cohort-level">Secondary (Grades 9-10)</span>
                  <strong className="cohort-val">286 Students</strong>
                  <span className="cohort-sub">8 Sections • 93% Pres.</span>
                </div>
                <div className="cohort-item">
                  <span className="cohort-level">Higher Sec (11-12)</span>
                  <strong className="cohort-val">202 Students</strong>
                  <span className="cohort-sub">6 Sections • 94% Pres.</span>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== RIGHT COLUMN (CHECKLIST & ACTIVITY - 35%) ==================== */}
          <div className="admin-side-column">
            {/* DAILY ADMINISTRATIVE CHECKLIST */}
            <div className="admin-card">
              <div className="admin-card-header">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <h3 className="admin-card-title">Today's Admin Tasks</h3>
                </div>
                <span className="text-xs text-slate-400">4 Items</span>
              </div>

              <div className="space-y-2 mt-3">
                {dailyTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`task-row ${task.done ? "task-done" : ""}`}
                  >
                    <div
                      className={`task-check-circle ${
                        task.done ? "done-circle" : "pending-circle"
                      }`}
                    >
                      {task.done ? <Check size={12} /> : null}
                    </div>
                    <div className="flex-1">
                      <h5 className="task-title">{task.title}</h5>
                      <span className="task-time">{task.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="admin-card mt-6">
              <h3 className="admin-card-title mb-1">Quick Actions</h3>
              <p className="admin-card-desc mb-3">Frequent administrative shortcuts</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => navigate("/admissions/new")}
                  className="quick-action-tile"
                >
                  <Plus size={15} className="text-cyan-400" />
                  <span>Add Student</span>
                </button>
                <button
                  onClick={() => navigate("/fees")}
                  className="quick-action-tile"
                >
                  <CreditCard size={15} className="text-emerald-400" />
                  <span>Record Fee</span>
                </button>
                <button
                  onClick={() => navigate("/communication")}
                  className="quick-action-tile"
                >
                  <Bell size={15} className="text-amber-400" />
                  <span>Send Notice</span>
                </button>
                <button
                  onClick={() => navigate("/staff/new")}
                  className="quick-action-tile"
                >
                  <Briefcase size={15} className="text-indigo-400" />
                  <span>Add Faculty</span>
                </button>
              </div>
            </div>

            {/* RECENT OPERATIONAL LOG */}
            <div className="admin-card mt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-indigo-400" />
                  <h3 className="admin-card-title">Recent Activity</h3>
                </div>
                <span className="text-xs text-slate-400">Live Feed</span>
              </div>

              <div className="space-y-2.5">
                {activityLogs.map((log) => (
                  <div key={log.id} className="activity-row">
                    <span className="activity-dot" />
                    <div className="flex-1">
                      <p className="activity-text">{log.text}</p>
                      <span className="activity-time">{log.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .admin-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .admin-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          padding: 7px 13px;
          border-radius: 8px;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
        }
        .admin-btn.primary {
          background: #4f46e5;
          color: #ffffff;
        }
        .admin-btn.primary:hover {
          background: #4338ca;
        }
        .admin-btn.secondary {
          background: rgba(255, 255, 255, 0.08);
          color: #e2e8f0;
          border: 1px solid rgba(255, 255, 255, 0.12);
        }
        .admin-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.14);
        }

        .admin-kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 16px;
        }

        .admin-kpi-card {
          background: #0f1523;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 16px 18px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .kpi-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .kpi-tag {
          font-size: 11.5px;
          font-weight: 500;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .kpi-icon-pill {
          width: 30px;
          height: 30px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .kpi-number {
          font-size: 24px;
          font-weight: 700;
          color: #f8fafc;
        }

        .kpi-meta {
          font-size: 12px;
        }

        .admin-layout-grid {
          display: grid;
          grid-template-columns: 66% calc(34% - 20px);
          gap: 20px;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .admin-layout-grid {
            grid-template-columns: 1fr;
          }
        }

        .admin-card {
          background: #0f1523;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 18px 20px;
        }

        .admin-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .admin-card-title {
          font-size: 15px;
          font-weight: 600;
          color: #f1f5f9;
        }

        .admin-card-desc {
          font-size: 12px;
          color: #94a3b8;
          margin-top: 2px;
        }

        .card-text-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #818cf8;
          background: none;
          border: none;
          cursor: pointer;
        }
        .card-text-link:hover {
          color: #a5b4fc;
          text-decoration: underline;
        }

        .module-card-box {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          padding: 14px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .module-card-box:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.14);
          transform: translateY(-1px);
        }

        .module-icon-wrap {
          width: 32px;
          height: 32px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .module-badge {
          font-size: 10.5px;
          font-weight: 600;
          color: #94a3b8;
          background: rgba(255, 255, 255, 0.05);
          padding: 2px 7px;
          border-radius: 5px;
        }

        .module-card-name {
          font-size: 13.5px;
          font-weight: 600;
          color: #f8fafc;
          margin-top: 10px;
        }

        .module-card-detail {
          font-size: 11.5px;
          color: #94a3b8;
          margin-top: 3px;
          line-height: 1.4;
        }

        .cohort-item {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .cohort-level {
          font-size: 11px;
          color: #94a3b8;
        }
        .cohort-val {
          font-size: 14px;
          font-weight: 700;
          color: #f1f5f9;
        }
        .cohort-sub {
          font-size: 10.5px;
          color: #64748b;
        }

        .task-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 7px;
        }
        .task-row.task-done {
          opacity: 0.6;
        }
        .task-check-circle {
          width: 18px;
          height: 18px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .done-circle {
          background: #10b981;
          color: #ffffff;
        }
        .pending-circle {
          border: 1.5px solid rgba(255, 255, 255, 0.2);
        }
        .task-title {
          font-size: 12px;
          font-weight: 500;
          color: #e2e8f0;
        }
        .task-time {
          font-size: 10.5px;
          color: #94a3b8;
        }

        .quick-action-tile {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 9px 11px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 7px;
          font-size: 12px;
          font-weight: 500;
          color: #cbd5e1;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .quick-action-tile:hover {
          background: rgba(255, 255, 255, 0.07);
          color: #ffffff;
        }

        .activity-row {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 6px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }
        .activity-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #818cf8;
          margin-top: 5px;
          flex-shrink: 0;
        }
        .activity-text {
          font-size: 11.5px;
          color: #e2e8f0;
          line-height: 1.4;
        }
        .activity-time {
          font-size: 10px;
          color: #94a3b8;
        }
      `}</style>
    </AppLayout>
  );
}