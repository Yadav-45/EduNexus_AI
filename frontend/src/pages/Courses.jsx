import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api/config";

function Courses() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const coursesResponse = await fetch(
          `${API_BASE_URL}/courses`
        );

        if (!coursesResponse.ok) {
          throw new Error("Failed to fetch courses");
        }

        const coursesData =
          await coursesResponse.json();

        setCourses(coursesData);

        const progressData = {};

        for (const course of coursesData) {
          try {
            const progressResponse =
              await fetch(
                `${API_BASE_URL}/courses/${course.id}/progress`
              );

            if (progressResponse.ok) {
              const progressResult =
                await progressResponse.json();

              progressData[course.id] =
                progressResult.progress || 0;
            } else {
              progressData[course.id] = 0;
            }
          } catch {
            progressData[course.id] = 0;
          }
        }

        setProgress(progressData);
        setLoading(false);
      } catch (error) {
        console.error(error);

        setError(
          "Unable to load courses. Please make sure the EduNexus AI server is running."
        );

        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const openCourse = (courseId) => {
    navigate(`/course-details?id=${courseId}`);
  };

  return (
    <div className="courses-page">

      <style>{`

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #ffffff;
        }

        .courses-page {
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

        .courses-topbar {
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

        .courses-brand {
          display: flex;

          align-items: center;

          gap: 10px;

          cursor: pointer;
        }

        .brand-logo {
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

        .brand-title {
          color: #101828;

          font-size: 16px;

          font-weight: 800;

          letter-spacing: -0.4px;
        }

        .brand-title span {
          color: #2563eb;
        }

        .brand-subtitle {
          color: #98a2b3;

          font-size: 7px;

          letter-spacing: 0.6px;

          margin-top: 2px;
        }

        .back-button {
          padding:
            9px 15px;

          border:
            1px solid #dfe5ec;

          border-radius: 8px;

          background: white;

          color: #475467;

          font-size: 11px;

          font-weight: 700;

          cursor: pointer;

          transition: 0.18s;
        }

        .back-button:hover {
          color: #2563eb;

          border-color: #bfd3f2;

          background: #f8fbff;
        }

        /* =========================
           CONTENT
        ========================= */

        .courses-content {
          max-width: 1350px;

          margin: 0 auto;

          padding:
            38px 42px 55px;
        }

        .page-heading {
          display: flex;

          justify-content: space-between;

          align-items: flex-end;

          gap: 20px;

          margin-bottom: 28px;
        }

        .heading-label {
          color: #2563eb;

          font-size: 9px;

          font-weight: 800;

          letter-spacing: 1px;

          text-transform: uppercase;

          margin-bottom: 7px;
        }

        .page-heading h1 {
          margin: 0;

          color: #101828;

          font-size: 30px;

          font-weight: 800;

          letter-spacing: -0.9px;
        }

        .page-heading p {
          margin:
            7px 0 0;

          color: #667085;

          font-size: 12px;
        }

        .course-count {
          padding:
            8px 12px;

          border:
            1px solid #e2e8f0;

          border-radius: 8px;

          background: white;

          color: #667085;

          font-size: 9px;

          font-weight: 700;

          white-space: nowrap;
        }

        /* =========================
           LOADING
        ========================= */

        .loading-box {
          min-height: 300px;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          color: #667085;
        }

        .loading-icon {
          width: 45px;
          height: 45px;

          border:
            4px solid #e5eaf0;

          border-top-color: #2563eb;

          border-radius: 50%;

          animation:
            spin 0.8s linear infinite;

          margin-bottom: 14px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .loading-box p {
          font-size: 11px;
        }

        /* =========================
           ERROR
        ========================= */

        .error-box {
          padding: 20px;

          border:
            1px solid #fecaca;

          border-radius: 12px;

          background: #fff7f7;

          color: #b91c1c;

          font-size: 12px;

          font-weight: 600;

          text-align: center;
        }

        /* =========================
           COURSE GRID
        ========================= */

        .course-grid {
          display: grid;

          grid-template-columns:
            repeat(
              auto-fit,
              minmax(285px, 1fr)
            );

          gap: 20px;
        }

        /* =========================
           COURSE CARD
        ========================= */

        .course-card {
          background: #ffffff;

          border:
            1px solid #e1e7ef;

          border-radius: 15px;

          overflow: hidden;

          box-shadow:
            0 4px 18px
            rgba(16, 24, 40, 0.035);

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease;

          display: flex;

          flex-direction: column;
        }

        .course-card:hover {
          transform:
            translateY(-4px);

          border-color:
            #c7d8f0;

          box-shadow:
            0 14px 30px
            rgba(16, 24, 40, 0.09);
        }

        /* =========================
           COURSE VISUAL
        ========================= */

        .course-visual {
          height: 145px;

          position: relative;

          background:
            linear-gradient(
              135deg,
              #f1f6fd,
              #eaf0f8
            );

          display: flex;

          align-items: center;

          justify-content: center;

          overflow: hidden;
        }

        .course-visual::before {
          content: "";

          position: absolute;

          width: 150px;
          height: 150px;

          border-radius: 50%;

          background:
            rgba(37, 99, 235, 0.055);

          top: -75px;
          right: -40px;
        }

        .course-visual::after {
          content: "";

          position: absolute;

          width: 100px;
          height: 100px;

          border-radius: 50%;

          background:
            rgba(79, 70, 229, 0.045);

          bottom: -55px;
          left: -25px;
        }

        .course-icon {
          position: relative;

          z-index: 2;

          width: 70px;
          height: 70px;

          border-radius: 18px;

          background:
            linear-gradient(
              135deg,
              #ffffff,
              #f5f8fc
            );

          border:
            1px solid #dce5f0;

          display: flex;

          align-items: center;
          justify-content: center;

          font-size: 34px;

          box-shadow:
            0 8px 20px
            rgba(16, 24, 40, 0.07);
        }

        .category-badge {
          position: absolute;

          top: 12px;
          left: 12px;

          z-index: 3;

          padding:
            5px 9px;

          border-radius: 6px;

          background:
            rgba(255,255,255,0.92);

          border:
            1px solid
            rgba(210,220,233,0.9);

          color: #475467;

          font-size: 7px;

          font-weight: 800;

          text-transform: uppercase;

          letter-spacing: 0.5px;
        }

        /* =========================
           CARD BODY
        ========================= */

        .course-body {
          padding: 18px;

          display: flex;

          flex-direction: column;

          flex: 1;
        }

        .course-title {
          margin: 0;

          color: #172033;

          font-size: 16px;

          font-weight: 800;

          line-height: 1.3;

          letter-spacing: -0.25px;
        }

        .course-description {
          margin:
            8px 0 15px;

          color: #667085;

          font-size: 10px;

          line-height: 1.6;

          min-height: 48px;
        }

        .course-info {
          display: flex;

          align-items: center;

          gap: 8px;

          margin-bottom: 14px;

          flex-wrap: wrap;
        }

        .info-item {
          display: flex;

          align-items: center;

          gap: 4px;

          color: #667085;

          font-size: 8px;

          font-weight: 600;
        }

        .info-divider {
          color: #d0d5dd;

          font-size: 8px;
        }

        /* =========================
           PROGRESS
        ========================= */

        .progress-header {
          display: flex;

          justify-content: space-between;

          align-items: center;

          margin-bottom: 7px;
        }

        .progress-label {
          color: #667085;

          font-size: 8px;

          font-weight: 700;
        }

        .progress-percent {
          color: #2563eb;

          font-size: 9px;

          font-weight: 800;
        }

        .progress-track {
          width: 100%;

          height: 6px;

          background: #edf1f5;

          border-radius: 20px;

          overflow: hidden;
        }

        .progress-fill {
          height: 100%;

          border-radius: 20px;

          background:
            linear-gradient(
              90deg,
              #2563eb,
              #4f46e5
            );

          transition:
            width 0.5s ease;
        }

        .course-status {
          margin:
            8px 0 15px;

          font-size: 8px;

          font-weight: 700;

          color: #667085;
        }

        .course-status.completed {
          color: #16a34a;
        }

        /* =========================
           BUTTON
        ========================= */

        .open-course {
          width: 100%;

          margin-top: auto;

          padding:
            10px 14px;

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
            rgba(37, 99, 235, 0.13);

          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease;
        }

        .open-course:hover {
          transform:
            translateY(-1px);

          box-shadow:
            0 8px 16px
            rgba(37, 99, 235, 0.2);
        }

        /* =========================
           EMPTY STATE
        ========================= */

        .empty-state {
          padding: 65px 20px;

          text-align: center;

          border:
            1px dashed #d8dee7;

          border-radius: 14px;

          background: #fbfcfe;
        }

        .empty-icon {
          font-size: 38px;

          margin-bottom: 10px;
        }

        .empty-state h2 {
          margin: 0;

          color: #344054;

          font-size: 16px;
        }

        .empty-state p {
          margin-top: 7px;

          color: #98a2b3;

          font-size: 10px;
        }

        /* =========================
           RESPONSIVE
        ========================= */

        @media (max-width: 700px) {

          .courses-topbar {
            padding:
              0 18px;
          }

          .courses-content {
            padding:
              28px 18px 40px;
          }

          .page-heading {
            align-items: flex-start;

            flex-direction: column;
          }

          .course-count {
            align-self: flex-start;
          }

        }

        @media (max-width: 450px) {

          .brand-subtitle {
            display: none;
          }

          .brand-title {
            font-size: 14px;
          }

          .back-button {
            padding:
              8px 10px;

            font-size: 9px;
          }

          .courses-content {
            padding:
              24px 13px 35px;
          }

          .page-heading h1 {
            font-size: 25px;
          }

        }

      `}</style>

      {/* =========================
          TOP BAR
      ========================= */}

      <header className="courses-topbar">

        <div
          className="courses-brand"
          onClick={() =>
            navigate("/dashboard")
          }
        >

          <div className="brand-logo">
            E
          </div>

          <div>

            <div className="brand-title">
              edu<span>nexus.ai</span>
            </div>

            <div className="brand-subtitle">
              AI LEARNING PLATFORM
            </div>

          </div>

        </div>

        <button
          className="back-button"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          ← Dashboard
        </button>

      </header>

      {/* =========================
          CONTENT
      ========================= */}

      <main className="courses-content">

        <div className="page-heading">

          <div>

            <div className="heading-label">
              Learning Library
            </div>

            <h1>
              Explore Courses
            </h1>

            <p>
              Build practical skills with
              structured learning experiences.
            </p>

          </div>

          {!loading &&
            !error &&
            courses.length > 0 && (
              <div className="course-count">
                {courses.length}{" "}
                {courses.length === 1
                  ? "Course"
                  : "Courses"}{" "}
                Available
              </div>
            )}

        </div>

        {/* =========================
            LOADING
        ========================= */}

        {loading && (

          <div className="loading-box">

            <div className="loading-icon" />

            <p>
              Loading your courses...
            </p>

          </div>

        )}

        {/* =========================
            ERROR
        ========================= */}

        {error && (

          <div className="error-box">
            {error}
          </div>

        )}

        {/* =========================
            COURSES
        ========================= */}

        {!loading &&
          !error &&
          courses.length > 0 && (

            <div className="course-grid">

              {courses.map((course) => {

                const courseProgress =
                  progress[course.id] ?? 0;

                const completed =
                  courseProgress === 100;

                return (

                  <article
                    key={course.id}
                    className="course-card"
                  >

                    {/* VISUAL */}

                    <div className="course-visual">

                      <div className="category-badge">
                        {course.category ||
                          "General"}
                      </div>

                      <div className="course-icon">
                        📚
                      </div>

                    </div>

                    {/* BODY */}

                    <div className="course-body">

                      <h2 className="course-title">
                        {course.title}
                      </h2>

                      <p className="course-description">
                        {course.description ||
                          "Continue learning and develop your skills with EduNexus AI."}
                      </p>

                      {/* INFO */}

                      <div className="course-info">

                        <div className="info-item">
                          👨‍🏫{" "}
                          {course.instructor ||
                            "EduNexus AI"}
                        </div>

                        <span className="info-divider">
                          •
                        </span>

                        <div className="info-item">
                          🎓 Student Course
                        </div>

                      </div>

                      {/* PROGRESS */}

                      <div>

                        <div className="progress-header">

                          <span className="progress-label">
                            Your Progress
                          </span>

                          <span className="progress-percent">
                            {courseProgress}%
                          </span>

                        </div>

                        <div className="progress-track">

                          <div
                            className="progress-fill"
                            style={{
                              width:
                                `${courseProgress}%`,
                            }}
                          />

                        </div>

                      </div>

                      <div
                        className={
                          completed
                            ? "course-status completed"
                            : "course-status"
                        }
                      >
                        {completed
                          ? "✓ Course completed"
                          : `${courseProgress}% completed`}
                      </div>

                      {/* BUTTON */}

                      <button
                        className="open-course"
                        onClick={() =>
                          openCourse(course.id)
                        }
                      >
                        {completed
                          ? "Review Course →"
                          : "Continue Learning →"}
                      </button>

                    </div>

                  </article>

                );
              })}

            </div>

          )}

        {/* =========================
            EMPTY STATE
        ========================= */}

        {!loading &&
          !error &&
          courses.length === 0 && (

            <div className="empty-state">

              <div className="empty-icon">
                📚
              </div>

              <h2>
                No courses available yet
              </h2>

              <p>
                Your available courses will
                appear here.
              </p>

            </div>

          )}

      </main>

    </div>
  );
}

export default Courses;