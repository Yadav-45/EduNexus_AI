import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function StaffAttendance() {
  const navigate = useNavigate();

  const today = new Date()
    .toISOString()
    .split("T")[0];

  const [selectedDate, setSelectedDate] = useState(today);

  const [attendance, setAttendance] = useState([]);

  const [summary, setSummary] = useState({
    total_staff: 0,
    present: 0,
    absent: 0,
    half_day: 0,
    late: 0,
    on_leave: 0,
    holiday: 0,
    week_off: 0,
  });

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [staffList, setStaffList] =
    useState([]);

  const [form, setForm] = useState({
    staff_id: "",
    attendance_date: today,
    status: "PRESENT",
    check_in: "",
    check_out: "",
    remarks: "",
  });

  const getToken = () => {
    return (
      localStorage.getItem("access_token") ||
      localStorage.getItem("token")
    );
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

  // ==========================================================
  // LOAD ATTENDANCE
  // ==========================================================

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      params.append(
        "attendance_date",
        selectedDate
      );

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

      const response = await fetch(
        `${API_BASE_URL}/staff-attendance?${params.toString()}`,
        {
          headers: getHeaders(),
        }
      );

      const data =
        await response.json().catch(
          () => ({})
        );

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to load staff attendance."
        );
      }

      setAttendance(
        data.items || []
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to load staff attendance."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // LOAD SUMMARY
  // ==========================================================

  const loadSummary = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/staff-attendance/summary?attendance_date=${selectedDate}`,
        {
          headers: getHeaders(),
        }
      );

      const data =
        await response.json().catch(
          () => ({})
        );

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to load attendance summary."
        );
      }

      setSummary({
        total_staff:
          data.total_staff || 0,

        present:
          data.present || 0,

        absent:
          data.absent || 0,

        half_day:
          data.half_day || 0,

        late:
          data.late || 0,

        on_leave:
          data.on_leave || 0,

        holiday:
          data.holiday || 0,

        week_off:
          data.week_off || 0,
      });
    } catch (err) {
      console.error(err);
    }
  };

  // ==========================================================
  // LOAD STAFF
  // ==========================================================

  const loadStaff = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/staff?page=1&page_size=100`,
        {
          headers: getHeaders(),
        }
      );

      const data =
        await response.json().catch(
          () => ({})
        );

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to load staff."
        );
      }

      setStaffList(
        data.items || []
      );
    } catch (err) {
      console.error(err);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadAttendance();
    loadSummary();
  }, [
    selectedDate,
    statusFilter,
  ]);

  useEffect(() => {
    loadStaff();
  }, []);

  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  const handleFormChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================================
  // OPEN ADD FORM
  // ==========================================================

  const openAddForm = () => {
    setForm({
      staff_id: "",
      attendance_date:
        selectedDate,
      status: "PRESENT",
      check_in: "",
      check_out: "",
      remarks: "",
    });

    setShowForm(true);
  };

  // ==========================================================
  // CREATE ATTENDANCE
  // ==========================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!form.staff_id) {
      setError(
        "Please select a staff member."
      );

      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        staff_id:
          Number(form.staff_id),

        attendance_date:
          form.attendance_date,

        status:
          form.status,

        check_in:
          form.check_in || null,

        check_out:
          form.check_out || null,

        remarks:
          form.remarks.trim() || null,
      };

      const response = await fetch(
        `${API_BASE_URL}/staff-attendance`,
        {
          method: "POST",

          headers: getHeaders(),

          body: JSON.stringify(
            payload
          ),
        }
      );

      const data =
        await response.json().catch(
          () => ({})
        );

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to create attendance."
        );
      }

      setShowForm(false);

      setSelectedDate(
        form.attendance_date
      );

      await loadAttendance();

      await loadSummary();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to create attendance."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // SEARCH
  // ==========================================================

  const handleSearch = (
    event
  ) => {
    event.preventDefault();

    loadAttendance();
  };

  // ==========================================================
  // STATUS DISPLAY
  // ==========================================================

  const getStatusStyle = (
    status
  ) => {
    const normalized =
      String(status || "")
        .toUpperCase();

    if (
      normalized === "PRESENT"
    ) {
      return {
        background: "#dcfce7",
        color: "#166534",
      };
    }

    if (
      normalized === "ABSENT"
    ) {
      return {
        background: "#fee2e2",
        color: "#991b1b",
      };
    }

    if (
      normalized === "LATE"
    ) {
      return {
        background: "#fef3c7",
        color: "#92400e",
      };
    }

    if (
      normalized === "HALF_DAY"
    ) {
      return {
        background: "#dbeafe",
        color: "#1e40af",
      };
    }

    if (
      normalized === "ON_LEAVE"
    ) {
      return {
        background: "#f3e8ff",
        color: "#6b21a8",
      };
    }

    return {
      background: "#f3f4f6",
      color: "#374151",
    };
  };

  // ==========================================================
  // TIME FORMAT
  // ==========================================================

  const formatTime = (
    value
  ) => {
    if (!value) {
      return "—";
    }

    return String(value)
      .substring(0, 5);
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div style={pageStyle}>

      {/* ====================================================
          HEADER
      ==================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "20px",
          marginBottom: "25px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={titleStyle}>
            Staff Attendance
          </h1>

          <p style={subtitleStyle}>
            Track daily attendance,
            check-in and check-out
            for school staff.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
          }}
        >
          <button
            onClick={() =>
              navigate("/staff")
            }
            style={secondaryButtonStyle}
          >
            ← Staff Directory
          </button>

          <button
            onClick={openAddForm}
            style={primaryButtonStyle}
          >
            + Mark Attendance
          </button>
        </div>
      </div>


      {/* ====================================================
          ERROR
      ==================================================== */}

      {error && (
        <div style={errorStyle}>
          {error}
        </div>
      )}


      {/* ====================================================
          DATE + SEARCH
      ==================================================== */}

      <div style={filterCardStyle}>

        <div>
          <label style={labelStyle}>
            Attendance Date
          </label>

          <input
            type="date"
            value={selectedDate}
            onChange={(event) =>
              setSelectedDate(
                event.target.value
              )
            }
            style={inputStyle}
          />
        </div>

        <form
          onSubmit={handleSearch}
          style={{
            flex: 1,
            minWidth: "220px",
          }}
        >
          <label style={labelStyle}>
            Search Staff
          </label>

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Name, staff ID, department..."
            style={inputStyle}
          />
        </form>

        <div>
          <label style={labelStyle}>
            Status
          </label>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            style={inputStyle}
          >
            <option value="">
              All Status
            </option>

            <option value="PRESENT">
              Present
            </option>

            <option value="ABSENT">
              Absent
            </option>

            <option value="HALF_DAY">
              Half Day
            </option>

            <option value="LATE">
              Late
            </option>

            <option value="ON_LEAVE">
              On Leave
            </option>

            <option value="HOLIDAY">
              Holiday
            </option>

            <option value="WEEK_OFF">
              Week Off
            </option>
          </select>
        </div>

        <button
          onClick={loadAttendance}
          style={refreshButtonStyle}
        >
          Refresh
        </button>
      </div>


      {/* ====================================================
          SUMMARY CARDS
      ==================================================== */}

      <div style={summaryGridStyle}>

        <SummaryCard
          label="Total Staff"
          value={summary.total_staff}
        />

        <SummaryCard
          label="Present"
          value={summary.present}
          type="success"
        />

        <SummaryCard
          label="Absent"
          value={summary.absent}
          type="danger"
        />

        <SummaryCard
          label="Half Day"
          value={summary.half_day}
          type="info"
        />

        <SummaryCard
          label="Late"
          value={summary.late}
          type="warning"
        />

        <SummaryCard
          label="On Leave"
          value={summary.on_leave}
        />
      </div>


      {/* ====================================================
          ADD ATTENDANCE FORM
      ==================================================== */}

      {showForm && (
        <div style={modalOverlayStyle}>

          <div style={modalStyle}>

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    color: "#172033",
                  }}
                >
                  Mark Staff Attendance
                </h2>

                <p
                  style={{
                    margin:
                      "5px 0 0",
                    color: "#6b7280",
                    fontSize: "13px",
                  }}
                >
                  Add attendance for
                  one staff member.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowForm(false)
                }
                style={closeButtonStyle}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
            >

              <div
                style={
                  formGridStyle
                }
              >

                <div>
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Staff Member
                  </label>

                  <select
                    name="staff_id"
                    value={
                      form.staff_id
                    }
                    onChange={
                      handleFormChange
                    }
                    style={
                      inputStyle
                    }
                    required
                  >
                    <option value="">
                      Select Staff
                    </option>

                    {staffList.map(
                      (staff) => (
                        <option
                          key={
                            staff.id
                          }
                          value={
                            staff.id
                          }
                        >
                          {
                            staff.first_name
                          }{" "}
                          {
                            staff.last_name
                          }{" "}
                          —{" "}
                          {
                            staff.staff_id
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>


                <div>
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Date
                  </label>

                  <input
                    type="date"
                    name="attendance_date"
                    value={
                      form.attendance_date
                    }
                    onChange={
                      handleFormChange
                    }
                    style={
                      inputStyle
                    }
                    required
                  />
                </div>


                <div>
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Status
                  </label>

                  <select
                    name="status"
                    value={
                      form.status
                    }
                    onChange={
                      handleFormChange
                    }
                    style={
                      inputStyle
                    }
                  >
                    <option value="PRESENT">
                      Present
                    </option>

                    <option value="ABSENT">
                      Absent
                    </option>

                    <option value="HALF_DAY">
                      Half Day
                    </option>

                    <option value="LATE">
                      Late
                    </option>

                    <option value="ON_LEAVE">
                      On Leave
                    </option>

                    <option value="HOLIDAY">
                      Holiday
                    </option>

                    <option value="WEEK_OFF">
                      Week Off
                    </option>
                  </select>
                </div>


                <div>
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Check In
                  </label>

                  <input
                    type="time"
                    name="check_in"
                    value={
                      form.check_in
                    }
                    onChange={
                      handleFormChange
                    }
                    style={
                      inputStyle
                    }
                  />
                </div>


                <div>
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Check Out
                  </label>

                  <input
                    type="time"
                    name="check_out"
                    value={
                      form.check_out
                    }
                    onChange={
                      handleFormChange
                    }
                    style={
                      inputStyle
                    }
                  />
                </div>


                <div
                  style={{
                    gridColumn:
                      "1 / -1",
                  }}
                >
                  <label
                    style={
                      labelStyle
                    }
                  >
                    Remarks
                  </label>

                  <textarea
                    name="remarks"
                    value={
                      form.remarks
                    }
                    onChange={
                      handleFormChange
                    }
                    rows="3"
                    placeholder="Optional remarks..."
                    style={{
                      ...inputStyle,
                      resize:
                        "vertical",
                      fontFamily:
                        "inherit",
                    }}
                  />
                </div>

              </div>


              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "flex-end",
                  gap: "10px",
                  marginTop: "25px",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setShowForm(false)
                  }
                  style={
                    secondaryButtonStyle
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={{
                    ...primaryButtonStyle,
                    opacity:
                      saving
                        ? 0.7
                        : 1,
                  }}
                  disabled={
                    saving
                  }
                >
                  {saving
                    ? "Saving..."
                    : "Save Attendance"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}


      {/* ====================================================
          ATTENDANCE TABLE
      ==================================================== */}

      <div style={tableCardStyle}>

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: "18px",
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
              Attendance Records
            </h2>

            <p
              style={{
                margin:
                  "5px 0 0",
                color: "#6b7280",
                fontSize: "13px",
              }}
            >
              {selectedDate}
            </p>
          </div>

          <span
            style={{
              color: "#6b7280",
              fontSize: "13px",
            }}
          >
            {attendance.length} record
            {attendance.length !== 1
              ? "s"
              : ""}
          </span>
        </div>


        {loading ? (
          <div style={emptyStyle}>
            Loading attendance...
          </div>
        ) : attendance.length === 0 ? (
          <div style={emptyStyle}>
            <div
              style={{
                fontSize: "38px",
                marginBottom: "10px",
              }}
            >
              📋
            </div>

            <strong>
              No attendance records
            </strong>

            <p
              style={{
                color: "#6b7280",
                margin:
                  "8px 0 20px",
              }}
            >
              No attendance has been
              recorded for this date.
            </p>

            <button
              onClick={
                openAddForm
              }
              style={
                primaryButtonStyle
              }
            >
              + Mark Attendance
            </button>
          </div>
        ) : (
          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={tableStyle}
            >
              <thead>
                <tr>
                  <th
                    style={
                      tableHeaderStyle
                    }
                  >
                    Staff
                  </th>

                  <th
                    style={
                      tableHeaderStyle
                    }
                  >
                    Department
                  </th>

                  <th
                    style={
                      tableHeaderStyle
                    }
                  >
                    Designation
                  </th>

                  <th
                    style={
                      tableHeaderStyle
                    }
                  >
                    Status
                  </th>

                  <th
                    style={
                      tableHeaderStyle
                    }
                  >
                    Check In
                  </th>

                  <th
                    style={
                      tableHeaderStyle
                    }
                  >
                    Check Out
                  </th>

                  <th
                    style={
                      tableHeaderStyle
                    }
                  >
                    Working Hours
                  </th>

                  <th
                    style={
                      tableHeaderStyle
                    }
                  >
                    Remarks
                  </th>
                </tr>
              </thead>

              <tbody>
                {attendance.map(
                  (record) => (
                    <tr
                      key={
                        record.id
                      }
                    >
                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        <div
                          style={{
                            fontWeight:
                              "600",
                            color:
                              "#172033",
                          }}
                        >
                          {
                            record.staff_name
                          }
                        </div>

                        <div
                          style={{
                            fontSize:
                              "12px",
                            color:
                              "#6b7280",
                            marginTop:
                              "3px",
                          }}
                        >
                          {
                            record.staff_code
                          }
                        </div>
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        {
                          record.department ||
                          "—"
                        }
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        {
                          record.designation ||
                          "—"
                        }
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        <span
                          style={{
                            ...statusBadgeStyle,
                            ...getStatusStyle(
                              record.status
                            ),
                          }}
                        >
                          {
                            record.status
                          }
                        </span>
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        {formatTime(
                          record.check_in
                        )}
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        {formatTime(
                          record.check_out
                        )}
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        {
                          record.working_hours ||
                          "—"
                        }
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        {
                          record.remarks ||
                          "—"
                        }
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


// ============================================================
// SUMMARY CARD
// ============================================================

function SummaryCard({
  label,
  value,
  type,
}) {
  let accent = "#2563eb";

  if (type === "success") {
    accent = "#16a34a";
  }

  if (type === "danger") {
    accent = "#dc2626";
  }

  if (type === "warning") {
    accent = "#d97706";
  }

  if (type === "info") {
    accent = "#2563eb";
  }

  return (
    <div
      style={{
        ...summaryCardStyle,
        borderTop:
          `3px solid ${accent}`,
      }}
    >
      <div
        style={{
          color: "#6b7280",
          fontSize: "13px",
          marginBottom: "8px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: "#172033",
          fontSize: "28px",
          fontWeight: "700",
        }}
      >
        {value}
      </div>
    </div>
  );
}


// ============================================================
// STYLES
// ============================================================

const pageStyle = {
  minHeight: "100vh",
  background: "#f7f8fc",
  padding: "30px",
};

const titleStyle = {
  margin: 0,
  fontSize: "28px",
  color: "#172033",
};

const subtitleStyle = {
  margin: "6px 0 0",
  color: "#6b7280",
  fontSize: "14px",
};

const primaryButtonStyle = {
  border: "none",
  background: "#2563eb",
  color: "#ffffff",
  padding: "11px 17px",
  borderRadius: "7px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "600",
};

const secondaryButtonStyle = {
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#374151",
  padding: "10px 15px",
  borderRadius: "7px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "600",
};

const refreshButtonStyle = {
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#374151",
  padding: "11px 15px",
  borderRadius: "7px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "600",
  alignSelf: "flex-end",
};

const filterCardStyle = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  padding: "18px",
  display: "flex",
  alignItems: "flex-end",
  gap: "15px",
  flexWrap: "wrap",
  marginBottom: "20px",
};

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  fontSize: "13px",
  fontWeight: "600",
  color: "#374151",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "7px",
  background: "#ffffff",
  color: "#172033",
  fontSize: "14px",
  outline: "none",
};

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(150px, 1fr))",
  gap: "15px",
  marginBottom: "20px",
};

const summaryCardStyle = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  padding: "18px",
};

const tableCardStyle = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  padding: "22px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "900px",
};

const tableHeaderStyle = {
  textAlign: "left",
  padding: "12px",
  borderBottom:
    "1px solid #e5e7eb",
  background: "#f9fafb",
  color: "#6b7280",
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const tableCellStyle = {
  padding: "14px 12px",
  borderBottom:
    "1px solid #f0f1f3",
  color: "#374151",
  fontSize: "13px",
};

const statusBadgeStyle = {
  display: "inline-block",
  padding: "5px 9px",
  borderRadius: "999px",
  fontSize: "11px",
  fontWeight: "700",
};

const emptyStyle = {
  textAlign: "center",
  padding: "60px 20px",
  color: "#374151",
};

const errorStyle = {
  background: "#fef2f2",
  border: "1px solid #fecaca",
  color: "#b91c1c",
  padding: "13px 16px",
  borderRadius: "8px",
  marginBottom: "20px",
};

const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  background:
    "rgba(15, 23, 42, 0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  zIndex: 1000,
};

const modalStyle = {
  background: "#ffffff",
  borderRadius: "14px",
  width: "100%",
  maxWidth: "720px",
  maxHeight: "90vh",
  overflowY: "auto",
  padding: "25px",
  boxShadow:
    "0 20px 50px rgba(0,0,0,0.15)",
};

const closeButtonStyle = {
  border: "none",
  background: "#f3f4f6",
  color: "#374151",
  width: "34px",
  height: "34px",
  borderRadius: "50%",
  cursor: "pointer",
  fontSize: "22px",
  lineHeight: "1",
};

const formGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "17px",
};