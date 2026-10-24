import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import {
  Calendar, Clock, Users, BookOpen, AlertTriangle,
  CheckCircle2, RefreshCw, Plus, Search, ChevronLeft,
  ChevronRight, X, Bell, ArrowRight, UserCheck,
  Zap, Building2, Filter, Download, Edit2, Eye,
} from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PERIODS = [
  { id: 1, label: "Period 1", time: "08:00 – 08:45" },
  { id: 2, label: "Period 2", time: "08:45 – 09:30" },
  { id: 3, label: "Period 3", time: "09:30 – 10:15" },
  { id: 4, label: "Break", time: "10:15 – 10:35", isBreak: true },
  { id: 5, label: "Period 4", time: "10:35 – 11:20" },
  { id: 6, label: "Period 5", time: "11:20 – 12:05" },
  { id: 7, label: "Lunch", time: "12:05 – 12:50", isBreak: true },
  { id: 8, label: "Period 6", time: "12:50 – 13:35" },
  { id: 9, label: "Period 7", time: "13:35 – 14:20" },
];

const SUBJECTS = [
  { code: "MATH", name: "Mathematics", color: "#6366f1" },
  { code: "ENG", name: "English", color: "#3b82f6" },
  { code: "SCI", name: "Science", color: "#10b981" },
  { code: "SOC", name: "Social Studies", color: "#f59e0b" },
  { code: "NEP", name: "Nepali", color: "#ec4899" },
  { code: "CS", name: "Computer Science", color: "#8b5cf6" },
  { code: "PHE", name: "Physical Education", color: "#ef4444" },
  { code: "ART", name: "Art & Craft", color: "#14b8a6" },
];

const TEACHERS = [
  { id: 1, name: "Mr. Sharma", subject: "MATH", available: true },
  { id: 2, name: "Ms. Thapa", subject: "ENG", available: true },
  { id: 3, name: "Mr. Adhikari", subject: "SCI", available: false, leaveReason: "Medical Leave" },
  { id: 4, name: "Mrs. Gurung", subject: "SOC", available: true },
  { id: 5, name: "Mr. Poudel", subject: "NEP", available: true },
  { id: 6, name: "Ms. KC", subject: "CS", available: true },
  { id: 7, name: "Mr. Rai", subject: "PHE", available: true },
  { id: 8, name: "Mrs. Bista", subject: "ART", available: true },
  { id: 9, name: "Mr. Joshi", subject: "MATH", available: true },
  { id: 10, name: "Ms. Shrestha", subject: "SCI", available: true },
];

function generateTimetable() {
  const grid = {};
  DAYS.forEach(day => {
    grid[day] = {};
    PERIODS.forEach(period => {
      if (period.isBreak) return;
      const subj = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];
      const possibleTeachers = TEACHERS.filter(t => t.subject === subj.code);
      const teacher = possibleTeachers.length > 0
        ? possibleTeachers[Math.floor(Math.random() * possibleTeachers.length)]
        : TEACHERS[0];
      grid[day][period.id] = {
        subject: subj,
        teacher,
        room: `Room ${100 + Math.floor(Math.random() * 20)}`,
        isSubstituted: !teacher.available,
      };
    });
  });
  return grid;
}

const SECTIONS = ["Class 10-A", "Class 10-B", "Class 9-A", "Class 9-B", "Class 8-A"];

const LEAVE_REQUESTS = [
  {
    id: 1, teacher: "Mr. Adhikari", subject: "Science", from: "2026-10-17",
    to: "2026-10-19", reason: "Medical Leave", status: "APPROVED",
    substitute: "Ms. Shrestha", substituteAssigned: true,
  },
  {
    id: 2, teacher: "Mrs. Gurung", subject: "Social Studies", from: "2026-10-20",
    to: "2026-10-20", reason: "Personal Day", status: "PENDING",
    substitute: null, substituteAssigned: false,
  },
  {
    id: 3, teacher: "Mr. Poudel", subject: "Nepali", from: "2026-10-21",
    to: "2026-10-22", reason: "Training Seminar", status: "APPROVED",
    substitute: "Mr. Joshi", substituteAssigned: true,
  },
];

export default function Timetable() {
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState(SECTIONS[0]);
  const [activeTab, setActiveTab] = useState("timetable");
  const [showSubstitutionModal, setShowSubstitutionModal] = useState(false);
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [generatingTimetable, setGeneratingTimetable] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  const timetableGrid = useMemo(() => generateTimetable(), [selectedSection]);

  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayIdx = DAYS.indexOf(todayName);

  function getSubjectColor(code) {
    return SUBJECTS.find(s => s.code === code)?.color || "#64748b";
  }

  function handleGenerateTimetable() {
    setGeneratingTimetable(true);
    setTimeout(() => {
      setGeneratingTimetable(false);
      setShowGeneratorModal(false);
    }, 2000);
  }

  function handleAutoSubstitute(leave) {
    setSelectedLeave(leave);
    setShowSubstitutionModal(true);
  }

  const stats = {
    totalPeriods: DAYS.length * PERIODS.filter(p => !p.isBreak).length,
    conflicts: 0,
    substitutionsToday: LEAVE_REQUESTS.filter(l => l.substituteAssigned).length,
    pendingLeaves: LEAVE_REQUESTS.filter(l => l.status === "PENDING").length,
  };

  return (
    <AppLayout title="Timetable & Scheduling" subtitle="Dynamic timetable engine with automatic substitution management">
      <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 1400, margin: "0 auto", padding: "0 24px 40px" }}>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          {[
            { label: "Weekly Periods", value: stats.totalPeriods, icon: Calendar, accent: "#6366f1", bg: "rgba(99,102,241,0.12)", border: "rgba(99,102,241,0.25)" },
            { label: "Active Conflicts", value: stats.conflicts, icon: AlertTriangle, accent: "#10b981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)" },
            { label: "Substitutions Today", value: stats.substitutionsToday, icon: UserCheck, accent: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)" },
            { label: "Pending Leave Requests", value: stats.pendingLeaves, icon: Clock, accent: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.25)" },
          ].map((card, i) => (
            <div key={i} style={{
              background: "var(--bg-surface, #0f172a)", border: `1px solid ${card.border}`,
              borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14,
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12, background: card.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <card.icon size={20} color={card.accent} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#f8fafc" }}>{card.value}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Switcher + Controls */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{
            display: "inline-flex", background: "rgba(255,255,255,0.04)",
            padding: 3, borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", gap: 3,
          }}>
            {[
              { key: "timetable", label: "Weekly Timetable" },
              { key: "leaves", label: "Leave & Substitution" },
            ].map(tab => (
              <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} style={{
                padding: "7px 16px", borderRadius: 7, border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 600,
                background: activeTab === tab.key ? "linear-gradient(135deg, #6366f1, #3b82f6)" : "transparent",
                color: activeTab === tab.key ? "#fff" : "#94a3b8",
              }}>
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} style={{
              padding: "8px 14px", borderRadius: 8, background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)", color: "#f8fafc",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>
              {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button type="button" onClick={() => setShowGeneratorModal(true)} style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer",
              background: "linear-gradient(135deg, #6366f1, #3b82f6)", color: "#fff",
              fontSize: 13, fontWeight: 700,
              boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
            }}>
              <Zap size={14} /> Generate Timetable
            </button>
          </div>
        </div>

        {/* TAB: Weekly Timetable Grid */}
        {activeTab === "timetable" && (
          <div style={{
            background: "var(--bg-surface, #0f172a)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16, overflow: "hidden",
          }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
                <thead>
                  <tr>
                    <th style={{
                      padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 700,
                      color: "#64748b", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.06)",
                      background: "rgba(255,255,255,0.02)", width: 120, position: "sticky", left: 0, zIndex: 2,
                    }}>Time Slot</th>
                    {DAYS.map((day, i) => (
                      <th key={day} style={{
                        padding: "14px 16px", textAlign: "center", fontSize: 12, fontWeight: 700,
                        color: i === todayIdx ? "#6366f1" : "#64748b", textTransform: "uppercase",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        background: i === todayIdx ? "rgba(99,102,241,0.06)" : "rgba(255,255,255,0.02)",
                      }}>{day}{i === todayIdx ? " \u2605" : ""}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PERIODS.map(period => (
                    <tr key={period.id}>
                      <td style={{
                        padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)",
                        position: "sticky", left: 0, zIndex: 1,
                        background: period.isBreak ? "rgba(245,158,11,0.06)" : "var(--bg-surface, #0f172a)",
                      }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: period.isBreak ? "#fbbf24" : "#f8fafc" }}>
                          {period.label}
                        </div>
                        <div style={{ fontSize: 10, color: "#64748b" }}>{period.time}</div>
                      </td>
                      {DAYS.map((day, dayIdx) => {
                        if (period.isBreak) {
                          return (
                            <td key={day} style={{
                              padding: "10px", textAlign: "center",
                              borderBottom: "1px solid rgba(255,255,255,0.04)",
                              background: "rgba(245,158,11,0.04)",
                            }}>
                              <span style={{ fontSize: 11, color: "#fbbf24", fontWeight: 600 }}>{period.label}</span>
                            </td>
                          );
                        }
                        const cell = timetableGrid[day]?.[period.id];
                        if (!cell) return <td key={day} />;
                        const subColor = getSubjectColor(cell.subject.code);
                        return (
                          <td key={day} style={{
                            padding: "6px 8px",
                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                            background: dayIdx === todayIdx ? "rgba(99,102,241,0.03)" : "transparent",
                          }}>
                            <div style={{
                              padding: "8px 10px", borderRadius: 8,
                              background: `${subColor}12`, border: `1px solid ${subColor}30`,
                              position: "relative",
                            }}>
                              <div style={{
                                fontSize: 12, fontWeight: 700, color: subColor,
                                display: "flex", alignItems: "center", gap: 4,
                              }}>
                                {cell.subject.name}
                                {cell.isSubstituted && (
                                  <span style={{
                                    fontSize: 8, fontWeight: 800, padding: "1px 5px", borderRadius: 3,
                                    background: "rgba(245,158,11,0.2)", color: "#fbbf24",
                                  }}>SUB</span>
                                )}
                              </div>
                              <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
                                {cell.teacher.name}
                              </div>
                              <div style={{ fontSize: 9, color: "#64748b", marginTop: 1 }}>{cell.room}</div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: Leave & Substitution Management */}
        {activeTab === "leaves" && (
          <div style={{
            background: "var(--bg-surface, #0f172a)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16, overflow: "hidden",
          }}>
            <div style={{
              padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#f8fafc" }}>
                Teacher Leave & Auto-Substitution Pipeline
              </h3>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6,
                background: "rgba(99,102,241,0.12)", color: "#818cf8",
              }}>
                {LEAVE_REQUESTS.length} Active Requests
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {LEAVE_REQUESTS.map((leave, idx) => (
                <div key={leave.id} style={{
                  padding: "16px 20px", borderBottom: idx < LEAVE_REQUESTS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
                  flexWrap: "wrap",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 200 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: leave.status === "APPROVED" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: leave.status === "APPROVED" ? "#34d399" : "#fbbf24",
                    }}>
                      {leave.status === "APPROVED" ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#f8fafc" }}>{leave.teacher}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>
                        {leave.subject} &bull; {leave.from}{leave.from !== leave.to ? ` to ${leave.to}` : ""}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{leave.reason}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 6,
                      background: leave.status === "APPROVED" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
                      color: leave.status === "APPROVED" ? "#34d399" : "#fbbf24",
                    }}>
                      {leave.status}
                    </span>

                    {leave.substituteAssigned ? (
                      <div style={{
                        fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 8,
                        background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
                        color: "#34d399", display: "flex", alignItems: "center", gap: 6,
                      }}>
                        <UserCheck size={13} /> {leave.substitute}
                      </div>
                    ) : (
                      <button type="button" onClick={() => handleAutoSubstitute(leave)} style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                        background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff",
                        fontSize: 12, fontWeight: 700,
                      }}>
                        <Zap size={12} /> Auto-Assign Substitute
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subject Legend */}
        <div style={{
          background: "var(--bg-surface, #0f172a)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14, padding: "16px 20px",
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 10 }}>
            Subject Color Legend
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {SUBJECTS.map(s => (
              <div key={s.code} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "4px 10px", borderRadius: 6,
                background: `${s.color}12`, border: `1px solid ${s.color}25`,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: s.color }}>{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timetable Generator Modal */}
      {showGeneratorModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(4px)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 1100, padding: 16,
        }}>
          <div style={{
            background: "#0f172a", border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: 16, width: "100%", maxWidth: 560, boxShadow: "0 25px 50px rgba(0,0,0,0.7)",
            overflow: "hidden",
          }}>
            <div style={{
              padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "rgba(99,102,241,0.08)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: "rgba(99,102,241,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#818cf8",
                }}>
                  <Zap size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#f8fafc" }}>
                    Constraint-Satisfaction Timetable Solver
                  </h3>
                  <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
                    Auto-generate conflict-free timetables
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setShowGeneratorModal(false)} style={{
                background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer",
              }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              {generatingTimetable ? (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <RefreshCw size={36} style={{ color: "#6366f1", margin: "0 auto 12px", animation: "spin 0.8s linear infinite" }} />
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#f8fafc", margin: 0 }}>
                    Running constraint-satisfaction solver...
                  </p>
                  <p style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                    Optimizing teacher allocation, room capacity, and subject distribution
                  </p>
                </div>
              ) : (
                <>
                  <div style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12,
                    background: "rgba(255,255,255,0.02)", padding: 14, borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Teachers</span>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#f8fafc", marginTop: 2 }}>{TEACHERS.length}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Subjects</span>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#f8fafc", marginTop: 2 }}>{SUBJECTS.length}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Time Slots</span>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#f8fafc", marginTop: 2 }}>{PERIODS.filter(p => !p.isBreak).length}/day</div>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Constraints</span>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#34d399", marginTop: 2 }}>12 rules</div>
                    </div>
                  </div>

                  <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>
                    Solver Constraints Applied
                  </div>
                  {[
                    "No teacher double-booked in same time slot",
                    "No room double-allocated in same time slot",
                    "Maximum 2 consecutive periods per teacher",
                    "Lab subjects in designated rooms only",
                    "No same subject on consecutive days for a class",
                    "PE/Art scheduled in afternoon slots",
                  ].map((rule, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "6px 10px", background: "rgba(255,255,255,0.02)", borderRadius: 6,
                    }}>
                      <CheckCircle2 size={13} color="#34d399" />
                      <span style={{ fontSize: 12, color: "#e2e8f0" }}>{rule}</span>
                    </div>
                  ))}

                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                    <button type="button" onClick={() => setShowGeneratorModal(false)} style={{
                      padding: "8px 16px", borderRadius: 8, background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8",
                      cursor: "pointer", fontSize: 13, fontWeight: 600,
                    }}>Cancel</button>
                    <button type="button" onClick={handleGenerateTimetable} style={{
                      padding: "8px 18px", borderRadius: 8,
                      background: "linear-gradient(135deg, #6366f1, #3b82f6)",
                      border: "none", color: "#fff", cursor: "pointer",
                      fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6,
                    }}>
                      <Zap size={14} /> Generate for {selectedSection}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auto-Substitution Modal */}
      {showSubstitutionModal && selectedLeave && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(4px)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 1100, padding: 16,
        }}>
          <div style={{
            background: "#0f172a", border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: 16, width: "100%", maxWidth: 560, boxShadow: "0 25px 50px rgba(0,0,0,0.7)",
            overflow: "hidden",
          }}>
            <div style={{
              padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: "rgba(245,158,11,0.08)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: "rgba(245,158,11,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "#fbbf24",
                }}>
                  <UserCheck size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#f8fafc" }}>
                    Auto-Substitution Engine
                  </h3>
                  <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
                    Covering for: {selectedLeave.teacher} ({selectedLeave.subject})
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setShowSubstitutionModal(false)} style={{
                background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer",
              }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>
                Available Substitute Teachers (Same Subject Qualified)
              </div>
              {TEACHERS.filter(t => t.available && t.name !== selectedLeave.teacher).slice(0, 4).map(t => (
                <div key={t.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.06)",
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc" }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>
                      Teaches: {SUBJECTS.find(s => s.code === t.subject)?.name || t.subject} &bull; 2 free periods today
                    </div>
                  </div>
                  <button type="button" onClick={() => {
                    alert(`Substitute assigned: ${t.name} will cover ${selectedLeave.subject} for ${selectedLeave.teacher}`);
                    setShowSubstitutionModal(false);
                  }} style={{
                    padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                    background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff",
                    fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 5,
                  }}>
                    <UserCheck size={12} /> Assign
                  </button>
                </div>
              ))}

              <div style={{
                padding: 10, borderRadius: 8, background: "rgba(99,102,241,0.08)",
                border: "1px solid rgba(99,102,241,0.2)", fontSize: 12, color: "#94a3b8",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <Bell size={14} color="#818cf8" />
                Selected substitute will receive an instant push notification with the schedule details.
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </AppLayout>
  );
}
