import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, getAuthToken } from "../api/config";
import AppLayout from "../components/AppLayout";
import {
  Users,
  UserCheck,
  Building,
  UserX,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
  Briefcase,
} from "lucide-react";

export default function Staff() {
  const navigate = useNavigate();

  const [staff, setStaff] = useState([]);
  const [summary, setSummary] = useState({
    total_staff: 0,
    active_staff: 0,
    inactive_staff: 0,
    other_status_staff: 0,
    total_departments: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const getToken = () => {
    return getAuthToken();
  };

  const getHeaders = () => {
    const token = getToken();
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const loadStaff = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: String(page),
        page_size: String(pageSize),
      });

      if (search.trim()) params.append("search", search.trim());
      if (department.trim()) params.append("department", department.trim());
      if (status) params.append("status", status);

      const response = await fetch(`${API_BASE_URL}/staff?${params.toString()}`, {
        headers: getHeaders(),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || "Unable to fetch staff list.");
      }

      setStaff(data.items || []);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load staff.");
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/staff/summary/overview`, {
        headers: getHeaders(),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setSummary({
          total_staff: data.total_staff || 0,
          active_staff: data.active_staff || 0,
          inactive_staff: data.inactive_staff || 0,
          other_status_staff: data.other_status_staff || 0,
          total_departments: data.total_departments || 0,
        });
      }
    } catch (err) {
      console.error("Summary error:", err);
    }
  };

  useEffect(() => {
    loadStaff();
  }, [page, department, status]);

  useEffect(() => {
    loadSummary();
  }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const triggerSearch = (e) => {
    e.preventDefault();
    loadStaff();
  };

  const clearFilters = () => {
    setSearch("");
    setDepartment("");
    setStatus("");
    setPage(1);
  };

  const getFullName = (p) => `${p.first_name || ""} ${p.last_name || ""}`.trim();
  const getInitials = (p) =>
    `${p.first_name?.charAt(0) || ""}${p.last_name?.charAt(0) || ""}`.toUpperCase() || "ST";

  return (
    <AppLayout
      title="Staff & Human Capital"
      subtitle="Institutional faculty directory, contracts, performance & records"
    >
      <div className="staff-page-wrap">
        {/* Top Action & KPI */}
        <div className="staff-header-row">
          <div className="stats-cards-strip">
            <SummaryPill
              icon={Users}
              label="Total Faculty"
              value={summary.total_staff}
              color="#6366f1"
            />
            <SummaryPill
              icon={UserCheck}
              label="Active Staff"
              value={summary.active_staff}
              color="#10b981"
            />
            <SummaryPill
              icon={UserX}
              label="Inactive/Leave"
              value={summary.inactive_staff}
              color="#f59e0b"
            />
            <SummaryPill
              icon={Building}
              label="Departments"
              value={summary.total_departments}
              color="#06b6d4"
            />
          </div>

          <button
            onClick={() => navigate("/staff/new")}
            className="create-staff-btn"
          >
            <Plus size={16} />
            <span>Onboard Staff</span>
          </button>
        </div>

        {/* Filter Control Bar */}
        <form onSubmit={triggerSearch} className="dark-filter-bar">
          <div className="search-field">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, ID, or email..."
              value={search}
              onChange={handleSearch}
              className="filter-input"
            />
          </div>

          <div className="dept-field">
            <Briefcase size={15} className="dept-icon" />
            <input
              type="text"
              placeholder="Department"
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setPage(1);
              }}
              className="filter-input"
            />
          </div>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <button
            type="button"
            onClick={clearFilters}
            className="filter-clear-btn"
          >
            Clear
          </button>
        </form>

        {error && <div className="staff-error-banner">{error}</div>}

        {/* Main Staff Table Card */}
        <div className="staff-table-card">
          <div className="table-header-row">
            <div>
              <h3 className="table-title">Staff Members Roster</h3>
              <p className="table-sub">Showing authenticated employee credentials</p>
            </div>
            <span className="roster-count-badge">
              Page {page} of {totalPages}
            </span>
          </div>

          {loading ? (
            <div className="table-loader-wrap">
              <div className="spinner"></div>
              <span>Synchronizing faculty records...</span>
            </div>
          ) : staff.length === 0 ? (
            <div className="table-empty-wrap">
              <Users size={36} className="empty-icon" />
              <h4>No staff members match the specified criteria</h4>
              <p>Try resetting filters or adding a new staff account.</p>
            </div>
          ) : (
            <div className="table-scroll-container">
              <table className="dark-roster-table">
                <thead>
                  <tr>
                    <th>Staff Member</th>
                    <th>Staff ID</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="person-identity">
                          <div className="person-avatar">{getInitials(p)}</div>
                          <div>
                            <div className="person-fullname">{getFullName(p)}</div>
                            <div className="person-email">{p.email || "No email"}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="staff-id-pill">{p.staff_id || "—"}</span>
                      </td>
                      <td>
                        <span className="dept-tag">{p.department || "General"}</span>
                      </td>
                      <td className="designation-text">{p.designation || "Staff"}</td>
                      <td className="phone-text">{p.phone || "—"}</td>
                      <td>
                        <span
                          className={`badge ${
                            p.status === "ACTIVE"
                              ? "badge-success"
                              : "badge-warning"
                          }`}
                        >
                          {p.status || "ACTIVE"}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons-cell">
                          <button
                            onClick={() => navigate(`/staff/${p.id}`)}
                            className="row-btn view-btn"
                            title="View Dossier"
                          >
                            <Eye size={14} />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => navigate(`/staff/${p.id}/edit`)}
                            className="row-btn edit-btn"
                            title="Edit Record"
                          >
                            <Edit size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="table-pagination">
            <span className="pagination-info">
              Showing page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </span>

            <div className="pagination-controls">
              <button
                disabled={page <= 1}
                onClick={() => setPage((c) => c - 1)}
                className="pag-btn"
              >
                <ChevronLeft size={16} />
                <span>Prev</span>
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((c) => c + 1)}
                className="pag-btn"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .staff-page-wrap {
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .staff-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .stats-cards-strip {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 14px;
          flex: 1;
        }

        .summary-pill {
          background: #111726;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
        }

        .summary-pill-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .summary-pill-label {
          font-size: 11px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .summary-pill-val {
          font-family: 'Outfit', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #ffffff;
          margin: 2px 0 0;
        }

        .create-staff-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 22px;
          background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(99, 102, 241, 0.35);
          transition: all 0.2s;
        }

        .create-staff-btn:hover {
          transform: translateY(-1px);
          filter: brightness(1.1);
          box-shadow: 0 6px 22px rgba(99, 102, 241, 0.5);
        }

        .dark-filter-bar {
          display: grid;
          grid-template-columns: 1.8fr 1fr 160px auto;
          gap: 12px;
          align-items: center;
          background: #111726;
          padding: 14px 18px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .search-field, .dept-field {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon, .dept-icon {
          position: absolute;
          left: 12px;
          color: #64748b;
          pointer-events: none;
        }

        .filter-input {
          width: 100%;
          padding: 10px 14px 10px 38px !important;
          background: #0b0f19 !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 10px !important;
          color: #ffffff !important;
          font-size: 13px !important;
        }

        .filter-select {
          padding: 10px 14px !important;
          background: #0b0f19 !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 10px !important;
          color: #cbd5e1 !important;
          font-size: 13px !important;
        }

        .filter-clear-btn {
          padding: 10px 16px;
          background: #1a243a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-clear-btn:hover {
          color: #ffffff;
          background: #222e49;
        }

        .staff-error-banner {
          background: rgba(244, 63, 94, 0.15);
          border: 1px solid rgba(244, 63, 94, 0.3);
          color: #fb7185;
          padding: 12px 18px;
          border-radius: 10px;
          font-size: 13px;
        }

        .staff-table-card {
          background: #111726;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
        }

        .table-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .table-title {
          font-family: 'Outfit', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
        }

        .table-sub {
          font-size: 12.5px;
          color: #64748b;
          margin: 3px 0 0;
        }

        .roster-count-badge {
          font-size: 11.5px;
          color: #818cf8;
          background: rgba(99, 102, 241, 0.12);
          border: 1px solid rgba(99, 102, 241, 0.25);
          padding: 4px 10px;
          border-radius: 6px;
          font-weight: 600;
        }

        .table-scroll-container {
          overflow-x: auto;
        }

        .dark-roster-table {
          width: 100%;
          border-collapse: collapse;
        }

        .person-identity {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .person-avatar {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
          color: #ffffff;
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .person-fullname {
          font-weight: 600;
          color: #f8fafc;
          font-size: 13.5px;
        }

        .person-email {
          font-size: 11.5px;
          color: #64748b;
        }

        .staff-id-pill {
          font-family: var(--font-mono);
          font-size: 12px;
          color: #94a3b8;
          background: rgba(255, 255, 255, 0.04);
          padding: 3px 8px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .dept-tag {
          font-size: 12px;
          color: #cbd5e1;
          background: #172033;
          border: 1px solid rgba(255, 255, 255, 0.07);
          padding: 3px 8px;
          border-radius: 6px;
        }

        .designation-text {
          font-size: 13px;
          color: #94a3b8;
        }

        .phone-text {
          font-size: 12.5px;
          color: #64748b;
        }

        .action-buttons-cell {
          display: flex;
          justify-content: flex-end;
          gap: 6px;
        }

        .row-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .view-btn {
          background: rgba(99, 102, 241, 0.12);
          border: 1px solid rgba(99, 102, 241, 0.25);
          color: #a5b4fc;
        }

        .view-btn:hover {
          background: rgba(99, 102, 241, 0.24);
          color: #ffffff;
        }

        .edit-btn {
          background: #172033;
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #94a3b8;
        }

        .edit-btn:hover {
          background: #1f2b45;
          color: #ffffff;
        }

        .table-pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          background: #0c101a;
        }

        .pagination-info {
          font-size: 12.5px;
          color: #64748b;
        }

        .pagination-info strong {
          color: #cbd5e1;
        }

        .pagination-controls {
          display: flex;
          gap: 8px;
        }

        .pag-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          background: #172033;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          color: #cbd5e1;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pag-btn:hover:not(:disabled) {
          background: #1f2b45;
          color: #ffffff;
        }

        .pag-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .table-loader-wrap, .table-empty-wrap {
          padding: 60px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: #64748b;
        }

        .empty-icon {
          color: #334155;
        }

        @media (max-width: 850px) {
          .dark-filter-bar {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </AppLayout>
  );
}

function SummaryPill({ icon: Icon, label, value, color }) {
  return (
    <div className="summary-pill">
      <div
        className="summary-pill-icon"
        style={{
          background: `${color}18`,
          color: color,
        }}
      >
        <Icon size={18} />
      </div>
      <div>
        <div className="summary-pill-label">{label}</div>
        <div className="summary-pill-val">{value}</div>
      </div>
    </div>
  );
}