import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/AppLayout";
import api from "../api/axios";
import {
  CalendarCheck,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Search,
  Filter,
  Save,
  RefreshCw,
  History,
  X,
  AlertCircle,
  Check,
  ChevronRight
} from "lucide-react";

const STATUS_OPTIONS = ["PRESENT", "ABSENT", "LATE", "LEAVE"];

function normalizeArray(data, preferredKeys = []) {
  if (Array.isArray(data)) return data;
  for (const key of preferredKeys) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function getToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function Attendance() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [remarks, setRemarks] = useState({});

  const [attendanceDate, setAttendanceDate] = useState(getToday());
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [historyStudent, setHistoryStudent] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [attendanceDate]);

  async function loadStudents() {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/students");
      const list = normalizeArray(response.data, ["students", "items"]);
      setStudents(list);
    } catch (err) {
      console.error("Attendance - load students error:", err);
      setStudents([]);
      setError(err.response?.data?.detail || "Unable to load student cohort.");
    } finally {
      setLoading(false);
    }
  }

  async function loadAttendance() {
    try {
      setError("");
      const response = await api.get("/attendance", {
        params: { attendance_date: attendanceDate },
      });

      const records = normalizeArray(response.data, ["attendance", "records", "items", "data"]);
      const attMap = {};
      const remMap = {};

      records.forEach((r) => {
        if (r && r.student_id !== undefined) {
          attMap[r.student_id] = r.status;
          remMap[r.student_id] = r.remarks || "";
        }
      });

      setAttendance(attMap);
      setRemarks(remMap);
    } catch (err) {
      if (err.response?.status !== 404) {
        setError(err.response?.data?.detail || "Unable to retrieve attendance ledger.");
      }
      setAttendance({});
      setRemarks({});
    }
  }

  const safeStudents = Array.isArray(students) ? students : [];

  const classOptions = useMemo(() => {
    return [...new Set(safeStudents.map((s) => s?.class_name).filter(Boolean))].sort();
  }, [safeStudents]);

  const sectionOptions = useMemo(() => {
    return [
      ...new Set(
        safeStudents
          .filter((s) => !classFilter || s?.class_name === classFilter)
          .map((s) => s?.section)
          .filter(Boolean)
      ),
    ].sort();
  }, [safeStudents, classFilter]);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return safeStudents.filter((s) => {
      if (!s) return false;
      const matchesClass = !classFilter || s.class_name === classFilter;
      const matchesSection = !sectionFilter || s.section === sectionFilter;
      const fullName = [s.first_name, s.middle_name, s.last_name].filter(Boolean).join(" ").toLowerCase();
      const adm = String(s.admission_number || "").toLowerCase();
      const matchesSearch = !q || fullName.includes(q) || adm.includes(q);
      return matchesClass && matchesSection && matchesSearch;
    });
  }, [safeStudents, classFilter, sectionFilter, search]);

  const stats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let leave = 0;
    let unmarked = 0;

    filteredStudents.forEach((s) => {
      const st = attendance[s.id];
      if (st === "PRESENT") present++;
      else if (st === "ABSENT") absent++;
      else if (st === "LATE") late++;
      else if (st === "LEAVE") leave++;
      else unmarked++;
    });

    const total = filteredStudents.length;
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
    return { total, present, absent, late, leave, unmarked, rate };
  }, [filteredStudents, attendance]);

  function setStudentStatus(id, st) {
    setAttendance((prev) => ({ ...prev, [id]: st }));
  }

  function setStudentRemarks(id, val) {
    setRemarks((prev) => ({ ...prev, [id]: val }));
  }

  function markAll(st) {
    const next = { ...attendance };
    filteredStudents.forEach((s) => {
      next[s.id] = st;
    });
    setAttendance(next);
  }

  async function saveAttendance() {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const records = filteredStudents
        .filter((s) => attendance[s.id])
        .map((s) => ({
          student_id: s.id,
          status: attendance[s.id],
          remarks: remarks[s.id] || null,
        }));

      if (!records.length) {
        setError("Please mark status for at least one scholar before saving.");
        return;
      }

      const response = await api.post("/attendance/bulk", {
        attendance_date: attendanceDate,
        records,
      });

      setMessage(response.data?.message || "Attendance roll saved successfully.");
      await loadAttendance();
    } catch (err) {
      console.error("Save attendance error:", err);
      setError(err.response?.data?.detail || "Failed to persist attendance ledger.");
    } finally {
      setSaving(false);
    }
  }

  async function openHistory(student) {
    try {
      setHistoryLoading(true);
      setHistoryStudent({ ...student, history: null });
      const response = await api.get(`/attendance/student/${student.id}`);
      const historyData = response.data || {};
      const historyRecords = normalizeArray(historyData, ["records", "attendance", "items", "data"]);

      setHistoryStudent({
        ...student,
        history: {
          ...historyData,
          records: historyRecords,
        },
      });
    } catch (err) {
      console.error("Attendance history error:", err);
      setError(err.response?.data?.detail || "Unable to fetch student attendance timeline.");
      setHistoryStudent(null);
    } finally {
      setHistoryLoading(false);
    }
  }

  return (
    <AppLayout
      title="Daily Attendance Roll"
      subtitle="Biometric validation, scholar check-ins, and cohort presence ledgers."
      actions={
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={loadAttendance}
            disabled={saving}
            className="btn btn-secondary"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            <RefreshCw size={15} />
            Sync
          </button>
          <button
            onClick={saveAttendance}
            disabled={saving}
            className="btn btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            <Save size={16} />
            {saving ? "Persisting..." : "Save Roll"}
          </button>
        </div>
      }
    >
      {/* STATS HEADER */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "14px",
          marginBottom: "24px",
        }}
      >
        <div className="card" style={{ padding: "16px 18px" }}>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Presence Rate
          </div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "var(--accent-cyan)", marginTop: "4px" }}>
            {stats.rate}%
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
            {stats.present + stats.late} of {stats.total} present
          </div>
        </div>

        <div className="card" style={{ padding: "16px 18px" }}>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Present
          </div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "var(--accent-emerald)", marginTop: "4px" }}>
            {stats.present}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>On schedule</div>
        </div>

        <div className="card" style={{ padding: "16px 18px" }}>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Late Arrival
          </div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "var(--accent-amber)", marginTop: "4px" }}>
            {stats.late}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>Delayed intake</div>
        </div>

        <div className="card" style={{ padding: "16px 18px" }}>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Absent
          </div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "var(--accent-rose)", marginTop: "4px" }}>
            {stats.absent}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>Unexcused</div>
        </div>

        <div className="card" style={{ padding: "16px 18px" }}>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            Unmarked
          </div>
          <div style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-secondary)", marginTop: "4px" }}>
            {stats.unmarked}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>Awaiting check</div>
        </div>
      </div>

      {/* ALERTS */}
      {message && (
        <div
          style={{
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: "12px",
            padding: "14px 18px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#34d399",
          }}
        >
          <Check size={18} />
          <span style={{ fontSize: "13.5px" }}>{message}</span>
        </div>
      )}

      {error && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "12px",
            padding: "14px 18px",
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

      {/* CONTROLS & DATE SELECTOR */}
      <div
        className="card"
        style={{
          padding: "18px 20px",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          {/* DATE PICKER */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Calendar size={16} style={{ color: "var(--accent-cyan)" }} />
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="input-field"
              style={{ width: "auto", height: "38px", fontSize: "13px" }}
            />
          </div>

          {/* CLASS FILTER */}
          <select
            value={classFilter}
            onChange={(e) => {
              setClassFilter(e.target.value);
              setSectionFilter("");
            }}
            className="input-field"
            style={{ width: "auto", minWidth: "130px", height: "38px", fontSize: "13px" }}
          >
            <option value="">All Classes</option>
            {classOptions.map((c) => (
              <option key={c} value={c}>Class {c}</option>
            ))}
          </select>

          {/* SECTION FILTER */}
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="input-field"
            style={{ width: "auto", minWidth: "120px", height: "38px", fontSize: "13px" }}
          >
            <option value="">All Sections</option>
            {sectionOptions.map((s) => (
              <option key={s} value={s}>Section {s}</option>
            ))}
          </select>

          {/* SEARCH */}
          <div style={{ position: "relative", minWidth: "220px" }}>
            <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search scholar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: "34px", height: "38px", fontSize: "13px" }}
            />
          </div>
        </div>

        {/* BULK ACTIONS */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>Mark All:</span>
          <button
            type="button"
            onClick={() => markAll("PRESENT")}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 700,
              background: "rgba(16, 185, 129, 0.15)",
              color: "#34d399",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              cursor: "pointer",
            }}
          >
            Present
          </button>
          <button
            type="button"
            onClick={() => markAll("LATE")}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 700,
              background: "rgba(245, 158, 11, 0.15)",
              color: "#fbbf24",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              cursor: "pointer",
            }}
          >
            Late
          </button>
          <button
            type="button"
            onClick={() => markAll("ABSENT")}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 700,
              background: "rgba(239, 68, 68, 0.15)",
              color: "#f87171",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              cursor: "pointer",
            }}
          >
            Absent
          </button>
        </div>
      </div>

      {/* ROSTER TABLE */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
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
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Retrieving student roster...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <CalendarCheck size={44} style={{ color: "var(--text-muted)", opacity: 0.6, margin: "0 auto 14px" }} />
            <h3 style={{ fontSize: "17px", fontWeight: 600, color: "var(--text-bright)", margin: "0 0 6px" }}>
              No students found for cohort
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
              Try adjusting your class or section filters.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="dark-table">
              <thead>
                <tr>
                  <th>Scholar</th>
                  <th>Admission ID</th>
                  <th>Cohort</th>
                  <th>Attendance Status</th>
                  <th>Remarks / Notes</th>
                  <th style={{ textAlign: "right" }}>Log</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => {
                  const currentSt = attendance[s.id] || "";
                  const fullName = [s.first_name, s.middle_name, s.last_name].filter(Boolean).join(" ");

                  return (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600, color: "var(--text-bright)", fontSize: "14px" }}>
                        {fullName || `Student #${s.id}`}
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--accent-cyan)" }}>
                        {s.admission_number || "—"}
                      </td>
                      <td style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                        {s.class_name ? `Class ${s.class_name}` : "—"} {s.section ? `(${s.section})` : ""}
                      </td>
                      <td>
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          {STATUS_OPTIONS.map((st) => {
                            const isSelected = currentSt === st;
                            let activeBg = "rgba(99, 102, 241, 0.2)";
                            let activeColor = "var(--accent-indigo-light)";
                            let activeBorder = "var(--accent-indigo)";

                            if (st === "PRESENT") {
                              activeBg = "rgba(16, 185, 129, 0.25)";
                              activeColor = "#34d399";
                              activeBorder = "#10b981";
                            } else if (st === "ABSENT") {
                              activeBg = "rgba(239, 68, 68, 0.25)";
                              activeColor = "#f87171";
                              activeBorder = "#ef4444";
                            } else if (st === "LATE") {
                              activeBg = "rgba(245, 158, 11, 0.25)";
                              activeColor = "#fbbf24";
                              activeBorder = "#f59e0b";
                            } else if (st === "LEAVE") {
                              activeBg = "rgba(168, 85, 247, 0.25)";
                              activeColor = "#c084fc";
                              activeBorder = "#a855f7";
                            }

                            return (
                              <button
                                key={st}
                                type="button"
                                onClick={() => setStudentStatus(s.id, st)}
                                style={{
                                  padding: "5px 10px",
                                  borderRadius: "6px",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  transition: "all 0.12s ease",
                                  border: isSelected ? `1px solid ${activeBorder}` : "1px solid var(--border-default)",
                                  background: isSelected ? activeBg : "rgba(255, 255, 255, 0.03)",
                                  color: isSelected ? activeColor : "var(--text-muted)",
                                }}
                              >
                                {st}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="Optional notes..."
                          value={remarks[s.id] || ""}
                          onChange={(e) => setStudentRemarks(s.id, e.target.value)}
                          className="input-field"
                          style={{ height: "34px", fontSize: "12.5px", maxWidth: "220px" }}
                        />
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          onClick={() => openHistory(s)}
                          className="btn btn-secondary"
                          style={{ padding: "5px 10px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                        >
                          <History size={13} />
                          Log
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* STUDENT HISTORY TIMELINE MODAL */}
      {historyStudent && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000,
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: "600px",
              maxHeight: "85vh",
              overflowY: "auto",
              padding: 0,
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid var(--border-default)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "var(--text-bright)" }}>
                  Attendance History
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: "12.5px", color: "var(--text-secondary)" }}>
                  {historyStudent.first_name} {historyStudent.last_name} · Admission #{historyStudent.admission_number || "—"}
                </p>
              </div>
              <button
                onClick={() => setHistoryStudent(null)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "24px" }}>
              {historyLoading ? (
                <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                  Loading timeline...
                </div>
              ) : !historyStudent.history?.records?.length ? (
                <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)", fontSize: "13.5px" }}>
                  No historical attendance log recorded for this student.
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="dark-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyStudent.history.records.map((r, i) => (
                        <tr key={i}>
                          <td style={{ fontSize: "13px", color: "var(--text-bright)" }}>
                            {r.attendance_date || r.date || "—"}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                r.status === "PRESENT"
                                  ? "badge-success"
                                  : r.status === "ABSENT"
                                  ? "badge-danger"
                                  : "badge-warning"
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>
                            {r.remarks || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}