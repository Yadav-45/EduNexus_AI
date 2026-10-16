import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import {
  Sparkles,
  Bell,
  Calendar,
  GraduationCap,
  ShieldAlert,
  Crown,
  X,
  ExternalLink,
  ChevronDown,
} from "lucide-react";

export default function AppLayout({ children, title, subtitle, actions }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: 1,
      tag: "अत्यावश्यक (URGENT)",
      type: "danger",
      text: "काठमाडौँ जिल्ला प्रशासन: भारी वर्षा सम्बन्धी पूर्वसूचना - हाइब्रिड कक्षा सञ्चालन।",
      time: "आज बिहान ८:१५",
    },
    {
      id: 2,
      tag: "परीक्षा (EXAM)",
      type: "warning",
      text: "कक्षा ११ र १२ को NEB दर्ता फारम तथा CDC आन्तरिक मूल्याङ्कन बुझाउने म्याद: कात्तिक १५ गते।",
      time: "२ घण्टा अगाडि",
    },
    {
      id: 3,
      tag: "चाडपर्व (FESTIVAL)",
      type: "success",
      text: "बडादशैं तथा तिहार बिदा आश्विन २८ देखि कात्तिक १४ सम्म हुनेछ।",
      time: "हिजो",
    },
  ];

  return (
    <div className="layout-root">
      <Sidebar />
      <div className="layout-viewport">
        {/* Top Header Bar */}
        <header className="layout-topbar">
          <div className="topbar-left">
            {title && <h1 className="topbar-title">{title}</h1>}
            {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
          </div>

          <div className="topbar-right">
            {/* Quick Portal Switcher Pills */}
            <div className="topbar-portals-pills">
              <Link
                to="/dashboard"
                className={`portal-pill ${
                  location.pathname === "/dashboard" ? "active" : ""
                }`}
                title="Student Academic Learning Portal"
              >
                <GraduationCap size={13} />
                <span>विद्यार्थी (Student)</span>
              </Link>

              <Link
                to="/admin-dashboard"
                className={`portal-pill ${
                  location.pathname === "/admin-dashboard" ? "active" : ""
                }`}
                title="Institutional Administration Hub"
              >
                <ShieldAlert size={13} />
                <span>प्रशासन (Admin)</span>
              </Link>

              <Link
                to="/owner-dashboard"
                className={`portal-pill ${
                  location.pathname === "/owner-dashboard" ? "active" : ""
                }`}
                title="Executive Board Command Deck"
              >
                <Crown size={13} />
                <span>बोर्ड अध्यक्ष (Owner)</span>
              </Link>
            </div>

            {/* Nepal Patro Date Pill */}
            <div className="nepal-patro-pill" title="नेपाल संवत् तथा विक्रम संवत् (Nepal Standard Time)">
              <Calendar size={13} className="text-amber" />
              <span>वि.सं. २०८१ आश्विन २४</span>
            </div>

            {/* Custom Page Actions if passed */}
            {actions}

            {/* Notifications Bell Dropdown */}
            <div className="notifications-wrap">
              <button
                className="notification-bell-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                title="School Circulars & Emergency Notices"
              >
                <Bell size={16} />
                <span className="bell-badge">3</span>
              </button>

              {showNotifications && (
                <div className="notifications-dropdown">
                  <div className="notif-header">
                    <div className="notif-title-row">
                      <Bell size={14} className="text-cyan" />
                      <strong>विद्यालय सूचना केन्द्र (Circulars)</strong>
                    </div>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="notif-close-btn"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="notif-list">
                    {notifications.map((n) => (
                      <div key={n.id} className="notif-item">
                        <div className="notif-item-top">
                          <span className={`notif-tag tag-${n.type}`}>
                            {n.tag}
                          </span>
                          <span className="notif-time">{n.time}</span>
                        </div>
                        <p className="notif-text">{n.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="notif-footer">
                    <Link
                      to="/communication"
                      onClick={() => setShowNotifications(false)}
                      className="notif-view-all"
                    >
                      <span>सबै सूचनाहरू हेर्नुहोस् (Notice Desk)</span>
                      <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* AI Status Indicator */}
            <div className="ai-status-indicator">
              <span className="pulse-dot"></span>
              <Sparkles size={14} className="sparkle-icon" />
              <span>Neural Engine Online</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="layout-content">{children}</main>
      </div>

      <style>{`
        .layout-root {
          display: flex;
          min-height: 100vh;
          background: #07090e;
          color: #f8fafc;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .layout-viewport {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          background: #07090e;
        }

        .layout-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 32px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
          background: rgba(11, 15, 25, 0.85);
          backdrop-filter: blur(14px);
          position: sticky;
          top: 0;
          z-index: 50;
          gap: 16px;
          flex-wrap: wrap;
        }

        .topbar-left {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .topbar-title {
          font-family: 'Outfit', sans-serif;
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 0;
          color: #f8fafc;
        }

        .topbar-subtitle {
          font-size: 12.5px;
          color: #94a3b8;
          margin: 0;
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .topbar-portals-pills {
          display: inline-flex;
          background: rgba(255, 255, 255, 0.04);
          padding: 3px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          gap: 3px;
        }

        .portal-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 11px;
          border-radius: 7px;
          font-size: 11.5px;
          font-weight: 600;
          color: #94a3b8;
          text-decoration: none;
          transition: all 0.15s ease;
        }

        .portal-pill:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.05);
        }

        .portal-pill.active {
          background: rgba(99, 102, 241, 0.22);
          border: 1px solid rgba(99, 102, 241, 0.4);
          color: #a5b4fc;
          font-weight: 700;
        }

        .nepal-patro-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 8px;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.25);
          font-size: 11.5px;
          font-weight: 700;
          color: #fbbf24;
        }

        .text-amber { color: #f59e0b; }
        .text-cyan { color: #06b6d4; }

        .notifications-wrap {
          position: relative;
        }

        .notification-bell-btn {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          transition: all 0.15s ease;
        }

        .notification-bell-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        .bell-badge {
          position: absolute;
          top: -3px;
          right: -3px;
          background: #ef4444;
          color: #ffffff;
          font-size: 10px;
          font-weight: 800;
          width: 17px;
          height: 17px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #07090e;
        }

        .notifications-dropdown {
          position: absolute;
          top: 46px;
          right: 0;
          width: 330px;
          background: #0f1627;
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 14px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
          z-index: 100;
          overflow: hidden;
          animation: dropdownFade 0.2s ease;
        }

        @keyframes dropdownFade {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .notif-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
          background: rgba(255, 255, 255, 0.02);
        }

        .notif-title-row {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12.5px;
          color: #ffffff;
        }

        .notif-close-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
        }

        .notif-list {
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 280px;
          overflow-y: auto;
        }

        .notif-item {
          padding: 10px 12px;
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .notif-item-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .notif-tag {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .tag-danger {
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
        }

        .tag-warning {
          background: rgba(245, 158, 11, 0.15);
          color: #fbbf24;
        }

        .tag-success {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
        }

        .notif-time {
          font-size: 10.5px;
          color: #64748b;
        }

        .notif-text {
          margin: 0;
          font-size: 12px;
          color: #e2e8f0;
          line-height: 1.4;
        }

        .notif-footer {
          padding: 10px 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.07);
          text-align: center;
          background: rgba(255, 255, 255, 0.01);
        }

        .notif-view-all {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          color: #818cf8;
          text-decoration: none;
          font-weight: 600;
        }

        .ai-status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 9999px;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.25);
          font-size: 12px;
          font-weight: 600;
          color: #a5b4fc;
        }

        .pulse-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 10px #10b981;
        }

        .sparkle-icon {
          color: #818cf8;
        }

        .layout-content {
          flex: 1;
          padding: 28px 32px 60px;
          overflow-y: auto;
        }

        @media (max-width: 900px) {
          .topbar-portals-pills {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .layout-topbar {
            padding: 16px 20px;
          }
          .layout-content {
            padding: 20px;
          }
          .topbar-title {
            font-size: 19px;
          }
        }
      `}</style>
    </div>
  );
}
