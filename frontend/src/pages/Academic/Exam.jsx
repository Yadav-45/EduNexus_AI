import React, { useEffect, useMemo, useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

const STATUS_OPTIONS = [
  "SCHEDULED",
  "ONGOING",
  "COMPLETED",
  "CANCELLED",
];

const EXAM_TYPES = [
  "UNIT_TEST",
  "PERIODIC_TEST",
  "MID_TERM",
  "TERM",
  "FINAL",
  "ANNUAL",
  "PRACTICAL",
  "OTHER",
];

const emptyForm = {
  exam_name: "",
  exam_type: "TERM",
  academic_year: "2026-27",
  term: "Term 1",
  description: "",
  class_name: "",
  section: "",
  subject_name: "",
  subject_code: "",
  exam_date: "",
  start_time: "",
  end_time: "",
  duration_minutes: 60,
  room_number: "",
  maximum_marks: 100,
  passing_marks: 33,
  status: "SCHEDULED",
  is_published: false,
  instructions: "",
  remarks: "",
};

function Exams() {
  const [exams, setExams] = useState([]);
  const [summary, setSummary] = useState({
    total_exams: 0,
    scheduled_exams: 0,
    completed_exams: 0,
    cancelled_exams: 0,
    published_exams: 0,
    unpublished_exams: 0,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [academicYearFilter, setAcademicYearFilter] = useState("2026-27");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("token");

  const authHeaders = {
    "Content-Type": "application/json",
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };

  // ============================================================
  // LOAD EXAMS
  // ============================================================

  const loadExams = async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams();

      params.set("page", page);
      params.set("page_size", pageSize);

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (statusFilter) {
        params.set("status", statusFilter);
      }

      if (classFilter.trim()) {
        params.set("class_name", classFilter.trim());
      }

      if (typeFilter) {
        params.set("exam_type", typeFilter);
      }

      if (academicYearFilter) {
        params.set(
          "academic_year",
          academicYearFilter
        );
      }

      const response = await fetch(
        `${API_BASE}/exams?${params.toString()}`,
        {
          headers: authHeaders,
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load exams (${response.status})`
        );
      }

      const data = await response.json();

      setExams(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 0);
    } catch (error) {
      console.error(error);
      alert(
        error.message ||
          "Unable to load examinations."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOAD SUMMARY
  // ============================================================

  const loadSummary = async () => {
    try {
      const params = new URLSearchParams();

      if (academicYearFilter) {
        params.set(
          "academic_year",
          academicYearFilter
        );
      }

      const response = await fetch(
        `${API_BASE}/exams/summary?${params.toString()}`,
        {
          headers: authHeaders,
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load exam summary."
        );
      }

      const data = await response.json();

      setSummary(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadExams();
  }, [
    page,
    search,
    statusFilter,
    classFilter,
    typeFilter,
    academicYearFilter,
  ]);

  useEffect(() => {
    loadSummary();
  }, [academicYearFilter]);

  // ============================================================
  // FORM HELPERS
  // ============================================================

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const openCreateModal = () => {
    setEditingExam(null);

    setForm({
      ...emptyForm,
      academic_year:
        academicYearFilter || "2026-27",
    });

    setShowModal(true);
  };

  const openEditModal = (exam) => {
    setEditingExam(exam);

    setForm({
      exam_name: exam.exam_name || "",
      exam_type: exam.exam_type || "TERM",
      academic_year:
        exam.academic_year || "2026-27",
      term: exam.term || "",
      description: exam.description || "",
      class_name: exam.class_name || "",
      section: exam.section || "",
      subject_name: exam.subject_name || "",
      subject_code: exam.subject_code || "",
      exam_date: exam.exam_date || "",
      start_time: exam.start_time || "",
      end_time: exam.end_time || "",
      duration_minutes:
        exam.duration_minutes || 60,
      room_number: exam.room_number || "",
      maximum_marks:
        exam.maximum_marks ?? 100,
      passing_marks:
        exam.passing_marks ?? 33,
      status:
        exam.status || "SCHEDULED",
      is_published:
        Boolean(exam.is_published),
      instructions:
        exam.instructions || "",
      remarks: exam.remarks || "",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingExam(null);
    setForm(emptyForm);
  };

  // ============================================================
  // SAVE EXAM
  // ============================================================

  const saveExam = async (event) => {
    event.preventDefault();

    if (!form.exam_name.trim()) {
      alert("Please enter the exam name.");
      return;
    }

    if (!form.academic_year.trim()) {
      alert("Please enter the academic year.");
      return;
    }

    if (!form.class_name.trim()) {
      alert("Please enter the class.");
      return;
    }

    if (!form.subject_name.trim()) {
      alert("Please enter the subject.");
      return;
    }

    if (!form.exam_date) {
      alert("Please select the exam date.");
      return;
    }

    if (
      Number(form.passing_marks) >
      Number(form.maximum_marks)
    ) {
      alert(
        "Passing marks cannot be greater than maximum marks."
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        exam_name: form.exam_name.trim(),
        exam_type: form.exam_type,
        academic_year:
          form.academic_year.trim(),
        term: form.term.trim() || null,
        description:
          form.description.trim() || null,

        class_name:
          form.class_name.trim(),
        section:
          form.section.trim() || null,

        subject_name:
          form.subject_name.trim(),
        subject_code:
          form.subject_code.trim() || null,

        exam_date: form.exam_date,
        start_time:
          form.start_time || null,
        end_time:
          form.end_time || null,

        duration_minutes:
          form.duration_minutes
            ? Number(form.duration_minutes)
            : null,

        room_number:
          form.room_number.trim() || null,

        maximum_marks:
          Number(form.maximum_marks),

        passing_marks:
          Number(form.passing_marks),

        status: form.status,

        is_published:
          Boolean(form.is_published),

        instructions:
          form.instructions.trim() || null,

        remarks:
          form.remarks.trim() || null,
      };

      const url = editingExam
        ? `${API_BASE}/exams/${editingExam.id}`
        : `${API_BASE}/exams`;

      const method = editingExam
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to save examination."
        );
      }

      alert(
        editingExam
          ? "Exam updated successfully."
          : "Exam created successfully."
      );

      closeModal();

      await loadExams();
      await loadSummary();
    } catch (error) {
      console.error(error);
      alert(
        error.message ||
          "Unable to save examination."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // UPDATE STATUS
  // ============================================================

  const updateStatus = async (exam, status) => {
    try {
      const response = await fetch(
        `${API_BASE}/exams/${exam.id}/status`,
        {
          method: "PATCH",
          headers: authHeaders,
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to update exam status."
        );
      }

      await loadExams();
      await loadSummary();
    } catch (error) {
      console.error(error);
      alert(
        error.message ||
          "Unable to update status."
      );
    }
  };

  // ============================================================
  // PUBLISH
  // ============================================================

  const togglePublish = async (exam) => {
    const nextValue =
      !Boolean(exam.is_published);

    const action = nextValue
      ? "publish"
      : "unpublish";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this exam?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_BASE}/exams/${exam.id}/publish`,
        {
          method: "PATCH",
          headers: authHeaders,
          body: JSON.stringify({
            is_published: nextValue,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to update publication status."
        );
      }

      await loadExams();
      await loadSummary();
    } catch (error) {
      console.error(error);
      alert(
        error.message ||
          "Unable to update publication status."
      );
    }
  };

  // ============================================================
  // DELETE
  // ============================================================

  const deleteExam = async (exam) => {
    const confirmed = window.confirm(
      `Delete "${exam.exam_name}" - ${exam.subject_name}?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_BASE}/exams/${exam.id}`,
        {
          method: "DELETE",
          headers: authHeaders,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to delete examination."
        );
      }

      alert("Exam deleted successfully.");

      await loadExams();
      await loadSummary();
    } catch (error) {
      console.error(error);
      alert(
        error.message ||
          "Unable to delete examination."
      );
    }
  };

  // ============================================================
  // RESET FILTERS
  // ============================================================

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setClassFilter("");
    setTypeFilter("");
    setAcademicYearFilter("2026-27");
    setPage(1);
  };

  // ============================================================
  // FORMATTERS
  // ============================================================

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(
      `${value}T00:00:00`
    );

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatTime = (value) => {
    if (!value) return "—";

    const parts = value.split(":");

    if (parts.length < 2) {
      return value;
    }

    let hours = Number(parts[0]);
    const minutes = parts[1];

    if (Number.isNaN(hours)) {
      return value;
    }

    const suffix =
      hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;

    return `${hours}:${minutes} ${suffix}`;
  };

  const formatExamType = (value) => {
    if (!value) return "—";

    return value
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const statusClass = (status) => {
    switch (status) {
      case "SCHEDULED":
        return "status-scheduled";

      case "ONGOING":
        return "status-ongoing";

      case "COMPLETED":
        return "status-completed";

      case "CANCELLED":
        return "status-cancelled";

      default:
        return "status-default";
    }
  };

  const publishClass = (published) =>
    published
      ? "published-badge"
      : "draft-badge";

  const classOptions = useMemo(() => {
    const values = exams
      .map((exam) => exam.class_name)
      .filter(Boolean);

    return [...new Set(values)].sort(
      (a, b) =>
        String(a).localeCompare(
          String(b),
          undefined,
          { numeric: true }
        )
    );
  }, [exams]);

  return (
    <div className="exams-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .exams-page {
          min-height: 100vh;
          padding: 28px;
          background:
            linear-gradient(
              135deg,
              #f8fafc 0%,
              #eef4ff 50%,
              #f8fafc 100%
            );
          color: #172033;
        }

        .exams-container {
          max-width: 1500px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 26px;
        }

        .header-left h1 {
          margin: 0;
          font-size: 30px;
          font-weight: 800;
          letter-spacing: -0.6px;
        }

        .header-left p {
          margin: 8px 0 0;
          color: #64748b;
          font-size: 14px;
        }

        .header-actions {
          display: flex;
          gap: 10px;
        }

        button {
          font-family: inherit;
        }

        .primary-btn {
          border: none;
          border-radius: 10px;
          padding: 11px 18px;
          background: #2563eb;
          color: white;
          font-weight: 700;
          cursor: pointer;
          box-shadow:
            0 8px 18px rgba(37, 99, 235, 0.20);
        }

        .primary-btn:hover {
          background: #1d4ed8;
        }

        .secondary-btn {
          border: 1px solid #d7dee9;
          border-radius: 10px;
          padding: 10px 16px;
          background: white;
          color: #334155;
          font-weight: 600;
          cursor: pointer;
        }

        .secondary-btn:hover {
          background: #f8fafc;
        }

        .summary-grid {
          display: grid;
          grid-template-columns:
            repeat(6, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 22px;
        }

        .summary-card {
          background: rgba(255,255,255,0.94);
          border: 1px solid #e3e8f0;
          border-radius: 14px;
          padding: 18px;
          box-shadow:
            0 8px 25px rgba(15, 23, 42, 0.05);
        }

        .summary-label {
          color: #64748b;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .summary-value {
          margin-top: 7px;
          font-size: 25px;
          font-weight: 800;
        }

        .summary-sub {
          margin-top: 4px;
          font-size: 12px;
          color: #94a3b8;
        }

        .filters-card {
          background: white;
          border: 1px solid #e3e8f0;
          border-radius: 14px;
          padding: 16px;
          margin-bottom: 18px;
          box-shadow:
            0 8px 25px rgba(15, 23, 42, 0.04);
        }

        .filters-grid {
          display: grid;
          grid-template-columns:
            2fr 1fr 1fr 1fr 1fr auto;
          gap: 10px;
          align-items: end;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .field label {
          font-size: 12px;
          font-weight: 700;
          color: #475569;
        }

        input,
        select,
        textarea {
          width: 100%;
          border: 1px solid #d7dee9;
          border-radius: 9px;
          padding: 10px 11px;
          font-size: 14px;
          color: #172033;
          background: white;
          outline: none;
        }

        input:focus,
        select:focus,
        textarea:focus {
          border-color: #2563eb;
          box-shadow:
            0 0 0 3px rgba(37, 99, 235, 0.10);
        }

        textarea {
          min-height: 90px;
          resize: vertical;
        }

        .table-card {
          background: white;
          border: 1px solid #e3e8f0;
          border-radius: 14px;
          overflow: hidden;
          box-shadow:
            0 8px 25px rgba(15, 23, 42, 0.04);
        }

        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 20px;
          border-bottom: 1px solid #edf1f5;
        }

        .table-title {
          font-size: 17px;
          font-weight: 800;
        }

        .table-count {
          color: #64748b;
          font-size: 13px;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1250px;
        }

        th {
          background: #f8fafc;
          color: #64748b;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          text-align: left;
          padding: 13px 14px;
          border-bottom: 1px solid #e7ebf0;
          white-space: nowrap;
        }

        td {
          padding: 14px;
          border-bottom: 1px solid #edf1f5;
          vertical-align: middle;
          font-size: 13px;
        }

        tbody tr:hover {
          background: #fafcff;
        }

        .exam-name {
          font-weight: 750;
          color: #172033;
        }

        .exam-code {
          margin-top: 3px;
          color: #94a3b8;
          font-size: 11px;
          font-family: monospace;
        }

        .subject-name {
          font-weight: 700;
        }

        .muted {
          color: #64748b;
        }

        .status-badge,
        .published-badge,
        .draft-badge {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: 5px 9px;
          font-size: 10px;
          font-weight: 800;
          white-space: nowrap;
        }

        .status-scheduled {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .status-ongoing {
          background: #fef3c7;
          color: #92400e;
        }

        .status-completed {
          background: #dcfce7;
          color: #166534;
        }

        .status-cancelled {
          background: #fee2e2;
          color: #991b1b;
        }

        .status-default {
          background: #f1f5f9;
          color: #475569;
        }

        .published-badge {
          background: #dcfce7;
          color: #166534;
        }

        .draft-badge {
          background: #f1f5f9;
          color: #64748b;
        }

        .action-group {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .small-btn {
          border: 1px solid #d7dee9;
          background: white;
          color: #334155;
          border-radius: 7px;
          padding: 6px 8px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .small-btn:hover {
          background: #f8fafc;
        }

        .small-btn.blue {
          border-color: #bfdbfe;
          color: #1d4ed8;
          background: #eff6ff;
        }

        .small-btn.green {
          border-color: #bbf7d0;
          color: #15803d;
          background: #f0fdf4;
        }

        .small-btn.red {
          border-color: #fecaca;
          color: #b91c1c;
          background: #fef2f2;
        }

        .empty-state {
          text-align: center;
          padding: 55px 20px;
          color: #64748b;
        }

        .empty-icon {
          font-size: 40px;
          margin-bottom: 10px;
        }

        .loading {
          text-align: center;
          padding: 45px;
          color: #64748b;
        }

        .pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          border-top: 1px solid #edf1f5;
        }

        .page-info {
          color: #64748b;
          font-size: 13px;
        }

        .pagination-actions {
          display: flex;
          gap: 8px;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.50);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          z-index: 1000;
        }

        .modal {
          width: min(900px, 100%);
          max-height: 92vh;
          overflow-y: auto;
          background: white;
          border-radius: 16px;
          box-shadow:
            0 30px 80px rgba(15, 23, 42, 0.25);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 22px;
          border-bottom: 1px solid #edf1f5;
          position: sticky;
          top: 0;
          background: white;
          z-index: 2;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 20px;
        }

        .close-btn {
          width: 34px;
          height: 34px;
          border: none;
          border-radius: 8px;
          background: #f1f5f9;
          color: #475569;
          cursor: pointer;
          font-size: 18px;
        }

        .modal-body {
          padding: 22px;
        }

        .form-section {
          margin-bottom: 24px;
        }

        .form-section-title {
          font-size: 14px;
          font-weight: 800;
          color: #334155;
          margin-bottom: 13px;
          padding-bottom: 8px;
          border-bottom: 1px solid #edf1f5;
        }

        .form-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .form-grid.two {
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
        }

        .form-grid.one {
          grid-template-columns: 1fr;
        }

        .checkbox-field {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 24px;
        }

        .checkbox-field input {
          width: auto;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 17px 22px;
          border-top: 1px solid #edf1f5;
          position: sticky;
          bottom: 0;
          background: white;
        }

        .save-btn {
          border: none;
          border-radius: 9px;
          padding: 10px 20px;
          background: #2563eb;
          color: white;
          font-weight: 750;
          cursor: pointer;
        }

        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 1200px) {
          .summary-grid {
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }

          .filters-grid {
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .exams-page {
            padding: 15px;
          }

          .page-header {
            flex-direction: column;
          }

          .summary-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .filters-grid,
          .form-grid,
          .form-grid.two {
            grid-template-columns: 1fr;
          }

          .header-actions {
            width: 100%;
          }

          .header-actions button {
            flex: 1;
          }
        }
      `}</style>

      <div className="exams-container">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="page-header">
          <div className="header-left">
            <h1>📝 Examinations</h1>
            <p>
              Schedule exams, manage marks configuration,
              publish examinations and track academic assessments.
            </p>
          </div>

          <div className="header-actions">
            <button
              className="secondary-btn"
              onClick={() => {
                loadExams();
                loadSummary();
              }}
            >
              ↻ Refresh
            </button>

            <button
              className="primary-btn"
              onClick={openCreateModal}
            >
              + New Examination
            </button>
          </div>
        </div>

        {/* =====================================================
            SUMMARY
        ====================================================== */}

        <div className="summary-grid">

          <div className="summary-card">
            <div className="summary-label">
              Total Exams
            </div>

            <div className="summary-value">
              {summary.total_exams}
            </div>

            <div className="summary-sub">
              Academic year
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-label">
              Scheduled
            </div>

            <div className="summary-value">
              {summary.scheduled_exams}
            </div>

            <div className="summary-sub">
              Upcoming assessments
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-label">
              Ongoing
            </div>

            <div className="summary-value">
              {Math.max(
                0,
                summary.total_exams -
                  summary.scheduled_exams -
                  summary.completed_exams -
                  summary.cancelled_exams
              )}
            </div>

            <div className="summary-sub">
              Currently in progress
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-label">
              Completed
            </div>

            <div className="summary-value">
              {summary.completed_exams}
            </div>

            <div className="summary-sub">
              Finished examinations
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-label">
              Published
            </div>

            <div className="summary-value">
              {summary.published_exams}
            </div>

            <div className="summary-sub">
              Visible results
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-label">
              Cancelled
            </div>

            <div className="summary-value">
              {summary.cancelled_exams}
            </div>

            <div className="summary-sub">
              Cancelled assessments
            </div>
          </div>

        </div>

        {/* =====================================================
            FILTERS
        ====================================================== */}

        <div className="filters-card">
          <div className="filters-grid">

            <div className="field">
              <label>Search</label>

              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search exam, subject, class..."
              />
            </div>

            <div className="field">
              <label>Academic Year</label>

              <select
                value={academicYearFilter}
                onChange={(event) => {
                  setAcademicYearFilter(
                    event.target.value
                  );
                  setPage(1);
                }}
              >
                <option value="2026-27">
                  2026-27
                </option>

                <option value="2025-26">
                  2025-26
                </option>

                <option value="2027-28">
                  2027-28
                </option>
              </select>
            </div>

            <div className="field">
              <label>Class</label>

              <input
                value={classFilter}
                onChange={(event) => {
                  setClassFilter(
                    event.target.value
                  );
                  setPage(1);
                }}
                placeholder="e.g. 8"
              />
            </div>

            <div className="field">
              <label>Exam Type</label>

              <select
                value={typeFilter}
                onChange={(event) => {
                  setTypeFilter(
                    event.target.value
                  );
                  setPage(1);
                }}
              >
                <option value="">
                  All Types
                </option>

                {EXAM_TYPES.map((type) => (
                  <option
                    key={type}
                    value={type}
                  >
                    {formatExamType(type)}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Status</label>

              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(
                    event.target.value
                  );
                  setPage(1);
                }}
              >
                <option value="">
                  All Statuses
                </option>

                {STATUS_OPTIONS.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {formatExamType(status)}
                    </option>
                  )
                )}
              </select>
            </div>

            <button
              className="secondary-btn"
              onClick={resetFilters}
            >
              Reset
            </button>

          </div>
        </div>

        {/* =====================================================
            TABLE
        ====================================================== */}

        <div className="table-card">

          <div className="table-header">
            <div>
              <div className="table-title">
                Examination Schedule
              </div>

              <div className="table-count">
                {total} examination
                {total === 1 ? "" : "s"} found
              </div>
            </div>
          </div>

          <div className="table-wrapper">

            {loading ? (
              <div className="loading">
                Loading examinations...
              </div>
            ) : exams.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  📝
                </div>

                <div>
                  No examinations found.
                </div>

                <div
                  style={{
                    marginTop: 8,
                    fontSize: 13,
                  }}
                >
                  Create your first examination
                  using the button above.
                </div>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Examination</th>
                    <th>Class</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Marks</th>
                    <th>Status</th>
                    <th>Publication</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {exams.map((exam) => (
                    <tr key={exam.id}>

                      <td>
                        <div className="exam-name">
                          {exam.exam_name}
                        </div>

                        <div className="exam-code">
                          {exam.exam_code}
                        </div>

                        <div
                          className="muted"
                          style={{
                            marginTop: 4,
                            fontSize: 11,
                          }}
                        >
                          {formatExamType(
                            exam.exam_type
                          )}
                          {exam.term
                            ? ` • ${exam.term}`
                            : ""}
                        </div>
                      </td>

                      <td>
                        <strong>
                          {exam.class_name}
                        </strong>

                        {exam.section && (
                          <div className="muted">
                            Section{" "}
                            {exam.section}
                          </div>
                        )}
                      </td>

                      <td>
                        <div className="subject-name">
                          {exam.subject_name}
                        </div>

                        {exam.subject_code && (
                          <div className="exam-code">
                            {exam.subject_code}
                          </div>
                        )}
                      </td>

                      <td>
                        {formatDate(
                          exam.exam_date
                        )}
                      </td>

                      <td>
                        <div>
                          {formatTime(
                            exam.start_time
                          )}
                        </div>

                        {exam.end_time && (
                          <div className="muted">
                            to{" "}
                            {formatTime(
                              exam.end_time
                            )}
                          </div>
                        )}

                        {exam.duration_minutes && (
                          <div
                            className="muted"
                            style={{
                              fontSize: 11,
                              marginTop: 3,
                            }}
                          >
                            {exam.duration_minutes} min
                          </div>
                        )}
                      </td>

                      <td>
                        <strong>
                          {exam.maximum_marks}
                        </strong>

                        <div className="muted">
                          Pass:{" "}
                          {exam.passing_marks}
                        </div>
                      </td>

                      <td>
                        <span
                          className={`status-badge ${statusClass(
                            exam.status
                          )}`}
                        >
                          {formatExamType(
                            exam.status
                          )}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            exam.is_published
                              ? "published-badge"
                              : "draft-badge"
                          }
                        >
                          {exam.is_published
                            ? "Published"
                            : "Draft"}
                        </span>
                      </td>

                      <td>
                        <div className="action-group">

                          <button
                            className="small-btn blue"
                            onClick={() =>
                              openEditModal(exam)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className={`small-btn ${
                              exam.is_published
                                ? ""
                                : "green"
                            }`}
                            onClick={() =>
                              togglePublish(exam)
                            }
                          >
                            {exam.is_published
                              ? "Unpublish"
                              : "Publish"}
                          </button>

                          {exam.status !==
                            "COMPLETED" &&
                            exam.status !==
                              "CANCELLED" && (
                              <select
                                value={exam.status}
                                onChange={(event) =>
                                  updateStatus(
                                    exam,
                                    event.target
                                      .value
                                  )
                                }
                                style={{
                                  width: 120,
                                  padding: "6px 7px",
                                  fontSize: 11,
                                }}
                              >
                                {STATUS_OPTIONS.map(
                                  (status) => (
                                    <option
                                      key={status}
                                      value={status}
                                    >
                                      {formatExamType(
                                        status
                                      )}
                                    </option>
                                  )
                                )}
                              </select>
                            )}

                          <button
                            className="small-btn red"
                            onClick={() =>
                              deleteExam(exam)
                            }
                          >
                            Delete
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            )}

          </div>

          {/* ===================================================
              PAGINATION
          ==================================================== */}

          {totalPages > 0 && (
            <div className="pagination">

              <div className="page-info">
                Page {page} of{" "}
                {totalPages} • {total} total
              </div>

              <div className="pagination-actions">

                <button
                  className="secondary-btn"
                  disabled={page <= 1}
                  onClick={() =>
                    setPage(
                      (current) =>
                        Math.max(
                          1,
                          current - 1
                        )
                    )
                  }
                >
                  ← Previous
                </button>

                <button
                  className="secondary-btn"
                  disabled={
                    page >= totalPages
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        Math.min(
                          totalPages,
                          current + 1
                        )
                    )
                  }
                >
                  Next →
                </button>

              </div>
            </div>
          )}

        </div>

      </div>

      {/* =======================================================
          CREATE / EDIT MODAL
      ======================================================== */}

      {showModal && (
        <div className="modal-overlay">

          <div className="modal">

            <div className="modal-header">

              <h2>
                {editingExam
                  ? "Edit Examination"
                  : "Create New Examination"}
              </h2>

              <button
                className="close-btn"
                onClick={closeModal}
              >
                ×
              </button>

            </div>

            <form
              onSubmit={saveExam}
            >

              <div className="modal-body">

                {/* BASIC INFORMATION */}

                <div className="form-section">

                  <div className="form-section-title">
                    Basic Information
                  </div>

                  <div className="form-grid">

                    <div className="field">
                      <label>
                        Examination Name *
                      </label>

                      <input
                        value={form.exam_name}
                        onChange={(event) =>
                          updateField(
                            "exam_name",
                            event.target.value
                          )
                        }
                        placeholder="e.g. Mid Term Examination"
                        required
                      />
                    </div>

                    <div className="field">
                      <label>
                        Exam Type *
                      </label>

                      <select
                        value={form.exam_type}
                        onChange={(event) =>
                          updateField(
                            "exam_type",
                            event.target.value
                          )
                        }
                      >
                        {EXAM_TYPES.map(
                          (type) => (
                            <option
                              key={type}
                              value={type}
                            >
                              {formatExamType(
                                type
                              )}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div className="field">
                      <label>
                        Academic Year *
                      </label>

                      <input
                        value={
                          form.academic_year
                        }
                        onChange={(event) =>
                          updateField(
                            "academic_year",
                            event.target.value
                          )
                        }
                        placeholder="2026-27"
                        required
                      />
                    </div>

                    <div className="field">
                      <label>Term</label>

                      <input
                        value={form.term}
                        onChange={(event) =>
                          updateField(
                            "term",
                            event.target.value
                          )
                        }
                        placeholder="Term 1"
                      />
                    </div>

                    <div className="field">
                      <label>
                        Class *
                      </label>

                      <input
                        value={
                          form.class_name
                        }
                        onChange={(event) =>
                          updateField(
                            "class_name",
                            event.target.value
                          )
                        }
                        placeholder="e.g. 8"
                        required
                      />
                    </div>

                    <div className="field">
                      <label>
                        Section
                      </label>

                      <input
                        value={form.section}
                        onChange={(event) =>
                          updateField(
                            "section",
                            event.target.value
                          )
                        }
                        placeholder="e.g. A"
                      />
                    </div>

                  </div>

                </div>

                {/* SUBJECT */}

                <div className="form-section">

                  <div className="form-section-title">
                    Subject
                  </div>

                  <div className="form-grid">

                    <div className="field">
                      <label>
                        Subject Name *
                      </label>

                      <input
                        value={
                          form.subject_name
                        }
                        onChange={(event) =>
                          updateField(
                            "subject_name",
                            event.target.value
                          )
                        }
                        placeholder="e.g. Mathematics"
                        required
                      />
                    </div>

                    <div className="field">
                      <label>
                        Subject Code
                      </label>

                      <input
                        value={
                          form.subject_code
                        }
                        onChange={(event) =>
                          updateField(
                            "subject_code",
                            event.target.value
                          )
                        }
                        placeholder="e.g. MATH-08"
                      />
                    </div>

                  </div>

                </div>

                {/* SCHEDULE */}

                <div className="form-section">

                  <div className="form-section-title">
                    Examination Schedule
                  </div>

                  <div className="form-grid">

                    <div className="field">
                      <label>
                        Exam Date *
                      </label>

                      <input
                        type="date"
                        value={
                          form.exam_date
                        }
                        onChange={(event) =>
                          updateField(
                            "exam_date",
                            event.target.value
                          )
                        }
                        required
                      />
                    </div>

                    <div className="field">
                      <label>
                        Start Time
                      </label>

                      <input
                        type="time"
                        value={
                          form.start_time
                        }
                        onChange={(event) =>
                          updateField(
                            "start_time",
                            event.target.value
                          )
                        }
                      />
                    </div>

                    <div className="field">
                      <label>
                        End Time
                      </label>

                      <input
                        type="time"
                        value={
                          form.end_time
                        }
                        onChange={(event) =>
                          updateField(
                            "end_time",
                            event.target.value
                          )
                        }
                      />
                    </div>

                    <div className="field">
                      <label>
                        Duration (Minutes)
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={
                          form.duration_minutes
                        }
                        onChange={(event) =>
                          updateField(
                            "duration_minutes",
                            event.target.value
                          )
                        }
                      />
                    </div>

                    <div className="field">
                      <label>
                        Room Number
                      </label>

                      <input
                        value={
                          form.room_number
                        }
                        onChange={(event) =>
                          updateField(
                            "room_number",
                            event.target.value
                          )
                        }
                        placeholder="e.g. Room 204"
                      />
                    </div>

                    <div className="field">
                      <label>
                        Status
                      </label>

                      <select
                        value={form.status}
                        onChange={(event) =>
                          updateField(
                            "status",
                            event.target.value
                          )
                        }
                      >
                        {STATUS_OPTIONS.map(
                          (status) => (
                            <option
                              key={status}
                              value={status}
                            >
                              {formatExamType(
                                status
                              )}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                  </div>

                </div>

                {/* MARKS */}

                <div className="form-section">

                  <div className="form-section-title">
                    Marks Configuration
                  </div>

                  <div className="form-grid two">

                    <div className="field">
                      <label>
                        Maximum Marks *
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          form.maximum_marks
                        }
                        onChange={(event) =>
                          updateField(
                            "maximum_marks",
                            event.target.value
                          )
                        }
                        required
                      />
                    </div>

                    <div className="field">
                      <label>
                        Passing Marks *
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          form.passing_marks
                        }
                        onChange={(event) =>
                          updateField(
                            "passing_marks",
                            event.target.value
                          )
                        }
                        required
                      />
                    </div>

                  </div>

                </div>

                {/* NOTES */}

                <div className="form-section">

                  <div className="form-section-title">
                    Instructions & Notes
                  </div>

                  <div className="form-grid one">

                    <div className="field">
                      <label>
                        Instructions
                      </label>

                      <textarea
                        value={
                          form.instructions
                        }
                        onChange={(event) =>
                          updateField(
                            "instructions",
                            event.target.value
                          )
                        }
                        placeholder="Enter examination instructions..."
                      />
                    </div>

                    <div className="field">
                      <label>
                        Remarks
                      </label>

                      <textarea
                        value={form.remarks}
                        onChange={(event) =>
                          updateField(
                            "remarks",
                            event.target.value
                          )
                        }
                        placeholder="Additional remarks..."
                      />
                    </div>

                  </div>

                </div>

                {/* PUBLISH */}

                <div className="checkbox-field">

                  <input
                    id="isPublished"
                    type="checkbox"
                    checked={
                      form.is_published
                    }
                    onChange={(event) =>
                      updateField(
                        "is_published",
                        event.target.checked
                      )
                    }
                  />

                  <label htmlFor="isPublished">
                    Publish this examination
                    immediately
                  </label>

                </div>

              </div>

              <div className="modal-footer">

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingExam
                    ? "Update Examination"
                    : "Create Examination"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Exams;