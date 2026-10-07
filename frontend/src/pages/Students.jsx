import React, { useEffect, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:8000"
    : "https://edunexus-ai-backend-xtct.onrender.com");

const emptyStudentForm = {
  admission_number: "",
  first_name: "",
  last_name: "",
  date_of_birth: "",
  gender: "",
  phone: "",
  address: "",
  class_name: "",
  section: "",
  academic_year: "",
  admission_date: "",
  status: "ACTIVE",
};

function normalizeStudents(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.students)) {
    return data.students;
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
    student.class ||
    student.grade ||
    "—"
  );
}

function getStatusStyle(status) {
  const value = String(status || "").toUpperCase();

  if (value === "ACTIVE" || value === "ENROLLED") {
    return {
      background: "#dcfce7",
      color: "#166534",
    };
  }

  if (
    value === "INACTIVE" ||
    value === "ARCHIVED" ||
    value === "LEFT"
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

export default function Students() {
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);

  const [saving, setSaving] = useState(false);

  const [formError, setFormError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const [form, setForm] = useState(emptyStudentForm);

  async function loadStudents() {
    try {
      setLoading(true);
      setError("");

      const accessToken =
        localStorage.getItem("access_token") ||
        localStorage.getItem("token") ||
        "";

      const response = await fetch(
        `${API_BASE_URL}/students`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            ...(accessToken
              ? {
                  Authorization: `Bearer ${accessToken}`,
                }
              : {}),
          },
        }
      );

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
        let message =
          `Failed to load students (${response.status})`;

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

      const normalizedStudents =
        normalizeStudents(data);

      console.log(
        "Normalized students:",
        normalizedStudents
      );

      setStudents(normalizedStudents);
    } catch (err) {
      console.error(
        "Students loading error:",
        err
      );

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

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setFormError("");
    setSuccessMessage("");
  }

  function openAddForm() {
    setForm(emptyStudentForm);
    setFormError("");
    setSuccessMessage("");
    setShowAddForm(true);
  }

  function closeAddForm() {
    if (saving) {
      return;
    }

    setShowAddForm(false);
    setForm(emptyStudentForm);
    setFormError("");
  }

  async function handleCreateStudent(event) {
    event.preventDefault();

    setFormError("");
    setSuccessMessage("");

    if (!form.admission_number.trim()) {
      setFormError("Admission number is required.");
      return;
    }

    if (!form.first_name.trim()) {
      setFormError("First name is required.");
      return;
    }

    try {
      setSaving(true);

      const accessToken =
        localStorage.getItem("access_token") ||
        localStorage.getItem("token") ||
        "";

      const payload = {
        admission_number:
          form.admission_number.trim(),

        first_name:
          form.first_name.trim(),

        last_name:
          form.last_name.trim() || null,

        date_of_birth:
          form.date_of_birth || null,

        gender:
          form.gender || null,

        phone:
          form.phone.trim() || null,

        address:
          form.address.trim() || null,

        class_name:
          form.class_name.trim() || null,

        section:
          form.section.trim() || null,

        academic_year:
          form.academic_year.trim() || null,

        admission_date:
          form.admission_date || null,

        status:
          form.status || "ACTIVE",
      };

      console.log(
        "Creating student:",
        payload
      );

      const response = await fetch(
        `${API_BASE_URL}/students`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(accessToken
              ? {
                  Authorization: `Bearer ${accessToken}`,
                }
              : {}),
          },
          body: JSON.stringify(payload),
        }
      );

      const responseData =
        await response.json().catch(() => null);

      if (response.status === 401) {
        throw new Error(
          "Your session has expired. Please login again."
        );
      }

      if (response.status === 403) {
        throw new Error(
          "You do not have permission to create students."
        );
      }

      if (!response.ok) {
        const message =
          responseData?.detail ||
          responseData?.message ||
          `Failed to create student (${response.status})`;

        throw new Error(message);
      }

      console.log(
        "Student created:",
        responseData
      );

      setSuccessMessage(
        "Student created successfully."
      );

      setForm(emptyStudentForm);

      await loadStudents();

      setTimeout(() => {
        setShowAddForm(false);
        setSuccessMessage("");
      }, 800);
    } catch (err) {
      console.error(
        "Create student error:",
        err
      );

      setFormError(
        err?.message ||
          "Unable to create student."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "32px",
        boxSizing: "border-box",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "20px",
          marginBottom: "28px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: "13px",
              fontWeight: 700,
              color: "#2563eb",
              letterSpacing: "0.08em",
            }}
          >
            EDUNEXUS AI
          </p>

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
            Manage student records and enrollment
            information.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <button
            type="button"
            onClick={loadStudents}
            disabled={loading}
            style={{
              border: "1px solid #cbd5e1",
              borderRadius: "10px",
              background: "#ffffff",
              color: "#334155",
              padding: "13px 20px",
              fontSize: "15px",
              fontWeight: 600,
              cursor: loading
                ? "not-allowed"
                : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>

          <button
            type="button"
            onClick={openAddForm}
            style={{
              border: "none",
              borderRadius: "10px",
              background: "#2563eb",
              color: "#ffffff",
              padding: "13px 22px",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow:
                "0 4px 12px rgba(37, 99, 235, 0.2)",
            }}
          >
            + Add Student
          </button>
        </div>
      </div>

      {/* PAGE ERROR */}

      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#b91c1c",
            borderRadius: "10px",
            padding: "18px",
            marginBottom: "24px",
            fontSize: "16px",
            border: "1px solid #fecaca",
          }}
        >
          {error}
        </div>
      )}

      {/* LOADING */}

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
          Loading students...
        </div>
      )}

      {/* STUDENT LIST */}

      {!loading && (
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
              borderBottom:
                "1px solid #e2e8f0",
              background: "#f8fafc",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
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

            {students.length > 0 && (
              <span
                style={{
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                Student records
              </span>
            )}
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
                  fontSize: "46px",
                  marginBottom: "15px",
                }}
              >
                🎓
              </div>

              <div
                style={{
                  fontSize: "22px",
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
                  marginBottom: "20px",
                }}
              >
                Add your first student to begin
                managing student records.
              </div>

              <button
                type="button"
                onClick={openAddForm}
                style={{
                  border: "none",
                  borderRadius: "9px",
                  background: "#2563eb",
                  color: "#ffffff",
                  padding: "12px 20px",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                + Add First Student
              </button>
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
                  borderCollapse:
                    "collapse",
                  minWidth: "950px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background:
                        "#f1f5f9",
                    }}
                  >
                    <th style={tableHeaderStyle}>
                      ID
                    </th>

                    <th style={tableHeaderStyle}>
                      Student
                    </th>

                    <th style={tableHeaderStyle}>
                      Admission No.
                    </th>

                    <th style={tableHeaderStyle}>
                      Class
                    </th>

                    <th style={tableHeaderStyle}>
                      Section
                    </th>

                    <th style={tableHeaderStyle}>
                      Phone
                    </th>

                    <th style={tableHeaderStyle}>
                      Academic Year
                    </th>

                    <th style={tableHeaderStyle}>
                      Status
                    </th>

                    <th style={tableHeaderStyle}>
                      Admission Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {students.map(
                    (student) => (
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
                            {getStudentName(
                              student
                            )}
                          </div>

                          {student.gender && (
                            <div
                              style={{
                                marginTop:
                                  "4px",
                                color:
                                  "#64748b",
                                fontSize:
                                  "12px",
                              }}
                            >
                              {student.gender}
                            </div>
                          )}
                        </td>

                        <td style={tableCellStyle}>
                          {student.admission_number ||
                            "—"}
                        </td>

                        <td style={tableCellStyle}>
                          {student.class_name ||
                            "—"}
                        </td>

                        <td style={tableCellStyle}>
                          {student.section ||
                            "—"}
                        </td>

                        <td style={tableCellStyle}>
                          {student.phone ||
                            "—"}
                        </td>

                        <td style={tableCellStyle}>
                          {student.academic_year ||
                            "—"}
                        </td>

                        <td style={tableCellStyle}>
                          <span
                            style={{
                              display:
                                "inline-block",
                              padding:
                                "6px 11px",
                              borderRadius:
                                "999px",
                              fontSize:
                                "12px",
                              fontWeight: 700,
                              ...getStatusStyle(
                                student.status
                              ),
                            }}
                          >
                            {student.status ||
                              "ACTIVE"}
                          </span>
                        </td>

                        <td style={tableCellStyle}>
                          {formatDate(
                            student.admission_date
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ADD STUDENT MODAL */}

      {showAddForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(15, 23, 42, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "850px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#ffffff",
              borderRadius: "16px",
              boxShadow:
                "0 25px 60px rgba(15, 23, 42, 0.25)",
            }}
          >
            {/* FORM HEADER */}

            <div
              style={{
                padding: "22px 26px",
                borderBottom:
                  "1px solid #e2e8f0",
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                gap: "20px",
                position: "sticky",
                top: 0,
                background: "#ffffff",
                zIndex: 2,
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    color: "#0f172a",
                    fontSize: "24px",
                  }}
                >
                  Add Student
                </h2>

                <p
                  style={{
                    margin:
                      "6px 0 0",
                    color: "#64748b",
                    fontSize:
                      "14px",
                  }}
                >
                  Create a new student
                  record.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAddForm}
                disabled={saving}
                style={{
                  width: "36px",
                  height: "36px",
                  border: "none",
                  borderRadius:
                    "8px",
                  background:
                    "#f1f5f9",
                  color: "#334155",
                  fontSize: "22px",
                  cursor: saving
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                ×
              </button>
            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleCreateStudent
              }
              style={{
                padding: "26px",
              }}
            >
              {formError && (
                <div
                  style={{
                    marginBottom:
                      "18px",
                    padding: "14px 16px",
                    borderRadius: "9px",
                    background:
                      "#fee2e2",
                    color:
                      "#b91c1c",
                    border:
                      "1px solid #fecaca",
                    fontSize: "14px",
                  }}
                >
                  {formError}
                </div>
              )}

              {successMessage && (
                <div
                  style={{
                    marginBottom:
                      "18px",
                    padding: "14px 16px",
                    borderRadius: "9px",
                    background:
                      "#dcfce7",
                    color:
                      "#166534",
                    border:
                      "1px solid #bbf7d0",
                    fontSize: "14px",
                  }}
                >
                  {successMessage}
                </div>
              )}

              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(2, minmax(0, 1fr))",
                  gap: "18px",
                }}
              >
                {/* Admission Number */}

                <FormField
                  label="Admission Number"
                  required
                >
                  <input
                    type="text"
                    name="admission_number"
                    value={
                      form.admission_number
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="e.g. ADM-001"
                    required
                    style={
                      inputStyle
                    }
                  />
                </FormField>

                {/* First Name */}

                <FormField
                  label="First Name"
                  required
                >
                  <input
                    type="text"
                    name="first_name"
                    value={
                      form.first_name
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="First name"
                    required
                    style={
                      inputStyle
                    }
                  />
                </FormField>

                {/* Last Name */}

                <FormField
                  label="Last Name"
                >
                  <input
                    type="text"
                    name="last_name"
                    value={
                      form.last_name
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="Last name"
                    style={
                      inputStyle
                    }
                  />
                </FormField>

                {/* Gender */}

                <FormField
                  label="Gender"
                >
                  <select
                    name="gender"
                    value={
                      form.gender
                    }
                    onChange={
                      handleFormChange
                    }
                    style={
                      inputStyle
                    }
                  >
                    <option value="">
                      Select gender
                    </option>

                    <option value="MALE">
                      Male
                    </option>

                    <option value="FEMALE">
                      Female
                    </option>

                    <option value="OTHER">
                      Other
                    </option>
                  </select>
                </FormField>

                {/* Date of Birth */}

                <FormField
                  label="Date of Birth"
                >
                  <input
                    type="date"
                    name="date_of_birth"
                    value={
                      form.date_of_birth
                    }
                    onChange={
                      handleFormChange
                    }
                    style={
                      inputStyle
                    }
                  />
                </FormField>

                {/* Phone */}

                <FormField
                  label="Phone"
                >
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={
                      handleFormChange
                    }
                    placeholder="Phone number"
                    style={
                      inputStyle
                    }
                  />
                </FormField>

                {/* Class */}

                <FormField
                  label="Class"
                >
                  <input
                    type="text"
                    name="class_name"
                    value={
                      form.class_name
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="e.g. Class 10"
                    style={
                      inputStyle
                    }
                  />
                </FormField>

                {/* Section */}

                <FormField
                  label="Section"
                >
                  <input
                    type="text"
                    name="section"
                    value={
                      form.section
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="e.g. A"
                    style={
                      inputStyle
                    }
                  />
                </FormField>

                {/* Academic Year */}

                <FormField
                  label="Academic Year"
                >
                  <input
                    type="text"
                    name="academic_year"
                    value={
                      form.academic_year
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="e.g. 2082"
                    style={
                      inputStyle
                    }
                  />
                </FormField>

                {/* Admission Date */}

                <FormField
                  label="Admission Date"
                >
                  <input
                    type="date"
                    name="admission_date"
                    value={
                      form.admission_date
                    }
                    onChange={
                      handleFormChange
                    }
                    style={
                      inputStyle
                    }
                  />
                </FormField>

                {/* Status */}

                <FormField
                  label="Status"
                >
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
                    <option value="ACTIVE">
                      Active
                    </option>

                    <option value="INACTIVE">
                      Inactive
                    </option>
                  </select>
                </FormField>

                {/* Address */}

                <div
                  style={{
                    gridColumn:
                      "1 / -1",
                  }}
                >
                  <FormField
                    label="Address"
                  >
                    <textarea
                      name="address"
                      value={
                        form.address
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="Student address"
                      rows={4}
                      style={{
                        ...inputStyle,
                        resize: "vertical",
                      }}
                    />
                  </FormField>
                </div>
              </div>

              {/* BUTTONS */}

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "flex-end",
                  gap: "10px",
                  marginTop: "28px",
                  paddingTop:
                    "20px",
                  borderTop:
                    "1px solid #e2e8f0",
                }}
              >
                <button
                  type="button"
                  onClick={
                    closeAddForm
                  }
                  disabled={saving}
                  style={{
                    border:
                      "1px solid #cbd5e1",
                    borderRadius:
                      "9px",
                    background:
                      "#ffffff",
                    color:
                      "#334155",
                    padding:
                      "12px 20px",
                    fontSize:
                      "15px",
                    fontWeight:
                      600,
                    cursor: saving
                      ? "not-allowed"
                      : "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    border: "none",
                    borderRadius:
                      "9px",
                    background:
                      "#2563eb",
                    color:
                      "#ffffff",
                    padding:
                      "12px 24px",
                    fontSize:
                      "15px",
                    fontWeight:
                      600,
                    cursor: saving
                      ? "not-allowed"
                      : "pointer",
                    opacity: saving
                      ? 0.7
                      : 1,
                  }}
                >
                  {saving
                    ? "Saving..."
                    : "Save Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({
  label,
  required = false,
  children,
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          marginBottom: "7px",
          color: "#334155",
          fontSize: "14px",
          fontWeight: 600,
        }}
      >
        {label}
        {required && (
          <span
            style={{
              color: "#dc2626",
              marginLeft: "4px",
            }}
          >
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  background: "#ffffff",
  color: "#0f172a",
  padding: "11px 13px",
  fontSize: "14px",
  outline: "none",
};