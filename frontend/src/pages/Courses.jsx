import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { API_BASE_URL } from "../api/config";
import {
  BookOpen,
  Sparkles,
  Clock,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  Bookmark,
  Layers,
  Search,
  Filter
} from "lucide-react";

export default function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        setError("");

        const coursesResponse = await fetch(`${API_BASE_URL}/courses`);
        if (!coursesResponse.ok) {
          throw new Error("Failed to fetch course catalog");
        }

        const coursesData = await coursesResponse.json();
        setCourses(coursesData);

        const progressData = {};
        for (const course of coursesData) {
          try {
            const progressResponse = await fetch(
              `${API_BASE_URL}/courses/${course.id}/progress`
            );
            if (progressResponse.ok) {
              const res = await progressResponse.json();
              progressData[course.id] = Math.round(res.progress || 0);
            } else {
              progressData[course.id] = 0;
            }
          } catch {
            progressData[course.id] = 0;
          }
        }

        setProgress(progressData);
      } catch (err) {
        console.error("Courses loading error:", err);
        setError("Unable to load course catalog. Please verify that the server is operational.");
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const openCourse = (courseId) => {
    navigate(`/course-details?id=${courseId}`);
  };

  const categories = Array.from(
    new Set(courses.map((c) => c.category || "General"))
  );

  const filteredCourses = courses.filter((c) => {
    const matchesCat = filterCategory === "ALL" || (c.category || "General") === filterCategory;
    const matchesSearch =
      !searchTerm ||
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <AppLayout
      title="Academic Courses"
      subtitle="Curriculum syllabus, subject modules, and self-paced AI learning tracks."
      actions={
        <button
          onClick={() => navigate("/learning")}
          className="btn btn-primary"
          style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
        >
          <Sparkles size={16} />
          Go to Learning Workspace
        </button>
      }
    >
      {/* FILTER & SEARCH */}
      <div
        className="card"
        style={{
          padding: "16px 20px",
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: "1 1 300px", maxWidth: "400px" }}>
          <div style={{ position: "relative", width: "100%" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              type="text"
              placeholder="Search courses or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ paddingLeft: "40px", height: "40px", fontSize: "13.5px" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={() => setFilterCategory("ALL")}
            style={{
              padding: "7px 14px",
              borderRadius: "8px",
              fontSize: "12.5px",
              fontWeight: 600,
              cursor: "pointer",
              border: filterCategory === "ALL" ? "1px solid var(--accent-indigo)" : "1px solid var(--border-default)",
              background: filterCategory === "ALL" ? "rgba(99, 102, 241, 0.15)" : "transparent",
              color: filterCategory === "ALL" ? "var(--accent-indigo-light)" : "var(--text-secondary)",
            }}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              style={{
                padding: "7px 14px",
                borderRadius: "8px",
                fontSize: "12.5px",
                fontWeight: 600,
                cursor: "pointer",
                border: filterCategory === cat ? "1px solid var(--accent-indigo)" : "1px solid var(--border-default)",
                background: filterCategory === cat ? "rgba(99, 102, 241, 0.15)" : "transparent",
                color: filterCategory === cat ? "var(--accent-indigo-light)" : "var(--text-secondary)",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "12px",
            padding: "16px 20px",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "#f87171",
          }}
        >
          <AlertCircle size={20} />
          <span style={{ fontSize: "14px" }}>{error}</span>
        </div>
      )}

      {/* COURSES GRID */}
      {loading ? (
        <div style={{ padding: "80px 20px", textAlign: "center" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              border: "3px solid rgba(255, 255, 255, 0.1)",
              borderTopColor: "var(--accent-indigo)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading curriculum catalog...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="card" style={{ padding: "70px 20px", textAlign: "center" }}>
          <BookOpen size={48} style={{ color: "var(--text-muted)", opacity: 0.6, margin: "0 auto 16px" }} />
          <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-bright)", margin: "0 0 8px" }}>
            No courses found
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", maxWidth: "400px", margin: "0 auto" }}>
            {searchTerm ? "No courses match your query filter." : "There are currently no active courses registered in the syllabus."}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          {filteredCourses.map((course) => {
            const courseProgress = progress[course.id] ?? 0;
            const completed = courseProgress === 100;

            return (
              <div
                key={course.id}
                className="card"
                style={{
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.35)";
                  e.currentTarget.style.boxShadow = "0 12px 30px rgba(0, 0, 0, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "var(--border-default)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "999px",
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                        background: "rgba(99, 102, 241, 0.15)",
                        color: "var(--accent-indigo-light)",
                        border: "1px solid rgba(99, 102, 241, 0.25)",
                        textTransform: "uppercase",
                      }}
                    >
                      {course.category || "General"}
                    </span>

                    <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <User size={12} /> {course.instructor || "EduNexus AI"}
                    </span>
                  </div>

                  <h3 style={{ margin: "0 0 8px", fontSize: "17px", fontWeight: 700, color: "var(--text-bright)" }}>
                    {course.title}
                  </h3>
                  <p style={{ margin: "0 0 20px", fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.55 }}>
                    {course.description || "Continue structured learning and develop your mastery with EduNexus AI."}
                  </p>
                </div>

                <div>
                  {/* PROGRESS BAR */}
                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px" }}>
                      <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Mastery Progress</span>
                      <span style={{ color: completed ? "var(--accent-emerald)" : "var(--accent-cyan)", fontWeight: 700 }}>
                        {courseProgress}%
                      </span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: "6px",
                        borderRadius: "999px",
                        background: "rgba(255, 255, 255, 0.08)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${courseProgress}%`,
                          height: "100%",
                          borderRadius: "999px",
                          background: completed
                            ? "linear-gradient(90deg, #10b981, #34d399)"
                            : "linear-gradient(90deg, #6366f1, #06b6d4)",
                          transition: "width 0.4s ease",
                        }}
                      />
                    </div>
                  </div>

                  {/* ACTION BUTTON */}
                  <button
                    onClick={() => openCourse(course.id)}
                    className={completed ? "btn btn-secondary" : "btn btn-primary"}
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13.5px",
                    }}
                  >
                    <span>{completed ? "Review Course" : "Continue Track"}</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}