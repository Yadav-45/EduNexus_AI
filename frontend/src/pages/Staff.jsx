import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, getAuthToken } from "../api/config";

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
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };
  };

  const loadStaff = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (department) {
        params.append("department", department);
      }

      if (status) {
        params.append("status", status);
      }

      const response = await fetch(
        `${API_BASE_URL}/staff?${params.toString()}`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        throw new Error(
          data.detail || "Unable to load staff records."
        );
      }

      const data = await response.json();

      setStaff(data.items || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/staff/summary`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      setSummary({
        total_staff: data.total_staff || 0,
        active_staff: data.active_staff || 0,
        inactive_staff: data.inactive_staff || 0,
        other_status_staff: data.other_status_staff || 0,
        total_departments: data.total_departments || 0,
      });
    } catch (err) {
      console.error("Summary error:", err);
    }
  };

  useEffect(() => {
    loadStaff();
  }, [page, search, department, status]);

  useEffect(() => {
    loadSummary();
  }, []);

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleDepartmentChange = (event) => {
    setDepartment(event.target.value);
    setPage(1);
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setDepartment("");
    setStatus("");
    setPage(1);
  };

  const getFullName = (person) => {
    return `${person.first_name || ""} ${
      person.last_name || ""
    }`.trim();
  };

  const getInitials = (person) => {
    const first = person.first_name?.charAt(0) || "";
    const last = person.last_name?.charAt(0) || "";

    return `${first}${last}`.toUpperCase();
  };

  const getStatusClass = (staffStatus) => {
    switch ((staffStatus || "").toUpperCase()) {
      case "ACTIVE":
        return "status-active";

      case "INACTIVE":
        return "status-inactive";

      default:
        return "status-other";
    }
  };

  return (
    <div
      style={{
        padding: "30px",
        background: "#f7f8fc",
        minHeight: "100vh",
      }}
    >
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "30px",
              fontWeight: "700",
              color: "#172033",
            }}
          >
            Staff Management
          </h1>

          <p
            style={{
              marginTop: "7px",
              color: "#697386",
              fontSize: "14px",
            }}
          >
            Manage teachers, administrators and school staff
            from one place.
          </p>
        </div>

        <button
          onClick={() => navigate("/staff/new")}
          style={{
            border: "none",
            background: "#2563eb",
            color: "#ffffff",
            padding: "12px 20px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          + Add Staff
        </button>
      </div>

      {/* =====================================================
          SUMMARY CARDS
      ====================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          marginBottom: "25px",
        }}
      >
        <SummaryCard
          title="Total Staff"
          value={summary.total_staff}
          icon="👥"
        />

        <SummaryCard
          title="Active Staff"
          value={summary.active_staff}
          icon="✓"
        />

        <SummaryCard
          title="Inactive Staff"
          value={summary.inactive_staff}
          icon="○"
        />

        <SummaryCard
          title="Departments"
          value={summary.total_departments}
          icon="🏢"
        />
      </div>

      {/* =====================================================
          FILTER BAR
      ====================================================== */}

      <div
        style={{
          background: "#ffffff",
          padding: "18px",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(220px, 1fr) 180px 160px auto",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Search staff..."
            value={search}
            onChange={handleSearch}
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="Department"
            value={department}
            onChange={handleDepartmentChange}
            style={inputStyle}
          />

          <select
            value={status}
            onChange={handleStatusChange}
            style={inputStyle}
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          <button
            onClick={clearFilters}
            style={{
              padding: "10px 15px",
              borderRadius: "7px",
              border: "1px solid #d1d5db",
              background: "#ffffff",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div
          style={{
            background: "#fef2f2",
            color: "#b91c1c",
            padding: "14px 16px",
            borderRadius: "8px",
            border: "1px solid #fecaca",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {/* =====================================================
          STAFF TABLE
      ====================================================== */}

      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "18px 20px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "18px",
                color: "#172033",
              }}
            >
              Staff Directory
            </h2>

            <p
              style={{
                margin: "4px 0 0",
                color: "#6b7280",
                fontSize: "13px",
              }}
            >
              {summary.total_staff} staff members
            </p>
          </div>

          <button
            onClick={() => {
              loadStaff();
              loadSummary();
            }}
            style={{
              border: "1px solid #d1d5db",
              background: "#ffffff",
              padding: "8px 12px",
              borderRadius: "7px",
              cursor: "pointer",
            }}
          >
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <div
            style={{
              padding: "50px",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            Loading staff...
          </div>
        ) : staff.length === 0 ? (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "40px",
                marginBottom: "12px",
              }}
            >
              👥
            </div>

            <h3
              style={{
                margin: "0 0 6px",
                color: "#374151",
              }}
            >
              No staff found
            </h3>

            <p
              style={{
                margin: 0,
                color: "#6b7280",
              }}
            >
              Add your first staff member to get started.
            </p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "900px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f9fafb",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <th style={thStyle}>Staff</th>
                    <th style={thStyle}>Staff ID</th>
                    <th style={thStyle}>Department</th>
                    <th style={thStyle}>Designation</th>
                    <th style={thStyle}>Contact</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {staff.map((person) => (
                    <tr
                      key={person.id}
                      style={{
                        borderBottom:
                          "1px solid #f0f1f3",
                      }}
                    >
                      <td style={tdStyle}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "11px",
                          }}
                        >
                          <div
                            style={{
                              width: "38px",
                              height: "38px",
                              borderRadius: "50%",
                              background: "#e8eefc",
                              color: "#2563eb",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: "700",
                              fontSize: "13px",
                            }}
                          >
                            {getInitials(person)}
                          </div>

                          <div>
                            <div
                              style={{
                                fontWeight: "600",
                                color: "#172033",
                              }}
                            >
                              {getFullName(person)}
                            </div>

                            <div
                              style={{
                                color: "#6b7280",
                                fontSize: "12px",
                                marginTop: "2px",
                              }}
                            >
                              {person.email || "No email"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={tdStyle}>
                        <span
                          style={{
                            fontWeight: "600",
                            color: "#374151",
                          }}
                        >
                          {person.staff_id}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        {person.department || "—"}
                      </td>

                      <td style={tdStyle}>
                        {person.designation || "—"}
                      </td>

                      <td style={tdStyle}>
                        {person.phone || "—"}
                      </td>

                      <td style={tdStyle}>
                        <span
                          className={getStatusClass(
                            person.status
                          )}
                          style={{
                            display: "inline-block",
                            padding: "5px 9px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "600",
                            background:
                              person.status === "ACTIVE"
                                ? "#dcfce7"
                                : "#f3f4f6",
                            color:
                              person.status === "ACTIVE"
                                ? "#166534"
                                : "#4b5563",
                          }}
                        >
                          {person.status || "UNKNOWN"}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        <div
                          style={{
                            display: "flex",
                            gap: "7px",
                          }}
                        >
                          <button
                            onClick={() =>
                              navigate(
                                `/staff/${person.id}`
                              )
                            }
                            style={actionButtonStyle}
                          >
                            View
                          </button>

                          <button
                            onClick={() =>
                              navigate(
                                `/staff/${person.id}/edit`
                              )
                            }
                            style={actionButtonStyle}
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* =================================================
                PAGINATION
            ================================================== */}

            <div
              style={{
                padding: "15px 20px",
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  color: "#6b7280",
                  fontSize: "13px",
                }}
              >
                Page {page} of {totalPages}
              </span>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                }}
              >
                <button
                  disabled={page <= 1}
                  onClick={() =>
                    setPage((current) => current - 1)
                  }
                  style={{
                    ...paginationButtonStyle,
                    opacity: page <= 1 ? 0.5 : 1,
                  }}
                >
                  Previous
                </button>

                <button
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage((current) => current + 1)
                  }
                  style={{
                    ...paginationButtonStyle,
                    opacity:
                      page >= totalPages ? 0.5 : 1,
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


/* ============================================================
   COMPONENTS
============================================================ */

function SummaryCard({ title, value, icon }) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              color: "#6b7280",
              fontSize: "13px",
            }}
          >
            {title}
          </p>

          <h2
            style={{
              margin: "8px 0 0",
              fontSize: "26px",
              color: "#172033",
            }}
          >
            {value}
          </h2>
        </div>

        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "10px",
            background: "#eff6ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}


/* ============================================================
   STYLES
============================================================ */

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  borderRadius: "7px",
  border: "1px solid #d1d5db",
  outline: "none",
  fontSize: "14px",
  background: "#ffffff",
};

const thStyle = {
  textAlign: "left",
  padding: "13px 16px",
  fontSize: "12px",
  fontWeight: "700",
  color: "#6b7280",
  textTransform: "uppercase",
};

const tdStyle = {
  padding: "14px 16px",
  fontSize: "13px",
  color: "#374151",
};

const actionButtonStyle = {
  border: "1px solid #d1d5db",
  background: "#ffffff",
  padding: "6px 10px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "600",
};

const paginationButtonStyle = {
  border: "1px solid #d1d5db",
  background: "#ffffff",
  padding: "7px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "12px",
};