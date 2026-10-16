import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import AppLayout from "../components/AppLayout";
import {
  Plus, Search, RefreshCw, Filter, ChevronLeft, ChevronRight,
  Eye, Edit2, Archive, RotateCcw, Users, ClipboardList, CheckCircle2,
  AlertCircle, Clock, XCircle,
} from "lucide-react";

const STATUS_OPTIONS = [
  "APPLIED",
  "UNDER_REVIEW",
  "SHORTLISTED",
  "WAITLISTED",
  "APPROVED",
  "REJECTED",
  "ENROLLED",
  "WITHDRAWN",
];

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

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

function getStatusStyle(status) {
  switch (status) {
    case "APPROVED":
      return { bg: "rgba(16,185,129,0.15)", color: "#34d399", border: "rgba(16,185,129,0.3)" };
    case "ENROLLED":
      return { bg: "rgba(6,182,212,0.15)", color: "#22d3ee", border: "rgba(6,182,212,0.3)" };
    case "REJECTED":
      return { bg: "rgba(244,63,94,0.15)", color: "#fb7185", border: "rgba(244,63,94,0.3)" };
    case "WITHDRAWN":
      return { bg: "rgba(100,116,139,0.15)", color: "#94a3b8", border: "rgba(100,116,139,0.3)" };
    case "SHORTLISTED":
      return { bg: "rgba(168,85,247,0.15)", color: "#c084fc", border: "rgba(168,85,247,0.3)" };
    case "WAITLISTED":
      return { bg: "rgba(245,158,11,0.15)", color: "#fbbf24", border: "rgba(245,158,11,0.3)" };
    case "UNDER_REVIEW":
      return { bg: "rgba(251,146,60,0.15)", color: "#fb923c", border: "rgba(251,146,60,0.3)" };
    default:
      return { bg: "rgba(99,102,241,0.15)", color: "#818cf8", border: "rgba(99,102,241,0.3)" };
  }
}

function getStatusIcon(status) {
  switch (status) {
    case "APPROVED": case "ENROLLED": return <CheckCircle2 size={12} />;
    case "REJECTED": case "WITHDRAWN": return <XCircle size={12} />;
    case "UNDER_REVIEW": case "WAITLISTED": return <Clock size={12} />;
    default: return <AlertCircle size={12} />;
  }
}

function displayStatus(status) {
  return status?.replaceAll("_", " ") || "—";
}

function Admissions() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [applyingClass, setApplyingClass] = useState("");
  const [activeFilter, setActiveFilter] = useState("true");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  async function loadAdmissions(customPage = page) {
    setLoading(true);
    setError("");

    try {
      const params = { page: customPage, page_size: pageSize };
      if (search.trim()) params.search = search.trim();
      if (status) params.status = status;
      if (academicYear.trim()) params.academic_year = academicYear.trim();
      if (applyingClass.trim()) params.applying_class = applyingClass.trim();
      if (activeFilter === "true") params.is_active = true;
      if (activeFilter === "false") params.is_active = false;

      const response = await api.get("/admissions", { params });
      const data = response.data;
      setItems(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 1);
      setPage(data.page || customPage);
      setPageSize(data.page_size || pageSize);
    } catch (err) {
      console.error("Admissions load error:", err);
      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else if (err.response?.status === 403) {
        setError("You do not have permission to view Admissions.");
      } else {
        setError(err.response?.data?.detail || "Unable to load admissions. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdmissions(page);
  }, [page, pageSize, status, activeFilter]);

  function handleSearch(event) {
    event.preventDefault();
    setPage(1);
    loadAdmissions(1);
  }

  function handleReset() {
    setSearch("");
    setStatus("");
    setAcademicYear("");
    setApplyingClass("");
    setActiveFilter("true");
    setPage(1);
  }

  async function updateStatus(id, nextStatus) {
    setActionId(id);
    setError("");
    try {
      await api.patch(`/admissions/${id}/status`, { status: nextStatus });
      await loadAdmissions(page);
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to update admission status.");
    } finally {
      setActionId(null);
    }
  }

  async function archiveAdmission(id) {
    if (!window.confirm("Archive this admission application? It can be restored later.")) return;
    setActionId(id);
    setError("");
    try {
      await api.delete(`/admissions/${id}`);
      await loadAdmissions(page);
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to archive admission application.");
    } finally {
      setActionId(null);
    }
  }

  async function restoreAdmission(id) {
    if (!window.confirm("Restore this archived admission application?")) return;
    setActionId(id);
    setError("");
    try {
      await api.patch(`/admissions/${id}/restore`);
      await loadAdmissions(page);
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to restore admission application.");
    } finally {
      setActionId(null);
    }
  }

  const firstItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, total);

  const approvedCount = items.filter(i => i.status === "APPROVED" || i.status === "ENROLLED").length;
  const pendingCount = items.filter(i => ["APPLIED", "UNDER_REVIEW", "SHORTLISTED", "WAITLISTED"].includes(i.status)).length;
  const rejectedCount = items.filter(i => i.status === "REJECTED" || i.status === "WITHDRAWN").length;

  return (
    <AppLayout
      title="Admissions Management"
      subtitle="Nepal School Enrolment — Application Review & Workflow Processing"
    >
      <div className="adm-page-wrap">

        {/* ── Header Row ── */}
        <div className="adm-header-row">
          <div className="adm-header-left">
            <div className="adm-header-icon-box">
              <Users size={20} color="#fff" />
            </div>
            <div>
              <h2 className="adm-page-title">Admissions Portal</h2>
              <p className="adm-page-sub">Academic Year 2081–82 B.S. · NEB / CDC Curriculum Schools</p>
            </div>
          </div>
          <div className="adm-header-actions">
            <button
              type="button"
              className="adm-btn-filter"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={14} />
              <span>Filters</span>
            </button>
            <button
              type="button"
              className="adm-btn-refresh"
              onClick={() => loadAdmissions(page)}
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? "adm-spin" : ""} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              className="adm-btn-new"
              onClick={() => navigate("/admissions/new")}
            >
              <Plus size={16} />
              <span>New Application</span>
            </button>
          </div>
        </div>

        {/* ── KPI Stats ── */}
        <div className="adm-stats-row">
          {[
            { label: "Total Applications", value: total, color: "#6366f1", bg: "rgba(99,102,241,0.12)", border: "rgba(99,102,241,0.25)", icon: <ClipboardList size={18} /> },
            { label: "Active / Approved", value: approvedCount, color: "#10b981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)", icon: <CheckCircle2 size={18} /> },
            { label: "Pending Review", value: pendingCount, color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)", icon: <Clock size={18} /> },
            { label: "Rejected / Withdrawn", value: rejectedCount, color: "#f43f5e", bg: "rgba(244,63,94,0.12)", border: "rgba(244,63,94,0.25)", icon: <XCircle size={18} /> },
          ].map((stat) => (
            <div key={stat.label} className="adm-stat-card" style={{ borderColor: stat.border }}>
              <div className="adm-stat-icon" style={{ background: stat.bg, color: stat.color }}>
                {stat.icon}
              </div>
              <div>
                <div className="adm-stat-value" style={{ color: stat.color }}>{stat.value}</div>
                <div className="adm-stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filters Panel ── */}
        {showFilters && (
          <div className="adm-filters-card">
            <form onSubmit={handleSearch} className="adm-filters-form">
              <div className="adm-filter-field adm-field-wide">
                <label className="adm-filter-label">Search</label>
                <div className="adm-search-wrap">
                  <Search size={14} className="adm-search-icon" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Application no., name, phone number..."
                    className="adm-filter-input adm-search-input"
                  />
                </div>
              </div>

              <div className="adm-filter-field">
                <label className="adm-filter-label">Status</label>
                <select
                  value={status}
                  onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                  className="adm-filter-input"
                >
                  <option value="">All Statuses</option>
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{displayStatus(opt)}</option>
                  ))}
                </select>
              </div>

              <div className="adm-filter-field">
                <label className="adm-filter-label">Academic Year</label>
                <input
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="2081-82"
                  className="adm-filter-input"
                />
              </div>

              <div className="adm-filter-field">
                <label className="adm-filter-label">Applying Class</label>
                <input
                  value={applyingClass}
                  onChange={(e) => setApplyingClass(e.target.value)}
                  placeholder="Class 8, 9, 10..."
                  className="adm-filter-input"
                />
              </div>

              <div className="adm-filter-field">
                <label className="adm-filter-label">Records</label>
                <select
                  value={activeFilter}
                  onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }}
                  className="adm-filter-input"
                >
                  <option value="true">Active Records</option>
                  <option value="false">Archived</option>
                  <option value="all">All Records</option>
                </select>
              </div>

              <div className="adm-filter-btns">
                <button type="submit" className="btn-primary" style={{ fontSize: 13, padding: "9px 18px" }}>
                  <Search size={13} /> Search
                </button>
                <button type="button" className="btn-secondary" style={{ fontSize: 13, padding: "9px 14px" }} onClick={handleReset}>
                  Reset
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Error Banner ── */}
        {error && (
          <div className="adm-error-bar">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* ── Table ── */}
        <div className="adm-table-card">
          <div className="adm-table-scroll">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Application</th>
                  <th>Applicant</th>
                  <th>Class</th>
                  <th>Parent / Guardian</th>
                  <th>Applied On</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="adm-table-empty">
                      <RefreshCw size={20} className="adm-spin" style={{ color: "#6366f1" }} />
                      <span>Loading admissions...</span>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="adm-table-empty">
                      <ClipboardList size={28} style={{ color: "#475569", marginBottom: 8 }} />
                      <span>No admission applications found.</span>
                      <span style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
                        Try adjusting your filters or add a new application.
                      </span>
                    </td>
                  </tr>
                ) : (
                  items.map((admission) => {
                    const sStyle = getStatusStyle(admission.status);
                    const isProcessing = actionId === admission.id;
                    return (
                      <tr key={admission.id} className={isProcessing ? "adm-row-processing" : ""}>
                        {/* APPLICATION */}
                        <td>
                          <div className="adm-app-number">{admission.application_number || "—"}</div>
                          <div className="adm-app-year">{admission.academic_year || ""}</div>
                        </td>

                        {/* APPLICANT */}
                        <td>
                          <div className="adm-applicant-name">
                            {[admission.first_name, admission.last_name].filter(Boolean).join(" ") || "—"}
                          </div>
                          {admission.gender && (
                            <div className="adm-cell-sub">{admission.gender}</div>
                          )}
                        </td>

                        {/* CLASS */}
                        <td>
                          <div className="adm-cell-primary">{admission.applying_class || "—"}</div>
                          {admission.applying_section && (
                            <div className="adm-cell-sub">Section {admission.applying_section}</div>
                          )}
                        </td>

                        {/* PARENT */}
                        <td>
                          <div className="adm-cell-primary">{admission.parent_name || "—"}</div>
                          <div className="adm-cell-sub">{admission.parent_phone || ""}</div>
                        </td>

                        {/* DATE */}
                        <td>
                          <div className="adm-cell-primary">{formatDate(admission.application_date)}</div>
                        </td>

                        {/* STATUS */}
                        <td>
                          <select
                            value={admission.status}
                            disabled={isProcessing}
                            onChange={(e) => updateStatus(admission.id, e.target.value)}
                            className="adm-status-select"
                            style={{
                              background: sStyle.bg,
                              color: sStyle.color,
                              border: `1px solid ${sStyle.border}`,
                            }}
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{displayStatus(opt)}</option>
                            ))}
                          </select>
                        </td>

                        {/* ACTIONS */}
                        <td>
                          <div className="adm-actions-row">
                            <button
                              type="button"
                              className="adm-action-btn adm-btn-view"
                              onClick={() => navigate(`/admissions/${admission.id}`)}
                              title="View Details"
                            >
                              <Eye size={13} />
                              <span>View</span>
                            </button>
                            <button
                              type="button"
                              className="adm-action-btn adm-btn-edit"
                              onClick={() => navigate(`/admissions/${admission.id}/edit`)}
                              title="Edit Application"
                            >
                              <Edit2 size={13} />
                              <span>Edit</span>
                            </button>
                            {admission.is_active ? (
                              <button
                                type="button"
                                disabled={isProcessing}
                                className="adm-action-btn adm-btn-archive"
                                onClick={() => archiveAdmission(admission.id)}
                                title="Archive Application"
                              >
                                <Archive size={13} />
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={isProcessing}
                                className="adm-action-btn adm-btn-restore"
                                onClick={() => restoreAdmission(admission.id)}
                                title="Restore Application"
                              >
                                <RotateCcw size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          <div className="adm-pagination-bar">
            <div className="adm-page-info">
              {total > 0 ? (
                <span>Showing <strong>{firstItem}–{lastItem}</strong> of <strong>{total}</strong> applications</span>
              ) : (
                <span>No records found</span>
              )}
              <div className="adm-rows-select">
                <span>Rows:</span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                  className="adm-page-size-select"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="adm-page-controls">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => p - 1)}
                className="adm-page-btn"
              >
                <ChevronLeft size={15} /> Previous
              </button>
              <span className="adm-page-counter">Page {page} of {totalPages}</span>
              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
                className="adm-page-btn"
              >
                Next <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Scoped Styles ── */}
      <style>{`
        .adm-page-wrap {
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Header */
        .adm-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .adm-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .adm-header-icon-box {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(99,102,241,0.35);
          flex-shrink: 0;
        }

        .adm-page-title {
          margin: 0;
          font-family: 'Outfit', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #f8fafc;
        }

        .adm-page-sub {
          margin: 3px 0 0;
          font-size: 12.5px;
          color: #64748b;
        }

        .adm-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .adm-btn-filter, .adm-btn-refresh {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 14px;
          background: var(--bg-elevated);
          border: 1px solid var(--border-default);
          border-radius: 10px;
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .adm-btn-filter:hover, .adm-btn-refresh:hover {
          border-color: var(--border-medium);
          color: #fff;
        }

        .adm-btn-new {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 18px;
          background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
          border: none;
          border-radius: 10px;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(99,102,241,0.35);
          transition: all 0.2s;
        }

        .adm-btn-new:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(99,102,241,0.5);
        }

        .adm-spin {
          animation: admSpin 0.8s linear infinite;
        }

        @keyframes admSpin {
          to { transform: rotate(360deg); }
        }

        /* Stats */
        .adm-stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 14px;
        }

        .adm-stat-card {
          background: var(--bg-surface);
          border: 1px solid;
          border-radius: 14px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: transform 0.2s;
        }

        .adm-stat-card:hover {
          transform: translateY(-2px);
        }

        .adm-stat-icon {
          width: 42px;
          height: 42px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .adm-stat-value {
          font-family: 'Outfit', sans-serif;
          font-size: 26px;
          font-weight: 800;
          line-height: 1;
        }

        .adm-stat-label {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 3px;
          font-weight: 500;
        }

        /* Filters */
        .adm-filters-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-default);
          border-radius: 14px;
          padding: 20px 22px;
        }

        .adm-filters-form {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          align-items: flex-end;
        }

        .adm-filter-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 150px;
          flex: 1;
        }

        .adm-field-wide { flex: 2; min-width: 220px; }

        .adm-filter-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }

        .adm-filter-input {
          background: var(--bg-subtle) !important;
          border: 1px solid var(--border-default) !important;
          border-radius: 9px !important;
          color: var(--text-primary) !important;
          padding: 9px 12px;
          font-size: 13px;
          font-family: var(--font-sans);
          width: 100%;
        }

        .adm-filter-input:focus {
          outline: none;
          border-color: var(--accent-primary) !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.2) !important;
        }

        .adm-search-wrap {
          position: relative;
        }

        .adm-search-icon {
          position: absolute;
          left: 11px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }

        .adm-search-input {
          padding-left: 34px !important;
        }

        .adm-filter-btns {
          display: flex;
          gap: 8px;
          align-items: flex-end;
        }

        /* Error */
        .adm-error-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: rgba(244,63,94,0.1);
          border: 1px solid rgba(244,63,94,0.3);
          border-radius: 10px;
          color: #fb7185;
          font-size: 13.5px;
        }

        /* Table */
        .adm-table-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-default);
          border-radius: 16px;
          overflow: hidden;
        }

        .adm-table-scroll {
          overflow-x: auto;
        }

        .adm-table {
          width: 100%;
          min-width: 1100px;
          border-collapse: collapse;
        }

        .adm-table thead tr {
          background: var(--bg-subtle);
        }

        .adm-table th {
          background: transparent !important;
          color: var(--text-muted) !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.06em !important;
          padding: 14px 16px !important;
          border-bottom: 1px solid var(--border-subtle) !important;
          white-space: nowrap;
        }

        .adm-table td {
          padding: 14px 16px !important;
          border-bottom: 1px solid var(--border-subtle) !important;
          vertical-align: top;
        }

        .adm-table tbody tr {
          transition: background 0.15s;
        }

        .adm-table tbody tr:hover td {
          background: var(--bg-surface-hover) !important;
        }

        .adm-row-processing {
          opacity: 0.6;
          pointer-events: none;
        }

        .adm-table-empty {
          text-align: center !important;
          padding: 60px 20px !important;
          color: var(--text-muted) !important;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        /* Table cell styles */
        .adm-app-number {
          font-family: var(--font-mono);
          font-size: 12.5px;
          font-weight: 700;
          color: var(--accent-primary);
          letter-spacing: 0.02em;
        }

        .adm-app-year {
          font-size: 11.5px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .adm-applicant-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .adm-cell-primary {
          font-size: 13.5px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .adm-cell-sub {
          font-size: 11.5px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        /* Status select */
        .adm-status-select {
          border-radius: 20px !important;
          padding: 4px 10px !important;
          font-size: 11.5px !important;
          font-weight: 700 !important;
          cursor: pointer;
          appearance: auto;
        }

        /* Action buttons */
        .adm-actions-row {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .adm-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px;
          border-radius: 7px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid;
          transition: all 0.15s;
          white-space: nowrap;
        }

        .adm-action-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .adm-btn-view {
          background: rgba(99,102,241,0.1);
          border-color: rgba(99,102,241,0.3);
          color: #a5b4fc;
        }

        .adm-btn-view:hover {
          background: rgba(99,102,241,0.2);
        }

        .adm-btn-edit {
          background: rgba(6,182,212,0.1);
          border-color: rgba(6,182,212,0.3);
          color: #22d3ee;
        }

        .adm-btn-edit:hover {
          background: rgba(6,182,212,0.2);
        }

        .adm-btn-archive {
          background: rgba(244,63,94,0.1);
          border-color: rgba(244,63,94,0.3);
          color: #fb7185;
          padding: 5px 8px;
        }

        .adm-btn-archive:hover:not(:disabled) {
          background: rgba(244,63,94,0.2);
        }

        .adm-btn-restore {
          background: rgba(16,185,129,0.1);
          border-color: rgba(16,185,129,0.3);
          color: #34d399;
          padding: 5px 8px;
        }

        .adm-btn-restore:hover:not(:disabled) {
          background: rgba(16,185,129,0.2);
        }

        /* Pagination */
        .adm-pagination-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          border-top: 1px solid var(--border-subtle);
          flex-wrap: wrap;
          gap: 12px;
        }

        .adm-page-info {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .adm-page-info strong {
          color: var(--text-primary);
        }

        .adm-rows-select {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          color: var(--text-muted);
        }

        .adm-page-size-select {
          background: var(--bg-elevated) !important;
          border: 1px solid var(--border-default) !important;
          border-radius: 7px !important;
          color: var(--text-primary) !important;
          padding: 4px 8px !important;
          font-size: 12px !important;
        }

        .adm-page-controls {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .adm-page-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 7px 14px;
          background: var(--bg-elevated);
          border: 1px solid var(--border-default);
          border-radius: 8px;
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }

        .adm-page-btn:hover:not(:disabled) {
          border-color: var(--accent-primary);
          color: #fff;
        }

        .adm-page-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .adm-page-counter {
          font-size: 13px;
          color: var(--text-muted);
          min-width: 110px;
          text-align: center;
        }
      `}</style>
    </AppLayout>
  );
}

export default Admissions;