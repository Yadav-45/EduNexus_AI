import React, { useEffect, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8000";

/*
 * Always convert the API response into an array.
 * This protects the UI from paginated/object API responses.
 */
const normalizeStudents = (data) => {
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
};

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token =
  localStorage.getItem("access_token") ||
  localStorage.getItem("token");
  
  const getStatusStyle = (statusValue) => {
    return String(statusValue ?? "").toUpperCase() === "ACTIVE"
      ? { ...styles.status, ...styles.active }
      : styles.status;
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/students`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Your session has expired. Please login again.");
        }

        if (response.status === 403) {
          throw new Error(
            "You do not have permission to view students."
          );
        }

        throw new Error(
          `Failed to load students (${response.status})`
        );
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
        err?.message || "Unable to load students."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Students</h1>

          <p style={styles.subtitle}>
            Manage student records and enrollment information.
          </p>
        </div>

        <button
          style={styles.refreshButton}
          onClick={loadStudents}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {loading && (
        <div style={styles.card}>
          <div style={styles.loading}>
            Loading students...
          </div>
        </div>
      )}

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <div style={styles.card}>
          <div style={styles.summary}>
            <strong>
              Total Students: {students.length}
            </strong>
          </div>

          {students.length === 0 ? (
            <div style={styles.empty}>
              <div style={styles.emptyTitle}>
                No students found
              </div>

              <div style={styles.emptyText}>
                There are currently no student records available.
              </div>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>
                      ID
                    </th>

                    <th style={styles.th}>
                      Student
                    </th>

                    <th style={styles.th}>
                      Class
                    </th>

                    <th style={styles.th}>
                      Section
                    </th>

                    <th style={styles.th}>
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((student, index) => {
                    /*
                     * Make sure a malformed/null item
                     * cannot crash the entire page.
                     */
                    if (!student || typeof student !== "object") {
                      return null;
                    }

                    const studentId =
                      student.student_code ||
                      student.admission_number ||
                      student.id ||
                      `student-${index}`;

                    const fullName =
                      [
                        student.first_name,
                        student.middle_name,
                        student.last_name,
                      ]
                        .filter(Boolean)
                        .join(" ")
                        .trim() ||
                      student.name ||
                      student.student_name ||
                      "N/A";

                    const className =
                      student.class_name ||
                      student.class_level ||
                      student.class ||
                      student.class_id ||
                      "-";

                    const section =
                      student.section ||
                      student.section_name ||
                      "-";

                    const status =
                      student.status ||
                      "ACTIVE";

                    return (
                      <tr
                        key={
                          student.id ||
                          student.student_code ||
                          student.admission_number ||
                          index
                        }
                      >
                        <td style={styles.td}>
                          {studentId}
                        </td>

                        <td style={styles.td}>
                          {fullName}
                        </td>

                        <td style={styles.td}>
                          {className}
                        </td>

                        <td style={styles.td}>
                          {section}
                        </td>

                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.status,
                              ...(String(status).toUpperCase() ===
                              "ACTIVE"
                                ? styles.active
                                : {}),
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

const styles = {
  page: {
    padding: "30px",
    background: "#f8fafc",
    minHeight: "100vh",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    gap: "20px",
  },

  title: {
    margin: 0,
    fontSize: "30px",
    fontWeight: 700,
    color: "#0f172a",
  },

  subtitle: {
    marginTop: "8px",
    marginBottom: 0,
    color: "#64748b",
    fontSize: "15px",
  },

  refreshButton: {
    border: "none",
    background: "#2563eb",
    color: "#fff",
    padding: "10px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    minWidth: "100px",
  },

  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  },

  summary: {
    marginBottom: "20px",
    fontSize: "16px",
    color: "#0f172a",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "12px",
    borderBottom: "1px solid #e2e8f0",
    background: "#f8fafc",
    color: "#334155",
    fontWeight: 600,
    fontSize: "14px",
  },

  td: {
    padding: "12px",
    borderBottom: "1px solid #e2e8f0",
    color: "#334155",
    fontSize: "14px",
  },

  status: {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: "20px",
    background: "#e2e8f0",
    color: "#475569",
    fontSize: "12px",
    fontWeight: 600,
  },

  active: {
    background: "#dcfce7",
    color: "#166534",
  },

  empty: {
    padding: "50px 20px",
    textAlign: "center",
    color: "#64748b",
  },

  emptyTitle: {
    fontSize: "18px",
    fontWeight: 600,
    color: "#334155",
    marginBottom: "8px",
  },

  emptyText: {
    fontSize: "14px",
    color: "#64748b",
  },

  loading: {
    padding: "30px",
    textAlign: "center",
    color: "#64748b",
  },

  error: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
  },
};

