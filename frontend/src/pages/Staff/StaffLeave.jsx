import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

const today = new Date().toISOString().split("T")[0];

const initialForm = {
  staff_id: "",
  leave_type: "CASUAL",
  start_date: today,
  end_date: today,
  reason: "",
};

const leaveTypes = [
  "CASUAL",
  "SICK",
  "EARNED",
  "EMERGENCY",
  "OTHER",
];

const statusOptions = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
];

function StaffLeave() {
  const navigate = useNavigate();

  const [leaves, setLeaves] = useState([]);
  const [staff, setStaff] = useState([]);

  const [summary, setSummary] = useState({
    total_requests: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
    total_leave_days: 0,
  });

  const [loading, setLoading] = useState(true);
  const [staffLoading, setStaffLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(initialForm);

  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("token");

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // =====================================================
  // LOAD STAFF
  // =====================================================

  const loadStaff = async () => {
    try {
      setStaffLoading(true);

      const response = await fetch(
        `${API_BASE}/staff?page=1&page_size=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Could not load staff.");
      }

      const data = await response.json();

      setStaff(
        (data.items || []).filter(
          (item) =>
            String(item.status).toUpperCase() === "ACTIVE"
        )
      );
    } catch (error) {
      console.error(error);
    } finally {
      setStaffLoading(false);
    }
  };

  // =====================================================
  // LOAD LEAVES
  // =====================================================

  const loadLeaves = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      params.append("page", "1");
      params.append("page_size", "100");

      if (search.trim()) {
        params.append(
          "search",
          search.trim()
        );
      }

      if (statusFilter) {
        params.append(
          "status",
          statusFilter
        );
      }

      if (leaveTypeFilter) {
        params.append(
          "leave_type",
          leaveTypeFilter
        );
      }

      const response = await fetch(
        `${API_BASE}/staff-leaves?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Could not load leave records."
        );
      }

      const data = await response.json();

      setLeaves(data.items || []);
    } catch (error) {
      console.error(error);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD SUMMARY
  // =====================================================

  const loadSummary = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/staff-leaves/summary`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Could not load leave summary."
        );
      }

      const data = await response.json();

      setSummary(data);
    } catch (error) {
      console.error(error);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadStaff();
    loadLeaves();
    loadSummary();
  }, []);

  // =====================================================
  // SEARCH / FILTER
  // =====================================================

  const handleSearch = () => {
    loadLeaves();
  };

  const handleRefresh = () => {
    loadStaff();
    loadLeaves();
    loadSummary();
  };

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // CREATE LEAVE
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.staff_id) {
      alert("Please select a staff member.");
      return;
    }

    if (
      !form.start_date ||
      !form.end_date
    ) {
      alert(
        "Please select both start and end dates."
      );
      return;
    }

    if (
      new Date(form.end_date) <
      new Date(form.start_date)
    ) {
      alert(
        "End date cannot be earlier than start date."
      );
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_BASE}/staff-leaves`,
        {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({
            staff_id: Number(form.staff_id),
            leave_type: form.leave_type,
            start_date: form.start_date,
            end_date: form.end_date,
            reason: form.reason || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Could not create leave request."
        );
      }

      alert(
        "Staff leave request created successfully."
      );

      setShowModal(false);
      setForm(initialForm);

      await loadLeaves();
      await loadSummary();
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // APPROVE LEAVE
  // =====================================================

  const approveLeave = async (leaveId) => {
    const remarks =
      window.prompt(
        "Approval remarks (optional):"
      );

    if (remarks === null) {
      return;
    }

    try {
      const params = new URLSearchParams();

      if (remarks.trim()) {
        params.append(
          "approval_remarks",
          remarks.trim()
        );
      }

      const response = await fetch(
        `${API_BASE}/staff-leaves/${leaveId}/approve?${params.toString()}`,
        {
          method: "PATCH",
          headers: authHeaders,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Could not approve leave."
        );
      }

      alert("Leave approved successfully.");

      await loadLeaves();
      await loadSummary();
    } catch (error) {
      alert(error.message);
    }
  };

  // =====================================================
  // REJECT LEAVE
  // =====================================================

  const rejectLeave = async (leaveId) => {
    const remarks =
      window.prompt(
        "Reason for rejection:"
      );

    if (remarks === null) {
      return;
    }

    try {
      const params = new URLSearchParams();

      if (remarks.trim()) {
        params.append(
          "approval_remarks",
          remarks.trim()
        );
      }

      const response = await fetch(
        `${API_BASE}/staff-leaves/${leaveId}/reject?${params.toString()}`,
        {
          method: "PATCH",
          headers: authHeaders,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Could not reject leave."
        );
      }

      alert("Leave rejected.");

      await loadLeaves();
      await loadSummary();
    } catch (error) {
      alert(error.message);
    }
  };

  // =====================================================
  // CANCEL LEAVE
  // =====================================================

  const cancelLeave = async (leaveId) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to cancel this leave?"
      );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/staff-leaves/${leaveId}/cancel`,
        {
          method: "PATCH",
          headers: authHeaders,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Could not cancel leave."
        );
      }

      alert("Leave cancelled successfully.");

      await loadLeaves();
      await loadSummary();
    } catch (error) {
      alert(error.message);
    }
  };

  // =====================================================
  // DELETE LEAVE
  // =====================================================

  const deleteLeave = async (leaveId) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to permanently delete this leave request?"
      );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/staff-leaves/${leaveId}`,
        {
          method: "DELETE",
          headers: authHeaders,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Could not delete leave."
        );
      }

      alert("Leave deleted successfully.");

      await loadLeaves();
      await loadSummary();
    } catch (error) {
      alert(error.message);
    }
  };

  // =====================================================
  // HELPERS
  // =====================================================

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

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

  const getStatusStyle = (status) => {
    const styles = {
      PENDING: {
        background: "#fff7ed",
        color: "#c2410c",
      },

      APPROVED: {
        background: "#ecfdf5",
        color: "#047857",
      },

      REJECTED: {
        background: "#fef2f2",
        color: "#b91c1c",
      },

      CANCELLED: {
        background: "#f3f4f6",
        color: "#4b5563",
      },
    };

    return (
      styles[status] || {
        background: "#f3f4f6",
        color: "#374151",
      }
    );
  };

  const getTypeLabel = (type) => {
    if (!type) {
      return "-";
    }

    return type
      .replaceAll("_", " ")
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );
  };

  // =====================================================
  // STYLES
  // =====================================================

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#f8fafc",
      padding: "30px",
      fontFamily:
        "Inter, Arial, sans-serif",
    },

    container: {
      maxWidth: "1500px",
      margin: "0 auto",
    },

    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "25px",
      gap: "20px",
      flexWrap: "wrap",
    },

    title: {
      margin: 0,
      fontSize: "30px",
      color: "#111827",
    },

    subtitle: {
      marginTop: "7px",
      color: "#6b7280",
      fontSize: "14px",
    },

    buttonGroup: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
    },

    button: {
      border: "none",
      borderRadius: "8px",
      padding: "11px 16px",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "14px",
    },

    primaryButton: {
      background: "#2563eb",
      color: "#ffffff",
    },

    secondaryButton: {
      background: "#ffffff",
      color: "#374151",
      border: "1px solid #d1d5db",
    },

    summaryGrid: {
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit, minmax(170px, 1fr))",
      gap: "16px",
      marginBottom: "25px",
    },

    card: {
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      padding: "20px",
      boxShadow:
        "0 2px 8px rgba(15, 23, 42, 0.04)",
    },

    cardLabel: {
      color: "#6b7280",
      fontSize: "13px",
      marginBottom: "8px",
    },

    cardValue: {
      fontSize: "28px",
      fontWeight: "700",
      color: "#111827",
    },

    filters: {
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      padding: "18px",
      marginBottom: "20px",
      display: "flex",
      gap: "12px",
      flexWrap: "wrap",
    },

    input: {
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      padding: "10px 12px",
      fontSize: "14px",
      outline: "none",
      minWidth: "200px",
      background: "#ffffff",
    },

    tableContainer: {
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      overflowX: "auto",
    },

    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: "1150px",
    },

    th: {
      textAlign: "left",
      padding: "14px 16px",
      background: "#f8fafc",
      borderBottom:
        "1px solid #e5e7eb",
      color: "#475569",
      fontSize: "12px",
      textTransform: "uppercase",
      letterSpacing: "0.04em",
    },

    td: {
      padding: "15px 16px",
      borderBottom:
        "1px solid #f1f5f9",
      color: "#374151",
      fontSize: "14px",
      verticalAlign: "top",
    },

    status: {
      display: "inline-block",
      padding: "5px 9px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: "700",
    },

    actionGroup: {
      display: "flex",
      gap: "7px",
      flexWrap: "wrap",
    },

    smallButton: {
      border: "none",
      borderRadius: "6px",
      padding: "7px 10px",
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "600",
    },

    approve: {
      background: "#dcfce7",
      color: "#166534",
    },

    reject: {
      background: "#fee2e2",
      color: "#991b1b",
    },

    cancel: {
      background: "#f3f4f6",
      color: "#374151",
    },

    delete: {
      background: "#fee2e2",
      color: "#991b1b",
    },

    empty: {
      textAlign: "center",
      padding: "50px 20px",
      color: "#6b7280",
    },

    overlay: {
      position: "fixed",
      inset: 0,
      background:
        "rgba(15, 23, 42, 0.55)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      zIndex: 1000,
    },

    modal: {
      background: "#ffffff",
      borderRadius: "14px",
      width: "100%",
      maxWidth: "620px",
      maxHeight: "90vh",
      overflowY: "auto",
      padding: "25px",
      boxShadow:
        "0 20px 60px rgba(0,0,0,0.2)",
    },

    modalHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
    },

    modalTitle: {
      margin: 0,
      fontSize: "22px",
      color: "#111827",
    },

    closeButton: {
      border: "none",
      background: "#f3f4f6",
      borderRadius: "50%",
      width: "34px",
      height: "34px",
      cursor: "pointer",
      fontSize: "18px",
    },

    formGrid: {
      display: "grid",
      gridTemplateColumns:
        "repeat(2, 1fr)",
      gap: "16px",
    },

    formGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "7px",
    },

    fullWidth: {
      gridColumn: "1 / -1",
    },

    label: {
      fontSize: "13px",
      fontWeight: "600",
      color: "#374151",
    },

    textarea: {
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      padding: "10px 12px",
      minHeight: "100px",
      resize: "vertical",
      fontFamily: "inherit",
      fontSize: "14px",
    },

    modalFooter: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "10px",
      marginTop: "25px",
    },
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}

        <div style={styles.header}>

          <div>
            <h1 style={styles.title}>
              Staff Leave Management
            </h1>

            <div style={styles.subtitle}>
              Manage staff leave requests,
              approvals and leave history.
            </div>
          </div>

          <div style={styles.buttonGroup}>

            <button
              style={{
                ...styles.button,
                ...styles.secondaryButton,
              }}
              onClick={() =>
                navigate("/staff")
              }
            >
              ← Staff
            </button>

            <button
              style={{
                ...styles.button,
                ...styles.secondaryButton,
              }}
              onClick={handleRefresh}
            >
              ↻ Refresh
            </button>

            <button
              style={{
                ...styles.button,
                ...styles.primaryButton,
              }}
              onClick={() => {
                setForm(initialForm);
                setShowModal(true);
              }}
            >
              + Apply Leave
            </button>

          </div>
        </div>


        {/* SUMMARY */}

        <div style={styles.summaryGrid}>

          <div style={styles.card}>
            <div style={styles.cardLabel}>
              Total Requests
            </div>

            <div style={styles.cardValue}>
              {summary.total_requests}
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardLabel}>
              Pending
            </div>

            <div style={styles.cardValue}>
              {summary.pending}
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardLabel}>
              Approved
            </div>

            <div style={styles.cardValue}>
              {summary.approved}
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardLabel}>
              Rejected
            </div>

            <div style={styles.cardValue}>
              {summary.rejected}
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardLabel}>
              Cancelled
            </div>

            <div style={styles.cardValue}>
              {summary.cancelled}
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardLabel}>
              Approved Leave Days
            </div>

            <div style={styles.cardValue}>
              {summary.total_leave_days || 0}
            </div>
          </div>

        </div>


        {/* FILTERS */}

        <div style={styles.filters}>

          <input
            type="text"
            placeholder="Search staff or leave..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter"
              ) {
                handleSearch();
              }
            }}
            style={styles.input}
          />

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(
                event.target.value
              );
            }}
            style={styles.input}
          >
            <option value="">
              All Statuses
            </option>

            {statusOptions.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {getTypeLabel(status)}
                </option>
              )
            )}
          </select>

          <select
            value={leaveTypeFilter}
            onChange={(event) => {
              setLeaveTypeFilter(
                event.target.value
              );
            }}
            style={styles.input}
          >
            <option value="">
              All Leave Types
            </option>

            {leaveTypes.map(
              (type) => (
                <option
                  key={type}
                  value={type}
                >
                  {getTypeLabel(type)}
                </option>
              )
            )}
          </select>

          <button
            style={{
              ...styles.button,
              ...styles.primaryButton,
            }}
            onClick={handleSearch}
          >
            Search
          </button>

        </div>


        {/* TABLE */}

        <div style={styles.tableContainer}>

          {loading ? (
            <div style={styles.empty}>
              Loading leave records...
            </div>
          ) : leaves.length === 0 ? (
            <div style={styles.empty}>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                No leave records found
              </div>

              <div>
                Apply a leave request
                to get started.
              </div>
            </div>
          ) : (
            <table style={styles.table}>

              <thead>
                <tr>

                  <th style={styles.th}>
                    Staff
                  </th>

                  <th style={styles.th}>
                    Department
                  </th>

                  <th style={styles.th}>
                    Leave Type
                  </th>

                  <th style={styles.th}>
                    Start Date
                  </th>

                  <th style={styles.th}>
                    End Date
                  </th>

                  <th style={styles.th}>
                    Days
                  </th>

                  <th style={styles.th}>
                    Status
                  </th>

                  <th style={styles.th}>
                    Reason
                  </th>

                  <th style={styles.th}>
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody>

                {leaves.map(
                  (leave) => (
                    <tr key={leave.id}>

                      <td style={styles.td}>
                        <strong>
                          {leave.staff_name ||
                            "-"}
                        </strong>

                        <div
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            marginTop: "3px",
                          }}
                        >
                          {leave.staff_code ||
                            ""}
                        </div>
                      </td>

                      <td style={styles.td}>
                        <div>
                          {leave.department ||
                            "-"}
                        </div>

                        <div
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            marginTop: "3px",
                          }}
                        >
                          {leave.designation ||
                            ""}
                        </div>
                      </td>

                      <td style={styles.td}>
                        {getTypeLabel(
                          leave.leave_type
                        )}
                      </td>

                      <td style={styles.td}>
                        {formatDate(
                          leave.start_date
                        )}
                      </td>

                      <td style={styles.td}>
                        {formatDate(
                          leave.end_date
                        )}
                      </td>

                      <td style={styles.td}>
                        <strong>
                          {leave.total_days}
                        </strong>
                      </td>

                      <td style={styles.td}>

                        <span
                          style={{
                            ...styles.status,
                            ...getStatusStyle(
                              leave.status
                            ),
                          }}
                        >
                          {getTypeLabel(
                            leave.status
                          )}
                        </span>

                      </td>

                      <td style={styles.td}>
                        {leave.reason ||
                          "-"}
                      </td>

                      <td style={styles.td}>

                        <div
                          style={
                            styles.actionGroup
                          }
                        >

                          {leave.status ===
                            "PENDING" && (
                            <>
                              <button
                                style={{
                                  ...styles.smallButton,
                                  ...styles.approve,
                                }}
                                onClick={() =>
                                  approveLeave(
                                    leave.id
                                  )
                                }
                              >
                                Approve
                              </button>

                              <button
                                style={{
                                  ...styles.smallButton,
                                  ...styles.reject,
                                }}
                                onClick={() =>
                                  rejectLeave(
                                    leave.id
                                  )
                                }
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {(
                            leave.status ===
                              "PENDING" ||
                            leave.status ===
                              "APPROVED"
                          ) && (
                            <button
                              style={{
                                ...styles.smallButton,
                                ...styles.cancel,
                              }}
                              onClick={() =>
                                cancelLeave(
                                  leave.id
                                )
                              }
                            >
                              Cancel
                            </button>
                          )}

                          <button
                            style={{
                              ...styles.smallButton,
                              ...styles.delete,
                            }}
                            onClick={() =>
                              deleteLeave(
                                leave.id
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>
          )}

        </div>


        {/* APPLY LEAVE MODAL */}

        {showModal && (
          <div style={styles.overlay}>

            <div style={styles.modal}>

              <div style={styles.modalHeader}>

                <h2 style={styles.modalTitle}>
                  Apply Staff Leave
                </h2>

                <button
                  style={styles.closeButton}
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  ×
                </button>

              </div>


              <form
                onSubmit={handleSubmit}
              >

                <div style={styles.formGrid}>

                  {/* STAFF */}

                  <div
                    style={{
                      ...styles.formGroup,
                      ...styles.fullWidth,
                    }}
                  >

                    <label style={styles.label}>
                      Staff Member *
                    </label>

                    <select
                      name="staff_id"
                      value={form.staff_id}
                      onChange={
                        handleChange
                      }
                      style={styles.input}
                      required
                    >

                      <option value="">
                        {staffLoading
                          ? "Loading staff..."
                          : "Select staff member"}
                      </option>

                      {staff.map(
                        (member) => (
                          <option
                            key={member.id}
                            value={member.id}
                          >
                            {member.first_name}{" "}
                            {member.last_name}{" "}
                            —{" "}
                            {member.designation ||
                              member.department ||
                              member.staff_id}
                          </option>
                        )
                      )}

                    </select>

                    {!staffLoading &&
                      staff.length === 0 && (
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#b91c1c",
                          }}
                        >
                          No active staff members
                          available.
                        </div>
                      )}

                  </div>


                  {/* LEAVE TYPE */}

                  <div style={styles.formGroup}>

                    <label style={styles.label}>
                      Leave Type *
                    </label>

                    <select
                      name="leave_type"
                      value={
                        form.leave_type
                      }
                      onChange={
                        handleChange
                      }
                      style={styles.input}
                      required
                    >

                      {leaveTypes.map(
                        (type) => (
                          <option
                            key={type}
                            value={type}
                          >
                            {getTypeLabel(
                              type
                            )}
                          </option>
                        )
                      )}

                    </select>

                  </div>


                  {/* START DATE */}

                  <div style={styles.formGroup}>

                    <label style={styles.label}>
                      Start Date *
                    </label>

                    <input
                      type="date"
                      name="start_date"
                      value={
                        form.start_date
                      }
                      onChange={
                        handleChange
                      }
                      style={styles.input}
                      required
                    />

                  </div>


                  {/* END DATE */}

                  <div style={styles.formGroup}>

                    <label style={styles.label}>
                      End Date *
                    </label>

                    <input
                      type="date"
                      name="end_date"
                      value={
                        form.end_date
                      }
                      onChange={
                        handleChange
                      }
                      style={styles.input}
                      required
                    />

                  </div>


                  {/* REASON */}

                  <div
                    style={{
                      ...styles.formGroup,
                      ...styles.fullWidth,
                    }}
                  >

                    <label style={styles.label}>
                      Reason
                    </label>

                    <textarea
                      name="reason"
                      value={
                        form.reason
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter reason for leave..."
                      style={
                        styles.textarea
                      }
                    />

                  </div>

                </div>


                {/* FOOTER */}

                <div
                  style={
                    styles.modalFooter
                  }
                >

                  <button
                    type="button"
                    style={{
                      ...styles.button,
                      ...styles.secondaryButton,
                    }}
                    onClick={() =>
                      setShowModal(false)
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    style={{
                      ...styles.button,
                      ...styles.primaryButton,
                      opacity: saving
                        ? 0.6
                        : 1,
                    }}
                  >
                    {saving
                      ? "Saving..."
                      : "Submit Leave"}
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default StaffLeave;