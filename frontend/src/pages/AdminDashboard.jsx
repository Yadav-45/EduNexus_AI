import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

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
        console.error(
          "Unable to load users:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const getCount = (role) => {
    return users.filter(
      (user) => user.role === role
    ).length;
  };

  const activeUsers = users.filter(
    (user) => user.is_active
  ).length;

  const modules = [
    {
      icon: "👨‍🎓",
      title: "Students",
      description:
        "Manage student profiles, academic information, attendance, fees, and documents.",
      button: "Coming Soon",
    },
    {
      icon: "👩‍🏫",
      title: "Teachers & Staff",
      description:
        "View teaching staff, staff accounts, responsibilities, and school assignments.",
      button: "Coming Soon",
    },
    {
      icon: "📝",
      title: "Admissions",
      description:
        "Manage applications, admissions, enrollment, and student onboarding.",
      button: "Coming Soon",
    },
    {
      icon: "📅",
      title: "Attendance",
      description:
        "Monitor student and staff attendance across classes and sections.",
      button: "Coming Soon",
    },
    {
      icon: "💳",
      title: "Fees",
      description:
        "Manage student fee information, payment status, receipts, and outstanding balances.",
      button: "Coming Soon",
    },
    {
      icon: "📢",
      title: "Communication",
      description:
        "Manage notices, announcements, parent communication, and school messaging.",
      button: "Coming Soon",
    },
    {
      icon: "📚",
      title: "Academic Operations",
      description:
        "Manage classes, sections, courses, assignments, schedules, and academic activities.",
      button: "Coming Soon",
    },
    {
      icon: "🚌",
      title: "Transport",
      description:
        "View routes, vehicles, drivers, and student transport operations.",
      button: "Coming Soon",
    },
    {
      icon: "📦",
      title: "Inventory",
      description:
        "Track school assets, supplies, stock, and inventory movement.",
      button: "Coming Soon",
    },
    {
      icon: "📄",
      title: "Documents",
      description:
        "Manage student records, school documents, reports, and uploaded files.",
      button: "Coming Soon",
    },
    {
      icon: "📊",
      title: "Reports",
      description:
        "Generate operational reports for students, attendance, admissions, and school activities.",
      button: "Coming Soon",
    },
    {
      icon: "✦",
      title: "AI School Assistant",
      description:
        "Use AI to answer operational questions and help staff work with school information.",
      button: "Coming Soon",
    },
  ];

  return (
    <div className="admin-dashboard">
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
        }

        .admin-dashboard {
          min-height: 100vh;
          background: #f8fafc;
          color: #101828;
          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Arial,
            sans-serif;
        }

        .topbar {
          height: 72px;
          background: #ffffff;
          border-bottom: 1px solid #e4e7ec;
          padding: 0 36px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-mark {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            linear-gradient(
              135deg,
              #2563eb,
              #4f46e5
            );
          color: #ffffff;
          font-size: 17px;
          font-weight: 850;
        }

        .brand-name {
          font-size: 17px;
          font-weight: 850;
          letter-spacing: -0.4px;
        }

        .brand-name span {
          color: #2563eb;
        }

        .brand-caption {
          margin-top: 3px;
          color: #98a2b3;
          font-size: 8px;
          font-weight: 750;
          letter-spacing: 0.8px;
        }

        .role-badge {
          padding: 7px 11px;
          border-radius: 7px;
          background: #eff6ff;
          color: #1d4ed8;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .content {
          max-width: 1280px;
          margin: 0 auto;
          padding: 38px 36px 50px;
        }

        .welcome {
          margin-bottom: 28px;
        }

        .eyebrow {
          margin-bottom: 7px;
          color: #2563eb;
          font-size: 9px;
          font-weight: 850;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .title {
          margin: 0;
          font-size: 32px;
          line-height: 1.15;
          font-weight: 850;
          letter-spacing: -0.9px;
        }

        .subtitle {
          max-width: 720px;
          margin: 10px 0 0;
          color: #667085;
          font-size: 12px;
          line-height: 1.7;
        }

        .stats {
          display: grid;
          grid-template-columns:
            repeat(5, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 32px;
        }

        .stat {
          background: #ffffff;
          border: 1px solid #e4e7ec;
          border-radius: 12px;
          padding: 18px;
        }

        .stat-label {
          color: #667085;
          font-size: 8px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          margin-top: 8px;
          color: #101828;
          font-size: 24px;
          font-weight: 850;
        }

        .stat-note {
          margin-top: 4px;
          color: #98a2b3;
          font-size: 8px;
        }

        .section-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 15px;
        }

        .section-title {
          margin: 0;
          font-size: 15px;
          font-weight: 850;
        }

        .section-caption {
          color: #98a2b3;
          font-size: 9px;
        }

        .modules {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .module {
          background: #ffffff;
          border: 1px solid #e4e7ec;
          border-radius: 13px;
          padding: 20px;
          transition:
            transform 0.16s ease,
            box-shadow 0.16s ease,
            border-color 0.16s ease;
        }

        .module:hover {
          transform: translateY(-2px);
          border-color: #d7dce3;
          box-shadow:
            0 10px 28px
            rgba(16, 24, 40, 0.055);
        }

        .module-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: #eff6ff;
          font-size: 18px;
          margin-bottom: 13px;
        }

        .module-title {
          margin: 0;
          font-size: 14px;
          font-weight: 800;
        }

        .module-description {
          min-height: 45px;
          margin: 7px 0 0;
          color: #667085;
          font-size: 10px;
          line-height: 1.6;
        }

        .module-button {
          margin-top: 14px;
          padding: 8px 11px;
          border: 1px solid #d0d5dd;
          border-radius: 7px;
          background: #ffffff;
          color: #344054;
          font-size: 9px;
          font-weight: 750;
          cursor: pointer;
        }

        .module-button:hover {
          background: #f9fafb;
        }

        .module-button.primary {
          border-color: #2563eb;
          background: #2563eb;
          color: #ffffff;
        }

        .module-button.primary:hover {
          background: #1d4ed8;
        }

        @media (max-width: 1050px) {
          .stats {
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }

          .modules {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 650px) {
          .topbar {
            padding: 0 18px;
          }

          .content {
            padding: 28px 18px 40px;
          }

          .stats {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .modules {
            grid-template-columns: 1fr;
          }

          .title {
            font-size: 27px;
          }

          .role-badge {
            display: none;
          }
        }
      `}</style>

      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            E
          </div>

          <div>
            <div className="brand-name">
              edu<span>nexus.ai</span>
            </div>

            <div className="brand-caption">
              AI SCHOOL OPERATING SYSTEM
            </div>
          </div>
        </div>

        <div className="role-badge">
          Administrator
        </div>
      </header>

      <main className="content">
        <section className="welcome">
          <div className="eyebrow">
            Administrator Portal
          </div>

          <h1 className="title">
            School Administration
          </h1>

          <p className="subtitle">
            Manage students, staff, admissions,
            attendance, fees, communication, and
            day-to-day school operations from one
            central workspace.
          </p>
        </section>

        <section className="stats">
          <StatCard
            label="Total Users"
            value={
              loading ? "..." : users.length
            }
            note="School accounts"
          />

          <StatCard
            label="Students"
            value={
              loading
                ? "..."
                : getCount("STUDENT")
            }
            note="Student accounts"
          />

          <StatCard
            label="Teachers"
            value={
              loading
                ? "..."
                : getCount("TEACHER")
            }
            note="Teaching staff"
          />

          <StatCard
            label="Parents"
            value={
              loading
                ? "..."
                : getCount("PARENT")
            }
            note="Parent accounts"
          />

          <StatCard
            label="Active Users"
            value={
              loading ? "..." : activeUsers
            }
            note="Currently active"
          />
        </section>

        <section>
          <div className="section-heading">
            <h2 className="section-title">
              School Operations
            </h2>

            <span className="section-caption">
              Administrator workspace
            </span>
          </div>

          <div className="modules">
            {modules.map((module) => (
              <div
                className="module"
                key={module.title}
              >
                <div className="module-icon">
                  {module.icon}
                </div>

                <h3 className="module-title">
                  {module.title}
                </h3>

                <p className="module-description">
                  {module.description}
                </p>

                <button
                  className="module-button"
                  onClick={module.action}
                >
                  {module.button}
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  note,
}) {
  return (
    <div className="stat">
      <div className="stat-label">
        {label}
      </div>

      <div className="stat-value">
        {value}
      </div>

      <div className="stat-note">
        {note}
      </div>
    </div>
  );
}

export default AdminDashboard;