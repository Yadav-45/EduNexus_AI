import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import api from "../api/axios";
import {
  BookOpen, Users, ClipboardList, Calendar, Bell, TrendingUp,
  CheckCircle2, Clock, AlertTriangle, ChevronRight, Zap, Star,
  MessageSquare, FileText, Award, Activity, BarChart3, Target,
  Cpu, Sparkles, GraduationCap, Send, X, ChevronDown,
} from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getNepaliTime() {
  const now = new Date();
  return now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function getTodayBS() {
  // Approximate BS date offset (Nepal is ~56.7 years ahead in Bikram Sambat)
  const now = new Date();
  const bsYear = now.getFullYear() - 57 + (now.getMonth() >= 3 ? 1 : 0);
  const nepMonths = ["Baisakh","Jestha","Ashadh","Shrawan","Bhadra","Ashwin","Kartik","Mangsir","Poush","Magh","Falgun","Chaitra"];
  const mIdx = (now.getMonth() + 9) % 12;
  return `${now.getDate()} ${nepMonths[mIdx]} ${bsYear} B.S.`;
}

function getDayOfWeek() {
  const days = ["Aaitabaar (Sunday)","Sombaar (Monday)","Mangalbaar (Tuesday)","Budhabaar (Wednesday)","Bihibaar (Thursday)","Shukrabaar (Friday)","Shanibaar (Saturday)"];
  return days[new Date().getDay()];
}

const PERIODS = [
  { time: "06:45–07:30", subject: "Mathematics",  class: "Class 10-A", room: "R-201", done: true  },
  { time: "07:35–08:20", subject: "Mathematics",  class: "Class 9-B",  room: "R-201", done: true  },
  { time: "08:25–09:10", subject: "Science",      class: "Class 10-B", room: "Lab-1", done: false, active: true },
  { time: "09:15–10:00", subject: "Mathematics",  class: "Class 8-A",  room: "R-201", done: false },
  { time: "10:15–11:00", subject: "Mathematics",  class: "Class 7-C",  room: "R-201", done: false },
  { time: "11:05–11:50", subject: "Extra Class",  class: "SEE Prep",   room: "R-203", done: false },
];

const PENDING_TASKS = [
  { label: "Grade Class 10-A Test Papers",   due: "Today",     priority: "high"   },
  { label: "Submit Monthly Progress Report", due: "Tomorrow",  priority: "medium" },
  { label: "Prepare Unit 5 Slides",          due: "3 days",    priority: "low"    },
  { label: "Record Attendance – Class 9-B",  due: "Today",     priority: "high"   },
  { label: "Parent-Teacher Meeting Prep",    due: "Fri",       priority: "medium" },
];

const TOP_STUDENTS = [
  { name: "Aarav Sharma",    class: "10-A", score: 97, trend: "+2" },
  { name: "Sita Karki",      class: "10-A", score: 95, trend: "+1" },
  { name: "Bibek Thapa",     class: "9-B",  score: 92, trend: "+3" },
  { name: "Priya Shrestha",  class: "10-B", score: 91, trend: "—"  },
  { name: "Rohan Poudel",    class: "8-A",  score: 89, trend: "+4" },
];

const AI_PRESETS = [
  "Create a lesson plan for Algebra Unit 5",
  "Draft a parent notice about upcoming exams",
  "Generate 10 MCQs on Newton's Laws",
  "Summarize last term's performance trend",
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(getNepaliTime());
  const [todayBS, setTodayBS] = useState(getTodayBS());
  const [todayDay, setTodayDay] = useState(getDayOfWeek());
  const [profile, setProfile] = useState({ full_name: "Er. Suresh Adhikari" });
  const [attendance, setAttendance] = useState({ present: 42, absent: 6, total: 48 });
  const [aiInput, setAiInput] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [tasksDone, setTasksDone] = useState(new Set());

  useEffect(() => {
    const tick = setInterval(() => setCurrentTime(getNepaliTime()), 30_000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    api.get("/profile").then((r) => setProfile(r.data)).catch(() => {});
  }, []);

  const handleAskAI = async (question = aiInput) => {
    if (!question.trim()) return;
    setAiLoading(true);
    setAiReply("");
    setAiInput(question);
    // Simulate thoughtful AI reply (real API integration possible)
    await new Promise((r) => setTimeout(r, 1400));
    const replies = {
      "Create a lesson plan for Algebra Unit 5":
        "📘 **Lesson Plan — Algebra Unit 5: Quadratic Equations**\n\nDay 1: Introduction to ax²+bx+c form, graphing parabolas.\nDay 2: Factoring method, practice problems.\nDay 3: Quadratic formula derivation, real-world applications.\nDay 4: Revision exercises and formative quiz.",
      "Draft a parent notice about upcoming exams":
        "📢 **Notice to Parents**\nDear Parents/Guardians,\nThe Term-End Examinations for Grade 10 will commence on **Magh 15, 2081**. Students are advised to review all chapters covered since Shrawan. Question papers will include both theory (70%) and practical/MCQ (30%). Kindly ensure your ward attends revision classes regularly.\n— Er. Suresh Adhikari, Class Teacher",
      "Generate 10 MCQs on Newton's Laws":
        "✅ **10 MCQs — Newton's Laws of Motion**\n1. Newton's 1st Law is also known as the Law of ___?\n   a) Acceleration  b) Inertia ✓  c) Force  d) Motion\n2. F = ma is a statement of Newton's ___ Law?\n   a) First  b) Second ✓  c) Third  d) Zeroth\n...and 8 more generated. Export to PDF?",
      "Summarize last term's performance trend":
        "📊 **Last Term Summary — Class 10-A**\nAverage Score: 82.4% (▲ 3.1% from previous term)\nTop Subject: Science (avg 87%)\nNeeds Attention: English Writing (avg 71%)\nAttendance: 94.2% average\nRecommendation: Focus extra sessions on Essay Writing before Term-End.",
    };
    setAiReply(replies[question] || `🧠 **AI Response for:** "${question}"\n\nHere is a tailored analysis based on your school's data. The recommendation suggests focusing on interactive learning strategies for improved student engagement in this topic area.`);
    setAiLoading(false);
  };

  const attPct = Math.round((attendance.present / attendance.total) * 100);

  return (
    <AppLayout
      title={`Teacher Portal — ${profile.full_name?.split(" ")[0] || "Teacher"}`}
      subtitle={`${todayBS} · ${currentTime} · ${todayDay}`}
    >
      <div style={{ padding: "28px 32px", maxWidth: 1400, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: "linear-gradient(135deg,#8b5cf6,#6366f1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 20px rgba(99,102,241,0.4)"
              }}>
                <GraduationCap size={20} color="#fff" />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>
                  Welcome, {profile.full_name?.split(" ")[1] || "Teacher"} 🙏
                </h1>
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
                  Teacher Portal · {todayBS} · {currentTime}
                </p>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-secondary" style={{ fontSize: 13 }} onClick={() => setShowAI(true)}>
              <Cpu size={15} /> AI Copilot
            </button>
            <button className="btn-primary" style={{ fontSize: 13 }} onClick={() => navigate("/attendance")}>
              <CheckCircle2 size={15} /> Mark Attendance
            </button>
          </div>
        </div>

        {/* ── KPI Strip ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Classes Today",     value: "6",            sub: "Next: Class 8-A @ 9:15", color: "#6366f1", icon: <BookOpen size={18}/> },
            { label: "Students Managed",  value: "186",          sub: "+4 new this term",        color: "#06b6d4", icon: <Users size={18}/> },
            { label: "Today's Attendance",value: `${attPct}%`,   sub: `${attendance.present}/${attendance.total} present`, color: "#10b981", icon: <CheckCircle2 size={18}/> },
            { label: "Pending Tasks",     value: PENDING_TASKS.filter(t=>t.due==="Today").length, sub: `${PENDING_TASKS.length} total tasks`, color: "#f59e0b", icon: <AlertTriangle size={18}/> },
          ].map((k) => (
            <div key={k.label} className="dark-card" style={{ padding: "20px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ margin: "0 0 8px", fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{k.label}</p>
                  <div style={{ fontSize: 30, fontWeight: 800, color: k.color, fontFamily: "var(--font-heading)", lineHeight: 1 }}>{k.value}</div>
                  <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--text-secondary)" }}>{k.sub}</p>
                </div>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${k.color}1a`, display: "flex", alignItems: "center", justifyContent: "center", color: k.color }}>
                  {k.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main Grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24 }}>
          {/* LEFT */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Today's Schedule */}
            <div className="dark-card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Calendar size={18} color="var(--accent-primary)" />
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Today's Schedule</h3>
                </div>
                <span className="badge badge-info">{todayDay}</span>
              </div>
              <div>
                {PERIODS.map((p, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 16,
                    padding: "14px 24px",
                    background: p.active ? "rgba(99,102,241,0.08)" : "transparent",
                    borderLeft: p.active ? "3px solid var(--accent-primary)" : "3px solid transparent",
                    borderBottom: i < PERIODS.length - 1 ? "1px solid var(--border-subtle)" : "none",
                    transition: "background 0.2s",
                  }}>
                    <div style={{ width: 90, flexShrink: 0 }}>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{p.time}</div>
                    </div>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: p.done ? "var(--accent-emerald)" : p.active ? "var(--accent-primary)" : "var(--bg-elevated)", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: p.active ? "var(--text-primary)" : p.done ? "var(--text-muted)" : "var(--text-primary)", textDecoration: p.done ? "line-through" : "none" }}>
                        {p.subject} — {p.class}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Room {p.room}</div>
                    </div>
                    {p.active && <span className="badge badge-info" style={{ fontSize: 11 }}>LIVE NOW</span>}
                    {p.done && <CheckCircle2 size={16} color="var(--accent-emerald)" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Student Performance */}
            <div className="dark-card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <TrendingUp size={18} color="var(--accent-cyan)" />
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Top Performers This Month</h3>
                </div>
                <button className="btn-secondary" style={{ fontSize: 12, padding: "6px 14px" }} onClick={() => navigate("/students")}>
                  View All <ChevronRight size={13} />
                </button>
              </div>
              <div>
                {TOP_STUDENTS.map((s, i) => (
                  <div key={s.name} style={{
                    display: "flex", alignItems: "center", gap: 16,
                    padding: "14px 24px",
                    borderBottom: i < TOP_STUDENTS.length - 1 ? "1px solid var(--border-subtle)" : "none",
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: i === 0 ? "linear-gradient(135deg,#f59e0b,#ea580c)" : i === 1 ? "linear-gradient(135deg,#94a3b8,#64748b)" : "var(--bg-elevated)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0,
                    }}>{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Class {s.class}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 800, fontSize: 18, color: s.score >= 95 ? "var(--accent-emerald)" : "var(--accent-cyan)", fontFamily: "var(--font-heading)" }}>{s.score}%</div>
                      <div style={{ fontSize: 11, color: s.trend.startsWith("+") ? "var(--accent-emerald)" : "var(--text-muted)" }}>{s.trend.startsWith("+") ? "▲" : "—"} {s.trend}</div>
                    </div>
                    {i === 0 && <Star size={16} color="#f59e0b" fill="#f59e0b" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Attendance Donut */}
            <div className="dark-card">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <Activity size={16} color="var(--accent-emerald)" />
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Today's Attendance</h3>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
                  <svg viewBox="0 0 80 80" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="40" cy="40" r="32" fill="none" stroke="var(--bg-elevated)" strokeWidth="10" />
                    <circle cx="40" cy="40" r="32" fill="none" stroke="var(--accent-emerald)" strokeWidth="10"
                      strokeDasharray={`${attPct * 2.01} ${(100 - attPct) * 2.01}`}
                      strokeLinecap="round" style={{ transition: "stroke-dasharray 1s ease" }} />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "var(--accent-emerald)" }}>{attPct}%</div>
                </div>
                <div style={{ flex: 1 }}>
                  {[
                    { label: "Present", val: attendance.present, color: "var(--accent-emerald)" },
                    { label: "Absent",  val: attendance.absent,  color: "var(--accent-rose)"    },
                  ].map(r => (
                    <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: r.color }} />
                        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{r.label}</span>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 700, color: r.color }}>{r.val}</span>
                    </div>
                  ))}
                  <button className="btn-primary" style={{ width: "100%", fontSize: 12, marginTop: 4 }} onClick={() => navigate("/attendance")}>
                    Manage Attendance
                  </button>
                </div>
              </div>
            </div>

            {/* Pending Tasks */}
            <div className="dark-card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "16px 18px 12px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 8 }}>
                <ClipboardList size={16} color="var(--accent-amber)" />
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Pending Tasks</h3>
              </div>
              <div style={{ padding: "8px 0" }}>
                {PENDING_TASKS.map((t, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "10px 18px",
                    borderBottom: i < PENDING_TASKS.length - 1 ? "1px solid var(--border-subtle)" : "none",
                    opacity: tasksDone.has(i) ? 0.45 : 1, transition: "opacity 0.3s",
                  }}>
                    <button
                      onClick={() => setTasksDone(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; })}
                      style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${t.priority === "high" ? "var(--accent-rose)" : t.priority === "medium" ? "var(--accent-amber)" : "var(--border-medium)"}`, background: tasksDone.has(i) ? "var(--accent-emerald)" : "transparent", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      {tasksDone.has(i) && <CheckCircle2 size={12} color="#fff" />}
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, textDecoration: tasksDone.has(i) ? "line-through" : "none", color: "var(--text-primary)" }}>{t.label}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>Due: {t.due}</div>
                    </div>
                    <span className={`badge badge-${t.priority === "high" ? "danger" : t.priority === "medium" ? "warning" : "info"}`} style={{ fontSize: 10, padding: "2px 7px" }}>
                      {t.priority.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="dark-card">
              <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700 }}>Quick Actions</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { label: "Courses",    icon: <BookOpen size={14}/>,    path: "/courses"         },
                  { label: "Assignments",icon: <FileText size={14}/>,     path: "/assignments"     },
                  { label: "Exams",      icon: <Award size={14}/>,        path: "/academic/exams"  },
                  { label: "Results",    icon: <BarChart3 size={14}/>,    path: "/academic/exam-results" },
                ].map(a => (
                  <button key={a.label} className="btn-secondary" style={{ fontSize: 12, justifyContent: "flex-start", gap: 7 }} onClick={() => navigate(a.path)}>
                    {a.icon} {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── AI Copilot Modal ── */}
        {showAI && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "flex-end", padding: 28 }}>
            <div style={{
              width: 420, maxHeight: "70vh", background: "var(--bg-surface)", border: "1px solid var(--border-highlight)",
              borderRadius: "var(--radius-xl)", display: "flex", flexDirection: "column", overflow: "hidden",
              boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 40px rgba(99,102,241,0.2)",
            }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--grad-brand)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Sparkles size={15} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>AI Teaching Copilot</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Powered by EduNexus Intelligence</div>
                  </div>
                </div>
                <button onClick={() => setShowAI(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={18} /></button>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
                {!aiReply && !aiLoading && (
                  <div>
                    <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 12 }}>Quick prompts:</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {AI_PRESETS.map(p => (
                        <button key={p} onClick={() => handleAskAI(p)} style={{
                          background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: 10,
                          padding: "10px 14px", cursor: "pointer", textAlign: "left", fontSize: 13, color: "var(--text-secondary)",
                          transition: "all 0.2s",
                        }} onMouseEnter={e => { e.target.style.borderColor = "var(--accent-primary)"; e.target.style.color = "var(--text-primary)"; }}
                           onMouseLeave={e => { e.target.style.borderColor = "var(--border-default)"; e.target.style.color = "var(--text-secondary)"; }}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {aiLoading && (
                  <div style={{ display: "flex", gap: 8, alignItems: "center", color: "var(--text-muted)", fontSize: 13 }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      {[0,1,2].map(i => (
                        <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent-primary)", animation: `bounce 1.2s ${i*0.2}s infinite` }} />
                      ))}
                    </div>
                    Thinking...
                  </div>
                )}
                {aiReply && (
                  <div style={{ background: "var(--bg-elevated)", borderRadius: 12, padding: "14px 16px", fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                    {aiReply}
                  </div>
                )}
              </div>

              <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border-subtle)", display: "flex", gap: 8 }}>
                <input
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAskAI()}
                  placeholder="Ask about lesson plans, assessments..."
                  style={{ flex: 1, padding: "10px 14px", fontSize: 13 }}
                />
                <button className="btn-primary" style={{ padding: "10px 14px" }} onClick={() => handleAskAI()}>
                  <Send size={14} />
                </button>
              </div>
            </div>
            <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)} }`}</style>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
