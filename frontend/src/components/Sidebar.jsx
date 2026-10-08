import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  FileCheck2,
  Bot,
  CalendarCheck2,
  CreditCard,
  MessageSquare,
  Bus,
  Package,
  FolderOpen,
  BarChart3,
  ShieldAlert,
  LogOut,
  Sparkles,
  ChevronRight,
  Menu,
  X,
  UserCheck,
  Award,
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = localStorage.getItem("user_role") || "ADMIN";

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    localStorage.removeItem("user_role");
    navigate("/login");
  };

  const navGroups = [
    {
      label: "Overview",
      items: [
        {
          to: "/dashboard",
          label: "Student Portal",
          icon: LayoutDashboard,
        },
        {
          to: "/admin-dashboard",
          label: "Admin Hub",
          icon: ShieldAlert,
        },
        {
          to: "/owner-dashboard",
          label: "Executive Board",
          icon: Sparkles,
        },
      ],
    },
    {
      label: "Academic Management",
      items: [
        { to: "/students", label: "Students", icon: GraduationCap },
        { to: "/courses", label: "Courses", icon: BookOpen },
        { to: "/assignments", label: "Assignments", icon: FileCheck2 },
        { to: "/academic/exams", label: "Examinations", icon: Award },
        { to: "/ai-tutor", label: "AI Neural Tutor", icon: Bot },
      ],
    },
    {
      label: "Institutional Ops",
      items: [
        { to: "/admissions", label: "Admissions", icon: UserCheck },
        { to: "/attendance", label: "Attendance", icon: CalendarCheck2 },
        { to: "/staff", label: "Staff & Payroll", icon: Users },
        { to: "/communication", label: "Communication", icon: MessageSquare },
      ],
    },
    {
      label: "Finance & Operations",
      items: [
        { to: "/fees", label: "Fee Management", icon: CreditCard },
        { to: "/accounting", label: "Accounting", icon: BarChart3 },
        { to: "/documents", label: "Documents", icon: FolderOpen },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="mobile-header">
        <div className="mobile-brand">
          <div className="brand-logo">
            <Sparkles size={18} color="#ffffff" />
          </div>
          <span className="brand-title">EduNexus AI</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="mobile-toggle"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside className={`app-sidebar ${mobileOpen ? "open" : ""}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-logo">
            <Sparkles size={20} color="#ffffff" />
          </div>
          <div className="brand-text">
            <span className="brand-title">EduNexus AI</span>
            <span className="brand-badge">OS 2.0</span>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="sidebar-nav">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="nav-group">
              <div className="nav-group-label">{group.label}</div>
              <div className="nav-group-items">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    location.pathname === item.to ||
                    (item.to !== "/dashboard" &&
                      location.pathname.startsWith(item.to));

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={`nav-link ${isActive ? "active" : ""}`}
                    >
                      <div className="nav-icon-wrapper">
                        <Icon size={18} />
                      </div>
                      <span className="nav-text">{item.label}</span>
                      {isActive && <div className="nav-active-pill" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Card & Logout */}
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              {role.charAt(0).toUpperCase()}
            </div>
            <div className="user-meta">
              <span className="user-role-badge">{role}</span>
              <span className="user-status-text">Connected</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="sidebar-logout-btn"
            title="Log Out"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>

        <style>{`
          .mobile-header {
            display: none;
            align-items: center;
            justify-content: space-between;
            padding: 12px 20px;
            background: #0b0f19;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            position: sticky;
            top: 0;
            z-index: 99;
          }

          .mobile-brand {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .mobile-toggle {
            background: #172033;
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #f8fafc;
            width: 38px;
            height: 38px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          }

          .sidebar-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(4px);
            z-index: 998;
          }

          .app-sidebar {
            width: 260px;
            min-width: 260px;
            background: #090d16;
            border-right: 1px solid rgba(255, 255, 255, 0.07);
            height: 100vh;
            position: sticky;
            top: 0;
            display: flex;
            flex-direction: column;
            z-index: 999;
            box-shadow: 4px 0 24px rgba(0, 0, 0, 0.4);
          }

          .sidebar-brand {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 24px 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          }

          .brand-logo {
            width: 38px;
            height: 38px;
            border-radius: 10px;
            background: linear-gradient(135deg, #6366f1 0%, #3b82f6 50%, #06b6d4 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
          }

          .brand-text {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .brand-title {
            font-family: 'Outfit', sans-serif;
            font-size: 18px;
            font-weight: 700;
            letter-spacing: -0.02em;
            background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .brand-badge {
            background: rgba(99, 102, 241, 0.18);
            color: #818cf8;
            border: 1px solid rgba(99, 102, 241, 0.35);
            font-size: 10px;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 6px;
          }

          .sidebar-nav {
            flex: 1;
            overflow-y: auto;
            padding: 18px 14px;
            display: flex;
            flex-direction: column;
            gap: 18px;
          }

          .nav-group-label {
            font-family: 'Outfit', sans-serif;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #475569;
            padding: 0 10px 8px;
          }

          .nav-group-items {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .nav-link {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 12px;
            border-radius: 10px;
            color: #94a3b8;
            font-size: 13.5px;
            font-weight: 500;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            text-decoration: none;
          }

          .nav-link:hover {
            color: #f8fafc;
            background: rgba(255, 255, 255, 0.04);
            transform: translateX(2px);
          }

          .nav-link.active {
            color: #ffffff;
            background: linear-gradient(90deg, rgba(99, 102, 241, 0.16) 0%, rgba(6, 182, 212, 0.06) 100%);
            border: 1px solid rgba(99, 102, 241, 0.3);
            box-shadow: 0 4px 16px rgba(99, 102, 241, 0.15);
          }

          .nav-icon-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            transition: color 0.2s;
          }

          .nav-link.active .nav-icon-wrapper {
            color: #818cf8;
          }

          .nav-text {
            flex: 1;
          }

          .nav-active-pill {
            width: 5px;
            height: 16px;
            border-radius: 3px;
            background: #6366f1;
            box-shadow: 0 0 10px #6366f1;
          }

          .sidebar-footer {
            padding: 16px;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            background: #07090e;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .user-profile {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 6px 8px;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.02);
          }

          .user-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: linear-gradient(135deg, #4f46e5, #06b6d4);
            color: #ffffff;
            font-weight: 700;
            font-size: 13px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .user-meta {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .user-role-badge {
            font-size: 11px;
            font-weight: 700;
            color: #f8fafc;
            letter-spacing: 0.04em;
          }

          .user-status-text {
            font-size: 10px;
            color: #10b981;
            font-weight: 500;
          }

          .sidebar-logout-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
            padding: 9px 12px;
            background: rgba(244, 63, 94, 0.1);
            color: #fb7185;
            border: 1px solid rgba(244, 63, 94, 0.2);
            border-radius: 8px;
            font-size: 12.5px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .sidebar-logout-btn:hover {
            background: rgba(244, 63, 94, 0.2);
            border-color: rgba(244, 63, 94, 0.35);
            color: #ffffff;
          }

          @media (max-width: 900px) {
            .mobile-header {
              display: flex;
            }
            .app-sidebar {
              position: fixed;
              top: 0;
              bottom: 0;
              left: -280px;
              transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .app-sidebar.open {
              transform: translateX(280px);
            }
          }
        `}</style>
      </aside>
    </>
  );
}