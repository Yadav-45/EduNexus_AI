import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import { API_BASE_URL } from "../api/config";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Sparkles,
  Bot,
  PlayCircle,
  Award,
  AlertCircle,
  ArrowRight,
  Flame,
  Check
} from "lucide-react";

export default function Learning() {
  const navigate = useNavigate();
  const courseId = 1;

  const lessons = [
    {
      number: 1,
      title: "Introduction to Python Architecture",
      description: "Learn Python design principles, runtime execution, and syntax conventions.",
      topics: [
        "What is Python?",
        "Setting up Virtual Environments",
        "Running your first script",
        "Basic syntactic structure",
      ],
    },
    {
      number: 2,
      title: "Variables and Data Typings",
      description: "How Python allocates memory and handles primitive data types dynamically.",
      topics: [
        "Variable instantiation",
        "Strings and string interpolation",
        "Integers and floating points",
        "Boolean logic and truthiness",
      ],
    },
    {
      number: 3,
      title: "Conditional Flow and Iteration",
      description: "Branching execution paths with conditionals and loops.",
      topics: [
        "if, elif, and else logic",
        "Ternary operator expressions",
        "for loops with range generators",
        "while loops and break / continue controls",
      ],
    },
    {
      number: 4,
      title: "Modular Functions and Scoping",
      description: "Encapsulating reusable logic, return contracts, and parameter types.",
      topics: [
        "def statements and arguments",
        "Positional and keyword arguments",
        "Return statements and tuples",
        "Variable scope and closures",
      ],
    },
    {
      number: 5,
      title: "Data Collections (Lists, Dicts, Tuples)",
      description: "Composite data structures, fast key lookups, and iteration idioms.",
      topics: [
        "List indexing and slicing",
        "Immutable Tuples",
        "Dictionary hash map lookups",
        "List and dictionary comprehensions",
      ],
    },
    {
      number: 6,
      title: "I/O File Operations and Exception Handling",
      description: "Stream manipulation, persistent disk storage, and graceful error catching.",
      topics: [
        "with open context managers",
        "Reading and writing text & JSON",
        "try, except, and finally blocks",
        "Custom exception classes",
      ],
    },
    {
      number: 7,
      title: "Object-Oriented Architecture (OOP)",
      description: "Domain modeling with classes, instances, inheritance, and encapsulation.",
      topics: [
        "Class blueprints and __init__",
        "Instance vs class attributes",
        "Methods and self binding",
        "Inheritance and method overriding",
      ],
    },
    {
      number: 8,
      title: "Capstone Project and Production Practice",
      description: "Synthesize all concepts into an autonomous command-line utility.",
      topics: [
        "Architecting software requirements",
        "Implementing core modules",
        "Unit testing with pytest",
        "Final code review with AI Copilot",
      ],
    },
  ];

  const [completedLessons, setCompletedLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completingLesson, setCompletingLesson] = useState(null);
  const [error, setError] = useState("");

  const progressPercent = Math.round((completedLessons.length / lessons.length) * 100);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`${API_BASE_URL}/courses/${courseId}/progress`);
        if (!response.ok) throw new Error("Failed to load progress");
        const data = await response.json();
        if (data.completed_lessons) {
          setCompletedLessons(data.completed_lessons);
        }
      } catch (err) {
        console.error("Learning progress error:", err);
        setError("Unable to synchronize lesson completion status.");
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, []);

  const handleCompleteLesson = async (lessonNumber) => {
    if (completedLessons.includes(lessonNumber)) return;
    setCompletingLesson(lessonNumber);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson_number: lessonNumber }),
      });

      if (!response.ok) throw new Error("Failed to record lesson completion");
      setCompletedLessons((prev) => (prev.includes(lessonNumber) ? prev : [...prev, lessonNumber]));
    } catch (err) {
      console.error("Complete lesson error:", err);
      setError("Unable to save completion milestone.");
    } finally {
      setCompletingLesson(null);
    }
  };

  return (
    <AppLayout
      title="Interactive Learning Engine"
      subtitle="Structured mastery syllabus, concept breakdown, and milestone verification."
      actions={
        <button
          onClick={() => navigate("/ai-tutor")}
          className="btn btn-primary"
          style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
        >
          <Bot size={16} />
          Ask Neural Tutor
        </button>
      }
    >
      {/* HERO / PROGRESS STRIP */}
      <div
        className="card"
        style={{
          padding: "24px",
          marginBottom: "24px",
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)",
          border: "1px solid rgba(99, 102, 241, 0.25)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "999px",
                  fontSize: "11px",
                  fontWeight: 700,
                  background: "rgba(6, 182, 212, 0.15)",
                  color: "var(--accent-cyan)",
                  border: "1px solid rgba(6, 182, 212, 0.3)",
                  textTransform: "uppercase",
                }}
              >
                Track 01 • Python Foundations
              </span>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                <Flame size={14} style={{ color: "var(--accent-amber)" }} /> 8 Core Lessons
              </span>
            </div>
            <h2 style={{ margin: "0 0 6px", fontSize: "22px", fontWeight: 800, color: "var(--text-bright)" }}>
              Modern Python Programming
            </h2>
            <p style={{ margin: 0, fontSize: "13.5px", color: "var(--text-secondary)", maxWidth: "560px" }}>
              Master clean Python syntax, data structures, functional paradigms, and object-oriented architecture.
            </p>
          </div>

          <div
            style={{
              minWidth: "220px",
              background: "rgba(0, 0, 0, 0.3)",
              padding: "16px 20px",
              borderRadius: "12px",
              border: "1px solid var(--border-default)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", marginBottom: "8px" }}>
              <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>Track Mastery</span>
              <span style={{ color: progressPercent === 100 ? "var(--accent-emerald)" : "var(--accent-cyan)", fontWeight: 800 }}>
                {progressPercent}%
              </span>
            </div>
            <div
              style={{
                width: "100%",
                height: "8px",
                borderRadius: "999px",
                background: "rgba(255, 255, 255, 0.08)",
                overflow: "hidden",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  width: `${progressPercent}%`,
                  height: "100%",
                  borderRadius: "999px",
                  background: progressPercent === 100
                    ? "linear-gradient(90deg, #10b981, #34d399)"
                    : "linear-gradient(90deg, #6366f1, #06b6d4)",
                  transition: "width 0.4s ease",
                }}
              />
            </div>
            <div style={{ fontSize: "11.5px", color: "var(--text-muted)", textAlign: "right" }}>
              {completedLessons.length} of {lessons.length} milestones complete
            </div>
          </div>
        </div>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "12px",
            padding: "16px 20px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#f87171",
          }}
        >
          <AlertCircle size={18} />
          <span style={{ fontSize: "13.5px" }}>{error}</span>
        </div>
      )}

      {/* LESSONS GRID */}
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
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading learning modules...</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          {lessons.map((lesson) => {
            const isCompleted = completedLessons.includes(lesson.number);
            const isSavingThis = completingLesson === lesson.number;

            return (
              <div
                key={lesson.number}
                className="card"
                style={{
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  borderColor: isCompleted ? "rgba(16, 185, 129, 0.3)" : "var(--border-default)",
                  background: isCompleted
                    ? "linear-gradient(180deg, rgba(16, 185, 129, 0.04) 0%, var(--bg-surface) 100%)"
                    : "var(--bg-surface)",
                  transition: "transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 12px 30px rgba(0, 0, 0, 0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "8px",
                          background: isCompleted ? "rgba(16, 185, 129, 0.2)" : "rgba(99, 102, 241, 0.15)",
                          color: isCompleted ? "var(--accent-emerald)" : "var(--accent-indigo-light)",
                          border: isCompleted ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(99, 102, 241, 0.3)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "13px",
                          fontWeight: 800,
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {lesson.number}
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
                        Lesson {lesson.number}
                      </span>
                    </div>

                    {isCompleted ? (
                      <span className="badge badge-success" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <Check size={12} /> Complete
                      </span>
                    ) : (
                      <span className="badge badge-warning">Pending</span>
                    )}
                  </div>

                  <h3 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 700, color: "var(--text-bright)" }}>
                    {lesson.title}
                  </h3>
                  <p style={{ margin: "0 0 18px", fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.55 }}>
                    {lesson.description}
                  </p>

                  <div style={{ marginBottom: "20px" }}>
                    <div style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "8px" }}>
                      Key Topics Covered:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                      {lesson.topics.map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button
                    onClick={() => handleCompleteLesson(lesson.number)}
                    disabled={isCompleted || isSavingThis}
                    className={isCompleted ? "btn btn-secondary" : "btn btn-primary"}
                    style={{ flex: 1, justifyContent: "center", fontSize: "13px" }}
                  >
                    {isCompleted ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <CheckCircle2 size={15} style={{ color: "var(--accent-emerald)" }} /> Completed
                      </span>
                    ) : isSavingThis ? (
                      "Recording..."
                    ) : (
                      "Mark Complete"
                    )}
                  </button>

                  <button
                    onClick={() => navigate("/ai-tutor")}
                    title="Ask AI Tutor about this lesson"
                    className="btn btn-secondary"
                    style={{ padding: "0 12px" }}
                  >
                    <Bot size={16} />
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