import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import { API_BASE_URL as API_BASE } from "../../api/config";

const RESULT_STATUSES = [
  "PENDING",
  "PASSED",
  "FAILED",
  "ABSENT",
];

const emptyForm = {
  exam_id: "",
  exam_paper_id: "",
  student_id: "",
  marks_obtained: "",
  maximum_marks: "100",
  passing_marks: "33",
  is_absent: false,
  is_published: false,
  remarks: "",
};

/*
 * ============================================================
 * NORMALIZE API LIST RESPONSES
 * ============================================================
 *
 * The backend may return:
 *
 * [
 *   {...},
 *   {...}
 * ]
 *
 * OR:
 *
 * {
 *   items: [...]
 * }
 *
 * OR:
 *
 * {
 *   students: [...]
 * }
 *
 * This function guarantees that the frontend always
 * receives an array.
 */
function normalizeList(data) {
  if (Array.isArray(data)) {
    return data;
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

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

function getToken() {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    ""
  );
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  );
}

function statusStyle(status) {
  const styles = {
    PASSED: {
      background: "#ecfdf5",
      color: "#047857",
    },
    FAILED: {
      background: "#fef2f2",
      color: "#b91c1c",
    },
    ABSENT: {
      background: "#fff7ed",
      color: "#c2410c",
    },
    PENDING: {
      background: "#f1f5f9",
      color: "#475569",
    },
  };

  return (
    styles[status] || {
      background: "#f1f5f9",
      color: "#475569",
    }
  );
}

export default function ExamResults() {
  const token = getToken();

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);
  const [papers, setPapers] = useState([]);
  const [students, setStudents] = useState([]);

  const [summary, setSummary] = useState({
    total_results: 0,
    passed: 0,
    failed: 0,
    absent: 0,
    pending: 0,
    published: 0,
    unpublished: 0,
    average_marks: 0,
    highest_marks: 0,
    average_percentage: 0,
  });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [examFilter, setExamFilter] =
    useState("");

  const [paperFilter, setPaperFilter] =
    useState("");

  const [classFilter, setClassFilter] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [publishedFilter, setPublishedFilter] =
    useState("");

  const [page, setPage] =
    useState(1);

  const pageSize = 25;

  const [total, setTotal] =
    useState(0);

  const [totalPages, setTotalPages] =
    useState(0);

  const [showModal, setShowModal] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [form, setForm] =
    useState(emptyForm);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // ==========================================================
  // LOAD EXAMS
  // ==========================================================

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

      const data =
        await response.json();

      const examList =
        normalizeList(data);

      console.log(
        "Exam Results - Exams API:",
        data
      );

      setExams(examList);
    } catch (err) {
      console.error(
        "Failed to load exams:",
        err
      );

      setExams([]);
    }
  }

  // ==========================================================
  // LOAD PAPERS
  // ==========================================================

  async function loadPapers() {
    try {
      const params =
        new URLSearchParams();

      params.append(
        "page",
        "1"
      );

      params.append(
        "page_size",
        "100"
      );

      if (examFilter) {
        params.append(
          "exam_id",
          examFilter
        );
      }

      const response =
        await fetch(
          `${API_BASE}/exam-papers?${params.toString()}`,
          {
            headers,
          }
        );

      if (!response.ok) {
        setPapers([]);
        return;
      }

      const data =
        await response.json();

      const paperList =
        normalizeList(data);

      console.log(
        "Exam Results - Papers API:",
        data
      );

      setPapers(paperList);
    } catch (err) {
      console.error(
        "Failed to load papers:",
        err
      );

      setPapers([]);
    }
  }

  // ==========================================================
  // LOAD STUDENTS
  // ==========================================================

  async function loadStudents() {
    try {
      const response =
        await fetch(
          `${API_BASE}/students?page=1&page_size=100`,
          {
            headers,
          }
        );

      if (!response.ok) {
        setStudents([]);
        return;
      }

      const data =
        await response.json();

      const studentList =
        normalizeList(data);

      console.log(
        "Exam Results - Students API:",
        data
      );

      console.log(
        "Exam Results - Normalized Students:",
        studentList
      );

      setStudents(studentList);
    } catch (err) {
      console.error(
        "Failed to load students:",
        err
      );

      setStudents([]);
    }
  }

  // ==========================================================
  // LOAD RESULTS
  // ==========================================================

  async function loadResults() {
    setLoading(true);
    setError("");

    try {
      const params =
        new URLSearchParams();

      params.append(
        "page",
        page
      );

      params.append(
        "page_size",
        pageSize
      );

      if (search.trim()) {
        params.append(
          "search",
          search.trim()
        );
      }

      if (examFilter) {
        params.append(
          "exam_id",
          examFilter
        );
      }

      if (paperFilter) {
        params.append(
          "exam_paper_id",
          paperFilter
        );
      }

      if (classFilter) {
        params.append(
          "class_name",
          classFilter
        );
      }

      if (statusFilter) {
        params.append(
          "result_status",
          statusFilter
        );
      }

      if (
        publishedFilter !== ""
      ) {
        params.append(
          "published",
          publishedFilter
        );
      }

      const response =
        await fetch(
          `${API_BASE}/exam-results?${params.toString()}`,
          {
            headers,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to load results."
        );
      }

      const resultList =
        normalizeList(data);

      setResults(
        resultList
      );

      setTotal(
        Number(data.total || resultList.length || 0)
      );

      setTotalPages(
        Number(
          data.total_pages ||
          (resultList.length > 0
            ? 1
            : 0)
        )
      );
    } catch (err) {
      setResults([]);

      setTotal(0);

      setTotalPages(0);

      setError(
        err.message ||
          "Unable to load examination results."
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // LOAD SUMMARY
  // ==========================================================

  async function loadSummary() {
    try {
      const params =
        new URLSearchParams();

      if (examFilter) {
        params.append(
          "exam_id",
          examFilter
        );
      }

      if (paperFilter) {
        params.append(
          "exam_paper_id",
          paperFilter
        );
      }

      if (classFilter) {
        params.append(
          "class_name",
          classFilter
        );
      }

      const response =
        await fetch(
          `${API_BASE}/exam-results/summary?${params.toString()}`,
          {
            headers,
          }
        );

      if (!response.ok) {
        return;
      }

      const data =
        await response.json();

      setSummary({
        total_results:
          Number(
            data.total_results || 0
          ),
        passed:
          Number(
            data.passed || 0
          ),
        failed:
          Number(
            data.failed || 0
          ),
        absent:
          Number(
            data.absent || 0
          ),
        pending:
          Number(
            data.pending || 0
          ),
        published:
          Number(
            data.published || 0
          ),
        unpublished:
          Number(
            data.unpublished || 0
          ),
        average_marks:
          Number(
            data.average_marks || 0
          ),
        highest_marks:
          Number(
            data.highest_marks || 0
          ),
        average_percentage:
          Number(
            data.average_percentage || 0
          ),
      });
    } catch (err) {
      console.error(
        "Failed to load result summary:",
        err
      );
    }
  }

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadExams();
    loadStudents();
  }, []);

  // ==========================================================
  // PAPER FILTER
  // ==========================================================

  useEffect(() => {
    loadPapers();
  }, [examFilter]);

  // ==========================================================
  // RESULTS
  // ==========================================================

  useEffect(() => {
    loadResults();
    loadSummary();
  }, [
    page,
    search,
    examFilter,
    paperFilter,
    classFilter,
    statusFilter,
    publishedFilter,
  ]);

  // ==========================================================
  // FORM
  // ==========================================================

  function updateField(
    field,
    value
  ) {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  }

  function openCreateModal() {
    setEditingId(null);

    setForm({
      ...emptyForm,
      exam_id:
        examFilter || "",
      exam_paper_id:
        paperFilter || "",
    });

    setError("");
    setMessage("");
    setShowModal(true);
  }

  function openEditModal(result) {
    setEditingId(
      result.id
    );

    setForm({
      exam_id:
        String(
          result.exam_id
        ),
      exam_paper_id:
        String(
          result.exam_paper_id
        ),
      student_id:
        String(
          result.student_id
        ),
      marks_obtained:
        result.marks_obtained ??
        "",
      maximum_marks:
        result.maximum_marks ??
        "100",
      passing_marks:
        result.passing_marks ??
        "33",
      is_absent:
        Boolean(
          result.is_absent
        ),
      is_published:
        Boolean(
          result.is_published
        ),
      remarks:
        result.remarks || "",
    });

    setError("");
    setMessage("");
    setShowModal(true);
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingId(null);
    setForm({
      ...emptyForm,
    });
  }

  // ==========================================================
  // SAVE
  // ==========================================================

  async function saveResult(event) {
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

      if (!form.exam_paper_id) {
        throw new Error(
          "Please select an exam paper."
        );
      }

      if (
        !editingId &&
        !form.student_id
      ) {
        throw new Error(
          "Please select a student."
        );
      }

      const maximumMarks =
        Number(
          form.maximum_marks
        );

      const passingMarks =
        Number(
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

      let marks = null;

      if (
        !form.is_absent &&
        form.marks_obtained !== ""
      ) {
        marks = Number(
          form.marks_obtained
        );
      }

      if (
        !form.is_absent &&
        marks !== null &&
        marks > maximumMarks
      ) {
        throw new Error(
          "Marks obtained cannot exceed maximum marks."
        );
      }

      const payload = {
        exam_id:
          Number(
            form.exam_id
          ),
        exam_paper_id:
          Number(
            form.exam_paper_id
          ),
        student_id:
          Number(
            form.student_id
          ),
        marks_obtained:
          marks,
        maximum_marks:
          maximumMarks,
        passing_marks:
          passingMarks,
        is_absent:
          Boolean(
            form.is_absent
          ),
        is_published:
          Boolean(
            form.is_published
          ),
        remarks:
          form.remarks.trim() ||
          null,
      };

      const url = editingId
        ? `${API_BASE}/exam-results/${editingId}`
        : `${API_BASE}/exam-results`;

      const method = editingId
        ? "PUT"
        : "POST";

      const response =
        await fetch(
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
            "Failed to save result."
        );
      }

      setMessage(
        editingId
          ? "Exam result updated successfully."
          : "Exam result created successfully."
      );

      closeModal();

      await loadResults();
      await loadSummary();
    } catch (err) {
      setError(
        err.message ||
          "Failed to save result."
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================================
  // PUBLISH
  // ==========================================================

  async function togglePublish(
    result
  ) {
    try {
      const response =
        await fetch(
          `${API_BASE}/exam-results/${result.id}/publish`,
          {
            method: "PATCH",
            headers,
            body: JSON.stringify({
              is_published:
                !result.is_published,
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
        result.is_published
          ? "Result unpublished."
          : "Result published."
      );

      await loadResults();
      await loadSummary();
    } catch (err) {
      setError(
        err.message ||
          "Failed to update publication status."
      );
    }
  }

  // ==========================================================
  // DELETE
  // ==========================================================

  async function deleteResult(
    result
  ) {
    const confirmed =
      window.confirm(
        `Delete result for ${
          result.student_name ||
          "this student"
        }?`
      );

    if (!confirmed) {
      return;
    }

    try {
      const response =
        await fetch(
          `${API_BASE}/exam-results/${result.id}`,
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
            "Failed to delete result."
        );
      }

      setMessage(
        "Exam result deleted successfully."
      );

      await loadResults();
      await loadSummary();
    } catch (err) {
      setError(
        err.message ||
          "Failed to delete result."
      );
    }
  }

  function clearFilters() {
    setSearch("");
    setExamFilter("");
    setPaperFilter("");
    setClassFilter("");
    setStatusFilter("");
    setPublishedFilter("");
    setPage(1);
  }

  // ==========================================================
  // FILTER PAPERS FOR FORM
  // ==========================================================

  const safePapers =
    Array.isArray(papers)
      ? papers
      : [];

  const safeStudents =
    Array.isArray(students)
      ? students
      : [];

  const safeExams =
    Array.isArray(exams)
      ? exams
      : [];

  const safeResults =
    Array.isArray(results)
      ? results
      : [];

  const formPapers =
    form.exam_id
      ? safePapers.filter(
          (paper) =>
            String(
              paper?.exam_id
            ) ===
            String(
              form.exam_id
            )
        )
      : safePapers;

  // ==========================================================
  // FILTER STUDENTS FOR FORM
  // ==========================================================

  const filteredStudents =
    classFilter
      ? safeStudents.filter(
          (student) =>
            String(
              student?.class_name ||
                student?.class_level ||
                ""
            )
              .toLowerCase() ===
            String(
              classFilter
            ).toLowerCase()
        )
      : safeStudents;

  return (
    <div
      style={{
        minHeight:
          "100vh",
        background:
          "#f8fafc",
        padding:
          "24px",
        fontFamily:
          "Inter, Arial, sans-serif",
        color:
          "#111827",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          display:
            "flex",
          justifyContent:
            "space-between",
          alignItems:
            "center",
          gap:
            "16px",
          marginBottom:
            "24px",
          flexWrap:
            "wrap",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize:
                "28px",
              fontWeight:
                750,
            }}
          >
            Exam Results
          </h1>

          <p
            style={{
              margin:
                "7px 0 0",
              color:
                "#64748b",
            }}
          >
            Enter and manage student
            examination marks and results.
          </p>
        </div>

        <button
          onClick={
            openCreateModal
          }
          style={{
            ...buttonStyle,
            background:
              "#2563eb",
            color:
              "#ffffff",
          }}
        >
          + Enter Result
        </button>
      </div>

      {/* MESSAGES */}

      {message && (
        <div
          style={{
            background:
              "#ecfdf5",
            color:
              "#047857",
            border:
              "1px solid #a7f3d0",
            borderRadius:
              "10px",
            padding:
              "12px 15px",
            marginBottom:
              "16px",
          }}
        >
          {message}
        </div>
      )}

      {error && (
        <div
          style={{
            background:
              "#fef2f2",
            color:
              "#b91c1c",
            border:
              "1px solid #fecaca",
            borderRadius:
              "10px",
            padding:
              "12px 15px",
            marginBottom:
              "16px",
          }}
        >
          {error}
        </div>
      )}

      {/* SUMMARY */}

      <div
        style={{
          display:
            "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(145px, 1fr))",
          gap:
            "14px",
          marginBottom:
            "22px",
        }}
      >
        {[
          [
            "Total",
            summary.total_results,
          ],
          [
            "Passed",
            summary.passed,
          ],
          [
            "Failed",
            summary.failed,
          ],
          [
            "Absent",
            summary.absent,
          ],
          [
            "Pending",
            summary.pending,
          ],
          [
            "Average %",
            `${formatNumber(
              summary.average_percentage
            )}%`,
          ],
          [
            "Highest",
            formatNumber(
              summary.highest_marks
            ),
          ],
        ].map(
          ([label, value]) => (
            <div
              key={label}
              style={cardStyle}
            >
              <div
                style={{
                  color:
                    "#64748b",
                  fontSize:
                    "13px",
                  marginBottom:
                    "8px",
                }}
              >
                {label}
              </div>

              <div
                style={{
                  fontSize:
                    "24px",
                  fontWeight:
                    750,
                }}
              >
                {value || 0}
              </div>
            </div>
          )
        )}
      </div>

      {/* FILTERS */}

      <div
        style={{
          ...cardStyle,
          marginBottom:
            "20px",
        }}
      >
        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(170px, 1fr))",
            gap:
              "12px",
          }}
        >
          <input
            value={
              search
            }
            onChange={(
              event
            ) => {
              setSearch(
                event.target.value
              );
              setPage(1);
            }}
            placeholder="Search student, subject..."
            style={
              inputStyle
            }
          />

          <select
            value={
              examFilter
            }
            onChange={(
              event
            ) => {
              setExamFilter(
                event.target.value
              );
              setPaperFilter("");
              setPage(1);
            }}
            style={
              inputStyle
            }
          >
            <option value="">
              All Examinations
            </option>

            {safeExams.map(
              (exam) => (
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
                  }
                </option>
              )
            )}
          </select>

          <select
            value={
              paperFilter
            }
            onChange={(
              event
            ) => {
              setPaperFilter(
                event.target.value
              );
              setPage(1);
            }}
            style={
              inputStyle
            }
          >
            <option value="">
              All Subjects
            </option>

            {safePapers.map(
              (paper) => (
                <option
                  key={
                    paper.id
                  }
                  value={
                    paper.id
                  }
                >
                  {
                    paper.subject_name
                  }
                  {" - "}
                  {
                    paper.exam_name
                  }
                </option>
              )
            )}
          </select>

          <input
            value={
              classFilter
            }
            onChange={(
              event
            ) => {
              setClassFilter(
                event.target.value
              );
              setPage(1);
            }}
            placeholder="Class"
            style={
              inputStyle
            }
          />

          <select
            value={
              statusFilter
            }
            onChange={(
              event
            ) => {
              setStatusFilter(
                event.target.value
              );
              setPage(1);
            }}
            style={
              inputStyle
            }
          >
            <option value="">
              All Results
            </option>

            {RESULT_STATUSES.map(
              (status) => (
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

          <select
            value={
              publishedFilter
            }
            onChange={(
              event
            ) => {
              setPublishedFilter(
                event.target.value
              );
              setPage(1);
            }}
            style={
              inputStyle
            }
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
            onClick={
              clearFilters
            }
            style={{
              ...buttonStyle,
              background:
                "#f1f5f9",
              color:
                "#334155",
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* TABLE */}

      <div
        style={{
          ...cardStyle,
          overflowX:
            "auto",
        }}
      >
        <div
          style={{
            display:
              "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            marginBottom:
              "15px",
          }}
        >
          <div>
            <strong>
              Student Results
            </strong>

            <span
              style={{
                color:
                  "#64748b",
                marginLeft:
                  "8px",
              }}
            >
              {total} records
            </span>
          </div>

          <button
            onClick={() => {
              loadResults();
              loadSummary();
            }}
            style={{
              ...buttonStyle,
              background:
                "#f1f5f9",
              color:
                "#334155",
            }}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div
            style={{
              padding:
                "40px",
              textAlign:
                "center",
              color:
                "#64748b",
            }}
          >
            Loading results...
          </div>
        ) : safeResults.length === 0 ? (
          <div
            style={{
              padding:
                "50px 20px",
              textAlign:
                "center",
              color:
                "#64748b",
            }}
          >
            No examination results found.
          </div>
        ) : (
          <table
            style={{
              width:
                "100%",
              borderCollapse:
                "collapse",
              minWidth:
                "1200px",
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
                  "Student",
                  "Examination",
                  "Subject",
                  "Class",
                  "Marks",
                  "Percentage",
                  "Result",
                  "Published",
                  "Actions",
                ].map(
                  (heading) => (
                    <th
                      key={
                        heading
                      }
                      style={
                        tableHeaderStyle
                      }
                    >
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {safeResults.map(
                (result) => {
                  const badge =
                    statusStyle(
                      result.result_status
                    );

                  return (
                    <tr
                      key={
                        result.id
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
                            fontWeight:
                              700,
                          }}
                        >
                          {
                            result.student_name
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
                            result.student_code ||
                            "-"
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
                            fontWeight:
                              650,
                          }}
                        >
                          {
                            result.exam_name
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
                            result.academic_year ||
                            ""
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
                            fontWeight:
                              650,
                          }}
                        >
                          {
                            result.subject_name
                          }
                        </div>

                        {result.subject_code && (
                          <div
                            style={{
                              fontSize:
                                "12px",
                              color:
                                "#64748b",
                            }}
                          >
                            {
                              result.subject_code
                            }
                          </div>
                        )}
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        {result.class_name ||
                          "-"}
                        {result.section
                          ? ` - ${result.section}`
                          : ""}
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        {result.is_absent ? (
                          <strong>
                            Absent
                          </strong>
                        ) : (
                          <>
                            <strong>
                              {formatNumber(
                                result.marks_obtained
                              )}
                            </strong>

                            {" / "}

                            {formatNumber(
                              result.maximum_marks
                            )}
                          </>
                        )}

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
                            result.passing_marks
                          )}
                        </div>
                      </td>

                      <td
                        style={
                          tableCellStyle
                        }
                      >
                        {result.percentage !==
                          null &&
                        result.percentage !==
                          undefined
                          ? `${formatNumber(
                              result.percentage
                            )}%`
                          : "-"}
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
                            result.result_status
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
                              result.is_published
                                ? "#047857"
                                : "#64748b",
                            fontWeight:
                              650,
                          }}
                        >
                          {result.is_published
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
                            gap:
                              "7px",
                            flexWrap:
                              "wrap",
                          }}
                        >
                          <button
                            onClick={() =>
                              openEditModal(
                                result
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
                                result
                              )
                            }
                            style={{
                              ...smallButton,
                              background:
                                result.is_published
                                  ? "#fff7ed"
                                  : "#ecfdf5",
                              color:
                                result.is_published
                                  ? "#c2410c"
                                  : "#047857",
                            }}
                          >
                            {result.is_published
                              ? "Unpublish"
                              : "Publish"}
                          </button>

                          <button
                            onClick={() =>
                              deleteResult(
                                result
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

        {/* PAGINATION */}

        {totalPages > 0 && (
          <div
            style={{
              display:
                "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
              marginTop:
                "18px",
              paddingTop:
                "15px",
              borderTop:
                "1px solid #e5e7eb",
            }}
          >
            <span
              style={{
                color:
                  "#64748b",
                fontSize:
                  "14px",
              }}
            >
              Page {page} of{" "}
              {totalPages}
            </span>

            <div
              style={{
                display:
                  "flex",
                gap:
                  "8px",
              }}
            >
              <button
                disabled={
                  page <= 1
                }
                onClick={() =>
                  setPage(
                    (
                      current
                    ) =>
                      Math.max(
                        1,
                        current - 1
                      )
                  )
                }
                style={{
                  ...smallButton,
                  background:
                    "#f1f5f9",
                  color:
                    "#334155",
                  opacity:
                    page <= 1
                      ? 0.5
                      : 1,
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
                    (
                      current
                    ) =>
                      Math.min(
                        totalPages,
                        current + 1
                      )
                  )
                }
                style={{
                  ...smallButton,
                  background:
                    "#f1f5f9",
                  color:
                    "#334155",
                  opacity:
                    page >=
                    totalPages
                      ? 0.5
                      : 1,
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL */}

      {showModal && (
        <div
          style={{
            position:
              "fixed",
            inset: 0,
            background:
              "rgba(15, 23, 42, 0.55)",
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            padding:
              "20px",
            zIndex:
              1000,
          }}
        >
          <div
            style={{
              background:
                "#ffffff",
              borderRadius:
                "16px",
              width:
                "min(820px, 100%)",
              maxHeight:
                "92vh",
              overflowY:
                "auto",
              padding:
                "25px",
              boxShadow:
                "0 20px 50px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                display:
                  "flex",
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
                    margin:
                      0,
                  }}
                >
                  {editingId
                    ? "Edit Exam Result"
                    : "Enter Exam Result"}
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
                  Enter marks for an
                  individual student.
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
                  width:
                    "36px",
                  height:
                    "36px",
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
                saveResult
              }
            >
              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "repeat(2, minmax(0, 1fr))",
                  gap:
                    "14px",
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
                    ) => {
                      updateField(
                        "exam_id",
                        event.target.value
                      );

                      updateField(
                        "exam_paper_id",
                        ""
                      );
                    }}
                    style={
                      inputStyle
                    }
                    required
                  >
                    <option value="">
                      Select Examination
                    </option>

                    {safeExams.map(
                      (exam) => (
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

                <Field
                  label="Exam Paper / Subject *"
                  full
                >
                  <select
                    value={
                      form.exam_paper_id
                    }
                    onChange={(
                      event
                    ) => {
                      const value =
                        event.target.value;

                      updateField(
                        "exam_paper_id",
                        value
                      );

                      const selected =
                        formPapers.find(
                          (paper) =>
                            String(
                              paper.id
                            ) ===
                            String(
                              value
                            )
                        );

                      if (
                        selected
                      ) {
                        updateField(
                          "maximum_marks",
                          String(
                            selected.maximum_marks
                          )
                        );

                        updateField(
                          "passing_marks",
                          String(
                            selected.passing_marks
                          )
                        );
                      }
                    }}
                    style={
                      inputStyle
                    }
                    required
                  >
                    <option value="">
                      Select Subject
                    </option>

                    {formPapers.map(
                      (
                        paper
                      ) => (
                        <option
                          key={
                            paper.id
                          }
                          value={
                            paper.id
                          }
                        >
                          {
                            paper.subject_name
                          }
                          {" - "}
                          {
                            paper.paper_name
                          }
                        </option>
                      )
                    )}
                  </select>
                </Field>

                {!editingId && (
                  <Field
                    label="Student *"
                    full
                  >
                    <select
                      value={
                        form.student_id
                      }
                      onChange={(
                        event
                      ) =>
                        updateField(
                          "student_id",
                          event.target.value
                        )
                      }
                      style={
                        inputStyle
                      }
                      required
                    >
                      <option value="">
                        Select Student
                      </option>

                      {filteredStudents.map(
                        (
                          student
                        ) => (
                          <option
                            key={
                              student.id
                            }
                            value={
                              student.id
                            }
                          >
                            {student.student_id ||
                              student.student_code ||
                              student.admission_number ||
                              `Student ${student.id}`}
                            {" - "}
                            {student.first_name ||
                              ""}
                            {" "}
                            {student.last_name ||
                              ""}
                            {student.class_name
                              ? ` | Class ${student.class_name}`
                              : ""}
                            {student.section
                              ? `-${student.section}`
                              : ""}
                          </option>
                        )
                      )}
                    </select>
                  </Field>
                )}

                {editingId && (
                  <Field
                    label="Student"
                    full
                  >
                    <input
                      value={
                        form.student_id
                      }
                      disabled
                      style={{
                        ...inputStyle,
                        background:
                          "#f8fafc",
                      }}
                    />
                  </Field>
                )}

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
                        event.target.value
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
                        event.target.value
                      )
                    }
                    style={
                      inputStyle
                    }
                  />
                </Field>

                <Field label="Marks Obtained">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    disabled={
                      form.is_absent
                    }
                    value={
                      form.marks_obtained
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "marks_obtained",
                        event.target.value
                      )
                    }
                    placeholder="Enter marks"
                    style={{
                      ...inputStyle,
                      background:
                        form.is_absent
                          ? "#f8fafc"
                          : "#ffffff",
                    }}
                  />
                </Field>

                <Field label="Attendance">
                  <label
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap:
                        "10px",
                      height:
                        "42px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={
                        form.is_absent
                      }
                      onChange={(
                        event
                      ) =>
                        updateField(
                          "is_absent",
                          event.target.checked
                        )
                      }
                    />

                    <span>
                      Student was absent
                    </span>
                  </label>
                </Field>

                <Field label="Publish Result">
                  <label
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap:
                        "10px",
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
                          event.target.checked
                        )
                      }
                    />

                    <span>
                      Publish this result
                    </span>
                  </label>
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
                        event.target.value
                      )
                    }
                    rows="4"
                    placeholder="Remarks..."
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
                  gap:
                    "10px",
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
                    ? "Update Result"
                    : "Save Result"}
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
// COMPONENTS
// ============================================================

function Field({
  label,
  children,
  full = false,
}) {
  return (
    <div
      style={{
        gridColumn:
          full
            ? "1 / -1"
            : "auto",
      }}
    >
      <label
        style={{
          display:
            "block",
          fontSize:
            "13px",
          fontWeight:
            650,
          color:
            "#374151",
          marginBottom:
            "6px",
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

const cardStyle = {
  background:
    "#ffffff",
  border:
    "1px solid #e5e7eb",
  borderRadius:
    "14px",
  padding:
    "20px",
  boxShadow:
    "0 4px 14px rgba(15, 23, 42, 0.05)",
};

const buttonStyle = {
  border:
    "none",
  borderRadius:
    "8px",
  padding:
    "9px 14px",
  cursor:
    "pointer",
  fontWeight:
    600,
};

const inputStyle = {
  width:
    "100%",
  boxSizing:
    "border-box",
  border:
    "1px solid #d1d5db",
  borderRadius:
    "8px",
  padding:
    "10px 11px",
  fontSize:
    "14px",
  outline:
    "none",
  background:
    "#ffffff",
  color:
    "#111827",
};

const tableHeaderStyle = {
  textAlign:
    "left",
  padding:
    "12px 10px",
  fontSize:
    "12px",
  fontWeight:
    750,
  color:
    "#475569",
  whiteSpace:
    "nowrap",
};

const tableCellStyle = {
  padding:
    "13px 10px",
  fontSize:
    "13px",
  verticalAlign:
    "middle",
};

const smallButton = {
  border:
    "none",
  borderRadius:
    "7px",
  padding:
    "7px 9px",
  fontSize:
    "12px",
  fontWeight:
    650,
  cursor:
    "pointer",
};
