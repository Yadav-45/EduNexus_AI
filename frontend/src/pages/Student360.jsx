import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../api/axios";

function Student360() {
  const navigate = useNavigate();
  const { studentId } = useParams();

  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadStudent360();
    loadAttendance();
  }, [studentId]);

  async function loadStudent360() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/student-360/${studentId}`
      );

      setStudent(response.data);
    } catch (error) {
      console.error(
        "Unable to load Student 360:",
        error
      );

      setError(
        error?.response?.data?.detail ||
          "Unable to load student information."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadAttendance() {
    try {
      setAttendanceLoading(true);

      const response = await api.get(
        `/attendance/student/${studentId}`
      );

      setAttendance(response.data);
    } catch (error) {
      console.error(
        "Unable to load student attendance:",
        error
      );

      setAttendance(null);
    } finally {
      setAttendanceLoading(false);
    }
  }

  function formatDate(value) {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function getStatusStyle(status) {
    const styles = {
      PRESENT: {
        background: "#ecfdf3",
        color: "#027a48",
      },
      ABSENT: {
        background: "#fef3f2",
        color: "#b42318",
      },
      LATE: {
        background: "#fffaeb",
        color: "#b54708",
      },
      LEAVE: {
        background: "#eff8ff",
        color: "#175cd3",
      },
    };

    return (
      styles[status] || {
        background: "#f2f4f7",
        color: "#475467",
      }
    );
  }

  if (loading) {
    return (
      <PageShell>
        <div style={loadingStyle}>
          Loading Student 360...
        </div>
      </PageShell>
    );
  }

  if (error || !student) {
    return (
      <PageShell>
        <div style={errorCardStyle}>
          <h2
            style={{
              margin: "0 0 8px",
              color: "#101828",
            }}
          >
            Unable to load Student 360
          </h2>

          <p
            style={{
              margin: "0 0 20px",
              color: "#667085",
            }}
          >
            {error || "Student not found."}
          </p>

          <button
            onClick={() => navigate("/students")}
            style={primaryButtonStyle}
          >
            Back to Students
          </button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <header
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #eaecf0",
          padding: "18px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "13px",
              color: "#667085",
              marginBottom: "4px",
            }}
          >
            EduNexus AI
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: 700,
              color: "#101828",
            }}
          >
            Student 360
          </h1>
        </div>

        <button
          onClick={() => navigate("/students")}
          style={secondaryButtonStyle}
        >
          Back to Students
        </button>
      </header>

      <main
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "32px",
        }}
      >
        <section
          style={{
            background: "#ffffff",
            border: "1px solid #eaecf0",
            borderRadius: "16px",
            padding: "28px",
            marginBottom: "24px",
            boxShadow:
              "0 1px 2px rgba(16, 24, 40, 0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  color: "#667085",
                  fontSize: "13px",
                  marginBottom: "6px",
                }}
              >
                Admission Number
              </div>

              <div
                style={{
                  fontSize: "14px",
                  color: "#344054",
                  fontWeight: 600,
                  marginBottom: "14px",
                }}
              >
                {student.admission_number}
              </div>

              <h2
                style={{
                  margin: 0,
                  fontSize: "30px",
                  color: "#101828",
                }}
              >
                {student.first_name}{" "}
                {student.last_name || ""}
              </h2>
            </div>

            <div
              style={{
                background:
                  student.status === "ACTIVE"
                    ? "#ecfdf3"
                    : "#f2f4f7",
                color:
                  student.status === "ACTIVE"
                    ? "#027a48"
                    : "#475467",
                padding: "8px 14px",
                borderRadius: "999px",
                fontSize: "13px",
                fontWeight: 700,
              }}
            >
              {student.status}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "14px",
              marginTop: "26px",
            }}
          >
            <InfoItem
              label="Student ID"
              value={student.id}
            />

            <InfoItem
              label="Class"
              value={
                student.class_name || "—"
              }
            />

            <InfoItem
              label="Section"
              value={student.section || "—"}
            />

            <InfoItem
              label="Academic Year"
              value={
                student.academic_year || "—"
              }
            />

            <InfoItem
              label="Date of Birth"
              value={formatDate(
                student.date_of_birth
              )}
            />

            <InfoItem
              label="Gender"
              value={student.gender || "—"}
            />

            <InfoItem
              label="Admission Date"
              value={formatDate(
                student.admission_date
              )}
            />

            <InfoItem
              label="Phone"
              value={student.phone || "—"}
            />

            <InfoItem
              label="Address"
              value={student.address || "—"}
            />
          </div>
        </section>

        <section
          style={{
            marginBottom: "24px",
          }}
        >
          <div style={{ marginBottom: "16px" }}>
            <h2
              style={{
                margin: 0,
                fontSize: "21px",
                color: "#101828",
              }}
            >
              Attendance
            </h2>

            <p
              style={{
                margin: "6px 0 0",
                color: "#667085",
                fontSize: "14px",
              }}
            >
              Attendance summary and recent attendance history.
            </p>
          </div>

          {attendanceLoading ? (
            <div style={cardStyle}>
              Loading attendance...
            </div>
          ) : attendance ? (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(170px, 1fr))",
                  gap: "14px",
                  marginBottom: "16px",
                }}
              >
                <AttendanceCard
                  label="Attendance"
                  value={`${attendance.attendance_percentage}%`}
                />

                <AttendanceCard
                  label="Present"
                  value={attendance.present}
                />

                <AttendanceCard
                  label="Absent"
                  value={attendance.absent}
                />

                <AttendanceCard
                  label="Late"
                  value={attendance.late}
                />

                <AttendanceCard
                  label="Leave"
                  value={attendance.leave}
                />

                <AttendanceCard
                  label="Total Days"
                  value={attendance.total_days}
                />
              </div>

              <div style={cardStyle}>
                <h3
                  style={{
                    margin: "0 0 16px",
                    fontSize: "17px",
                    color: "#101828",
                  }}
                >
                  Attendance History
                </h3>

                {attendance.records?.length ? (
                  <div
                    style={{
                      overflowX: "auto",
                    }}
                  >
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        minWidth: "600px",
                      }}
                    >
                      <thead>
                        <tr>
                          <th style={tableHeaderStyle}>
                            Date
                          </th>

                          <th style={tableHeaderStyle}>
                            Status
                          </th>

                          <th style={tableHeaderStyle}>
                            Remarks
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {attendance.records.map(
                          (record) => (
                            <tr key={record.id}>
                              <td style={tableCellStyle}>
                                {formatDate(
                                  record.date
                                )}
                              </td>

                              <td style={tableCellStyle}>
                                <span
                                  style={{
                                    ...getStatusStyle(
                                      record.status
                                    ),
                                    display:
                                      "inline-block",
                                    padding:
                                      "5px 10px",
                                    borderRadius:
                                      "999px",
                                    fontSize:
                                      "12px",
                                    fontWeight: 700,
                                  }}
                                >
                                  {record.status}
                                </span>
                              </td>

                              <td
                                style={{
                                  ...tableCellStyle,
                                  color: "#667085",
                                }}
                              >
                                {record.remarks ||
                                  "—"}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "24px 0",
                      textAlign: "center",
                      color: "#667085",
                    }}
                  >
                    No attendance records found.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={cardStyle}>
              <div
                style={{
                  color: "#667085",
                  marginBottom: "12px",
                }}
              >
                Attendance information could not be loaded.
              </div>

              <button
                onClick={loadAttendance}
                style={primaryButtonStyle}
              >
                Retry Attendance
              </button>
            </div>
          )}
        </section>

        <section>
          <div style={{ marginBottom: "16px" }}>
            <h2
              style={{
                margin: 0,
                fontSize: "21px",
                color: "#101828",
              }}
            >
              Parents & Guardians
            </h2>

            <p
              style={{
                margin: "6px 0 0",
                color: "#667085",
                fontSize: "14px",
              }}
            >
              Family and guardian information linked to this student.
            </p>
          </div>

          {student.parents?.length ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "16px",
              }}
            >
              {student.parents.map((parent) => (
                <div
                  key={parent.relationship_id}
                  style={cardStyle}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "17px",
                        color: "#101828",
                      }}
                    >
                      {parent.parent_name}
                    </h3>

                    <span
                      style={{
                        background: "#eff8ff",
                        color: "#175cd3",
                        padding: "5px 9px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    >
                      {parent.relationship ||
                        "Guardian"}
                    </span>
                  </div>

                  <InfoItem
                    label="Phone"
                    value={parent.phone || "—"}
                  />

                  <InfoItem
                    label="Alternate Phone"
                    value={
                      parent.alternate_phone ||
                      "—"
                    }
                  />

                  <InfoItem
                    label="Email"
                    value={parent.email || "—"}
                  />

                  <InfoItem
                    label="Address"
                    value={
                      parent.address || "—"
                    }
                  />
                </div>
              ))}
            </div>
          ) : (
            <div style={cardStyle}>
              <div
                style={{
                  color: "#667085",
                }}
              >
                No parents or guardians are linked to this student.
              </div>
            </div>
          )}
        </section>
      </main>
    </PageShell>
  );
}

function PageShell({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
        color: "#101828",
      }}
    >
      {children}
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div
      style={{
        background: "#f9fafb",
        border: "1px solid #eaecf0",
        borderRadius: "10px",
        padding: "13px 14px",
        marginBottom: "10px",
      }}
    >
      <div
        style={{
          color: "#667085",
          fontSize: "12px",
          marginBottom: "5px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: "#344054",
          fontSize: "14px",
          fontWeight: 600,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function AttendanceCard({ label, value }) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #eaecf0",
        borderRadius: "12px",
        padding: "18px",
        boxShadow:
          "0 1px 2px rgba(16, 24, 40, 0.04)",
      }}
    >
      <div
        style={{
          color: "#667085",
          fontSize: "13px",
          marginBottom: "8px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          color: "#101828",
          fontSize: "26px",
          fontWeight: 700,
        }}
      >
        {value}
      </div>
    </div>
  );
}

const cardStyle = {
  background: "#ffffff",
  border: "1px solid #eaecf0",
  borderRadius: "12px",
  padding: "22px",
  boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
};

const loadingStyle = {
  maxWidth: "1400px",
  margin: "0 auto",
  padding: "60px 32px",
  color: "#667085",
};

const errorCardStyle = {
  maxWidth: "600px",
  margin: "80px auto",
  background: "#ffffff",
  border: "1px solid #eaecf0",
  borderRadius: "16px",
  padding: "32px",
  boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
};

const primaryButtonStyle = {
  border: "none",
  background: "#2563eb",
  color: "#ffffff",
  padding: "10px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: 600,
};

const secondaryButtonStyle = {
  border: "1px solid #d0d5dd",
  background: "#ffffff",
  color: "#344054",
  padding: "10px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: 600,
};

const tableHeaderStyle = {
  textAlign: "left",
  padding: "12px 14px",
  background: "#f9fafb",
  borderBottom: "1px solid #eaecf0",
  color: "#667085",
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const tableCellStyle = {
  padding: "13px 14px",
  borderBottom: "1px solid #f2f4f7",
  color: "#344054",
  fontSize: "14px",
};

export default Student360;
