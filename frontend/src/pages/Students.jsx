import React, { useEffect, useState, useMemo } from "react";
import AppLayout from "../components/AppLayout";
import { API_BASE_URL } from "../api/config";
import {
  GraduationCap,
  Plus,
  Search,
  RefreshCw,
  Users,
  CheckCircle2,
  Calendar,
  Phone,
  MapPin,
  X,
  AlertCircle,
  Filter,
  Layers,
  ArrowRight
} from "lucide-react";

const emptyStudentForm = {
  admission_number: "",
  first_name: "",
  last_name: "",
  date_of_birth: "",
  gender: "",
  phone: "",
  address: "",
  class_name: "",
  section: "",
  academic_year: "",
  admission_date: "",
  status: "ACTIVE",
};

function normalizeStudents(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.students)) return data.students;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function getStudentName(student) {
  const fullName = [student.first_name, student.middle_name, student.last_name]
    .filter(Boolean)
    .join(" ");

  return (
    fullName ||
    student.name ||
    student.student_name ||
    student.full_name ||
    `Student #${student.id}`
  );
}

function getClassName(student) {
  if (student.class_name && student.section) {
    return `${student.class_name} - ${student.section}`;
  }
  return student.class_name || student.class || student.grade || "Unassigned";
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [form, setForm] = useState(emptyStudentForm);

  async function loadStudents() {
    try {
      setLoading(true);
      setError("");

      const accessToken =
        localStorage.getItem("access_token") ||
        localStorage.getItem("token") ||
        "";

      const response = await fetch(`${API_BASE_URL}/students`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });

      if (response.status === 401) {
        throw new Error("Your session has expired. Please login again.");
      }
      if (response.status === 403) {
        throw new Error("You do not have permission to view students.");
      }
      if (!response.ok) {
        let message = `Failed to load students (${response.status})`;
        try {
          const errData = await response.json();
          message = errData?.detail || errData?.message || message;
        } catch {
          // ignore
        }
        throw new Error(message);
      }

      const data = await response.json();
      setStudents(normalizeStudents(data));
    } catch (err) {
      console.error("Students loading error:", err);
      setStudents([]);
      setError(err?.message || "Unable to load student database. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormError("");
    setSuccessMessage("");
  }

  function openAddForm() {
    setForm({ ...emptyStudentForm });
    setFormError("");
    setSuccessMessage("");
    setShowAddForm(true);
  }

  function closeAddForm() {
    if (saving) return;
    setShowAddForm(false);
    setForm({ ...emptyStudentForm });
    setFormError("");
    setSuccessMessage("");
  }

  async function handleCreateStudent(e) {
    e.preventDefault();
    setFormError("");
    setSuccessMessage("");

    if (!form.admission_number.trim()) {
      setFormError("Admission number is required.");
      return;
    }
    if (!form.first_name.trim()) {
      setFormError("First name is required.");
      return;
    }

    try {
      setSaving(true);
      const accessToken =
        localStorage.getItem("access_token") ||
        localStorage.getItem("token") ||
        "";

      const payload = {
        admission_number: form.admission_number.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim() || null,
        date_of_birth: form.date_of_birth || null,
        gender: form.gender || null,
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
        class_name: form.class_name.trim() || null,
        section: form.section.trim() || null,
        academic_year: form.academic_year.trim() || null,
        admission_date: form.admission_date || null,
        status: form.status || "ACTIVE",
      };

      const response = await fetch(`${API_BASE_URL}/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          responseData?.detail ||
          responseData?.message ||
          `Failed to create student (${response.status})`
        );
      }

      await loadStudents();
      setSuccessMessage("Student successfully enrolled in EduNexus network.");
      setForm({ ...emptyStudentForm });

      setTimeout(() => {
        setShowAddForm(false);
        setSuccessMessage("");
      }, 900);
    } catch (err) {
      setFormError(err?.message || "Failed to submit student record.");
    } finally {
      setSaving(false);
    }
  }

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const name = getStudentName(s).toLowerCase();
      const adm = (s.admission_number || "").toLowerCase();
      const cls = (s.class_name || "").toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch = !searchTerm || name.includes(q) || adm.includes(q) || cls.includes(q);
      const matchesClass = selectedClass === "ALL" || s.class_name === selectedClass;
      const matchesStatus =
        selectedStatus === "ALL" ||
        (s.status || "ACTIVE").toUpperCase() === selectedStatus;

      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [students, searchTerm, selectedClass, selectedStatus]);

  // Derived stats
  const distinctClasses = useMemo(() => {
    const set = new Set();
    students.forEach((s) => {
      if (s.class_name) set.add(s.class_name);
    });
    return Array.from(set).sort();
  }, [students]);

  const activeCount = useMemo(() => {
    return students.filter((s) => (s.status || "ACTIVE").toUpperCase() === "ACTIVE").length;
  }, [students]);

  return (
    <AppLayout
      title="Student Directory"
      subtitle="Institutional cohort rosters, admission records, and academic profiles."
      actions={
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={loadStudents}
            disabled={loading}
            className="btn btn-secondary"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Sync
          </button>
          <button
            onClick={openAddForm}
            className="btn btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            <Plus size={16} />
            Enroll Student
          </button>
        </div>
      }
    >
      {/* KPI METRIC CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
              Total Students
            </span>
            <Users size={18} style={{ color: "var(--accent-indigo)" }} />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-bright)" }}>
            {students.length}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Enrolled in system
          </div>
        </div>

        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
              Active Scholars
            </span>
            <CheckCircle2 size={18} style={{ color: "var(--accent-emerald)" }} />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--accent-emerald)" }}>
            {activeCount}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Current active cohort
          </div>
        </div>

        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
              Academic Classes
            </span>
            <Layers size={18} style={{ color: "var(--accent-cyan)" }} />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--accent-cyan)" }}>
            {distinctClasses.length}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Configured streams
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div
        className="card"
        style={{
          padding: "16px 20px",
          marginBottom: "20px",
          display: "flex",
          flexWrap: "wrap",
          gap: "14px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flex: "1 1 300px" }}>
          <div style={{ position: "relative", width: "100%", maxWidth: "380px" }}>
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
              placeholder="Search by name, admission no., or grade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{
                paddingLeft: "40px",
                fontSize: "13.5px",
                height: "42px",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Filter size={15} style={{ color: "var(--text-muted)" }} />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="input-field"
              style={{ width: "auto", minWidth: "130px", height: "42px", fontSize: "13px" }}
            >
              <option value="ALL">All Classes</option>
              {distinctClasses.map((cls) => (
                <option key={cls} value={cls}>
                  Class {cls}
                </option>
              ))}
            </select>
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input-field"
            style={{ width: "auto", minWidth: "120px", height: "42px", fontSize: "13px" }}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
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
            gap: "12px",
            color: "#f87171",
          }}
        >
          <AlertCircle size={20} />
          <span style={{ fontSize: "14px" }}>{error}</span>
        </div>
      )}

      {/* TABLE / LIST CONTAINER */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-default)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-secondary)" }}>
            Showing {filteredStudents.length} of {students.length} students
          </span>
        </div>

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
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              Decrypting institutional records...
            </p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div style={{ padding: "70px 20px", textAlign: "center" }}>
            <GraduationCap
              size={44}
              style={{ color: "var(--text-muted)", opacity: 0.6, margin: "0 auto 16px" }}
            />
            <h3 style={{ fontSize: "17px", fontWeight: 600, color: "var(--text-bright)", margin: "0 0 6px" }}>
              No students found
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "13.5px", maxWidth: "380px", margin: "0 auto 20px" }}>
              {searchTerm || selectedClass !== "ALL"
                ? "No records match your active search filters."
                : "No student profiles exist in the institutional registry yet."}
            </p>
            <button onClick={openAddForm} className="btn btn-primary">
              <Plus size={16} /> Enroll New Student
            </button>
          </div>
        ) : (
          <div style={{ width: "100%", overflowX: "auto" }}>
            <table className="dark-table">
              <thead>
                <tr>
                  <th>Student Info</th>
                  <th>Admission ID</th>
                  <th>Cohort / Class</th>
                  <th>Contact Phone</th>
                  <th>Academic Session</th>
                  <th>Status</th>
                  <th>Admission Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                  const studentName = getStudentName(student);
                  const initial = studentName.charAt(0).toUpperCase();
                  const isActive = (student.status || "ACTIVE").toUpperCase() === "ACTIVE";

                  return (
                    <tr key={student.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div
                            style={{
                              width: "38px",
                              height: "38px",
                              borderRadius: "10px",
                              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(6, 182, 212, 0.2))",
                              border: "1px solid rgba(99, 102, 241, 0.3)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              fontSize: "14px",
                              color: "var(--text-bright)",
                            }}
                          >
                            {initial}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: "var(--text-bright)", fontSize: "14px" }}>
                              {studentName}
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                              {student.gender ? `${student.gender} • ` : ""}ID #{student.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--accent-cyan)" }}>
                        {student.admission_number || "—"}
                      </td>
                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 9px",
                            borderRadius: "6px",
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid var(--border-default)",
                            fontSize: "12.5px",
                            fontWeight: 600,
                            color: "var(--text-bright)",
                          }}
                        >
                          {getClassName(student)}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
                        {student.phone ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <Phone size={13} style={{ color: "var(--text-muted)" }} />
                            <span>{student.phone}</span>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
                        {student.academic_year || "—"}
                      </td>
                      <td>
                        <span className={`badge ${isActive ? "badge-success" : "badge-danger"}`}>
                          {student.status || "ACTIVE"}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-muted)", fontSize: "12.5px" }}>
                        {formatDate(student.admission_date)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ENROLLMENT MODAL */}
      {showAddForm && (
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
              maxWidth: "760px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 0,
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            {/* MODAL HEADER */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid var(--border-default)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "sticky",
                top: 0,
                background: "var(--bg-surface)",
                zIndex: 2,
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: "19px", fontWeight: 700, color: "var(--text-bright)" }}>
                  Enroll New Student
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: "12.5px", color: "var(--text-secondary)" }}>
                  Generate institutional ledger profile and assign academic cohort.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAddForm}
                disabled={saving}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: "6px",
                  borderRadius: "8px",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* MODAL BODY */}
            <form onSubmit={handleCreateStudent} style={{ padding: "24px" }}>
              {formError && (
                <div
                  style={{
                    marginBottom: "18px",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    background: "rgba(239, 68, 68, 0.12)",
                    color: "#f87171",
                    border: "1px solid rgba(239, 68, 68, 0.25)",
                    fontSize: "13.5px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              {successMessage && (
                <div
                  style={{
                    marginBottom: "18px",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    background: "rgba(16, 185, 129, 0.12)",
                    color: "#34d399",
                    border: "1px solid rgba(16, 185, 129, 0.25)",
                    fontSize: "13.5px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>{successMessage}</span>
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "18px",
                }}
              >
                <div>
                  <label className="form-label">
                    Admission Number <span style={{ color: "var(--accent-cyan)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="admission_number"
                    value={form.admission_number}
                    onChange={handleFormChange}
                    placeholder="e.g. ADM-2026-081"
                    required
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="form-label">
                    First Name <span style={{ color: "var(--accent-cyan)" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleFormChange}
                    placeholder="e.g. Aryan"
                    required
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleFormChange}
                    placeholder="e.g. Sharma"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="form-label">Gender</label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleFormChange}
                    className="input-field"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={form.date_of_birth}
                    onChange={handleFormChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="form-label">Contact Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleFormChange}
                    placeholder="+91 98765 43210"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="form-label">Class / Grade</label>
                  <input
                    type="text"
                    name="class_name"
                    value={form.class_name}
                    onChange={handleFormChange}
                    placeholder="e.g. 10th or Grade 11"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="form-label">Section</label>
                  <input
                    type="text"
                    name="section"
                    value={form.section}
                    onChange={handleFormChange}
                    placeholder="e.g. A"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="form-label">Academic Year</label>
                  <input
                    type="text"
                    name="academic_year"
                    value={form.academic_year}
                    onChange={handleFormChange}
                    placeholder="e.g. 2026-2027"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="form-label">Admission Date</label>
                  <input
                    type="date"
                    name="admission_date"
                    value={form.admission_date}
                    onChange={handleFormChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="form-label">Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                    className="input-field"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="form-label">Residential Address</label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleFormChange}
                    placeholder="Residential address..."
                    rows={3}
                    className="input-field"
                    style={{ resize: "vertical" }}
                  />
                </div>
              </div>

              {/* MODAL ACTIONS */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  marginTop: "24px",
                  paddingTop: "18px",
                  borderTop: "1px solid var(--border-default)",
                }}
              >
                <button
                  type="button"
                  onClick={closeAddForm}
                  disabled={saving}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving ? "Registering Record..." : "Confirm Enrollment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}