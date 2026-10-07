import React, { useEffect, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:8000"
    : "https://edunexus-ai-backend-xtct.onrender.com");

function normalizeStudents(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.students)) {
    return data.students;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
}

function getStudentName(student) {
  const fullName = [
    student.first_name,
    student.middle_name,
    student.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    fullName ||
    student.name ||
    student.student_name ||
    student.full_name ||
    `Student ${student.id}`
  );
}

function getClassName(student) {
  if (student.class_name && student.section) {
    return `${student.class_name} - ${student.section}`;
  }

  return (
    student.class_name ||
    student.class_name_id ||
    student.class ||
    student.grade ||
    "—"
  );
}

function getAdmissionNumber(student) {
  return (
    student.admission_number ||
    student.student_id ||
    student.student_code ||
    "—"
  );
}

function getStatus(student) {
  if (student.is_active === false) {
    return "Inactive";
  }

  if (student.status) {
    return String(student.status);
  }

  return "Active";
}

function getStatusStyle(status) {
  const normalized = String(status).toLowerCase();

  if (
    normalized === "active" ||
    normalized === "enrolled" ||
    normalized === "present"
  ) {
    return {
      background: "#dcfce7",
      color: "#166534",
    };
  }

  if (
    normalized === "inactive" ||
    normalized === "archived" ||
    normalized === "left"
  ) {
    return {
      background: "#fee2e2",
      color: "#991b1b",
    };
  }

  return {
    background: "#fef3c7",
    color: "#92400e",
  };
}

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          ...(accessToken
            ? {
                Authorization: `Bearer ${accessToken}`,
              }
            : {}),
        },
      });

      if (response.status === 401) {
        throw new Error(
          "Your session has expired. Please login again."
        );
      }

      if (response.status === 403) {
        throw new Error(
          "You do not have permission to view students."
        );
      }

      if (!response.ok) {
        let message = `Failed to load students (${response.status})`;

        try {
          const errorData = await response.json();

          message =
            errorData?.detail ||
            errorData?.message ||
            message;
        } catch {
          // Keep default error message.
        }

        throw new Error(message);
      }

      const data = await response.json();

      console.log("Students API response:", data);

      const normalizedStudents = normalizeStudents(data);

      console.log(
        "Normalized students:",
        normalizedStudents
      );

      setStudents(normalizedStudents);
    } catch (err) {
      console.error("Students loading error:", err);

      setStudents([]);

      setError(
        err?.message ||
          "Unable to load students. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "32px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "20px",
          marginBottom: "28px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              color: "#111827",
              fontSize: "40px",
              lineHeight: 1.15,
              fontWeight: 700,
            }}
          >
            Students
          </h1>

          <p
            style={{
              margin: "12px 0 0",
              color: "#64748b",
              fontSize: "17px",
            }}
          >
            Manage student records and enrollment information.
          </p>
        </div>

        <button
          type="button"
          onClick={loadStudents}
          disabled={loading}
          style={{
            border: "none",
            borderRadius: "10px",
            background: "#2563eb",
            color: "#ffffff",
            padding: "13px 30px",
            fontSize: "16px",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#b91c1c",
            borderRadius: "10px",
            padding: "18px",
            marginBottom: "24px",
            fontSize: "17px",
            border: "1px solid #fecaca",
          }}
        >
          {error}
        </div>
      )}

      {loading && (
        <div
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            padding: "40px",
            textAlign: "center",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              color: "#475569",
              fontSize: "16px",
            }}
          >
            Loading students...
          </div>
        </div>
      )}

      {!loading && !error && (
        <div
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid #e2e8f0",
              background: "#f8fafc",
            }}
          >
            <strong
              style={{
                color: "#1e293b",
                fontSize: "16px",
              }}
            >
              Total Students: {students.length}
            </strong>
          </div>

          {students.length === 0 ? (
            <div
              style={{
                padding: "70px 30px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "42px",
                  marginBottom: "15px",
                }}
              >
                🎓
              </div>

              <div
                style={{
                  fontSize: "21px",
                  fontWeight: 600,
                  color: "#1e293b",
                  marginBottom: "8px",
                }}
              >
                No students found
              </div>

              <div
                style={{
                  color: "#64748b",
                  fontSize: "15px",
                }}
              >
                There are currently no student records available.
              </div>
            </div>
          ) : (
            <div
              style={{
                width: "100%",
                overflowX: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "850px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f1f5f9",
                    }}
                  >
                    <th style={tableHeaderStyle}>ID</th>
                    <th style={tableHeaderStyle}>Student</th>
                    <th style={tableHeaderStyle}>
                      Admission No.
                    </th>
                    <th style={tableHeaderStyle}>Class</th>
                    <th style={tableHeaderStyle}>Email</th>
                    <th style={tableHeaderStyle}>Phone</th>
                    <th style={tableHeaderStyle}>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((student) => {
                    const status = getStatus(student);

                    return (
                      <tr
                        key={student.id}
                        style={{
                          borderTop:
                            "1px solid #e2e8f0",
                        }}
                      >
                        <td style={tableCellStyle}>
                          {student.id ?? "—"}
                        </td>

                        <td style={tableCellStyle}>
                          <div
                            style={{
                              fontWeight: 600,
                              color: "#0f172a",
                            }}
                          >
                            {getStudentName(student)}
                          </div>
                        </td>

                        <td style={tableCellStyle}>
                          {getAdmissionNumber(student)}
                        </td>

                        <td style={tableCellStyle}>
                          {getClassName(student)}
                        </td>

                        <td style={tableCellStyle}>
                          {student.email ||
                            student.student_email ||
                            "—"}
                        </td>

                        <td style={tableCellStyle}>
                          {student.phone ||
                            student.phone_number ||
                            student.mobile ||
                            "—"}
                        </td>

                        <td style={tableCellStyle}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "6px 11px",
                              borderRadius: "999px",
                              fontSize: "13px",
                              fontWeight: 600,
                              ...getStatusStyle(status),
                            }}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const tableHeaderStyle = {
  textAlign: "left",
  padding: "15px 18px",
  color: "#475569",
  fontSize: "13px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.03em",
  whiteSpace: "nowrap",
};

const tableCellStyle = {
  padding: "16px 18px",
  color: "#334155",
  fontSize: "14px",
  verticalAlign: "middle",
};