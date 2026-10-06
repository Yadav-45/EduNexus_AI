import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";

function OwnerDashboard() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const response = await api.get("/users");

      const data = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.items)
          ? response.data.items
          : [];

      setUsers(data);
    } catch (error) {
      console.error("Unable to load users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    localStorage.removeItem("user_role");

    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user_role");

    navigate("/", { replace: true });
  }

  const totalUsers = users.length;

  const totalStudents = users.filter(
    (user) => user.role === "STUDENT"
  ).length;

  const totalTeachers = users.filter(
    (user) => user.role === "TEACHER"
  ).length;

  const totalParents = users.filter(
    (user) => user.role === "PARENT"
  ).length;

  const activeUsers = users.filter(
    (user) => user.is_active
  ).length;

  /*
   * All currently implemented EduNexus AI modules.
   *
   * These routes correspond to the modules already built
   * in the frontend.
   */
  const modules = [
    {
      title: "Student Management",
      description:
        "Manage student profiles, admissions, classes and complete student records.",
      action: () => navigate("/students"),
      button: "Open Students",
    },
    {
      title: "Parent Management",
      description:
        "Manage parents and guardians, contact information and family records.",
      action: () => navigate("/parents"),
      button: "Open Parents",
    },
    {
      title: "User Management",
      description:
        "Create and manage administrators, teachers, parents and student accounts.",
      action: () => navigate("/users"),
      button: "Open Users",
    },
    {
      title: "Attendance",
      description:
        "Mark daily attendance and review present, absent, late and leave records.",
      action: () => navigate("/attendance"),
      button: "Open Attendance",
    },
    {
      title: "Teachers & Staff",
      description:
        "Manage teacher and staff profiles, roles, assignments and employment records.",
      action: () => navigate("/staff"),
      button: "Open Staff",
    },
    {
      title: "Staff Attendance",
      description:
        "Manage staff attendance, check-in, check-out and attendance records.",
      action: () => navigate("/staff-attendance"),
      button: "Open Staff Attendance",
    },
    {
      title: "Staff Leave",
      description:
        "Manage staff leave applications, approvals, leave types and leave history.",
      action: () => navigate("/staff-leave"),
      button: "Open Staff Leave",
    },
    {
      title: "Staff Payroll",
      description:
        "Manage monthly payroll, salaries, deductions, allowances and payments.",
      action: () => navigate("/staff-payroll"),
      button: "Open Payroll",
    },
    {
      title: "Payroll Reports",
      description:
        "Generate and review staff payroll reports and payslip records.",
      action: () => navigate("/payroll-reports"),
      button: "Open Payroll Reports",
    },
    {
      title: "Staff Performance",
      description:
        "Track staff performance evaluations, reviews and performance records.",
      action: () => navigate("/staff-performance"),
      button: "Open Performance",
    },
    {
      title: "Admissions",
      description:
        "Manage student applications, admission processing and enrollment.",
      action: () => navigate("/admissions"),
      button: "Open Admissions",
    },
    {
      title: "Fees & Finance",
      description:
        "Manage student fees, fee accounts, payments, receipts and financial operations.",
      action: () => navigate("/fees"),
      button: "Open Fees",
    },
    {
      title: "Accounting",
      description:
        "Manage school accounting and financial management operations.",
      action: () => navigate("/accounting"),
      button: "Open Accounting",
    },
    {
      title: "Communication",
      description:
        "Manage notices, announcements and school communication.",
      action: () => navigate("/communication"),
      button: "Open Communication",
    },
    {
      title: "Transport",
      description:
        "Manage routes, vehicles and student transportation assignments.",
      action: () => navigate("/transport"),
      button: "Open Transport",
    },
    {
      title: "Inventory",
      description:
        "Manage school assets, inventory, stock and supplies.",
      action: () => navigate("/inventory"),
      button: "Open Inventory",
    },
    {
      title: "Documents",
      description:
        "Manage student and school documents from one centralized system.",
      action: () => navigate("/documents"),
      button: "Open Documents",
    },
    {
      title: "Analytics",
      description:
        "View school performance, operational metrics and management analytics.",
      action: () => navigate("/analytics"),
      button: "Open Analytics",
    },
    {
      title: "Courses",
      description:
        "Manage courses, subjects and academic course information.",
      action: () => navigate("/courses"),
      button: "Open Courses",
    },
    {
      title: "Learning",
      description:
        "Access the school's learning and academic content management system.",
      action: () => navigate("/learning"),
      button: "Open Learning",
    },
    {
      title: "Assignments",
      description:
        "Manage student assignments and academic work.",
      action: () => navigate("/assignments"),
      button: "Open Assignments",
    },
    {
      title: "Exams",
      description:
        "Manage examinations, schedules and academic examination records.",
      action: () => navigate("/academic/exams"),
      button: "Open Exams",
    },
    {
      title: "Exam Papers",
      description:
        "Manage exam papers, subjects, marks, schedules and publication status.",
      action: () => navigate("/academic/exam-papers"),
      button: "Open Exam Papers",
    },
    {
      title: "Exam Results",
      description:
        "Manage student examination results, marks and academic performance.",
      action: () => navigate("/academic/exam-results"),
      button: "Open Exam Results",
    },
    {
      title: "AI School Copilot",
      description:
        "Use AI-powered school insights and management assistance.",
      action: () => navigate("/ai-tutor"),
      button: "Open AI Copilot",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
        color: "#101828",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #eaecf0",
          padding: "18px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "13px",
              color: "#667085",
              marginBottom: "4px",
            }}
          >
            EduNexus AI
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: 700,
            }}
          >
            Owner Dashboard
          </h1>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <button
            onClick={() => navigate("/profile")}
            style={{
              border: "1px solid #d0d5dd",
              background: "#ffffff",
              color: "#344054",
              padding: "10px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            My Profile
          </button>

          <button
            onClick={handleLogout}
            style={{
              border: "1px solid #fecaca",
              background: "#fff5f5",
              color: "#b42318",
              padding: "10px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "32px",
        }}
      >
        {/* OVERVIEW */}
        <div style={{ marginBottom: "28px" }}>
          <h2
            style={{
              margin: 0,
              fontSize: "22px",
            }}
          >
            School Overview
          </h2>

          <p
            style={{
              margin: "6px 0 0",
              color: "#667085",
            }}
          >
            Manage your school's operations from one place.
          </p>
        </div>

        {/* STATISTICS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(190px, 1fr))",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <StatCard
            title="Total Users"
            value={loading ? "..." : totalUsers}
          />

          <StatCard
            title="Student Accounts"
            value={loading ? "..." : totalStudents}
          />

          <StatCard
            title="Teachers"
            value={loading ? "..." : totalTeachers}
          />

          <StatCard
            title="Parents"
            value={loading ? "..." : totalParents}
          />

          <StatCard
            title="Active Users"
            value={loading ? "..." : activeUsers}
          />
        </div>

        {/* QUICK ACCESS */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ marginBottom: "18px" }}>
            <h2
              style={{
                margin: 0,
                fontSize: "20px",
              }}
            >
              Quick Access
            </h2>

            <p
              style={{
                margin: "6px 0 0",
                color: "#667085",
                fontSize: "14px",
              }}
            >
              Quickly open the most frequently used operational modules.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "18px",
            }}
          >
            <QuickAccessCard
              title="Student Management"
              description="Manage students and open Student 360."
              button="Open Students"
              onClick={() => navigate("/students")}
            />

            <QuickAccessCard
              title="Parent Management"
              description="Manage parents and family relationships."
              button="Open Parents"
              onClick={() => navigate("/parents")}
            />

            <QuickAccessCard
              title="Attendance Management"
              description="Mark and review daily student attendance."
              button="Open Attendance"
              onClick={() => navigate("/attendance")}
            />

            <QuickAccessCard
              title="User Management"
              description="Manage school user accounts and roles."
              button="Open Users"
              onClick={() => navigate("/users")}
            />

            <QuickAccessCard
              title="Admissions"
              description="Manage student applications and enrollment."
              button="Open Admissions"
              onClick={() => navigate("/admissions")}
            />

            <QuickAccessCard
              title="Fees & Finance"
              description="Manage fees, payments and receipts."
              button="Open Fees"
              onClick={() => navigate("/fees")}
            />
          </div>
        </div>

        {/* SCHOOL OPERATIONS */}
        <div>
          <div style={{ marginBottom: "18px" }}>
            <h2
              style={{
                margin: 0,
                fontSize: "20px",
              }}
            >
              School Operations
            </h2>

            <p
              style={{
                margin: "6px 0 0",
                color: "#667085",
                fontSize: "14px",
              }}
            >
              Access all currently available EduNexus AI management modules.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "18px",
            }}
          >
            {modules.map((module) => (
              <ModuleCard
                key={module.title}
                title={module.title}
                description={module.description}
                button={module.button}
                onClick={module.action}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

/* QUICK ACCESS CARD */

function QuickAccessCard({
  title,
  description,
  button,
  onClick,
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #dbeafe",
        borderRadius: "12px",
        padding: "20px",
        boxShadow:
          "0 2px 5px rgba(37, 99, 235, 0.06)",
      }}
    >
      <div
        style={{
          color: "#2563eb",
          fontSize: "12px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          marginBottom: "7px",
        }}
      >
        Available
      </div>

      <h3
        style={{
          margin: "0 0 8px",
          fontSize: "17px",
          color: "#101828",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: "0 0 16px",
          color: "#667085",
          fontSize: "14px",
          lineHeight: 1.5,
          minHeight: "42px",
        }}
      >
        {description}
      </p>

      <button
        onClick={onClick}
        style={{
          border: "none",
          background: "#2563eb",
          color: "#ffffff",
          padding: "9px 14px",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: 600,
          fontSize: "13px",
        }}
      >
        {button}
      </button>
    </div>
  );
}

/* MODULE CARD */

function ModuleCard({
  title,
  description,
  button,
  onClick,
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #eaecf0",
        borderRadius: "12px",
        padding: "22px",
        boxShadow:
          "0 1px 2px rgba(16, 24, 40, 0.04)",
        transition:
          "transform 0.15s ease, box-shadow 0.15s ease",
      }}
    >
      <div
        style={{
          color: "#2563eb",
          fontSize: "11px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "8px",
        }}
      >
        Available
      </div>

      <h3
        style={{
          margin: "0 0 8px",
          fontSize: "17px",
        }}
      >
        {title}
      </h3>

      <p
        style={{
          margin: "0 0 18px",
          color: "#667085",
          fontSize: "14px",
          lineHeight: 1.6,
          minHeight: "66px",
        }}
      >
        {description}
      </p>

      <button
        onClick={onClick}
        style={{
          border: "none",
          background: "#2563eb",
          color: "#ffffff",
          padding: "9px 14px",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: 600,
          fontSize: "13px",
        }}
      >
        {button}
      </button>
    </div>
  );
}

/* STAT CARD */

function StatCard({ title, value }) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #eaecf0",
        borderRadius: "12px",
        padding: "20px",
        boxShadow:
          "0 1px 2px rgba(16, 24, 40, 0.04)",
      }}
    >
      <div
        style={{
          color: "#667085",
          fontSize: "13px",
          marginBottom: "8px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "28px",
          fontWeight: 700,
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default OwnerDashboard;
