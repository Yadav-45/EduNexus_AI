import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Learning() {
  const navigate = useNavigate();

  const courseId = 1;

  const lessons = [
    {
      number: 1,
      title: "Introduction to Python",
      description:
        "Learn what Python is, why it is popular, and where it is used.",
      topics: [
        "What is Python?",
        "Installing Python",
        "Running your first Python program",
        "Python syntax",
      ],
    },
    {
      number: 2,
      title: "Variables and Data Types",
      description:
        "Learn how Python stores information using variables and different data types.",
      topics: [
        "Creating variables",
        "Strings",
        "Integers and floats",
        "Boolean values",
      ],
    },
    {
      number: 3,
      title: "Conditions and Loops",
      description:
        "Learn how to make decisions and repeat tasks in Python programs.",
      topics: [
        "if statements",
        "else and elif",
        "for loops",
        "while loops",
      ],
    },
    {
      number: 4,
      title: "Functions",
      description:
        "Learn how to create reusable blocks of code using functions.",
      topics: [
        "Creating functions",
        "Function parameters",
        "Return values",
        "Reusable code",
      ],
    },
    {
      number: 5,
      title: "Lists, Tuples and Dictionaries",
      description:
        "Learn how to store and organize multiple pieces of information.",
      topics: [
        "Lists",
        "Tuples",
        "Dictionaries",
        "Working with collections",
      ],
    },
    {
      number: 6,
      title: "Files and Exceptions",
      description:
        "Learn how to work with files and handle errors in Python programs.",
      topics: [
        "Reading files",
        "Writing files",
        "try and except",
        "Handling errors",
      ],
    },
    {
      number: 7,
      title: "Object-Oriented Programming",
      description:
        "Learn the basics of classes and objects in Python.",
      topics: [
        "Classes",
        "Objects",
        "Methods",
        "Inheritance basics",
      ],
    },
    {
      number: 8,
      title: "Python Project and Final Practice",
      description:
        "Use everything you learned to build a simple Python project.",
      topics: [
        "Planning a project",
        "Writing the program",
        "Testing your code",
        "Final practice",
      ],
    },
  ];

  const [completedLessons, setCompletedLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completingLesson, setCompletingLesson] =
    useState(null);
  const [error, setError] = useState("");

  const progress =
    (completedLessons.length / lessons.length) * 100;

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/courses/${courseId}/progress`
        );

        if (!response.ok) {
          throw new Error("Failed to load progress");
        }

        const data = await response.json();

        if (data.completed_lessons) {
          setCompletedLessons(data.completed_lessons);
        }

        setLoading(false);
      } catch (error) {
        console.error(error);

        setError(
          "Unable to load course progress."
        );

        setLoading(false);
      }
    };

    loadProgress();
  }, []);

  const handleCompleteLesson = async (lessonNumber) => {
    if (completedLessons.includes(lessonNumber)) {
      return;
    }

    setCompletingLesson(lessonNumber);
    setError("");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/courses/${courseId}/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lesson_number: lessonNumber,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to complete lesson"
        );
      }

      setCompletedLessons((previous) => {
        if (previous.includes(lessonNumber)) {
          return previous;
        }

        return [...previous, lessonNumber];
      });
    } catch (error) {
      console.error(error);

      setError(
        "Unable to save lesson progress."
      );
    } finally {
      setCompletingLesson(null);
    }
  };

  if (loading) {
    return (
      <div className="learning-loading">
        <style>{`
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
          }

          .learning-loading {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
            font-family:
              Inter,
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              Arial,
              sans-serif;
          }

          .loading-box {
            width: 220px;
            padding: 28px;
            text-align: center;
            background: #ffffff;
            border: 1px solid #e4e7ec;
            border-radius: 16px;
            box-shadow:
              0 10px 30px rgba(16, 24, 40, 0.06);
          }

          .spinner {
            width: 38px;
            height: 38px;
            margin: 0 auto 14px;
            border: 3px solid #e7edf5;
            border-top-color: #2563eb;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          .loading-title {
            margin: 0;
            color: #101828;
            font-size: 12px;
            font-weight: 750;
          }

          .loading-text {
            margin: 5px 0 0;
            color: #98a2b3;
            font-size: 9px;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>

        <div className="loading-box">
          <div className="spinner" />

          <p className="loading-title">
            Loading learning path
          </p>

          <p className="loading-text">
            Preparing your lessons...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="learning-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #f8fafc;
        }

        button {
          font-family: inherit;
        }

        .learning-page {
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

        /* =========================
           TOP HEADER
        ========================= */

        .learning-header {
          height: 70px;
          background: #ffffff;
          border-bottom: 1px solid #eaecf0;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 0 42px;

          position: sticky;
          top: 0;
          z-index: 50;
        }

        .learning-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .brand-mark {
          width: 34px;
          height: 34px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 9px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #4f46e5
            );

          color: #ffffff;
          font-size: 15px;
          font-weight: 850;

          box-shadow:
            0 5px 12px
            rgba(37, 99, 235, 0.16);
        }

        .brand-name {
          color: #101828;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: -0.4px;
        }

        .brand-name span {
          color: #2563eb;
        }

        .brand-caption {
          margin-top: 2px;
          color: #98a2b3;
          font-size: 7px;
          font-weight: 700;
          letter-spacing: 0.7px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .header-button {
          padding: 8px 13px;

          border: 1px solid #dfe4ea;
          border-radius: 8px;

          background: #ffffff;
          color: #475467;

          font-size: 9px;
          font-weight: 750;

          cursor: pointer;

          transition: 0.18s ease;
        }

        .header-button:hover {
          color: #2563eb;
          border-color: #bfd3f2;
          background: #f8fbff;
        }

        /* =========================
           PAGE CONTENT
        ========================= */

        .learning-content {
          max-width: 1160px;
          margin: 0 auto;
          padding: 32px 38px 55px;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 7px;

          margin-bottom: 20px;

          color: #98a2b3;
          font-size: 9px;
          font-weight: 650;
        }

        .breadcrumb button {
          padding: 0;
          border: none;
          background: transparent;

          color: #667085;
          font-size: 9px;
          font-weight: 750;

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

        .learning-hero {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 260px;
          gap: 18px;

          margin-bottom: 24px;
        }

        .hero-main {
          position: relative;
          overflow: hidden;

          min-height: 225px;
          padding: 28px;

          border: 1px solid #dfe6ef;
          border-radius: 18px;

          background:
            linear-gradient(
              135deg,
              #f5f9ff 0%,
              #eef3fb 100%
            );

          box-shadow:
            0 4px 18px
            rgba(16, 24, 40, 0.035);
        }

        .hero-main::before {
          content: "";

          position: absolute;

          width: 260px;
          height: 260px;

          right: -100px;
          top: -135px;

          border-radius: 50%;

          background:
            rgba(37, 99, 235, 0.06);
        }

        .hero-main::after {
          content: "";

          position: absolute;

          width: 130px;
          height: 130px;

          right: 45px;
          bottom: -85px;

          border-radius: 50%;

          background:
            rgba(79, 70, 229, 0.035);
        }

        .hero-content {
          position: relative;
          z-index: 2;
        }

        .course-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;

          padding: 6px 10px;

          border: 1px solid #d6e2f2;
          border-radius: 7px;

          background: rgba(255, 255, 255, 0.8);

          color: #2563eb;

          font-size: 8px;
          font-weight: 800;

          text-transform: uppercase;
          letter-spacing: 0.6px;
        }

        .course-pill-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #2563eb;
        }

        .hero-title {
          max-width: 600px;

          margin: 16px 0 9px;

          color: #101828;

          font-size: 29px;
          line-height: 1.18;
          font-weight: 850;

          letter-spacing: -1px;
        }

        .hero-description {
          max-width: 620px;

          margin: 0;

          color: #667085;

          font-size: 10px;
          line-height: 1.7;
        }

        .hero-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 18px;

          margin-top: 20px;
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
          background: #ffffff;

          border: 1px solid #e1e6ed;
          border-radius: 18px;

          padding: 22px;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          text-align: center;

          box-shadow:
            0 4px 18px
            rgba(16, 24, 40, 0.035);
        }

        .progress-card-label {
          color: #98a2b3;

          font-size: 8px;
          font-weight: 800;

          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .progress-circle {
          width: 128px;
          height: 128px;

          margin: 13px 0;

          border-radius: 50%;

          display: flex;
          align-items: center;
          justify-content: center;

          position: relative;
        }

        .progress-circle::after {
          content: "";

          position: absolute;

          width: 99px;
          height: 99px;

          border-radius: 50%;

          background: #ffffff;
        }

        .progress-number {
          position: relative;
          z-index: 2;

          color: #101828;

          font-size: 25px;
          font-weight: 850;
        }

        .progress-status {
          color: #344054;

          font-size: 9px;
          font-weight: 750;
        }

        .progress-lessons {
          margin-top: 4px;

          color: #98a2b3;

          font-size: 8px;
        }

        /* =========================
           ERROR
        ========================= */

        .error-message {
          margin-bottom: 18px;

          padding: 11px 14px;

          border: 1px solid #fecaca;
          border-radius: 9px;

          background: #fff7f7;

          color: #b91c1c;

          font-size: 9px;
          font-weight: 650;
        }

        /* =========================
           CURRICULUM HEADER
        ========================= */

        .lessons-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;

          margin-bottom: 13px;
        }

        .heading-label {
          margin-bottom: 5px;

          color: #2563eb;

          font-size: 8px;
          font-weight: 850;

          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .lessons-heading h2 {
          margin: 0;

          color: #101828;

          font-size: 19px;
          font-weight: 820;

          letter-spacing: -0.4px;
        }

        .lesson-count {
          color: #98a2b3;

          font-size: 9px;
          font-weight: 650;
        }

        /* =========================
           LESSON CARDS
        ========================= */

        .lesson-card {
          margin-bottom: 11px;

          background: #ffffff;

          border: 1px solid #e4e7ec;
          border-radius: 14px;

          overflow: hidden;

          box-shadow:
            0 2px 10px
            rgba(16, 24, 40, 0.025);

          transition:
            transform 0.18s ease,
            border-color 0.18s ease,
            box-shadow 0.18s ease;
        }

        .lesson-card:hover {
          transform: translateY(-1px);

          border-color: #d4deeb;

          box-shadow:
            0 7px 20px
            rgba(16, 24, 40, 0.05);
        }

        .lesson-card.completed {
          border-color: #c7e8d0;
        }

        .lesson-top {
          display: flex;
          align-items: center;
          gap: 13px;

          padding: 17px 18px;
        }

        .lesson-number {
          width: 40px;
          height: 40px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 11px;

          background: #f1f6fd;
          border: 1px solid #dfe8f4;

          color: #2563eb;

          font-size: 12px;
          font-weight: 850;
        }

        .lesson-card.completed .lesson-number {
          background: #ecfdf3;
          border-color: #c9ecd3;
          color: #16a34a;
        }

        .lesson-heading {
          min-width: 0;
          flex: 1;
        }

        .lesson-label {
          margin-bottom: 3px;

          color: #98a2b3;

          font-size: 7px;
          font-weight: 850;

          text-transform: uppercase;
          letter-spacing: 0.65px;
        }

        .lesson-title {
          margin: 0;

          color: #172033;

          font-size: 13px;
          line-height: 1.3;
          font-weight: 800;
        }

        .completed-badge {
          flex-shrink: 0;

          padding: 5px 9px;

          border: 1px solid #c9ecd3;
          border-radius: 20px;

          background: #ecfdf3;

          color: #16a34a;

          font-size: 7px;
          font-weight: 850;

          white-space: nowrap;
        }

        .lesson-divider {
          height: 1px;
          background: #f0f2f5;
        }

        .lesson-body {
          padding: 17px 18px 18px 71px;
        }

        .lesson-description {
          max-width: 780px;

          margin: 0 0 14px;

          color: #667085;

          font-size: 9px;
          line-height: 1.65;
        }

        .topics-label {
          margin-bottom: 8px;

          color: #344054;

          font-size: 8px;
          font-weight: 800;
        }

        .topics {
          display: grid;
          grid-template-columns: 1fr 1fr;

          gap: 7px;

          margin-bottom: 16px;
        }

        .topic {
          display: flex;
          align-items: center;
          gap: 7px;

          min-height: 24px;

          color: #667085;

          font-size: 8px;
          line-height: 1.4;
        }

        .topic-dot {
          width: 5px;
          height: 5px;

          flex-shrink: 0;

          border-radius: 50%;

          background: #2563eb;
        }

        .complete-button {
          min-width: 170px;

          padding: 9px 13px;

          border: none;
          border-radius: 8px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #4f46e5
            );

          color: #ffffff;

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
          transform: translateY(-1px);

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
           COMPLETION BANNER
        ========================= */

        .completion-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;

          margin-top: 19px;
          padding: 19px 21px;

          border: 1px solid #b7e4c3;
          border-radius: 14px;

          background:
            linear-gradient(
              135deg,
              #f1fcf4,
              #ecfdf3
            );
        }

        .completion-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .completion-icon {
          width: 42px;
          height: 42px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: #dcfce7;

          font-size: 18px;
        }

        .completion-title {
          margin: 0;

          color: #166534;

          font-size: 13px;
          font-weight: 800;
        }

        .completion-text {
          margin: 4px 0 0;

          color: #4d7c5a;

          font-size: 8px;
        }

        .dashboard-link {
          flex-shrink: 0;

          padding: 9px 14px;

          border: 1px solid #b7e4c3;
          border-radius: 8px;

          background: #ffffff;

          color: #166534;

          font-size: 9px;
          font-weight: 750;

          cursor: pointer;
        }

        .dashboard-link:hover {
          background: #f5fff7;
        }

        /* =========================
           RESPONSIVE
        ========================= */

        @media (max-width: 850px) {
          .learning-hero {
            grid-template-columns: 1fr;
          }

          .progress-card {
            min-height: 210px;
          }
        }

        @media (max-width: 650px) {
          .learning-header {
            padding: 0 18px;
          }

          .learning-content {
            padding: 25px 18px 40px;
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

          .completed-badge {
            display: none;
          }

          .lesson-body {
            padding: 16px 18px 18px;
          }

          .topics {
            grid-template-columns: 1fr;
          }

          .completion-banner {
            align-items: flex-start;
            flex-direction: column;
          }

          .dashboard-link {
            width: 100%;
          }
        }

        @media (max-width: 430px) {
          .learning-header {
            height: 64px;
          }

          .brand-name {
            font-size: 14px;
          }

          .header-button {
            padding: 7px 9px;
            font-size: 8px;
          }

          .learning-content {
            padding: 21px 13px 35px;
          }

          .hero-title {
            font-size: 22px;
          }

          .hero-description {
            font-size: 9px;
          }
        }
      `}</style>

      {/* =========================
          HEADER
      ========================= */}

      <header className="learning-header">
        <div
          className="learning-brand"
          onClick={() => navigate("/dashboard")}
        >
          <div className="brand-mark">E</div>

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
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>

          <button
            className="header-button"
            onClick={() => navigate("/courses")}
          >
            ← Courses
          </button>
        </div>
      </header>

      {/* =========================
          CONTENT
      ========================= */}

      <main className="learning-content">
        <div className="breadcrumb">
          <button
            onClick={() => navigate("/courses")}
          >
            Courses
          </button>

          <span className="breadcrumb-arrow">
            /
          </span>

          <span>Learning Path</span>
        </div>

        {/* =========================
            HERO
        ========================= */}

        <section className="learning-hero">
          <div className="hero-main">
            <div className="hero-content">
              <div className="course-pill">
                <span className="course-pill-dot" />
                Python Programming
              </div>

              <h1 className="hero-title">
                Your Learning Path
              </h1>

              <p className="hero-description">
                Welcome to your complete Python
                learning course. Work through each
                lesson step by step and build your
                programming skills.
              </p>

              <div className="hero-meta">
                <div className="hero-meta-item">
                  <span className="hero-meta-icon">
                    📚
                  </span>
                  8 Lessons
                </div>

                <div className="hero-meta-item">
                  <span className="hero-meta-icon">
                    🎯
                  </span>
                  Practical Learning
                </div>

                <div className="hero-meta-item">
                  <span className="hero-meta-icon">
                    ✦
                  </span>
                  AI Supported
                </div>
              </div>
            </div>
          </div>

          <div className="progress-card">
            <div className="progress-card-label">
              Course Progress
            </div>

            <div
              className="progress-circle"
              style={{
                background: `conic-gradient(
                  #2563eb
                  ${progress}%,
                  #e8edf3
                  ${progress}% 100%
                )`,
              }}
            >
              <div className="progress-number">
                {Math.round(progress)}%
              </div>
            </div>

            <div className="progress-status">
              {progress === 100
                ? "Course completed"
                : "Keep going"}
            </div>

            <div className="progress-lessons">
              {completedLessons.length} of{" "}
              {lessons.length} lessons completed
            </div>
          </div>
        </section>

        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* =========================
            LESSON HEADER
        ========================= */}

        <div className="lessons-heading">
          <div>
            <div className="heading-label">
              Curriculum
            </div>

            <h2>Course Lessons</h2>
          </div>

          <div className="lesson-count">
            {completedLessons.length}/
            {lessons.length} completed
          </div>
        </div>

        {/* =========================
            LESSONS
        ========================= */}

        <section>
          {lessons.map((lesson) => {
            const isCompleted =
              completedLessons.includes(
                lesson.number
              );

            const isCompleting =
              completingLesson === lesson.number;

            return (
              <article
                key={lesson.number}
                className={
                  isCompleted
                    ? "lesson-card completed"
                    : "lesson-card"
                }
              >
                <div className="lesson-top">
                  <div className="lesson-number">
                    {isCompleted
                      ? "✓"
                      : lesson.number}
                  </div>

                  <div className="lesson-heading">
                    <div className="lesson-label">
                      Lesson {lesson.number}
                    </div>

                    <h3 className="lesson-title">
                      {lesson.title}
                    </h3>
                  </div>

                  {isCompleted && (
                    <div className="completed-badge">
                      ✓ Completed
                    </div>
                  )}
                </div>

                <div className="lesson-divider" />

                <div className="lesson-body">
                  <p className="lesson-description">
                    {lesson.description}
                  </p>

                  <div className="topics-label">
                    What you'll learn
                  </div>

                  <div className="topics">
                    {lesson.topics.map(
                      (topic, index) => (
                        <div
                          className="topic"
                          key={index}
                        >
                          <span className="topic-dot" />
                          {topic}
                        </div>
                      )
                    )}
                  </div>

                  <button
                    className={
                      isCompleted
                        ? "complete-button completed-button"
                        : "complete-button"
                    }
                    onClick={() =>
                      handleCompleteLesson(
                        lesson.number
                      )
                    }
                    disabled={
                      isCompleted ||
                      isCompleting
                    }
                  >
                    {isCompleting
                      ? "Saving..."
                      : isCompleted
                      ? "Completed ✓"
                      : `Complete Lesson ${lesson.number}`}
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        {/* =========================
            COMPLETION
        ========================= */}

        {progress === 100 && (
          <section className="completion-banner">
            <div className="completion-content">
              <div className="completion-icon">
                🎉
              </div>

              <div>
                <h2 className="completion-title">
                  Congratulations!
                </h2>

                <p className="completion-text">
                  You've completed all 8 lessons
                  in Python Programming.
                </p>
              </div>
            </div>

            <button
              className="dashboard-link"
              onClick={() =>
                navigate("/dashboard")
              }
            >
              Back to Dashboard
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

export default Learning;