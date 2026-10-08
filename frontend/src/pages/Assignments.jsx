import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api/config";

function Assignments() {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completing, setCompleting] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/assignments`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load assignments");
        }

        return response.json();
      })
      .then((data) => {
        setAssignments(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setError("Unable to load assignments.");
        setLoading(false);
      });
  }, []);

  const completeAssignment = async (assignmentId) => {
    setCompleting(assignmentId);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/assignments/${assignmentId}/complete`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to complete assignment");
      }

      setAssignments((previous) =>
        previous.map((assignment) =>
          assignment.id === assignmentId
            ? {
                ...assignment,
                completed: true,
              }
            : assignment
        )
      );
    } catch (error) {
      console.error(error);
      setError("Unable to save assignment progress.");
    } finally {
      setCompleting(null);
    }
  };

  const completedCount = assignments.filter(
    (assignment) => assignment.completed
  ).length;

  const totalCount = assignments.length;

  const completionPercentage =
    totalCount > 0
      ? Math.round((completedCount / totalCount) * 100)
      : 0;

  return (
    <div className="assignments-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #ffffff;
        }

        button {
          font-family: inherit;
        }

        .assignments-page {
          min-height: 100vh;
          background:
            linear-gradient(
              180deg,
              #ffffff 0%,
              #f8fafc 100%
            );
          color: #172033;
          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Arial,
            sans-serif;
        }

        /* =========================
           HEADER
        ========================= */

        .assignments-header {
          height: 72px;

          background: #ffffff;

          border-bottom:
            1px solid #e7ebf0;

          display: flex;

          align-items: center;

          justify-content: space-between;

          padding:
            0 42px;

          position: sticky;

          top: 0;

          z-index: 20;
        }

        .assignments-brand {
          display: flex;

          align-items: center;

          gap: 10px;

          cursor: pointer;
        }

        .brand-mark {
          width: 36px;
          height: 36px;

          border-radius: 9px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #4f46e5
            );

          display: flex;

          align-items: center;

          justify-content: center;

          color: white;

          font-size: 16px;

          font-weight: 800;

          box-shadow:
            0 5px 12px
            rgba(37, 99, 235, 0.16);
        }

        .brand-name {
          color: #101828;

          font-size: 16px;

          font-weight: 800;

          letter-spacing: -0.4px;
        }

        .brand-name span {
          color: #2563eb;
        }

        .brand-caption {
          color: #98a2b3;

          font-size: 7px;

          letter-spacing: 0.6px;

          margin-top: 2px;
        }

        .header-actions {
          display: flex;

          align-items: center;

          gap: 9px;
        }

        .header-button {
          padding:
            9px 14px;

          border:
            1px solid #dfe5ec;

          border-radius: 8px;

          background: #ffffff;

          color: #475467;

          font-size: 10px;

          font-weight: 700;

          cursor: pointer;

          transition: 0.18s;
        }

        .header-button:hover {
          color: #2563eb;

          border-color: #bfd3f2;

          background: #f8fbff;
        }

        /* =========================
           MAIN CONTENT
        ========================= */

        .assignments-content {
          max-width: 1180px;

          margin: 0 auto;

          padding:
            36px 42px 55px;
        }

        .breadcrumb {
          display: flex;

          align-items: center;

          gap: 7px;

          margin-bottom: 20px;

          color: #98a2b3;

          font-size: 9px;

          font-weight: 600;
        }

        .breadcrumb button {
          padding: 0;

          border: none;

          background: transparent;

          color: #667085;

          font-size: 9px;

          font-weight: 700;

          cursor: pointer;
        }

        .breadcrumb button:hover {
          color: #2563eb;
        }

        .breadcrumb-arrow {
          color: #d0d5dd;
        }

        /* =========================
           HERO
        ========================= */

        .assignments-hero {
          display: grid;

          grid-template-columns:
            1.35fr
            0.65fr;

          gap: 20px;

          margin-bottom: 22px;
        }

        .hero-main {
          position: relative;

          overflow: hidden;

          padding: 28px;

          border:
            1px solid #dfe6ef;

          border-radius: 16px;

          background:
            linear-gradient(
              135deg,
              #f5f9ff,
              #eef3fb
            );

          box-shadow:
            0 5px 20px
            rgba(16, 24, 40, 0.04);
        }

        .hero-main::before {
          content: "";

          position: absolute;

          width: 260px;
          height: 260px;

          border-radius: 50%;

          background:
            rgba(37, 99, 235, 0.05);

          top: -150px;

          right: -60px;
        }

        .hero-content {
          position: relative;

          z-index: 2;
        }

        .page-label {
          display: inline-block;

          padding:
            6px 10px;

          border-radius: 6px;

          background: #ffffff;

          border:
            1px solid #dce5f0;

          color: #2563eb;

          font-size: 8px;

          font-weight: 800;

          text-transform: uppercase;

          letter-spacing: 0.6px;

          margin-bottom: 12px;
        }

        .hero-title {
          margin: 0;

          color: #101828;

          font-size: 28px;

          line-height: 1.2;

          font-weight: 800;

          letter-spacing: -0.8px;
        }

        .hero-description {
          margin:
            9px 0 18px;

          max-width: 620px;

          color: #667085;

          font-size: 10px;

          line-height: 1.65;
        }

        .hero-meta {
          display: flex;

          align-items: center;

          gap: 17px;

          flex-wrap: wrap;
        }

        .hero-meta-item {
          display: flex;

          align-items: center;

          gap: 6px;

          color: #667085;

          font-size: 8px;

          font-weight: 700;
        }

        .hero-meta-icon {
          color: #2563eb;

          font-size: 11px;
        }

        /* =========================
           PROGRESS CARD
        ========================= */

        .progress-card {
          padding: 25px;

          background: #ffffff;

          border:
            1px solid #dfe6ef;

          border-radius: 16px;

          box-shadow:
            0 5px 20px
            rgba(16, 24, 40, 0.04);

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          text-align: center;
        }

        .progress-label {
          color: #98a2b3;

          font-size: 8px;

          font-weight: 800;

          text-transform: uppercase;

          letter-spacing: 0.8px;
        }

        .progress-circle {
          width: 124px;
          height: 124px;

          border-radius: 50%;

          margin:
            14px 0;

          position: relative;

          display: flex;

          align-items: center;

          justify-content: center;
        }

        .progress-circle::after {
          content: "";

          position: absolute;

          width: 97px;
          height: 97px;

          border-radius: 50%;

          background: white;
        }

        .progress-number {
          position: relative;

          z-index: 2;

          color: #101828;

          font-size: 24px;

          font-weight: 800;
        }

        .progress-status {
          color: #344054;

          font-size: 10px;

          font-weight: 750;
        }

        .progress-detail {
          margin-top: 4px;

          color: #98a2b3;

          font-size: 8px;
        }

        /* =========================
           ERROR
        ========================= */

        .error-message {
          padding:
            12px 15px;

          border:
            1px solid #fecaca;

          border-radius: 9px;

          background: #fff7f7;

          color: #b91c1c;

          font-size: 9px;

          font-weight: 650;

          margin-bottom: 18px;
        }

        /* =========================
           SECTION HEADER
        ========================= */

        .section-header {
          display: flex;

          align-items: flex-end;

          justify-content: space-between;

          margin-bottom: 14px;
        }

        .section-label {
          color: #2563eb;

          font-size: 8px;

          font-weight: 800;

          text-transform: uppercase;

          letter-spacing: 0.8px;

          margin-bottom: 5px;
        }

        .section-title {
          margin: 0;

          color: #172033;

          font-size: 18px;

          font-weight: 800;

          letter-spacing: -0.3px;
        }

        .assignment-count {
          color: #98a2b3;

          font-size: 9px;

          font-weight: 650;
        }

        /* =========================
           LOADING
        ========================= */

        .loading-card {
          background: #ffffff;

          border:
            1px solid #e3e8ef;

          border-radius: 14px;

          padding: 35px;

          text-align: center;

          color: #667085;

          font-size: 10px;
        }

        .spinner {
          width: 35px;
          height: 35px;

          margin:
            0 auto 12px;

          border:
            3px solid #e6ebf1;

          border-top-color: #2563eb;

          border-radius: 50%;

          animation:
            spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* =========================
           ASSIGNMENT CARD
        ========================= */

        .assignment-card {
          background: #ffffff;

          border:
            1px solid #e3e8ef;

          border-radius: 14px;

          margin-bottom: 12px;

          overflow: hidden;

          box-shadow:
            0 3px 14px
            rgba(16, 24, 40, 0.025);

          transition:
            border-color 0.18s ease,
            box-shadow 0.18s ease;
        }

        .assignment-card:hover {
          border-color: #d2deed;

          box-shadow:
            0 7px 22px
            rgba(16, 24, 40, 0.05);
        }

        .assignment-card.completed {
          border-color: #b7e4c3;
        }

        .assignment-content {
          padding: 19px 20px;
        }

        .assignment-top {
          display: flex;

          align-items: flex-start;

          gap: 14px;
        }

        .assignment-icon {
          width: 40px;
          height: 40px;

          flex-shrink: 0;

          border-radius: 10px;

          background: #f1f6fd;

          border:
            1px solid #dfe8f4;

          display: flex;

          align-items: center;

          justify-content: center;

          color: #2563eb;

          font-size: 16px;
        }

        .assignment-card.completed
          .assignment-icon {
          background: #ecfdf3;

          border-color: #c9ecd3;
        }

        .assignment-info {
          flex: 1;

          min-width: 0;
        }

        .assignment-label {
          color: #98a2b3;

          font-size: 7px;

          font-weight: 800;

          text-transform: uppercase;

          letter-spacing: 0.6px;

          margin-bottom: 4px;
        }

        .assignment-title {
          margin: 0;

          color: #172033;

          font-size: 14px;

          font-weight: 800;

          line-height: 1.35;
        }

        .status-badge {
          padding:
            5px 9px;

          border-radius: 20px;

          background: #fff7ed;

          border:
            1px solid #fed7aa;

          color: #c2410c;

          font-size: 7px;

          font-weight: 800;

          white-space: nowrap;
        }

        .status-badge.completed {
          background: #ecfdf3;

          border-color: #c9ecd3;

          color: #16a34a;
        }

        .assignment-description {
          margin:
            13px 0 14px 54px;

          color: #667085;

          font-size: 9px;

          line-height: 1.65;
        }

        .assignment-footer {
          margin-left: 54px;

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 15px;

          padding-top: 13px;

          border-top:
            1px solid #eef1f5;
        }

        .due-date {
          display: flex;

          align-items: center;

          gap: 6px;

          color: #667085;

          font-size: 8px;

          font-weight: 650;
        }

        .due-icon {
          color: #98a2b3;

          font-size: 11px;
        }

        .complete-button {
          min-width: 165px;

          padding:
            9px 13px;

          border: none;

          border-radius: 8px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #4f46e5
            );

          color: white;

          font-size: 9px;

          font-weight: 750;

          cursor: pointer;

          box-shadow:
            0 4px 10px
            rgba(37, 99, 235, 0.12);

          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease,
            opacity 0.18s ease;
        }

        .complete-button:hover:not(:disabled) {
          transform:
            translateY(-1px);

          box-shadow:
            0 7px 14px
            rgba(37, 99, 235, 0.18);
        }

        .complete-button.completed-button {
          background: #16a34a;

          box-shadow: none;

          cursor: default;
        }

        .complete-button:disabled {
          opacity: 0.75;

          cursor: default;
        }

        /* =========================
           EMPTY STATE
        ========================= */

        .empty-state {
          background: #ffffff;

          border:
            1px solid #e3e8ef;

          border-radius: 14px;

          padding: 45px 25px;

          text-align: center;
        }

        .empty-icon {
          font-size: 32px;

          margin-bottom: 10px;
        }

        .empty-title {
          margin: 0;

          color: #172033;

          font-size: 14px;

          font-weight: 800;
        }

        .empty-text {
          margin:
            6px 0 0;

          color: #98a2b3;

          font-size: 9px;
        }

        /* =========================
           RESPONSIVE
        ========================= */

        @media (max-width: 850px) {
          .assignments-hero {
            grid-template-columns: 1fr;
          }

          .progress-card {
            min-height: 210px;
          }
        }

        @media (max-width: 650px) {
          .assignments-header {
            padding:
              0 18px;
          }

          .assignments-content {
            padding:
              26px 18px 40px;
          }

          .brand-caption {
            display: none;
          }

          .hero-main {
            padding: 23px;
          }

          .hero-title {
            font-size: 24px;
          }

          .status-badge {
            display: none;
          }

          .assignment-description {
            margin-left: 0;
          }

          .assignment-footer {
            margin-left: 0;

            align-items: stretch;

            flex-direction: column;
          }

          .complete-button {
            width: 100%;
          }
        }

        @media (max-width: 420px) {
          .assignments-header {
            height: 64px;
          }

          .brand-name {
            font-size: 14px;
          }

          .header-button {
            padding:
              8px 10px;

            font-size: 9px;
          }

          .assignments-content {
            padding:
              21px 13px 35px;
          }

          .hero-title {
            font-size: 22px;
          }
        }
      `}</style>

      {/* =========================
          HEADER
      ========================= */}

      <header className="assignments-header">

        <div
          className="assignments-brand"
          onClick={() =>
            navigate("/dashboard")
          }
        >

          <div className="brand-mark">
            E
          </div>

          <div>

            <div className="brand-name">
              edu<span>nexus.ai</span>
            </div>

            <div className="brand-caption">
              AI LEARNING PLATFORM
            </div>

          </div>

        </div>

        <div className="header-actions">

          <button
            className="header-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            Dashboard
          </button>

          <button
            className="header-button"
            onClick={() =>
              navigate("/courses")
            }
          >
            Courses
          </button>

        </div>

      </header>

      {/* =========================
          CONTENT
      ========================= */}

      <main className="assignments-content">

        <div className="breadcrumb">

          <button
            onClick={() =>
              navigate("/dashboard")
            }
          >
            Dashboard
          </button>

          <span className="breadcrumb-arrow">
            /
          </span>

          <span>
            Assignments
          </span>

        </div>

        {/* HERO */}

        <section className="assignments-hero">

          <div className="hero-main">

            <div className="hero-content">

              <div className="page-label">
                Your Coursework
              </div>

              <h1 className="hero-title">
                Assignments
              </h1>

              <p className="hero-description">
                Complete your assignments to
                reinforce what you've learned and
                keep building your programming skills.
              </p>

              <div className="hero-meta">

                <div className="hero-meta-item">

                  <span className="hero-meta-icon">
                    📝
                  </span>

                  {totalCount} Assignments

                </div>

                <div className="hero-meta-item">

                  <span className="hero-meta-icon">
                    ✓
                  </span>

                  {completedCount} Completed

                </div>

                <div className="hero-meta-item">

                  <span className="hero-meta-icon">
                    🎯
                  </span>

                  Python Programming

                </div>

              </div>

            </div>

          </div>

          <div className="progress-card">

            <div className="progress-label">
              Assignment Progress
            </div>

            <div
              className="progress-circle"
              style={{
                background:
                  `conic-gradient(
                    #2563eb
                    ${completionPercentage}%,
                    #e8edf3
                    ${completionPercentage}% 100%
                  )`,
              }}
            >

              <div className="progress-number">
                {completionPercentage}%
              </div>

            </div>

            <div className="progress-status">
              {completionPercentage === 100
                ? "All assignments complete"
                : "Keep making progress"}
            </div>

            <div className="progress-detail">
              {completedCount} of {totalCount} completed
            </div>

          </div>

        </section>

        {/* ERROR */}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* SECTION HEADER */}

        <div className="section-header">

          <div>

            <div className="section-label">
              Coursework
            </div>

            <h2 className="section-title">
              Your Assignments
            </h2>

          </div>

          <div className="assignment-count">
            {completedCount}/{totalCount} completed
          </div>

        </div>

        {/* LOADING */}

        {loading && (

          <div className="loading-card">

            <div className="spinner" />

            Loading your assignments...

          </div>

        )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          assignments.length === 0 && (

            <div className="empty-state">

              <div className="empty-icon">
                📝
              </div>

              <h3 className="empty-title">
                No assignments yet
              </h3>

              <p className="empty-text">
                Your assignments will appear here
                when they are available.
              </p>

            </div>
          )}

        {/* ASSIGNMENTS */}

        {!loading &&
          assignments.map((assignment) => {

            const isCompleting =
              completing === assignment.id;

            return (

              <article
                key={assignment.id}
                className={
                  assignment.completed
                    ? "assignment-card completed"
                    : "assignment-card"
                }
              >

                <div className="assignment-content">

                  <div className="assignment-top">

                    <div className="assignment-icon">
                      {assignment.completed
                        ? "✓"
                        : "📝"}
                    </div>

                    <div className="assignment-info">

                      <div className="assignment-label">
                        Assignment
                      </div>

                      <h3 className="assignment-title">
                        {assignment.title}
                      </h3>

                    </div>

                    <div
                      className={
                        assignment.completed
                          ? "status-badge completed"
                          : "status-badge"
                      }
                    >
                      {assignment.completed
                        ? "Completed"
                        : "Pending"}
                    </div>

                  </div>

                  <p className="assignment-description">
                    {assignment.description}
                  </p>

                  <div className="assignment-footer">

                    <div className="due-date">

                      <span className="due-icon">
                        ◷
                      </span>

                      <span>
                        Due date:{" "}
                        <strong>
                          {assignment.due_date}
                        </strong>
                      </span>

                    </div>

                    <button
                      className={
                        assignment.completed
                          ? "complete-button completed-button"
                          : "complete-button"
                      }
                      disabled={
                        assignment.completed ||
                        isCompleting
                      }
                      onClick={() =>
                        completeAssignment(
                          assignment.id
                        )
                      }
                    >
                      {isCompleting
                        ? "Saving..."
                        : assignment.completed
                        ? "Completed ✓"
                        : "Complete Assignment"}
                    </button>

                  </div>

                </div>

              </article>

            );
          })}

      </main>
    </div>
  );
}

export default Assignments;