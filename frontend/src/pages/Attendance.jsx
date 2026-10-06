import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/axios";

const STATUS_OPTIONS = [
  "PRESENT",
  "ABSENT",
  "LATE",
  "LEAVE",
];

/*
 * Convert different API response formats into arrays.
 *
 * Supported:
 * [
 *   ...
 * ]
 *
 * {
 *   items: [...]
 * }
 *
 * {
 *   students: [...]
 * }
 *
 * {
 *   data: [...]
 * }
 *
 * {
 *   results: [...]
 * }
 */
function normalizeArray(data, preferredKeys = []) {
  if (Array.isArray(data)) {
    return data;
  }

  for (const key of preferredKeys) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
}

function getToday() {
  const today = new Date();

  const year = today.getFullYear();

  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    today.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function Attendance() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [remarks, setRemarks] = useState({});

  const [attendanceDate, setAttendanceDate] =
    useState(getToday());

  const [classFilter, setClassFilter] =
    useState("");

  const [sectionFilter, setSectionFilter] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [historyStudent, setHistoryStudent] =
    useState(null);

  const [historyLoading, setHistoryLoading] =
    useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [attendanceDate]);

  async function loadStudents() {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/students");

      console.log(
        "Attendance - Students API response:",
        response.data
      );

      const studentList =
        normalizeArray(response.data, [
          "students",
          "items",
        ]);

      console.log(
        "Attendance - Normalized students:",
        studentList
      );

      setStudents(studentList);
    } catch (err) {
      console.error(
        "Attendance - students loading error:",
        err
      );

      setStudents([]);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Unable to load students."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadAttendance() {
    try {
      setError("");

      const response =
        await api.get("/attendance", {
          params: {
            attendance_date:
              attendanceDate,
          },
        });

      console.log(
        "Attendance API response:",
        response.data
      );

      const attendanceRecords =
        normalizeArray(response.data, [
          "attendance",
          "records",
          "items",
          "data",
          "results",
        ]);

      console.log(
        "Normalized attendance records:",
        attendanceRecords
      );

      const attendanceMap = {};
      const remarksMap = {};

      attendanceRecords.forEach(
        (record) => {
          if (
            !record ||
            typeof record !== "object"
          ) {
            return;
          }

          if (
            record.student_id !==
            undefined
          ) {
            attendanceMap[
              record.student_id
            ] = record.status;

            remarksMap[
              record.student_id
            ] = record.remarks || "";
          }
        }
      );

      setAttendance(attendanceMap);
      setRemarks(remarksMap);
    } catch (err) {
      console.error(
        "Attendance loading error:",
        err
      );

      /*
       * If attendance endpoint does not have
       * records for the selected date, don't
       * destroy the student list.
       */
      if (
        err.response?.status !== 404
      ) {
        setError(
          err.response?.data?.detail ||
            err.response?.data?.message ||
            "Unable to load attendance."
        );
      }

      setAttendance({});
      setRemarks({});
    }
  }

  /*
   * Extra safety:
   * students should always be an array.
   */
  const safeStudents = Array.isArray(
    students
  )
    ? students
    : [];

  const classOptions = useMemo(() => {
    return [
      ...new Set(
        safeStudents
          .map(
            (student) =>
              student?.class_name
          )
          .filter(Boolean)
      ),
    ].sort();
  }, [safeStudents]);

  const sectionOptions = useMemo(() => {
    return [
      ...new Set(
        safeStudents
          .filter(
            (student) =>
              !classFilter ||
              student?.class_name ===
                classFilter
          )
          .map(
            (student) =>
              student?.section
          )
          .filter(Boolean)
      ),
    ].sort();
  }, [
    safeStudents,
    classFilter,
  ]);

  const filteredStudents = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return safeStudents.filter(
      (student) => {
        if (
          !student ||
          typeof student !== "object"
        ) {
          return false;
        }

        const matchesClass =
          !classFilter ||
          student.class_name ===
            classFilter;

        const matchesSection =
          !sectionFilter ||
          student.section ===
            sectionFilter;

        const fullName = [
          student.first_name,
          student.middle_name,
          student.last_name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          !searchValue ||
          fullName.includes(
            searchValue
          ) ||
          String(
            student.admission_number ||
              ""
          )
            .toLowerCase()
            .includes(searchValue);

        return (
          matchesClass &&
          matchesSection &&
          matchesSearch
        );
      }
    );
  }, [
    safeStudents,
    classFilter,
    sectionFilter,
    search,
  ]);

  const summary = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let leave = 0;
    let unmarked = 0;

    filteredStudents.forEach(
      (student) => {
        const status =
          attendance[student.id];

        if (status === "PRESENT") {
          present++;
        } else if (
          status === "ABSENT"
        ) {
          absent++;
        } else if (
          status === "LATE"
        ) {
          late++;
        } else if (
          status === "LEAVE"
        ) {
          leave++;
        } else {
          unmarked++;
        }
      }
    );

    const total =
      filteredStudents.length;

    const attendancePercentage =
      total > 0
        ? Math.round(
            ((present + late) /
              total) *
              100
          )
        : 0;

    return {
      total,
      present,
      absent,
      late,
      leave,
      unmarked,
      attendancePercentage,
    };
  }, [
    filteredStudents,
    attendance,
  ]);

  function setStudentStatus(
    studentId,
    status
  ) {
    setAttendance((current) => ({
      ...current,
      [studentId]: status,
    }));
  }

  function setStudentRemarks(
    studentId,
    value
  ) {
    setRemarks((current) => ({
      ...current,
      [studentId]: value,
    }));
  }

  function markAll(status) {
    const updated = {
      ...attendance,
    };

    filteredStudents.forEach(
      (student) => {
        updated[student.id] =
          status;
      }
    );

    setAttendance(updated);
  }

  async function saveAttendance() {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const records =
        filteredStudents
          .filter(
            (student) =>
              attendance[
                student.id
              ]
          )
          .map((student) => ({
            student_id: student.id,
            status:
              attendance[
                student.id
              ],
            remarks:
              remarks[
                student.id
              ] || null,
          }));

      if (!records.length) {
        setError(
          "Please mark attendance for at least one student."
        );

        return;
      }

      const response =
        await api.post(
          "/attendance/bulk",
          {
            attendance_date:
              attendanceDate,
            records,
          }
        );

      setMessage(
        response.data?.message ||
          "Attendance saved successfully."
      );

      await loadAttendance();
    } catch (err) {
      console.error(
        "Save attendance error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Unable to save attendance."
      );
    } finally {
      setSaving(false);
    }
  }

  async function openHistory(student) {
    try {
      setHistoryLoading(true);

      setHistoryStudent({
        ...student,
        history: null,
      });

      const response =
        await api.get(
          `/attendance/student/${student.id}`
        );

      console.log(
        "Attendance history response:",
        response.data
      );

      const historyData =
        response.data || {};

      const historyRecords =
        normalizeArray(historyData, [
          "records",
          "attendance",
          "items",
          "data",
        ]);

      setHistoryStudent({
        ...student,
        history: {
          ...historyData,
          records:
            historyRecords,
        },
      });
    } catch (err) {
      console.error(
        "Attendance history error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Unable to load attendance history."
      );

      setHistoryStudent(null);
    } finally {
      setHistoryLoading(false);
    }
  }

  function closeHistory() {
    setHistoryStudent(null);
  }

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={centerStyle}>
          Loading attendance...
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={contentStyle}>
        <div style={topBarStyle}>
          <div>
            <button
              onClick={() =>
                navigate(
                  "/owner-dashboard"
                )
              }
              style={backButtonStyle}
            >
              ← Back to Dashboard
            </button>

            <div
              style={{
                marginTop: "16px",
              }}
            >
              <div style={eyebrowStyle}>
                EDUNEXUS AI
              </div>

              <h1 style={titleStyle}>
                Attendance Management
              </h1>

              <p style={subtitleStyle}>
                Mark, review and manage
                student attendance from one
                page.
              </p>
            </div>
          </div>

          <div style={dateBoxStyle}>
            <label style={labelStyle}>
              Attendance Date
            </label>

            <input
              type="date"
              value={attendanceDate}
              onChange={(event) =>
                setAttendanceDate(
                  event.target.value
                )
              }
              style={dateInputStyle}
            />
          </div>
        </div>

        {message && (
          <div style={successStyle}>
            {message}
          </div>
        )}

        {error && (
          <div style={errorStyle}>
            {error}
          </div>
        )}

        <div style={summaryGridStyle}>
          <SummaryCard
            title="Students"
            value={summary.total}
            description="Filtered students"
          />

          <SummaryCard
            title="Present"
            value={summary.present}
            description="Present today"
          />

          <SummaryCard
            title="Absent"
            value={summary.absent}
            description="Absent today"
          />

          <SummaryCard
            title="Late"
            value={summary.late}
            description="Late today"
          />

          <SummaryCard
            title="Leave"
            value={summary.leave}
            description="On leave"
          />

          <SummaryCard
            title="Attendance"
            value={`${summary.attendancePercentage}%`}
            description="Present + late"
          />
        </div>

        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <div>
              <h2 style={sectionTitleStyle}>
                Attendance Register
              </h2>

              <p
                style={
                  sectionDescriptionStyle
                }
              >
                Filter students and mark their
                attendance for the selected date.
              </p>
            </div>

            <div style={actionGroupStyle}>
              <button
                onClick={() =>
                  markAll("PRESENT")
                }
                style={secondaryButtonStyle}
              >
                Mark All Present
              </button>

              <button
                onClick={() =>
                  markAll("ABSENT")
                }
                style={secondaryButtonStyle}
              >
                Mark All Absent
              </button>

              <button
                onClick={saveAttendance}
                disabled={saving}
                style={primaryButtonStyle}
              >
                {saving
                  ? "Saving..."
                  : "Save Attendance"}
              </button>
            </div>
          </div>

          <div style={filterGridStyle}>
            <div>
              <label style={labelStyle}>
                Search Student
              </label>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Name or admission number"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>
                Class
              </label>

              <select
                value={classFilter}
                onChange={(event) => {
                  setClassFilter(
                    event.target.value
                  );

                  setSectionFilter("");
                }}
                style={inputStyle}
              >
                <option value="">
                  All Classes
                </option>

                {classOptions.map(
                  (className) => (
                    <option
                      key={className}
                      value={className}
                    >
                      {className}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label style={labelStyle}>
                Section
              </label>

              <select
                value={sectionFilter}
                onChange={(event) =>
                  setSectionFilter(
                    event.target.value
                  )
                }
                style={inputStyle}
              >
                <option value="">
                  All Sections
                </option>

                {sectionOptions.map(
                  (section) => (
                    <option
                      key={section}
                      value={section}
                    >
                      {section}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <div style={tableWrapperStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>
                    Student
                  </th>

                  <th style={thStyle}>
                    Admission No.
                  </th>

                  <th style={thStyle}>
                    Class
                  </th>

                  <th style={thStyle}>
                    Attendance
                  </th>

                  <th style={thStyle}>
                    Remarks
                  </th>

                  <th style={thStyle}>
                    History
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      style={emptyCellStyle}
                    >
                      No students found.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(
                    (student) => (
                      <tr
                        key={student.id}
                      >
                        <td style={tdStyle}>
                          <div
                            style={
                              studentNameStyle
                            }
                          >
                            {[
                              student.first_name,
                              student.middle_name,
                              student.last_name,
                            ]
                              .filter(Boolean)
                              .join(" ") ||
                              student.name ||
                              student.student_name ||
                              "N/A"}
                          </div>

                          <div
                            style={
                              studentSubStyle
                            }
                          >
                            Student ID:{" "}
                            {student.id}
                          </div>
                        </td>

                        <td style={tdStyle}>
                          {student.admission_number ||
                            "—"}
                        </td>

                        <td style={tdStyle}>
                          {student.class_name ||
                            "—"}

                          {student.section
                            ? ` - ${student.section}`
                            : ""}
                        </td>

                        <td style={tdStyle}>
                          <div
                            style={
                              statusGroupStyle
                            }
                          >
                            {STATUS_OPTIONS.map(
                              (status) => (
                                <button
                                  key={status}
                                  onClick={() =>
                                    setStudentStatus(
                                      student.id,
                                      status
                                    )
                                  }
                                  style={{
                                    ...statusButtonStyle,
                                    ...(attendance[
                                      student.id
                                    ] ===
                                    status
                                      ? getStatusActiveStyle(
                                          status
                                        )
                                      : {}),
                                  }}
                                >
                                  {status}
                                </button>
                              )
                            )}
                          </div>
                        </td>

                        <td style={tdStyle}>
                          <input
                            type="text"
                            value={
                              remarks[
                                student.id
                              ] || ""
                            }
                            onChange={(event) =>
                              setStudentRemarks(
                                student.id,
                                event.target.value
                              )
                            }
                            placeholder="Optional"
                            style={
                              remarksInputStyle
                            }
                          />
                        </td>

                        <td style={tdStyle}>
                          <button
                            onClick={() =>
                              openHistory(
                                student
                              )
                            }
                            style={
                              historyButtonStyle
                            }
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>

          <div style={footerActionStyle}>
            <span style={footerTextStyle}>
              {summary.unmarked} students
              remain unmarked.
            </span>

            <button
              onClick={saveAttendance}
              disabled={saving}
              style={primaryButtonStyle}
            >
              {saving
                ? "Saving..."
                : "Save Attendance"}
            </button>
          </div>
        </section>
      </div>

      {historyStudent && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <div
              style={modalHeaderStyle}
            >
              <div>
                <h2
                  style={
                    modalTitleStyle
                  }
                >
                  {[
                    historyStudent.first_name,
                    historyStudent.middle_name,
                    historyStudent.last_name,
                  ]
                    .filter(Boolean)
                    .join(" ") ||
                    historyStudent.name ||
                    historyStudent.student_name ||
                    "Student"}
                </h2>

                <p
                  style={
                    modalSubtitleStyle
                  }
                >
                  Attendance history
                </p>
              </div>

              <button
                onClick={closeHistory}
                style={closeButtonStyle}
              >
                ×
              </button>
            </div>

            {historyLoading ||
            !historyStudent.history ? (
              <div style={modalLoadingStyle}>
                Loading history...
              </div>
            ) : (
              <>
                <div
                  style={
                    historySummaryGridStyle
                  }
                >
                  <HistoryStat
                    label="Attendance"
                    value={`${historyStudent.history.attendance_percentage ?? 0}%`}
                  />

                  <HistoryStat
                    label="Present"
                    value={
                      historyStudent.history
                        .present ?? 0
                    }
                  />

                  <HistoryStat
                    label="Absent"
                    value={
                      historyStudent.history
                        .absent ?? 0
                    }
                  />

                  <HistoryStat
                    label="Late"
                    value={
                      historyStudent.history
                        .late ?? 0
                    }
                  />

                  <HistoryStat
                    label="Leave"
                    value={
                      historyStudent.history
                        .leave ?? 0
                    }
                  />
                </div>

                <div
                  style={
                    historyTableWrapperStyle
                  }
                >
                  <table
                    style={tableStyle}
                  >
                    <thead>
                      <tr>
                        <th
                          style={thStyle}
                        >
                          Date
                        </th>

                        <th
                          style={thStyle}
                        >
                          Status
                        </th>

                        <th
                          style={thStyle}
                        >
                          Remarks
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {!Array.isArray(
                        historyStudent
                          .history
                          .records
                      ) ||
                      historyStudent.history
                        .records.length ===
                        0 ? (
                        <tr>
                          <td
                            colSpan="3"
                            style={
                              emptyCellStyle
                            }
                          >
                            No attendance
                            history yet.
                          </td>
                        </tr>
                      ) : (
                        historyStudent.history.records.map(
                          (
                            record,
                            index
                          ) => (
                            <tr
                              key={
                                record.id ??
                                `${record.date}-${index}`
                              }
                            >
                              <td
                                style={
                                  tdStyle
                                }
                              >
                                {record.date ||
                                  record.attendance_date ||
                                  "—"}
                              </td>

                              <td
                                style={
                                  tdStyle
                                }
                              >
                                <span
                                  style={getHistoryStatusStyle(
                                    record.status
                                  )}
                                >
                                  {
                                    record.status
                                  }
                                </span>
                              </td>

                              <td
                                style={
                                  tdStyle
                                }
                              >
                                {record.remarks ||
                                  "—"}
                              </td>
                            </tr>
                          )
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
}) {
  return (
    <div style={summaryCardStyle}>
      <div style={summaryTitleStyle}>
        {title}
      </div>

      <div style={summaryValueStyle}>
        {value}
      </div>

      <div
        style={
          summaryDescriptionStyle
        }
      >
        {description}
      </div>
    </div>
  );
}

function HistoryStat({
  label,
  value,
}) {
  return (
    <div style={historyStatStyle}>
      <div
        style={
          historyStatLabelStyle
        }
      >
        {label}
      </div>

      <div
        style={
          historyStatValueStyle
        }
      >
        {value}
      </div>
    </div>
  );
}

function getStatusActiveStyle(
  status
) {
  if (status === "PRESENT") {
    return {
      background: "#dcfce7",
      color: "#166534",
      borderColor: "#86efac",
    };
  }

  if (status === "ABSENT") {
    return {
      background: "#fee2e2",
      color: "#991b1b",
      borderColor: "#fca5a5",
    };
  }

  if (status === "LATE") {
    return {
      background: "#fef3c7",
      color: "#92400e",
      borderColor: "#fcd34d",
    };
  }

  return {
    background: "#e0e7ff",
    color: "#3730a3",
    borderColor: "#a5b4fc",
  };
}

function getHistoryStatusStyle(
  status
) {
  return {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 700,
    ...getStatusActiveStyle(status),
  };
}

const pageStyle = {
  minHeight: "100vh",
  background: "#f1f5f9",
  padding: "32px",
  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
};

const contentStyle = {
  maxWidth: "1500px",
  margin: "0 auto",
};

const topBarStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "24px",
  flexWrap: "wrap",
  marginBottom: "26px",
};

const backButtonStyle = {
  border: "none",
  background: "transparent",
  color: "#475569",
  cursor: "pointer",
  padding: 0,
  fontSize: "14px",
  fontWeight: 600,
};

const eyebrowStyle = {
  marginTop: "4px",
  color: "#64748b",
  fontSize: "13px",
  fontWeight: 700,
  letterSpacing: "0.08em",
};

const titleStyle = {
  margin: "6px 0 0",
  color: "#0f172a",
  fontSize: "32px",
  fontWeight: 800,
};

const subtitleStyle = {
  margin: "7px 0 0",
  color: "#64748b",
};

const dateBoxStyle = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  padding: "16px",
  minWidth: "220px",
};

const labelStyle = {
  display: "block",
  color: "#64748b",
  fontSize: "12px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  marginBottom: "7px",
};

const dateInputStyle = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  padding: "10px",
  fontSize: "14px",
};

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(160px, 1fr))",
  gap: "14px",
  marginBottom: "22px",
};

const summaryCardStyle = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  padding: "18px",
};

const summaryTitleStyle = {
  color: "#64748b",
  fontSize: "13px",
  fontWeight: 700,
};

const summaryValueStyle = {
  marginTop: "8px",
  color: "#0f172a",
  fontSize: "28px",
  fontWeight: 800,
};

const summaryDescriptionStyle = {
  marginTop: "3px",
  color: "#94a3b8",
  fontSize: "12px",
};

const sectionStyle = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "24px",
  boxShadow:
    "0 4px 12px rgba(15, 23, 42, 0.04)",
};

const sectionHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "20px",
  flexWrap: "wrap",
  marginBottom: "22px",
};

const sectionTitleStyle = {
  margin: 0,
  color: "#0f172a",
  fontSize: "20px",
};

const sectionDescriptionStyle = {
  margin: "6px 0 0",
  color: "#64748b",
  fontSize: "14px",
};

const actionGroupStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
};

const primaryButtonStyle = {
  border: "none",
  background: "#2563eb",
  color: "#ffffff",
  borderRadius: "8px",
  padding: "10px 15px",
  cursor: "pointer",
  fontWeight: 700,
};

const secondaryButtonStyle = {
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#334155",
  borderRadius: "8px",
  padding: "10px 13px",
  cursor: "pointer",
  fontWeight: 600,
};

const filterGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "14px",
  marginBottom: "22px",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  padding: "10px 11px",
  fontSize: "14px",
  background: "#ffffff",
};

const tableWrapperStyle = {
  overflowX: "auto",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "1050px",
};

const thStyle = {
  textAlign: "left",
  padding: "13px 14px",
  background: "#f8fafc",
  color: "#64748b",
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  borderBottom:
    "1px solid #e2e8f0",
};

const tdStyle = {
  padding: "14px",
  borderBottom:
    "1px solid #eef2f7",
  color: "#334155",
  fontSize: "14px",
  verticalAlign: "middle",
};

const studentNameStyle = {
  color: "#0f172a",
  fontWeight: 700,
};

const studentSubStyle = {
  marginTop: "4px",
  color: "#94a3b8",
  fontSize: "12px",
};

const statusGroupStyle = {
  display: "flex",
  gap: "5px",
  flexWrap: "wrap",
};

const statusButtonStyle = {
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#64748b",
  borderRadius: "6px",
  padding: "6px 8px",
  cursor: "pointer",
  fontSize: "11px",
  fontWeight: 700,
};

const remarksInputStyle = {
  width: "150px",
  border: "1px solid #cbd5e1",
  borderRadius: "7px",
  padding: "8px",
  fontSize: "13px",
};

const historyButtonStyle = {
  border: "1px solid #bfdbfe",
  background: "#eff6ff",
  color: "#1d4ed8",
  borderRadius: "7px",
  padding: "7px 11px",
  cursor: "pointer",
  fontWeight: 700,
};

const emptyCellStyle = {
  padding: "40px",
  textAlign: "center",
  color: "#64748b",
};

const footerActionStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  marginTop: "18px",
  flexWrap: "wrap",
};

const footerTextStyle = {
  color: "#64748b",
  fontSize: "13px",
};

const successStyle = {
  marginBottom: "18px",
  background: "#f0fdf4",
  border: "1px solid #bbf7d0",
  color: "#166534",
  padding: "13px 16px",
  borderRadius: "10px",
};

const errorStyle = {
  marginBottom: "18px",
  background: "#fef2f2",
  border: "1px solid #fecaca",
  color: "#991b1b",
  padding: "13px 16px",
  borderRadius: "10px",
};

const centerStyle = {
  minHeight: "70vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#64748b",
};

const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  background:
    "rgba(15, 23, 42, 0.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  zIndex: 1000,
};

const modalStyle = {
  width: "min(900px, 100%)",
  maxHeight: "90vh",
  overflowY: "auto",
  background: "#ffffff",
  borderRadius: "16px",
  padding: "24px",
  boxShadow:
    "0 20px 50px rgba(15, 23, 42, 0.25)",
};

const modalHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
  marginBottom: "20px",
};

const modalTitleStyle = {
  margin: 0,
  color: "#0f172a",
};

const modalSubtitleStyle = {
  margin: "5px 0 0",
  color: "#64748b",
};

const closeButtonStyle = {
  border: "none",
  background: "#f1f5f9",
  width: "34px",
  height: "34px",
  borderRadius: "50%",
  fontSize: "22px",
  cursor: "pointer",
  color: "#475569",
};

const historySummaryGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(120px, 1fr))",
  gap: "10px",
  marginBottom: "20px",
};

const historyStatStyle = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  padding: "14px",
};

const historyStatLabelStyle = {
  color: "#64748b",
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase",
};

const historyStatValueStyle = {
  marginTop: "5px",
  color: "#0f172a",
  fontSize: "20px",
  fontWeight: 800,
};

const historyTableWrapperStyle = {
  overflowX: "auto",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
};

const modalLoadingStyle = {
  padding: "50px",
  textAlign: "center",
  color: "#64748b",
};

export default Attendance;