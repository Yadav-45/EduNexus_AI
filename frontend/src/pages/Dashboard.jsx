import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { API_BASE_URL, getAuthToken } from "../api/config";
import {
  BookOpen,
  FileCheck2,
  Bot,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  Flame,
} from "lucide-react";

const AI_TUTOR_STORAGE_KEY = "edunexus_ai_tutor_messages";

function Dashboard() {
  const navigate = useNavigate();

  const [studentName, setStudentName] = useState("Student");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentRole, setStudentRole] = useState("Student");
  const [courseProgress, setCourseProgress] = useState(0);
  const [assignments, setAssignments] = useState([]);
  const [totalAssignments, setTotalAssignments] = useState(0);
  const [assignmentsCompleted, setAssignmentsCompleted] = useState(0);
  const [aiQuestions, setAiQuestions] = useState(0);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const loadDashboardData = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      navigate("/login");
      return;
    }

    // Load Profile
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login");
        return;
      }

      if (response.ok) {
        const profile = await response.json();
        setStudentName(profile.full_name?.trim() || "Student");
        setStudentEmail(profile.email?.trim() || "");
        setStudentRole(profile.role?.trim() || "Student");
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoadingProfile(false);
    }

    // Load Course Progress
    try {
      const response = await fetch(`${API_BASE_URL}/courses/1/progress`);
      if (response.ok) {
        const data = await response.json();
        setCourseProgress(Math.round(data.progress || 0));
      }
    } catch (err) {
      console.error("Failed to load course progress:", err);
    }

    // Load Assignments
    try {
      const response = await fetch(`${API_BASE_URL}/assignments`);
      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
        setTotalAssignments(data.length);
        setAssignmentsCompleted(data.filter((a) => a.completed).length);
      }
    } catch (err) {
      console.error("Failed to load assignments:", err);
    }

    // AI messages count
    try {
      const savedMessages = localStorage.getItem(AI_TUTOR_STORAGE_KEY);
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        setAiQuestions(parsed.filter((m) => m.sender === "user").length);
      }
    } catch (err) {
      console.error("Failed to load AI history:", err);
    }
  }, [navigate]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const initials =
    studentName
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "ST";

  return (
    <AppLayout
      title={`Welcome back, ${studentName}`}
      subtitle="Here is an overview of your academic curriculum and neural learning roadmap"
    >
      <div className="student-dashboard-wrap">
        {/* Profile Dossier Hero */}
        <section className="profile-hero-banner">
          <div className="banner-glow-gradient" />
          <div className="banner-content">
            <div className="banner-avatar-box">
              <span className="banner-avatar-initials">{initials}</span>
              <span className="online-badge" />
            </div>

            <div className="banner-user-info">
              <div className="banner-name-row">
                <h2 className="banner-name">{studentName}</h2>
                <span className="banner-role-tag">{studentRole}</span>
              </div>
              <p className="banner-email">{studentEmail || "student@edunexus.com"}</p>
              <div className="streak-indicator">
                <Flame size={15} className="text-amber" />
                <span>7-Day Active Learning Streak</span>
              </div>
            </div>

            <div className="banner-actions">
              <button
                onClick={() => navigate("/ai-tutor")}
                className="banner-ai-btn"
              >
                <Bot size={16} />
                <span>Ask AI Tutor</span>
              </button>
            </div>
          </div>
        </section>

        {/* Stats KPI Row */}
        <section className="dashboard-stats-grid">
          <div className="stat-box">
            <div className="stat-top">
              <span className="stat-title">Course Mastery</span>
              <div className="stat-icon-wrap icon-cyan">
                <BookOpen size={18} />
              </div>
            </div>
            <div className="stat-metric">{courseProgress}%</div>
            <div className="stat-progress-bar">
              <div
                className="stat-progress-fill fill-cyan"
                style={{ width: `${courseProgress}%` }}
              />
            </div>
            <span className="stat-foot">Python Programming Core</span>
          </div>

          <div className="stat-box">
            <div className="stat-top">
              <span className="stat-title">Tasks Completed</span>
              <div className="stat-icon-wrap icon-indigo">
                <FileCheck2 size={18} />
              </div>
            </div>
            <div className="stat-metric">
              {assignmentsCompleted}{" "}
              <span className="stat-metric-sub">/ {totalAssignments}</span>
            </div>
            <div className="stat-progress-bar">
              <div
                className="stat-progress-fill fill-indigo"
                style={{
                  width: `${
                    totalAssignments
                      ? (assignmentsCompleted / totalAssignments) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
            <span className="stat-foot">
              {totalAssignments - assignmentsCompleted} assignments remaining
            </span>
          </div>

          <div className="stat-box">
            <div className="stat-top">
              <span className="stat-title">AI Neural Queries</span>
              <div className="stat-icon-wrap icon-emerald">
                <Bot size={18} />
              </div>
            </div>
            <div className="stat-metric">{aiQuestions}</div>
            <div className="stat-progress-bar">
              <div
                className="stat-progress-fill fill-emerald"
                style={{ width: `${Math.min(aiQuestions * 10, 100)}%` }}
              />
            </div>
            <span className="stat-foot">Personalized learning interactions</span>
          </div>
        </section>

        {/* Main 2-column view: Courses & Assignments */}
        <section className="dashboard-columns-grid">
          {/* Active Course Card */}
          <div className="content-card">
            <div className="card-topbar">
              <div className="card-heading-group">
                <div className="card-icon-pill">
                  <BookOpen size={16} />
                </div>
                <h3 className="card-main-title">Enrolled Curriculum</h3>
              </div>
              <button
                onClick={() => navigate("/courses")}
                className="card-text-action"
              >
                <span>View All</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="course-featured-item">
              <div className="course-item-header">
                <div className="course-tag">LEVEL 1 · ACTIVE</div>
                <h4 className="course-item-title">
                  Python Programming Fundamentals
                </h4>
                <p className="course-item-desc">
                  Syntax, data structures, object-oriented concepts, and computational problem solving.
                </p>
              </div>

              <div className="course-progress-section">
                <div className="progress-labels">
                  <span>Overall Module Progress</span>
                  <strong>{courseProgress}%</strong>
                </div>
                <div className="course-bar-outer">
                  <div
                    className="course-bar-inner"
                    style={{ width: `${courseProgress}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => navigate("/learning")}
                className="resume-learning-btn"
              >
                <span>Continue Lesson</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Assignments Checklist Card */}
          <div className="content-card">
            <div className="card-topbar">
              <div className="card-heading-group">
                <div className="card-icon-pill">
                  <FileCheck2 size={16} />
                </div>
                <h3 className="card-main-title">Assignments & Submissions</h3>
              </div>
              <button
                onClick={() => navigate("/assignments")}
                className="card-text-action"
              >
                <span>View All</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="assignments-list">
              {assignments.slice(0, 4).map((item) => (
                <div key={item.id} className="assignment-row">
                  <div className="assignment-left">
                    <div
                      className={`check-icon-circle ${
                        item.completed ? "completed" : "pending"
                      }`}
                    >
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <h5 className="assignment-title">{item.title}</h5>
                      <span className="assignment-meta">
                        {item.course || "Python"} · Due soon
                      </span>
                    </div>
                  </div>

                  <span
                    className={`assignment-status-tag ${
                      item.completed ? "status-done" : "status-todo"
                    }`}
                  >
                    {item.completed ? "Submitted" : "Pending"}
                  </span>
                </div>
              ))}

              {assignments.length === 0 && (
                <div className="empty-tasks-state">
                  <p>No active assignments assigned for this week.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .student-dashboard-wrap {
          display: flex;
          flex-direction: column;
          gap: 28px;
          max-width: 1360px;
          margin: 0 auto;
        }

        .profile-hero-banner {
          background: linear-gradient(135deg, #111726 0%, #0d121f 100%);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 20px;
          padding: 28px 32px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }

        .banner-glow-gradient {
          position: absolute;
          width: 300px;
          height: 300px;
          top: -100px;
          right: -50px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%);
          filter: blur(40px);
          pointer-events: none;
        }

        .banner-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 24px;
          position: relative;
          z-index: 2;
        }

        .banner-avatar-box {
          position: relative;
        }

        .banner-avatar-initials {
          width: 68px;
          height: 68px;
          border-radius: 18px;
          background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
          color: #ffffff;
          font-family: 'Outfit', sans-serif;
          font-size: 24px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
        }

        .online-badge {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #10b981;
          border: 3px solid #0d121f;
        }

        .banner-user-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .banner-name-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .banner-name {
          font-family: 'Outfit', sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
        }

        .banner-role-tag {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
          border: 1px solid rgba(99, 102, 241, 0.3);
          padding: 3px 8px;
          border-radius: 6px;
        }

        .banner-email {
          font-size: 13.5px;
          color: #94a3b8;
          margin: 0;
        }

        .streak-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 6px;
          font-size: 12px;
          color: #f59e0b;
          font-weight: 600;
        }

        .text-amber { color: #f59e0b; }

        .banner-ai-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 22px;
          background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(99, 102, 241, 0.35);
          transition: all 0.25s;
        }

        .banner-ai-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
          box-shadow: 0 6px 22px rgba(99, 102, 241, 0.5);
        }

        .dashboard-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 20px;
        }

        .stat-box {
          background: #111726;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 22px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
          transition: all 0.25s;
        }

        .stat-box:hover {
          border-color: rgba(255, 255, 255, 0.16);
          transform: translateY(-2px);
        }

        .stat-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .stat-title {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94a3b8;
        }

        .stat-icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-cyan {
          background: rgba(6, 182, 212, 0.15);
          color: #22d3ee;
        }

        .icon-indigo {
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
        }

        .icon-emerald {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
        }

        .stat-metric {
          font-family: 'Outfit', sans-serif;
          font-size: 32px;
          font-weight: 800;
          color: #ffffff;
          line-height: 1;
        }

        .stat-metric-sub {
          font-size: 18px;
          color: #64748b;
          font-weight: 500;
        }

        .stat-progress-bar {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 9999px;
          overflow: hidden;
        }

        .stat-progress-fill {
          height: 100%;
          border-radius: 9999px;
          transition: width 0.5s ease;
        }

        .fill-cyan { background: linear-gradient(90deg, #06b6d4, #38bdf8); }
        .fill-indigo { background: linear-gradient(90deg, #6366f1, #818cf8); }
        .fill-emerald { background: linear-gradient(90deg, #10b981, #34d399); }

        .stat-foot {
          font-size: 12px;
          color: #64748b;
        }

        .dashboard-columns-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
          gap: 22px;
        }

        .content-card {
          background: #111726;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .card-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .card-heading-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .card-icon-pill {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-main-title {
          font-family: 'Outfit', sans-serif;
          font-size: 17px;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
        }

        .card-text-action {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: #818cf8;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.2s;
        }

        .card-text-action:hover {
          color: #a5b4fc;
        }

        .course-featured-item {
          display: flex;
          flex-direction: column;
          gap: 18px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 14px;
          padding: 20px;
        }

        .course-tag {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #22d3ee;
          margin-bottom: 4px;
        }

        .course-item-title {
          font-family: 'Outfit', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 6px;
        }

        .course-item-desc {
          font-size: 13px;
          line-height: 1.5;
          color: #94a3b8;
          margin: 0;
        }

        .course-progress-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .progress-labels {
          display: flex;
          justify-content: space-between;
          font-size: 12.5px;
          color: #cbd5e1;
        }

        .course-bar-outer {
          height: 8px;
          background: rgba(255, 255, 255, 0.07);
          border-radius: 9999px;
          overflow: hidden;
        }

        .course-bar-inner {
          height: 100%;
          border-radius: 9999px;
          background: linear-gradient(90deg, #6366f1 0%, #06b6d4 100%);
        }

        .resume-learning-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 12px;
          background: #172033;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: #ffffff;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .resume-learning-btn:hover {
          background: #1e283d;
          border-color: #6366f1;
          color: #818cf8;
        }

        .assignments-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .assignment-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          gap: 14px;
        }

        .assignment-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .check-icon-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .check-icon-circle.completed {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
        }

        .check-icon-circle.pending {
          background: rgba(255, 255, 255, 0.05);
          color: #64748b;
        }

        .assignment-title {
          font-size: 13.5px;
          font-weight: 600;
          color: #f1f5f9;
          margin: 0 0 2px;
        }

        .assignment-meta {
          font-size: 11.5px;
          color: #64748b;
        }

        .assignment-status-tag {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 9px;
          border-radius: 6px;
        }

        .status-done {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .status-todo {
          background: rgba(245, 158, 11, 0.15);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .empty-tasks-state {
          padding: 24px;
          text-align: center;
          color: #64748b;
          font-size: 13px;
        }

        @media (max-width: 650px) {
          .banner-content {
            flex-direction: column;
            align-items: flex-start;
          }
          .banner-actions {
            width: 100%;
          }
          .banner-ai-btn {
            width: 100%;
            justify-content: center;
          }
          .dashboard-columns-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </AppLayout>
  );
}

export default Dashboard;