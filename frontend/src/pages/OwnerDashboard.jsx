import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import api from "../api/axios";
import {
  Users,
  GraduationCap,
  Briefcase,
  HeartHandshake,
  CheckCircle2,
  TrendingUp,
  Cpu,
  CreditCard,
  Building2,
  CalendarCheck,
  FileSpreadsheet,
  Bus,
  Package,
  FileText,
  BarChart3,
  BookOpen,
  Award,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Search,
  ExternalLink
} from "lucide-react";

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moduleSearch, setModuleSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const response = await api.get("/users");
      const data = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.items)
          ? response.data.items
          : [];
      setUsers(data);
    } catch (error) {
      console.error("Unable to load user registry:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  const totalUsers = users.length;
  const totalStudents = users.filter((u) => u.role === "STUDENT").length;
  const totalTeachers = users.filter((u) => u.role === "TEACHER").length;
  const totalParents = users.filter((u) => u.role === "PARENT").length;
  const activeUsers = users.filter((u) => u.is_active).length;

  const moduleCatalog = [
    // Academics
    {
      category: "ACADEMICS",
      title: "Student Management",
      description: "Institutional rosters, admissions, class cohorts and student 360 dossiers.",
      path: "/students",
      icon: GraduationCap,
      color: "var(--accent-indigo)",
    },
    {
      category: "ACADEMICS",
      title: "Attendance Ledger",
      description: "Daily automated presence tracking, biometric status, and absence logs.",
      path: "/attendance",
      icon: CalendarCheck,
      color: "var(--accent-cyan)",
    },
    {
      category: "ACADEMICS",
      title: "Admissions & Intake",
      description: "Applicant processing pipeline, entrance evaluation, and cohort enrollment.",
      path: "/admissions",
      icon: Users,
      color: "var(--accent-purple)",
    },
    {
      category: "ACADEMICS",
      title: "Course Catalog",
      description: "Curriculum modules, subject master records, syllabus tracking.",
      path: "/courses",
      icon: BookOpen,
      color: "var(--accent-indigo)",
    },
    {
      category: "ACADEMICS",
      title: "Learning Engine",
      description: "Interactive digital lessons, student study materials, and assessments.",
      path: "/learning",
      icon: Sparkles,
      color: "var(--accent-cyan)",
    },
    {
      category: "ACADEMICS",
      title: "Examinations & Marks",
      description: "Term tests, automated paper generator, grading rubrics, and marks ledger.",
      path: "/academic/exams",
      icon: Award,
      color: "var(--accent-emerald)",
    },

    // Staff & HR
    {
      category: "HR_STAFF",
      title: "Staff & Faculty Roster",
      description: "Faculty dossiers, employment designations, subject allocations, and tenure.",
      path: "/staff",
      icon: Briefcase,
      color: "var(--accent-indigo)",
    },
    {
      category: "HR_STAFF",
      title: "Staff Attendance",
      description: "Clock-in records, shift management, and biometric validation logs.",
      path: "/staff-attendance",
      icon: CalendarCheck,
      color: "var(--accent-cyan)",
    },
    {
      category: "HR_STAFF",
      title: "Leave Approvals",
      description: "Paid leave allocations, vacation requests, and executive approvals.",
      path: "/staff-leave",
      icon: FileSpreadsheet,
      color: "var(--accent-purple)",
    },
    {
      category: "HR_STAFF",
      title: "Payroll & Salaries",
      description: "Automated monthly payroll, tax deductions, pay-slips, and direct deposits.",
      path: "/staff-payroll",
      icon: CreditCard,
      color: "var(--accent-emerald)",
    },
    {
      category: "HR_STAFF",
      title: "Performance Analytics",
      description: "Faculty review matrix, peer feedback, and operational KPIs.",
      path: "/staff-performance",
      icon: TrendingUp,
      color: "var(--accent-amber)",
    },

    // Treasury & Operations
    {
      category: "FINANCE_OPS",
      title: "Fees & Collections",
      description: "Tuition collection gateway, outstanding dues, invoices, and receipts.",
      path: "/fees",
      icon: CreditCard,
      color: "var(--accent-emerald)",
    },
    {
      category: "FINANCE_OPS",
      title: "Institutional Accounts",
      description: "General ledger, vendor expenses, balance sheets, and tax compliance.",
      path: "/accounting",
      icon: Building2,
      color: "var(--accent-cyan)",
    },
    {
      category: "FINANCE_OPS",
      title: "Fleet & Transport",
      description: "Bus fleet tracking, route telemetry, driver schedules, and pickup points.",
      path: "/transport",
      icon: Bus,
      color: "var(--accent-amber)",
    },
    {
      category: "FINANCE_OPS",
      title: "Assets & Inventory",
      description: "Campus equipment, laboratory instruments, books, and stock depletion.",
      path: "/inventory",
      icon: Package,
      color: "var(--accent-purple)",
    },
    {
      category: "FINANCE_OPS",
      title: "Document Vault",
      description: "Digital certificates, identity verifications, and compliance storage.",
      path: "/documents",
      icon: FileText,
      color: "var(--accent-indigo)",
    },

    // Intelligence & Administration
    {
      category: "AI_ADMIN",
      title: "AI Neural Copilot",
      description: "Autonomous academic assistant, lesson generator, and student advisory bot.",
      path: "/ai-tutor",
      icon: Cpu,
      color: "var(--accent-cyan)",
    },
    {
      category: "AI_ADMIN",
      title: "Executive Analytics",
      description: "Enterprise operational intelligence, enrollment projections, and retention graphs.",
      path: "/analytics",
      icon: BarChart3,
      color: "var(--accent-indigo)",
    },
    {
      category: "AI_ADMIN",
      title: "Parent Portal Bridge",
      description: "Family contacts, automated SMS broadcast alerts, and parent accounts.",
      path: "/parents",
      icon: HeartHandshake,
      color: "var(--accent-purple)",
    },
    {
      category: "AI_ADMIN",
      title: "Identity & Access (IAM)",
      description: "User authentication credentials, RBAC permissions, and session security.",
      path: "/users",
      icon: Users,
      color: "var(--accent-emerald)",
    },
  ];

  const filteredModules = useMemo(() => {
    return moduleCatalog.filter((mod) => {
      const matchesSearch =
        !moduleSearch ||
        mod.title.toLowerCase().includes(moduleSearch.toLowerCase()) ||
        mod.description.toLowerCase().includes(moduleSearch.toLowerCase());
      const matchesCategory =
        selectedCategory === "ALL" || mod.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [moduleCatalog, moduleSearch, selectedCategory]);

  return (
    <AppLayout
      title="Executive Command Deck"
      subtitle="Autonomous institutional oversight, financial metrics, and operational control."
      actions={
        <button
          onClick={() => navigate("/ai-tutor")}
          className="btn btn-primary"
          style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
        >
          <Cpu size={16} />
          Launch AI Copilot
        </button>
      }
    >
      {/* ENTERPRISE KPI CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "11.5px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
              Total Network Users
            </span>
            <Users size={18} style={{ color: "var(--accent-indigo)" }} />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-bright)" }}>
            {loading ? "..." : totalUsers}
          </div>
          <div style={{ fontSize: "12px", color: "var(--accent-emerald)", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
            <TrendingUp size={13} /> {activeUsers} Active now
          </div>
        </div>

        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "11.5px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
              Enrolled Scholars
            </span>
            <GraduationCap size={18} style={{ color: "var(--accent-cyan)" }} />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--accent-cyan)" }}>
            {loading ? "..." : totalStudents}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Active student accounts
          </div>
        </div>

        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "11.5px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
              Faculty Members
            </span>
            <Briefcase size={18} style={{ color: "var(--accent-purple)" }} />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--accent-purple)" }}>
            {loading ? "..." : totalTeachers}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Teaching & educators
          </div>
        </div>

        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "11.5px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
              Parent Network
            </span>
            <HeartHandshake size={18} style={{ color: "var(--accent-emerald)" }} />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--accent-emerald)" }}>
            {loading ? "..." : totalParents}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Linked guardians
          </div>
        </div>
      </div>

      {/* QUICK COMMAND LAUNCHPAD */}
      <div
        className="card"
        style={{
          padding: "20px 24px",
          marginBottom: "28px",
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(6, 182, 212, 0.04) 100%)",
          border: "1px solid rgba(99, 102, 241, 0.2)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <Sparkles size={16} style={{ color: "var(--accent-cyan)" }} />
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--text-bright)" }}>
                EduNexus Intelligence Hub
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)" }}>
              Direct access to vital operational controls, student directory, automated payroll, and financial telemetry.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/students")}
              className="btn btn-secondary"
              style={{ fontSize: "13px" }}
            >
              Students (360°)
            </button>
            <button
              onClick={() => navigate("/staff-payroll")}
              className="btn btn-secondary"
              style={{ fontSize: "13px" }}
            >
              Run Payroll
            </button>
            <button
              onClick={() => navigate("/fees")}
              className="btn btn-secondary"
              style={{ fontSize: "13px" }}
            >
              Fee Gateways
            </button>
            <button
              onClick={() => navigate("/analytics")}
              className="btn btn-secondary"
              style={{ fontSize: "13px" }}
            >
              Performance Graphs
            </button>
          </div>
        </div>
      </div>

      {/* MODULE DIRECTORY HEADER & FILTERS */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {[
            { id: "ALL", label: "All Modules" },
            { id: "ACADEMICS", label: "Academics" },
            { id: "HR_STAFF", label: "Faculty & Staff" },
            { id: "FINANCE_OPS", label: "Finance & Operations" },
            { id: "AI_ADMIN", label: "AI & System IAM" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "12.5px",
                fontWeight: 600,
                cursor: "pointer",
                border: selectedCategory === cat.id ? "1px solid var(--accent-indigo)" : "1px solid var(--border-default)",
                background: selectedCategory === cat.id ? "rgba(99, 102, 241, 0.15)" : "var(--bg-surface)",
                color: selectedCategory === cat.id ? "var(--accent-indigo-light)" : "var(--text-secondary)",
                transition: "all 0.15s ease",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div style={{ position: "relative", minWidth: "260px" }}>
          <Search
            size={15}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
            }}
          />
          <input
            type="text"
            placeholder="Search enterprise modules..."
            value={moduleSearch}
            onChange={(e) => setModuleSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: "36px", height: "38px", fontSize: "13px" }}
          />
        </div>
      </div>

      {/* MODULES GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
          gap: "18px",
        }}
      >
        {filteredModules.map((mod) => {
          const Icon = mod.icon;
          return (
            <div
              key={mod.title}
              className="card"
              onClick={() => navigate(mod.path)}
              style={{
                padding: "20px",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                transition: "transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.35)";
                e.currentTarget.style.boxShadow = "0 12px 30px rgba(0, 0, 0, 0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "var(--border-default)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid var(--border-default)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: mod.color,
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <ArrowUpRight size={17} style={{ color: "var(--text-muted)" }} />
                </div>

                <h4 style={{ margin: "0 0 6px", fontSize: "15.5px", fontWeight: 700, color: "var(--text-bright)" }}>
                  {mod.title}
                </h4>
                <p style={{ margin: 0, fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {mod.description}
                </p>
              </div>

              <div
                style={{
                  marginTop: "16px",
                  paddingTop: "12px",
                  borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    color: "var(--accent-cyan)",
                    textTransform: "uppercase",
                  }}
                >
                  Active System
                </span>
                <span style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-muted)" }}>
                  Open Module →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
