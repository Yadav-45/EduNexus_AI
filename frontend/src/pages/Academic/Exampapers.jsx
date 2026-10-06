import React, { useEffect, useMemo, useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

const STATUS_OPTIONS = [
  "SCHEDULED",
  "ONGOING",
  "COMPLETED",
  "CANCELLED",
];

const emptyForm = {
  exam_id: "",
  paper_name: "",
  subject_name: "",
  subject_code: "",
  class_name: "",
  section: "",
  exam_date: "",
  start_time: "",
  end_time: "",
  duration_minutes: "",
  room_number: "",
  maximum_marks: "100",
  passing_marks: "33",
  status: "SCHEDULED",
  is_published: false,
  instructions: "",
  remarks: "",
};

function getToken() {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    ""
  );
}

function formatDate(value) {
  if (!value) return "-";

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

function formatTime(value) {
  if (!value) return "-";

  const parts = String(value).split(":");

  if (parts.length < 2) {
    return value;
  }

  const hour = Number(parts[0]);
  const minute = parts[1];

  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour =
    hour % 12 === 0 ? 12 : hour % 12;

  return `${displayHour}:${minute} ${suffix}`;
}

function formatNumber(value) {
  const number = Number(value || 0);

  return number.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
}

function statusStyle(status) {
  const styles = {
    SCHEDULED: {
      background: "#eff6ff",
      color: "#1d4ed8",
    },
    ONGOING: {
      background: "#fff7ed",
      color: "#c2410c",
    },
    COMPLETED: {
      background: "#ecfdf5",
      color: "#047857",
    },
    CANCELLED: {
      background: "#fef2f2",
      color: "#b91c1c",
    },
  };

  return (
    styles[status] || {
      background: "#f3f4f6",
      color: "#374151",
    }
  );
}

export default function ExamPapers() {
  const token = getToken();

  const [papers, setPapers] = useState([]);
  const [exams, setExams] = useState([]);

  const [summary, setSummary] = useState({
    total_papers: 0,
    scheduled: 0,
    ongoing: 0,
    completed: 0,
    cancelled: 0,
    published: 0,
    unpublished: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [examFilter, setExamFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [publishedFilter, setPublishedFilter] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);

  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  async function loadExams() {
    try {
      const response = await fetch(
        `${API_BASE}/exams?page=1&page_size=100`,
        {
          headers,
        }
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      setExams(data.items || []);
    } catch (err) {
      console.error("Failed to load exams:", err);
    }
  }

  async function loadSummary() {
    try {
      const params = new URLSearchParams();

      if (examFilter) {
        params.append(
          "exam_id",
          examFilter
        );
      }

      const response = await fetch(
        `${API_BASE}/exam-papers/summary?${params.toString()}`,
        {
          headers,
        }
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      setSummary(data);
    } catch (err) {
      console.error(
        "Failed to load paper summary:",
        err
      );
    }
  }

  async function loadPapers() {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      params.append("page", page);
      params.append("page_size", pageSize);

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

      if (examFilter) {
        params.append(
          "exam_id",
          examFilter
        );
      }

      if (classFilter) {
        params.append(
          "class_name",
          classFilter
        );
      }

      if (publishedFilter !== "") {
        params.append(
          "published",
          publishedFilter
        );
      }

      const response = await fetch(
        `${API_BASE}/exam-papers?${params.toString()}`,
        {
          headers,
        }
      );

      if (!response.ok) {
        const data = await response.json();

        throw new Error(
          data.detail ||
            "Failed to load exam papers."
        );
      }

      const data = await response.json();

      setPapers(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(
        data.total_pages || 0
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExams();
  }, []);

  useEffect(() => {
    loadPapers();
    loadSummary();
  }, [
    page,
    search,
    statusFilter,
    examFilter,
    classFilter,
    publishedFilter,
  ]);

  function openCreateModal() {
    setEditingId(null);

    setForm({
      ...emptyForm,
      exam_id:
        examFilter ||
        (exams.length === 1
          ? String(exams[0].id)
          : ""),
    });

    setMessage("");
    setError("");
    setShowModal(true);
  }

  function openEditModal(paper) {
    setEditingId(paper.id);

    setForm({
      exam_id: String(
        paper.exam_id || ""
      ),
      paper_name:
        paper.paper_name || "",
      subject_name:
        paper.subject_name || "",
      subject_code:
        paper.subject_code || "",
      class_name:
        paper.class_name || "",
      section:
        paper.section || "",
      exam_date:
        paper.exam_date || "",
      start_time:
        paper.start_time
          ? String(
              paper.start_time
            ).slice(0, 5)
          : "",
      end_time:
        paper.end_time
          ? String(
              paper.end_time
            ).slice(0, 5)
          : "",
      duration_minutes:
        paper.duration_minutes ?? "",
      room_number:
        paper.room_number || "",
      maximum_marks:
        paper.maximum_marks ?? "100",
      passing_marks:
        paper.passing_marks ?? "33",
      status:
        paper.status || "SCHEDULED",
      is_published:
        Boolean(
          paper.is_published
        ),
      instructions:
        paper.instructions || "",
      remarks:
        paper.remarks || "",
    });

    setMessage("");
    setError("");
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function savePaper(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (!form.exam_id) {
        throw new Error(
          "Please select an examination."
        );
      }

      if (!form.paper_name.trim()) {
        throw new Error(
          "Paper name is required."
        );
      }

      if (!form.subject_name.trim()) {
        throw new Error(
          "Subject name is required."
        );
      }

      const maximumMarks = Number(
        form.maximum_marks
      );

      const passingMarks = Number(
        form.passing_marks
      );

      if (
        passingMarks >
        maximumMarks
      ) {
        throw new Error(
          "Passing marks cannot be greater than maximum marks."
        );
      }

      const payload = {
        exam_id: Number(
          form.exam_id
        ),
        paper_name:
          form.paper_name.trim(),
        subject_name:
          form.subject_name.trim(),
        subject_code:
          form.subject_code.trim() ||
          null,
        class_name:
          form.class_name.trim() ||
          null,
        section:
          form.section.trim() ||
          null,
        exam_date:
          form.exam_date || null,
        start_time:
          form.start_time || null,
        end_time:
          form.end_time || null,
        duration_minutes:
          form.duration_minutes
            ? Number(
                form.duration_minutes
              )
            : null,
        room_number:
          form.room_number.trim() ||
          null,
        maximum_marks:
          maximumMarks,
        passing_marks:
          passingMarks,
        status:
          form.status,
        is_published:
          Boolean(
            form.is_published
          ),
        instructions:
          form.instructions.trim() ||
          null,
        remarks:
          form.remarks.trim() ||
          null,
      };

      const url = editingId
        ? `${API_BASE}/exam-papers/${editingId}`
        : `${API_BASE}/exam-papers`;

      const method = editingId
        ? "PUT"
        : "POST";

      const response = await fetch(
        url,
        {
          method,
          headers,
          body: JSON.stringify(
            payload
          ),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to save exam paper."
        );
      }

      setMessage(
        editingId
          ? "Exam paper updated successfully."
          : "Exam paper created successfully."
      );

      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);

      await loadPapers();
      await loadSummary();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(
    paper,
    status
  ) {
    try {
      const response = await fetch(
        `${API_BASE}/exam-papers/${paper.id}/status`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to update status."
        );
      }

      setMessage(
        "Exam paper status updated."
      );

      await loadPapers();
      await loadSummary();
    } catch (err) {
      setError(err.message);
    }
  }

  async function togglePublish(paper) {
    try {
      const response = await fetch(
        `${API_BASE}/exam-papers/${paper.id}/publish`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({
            is_published:
              !paper.is_published,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to update publication status."
        );
      }

      setMessage(
        paper.is_published
          ? "Exam paper unpublished."
          : "Exam paper published."
      );

      await loadPapers();
      await loadSummary();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deletePaper(paper) {
    const confirmed =
      window.confirm(
        `Delete "${paper.subject_name}" exam paper?`
      );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/exam-papers/${paper.id}`,
        {
          method: "DELETE",
          headers,
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to delete exam paper."
        );
      }

      setMessage(
        "Exam paper deleted successfully."
      );

      await loadPapers();
      await loadSummary();
    } catch (err) {
      setError(err.message);
    }
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("");
    setExamFilter("");
    setClassFilter("");
    setPublishedFilter("");
    setPage(1);
  }

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "20px",
    boxShadow:
      "0 4px 14px rgba(15, 23, 42, 0.05)",
  };

  const buttonStyle = {
    border: "none",
    borderRadius: "8px",
    padding: "9px 14px",
    cursor: "pointer",
    fontWeight: 600,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "24px",
        fontFamily:
          "Inter, Arial, sans-serif",
        color: "#111827",
      }}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: 750,
            }}
          >
            Exam Papers
          </h1>

          <p
            style={{
              margin:
                "7px 0 0",
              color: "#64748b",
            }}
          >
            Manage examination subjects,
            papers, schedules and marks.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          style={{
            ...buttonStyle,
            background: "#2563eb",
            color: "#ffffff",
          }}
        >
          + New Exam Paper
        </button>
      </div>

      {/* ======================================================
          MESSAGES
      ====================================================== */}

      {message && (
        <div
          style={{
            background: "#ecfdf5",
            color: "#047857",
            border:
              "1px solid #a7f3d0",
            borderRadius: "10px",
            padding: "12px 15px",
            marginBottom: "16px",
          }}
        >
          {message}
        </div>
      )}

      {error && (
        <div
          style={{
            background: "#fef2f2",
            color: "#b91c1c",
            border:
              "1px solid #fecaca",
            borderRadius: "10px",
            padding: "12px 15px",
            marginBottom: "16px",
          }}
        >
          {error}
        </div>
      )}

      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "14px",
          marginBottom: "22px",
        }}
      >
        {[
          [
            "Total Papers",
            summary.total_papers,
          ],
          [
            "Scheduled",
            summary.scheduled,
          ],
          [
            "Ongoing",
            summary.ongoing,
          ],
          [
            "Completed",
            summary.completed,
          ],
          [
            "Published",
            summary.published,
          ],
          [
            "Unpublished",
            summary.unpublished,
          ],
        ].map(
          ([label, value]) => (
            <div
              key={label}
              style={cardStyle}
            >
              <div
                style={{
                  color: "#64748b",
                  fontSize: "13px",
                  marginBottom:
                    "8px",
                }}
              >
                {label}
              </div>

              <div
                style={{
                  fontSize: "26px",
                  fontWeight: 750,
                }}
              >
                {value || 0}
              </div>
            </div>
          )
        )}
      </div>

      {/* ======================================================
          FILTERS
      ====================================================== */}

      <div
        style={{
          ...cardStyle,
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(170px, 1fr))",
            gap: "12px",
          }}
        >
          <input
            value={search}
            onChange={(event) => {
              setSearch(
                event.target.value
              );
              setPage(1);
            }}
            placeholder="Search papers..."
            style={inputStyle}
          />

          <select
            value={examFilter}
            onChange={(event) => {
              setExamFilter(
                event.target.value
              );
              setPage(1);
            }}
            style={inputStyle}
          >
            <option value="">
              All Examinations
            </option>

            {exams.map((exam) => (
              <option
                key={exam.id}
                value={exam.id}
              >
                {exam.exam_name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(
                event.target.value
              );
              setPage(1);
            }}
            style={inputStyle}
          >
            <option value="">
              All Statuses
            </option>

            {STATUS_OPTIONS.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              )
            )}
          </select>

          <input
            value={classFilter}
            onChange={(event) => {
              setClassFilter(
                event.target.value
              );
              setPage(1);
            }}
            placeholder="Class"
            style={inputStyle}
          />

          <select
            value={publishedFilter}
            onChange={(event) => {
              setPublishedFilter(
                event.target.value
              );
              setPage(1);
            }}
            style={inputStyle}
          >
            <option value="">
              Publication
            </option>

            <option value="true">
              Published
            </option>

            <option value="false">
              Unpublished
            </option>
          </select>

          <button
            onClick={clearFilters}
            style={{
              ...buttonStyle,
              background: "#f1f5f9",
              color: "#334155",
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* ======================================================
          TABLE
      ====================================================== */}

      <div
        style={{
          ...cardStyle,
          overflowX: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <div>
            <strong>
              Exam Papers
            </strong>

            <span
              style={{
                color: "#64748b",
                marginLeft: "8px",
              }}
            >
              {total} records
            </span>
          </div>

          <button
            onClick={() => {
              loadPapers();
              loadSummary();
            }}
            style={{
              ...buttonStyle,
              background: "#f1f5f9",
              color: "#334155",
            }}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            Loading exam papers...
          </div>
        ) : papers.length === 0 ? (
          <div
            style={{
              padding: "50px 20px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            No exam papers found.
          </div>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse:
                "collapse",
              minWidth: "1100px",
            }}
          >
            <thead>
              <tr
                style={{
                  background:
                    "#f8fafc",
                }}
              >
                {[
                  "Examination",
                  "Subject",
                  "Class",
                  "Date",
                  "Time",
                  "Marks",
                  "Status",
                  "Published",
                  "Actions",
                ].map(
                  (heading) => (
                    <th
                      key={heading}
                      style={tableHeaderStyle}
                    >
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {papers.map(
                (paper) => {
                  const badge =
                    statusStyle(
                      paper.status
                    );

                  return (
                    <tr
                      key={
                        paper.id
                      }
                      style={{
                        borderTop:
                          "1px solid #e5e7eb",
                      }}
                    >
                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        <div
                          style={{
                            fontWeight: 650,
                          }}
                        >
                          {
                            paper.exam_name
                          }
                        </div>

                        <div
                          style={{
                            fontSize:
                              "12px",
                            color:
                              "#64748b",
                          }}
                        >
                          {
                            paper.academic_year
                          }
                        </div>
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        <div
                          style={{
                            fontWeight: 650,
                          }}
                        >
                          {
                            paper.subject_name
                          }
                        </div>

                        {paper.subject_code && (
                          <div
                            style={{
                              fontSize:
                                "12px",
                              color:
                                "#64748b",
                            }}
                          >
                            {
                              paper.subject_code
                            }
                          </div>
                        )}
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        {paper.class_name ||
                          "-"}
                        {paper.section
                          ? ` - ${paper.section}`
                          : ""}
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        {formatDate(
                          paper.exam_date
                        )}
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        {formatTime(
                          paper.start_time
                        )}
                        {" - "}
                        {formatTime(
                          paper.end_time
                        )}
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        <strong>
                          {formatNumber(
                            paper.maximum_marks
                          )}
                        </strong>

                        <div
                          style={{
                            fontSize:
                              "12px",
                            color:
                              "#64748b",
                          }}
                        >
                          Pass:{" "}
                          {formatNumber(
                            paper.passing_marks
                          )}
                        </div>
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        <span
                          style={{
                            ...badge,
                            padding:
                              "5px 9px",
                            borderRadius:
                              "999px",
                            fontSize:
                              "12px",
                            fontWeight:
                              700,
                          }}
                        >
                          {
                            paper.status
                          }
                        </span>
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        <span
                          style={{
                            color:
                              paper.is_published
                                ? "#047857"
                                : "#64748b",
                            fontWeight:
                              650,
                          }}
                        >
                          {paper.is_published
                            ? "Published"
                            : "Draft"}
                        </span>
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            gap: "7px",
                            flexWrap:
                              "wrap",
                          }}
                        >
                          <button
                            onClick={() =>
                              openEditModal(
                                paper
                              )
                            }
                            style={{
                              ...smallButton,
                              background:
                                "#eff6ff",
                              color:
                                "#1d4ed8",
                            }}
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              togglePublish(
                                paper
                              )
                            }
                            style={{
                              ...smallButton,
                              background:
                                paper.is_published
                                  ? "#fff7ed"
                                  : "#ecfdf5",
                              color:
                                paper.is_published
                                  ? "#c2410c"
                                  : "#047857",
                            }}
                          >
                            {paper.is_published
                              ? "Unpublish"
                              : "Publish"}
                          </button>

                          <select
                            value={
                              paper.status
                            }
                            onChange={(
                              event
                            ) =>
                              updateStatus(
                                paper,
                                event
                                  .target
                                  .value
                              )
                            }
                            style={{
                              ...smallButton,
                              border:
                                "1px solid #e5e7eb",
                              background:
                                "#ffffff",
                              color:
                                "#334155",
                            }}
                          >
                            {STATUS_OPTIONS.map(
                              (
                                status
                              ) => (
                                <option
                                  key={
                                    status
                                  }
                                  value={
                                    status
                                  }
                                >
                                  {
                                    status
                                  }
                                </option>
                              )
                            )}
                          </select>

                          <button
                            onClick={() =>
                              deletePaper(
                                paper
                              )
                            }
                            style={{
                              ...smallButton,
                              background:
                                "#fef2f2",
                              color:
                                "#b91c1c",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        )}

        {/* ====================================================
            PAGINATION
        ==================================================== */}

        {totalPages > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              marginTop: "18px",
              paddingTop: "15px",
              borderTop:
                "1px solid #e5e7eb",
            }}
          >
            <span
              style={{
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              Page {page} of{" "}
              {totalPages}
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
                  setPage(
                    (current) =>
                      Math.max(
                        1,
                        current - 1
                      )
                  )
                }
                style={{
                  ...smallButton,
                  opacity:
                    page <= 1
                      ? 0.5
                      : 1,
                  cursor:
                    page <= 1
                      ? "not-allowed"
                      : "pointer",
                  background:
                    "#f1f5f9",
                  color:
                    "#334155",
                }}
              >
                Previous
              </button>

              <button
                disabled={
                  page >=
                  totalPages
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      Math.min(
                        totalPages,
                        current + 1
                      )
                  )
                }
                style={{
                  ...smallButton,
                  opacity:
                    page >=
                    totalPages
                      ? 0.5
                      : 1,
                  cursor:
                    page >=
                    totalPages
                      ? "not-allowed"
                      : "pointer",
                  background:
                    "#f1f5f9",
                  color:
                    "#334155",
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================
          MODAL
      ====================================================== */}

      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(15, 23, 42, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "center",
            padding: "20px",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background:
                "#ffffff",
              borderRadius:
                "16px",
              width:
                "min(850px, 100%)",
              maxHeight:
                "92vh",
              overflowY:
                "auto",
              padding: "25px",
              boxShadow:
                "0 20px 50px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                marginBottom:
                  "20px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                  }}
                >
                  {editingId
                    ? "Edit Exam Paper"
                    : "New Exam Paper"}
                </h2>

                <p
                  style={{
                    margin:
                      "5px 0 0",
                    color:
                      "#64748b",
                    fontSize:
                      "14px",
                  }}
                >
                  Configure the
                  subject/paper
                  for an
                  examination.
                </p>
              </div>

              <button
                onClick={
                  closeModal
                }
                style={{
                  border:
                    "none",
                  background:
                    "#f1f5f9",
                  borderRadius:
                    "8px",
                  width: "36px",
                  height: "36px",
                  cursor:
                    "pointer",
                  fontSize:
                    "18px",
                }}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={
                savePaper
              }
            >
              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(2, minmax(0, 1fr))",
                  gap: "14px",
                }}
              >
                <Field
                  label="Examination *"
                  full
                >
                  <select
                    value={
                      form.exam_id
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "exam_id",
                        event
                          .target
                          .value
                      )
                    }
                    style={
                      inputStyle
                    }
                    required
                  >
                    <option value="">
                      Select Examination
                    </option>

                    {exams.map(
                      (
                        exam
                      ) => (
                        <option
                          key={
                            exam.id
                          }
                          value={
                            exam.id
                          }
                        >
                          {
                            exam.exam_name
                          }{" "}
                          {exam.academic_year
                            ? `(${exam.academic_year})`
                            : ""}
                        </option>
                      )
                    )}
                  </select>
                </Field>

                <Field label="Paper Name *">
                  <input
                    value={
                      form.paper_name
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "paper_name",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Mathematics Paper"
                    style={
                      inputStyle
                    }
                    required
                  />
                </Field>

                <Field label="Subject Name *">
                  <input
                    value={
                      form.subject_name
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "subject_name",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Mathematics"
                    style={
                      inputStyle
                    }
                    required
                  />
                </Field>

                <Field label="Subject Code">
                  <input
                    value={
                      form.subject_code
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "subject_code",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="MATH-08"
                    style={
                      inputStyle
                    }
                  />
                </Field>

                <Field label="Class">
                  <input
                    value={
                      form.class_name
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "class_name",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="8"
                    style={
                      inputStyle
                    }
                  />
                </Field>

                <Field label="Section">
                  <input
                    value={
                      form.section
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "section",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="A"
                    style={
                      inputStyle
                    }
                  />
                </Field>

                <Field label="Exam Date">
                  <input
                    type="date"
                    value={
                      form.exam_date
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "exam_date",
                        event
                          .target
                          .value
                      )
                    }
                    style={
                      inputStyle
                    }
                  />
                </Field>

                <Field label="Room Number">
                  <input
                    value={
                      form.room_number
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "room_number",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Room 101"
                    style={
                      inputStyle
                    }
                  />
                </Field>

                <Field label="Start Time">
                  <input
                    type="time"
                    value={
                      form.start_time
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "start_time",
                        event
                          .target
                          .value
                      )
                    }
                    style={
                      inputStyle
                    }
                  />
                </Field>

                <Field label="End Time">
                  <input
                    type="time"
                    value={
                      form.end_time
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "end_time",
                        event
                          .target
                          .value
                      )
                    }
                    style={
                      inputStyle
                    }
                  />
                </Field>

                <Field label="Duration (minutes)">
                  <input
                    type="number"
                    min="1"
                    value={
                      form.duration_minutes
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "duration_minutes",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="180"
                    style={
                      inputStyle
                    }
                  />
                </Field>

                <Field label="Maximum Marks">
                  <input
                    type="number"
                    min="0"
                    value={
                      form.maximum_marks
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "maximum_marks",
                        event
                          .target
                          .value
                      )
                    }
                    style={
                      inputStyle
                    }
                  />
                </Field>

                <Field label="Passing Marks">
                  <input
                    type="number"
                    min="0"
                    value={
                      form.passing_marks
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "passing_marks",
                        event
                          .target
                          .value
                      )
                    }
                    style={
                      inputStyle
                    }
                  />
                </Field>

                <Field label="Status">
                  <select
                    value={
                      form.status
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "status",
                        event
                          .target
                          .value
                      )
                    }
                    style={
                      inputStyle
                    }
                  >
                    {STATUS_OPTIONS.map(
                      (
                        status
                      ) => (
                        <option
                          key={
                            status
                          }
                          value={
                            status
                          }
                        >
                          {
                            status
                          }
                        </option>
                      )
                    )}
                  </select>
                </Field>

                <Field label="Published">
                  <label
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap: "10px",
                      height:
                        "42px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={
                        form.is_published
                      }
                      onChange={(
                        event
                      ) =>
                        updateField(
                          "is_published",
                          event
                            .target
                            .checked
                        )
                      }
                    />

                    <span>
                      Publish this
                      paper
                    </span>
                  </label>
                </Field>

                <Field
                  label="Instructions"
                  full
                >
                  <textarea
                    value={
                      form.instructions
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "instructions",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Enter instructions for students..."
                    rows="4"
                    style={{
                      ...inputStyle,
                      resize:
                        "vertical",
                    }}
                  />
                </Field>

                <Field
                  label="Remarks"
                  full
                >
                  <textarea
                    value={
                      form.remarks
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "remarks",
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="Internal remarks..."
                    rows="3"
                    style={{
                      ...inputStyle,
                      resize:
                        "vertical",
                    }}
                  />
                </Field>
              </div>

              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "flex-end",
                  gap: "10px",
                  marginTop:
                    "22px",
                  paddingTop:
                    "18px",
                  borderTop:
                    "1px solid #e5e7eb",
                }}
              >
                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  style={{
                    ...buttonStyle,
                    background:
                      "#f1f5f9",
                    color:
                      "#334155",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  style={{
                    ...buttonStyle,
                    background:
                      "#2563eb",
                    color:
                      "#ffffff",
                    opacity:
                      saving
                        ? 0.7
                        : 1,
                  }}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Paper"
                    : "Create Paper"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


// ============================================================
// SMALL COMPONENTS
// ============================================================

function Field({
  label,
  children,
  full = false,
}) {
  return (
    <div
      style={{
        gridColumn: full
          ? "1 / -1"
          : "auto",
      }}
    >
      <label
        style={{
          display: "block",
          fontSize: "13px",
          fontWeight: 650,
          color: "#374151",
          marginBottom: "6px",
        }}
      >
        {label}
      </label>

      {children}
    </div>
  );
}


// ============================================================
// STYLES
// ============================================================

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  padding: "10px 11px",
  fontSize: "14px",
  outline: "none",
  background: "#ffffff",
  color: "#111827",
};

const tableHeaderStyle = {
  textAlign: "left",
  padding: "12px 10px",
  fontSize: "12px",
  fontWeight: 750,
  color: "#475569",
  whiteSpace: "nowrap",
};

const tableCellStyle = {
  padding: "13px 10px",
  fontSize: "13px",
  verticalAlign: "middle",
};

const smallButton = {
  border: "none",
  borderRadius: "7px",
  padding: "7px 9px",
  fontSize: "12px",
  fontWeight: 650,
  cursor: "pointer",
};