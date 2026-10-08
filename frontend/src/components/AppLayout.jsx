import React from "react";
import Sidebar from "./Sidebar";
import { Sparkles, Bell, Search } from "lucide-react";

export default function AppLayout({ children, title, subtitle }) {
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
          padding: 20px 32px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(11, 15, 25, 0.7);
          backdrop-filter: blur(14px);
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .topbar-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .topbar-title {
          font-family: 'Outfit', sans-serif;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 0;
          color: #f8fafc;
        }

        .topbar-subtitle {
          font-size: 13px;
          color: #94a3b8;
          margin: 0;
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 16px;
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

        @media (max-width: 768px) {
          .layout-topbar {
            padding: 16px 20px;
          }
          .layout-content {
            padding: 20px;
          }
          .topbar-title {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
}
