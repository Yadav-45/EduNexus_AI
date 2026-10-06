import { useEffect, useState } from "react";
import {
  useSearchParams,
  useNavigate,
} from "react-router-dom";

function CourseDetails() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const courseId = searchParams.get("id");

  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const courseResponse = await fetch(
          `http://127.0.0.1:8000/courses/${courseId}`
        );

        if (!courseResponse.ok) {
          throw new Error("Course not found");
        }

        const courseData =
          await courseResponse.json();

        setCourse(courseData);

        try {
          const progressResponse =
            await fetch(
              `http://127.0.0.1:8000/courses/${courseId}/progress`
            );

          if (progressResponse.ok) {
            const progressData =
              await progressResponse.json();

            setProgress(
              Math.round(
                progressData.progress || 0
              )
            );
          }
        } catch (error) {
          console.error(
            "Failed to load course progress:",
            error
          );
        }

        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    if (courseId) {
      loadCourse();
    } else {
      setLoading(false);
    }
  }, [courseId]);

  const startLearning = () => {
    navigate("/learning");
  };

  if (loading) {
    return (
      <div className="details-page">

        <style>{`

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
          }

          .details-page {
            min-height: 100vh;
            background: #ffffff;
            font-family:
              Inter,
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              Arial,
              sans-serif;

            display: flex;
            align-items: center;
            justify-content: center;
          }

          .loading-content {
            text-align: center;
            color: #667085;
          }

          .loading-spinner {
            width: 45px;
            height: 45px;
            border: 4px solid #e5eaf0;
            border-top-color: #2563eb;
            border-radius: 50%;
            animation:
              spin 0.8s linear infinite;
            margin:
              0 auto 15px;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          .loading-content p {
            font-size: 11px;
          }

        `}</style>

        <div className="loading-content">

          <div className="loading-spinner" />

          <p>
            Loading course...
          </p>

        </div>

      </div>
    );
  }

  if (!course) {
    return (
      <div className="details-page">

        <style>{`

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
          }

          .details-page {
            min-height: 100vh;
            background: #ffffff;
            font-family:
              Inter,
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              Arial,
              sans-serif;

            display: flex;
            align-items: center;
            justify-content: center;
            padding: 30px;
          }

          .not-found {
            width: 100%;
            max-width: 450px;
            text-align: center;
            padding: 45px 30px;
            border:
              1px solid #e3e8ef;
            border-radius: 16px;
            background: #ffffff;
            box-shadow:
              0 8px 25px
              rgba(16, 24, 40, 0.05);
          }

          .not-found-icon {
            font-size: 40px;
            margin-bottom: 12px;
          }

          .not-found h1 {
            margin: 0;
            color: #172033;
            font-size: 20px;
          }

          .not-found p {
            color: #667085;
            font-size: 11px;
            margin:
              8px 0 20px;
          }

          .back-button {
            border: none;
            border-radius: 8px;
            padding:
              10px 16px;
            background: #2563eb;
            color: white;
            font-size: 10px;
            font-weight: 700;
            cursor: pointer;
          }

        `}</style>

        <div className="not-found">

          <div className="not-found-icon">
            📚
          </div>

          <h1>
            Course not found
          </h1>

          <p>
            The course you're looking for
            could not be loaded.
          </p>

          <button
            className="back-button"
            onClick={() =>
              navigate("/courses")
            }
          >
            ← Back to Courses
          </button>

        </div>

      </div>
    );
  }

  const completed = progress === 100;

  return (
    <div className="details-page">

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

        .details-page {
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
           TOP BAR
        ========================= */

        .details-header {
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

          z-index: 10;
        }

        .details-brand {
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

        .dashboard-button {
          background: #f8fafc;
        }

        /* =========================
           CONTENT
        ========================= */

        .details-content {
          max-width: 1180px;

          margin: 0 auto;

          padding:
            36px 42px 55px;
        }

        .breadcrumb {
          display: flex;

          align-items: center;

          gap: 7px;

          color: #98a2b3;

          font-size: 9px;

          font-weight: 600;

          margin-bottom: 20px;
        }

        .breadcrumb button {
          border: none;

          background: transparent;

          color: #667085;

          padding: 0;

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

        .course-hero {
          display: grid;

          grid-template-columns:
            1.35fr
            0.65fr;

          gap: 25px;

          margin-bottom: 20px;
        }

        .hero-main {
          min-height: 300px;

          border:
            1px solid #dfe6ef;

          border-radius: 16px;

          padding: 31px;

          position: relative;

          overflow: hidden;

          background:
            linear-gradient(
              135deg,
              #f5f9ff,
              #eef3fb
            );

          box-shadow:
            0 5px 20px
            rgba(16, 24, 40, 0.04);

          display: flex;

          flex-direction: column;

          justify-content: center;
        }

        .hero-main::before {
          content: "";

          position: absolute;

          width: 280px;
          height: 280px;

          border-radius: 50%;

          background:
            rgba(37, 99, 235, 0.05);

          top: -150px;
          right: -80px;
        }

        .hero-main::after {
          content: "";

          position: absolute;

          width: 180px;
          height: 180px;

          border-radius: 50%;

          background:
            rgba(79, 70, 229, 0.04);

          bottom: -110px;
          left: -50px;
        }

        .hero-content {
          position: relative;

          z-index: 2;

          max-width: 680px;
        }

        .category-badge {
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

          margin-bottom: 13px;
        }

        .hero-title {
          margin: 0;

          color: #101828;

          font-size: 31px;

          line-height: 1.18;

          font-weight: 800;

          letter-spacing: -0.9px;
        }

        .hero-description {
          margin:
            12px 0 20px;

          max-width: 620px;

          color: #667085;

          font-size: 12px;

          line-height: 1.7;
        }

        .instructor {
          display: flex;

          align-items: center;

          gap: 9px;
        }

        .instructor-avatar {
          width: 32px;
          height: 32px;

          border-radius: 50%;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #4f46e5
            );

          color: white;

          display: flex;

          align-items: center;
          justify-content: center;

          font-size: 10px;

          font-weight: 800;
        }

        .instructor-info {
          display: flex;

          flex-direction: column;
        }

        .instructor-label {
          color: #98a2b3;

          font-size: 7px;

          text-transform: uppercase;

          letter-spacing: 0.6px;

          font-weight: 800;
        }

        .instructor-name {
          color: #344054;

          font-size: 10px;

          font-weight: 700;

          margin-top: 2px;
        }

        /* =========================
           PROGRESS CARD
        ========================= */

        .hero-progress {
          border:
            1px solid #dfe6ef;

          border-radius: 16px;

          background: #ffffff;

          padding: 25px;

          box-shadow:
            0 5px 20px
            rgba(16, 24, 40, 0.04);

          display: flex;

          flex-direction: column;

          justify-content: center;

          align-items: center;

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
          width: 145px;
          height: 145px;

          border-radius: 50%;

          margin:
            17px 0;

          display: flex;

          align-items: center;
          justify-content: center;

          position: relative;
        }

        .progress-circle::after {
          content: "";

          position: absolute;

          width: 114px;
          height: 114px;

          border-radius: 50%;

          background: #ffffff;
        }

        .progress-value {
          position: relative;

          z-index: 2;

          color: #101828;

          font-size: 27px;

          font-weight: 800;
        }

        .progress-status {
          color: #344054;

          font-size: 10px;

          font-weight: 700;
        }

        .progress-note {
          margin-top: 5px;

          color: #98a2b3;

          font-size: 8px;
        }

        /* =========================
           INFORMATION GRID
        ========================= */

        .info-grid {
          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 15px;

          margin-bottom: 20px;
        }

        .info-card {
          padding: 18px;

          background: #ffffff;

          border:
            1px solid #e3e8ef;

          border-radius: 12px;

          display: flex;

          align-items: center;

          gap: 12px;

          box-shadow:
            0 3px 14px
            rgba(16, 24, 40, 0.025);
        }

        .info-icon {
          width: 40px;
          height: 40px;

          flex-shrink: 0;

          border-radius: 10px;

          background: #f1f6fd;

          border:
            1px solid #e2eaf4;

          display: flex;

          align-items: center;
          justify-content: center;

          font-size: 17px;
        }

        .info-label {
          color: #98a2b3;

          font-size: 8px;

          margin-bottom: 3px;
        }

        .info-value {
          color: #344054;

          font-size: 11px;

          font-weight: 750;
        }

        /* =========================
           MAIN DETAILS
        ========================= */

        .details-grid {
          display: grid;

          grid-template-columns:
            1.5fr
            0.5fr;

          gap: 20px;

          margin-bottom: 20px;
        }

        .content-card {
          background: #ffffff;

          border:
            1px solid #e3e8ef;

          border-radius: 14px;

          padding: 24px;

          box-shadow:
            0 3px 14px
            rgba(16, 24, 40, 0.025);
        }

        .card-heading {
          margin: 0 0 12px;

          color: #172033;

          font-size: 15px;

          font-weight: 800;

          letter-spacing: -0.2px;
        }

        .card-text {
          color: #667085;

          font-size: 10px;

          line-height: 1.75;

          margin: 0;
        }

        .learning-list {
          margin:
            18px 0 0;

          padding: 0;

          list-style: none;

          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 9px;
        }

        .learning-item {
          display: flex;

          align-items: center;

          gap: 8px;

          color: #475467;

          font-size: 9px;

          font-weight: 600;
        }

        .learning-check {
          width: 22px;
          height: 22px;

          flex-shrink: 0;

          border-radius: 6px;

          background: #f1f6fd;

          color: #2563eb;

          display: flex;

          align-items: center;
          justify-content: center;

          font-size: 10px;

          font-weight: 800;
        }

        /* =========================
           QUICK STATS
        ========================= */

        .quick-stats {
          display: flex;

          flex-direction: column;

          gap: 11px;
        }

        .quick-stat {
          padding:
            13px 14px;

          border:
            1px solid #e7ebf0;

          border-radius: 9px;

          background: #fbfcfe;
        }

        .quick-stat-label {
          color: #98a2b3;

          font-size: 8px;
        }

        .quick-stat-value {
          color: #172033;

          font-size: 15px;

          font-weight: 800;

          margin-top: 3px;
        }

        /* =========================
           CTA
        ========================= */

        .learning-cta {
          padding:
            20px 23px;

          border:
            1px solid #d8e4f3;

          border-radius: 14px;

          background:
            linear-gradient(
              135deg,
              #f7faff,
              #f1f5ff
            );

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 20px;
        }

        .cta-title {
          margin: 0;

          color: #172033;

          font-size: 14px;

          font-weight: 800;
        }

        .cta-description {
          margin:
            4px 0 0;

          color: #667085;

          font-size: 9px;
        }

        .start-button {
          flex-shrink: 0;

          padding:
            11px 18px;

          border: none;

          border-radius: 8px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #4f46e5
            );

          color: white;

          font-size: 10px;

          font-weight: 750;

          cursor: pointer;

          box-shadow:
            0 5px 12px
            rgba(37, 99, 235, 0.15);

          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease;
        }

        .start-button:hover {
          transform:
            translateY(-1px);

          box-shadow:
            0 8px 17px
            rgba(37, 99, 235, 0.21);
        }

        /* =========================
           RESPONSIVE
        ========================= */

        @media (max-width: 850px) {

          .course-hero {
            grid-template-columns: 1fr;
          }

          .hero-progress {
            min-height: 230px;
          }

          .details-grid {
            grid-template-columns: 1fr;
          }

          .info-grid {
            grid-template-columns:
              1fr 1fr;
          }

        }

        @media (max-width: 620px) {

          .details-header {
            padding:
              0 18px;
          }

          .details-content {
            padding:
              25px 18px 40px;
          }

          .brand-caption {
            display: none;
          }

          .dashboard-button {
            display: none;
          }

          .hero-main {
            padding: 24px;
          }

          .hero-title {
            font-size: 25px;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .learning-list {
            grid-template-columns: 1fr;
          }

          .learning-cta {
            align-items: flex-start;

            flex-direction: column;
          }

          .start-button {
            width: 100%;
          }

        }

        @media (max-width: 420px) {

          .details-header {
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

          .details-content {
            padding:
              21px 13px 35px;
          }

        }

      `}</style>

      {/* =========================
          HEADER
      ========================= */}

      <header className="details-header">

        <div
          className="details-brand"
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
            className="header-button dashboard-button"
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
            ← Courses
          </button>

        </div>

      </header>

      {/* =========================
          CONTENT
      ========================= */}

      <main className="details-content">

        {/* BREADCRUMB */}

        <div className="breadcrumb">

          <button
            onClick={() =>
              navigate("/courses")
            }
          >
            Courses
          </button>

          <span className="breadcrumb-arrow">
            /
          </span>

          <span>
            {course.title}
          </span>

        </div>

        {/* HERO */}

        <section className="course-hero">

          <div className="hero-main">

            <div className="hero-content">

              <div className="category-badge">
                {course.category ||
                  "General Course"}
              </div>

              <h1 className="hero-title">
                {course.title}
              </h1>

              <p className="hero-description">
                {course.description ||
                  "Build practical skills through structured learning with EduNexus AI."}
              </p>

              <div className="instructor">

                <div className="instructor-avatar">
                  {(course.instructor ||
                    "E")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="instructor-info">

                  <div className="instructor-label">
                    Instructor
                  </div>

                  <div className="instructor-name">
                    {course.instructor ||
                      "EduNexus AI"}
                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* PROGRESS */}

          <div className="hero-progress">

            <div className="progress-label">
              Your Progress
            </div>

            <div
              className="progress-circle"
              style={{
                background:
                  `conic-gradient(
                    #2563eb
                    ${progress}%,
                    #e8edf3
                    ${progress}% 100%
                  )`,
              }}
            >

              <div className="progress-value">
                {progress}%
              </div>

            </div>

            <div className="progress-status">
              {completed
                ? "Course completed"
                : "Keep learning"}
            </div>

            <div className="progress-note">
              Your learning progress
            </div>

          </div>

        </section>

        {/* INFO */}

        <section className="info-grid">

          <div className="info-card">

            <div className="info-icon">
              📚
            </div>

            <div>

              <div className="info-label">
                Course Type
              </div>

              <div className="info-value">
                Online Learning
              </div>

            </div>

          </div>

          <div className="info-card">

            <div className="info-icon">
              🎯
            </div>

            <div>

              <div className="info-label">
                Learning Level
              </div>

              <div className="info-value">
                Student
              </div>

            </div>

          </div>

          <div className="info-card">

            <div className="info-icon">
              ✦
            </div>

            <div>

              <div className="info-label">
                Platform
              </div>

              <div className="info-value">
                EduNexus AI
              </div>

            </div>

          </div>

        </section>

        {/* DETAILS */}

        <section className="details-grid">

          <div className="content-card">

            <h2 className="card-heading">
              About this course
            </h2>

            <p className="card-text">
              {course.description ||
                "This course is designed to provide a structured learning experience and help you build practical knowledge step by step."}
            </p>

            <ul className="learning-list">

              <li className="learning-item">

                <span className="learning-check">
                  ✓
                </span>

                Structured lessons

              </li>

              <li className="learning-item">

                <span className="learning-check">
                  ✓
                </span>

                Practical learning

              </li>

              <li className="learning-item">

                <span className="learning-check">
                  ✓
                </span>

                Progress tracking

              </li>

              <li className="learning-item">

                <span className="learning-check">
                  ✓
                </span>

                AI learning support

              </li>

            </ul>

          </div>

          <div className="content-card">

            <h2 className="card-heading">
              Course Overview
            </h2>

            <div className="quick-stats">

              <div className="quick-stat">

                <div className="quick-stat-label">
                  Category
                </div>

                <div className="quick-stat-value">
                  {course.category ||
                    "General"}
                </div>

              </div>

              <div className="quick-stat">

                <div className="quick-stat-label">
                  Progress
                </div>

                <div className="quick-stat-value">
                  {progress}%
                </div>

              </div>

              <div className="quick-stat">

                <div className="quick-stat-label">
                  Status
                </div>

                <div className="quick-stat-value">
                  {completed
                    ? "Completed"
                    : "In Progress"}
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* CTA */}

        <section className="learning-cta">

          <div>

            <h2 className="cta-title">
              {completed
                ? "Review your course"
                : progress > 0
                ? "Continue your learning"
                : "Ready to start learning?"}
            </h2>

            <p className="cta-description">
              {completed
                ? "Revisit the lessons and strengthen your knowledge."
                : "Continue with the structured lessons in your learning path."}
            </p>

          </div>

          <button
            className="start-button"
            onClick={startLearning}
          >
            {completed
              ? "Review Course →"
              : progress > 0
              ? "Continue Learning →"
              : "Start Learning →"}
          </button>

        </section>

      </main>

    </div>
  );
}

export default CourseDetails;