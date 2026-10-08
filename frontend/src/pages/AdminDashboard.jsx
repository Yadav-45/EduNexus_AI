import React, { useEffect, useState } from "react";
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
  Bot,
  ArrowRight,
  TrendingUp,
  Activity,
  ShieldCheck,
} from "lucide-react";

function AdminDashboard() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await api.get("/users");
        setUsers(response.data);
      } catch (error) {
        console.error("Unable to load users:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const getCount = (role) => {
    return users.filter((user) => user.role === role).length;
  };

  const activeUsers = users.filter((user) => user.is_active).length;

  const modules = [
    {
      icon: GraduationCap,
      title: "Students Management",
      description: "Manage 360° student records, enrollment, sections, profiles, and attendance records.",
      path: "/students",
      color: "#6366f1",
    },
    {
      icon: Briefcase,
      title: "Staff & Human Resources",
      description: "Comprehensive faculty directory, payroll generation, biometric attendance, and performance.",
      path: "/staff",
      color: "#3b82f6",
    },
    {
      icon: UserCheck,
      title: "Admissions Pipeline",
      description: "Automated candidate onboarding, application review workflows, and enrollment status.",
      path: "/admissions",
      color: "#06b6d4",
    },
    {
      icon: CalendarCheck,
      title: "Daily Attendance Engine",
      description: "Real-time presence logging, automated absenteeism notices, and institutional reports.",
      path: "/attendance",
      color: "#10b981",
    },
    {
      icon: CreditCard,
      title: "Fee & Billing Control",
      description: "Student ledgers, outstanding balances, late fine rules, and audited digital fee receipts.",
      path: "/fees",
      color: "#f59e0b",
    },
    {
      icon: BookOpen,
      title: "Academic Operations",
      description: "Curriculum oversight, syllabus distribution, assignment scoring, and semester schedules.",
      path: "/courses",
      color: "#a855f7",
    },
    {
      icon: MessageSquare,
      title: "Notice & Messaging Desk",
      description: "Broadcast emergency announcements, class circulations, and targeted parent notifications.",
      path: "/communication",
      color: "#ec4899",
    },
    {
      icon: FolderOpen,
      title: "Document Vault",
      description: "Encrypted institutional file depository, certificates, verification, and archive storage.",
      path: "/documents",
      color: "#8b5cf6",
    },
    {
      icon: Bot,
      title: "AI Neural Copilot",
      description: "Conversational machine intelligence querying operational data, metrics, and academic forecasts.",
      path: "/ai-tutor",
      color: "#14b8a6",
    },
  ];

  return (
    <AppLayout
      title="Administrative Command Center"
      subtitle="Institutional orchestration, identity controls, and operational workflows"
    >
      <div className="admin-page-container">
        {/* KPI Banner Grid */}
        <section className="kpi-grid">
          <KpiCard
            icon={Users}
            label="Total Accounts"
            value={loading ? "..." : users.length}
            note="Registered records"
            color="#6366f1"
          />
          <KpiCard
            icon={GraduationCap}
            label="Enrolled Students"
            value={loading ? "..." : getCount("STUDENT")}
            note="Active learners"
            color="#06b6d4"
          />
          <KpiCard
            icon={Briefcase}
            label="Faculty & Staff"
            value={loading ? "..." : getCount("TEACHER")}
            note="Instructional staff"
            color="#a855f7"
          />
          <KpiCard
            icon={ShieldCheck}
            label="Parents Connected"
            value={loading ? "..." : getCount("PARENT")}
            note="Guardian portals"
            color="#f59e0b"
          />
          <KpiCard
            icon={Activity}
            label="Active Sessions"
            value={loading ? "..." : activeUsers}
            note="Authenticated"
            color="#10b981"
          />
        </section>

        {/* Core Operations Section */}
        <section className="operations-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">Institutional Systems</h2>
              <p className="section-desc">Direct access to core administrative operational modules</p>
            </div>
            <div className="live-status-pill">
              <span className="live-dot" />
              <span>All Systems Operational</span>
            </div>
          </div>

          <div className="modules-grid">
            {modules.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.title}
                  onClick={() => navigate(m.path)}
                  className="module-card"
                >
                  <div className="module-top">
                    <div
                      className="module-icon-box"
                      style={{
                        background: `${m.color}1a`,
                        color: m.color,
                        borderColor: `${m.color}33`,
                      }}
                    >
                      <Icon size={22} />
                    </div>
                    <ArrowRight size={18} className="module-arrow" />
                  </div>

                  <h3 className="module-name">{m.title}</h3>
                  <p className="module-desc">{m.description}</p>

                  <div className="module-action-row">
                    <span className="module-link-text">Launch Module</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <style>{`
        .admin-page-container {
          display: flex;
          flex-direction: column;
          gap: 32px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 18px;
        }

        .kpi-card {
          background: #111726;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .kpi-card:hover {
          border-color: rgba(255, 255, 255, 0.16);
          transform: translateY(-2px);
          box-shadow: 0 8px 26px rgba(0, 0, 0, 0.6);
        }

        .kpi-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .kpi-icon-box {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid transparent;
        }

        .kpi-label {
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .kpi-value {
          font-family: 'Outfit', sans-serif;
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #ffffff;
          margin: 0;
        }

        .kpi-note {
          font-size: 12px;
          color: #64748b;
        }

        .operations-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .section-title {
          font-family: 'Outfit', sans-serif;
          font-size: 20px;
          font-weight: 700;
          margin: 0;
          color: #ffffff;
        }

        .section-desc {
          font-size: 13.5px;
          color: #64748b;
          margin: 4px 0 0;
        }

        .live-status-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.25);
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 600;
          color: #34d399;
        }

        .live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
        }

        .modules-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 20px;
        }

        .module-card {
          background: #111726;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 24px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .module-card:hover {
          border-color: rgba(99, 102, 241, 0.4);
          background: #151d30;
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6), 0 0 24px rgba(99, 102, 241, 0.15);
        }

        .module-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .module-icon-box {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid;
        }

        .module-arrow {
          color: #64748b;
          transition: all 0.2s;
        }

        .module-card:hover .module-arrow {
          color: #818cf8;
          transform: translateX(4px);
        }

        .module-name {
          font-family: 'Outfit', sans-serif;
          font-size: 17px;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
        }

        .module-desc {
          font-size: 13px;
          line-height: 1.55;
          color: #94a3b8;
          margin: 0;
          flex: 1;
        }

        .module-action-row {
          margin-top: 8px;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .module-link-text {
          font-size: 12.5px;
          font-weight: 600;
          color: #818cf8;
        }

        .module-card:hover .module-link-text {
          color: #a5b4fc;
        }
      `}</style>
    </AppLayout>
  );
}

function KpiCard({ icon: Icon, label, value, note, color }) {
  return (
    <div className="kpi-card">
      <div className="kpi-header">
        <span className="kpi-label">{label}</span>
        <div
          className="kpi-icon-box"
          style={{
            background: `${color}18`,
            color: color,
            borderColor: `${color}30`,
          }}
        >
          <Icon size={18} />
        </div>
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-note">{note}</div>
    </div>
  );
}

export default AdminDashboard;