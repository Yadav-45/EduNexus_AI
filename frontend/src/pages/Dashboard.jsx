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
  Calendar,
  CreditCard,
  QrCode,
  Send,
  HelpCircle,
  ChevronRight,
  Check,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

const AI_TUTOR_STORAGE_KEY = "edunexus_ai_tutor_messages";

export default function Dashboard() {
  const navigate = useNavigate();

  const [studentName, setStudentName] = useState("Aarav Sharma");
  const [studentEmail, setStudentEmail] = useState("aarav.sharma@edunexus.edu.np");
  const [studentRole, setStudentRole] = useState("कक्षा १० (SEE Candidate) · Section A");
  const [courseProgress, setCourseProgress] = useState(68);
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      title: "अनिवार्य गणित: वृत्त र चक्रीय चतुर्भुज (Circles Theorem 4)",
      course: "Compulsory Mathematics",
      completed: true,
      dueDate: "२०८१ आश्विन २५",
    },
    {
      id: 2,
      title: "विज्ञान तथा प्रविधि: वंशाणु तथा मेन्डेलको नियम (Genetics)",
      course: "Science & Technology",
      completed: false,
      dueDate: "२०८१ आश्विन २८",
    },
    {
      id: 3,
      title: "Python Data Structures: Lists & Dictionaries Exercise",
      course: "Computer Science",
      completed: true,
      dueDate: "२०८१ आश्विन ३०",
    },
    {
      id: 4,
      title: "सामाजिक अध्ययन: नेपालको संघीयता र प्रदेश संरचना",
      course: "Social Studies",
      completed: false,
      dueDate: "२०८१ कात्तिक २",
    },
  ]);
  const [totalAssignments, setTotalAssignments] = useState(4);
  const [assignmentsCompleted, setAssignmentsCompleted] = useState(2);
  const [aiQuestions, setAiQuestions] = useState(14);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Routine & Interactive state
  const [showFullRoutine, setShowFullRoutine] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiAnswering, setAiAnswering] = useState(false);
  const [aiLanguageMode, setAiLanguageMode] = useState("NEP"); // "NEP" | "ENG"

  const loadDashboardData = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;

    // Load Profile
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const profile = await response.json();
        if (profile.full_name?.trim()) setStudentName(profile.full_name.trim());
        if (profile.email?.trim()) setStudentEmail(profile.email.trim());
      }
    } catch (err) {
      console.warn("Using local profile data:", err);
    }

    // Load Course Progress
    try {
      const response = await fetch(`${API_BASE_URL}/courses/1/progress`);
      if (response.ok) {
        const data = await response.json();
        if (data.progress) setCourseProgress(Math.round(data.progress));
      }
    } catch (err) {
      // keep fallback
    }

    // Load Assignments
    try {
      const response = await fetch(`${API_BASE_URL}/assignments`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setAssignments(data);
          setTotalAssignments(data.length);
          setAssignmentsCompleted(data.filter((a) => a.completed).length);
        }
      }
    } catch (err) {
      // keep fallback
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // AI Doubt Solver handler
  const handleSolveDoubt = (presetQuery) => {
    const query = presetQuery || aiQuery;
    if (!query.trim()) return;

    setAiAnswering(true);
    setAiQuery(query);

    setTimeout(() => {
      let nep = "";
      let eng = "";

      const lower = query.toLowerCase();
      if (lower.includes("पाइथागोरस") || lower.includes("pythagoras")) {
        nep =
          "**पाइथागोरस साध्य (Pythagoras Theorem):**\nकुनै पनि समकोणी त्रिभुजमा, कर्णको वर्ग (h²) अन्य दुई भुजाहरूको वर्गको योगफलसँग बराबर हुन्छ।\nसूत्र: **h² = p² + b²**\nजस्तै: लम्ब (p) = ३ से.मी. र आधार (b) = ४ से.मी. भएमा, कर्ण (h) = √(९ + १६) = ५ से.मी. हुन्छ।";
        eng =
          "**Pythagorean Theorem:**\nIn a right-angled triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides.\nFormula: **h² = p² + b²**\nExample: If p = 3 and b = 4, then h = √(9 + 16) = 5 cm.";
      } else if (lower.includes("photosynthesis") || lower.includes("प्रकाश संश्लेषण")) {
        nep =
          "**प्रकाश संश्लेषण (Photosynthesis):**\nहरिया वनस्पतिहरूले सूर्यको प्रकाश, पानी (H₂O) र कार्बनडाइअक्साइड (CO₂) को मद्दतले क्लोरोफिलमा ग्लुकोज (खाना) र अक्सिजन (O₂) बनाउने प्रक्रियालाई प्रकाश संश्लेषण भनिन्छ।\nसमीकरण: **6CO₂ + 6H₂O + घामको किरण → C₆H₁₂O₆ + 6O₂**";
        eng =
          "**Photosynthesis:**\nThe biological process by which green plants synthesize nutrients using sunlight, water, and carbon dioxide in the presence of chlorophyll.\nEquation: **6CO₂ + 6H₂O + Sunlight → C₆H₁₂O₆ + 6O₂**";
      } else if (lower.includes("python") || lower.includes("loop") || lower.includes("loop")) {
        nep =
          "**पाइथन लुप (Python Loops):**\nकुनै पनि कोडलाई पटक–पटक दोहोर्‍याएर चलाउन `for` वा `while` लुप प्रयोग गरिन्छ।\nउदा: `for i in range(1, 6): print(i)` ले १ देखि ५ सम्मका अङ्कहरू प्रिन्ट गर्दछ।";
        eng =
          "**Python Loops:**\nLoops are used to iterate over a sequence of elements.\nExample: `for i in range(1, 6): print(i)` prints numbers from 1 to 5.";
      } else {
        nep = `**एआई शिक्षक उत्तर:**\n"${query}" सम्बन्धी जानकारी: यो CDC पाठ्यक्रम विकास केन्द्र कक्षा १० को महत्वपूर्ण पाठ्यांश हो। विस्तृत अध्ययनको लागि तपाईंको AI Neural Tutor मोड्युलमा थप अभ्यास प्रश्नहरू उपलब्ध छन्।`;
        eng = `**AI Neural Tutor Response:**\nRegarding "${query}": This is aligned with the CDC Class 10 Board Curriculum. You can explore deep interactive problem sets in the full AI Tutor module.`;
      }

      setAiAnswer(aiLanguageMode === "NEP" ? nep : eng);
      setAiAnswering(false);
      setAiQuestions((prev) => prev + 1);
    }, 800);
  };

  const initials =
    studentName
      .split(" ")
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AS";

  return (
    <AppLayout
      title={`Welcome, ${studentName} 👋`}
      subtitle={`Class 10 (SEE Board) · CDC National Curriculum — Academic Year 2081 B.S.`}
    >
      <div className="student-dashboard-wrap">
        {/* ============================================================
            HERO PROFILE & NEPAL ACADEMIC BANNER
            ============================================================ */}
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
                <span className="banner-nepal-tag">वि.सं. २०८१ · CDC NEB</span>
              </div>
              <p className="banner-email">{studentEmail}</p>
              <div className="streak-row">
                <div className="streak-indicator">
                  <Flame size={15} className="text-amber" />
                  <span>७-दिने अध्ययन निरन्तरता (7-Day Streak) · विद्वान (Scholar Rank)</span>
                </div>
                <div className="see-countdown-badge">
                  <Award size={14} />
                  <span>SEE बोर्ड परीक्षा: १३८ दिन बाँकी</span>
                </div>
              </div>
            </div>

            <div className="banner-actions">
              <button
                onClick={() => navigate("/ai-tutor")}
                className="banner-ai-btn"
              >
                <Bot size={16} />
                <span>एआई शिक्षकसँग सोध्नुहोस्</span>
              </button>
            </div>
          </div>
        </section>

        {/* ============================================================
            LIVE BELL SCHEDULE & TODAY'S PERIOD RADAR
            ============================================================ */}
        <section className="bell-routine-card">
          <div className="bell-routine-header">
            <div className="bell-left">
              <div className="bell-pulse-dot" />
              <div>
                <span className="bell-title-sub">दैनिक घण्टी तालिका (TODAY'S CLASS SCHEDULE)</span>
                <h3 className="bell-current-period">
                  Period 4: 12:15 PM – 1:00 PM · अनिवार्य गणित (Compulsory Mathematics)
                </h3>
              </div>
            </div>

            <div className="bell-right">
              <div className="bell-countdown-box">
                <Clock size={15} className="text-cyan" />
                <span>घण्टी बज्न बाँकी: <strong>16m 40s</strong> (Tiffin Break सम्म)</span>
              </div>
              <button
                onClick={() => setShowFullRoutine(!showFullRoutine)}
                className="routine-toggle-btn"
              >
                <span>{showFullRoutine ? "रुटिन बन्द गर्नुहोस्" : "पूरा रुटिन हेर्नुहोस्"}</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Collapsible Routine Grid */}
          {showFullRoutine && (
            <div className="routine-full-grid">
              {[
                { time: "10:00 - 10:45 AM", name: "Period 1: अनिवार्य नेपाली", teacher: "शिक्षक: केशव दाहाल", room: "Room 101" },
                { time: "10:45 - 11:30 AM", name: "Period 2: Compulsory English", teacher: "Tr: Sunita Karki", room: "Room 101" },
                { time: "11:30 - 12:15 PM", name: "Period 3: विज्ञान तथा प्रविधि", teacher: "शिक्षक: डा. विकास पन्त", room: "Science Lab" },
                { time: "12:15 - 01:00 PM", name: "Period 4 (वर्तमान): अनिवार्य गणित", teacher: "शिक्षक: ई. सुरेश अधिकारी", room: "Room 204", current: true },
                { time: "01:00 - 01:40 PM", name: "Tiffin / Lunch Break (४० मिनेट)", teacher: "खाजा समय", room: "Cafeteria" },
                { time: "01:40 - 02:25 PM", name: "Period 5: सामाजिक अध्ययन", teacher: "शिक्षक: रञ्जिता श्रेष्ठ", room: "Room 101" },
                { time: "02:25 - 03:10 PM", name: "Period 6: Computer Science", teacher: "Tr: Anish Thapa", room: "IT Lab" },
              ].map((p, i) => (
                <div
                  key={i}
                  className={`routine-item-box ${p.current ? "current-box" : ""}`}
                >
                  <span className="routine-time">{p.time}</span>
                  <strong className="routine-name">{p.name}</strong>
                  <span className="routine-meta">{p.teacher} · {p.room}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ============================================================
            STATS KPI ROW: Course Progress, SEE Target, Fee Clearance
            ============================================================ */}
        <section className="dashboard-stats-grid">
          {/* Box 1: Course Mastery */}
          <div className="stat-box">
            <div className="stat-top">
              <span className="stat-title">पाठ्यक्रम प्रगति (Curriculum)</span>
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
            <span className="stat-foot">कम्प्युटर, गणित र विज्ञान संयुक्त प्रगति</span>
          </div>

          {/* Box 2: SEE 4.0 GPA Target */}
          <div className="stat-box">
            <div className="stat-top">
              <span className="stat-title">लक्ष्य GPA (SEE Target)</span>
              <div className="stat-icon-wrap icon-amber">
                <Award size={18} />
              </div>
            </div>
            <div className="stat-metric">
              ३.८५ <span className="stat-metric-sub">/ ४.०० (A+)</span>
            </div>
            <div className="stat-progress-bar">
              <div
                className="stat-progress-fill fill-amber"
                style={{ width: "96%" }}
              />
            </div>
            <span className="stat-foot">प्रथम त्रैमासिक स्कोर: ३.७२ GPA (Distinction)</span>
          </div>

          {/* Box 3: Fee Clearance Status */}
          <div className="stat-box">
            <div className="stat-top">
              <span className="stat-title">शुल्क स्थिति (eSewa / Khalti)</span>
              <div className="stat-icon-wrap icon-emerald">
                <CreditCard size={18} />
              </div>
            </div>
            <div className="stat-metric" style={{ color: "#34d399", fontSize: "22px" }}>
              शुल्क चुक्ता (Cleared)
            </div>
            <div className="stat-progress-bar">
              <div
                className="stat-progress-fill fill-emerald"
                style={{ width: "100%" }}
              />
            </div>
            <span className="stat-foot">
              बक्यौता: रू ०.०० · रसिद #REC-2081-8942
            </span>
          </div>
        </section>

        {/* ============================================================
            INSTANT BILINGUAL AI DOUBT SOLVER WIDGET
            ============================================================ */}
        <section className="content-card ai-solver-card">
          <div className="card-topbar">
            <div className="card-heading-group">
              <div className="card-icon-pill icon-bot">
                <Bot size={17} />
              </div>
              <div>
                <h3 className="card-main-title">तत्काल एआई अध्ययन सहयोगी (Instant Bilingual AI Doubt Solver)</h3>
                <span className="card-sub-hint">कुनै पनि गणित, विज्ञान वा प्रोग्रामिङ सम्बन्धी प्रश्न नेपाली वा अंग्रेजीमा सोध्नुहोस्</span>
              </div>
            </div>

            <div className="lang-toggle-pill">
              <button
                onClick={() => setAiLanguageMode("NEP")}
                className={`lang-btn ${aiLanguageMode === "NEP" ? "active" : ""}`}
              >
                नेपाली
              </button>
              <button
                onClick={() => setAiLanguageMode("ENG")}
                className={`lang-btn ${aiLanguageMode === "ENG" ? "active" : ""}`}
              >
                English
              </button>
            </div>
          </div>

          {/* Quick Prompt Chips */}
          <div className="quick-chips-row">
            {[
              "पाइथागोरस साध्य नेपालीमा बुझाउनुहोस्",
              "Photosynthesis (प्रकाश संश्लेषण) प्रक्रिया",
              "Python Loops उदाहरण सहित",
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => handleSolveDoubt(chip)}
                className="quick-chip-btn"
              >
                <Sparkles size={12} className="text-cyan" />
                <span>{chip}</span>
              </button>
            ))}
          </div>

          {/* AI Response Display */}
          {aiAnswer && (
            <div className="ai-solution-box">
              <div className="ai-solution-header">
                <div className="ai-header-tag">
                  <CheckCircle2 size={14} className="text-emerald" />
                  <span>प्रमाणित एआई व्याख्या (CDC Syllabus Aligned)</span>
                </div>
                <button
                  onClick={() => setAiAnswer("")}
                  className="close-ai-btn"
                >
                  बन्द गर्नुहोस्
                </button>
              </div>
              <div className="ai-solution-text">{aiAnswer}</div>
            </div>
          )}

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSolveDoubt();
            }}
            className="ai-solver-form"
          >
            <input
              type="text"
              placeholder={
                aiLanguageMode === "NEP"
                  ? "जस्तै: ओहमको नियम के हो? वा वृत्तको क्षेत्रफल सूत्र..."
                  : "Type your academic question here (Math, Science, Python)..."
              }
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              className="ai-solver-input"
            />
            <button
              type="submit"
              disabled={aiAnswering || !aiQuery.trim()}
              className="ai-solver-btn"
            >
              {aiAnswering ? (
                <>
                  <RefreshCw size={14} className="spin-icon" />
                  <span>खोज्दैछ...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>उत्तर पाउनुहोस्</span>
                </>
              )}
            </button>
          </form>
        </section>

        {/* ============================================================
            MAIN 2-COLUMN VIEW: Active Course & CDC Assignments
            ============================================================ */}
        <section className="dashboard-columns-grid">
          {/* Active Course Card */}
          <div className="content-card">
            <div className="card-topbar">
              <div className="card-heading-group">
                <div className="card-icon-pill">
                  <BookOpen size={16} />
                </div>
                <h3 className="card-main-title">सक्रिय पाठ्यक्रम (Enrolled Curriculum)</h3>
              </div>
              <button
                onClick={() => navigate("/courses")}
                className="card-text-action"
              >
                <span>सबै हेर्नुहोस्</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="course-featured-item">
              <div className="course-item-header">
                <div className="course-tag">LEVEL 1 · ACTIVE</div>
                <h4 className="course-item-title">
                  कक्षा १०: कम्प्युटर विज्ञान तथा Python Fundamentals
                </h4>
                <p className="course-item-desc">
                  Syntax, data structures, loops, functions, and CDC SEE Board computational problem solving.
                </p>
              </div>

              <div className="course-progress-section">
                <div className="progress-labels">
                  <span>पाठ्यक्रम प्रगति (Module Progress)</span>
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
                <span>पाठ सुरु गर्नुहोस् (Continue Lesson)</span>
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
                <h3 className="card-main-title">गृहकार्य तथा अभ्यास (CDC Assignments)</h3>
              </div>
              <button
                onClick={() => navigate("/assignments")}
                className="card-text-action"
              >
                <span>सबै हेर्नुहोस्</span>
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
                        {item.course} · बुझाउने म्याद: {item.dueDate || "Due Soon"}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`assignment-status-tag ${
                      item.completed ? "status-done" : "status-todo"
                    }`}
                  >
                    {item.completed ? "बुझाइएको (Submitted)" : "बाँकी (Pending)"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* COMPONENT STYLES */}
      <style>{`
        .student-dashboard-wrap {
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-width: 1360px;
          margin: 0 auto;
        }

        .profile-hero-banner {
          background: linear-gradient(135deg, #111726 0%, #0d121f 100%);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 20px;
          padding: 26px 30px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }

        .banner-glow-gradient {
          position: absolute;
          width: 320px;
          height: 320px;
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
          /* Ensure it renders as a block-level flex container */
          flex-shrink: 0;
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
          gap: 6px;
        }

        .banner-name-row {
          display: flex;
          align-items: center;
          gap: 10px;
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

        .banner-nepal-tag {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
          padding: 3px 8px;
          border-radius: 6px;
        }

        .banner-email {
          font-size: 13px;
          color: #94a3b8;
          margin: 0;
        }

        .streak-row {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-top: 4px;
        }

        .streak-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #f59e0b;
          font-weight: 600;
        }

        .see-countdown-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(6, 182, 212, 0.12);
          border: 1px solid rgba(6, 182, 212, 0.3);
          color: #67e8f9;
          padding: 3px 10px;
          border-radius: 6px;
          font-size: 11.5px;
          font-weight: 700;
        }

        .banner-ai-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
          color: #ffffff;
          padding: 10px 18px;
          border-radius: 12px;
          border: none;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(79, 70, 229, 0.35);
          transition: transform 0.15s ease;
        }

        .banner-ai-btn:hover {
          transform: translateY(-2px);
        }

        /* Bell Routine Card */
        .bell-routine-card {
          background: rgba(17, 23, 38, 0.9);
          border: 1px solid rgba(6, 182, 212, 0.25);
          border-radius: 16px;
          padding: 18px 24px;
        }

        .bell-routine-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .bell-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .bell-pulse-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #06b6d4;
          box-shadow: 0 0 12px #06b6d4;
          animation: pulseDot 1.5s infinite;
        }

        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        .bell-title-sub {
          font-size: 11px;
          font-weight: 800;
          color: #06b6d4;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .bell-current-period {
          margin: 3px 0 0;
          font-size: 15px;
          font-weight: 700;
          color: #ffffff;
        }

        .bell-right {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .bell-countdown-box {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          color: #cbd5e1;
        }

        .routine-toggle-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #67e8f9;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .routine-full-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 10px;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .routine-item-box {
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 9px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .routine-item-box.current-box {
          background: rgba(6, 182, 212, 0.12);
          border-color: rgba(6, 182, 212, 0.4);
        }

        .routine-time {
          font-size: 10.5px;
          color: #94a3b8;
          font-weight: 700;
        }

        .routine-name {
          font-size: 12px;
          color: #ffffff;
        }

        .routine-meta {
          font-size: 11px;
          color: #64748b;
        }

        /* Stats Grid */
        .dashboard-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 18px;
        }

        .stat-box {
          background: #111726;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .stat-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .stat-title {
          font-size: 12.5px;
          color: #94a3b8;
          font-weight: 600;
        }

        .stat-icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-cyan { background: rgba(6, 182, 212, 0.15); color: #06b6d4; }
        .icon-indigo { background: rgba(99, 102, 241, 0.15); color: #6366f1; }
        .icon-emerald { background: rgba(16, 185, 129, 0.15); color: #10b981; }
        .icon-amber { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
        .icon-bot { background: rgba(168, 85, 247, 0.15); color: #a855f7; }

        .stat-metric {
          font-family: 'Outfit', sans-serif;
          font-size: 28px;
          font-weight: 800;
          color: #ffffff;
        }

        .stat-metric-sub {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
        }

        .stat-progress-bar {
          width: 100%;
          height: 6px;
          border-radius: 99px;
          background: rgba(255, 255, 255, 0.07);
          overflow: hidden;
          margin-top: 4px;
        }

        .stat-progress-fill {
          height: 100%;
          border-radius: 99px;
        }

        .fill-cyan { background: #06b6d4; }
        .fill-indigo { background: #6366f1; }
        .fill-emerald { background: #10b981; }
        .fill-amber { background: #f59e0b; }

        .stat-foot {
          font-size: 11.5px;
          color: #64748b;
          margin-top: 4px;
        }

        /* AI Solver Card */
        .ai-solver-card {
          background: #111726;
          border: 1px solid rgba(168, 85, 247, 0.25);
          border-radius: 16px;
          padding: 22px 24px;
        }

        .card-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .card-heading-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .card-icon-pill {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
        }

        .card-main-title {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: #ffffff;
        }

        .card-sub-hint {
          font-size: 12px;
          color: #94a3b8;
        }

        .lang-toggle-pill {
          display: inline-flex;
          background: rgba(255, 255, 255, 0.04);
          padding: 3px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .lang-btn {
          padding: 4px 10px;
          border-radius: 6px;
          border: none;
          background: transparent;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .lang-btn.active {
          background: rgba(168, 85, 247, 0.25);
          color: #d8b4fe;
        }

        .quick-chips-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 14px;
        }

        .quick-chip-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #cbd5e1;
          font-size: 11.5px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .quick-chip-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }

        .ai-solution-box {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 12px;
          padding: 14px 18px;
          margin-bottom: 14px;
        }

        .ai-solution-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .ai-header-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          color: #34d399;
          font-weight: 700;
        }

        .close-ai-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 11px;
          cursor: pointer;
        }

        .ai-solution-text {
          font-size: 13px;
          color: #ffffff;
          line-height: 1.55;
          white-space: pre-line;
        }

        .ai-solver-form {
          display: flex;
          gap: 8px;
        }

        .ai-solver-input {
          flex: 1;
          height: 44px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          padding: 0 16px;
          font-size: 13px;
          outline: none;
        }

        .ai-solver-input:focus {
          border-color: #a855f7;
        }

        .ai-solver-btn {
          padding: 0 20px;
          border-radius: 10px;
          background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
          color: #ffffff;
          border: none;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        /* 2 Column Grid */
        .dashboard-columns-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(440px, 1fr));
          gap: 22px;
        }

        .content-card {
          background: #111726;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 22px 24px;
        }

        .card-text-action {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: transparent;
          border: none;
          color: #818cf8;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .course-featured-item {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .course-tag {
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #06b6d4;
          margin-bottom: 6px;
        }

        .course-item-title {
          margin: 0 0 6px;
          font-size: 16px;
          font-weight: 700;
          color: #ffffff;
        }

        .course-item-desc {
          margin: 0;
          font-size: 13px;
          color: #94a3b8;
          line-height: 1.5;
        }

        .course-progress-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .progress-labels {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #94a3b8;
        }

        .course-bar-outer {
          width: 100%;
          height: 7px;
          border-radius: 99px;
          background: rgba(255, 255, 255, 0.08);
          overflow: hidden;
        }

        .course-bar-inner {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, #06b6d4 0%, #6366f1 100%);
        }

        .resume-learning-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px 18px;
          border-radius: 10px;
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.35);
          color: #a5b4fc;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .resume-learning-btn:hover {
          background: rgba(99, 102, 241, 0.25);
        }

        /* Assignments list */
        .assignments-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .assignment-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 14px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.06);
          gap: 10px;
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
          color: #10b981;
        }

        .check-icon-circle.pending {
          background: rgba(255, 255, 255, 0.05);
          color: #64748b;
        }

        .assignment-title {
          margin: 0 0 2px;
          font-size: 13px;
          font-weight: 600;
          color: #ffffff;
        }

        .assignment-meta {
          font-size: 11.5px;
          color: #64748b;
        }

        .assignment-status-tag {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 6px;
        }

        .status-done {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
        }

        .status-todo {
          background: rgba(245, 158, 11, 0.15);
          color: #fbbf24;
        }

        .spin-icon {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AppLayout>
  );
}