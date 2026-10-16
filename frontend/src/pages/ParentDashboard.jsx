import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import api from "../api/axios";
import {
  GraduationCap, BookOpen, Calendar, Bell, TrendingUp,
  CheckCircle2, Clock, AlertTriangle, ChevronRight, MessageSquare,
  CreditCard, Award, BarChart3, Activity, Sparkles, Send, X,
  Heart, Phone, Mail, User, FileText, Shield, Zap, Star,
} from "lucide-react";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getNepaliTime() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function getTodayBS() {
  const now = new Date();
  const bsYear = now.getFullYear() - 57 + (now.getMonth() >= 3 ? 1 : 0);
  const nepMonths = ["Baisakh","Jestha","Ashadh","Shrawan","Bhadra","Ashwin","Kartik","Mangsir","Poush","Magh","Falgun","Chaitra"];
  const mIdx = (now.getMonth() + 9) % 12;
  return `${now.getDate()} ${nepMonths[mIdx]} ${bsYear}`;
}

const CHILDREN = [
  {
    name: "Aarav Sharma",
    class: "Grade 10-A",
    rollNo: "10A-021",
    attendance: 94,
    gpa: 3.9,
    fee: { paid: 45000, due: 8500, nextDue: "Magh 25, 2081" },
    recentMarks: [
      { subject: "Mathematics", score: 97, grade: "A+", date: "Half-Yearly" },
      { subject: "Science",     score: 91, grade: "A+", date: "Half-Yearly" },
      { subject: "English",     score: 84, grade: "A",  date: "Half-Yearly" },
      { subject: "Nepali",      score: 88, grade: "A+", date: "Half-Yearly" },
      { subject: "Social",      score: 82, grade: "A",  date: "Half-Yearly" },
    ],
    notices: [
      { title: "Science Exhibition – Participation Confirmed", date: "Magh 10", type: "success" },
      { title: "PTM Scheduled – Falgun 3, 2081",              date: "Magh 8",  type: "info"    },
      { title: "Fee Due Reminder – Rs. 8,500",                date: "Magh 7",  type: "warning" },
    ],
  },
];

const UPCOMING = [
  { event: "Parent-Teacher Meeting",  date: "Falgun 3",  type: "meeting"   },
  { event: "Term-End Examinations",   date: "Falgun 15", type: "exam"      },
  { event: "Annual Sports Day",       date: "Falgun 22", type: "event"     },
  { event: "Fee Payment Deadline",    date: "Magh 25",   type: "fee"       },
];

const CONTACTS = [
  { name: "Class Teacher",       person: "Er. Suresh Adhikari", phone: "9841-234567" },
  { name: "School Office",       person: "Admin Desk",           phone: "01-4123456"  },
  { name: "Fee Department",      person: "Fee Office",           phone: "01-4123457"  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(getNepaliTime());
  const [todayBS] = useState(getTodayBS());
  const [profile, setProfile] = useState({ full_name: "Rajesh Sharma" });
  const [activeChild, setActiveChild] = useState(0);
  const [msgOpen, setMsgOpen] = useState(false);
  const [msgText, setMsgText] = useState("");
  const [msgSent, setMsgSent] = useState(false);

  useEffect(() => {
    const tick = setInterval(() => setCurrentTime(getNepaliTime()), 30_000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    api.get("/profile").then((r) => setProfile(r.data)).catch(() => {});
  }, []);

  const child = CHILDREN[activeChild];

  const handleSendMsg = () => {
    if (!msgText.trim()) return;
    setMsgSent(true);
    setTimeout(() => { setMsgSent(false); setMsgText(""); setMsgOpen(false); }, 2500);
  };

  return (
    <AppLayout>
      <div style={{ padding: "28px 32px", maxWidth: 1300, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: "linear-gradient(135deg,#ec4899,#8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 24px rgba(236,72,153,0.35)",
            }}>
              <Heart size={22} color="#fff" fill="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>
                Namaste, {profile.full_name?.split(" ")[0] || "Guardian"} ji 🙏
              </h1>
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
                Parent Portal · {todayBS} · {currentTime}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-secondary" style={{ fontSize: 13 }} onClick={() => setMsgOpen(true)}>
              <MessageSquare size={15} /> Message Teacher
            </button>
            <button className="btn-primary" style={{ fontSize: 13 }} onClick={() => navigate("/fees")}>
              <CreditCard size={15} /> Pay Fees
            </button>
          </div>
        </div>

        {/* ── Child Switcher (if multiple children) ── */}
        {CHILDREN.length > 1 && (
          <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
            {CHILDREN.map((c, i) => (
              <button key={c.name} onClick={() => setActiveChild(i)} style={{
                background: i === activeChild ? "var(--accent-primary)" : "var(--bg-elevated)",
                border: `1px solid ${i === activeChild ? "var(--accent-primary)" : "var(--border-default)"}`,
                borderRadius: 10, padding: "8px 16px", cursor: "pointer",
                color: i === activeChild ? "#fff" : "var(--text-secondary)", fontSize: 13, fontWeight: 600,
              }}>
                {c.name} · {c.class}
              </button>
            ))}
          </div>
        )}

        {/* ── Child Info Banner ── */}
        <div style={{
          background: "linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(236,72,153,0.08) 100%)",
          border: "1px solid rgba(139,92,246,0.25)", borderRadius: "var(--radius-xl)",
          padding: "20px 28px", marginBottom: 28, display: "flex", alignItems: "center", gap: 24,
        }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg,#8b5cf6,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
            🎓
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{child.name}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{child.class} · Roll No: {child.rollNo}</div>
          </div>
          <div style={{ display: "flex", gap: 32 }}>
            {[
              { label: "Attendance", value: `${child.attendance}%`, color: child.attendance >= 90 ? "var(--accent-emerald)" : "var(--accent-amber)" },
              { label: "GPA",        value: child.gpa.toFixed(1),   color: child.gpa >= 3.8 ? "var(--accent-emerald)" : "var(--accent-cyan)"     },
              { label: "Fee Due",    value: `Rs. ${child.fee.due.toLocaleString()}`, color: child.fee.due > 0 ? "var(--accent-rose)" : "var(--accent-emerald)" },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 22, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
          {/* LEFT */}
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

            {/* Recent Marks */}
            <div className="dark-card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Award size={17} color="var(--accent-amber)" />
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Half-Yearly Results</h3>
                </div>
                <span className="badge badge-success">Term Completed</span>
              </div>
              <div>
                {child.recentMarks.map((m, i) => (
                  <div key={m.subject} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 22px", borderBottom: i < child.recentMarks.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                      {["📐","🔬","📚","📖","🌍"][i]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{m.subject}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{m.date}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 800, fontSize: 20, fontFamily: "var(--font-heading)", color: m.score >= 90 ? "var(--accent-emerald)" : m.score >= 75 ? "var(--accent-cyan)" : "var(--accent-amber)" }}>{m.score}</div>
                    </div>
                    <span className={`badge ${m.grade === "A+" ? "badge-success" : "badge-info"}`}>{m.grade}</span>
                    {/* Score Bar */}
                    <div style={{ width: 80, height: 6, background: "var(--bg-elevated)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${m.score}%`, height: "100%", background: m.score >= 90 ? "var(--accent-emerald)" : "var(--accent-cyan)", borderRadius: 3, transition: "width 1s ease" }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "14px 22px", background: "var(--bg-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Overall Average</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: "var(--accent-emerald)", fontFamily: "var(--font-heading)" }}>
                  {Math.round(child.recentMarks.reduce((a, m) => a + m.score, 0) / child.recentMarks.length)}%
                </span>
              </div>
            </div>

            {/* Fee Status */}
            <div className="dark-card" style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.06),rgba(6,182,212,0.04))", border: "1px solid rgba(16,185,129,0.2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                <CreditCard size={17} color="var(--accent-emerald)" />
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Fee Account</h3>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 18 }}>
                {[
                  { label: "Total Paid",    value: `Rs. ${child.fee.paid.toLocaleString()}`,  color: "var(--accent-emerald)" },
                  { label: "Outstanding",   value: `Rs. ${child.fee.due.toLocaleString()}`,   color: child.fee.due > 0 ? "var(--accent-rose)" : "var(--accent-emerald)" },
                  { label: "Next Due Date", value: child.fee.nextDue,                          color: "var(--accent-amber)" },
                ].map(f => (
                  <div key={f.label} style={{ background: "var(--bg-glass)", borderRadius: 10, padding: "14px 16px", border: "1px solid var(--border-subtle)" }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{f.label}</div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: f.color, fontFamily: "var(--font-heading)" }}>{f.value}</div>
                  </div>
                ))}
              </div>
              {child.fee.due > 0 && (
                <button className="btn-primary" style={{ width: "100%" }} onClick={() => navigate("/fees")}>
                  <CreditCard size={15} /> Pay Rs. {child.fee.due.toLocaleString()} Now — via eSewa / Khalti / FonePay
                </button>
              )}
            </div>

            {/* Notices */}
            <div className="dark-card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 8 }}>
                <Bell size={16} color="var(--accent-cyan)" />
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>School Notices</h3>
              </div>
              {child.notices.map((n, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 22px", borderBottom: i < child.notices.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.type === "success" ? "var(--accent-emerald)" : n.type === "warning" ? "var(--accent-amber)" : "var(--accent-cyan)", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{n.date}</div>
                  </div>
                  <span className={`badge badge-${n.type === "success" ? "success" : n.type === "warning" ? "warning" : "info"}`} style={{ fontSize: 10 }}>
                    {n.type.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Attendance Visual */}
            <div className="dark-card">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <Activity size={16} color="var(--accent-emerald)" />
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Attendance This Term</h3>
              </div>
              <div style={{ textAlign: "center", marginBottom: 12 }}>
                <div style={{ position: "relative", width: 100, height: 100, margin: "0 auto 10px" }}>
                  <svg viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="var(--bg-elevated)" strokeWidth="10" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke={child.attendance >= 90 ? "#10b981" : "#f59e0b"} strokeWidth="10"
                      strokeDasharray={`${child.attendance * 2.51} ${(100 - child.attendance) * 2.51}`}
                      strokeLinecap="round" />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: child.attendance >= 90 ? "var(--accent-emerald)" : "var(--accent-amber)", flexDirection: "column", gap: 0 }}>
                    {child.attendance}%
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {child.attendance >= 90 ? "✅ Excellent attendance" : "⚠️ Below 90% threshold"}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1, background: "rgba(16,185,129,0.1)", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                  <div style={{ fontWeight: 800, fontSize: 18, color: "var(--accent-emerald)" }}>
                    {Math.round(child.attendance * 1.8)}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Days Present</div>
                </div>
                <div style={{ flex: 1, background: "rgba(244,63,94,0.08)", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                  <div style={{ fontWeight: 800, fontSize: 18, color: "var(--accent-rose)" }}>
                    {Math.round((100 - child.attendance) * 0.1)}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Days Absent</div>
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="dark-card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "16px 18px 12px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 8 }}>
                <Calendar size={15} color="var(--accent-purple)" />
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Upcoming Events</h3>
              </div>
              {UPCOMING.map((e, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 18px", borderBottom: i < UPCOMING.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>
                    {e.type === "exam" ? "📝" : e.type === "meeting" ? "🤝" : e.type === "fee" ? "💳" : "🎉"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{e.event}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{e.date}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* School Contacts */}
            <div className="dark-card">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Phone size={15} color="var(--accent-cyan)" />
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>School Contacts</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {CONTACTS.map(c => (
                  <div key={c.name} style={{ background: "var(--bg-elevated)", borderRadius: 10, padding: "11px 13px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.person}</div>
                    </div>
                    <a href={`tel:${c.phone}`} style={{ fontSize: 12, color: "var(--accent-cyan)", textDecoration: "none", fontFamily: "var(--font-mono)" }}>{c.phone}</a>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety Badge */}
            <div style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.12),rgba(6,182,212,0.08))", borderRadius: "var(--radius-lg)", padding: "16px 18px", border: "1px solid rgba(99,102,241,0.25)", display: "flex", gap: 12, alignItems: "center" }}>
              <Shield size={24} color="var(--accent-primary)" />
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>EduNexus Parent Shield</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>Your child's data is end-to-end encrypted and fully secure.</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Message Teacher Modal ── */}
        {msgOpen && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 440, background: "var(--bg-surface)", border: "1px solid var(--border-highlight)", borderRadius: "var(--radius-xl)", overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.7)" }}>
              <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <MessageSquare size={18} color="var(--accent-primary)" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>Message Class Teacher</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Er. Suresh Adhikari · Class 10-A</div>
                  </div>
                </div>
                <button onClick={() => setMsgOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={18} /></button>
              </div>
              <div style={{ padding: "20px 22px" }}>
                {msgSent ? (
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <CheckCircle2 size={48} color="var(--accent-emerald)" style={{ margin: "0 auto 12px", display: "block" }} />
                    <div style={{ fontWeight: 700, fontSize: 15 }}>Message Sent!</div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>Your teacher will respond within 24 hours.</div>
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                        {["Regarding attendance", "About exam marks", "Fee related query", "Request for meeting"].map(t => (
                          <button key={t} onClick={() => setMsgText(t)} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", borderRadius: 8, padding: "5px 10px", fontSize: 11, cursor: "pointer", color: "var(--text-secondary)" }}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      value={msgText}
                      onChange={e => setMsgText(e.target.value)}
                      placeholder="Type your message to the teacher..."
                      rows={4}
                      style={{ width: "100%", resize: "vertical" }}
                    />
                    <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                      <button className="btn-secondary" style={{ flex: 1, fontSize: 13 }} onClick={() => setMsgOpen(false)}>Cancel</button>
                      <button className="btn-primary" style={{ flex: 2, fontSize: 13 }} onClick={handleSendMsg}>
                        <Send size={14} /> Send Message
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
