import React, { useEffect, useMemo, useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

const SCORE_FIELDS = [
  {
    key: "teaching_quality_score",
    label: "Teaching Quality",
  },
  {
    key: "student_engagement_score",
    label: "Student Engagement",
  },
  {
    key: "attendance_score",
    label: "Attendance",
  },
  {
    key: "discipline_score",
    label: "Discipline",
  },
  {
    key: "teamwork_score",
    label: "Teamwork",
  },
  {
    key: "communication_score",
    label: "Communication",
  },
  {
    key: "technology_score",
    label: "Technology",
  },
  {
    key: "leadership_score",
    label: "Leadership",
  },
];

const STATUS_OPTIONS = [
  "DRAFT",
  "SUBMITTED",
  "APPROVED",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
];

const RATING_OPTIONS = [
  "EXCELLENT",
  "VERY_GOOD",
  "GOOD",
  "NEEDS_IMPROVEMENT",
  "UNSATISFACTORY",
];

function getToken() {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    ""
  );
}

function getHeaders(includeJson = true) {
  const token = getToken();

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(options.body !== undefined),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let message = "Something went wrong.";

    try {
      const data = await response.json();

      if (typeof data?.detail === "string") {
        message = data.detail;
      } else if (Array.isArray(data?.detail)) {
        message = data.detail
          .map((item) => item.msg)
          .join(", ");
      }
    } catch {
      // Ignore JSON parsing error
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
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

function formatRating(rating) {
  if (!rating) return "-";

  return rating
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function ratingClass(rating) {
  switch (rating) {
    case "EXCELLENT":
      return "excellent";

    case "VERY_GOOD":
      return "very-good";

    case "GOOD":
      return "good";

    case "NEEDS_IMPROVEMENT":
      return "needs-improvement";

    case "UNSATISFACTORY":
      return "unsatisfactory";

    default:
      return "not-rated";
  }
}

function statusClass(status) {
  switch (status) {
    case "DRAFT":
      return "draft";

    case "SUBMITTED":
      return "submitted";

    case "APPROVED":
      return "approved";

    case "COMPLETED":
      return "completed";

    case "REJECTED":
      return "rejected";

    case "CANCELLED":
      return "cancelled";

    default:
      return "draft";
  }
}

function getInitialForm() {
  return {
    staff_id: "",
    review_period: "",
    review_start_date: "",
    review_end_date: "",
    review_date: "",

    teaching_quality_score: 0,
    student_engagement_score: 0,
    attendance_score: 0,
    discipline_score: 0,
    teamwork_score: 0,
    communication_score: 0,
    technology_score: 0,
    leadership_score: 0,

    goals: "",
    goals_achieved: "",

    kpi_score: 0,

    strengths: "",
    areas_for_improvement: "",
    manager_comments: "",
    employee_comments: "",

    promotion_recommended: "NO",
    increment_recommended: "NO",
    recommended_increment_percentage: 0,

    training_required: "NO",
    training_recommendation: "",

    remarks: "",
  };
}

export default function StaffPerformance() {
  const [staff, setStaff] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [summary, setSummary] = useState({
    total_reviews: 0,
    draft_reviews: 0,
    submitted_reviews: 0,
    approved_reviews: 0,
    completed_reviews: 0,
    average_score: 0,
    excellent_count: 0,
    very_good_count: 0,
    good_count: 0,
    needs_improvement_count: 0,
    promotion_recommended: 0,
    increment_recommended: 0,
    training_required: 0,
  });

  const [form, setForm] = useState(getInitialForm());

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [selectedReview, setSelectedReview] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [approvalRemarks, setApprovalRemarks] = useState("");
  const [cancelRemarks, setCancelRemarks] = useState("");

  // ============================================================
  // LOAD STAFF
  // ============================================================

  const loadStaff = async () => {
    try {
      setStaffLoading(true);

      const data = await apiRequest(
        `${API_BASE}/staff?page=1&page_size=100`
      );

      setStaff(data?.items || []);
    } catch (err) {
      setError(err.message || "Unable to load staff.");
    } finally {
      setStaffLoading(false);
    }
  };

  // ============================================================
  // LOAD REVIEWS
  // ============================================================

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      params.set("page", page);
      params.set("page_size", pageSize);

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (statusFilter) {
        params.set("status", statusFilter);
      }

      if (ratingFilter) {
        params.set("rating", ratingFilter);
      }

      if (periodFilter.trim()) {
        params.set("review_period", periodFilter.trim());
      }

      const data = await apiRequest(
        `${API_BASE}/staff-performance?${params.toString()}`
      );

      setReviews(data?.items || []);
      setTotalPages(data?.total_pages || 0);
    } catch (err) {
      setError(
        err.message || "Unable to load performance reviews."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOAD SUMMARY
  // ============================================================

  const loadSummary = async () => {
    try {
      const data = await apiRequest(
        `${API_BASE}/staff-performance/summary`
      );

      setSummary({
        total_reviews: data?.total_reviews || 0,
        draft_reviews: data?.draft_reviews || 0,
        submitted_reviews: data?.submitted_reviews || 0,
        approved_reviews: data?.approved_reviews || 0,
        completed_reviews: data?.completed_reviews || 0,
        average_score: data?.average_score || 0,
        excellent_count: data?.excellent_count || 0,
        very_good_count: data?.very_good_count || 0,
        good_count: data?.good_count || 0,
        needs_improvement_count:
          data?.needs_improvement_count || 0,
        promotion_recommended:
          data?.promotion_recommended || 0,
        increment_recommended:
          data?.increment_recommended || 0,
        training_required:
          data?.training_required || 0,
      });
    } catch (err) {
      setError(
        err.message || "Unable to load performance summary."
      );
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    loadReviews();
  }, [
    page,
    search,
    statusFilter,
    ratingFilter,
    periodFilter,
  ]);

  useEffect(() => {
    loadSummary();
  }, []);

  // ============================================================
  // AUTO SCORE
  // ============================================================

  const calculatedScore = useMemo(() => {
    const total = SCORE_FIELDS.reduce(
      (sum, item) =>
        sum + Number(form[item.key] || 0),
      0
    );

    return (total / SCORE_FIELDS.length).toFixed(2);
  }, [form]);

  const calculatedRating = useMemo(() => {
    const score = Number(calculatedScore);

    if (score >= 90) return "EXCELLENT";
    if (score >= 75) return "VERY_GOOD";
    if (score >= 60) return "GOOD";
    if (score >= 40) return "NEEDS_IMPROVEMENT";

    return "UNSATISFACTORY";
  }, [calculatedScore]);

  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================================================
  // OPEN NEW REVIEW
  // ============================================================

  const openNewReview = () => {
    setForm(getInitialForm());
    setSelectedReview(null);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  // ============================================================
  // SAVE REVIEW
  // ============================================================

  const handleCreate = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!form.staff_id) {
        throw new Error("Please select a staff member.");
      }

      if (!form.review_period.trim()) {
        throw new Error("Please enter a review period.");
      }

      if (!form.review_start_date) {
        throw new Error(
          "Please select the review start date."
        );
      }

      if (!form.review_end_date) {
        throw new Error(
          "Please select the review end date."
        );
      }

      const payload = {
        staff_id: Number(form.staff_id),

        review_period: form.review_period,

        review_start_date: form.review_start_date,

        review_end_date: form.review_end_date,

        review_date:
          form.review_date || null,

        teaching_quality_score:
          Number(form.teaching_quality_score || 0),

        student_engagement_score:
          Number(form.student_engagement_score || 0),

        attendance_score:
          Number(form.attendance_score || 0),

        discipline_score:
          Number(form.discipline_score || 0),

        teamwork_score:
          Number(form.teamwork_score || 0),

        communication_score:
          Number(form.communication_score || 0),

        technology_score:
          Number(form.technology_score || 0),

        leadership_score:
          Number(form.leadership_score || 0),

        overall_score:
          Number(calculatedScore),

        rating: calculatedRating,

        goals: form.goals || null,

        goals_achieved:
          form.goals_achieved || null,

        kpi_score:
          Number(form.kpi_score || 0),

        strengths:
          form.strengths || null,

        areas_for_improvement:
          form.areas_for_improvement || null,

        manager_comments:
          form.manager_comments || null,

        employee_comments:
          form.employee_comments || null,

        promotion_recommended:
          form.promotion_recommended,

        increment_recommended:
          form.increment_recommended,

        recommended_increment_percentage:
          Number(
            form.recommended_increment_percentage || 0
          ),

        training_required:
          form.training_required,

        training_recommendation:
          form.training_recommendation || null,

        remarks:
          form.remarks || null,
      };

      await apiRequest(
        `${API_BASE}/staff-performance`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

      setSuccess(
        "Performance review created successfully."
      );

      setShowForm(false);

      setForm(getInitialForm());

      await loadReviews();
      await loadSummary();
    } catch (err) {
      setError(
        err.message ||
          "Unable to create performance review."
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // VIEW DETAILS
  // ============================================================

  const openDetails = async (reviewId) => {
    try {
      setError("");

      const data = await apiRequest(
        `${API_BASE}/staff-performance/${reviewId}`
      );

      setSelectedReview(data);
      setShowDetails(true);
    } catch (err) {
      setError(
        err.message ||
          "Unable to load performance review."
      );
    }
  };

  // ============================================================
  // SUBMIT REVIEW
  // ============================================================

  const submitReview = async (review) => {
    if (
      !window.confirm(
        "Submit this performance review for approval?"
      )
    ) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await apiRequest(
        `${API_BASE}/staff-performance/${review.id}/submit`,
        {
          method: "PATCH",
          body: JSON.stringify({
            manager_comments:
              review.manager_comments || null,
            employee_comments:
              review.employee_comments || null,
            remarks:
              review.remarks || null,
          }),
        }
      );

      setSuccess(
        "Performance review submitted successfully."
      );

      await loadReviews();
      await loadSummary();

      if (selectedReview?.id === review.id) {
        const updated = await apiRequest(
          `${API_BASE}/staff-performance/${review.id}`
        );

        setSelectedReview(updated);
      }
    } catch (err) {
      setError(
        err.message ||
          "Unable to submit performance review."
      );
    }
  };

  // ============================================================
  // APPROVE REVIEW
  // ============================================================

  const approveReview = async (reviewId) => {
    try {
      setError("");
      setSuccess("");

      await apiRequest(
        `${API_BASE}/staff-performance/${reviewId}/approval`,
        {
          method: "PATCH",
          body: JSON.stringify({
            approved: true,
            remarks: approvalRemarks || null,
          }),
        }
      );

      setApprovalRemarks("");

      setSuccess(
        "Performance review approved successfully."
      );

      await loadReviews();
      await loadSummary();

      if (selectedReview?.id === reviewId) {
        const updated = await apiRequest(
          `${API_BASE}/staff-performance/${reviewId}`
        );

        setSelectedReview(updated);
      }
    } catch (err) {
      setError(
        err.message ||
          "Unable to approve performance review."
      );
    }
  };

  // ============================================================
  // REJECT REVIEW
  // ============================================================

  const rejectReview = async (reviewId) => {
    try {
      setError("");
      setSuccess("");

      await apiRequest(
        `${API_BASE}/staff-performance/${reviewId}/approval`,
        {
          method: "PATCH",
          body: JSON.stringify({
            approved: false,
            remarks: approvalRemarks || null,
          }),
        }
      );

      setApprovalRemarks("");

      setSuccess(
        "Performance review rejected."
      );

      await loadReviews();
      await loadSummary();

      if (selectedReview?.id === reviewId) {
        const updated = await apiRequest(
          `${API_BASE}/staff-performance/${reviewId}`
        );

        setSelectedReview(updated);
      }
    } catch (err) {
      setError(
        err.message ||
          "Unable to reject performance review."
      );
    }
  };

  // ============================================================
  // COMPLETE REVIEW
  // ============================================================

  const completeReview = async (reviewId) => {
    if (
      !window.confirm(
        "Mark this performance review as completed?"
      )
    ) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await apiRequest(
        `${API_BASE}/staff-performance/${reviewId}/complete`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: "COMPLETED",
            remarks: "Performance appraisal completed.",
          }),
        }
      );

      setSuccess(
        "Performance review completed successfully."
      );

      await loadReviews();
      await loadSummary();

      if (selectedReview?.id === reviewId) {
        const updated = await apiRequest(
          `${API_BASE}/staff-performance/${reviewId}`
        );

        setSelectedReview(updated);
      }
    } catch (err) {
      setError(
        err.message ||
          "Unable to complete performance review."
      );
    }
  };

  // ============================================================
  // CANCEL REVIEW
  // ============================================================

  const cancelReview = async (reviewId) => {
    if (
      !window.confirm(
        "Cancel this performance review?"
      )
    ) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await apiRequest(
        `${API_BASE}/staff-performance/${reviewId}/cancel`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: "CANCELLED",
            remarks:
              cancelRemarks ||
              "Performance review cancelled.",
          }),
        }
      );

      setCancelRemarks("");

      setSuccess(
        "Performance review cancelled."
      );

      await loadReviews();
      await loadSummary();

      if (selectedReview?.id === reviewId) {
        const updated = await apiRequest(
          `${API_BASE}/staff-performance/${reviewId}`
        );

        setSelectedReview(updated);
      }
    } catch (err) {
      setError(
        err.message ||
          "Unable to cancel performance review."
      );
    }
  };

  // ============================================================
  // DELETE REVIEW
  // ============================================================

  const deleteReview = async (reviewId) => {
    if (
      !window.confirm(
        "Delete this performance review?"
      )
    ) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await apiRequest(
        `${API_BASE}/staff-performance/${reviewId}`,
        {
          method: "DELETE",
        }
      );

      setSuccess(
        "Performance review deleted successfully."
      );

      setShowDetails(false);
      setSelectedReview(null);

      await loadReviews();
      await loadSummary();
    } catch (err) {
      setError(
        err.message ||
          "Unable to delete performance review."
      );
    }
  };

  // ============================================================
  // REFRESH
  // ============================================================

  const refreshAll = async () => {
    setError("");
    setSuccess("");

    await Promise.all([
      loadReviews(),
      loadSummary(),
      loadStaff(),
    ]);
  };

  // ============================================================
  // STAFF NAME
  // ============================================================

  const getStaffName = (staffId) => {
    const person = staff.find(
      (item) => Number(item.id) === Number(staffId)
    );

    if (!person) {
      return `Staff #${staffId}`;
    }

    return (
      `${person.first_name || ""} ${
        person.last_name || ""
      }`.trim() || person.staff_id
    );
  };

  return (
    <div
      style={{
        padding: "24px",
        background: "#f6f8fb",
        minHeight: "100vh",
        color: "#1f2937",
      }}
    >
      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: 700,
            }}
          >
            Staff Performance & Appraisal
          </h1>

          <p
            style={{
              marginTop: "6px",
              color: "#6b7280",
            }}
          >
            Evaluate staff performance, KPIs,
            goals and appraisal recommendations.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={refreshAll}
            style={secondaryButton}
          >
            ↻ Refresh
          </button>

          <button
            onClick={openNewReview}
            style={primaryButton}
          >
            + New Appraisal
          </button>
        </div>
      </div>

      {/* ====================================================== */}
      {/* ALERTS */}
      {/* ====================================================== */}

      {error && (
        <div style={errorBox}>
          {error}
        </div>
      )}

      {success && (
        <div style={successBox}>
          {success}
        </div>
      )}

      {/* ====================================================== */}
      {/* SUMMARY CARDS */}
      {/* ====================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <SummaryCard
          title="Total Reviews"
          value={summary.total_reviews}
          icon="📋"
        />

        <SummaryCard
          title="Draft"
          value={summary.draft_reviews}
          icon="📝"
        />

        <SummaryCard
          title="Submitted"
          value={summary.submitted_reviews}
          icon="📤"
        />

        <SummaryCard
          title="Approved"
          value={summary.approved_reviews}
          icon="✅"
        />

        <SummaryCard
          title="Completed"
          value={summary.completed_reviews}
          icon="🏆"
        />

        <SummaryCard
          title="Average Score"
          value={Number(
            summary.average_score || 0
          ).toFixed(2)}
          icon="⭐"
        />

        <SummaryCard
          title="Promotions"
          value={summary.promotion_recommended}
          icon="🚀"
        />

        <SummaryCard
          title="Increments"
          value={summary.increment_recommended}
          icon="💰"
        />

        <SummaryCard
          title="Training Required"
          value={summary.training_required}
          icon="🎓"
        />
      </div>

      {/* ====================================================== */}
      {/* FILTERS */}
      {/* ====================================================== */}

      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          padding: "18px",
          marginBottom: "20px",
          border: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(220px, 2fr) repeat(3, minmax(150px, 1fr)) auto",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Search staff, department, designation..."
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            style={inputStyle}
          />

          <select
            value={statusFilter}
            onChange={(event) => {
              setPage(1);
              setStatusFilter(event.target.value);
            }}
            style={inputStyle}
          >
            <option value="">All Statuses</option>

            {STATUS_OPTIONS.map((status) => (
              <option
                key={status}
                value={status}
              >
                {status}
              </option>
            ))}
          </select>

          <select
            value={ratingFilter}
            onChange={(event) => {
              setPage(1);
              setRatingFilter(event.target.value);
            }}
            style={inputStyle}
          >
            <option value="">All Ratings</option>

            {RATING_OPTIONS.map((rating) => (
              <option
                key={rating}
                value={rating}
              >
                {formatRating(rating)}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Review period"
            value={periodFilter}
            onChange={(event) => {
              setPage(1);
              setPeriodFilter(event.target.value);
            }}
            style={inputStyle}
          />

          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("");
              setRatingFilter("");
              setPeriodFilter("");
              setPage(1);
            }}
            style={secondaryButton}
          >
            Clear
          </button>
        </div>
      </div>

      {/* ====================================================== */}
      {/* TABLE */}
      {/* ====================================================== */}

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
          <h2
            style={{
              margin: 0,
              fontSize: "18px",
            }}
          >
            Performance Reviews
          </h2>

          <span
            style={{
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            {reviews.length} records
          </span>
        </div>

        {loading ? (
          <div style={emptyState}>
            Loading performance reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div style={emptyState}>
            No performance reviews found.
          </div>
        ) : (
          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "1100px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f9fafb",
                  }}
                >
                  <th style={thStyle}>
                    Staff
                  </th>

                  <th style={thStyle}>
                    Review Period
                  </th>

                  <th style={thStyle}>
                    Score
                  </th>

                  <th style={thStyle}>
                    Rating
                  </th>

                  <th style={thStyle}>
                    KPI
                  </th>

                  <th style={thStyle}>
                    Promotion
                  </th>

                  <th style={thStyle}>
                    Increment
                  </th>

                  <th style={thStyle}>
                    Status
                  </th>

                  <th style={thStyle}>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {reviews.map((review) => (
                  <tr
                    key={review.id}
                    style={{
                      borderTop:
                        "1px solid #e5e7eb",
                    }}
                  >
                    <td style={tdStyle}>
                      <div
                        style={{
                          fontWeight: 600,
                        }}
                      >
                        {review.staff_name ||
                          getStaffName(
                            review.staff_id
                          )}
                      </div>

                      <div
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          marginTop: "3px",
                        }}
                      >
                        {review.staff_code ||
                          `Staff #${review.staff_id}`}
                      </div>

                      <div
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                        }}
                      >
                        {review.designation ||
                          "-"}
                      </div>
                    </td>

                    <td style={tdStyle}>
                      <div
                        style={{
                          fontWeight: 600,
                        }}
                      >
                        {review.review_period}
                      </div>

                      <div
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                        }}
                      >
                        {formatDate(
                          review.review_start_date
                        )}{" "}
                        -{" "}
                        {formatDate(
                          review.review_end_date
                        )}
                      </div>
                    </td>

                    <td style={tdStyle}>
                      <strong>
                        {Number(
                          review.overall_score || 0
                        ).toFixed(2)}
                      </strong>
                      <span
                        style={{
                          color: "#6b7280",
                        }}
                      >
                        /100
                      </span>
                    </td>

                    <td style={tdStyle}>
                      <span
                        style={{
                          ...badgeStyle,
                          ...getRatingBadgeStyle(
                            review.rating
                          ),
                        }}
                      >
                        {formatRating(
                          review.rating
                        )}
                      </span>
                    </td>

                    <td style={tdStyle}>
                      {Number(
                        review.kpi_score || 0
                      ).toFixed(2)}
                      /100
                    </td>

                    <td style={tdStyle}>
                      {review.promotion_recommended ===
                      "YES" ? (
                        <span
                          style={{
                            ...badgeStyle,
                            background:
                              "#dcfce7",
                            color: "#166534",
                          }}
                        >
                          YES
                        </span>
                      ) : (
                        <span
                          style={{
                            color: "#6b7280",
                          }}
                        >
                          No
                        </span>
                      )}
                    </td>

                    <td style={tdStyle}>
                      {review.increment_recommended ===
                      "YES" ? (
                        <span
                          style={{
                            ...badgeStyle,
                            background:
                              "#dbeafe",
                            color: "#1d4ed8",
                          }}
                        >
                          {Number(
                            review.recommended_increment_percentage ||
                              0
                          ).toFixed(1)}
                          %
                        </span>
                      ) : (
                        <span
                          style={{
                            color: "#6b7280",
                          }}
                        >
                          No
                        </span>
                      )}
                    </td>

                    <td style={tdStyle}>
                      <span
                        style={{
                          ...badgeStyle,
                          ...getStatusBadgeStyle(
                            review.status
                          ),
                        }}
                      >
                        {review.status}
                      </span>
                    </td>

                    <td style={tdStyle}>
                      <button
                        onClick={() =>
                          openDetails(review.id)
                        }
                        style={{
                          ...smallButton,
                          marginRight: "6px",
                        }}
                      >
                        View
                      </button>

                      {review.status ===
                        "DRAFT" && (
                        <button
                          onClick={() =>
                            submitReview(
                              review
                            )
                          }
                          style={{
                            ...smallButton,
                            background:
                              "#2563eb",
                            color: "#fff",
                          }}
                        >
                          Submit
                        </button>
                      )}

                      {review.status ===
                        "APPROVED" && (
                        <button
                          onClick={() =>
                            completeReview(
                              review.id
                            )
                          }
                          style={{
                            ...smallButton,
                            background:
                              "#16a34a",
                            color: "#fff",
                          }}
                        >
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ==================================================== */}
        {/* PAGINATION */}
        {/* ==================================================== */}

        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "12px",
              padding: "16px",
              borderTop:
                "1px solid #e5e7eb",
            }}
          >
            <button
              disabled={page <= 1}
              onClick={() =>
                setPage((previous) =>
                  Math.max(1, previous - 1)
                )
              }
              style={secondaryButton}
            >
              Previous
            </button>

            <span
              style={{
                fontSize: "14px",
                color: "#6b7280",
              }}
            >
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page >= totalPages}
              onClick={() =>
                setPage((previous) =>
                  Math.min(
                    totalPages,
                    previous + 1
                  )
                )
              }
              style={secondaryButton}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* ====================================================== */}
      {/* NEW APPRAISAL MODAL */}
      {/* ====================================================== */}

      {showForm && (
        <div style={modalOverlay}>
          <div
            style={{
              ...modalContent,
              maxWidth: "1050px",
            }}
          >
            <div style={modalHeader}>
              <div>
                <h2
                  style={{
                    margin: 0,
                  }}
                >
                  New Staff Appraisal
                </h2>

                <p
                  style={{
                    margin:
                      "5px 0 0",
                    color: "#6b7280",
                  }}
                >
                  Create a performance review
                  for a staff member.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowForm(false)
                }
                style={closeButton}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleCreate}
            >
              <div
                style={{
                  padding: "22px",
                  maxHeight:
                    "72vh",
                  overflowY:
                    "auto",
                }}
              >
                {/* ============================================ */}
                {/* BASIC INFORMATION */}
                {/* ============================================ */}

                <SectionTitle>
                  Review Information
                </SectionTitle>

                <div style={formGrid}>
                  <FormField label="Staff Member">
                    <select
                      name="staff_id"
                      value={form.staff_id}
                      onChange={
                        handleChange
                      }
                      style={inputStyle}
                      required
                    >
                      <option value="">
                        {staffLoading
                          ? "Loading staff..."
                          : "Select Staff"}
                      </option>

                      {staff.map(
                        (person) => (
                          <option
                            key={
                              person.id
                            }
                            value={
                              person.id
                            }
                          >
                            {person.first_name}{" "}
                            {
                              person.last_name
                            }{" "}
                            —{" "}
                            {
                              person.designation
                            }
                          </option>
                        )
                      )}
                    </select>
                  </FormField>

                  <FormField label="Review Period">
                    <input
                      type="text"
                      name="review_period"
                      value={
                        form.review_period
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. 2026 Annual Review"
                      style={inputStyle}
                      required
                    />
                  </FormField>

                  <FormField label="Review Start Date">
                    <input
                      type="date"
                      name="review_start_date"
                      value={
                        form.review_start_date
                      }
                      onChange={
                        handleChange
                      }
                      style={inputStyle}
                      required
                    />
                  </FormField>

                  <FormField label="Review End Date">
                    <input
                      type="date"
                      name="review_end_date"
                      value={
                        form.review_end_date
                      }
                      onChange={
                        handleChange
                      }
                      style={inputStyle}
                      required
                    />
                  </FormField>

                  <FormField label="Review Date">
                    <input
                      type="date"
                      name="review_date"
                      value={
                        form.review_date
                      }
                      onChange={
                        handleChange
                      }
                      style={inputStyle}
                    />
                  </FormField>
                </div>

                {/* ============================================ */}
                {/* PERFORMANCE SCORES */}
                {/* ============================================ */}

                <SectionTitle>
                  Performance Evaluation
                </SectionTitle>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {SCORE_FIELDS.map(
                    (field) => (
                      <div
                        key={
                          field.key
                        }
                        style={{
                          border:
                            "1px solid #e5e7eb",
                          borderRadius:
                            "10px",
                          padding:
                            "14px",
                          background:
                            "#fafafa",
                        }}
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            justifyContent:
                              "space-between",
                            marginBottom:
                              "8px",
                          }}
                        >
                          <label
                            style={{
                              fontWeight:
                                600,
                              fontSize:
                                "14px",
                            }}
                          >
                            {
                              field.label
                            }
                          </label>

                          <span
                            style={{
                              fontWeight:
                                700,
                              color:
                                "#2563eb",
                            }}
                          >
                            {Number(
                              form[
                                field.key
                              ] || 0
                            )}
                            /100
                          </span>
                        </div>

                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="1"
                          name={
                            field.key
                          }
                          value={
                            form[
                              field.key
                            ]
                          }
                          onChange={
                            handleChange
                          }
                          style={{
                            width:
                              "100%",
                          }}
                        />

                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          name={
                            field.key
                          }
                          value={
                            form[
                              field.key
                            ]
                          }
                          onChange={
                            handleChange
                          }
                          style={{
                            ...inputStyle,
                            marginTop:
                              "8px",
                          }}
                        />
                      </div>
                    )
                  )}
                </div>

                {/* ============================================ */}
                {/* OVERALL SCORE */}
                {/* ============================================ */}

                <div
                  style={{
                    marginTop:
                      "20px",
                    display:
                      "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      padding:
                        "18px",
                      borderRadius:
                        "12px",
                      background:
                        "#eff6ff",
                      border:
                        "1px solid #bfdbfe",
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          "13px",
                        color:
                          "#6b7280",
                      }}
                    >
                      Overall Score
                    </div>

                    <div
                      style={{
                        fontSize:
                          "32px",
                        fontWeight:
                          700,
                        color:
                          "#1d4ed8",
                        marginTop:
                          "5px",
                      }}
                    >
                      {
                        calculatedScore
                      }
                      <span
                        style={{
                          fontSize:
                            "16px",
                          color:
                            "#6b7280",
                        }}
                      >
                        /100
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      padding:
                        "18px",
                      borderRadius:
                        "12px",
                      background:
                        "#f0fdf4",
                      border:
                        "1px solid #bbf7d0",
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          "13px",
                        color:
                          "#6b7280",
                      }}
                    >
                      Automatic Rating
                    </div>

                    <div
                      style={{
                        fontSize:
                          "22px",
                        fontWeight:
                          700,
                        marginTop:
                          "8px",
                      }}
                    >
                      {formatRating(
                        calculatedRating
                      )}
                    </div>
                  </div>

                  <FormField label="KPI Score">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      name="kpi_score"
                      value={
                        form.kpi_score
                      }
                      onChange={
                        handleChange
                      }
                      style={inputStyle}
                    />
                  </FormField>
                </div>

                {/* ============================================ */}
                {/* GOALS */}
                {/* ============================================ */}

                <SectionTitle>
                  Goals & KPI
                </SectionTitle>

                <div style={formGrid}>
                  <FormField label="Goals">
                    <textarea
                      name="goals"
                      value={
                        form.goals
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter goals assigned during the review period..."
                      style={
                        textareaStyle
                      }
                    />
                  </FormField>

                  <FormField label="Goals Achieved">
                    <textarea
                      name="goals_achieved"
                      value={
                        form.goals_achieved
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Describe achieved goals and outcomes..."
                      style={
                        textareaStyle
                      }
                    />
                  </FormField>
                </div>

                {/* ============================================ */}
                {/* FEEDBACK */}
                {/* ============================================ */}

                <SectionTitle>
                  Feedback
                </SectionTitle>

                <div style={formGrid}>
                  <FormField label="Strengths">
                    <textarea
                      name="strengths"
                      value={
                        form.strengths
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Key strengths..."
                      style={
                        textareaStyle
                      }
                    />
                  </FormField>

                  <FormField label="Areas for Improvement">
                    <textarea
                      name="areas_for_improvement"
                      value={
                        form.areas_for_improvement
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Areas requiring improvement..."
                      style={
                        textareaStyle
                      }
                    />
                  </FormField>

                  <FormField label="Manager Comments">
                    <textarea
                      name="manager_comments"
                      value={
                        form.manager_comments
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Manager's evaluation..."
                      style={
                        textareaStyle
                      }
                    />
                  </FormField>

                  <FormField label="Employee Comments">
                    <textarea
                      name="employee_comments"
                      value={
                        form.employee_comments
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Employee's comments..."
                      style={
                        textareaStyle
                      }
                    />
                  </FormField>
                </div>

                {/* ============================================ */}
                {/* CAREER RECOMMENDATIONS */}
                {/* ============================================ */}

                <SectionTitle>
                  Career & Appraisal Recommendations
                </SectionTitle>

                <div style={formGrid}>
                  <FormField label="Promotion Recommended">
                    <select
                      name="promotion_recommended"
                      value={
                        form.promotion_recommended
                      }
                      onChange={
                        handleChange
                      }
                      style={inputStyle}
                    >
                      <option value="NO">
                        No
                      </option>

                      <option value="YES">
                        Yes
                      </option>
                    </select>
                  </FormField>

                  <FormField label="Increment Recommended">
                    <select
                      name="increment_recommended"
                      value={
                        form.increment_recommended
                      }
                      onChange={
                        handleChange
                      }
                      style={inputStyle}
                    >
                      <option value="NO">
                        No
                      </option>

                      <option value="YES">
                        Yes
                      </option>
                    </select>
                  </FormField>

                  <FormField label="Recommended Increment %">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      name="recommended_increment_percentage"
                      value={
                        form.recommended_increment_percentage
                      }
                      onChange={
                        handleChange
                      }
                      style={inputStyle}
                    />
                  </FormField>

                  <FormField label="Training Required">
                    <select
                      name="training_required"
                      value={
                        form.training_required
                      }
                      onChange={
                        handleChange
                      }
                      style={inputStyle}
                    >
                      <option value="NO">
                        No
                      </option>

                      <option value="YES">
                        Yes
                      </option>
                    </select>
                  </FormField>
                </div>

                <div
                  style={{
                    marginTop:
                      "16px",
                  }}
                >
                  <FormField label="Training Recommendation">
                    <textarea
                      name="training_recommendation"
                      value={
                        form.training_recommendation
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Recommended training or development programs..."
                      style={
                        textareaStyle
                      }
                    />
                  </FormField>
                </div>

                {/* ============================================ */}
                {/* REMARKS */}
                {/* ============================================ */}

                <SectionTitle>
                  Remarks
                </SectionTitle>

                <FormField label="General Remarks">
                  <textarea
                    name="remarks"
                    value={
                      form.remarks
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Additional remarks..."
                    style={
                      textareaStyle
                    }
                  />
                </FormField>
              </div>

              {/* ============================================== */}
              {/* FORM FOOTER */}
              {/* ============================================== */}

              <div
                style={{
                  padding:
                    "16px 22px",
                  borderTop:
                    "1px solid #e5e7eb",
                  display:
                    "flex",
                  justifyContent:
                    "flex-end",
                  gap: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setShowForm(false)
                  }
                  style={
                    secondaryButton
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  style={
                    primaryButton
                  }
                >
                  {saving
                    ? "Saving..."
                    : "Create Appraisal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================== */}
      {/* DETAILS MODAL */}
      {/* ====================================================== */}

      {showDetails &&
        selectedReview && (
          <div style={modalOverlay}>
            <div
              style={{
                ...modalContent,
                maxWidth: "950px",
              }}
            >
              <div style={modalHeader}>
                <div>
                  <h2
                    style={{
                      margin: 0,
                    }}
                  >
                    Performance Review
                  </h2>

                  <p
                    style={{
                      margin:
                        "5px 0 0",
                      color:
                        "#6b7280",
                    }}
                  >
                    {
                      selectedReview.review_period
                    }
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowDetails(
                      false
                    );
                    setSelectedReview(
                      null
                    );
                  }}
                  style={closeButton}
                >
                  ×
                </button>
              </div>

              <div
                style={{
                  padding: "22px",
                  maxHeight:
                    "72vh",
                  overflowY:
                    "auto",
                }}
              >
                {/* ============================================ */}
                {/* STAFF INFO */}
                {/* ============================================ */}

                <div
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "12px",
                    marginBottom:
                      "22px",
                  }}
                >
                  <InfoBox
                    label="Staff"
                    value={
                      getStaffName(
                        selectedReview.staff_id
                      )
                    }
                  />

                  <InfoBox
                    label="Review Period"
                    value={
                      selectedReview.review_period
                    }
                  />

                  <InfoBox
                    label="Review Start"
                    value={formatDate(
                      selectedReview.review_start_date
                    )}
                  />

                  <InfoBox
                    label="Review End"
                    value={formatDate(
                      selectedReview.review_end_date
                    )}
                  />

                  <InfoBox
                    label="Overall Score"
                    value={`${Number(
                      selectedReview.overall_score ||
                        0
                    ).toFixed(2)}/100`}
                  />

                  <InfoBox
                    label="Rating"
                    value={formatRating(
                      selectedReview.rating
                    )}
                  />

                  <InfoBox
                    label="Status"
                    value={
                      selectedReview.status
                    }
                  />

                  <InfoBox
                    label="KPI Score"
                    value={`${Number(
                      selectedReview.kpi_score ||
                        0
                    ).toFixed(2)}/100`}
                  />
                </div>

                {/* ============================================ */}
                {/* SCORES */}
                {/* ============================================ */}

                <SectionTitle>
                  Performance Scores
                </SectionTitle>

                <div
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "12px",
                  }}
                >
                  {SCORE_FIELDS.map(
                    (field) => (
                      <InfoBox
                        key={
                          field.key
                        }
                        label={
                          field.label
                        }
                        value={`${Number(
                          selectedReview[
                            field.key
                          ] || 0
                        ).toFixed(2)}/100`}
                      />
                    )
                  )}
                </div>

                {/* ============================================ */}
                {/* GOALS */}
                {/* ============================================ */}

                <SectionTitle>
                  Goals & KPI
                </SectionTitle>

                <TextBox
                  label="Goals"
                  value={
                    selectedReview.goals
                  }
                />

                <TextBox
                  label="Goals Achieved"
                  value={
                    selectedReview.goals_achieved
                  }
                />

                {/* ============================================ */}
                {/* FEEDBACK */}
                {/* ============================================ */}

                <SectionTitle>
                  Feedback
                </SectionTitle>

                <TextBox
                  label="Strengths"
                  value={
                    selectedReview.strengths
                  }
                />

                <TextBox
                  label="Areas for Improvement"
                  value={
                    selectedReview.areas_for_improvement
                  }
                />

                <TextBox
                  label="Manager Comments"
                  value={
                    selectedReview.manager_comments
                  }
                />

                <TextBox
                  label="Employee Comments"
                  value={
                    selectedReview.employee_comments
                  }
                />

                {/* ============================================ */}
                {/* RECOMMENDATIONS */}
                {/* ============================================ */}

                <SectionTitle>
                  Appraisal Recommendations
                </SectionTitle>

                <div
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "12px",
                  }}
                >
                  <InfoBox
                    label="Promotion"
                    value={
                      selectedReview.promotion_recommended
                    }
                  />

                  <InfoBox
                    label="Increment"
                    value={
                      selectedReview.increment_recommended
                    }
                  />

                  <InfoBox
                    label="Recommended Increment"
                    value={`${Number(
                      selectedReview.recommended_increment_percentage ||
                        0
                    ).toFixed(2)}%`}
                  />

                  <InfoBox
                    label="Training Required"
                    value={
                      selectedReview.training_required
                    }
                  />
                </div>

                <TextBox
                  label="Training Recommendation"
                  value={
                    selectedReview.training_recommendation
                  }
                />

                <TextBox
                  label="Remarks"
                  value={
                    selectedReview.remarks
                  }
                />

                {/* ============================================ */}
                {/* APPROVAL */}
                {/* ============================================ */}

                {selectedReview.status ===
                  "SUBMITTED" && (
                  <>
                    <SectionTitle>
                      Approval
                    </SectionTitle>

                    <textarea
                      value={
                        approvalRemarks
                      }
                      onChange={(event) =>
                        setApprovalRemarks(
                          event.target
                            .value
                        )
                      }
                      placeholder="Approval/rejection remarks..."
                      style={{
                        ...textareaStyle,
                        marginBottom:
                          "12px",
                      }}
                    />

                    <div
                      style={{
                        display:
                          "flex",
                        gap: "10px",
                        flexWrap:
                          "wrap",
                      }}
                    >
                      <button
                        onClick={() =>
                          approveReview(
                            selectedReview.id
                          )
                        }
                        style={{
                          ...primaryButton,
                          background:
                            "#16a34a",
                        }}
                      >
                        ✓ Approve
                      </button>

                      <button
                        onClick={() =>
                          rejectReview(
                            selectedReview.id
                          )
                        }
                        style={{
                          ...primaryButton,
                          background:
                            "#dc2626",
                        }}
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </>
                )}

                {/* ============================================ */}
                {/* COMPLETE */}
                {/* ============================================ */}

                {selectedReview.status ===
                  "APPROVED" && (
                  <div
                    style={{
                      marginTop:
                        "20px",
                    }}
                  >
                    <button
                      onClick={() =>
                        completeReview(
                          selectedReview.id
                        )
                      }
                      style={{
                        ...primaryButton,
                        background:
                          "#16a34a",
                      }}
                    >
                      ✓ Complete Appraisal
                    </button>
                  </div>
                )}

                {/* ============================================ */}
                {/* CANCEL */}
                {/* ============================================ */}

                {![
                  "COMPLETED",
                  "CANCELLED",
                ].includes(
                  selectedReview.status
                ) && (
                  <div
                    style={{
                      marginTop:
                        "20px",
                      paddingTop:
                        "18px",
                      borderTop:
                        "1px solid #e5e7eb",
                    }}
                  >
                    <label
                      style={{
                        display:
                          "block",
                        fontWeight:
                          600,
                        marginBottom:
                          "7px",
                      }}
                    >
                      Cancellation Remarks
                    </label>

                    <textarea
                      value={
                        cancelRemarks
                      }
                      onChange={(event) =>
                        setCancelRemarks(
                          event.target
                            .value
                        )
                      }
                      placeholder="Reason for cancellation..."
                      style={{
                        ...textareaStyle,
                        marginBottom:
                          "10px",
                      }}
                    />

                    <button
                      onClick={() =>
                        cancelReview(
                          selectedReview.id
                        )
                      }
                      style={{
                        ...secondaryButton,
                        color:
                          "#dc2626",
                        borderColor:
                          "#fecaca",
                      }}
                    >
                      Cancel Review
                    </button>
                  </div>
                )}

                {/* ============================================ */}
                {/* DELETE */}
                {/* ============================================ */}

                {selectedReview.status !==
                  "COMPLETED" && (
                  <div
                    style={{
                      marginTop:
                        "20px",
                      paddingTop:
                        "18px",
                      borderTop:
                        "1px solid #e5e7eb",
                    }}
                  >
                    <button
                      onClick={() =>
                        deleteReview(
                          selectedReview.id
                        )
                      }
                      style={{
                        ...secondaryButton,
                        color:
                          "#dc2626",
                      }}
                    >
                      Delete Review
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
    </div>
  );
}


// ============================================================
// COMPONENTS
// ============================================================

function SummaryCard({
  title,
  value,
  icon,
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border:
          "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "18px",
        boxShadow:
          "0 1px 2px rgba(0,0,0,0.03)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "13px",
            color: "#6b7280",
          }}
        >
          {title}
        </span>

        <span
          style={{
            fontSize: "20px",
          }}
        >
          {icon}
        </span>
      </div>

      <div
        style={{
          marginTop: "10px",
          fontSize: "25px",
          fontWeight: 700,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontWeight: 600,
          fontSize: "14px",
          marginBottom: "7px",
        }}
      >
        {label}
      </label>

      {children}
    </div>
  );
}

function SectionTitle({
  children,
}) {
  return (
    <div
      style={{
        marginTop: "24px",
        marginBottom: "14px",
        paddingBottom: "8px",
        borderBottom:
          "1px solid #e5e7eb",
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: "17px",
        }}
      >
        {children}
      </h3>
    </div>
  );
}

function InfoBox({
  label,
  value,
}) {
  return (
    <div
      style={{
        background: "#f9fafb",
        border:
          "1px solid #e5e7eb",
        borderRadius: "10px",
        padding: "12px",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          color: "#6b7280",
          marginBottom: "5px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontWeight: 600,
        }}
      >
        {value || "-"}
      </div>
    </div>
  );
}

function TextBox({
  label,
  value,
}) {
  return (
    <div
      style={{
        marginBottom: "14px",
      }}
    >
      <div
        style={{
          fontSize: "13px",
          fontWeight: 600,
          color: "#374151",
          marginBottom: "5px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          background: "#f9fafb",
          border:
            "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "12px",
          minHeight: "42px",
          whiteSpace: "pre-wrap",
          color: value
            ? "#1f2937"
            : "#9ca3af",
        }}
      >
        {value || "No information provided."}
      </div>
    </div>
  );
}


// ============================================================
// STYLES
// ============================================================

const primaryButton = {
  border: "none",
  background: "#2563eb",
  color: "#ffffff",
  padding: "10px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "14px",
};

const secondaryButton = {
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#374151",
  padding: "9px 14px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "14px",
};

const smallButton = {
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#374151",
  padding: "6px 10px",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "12px",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  background: "#ffffff",
  color: "#111827",
  fontSize: "14px",
  outline: "none",
};

const textareaStyle = {
  width: "100%",
  minHeight: "100px",
  boxSizing: "border-box",
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  background: "#ffffff",
  color: "#111827",
  fontSize: "14px",
  resize: "vertical",
  outline: "none",
};

const formGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "16px",
};

const badgeStyle = {
  display: "inline-block",
  padding: "5px 8px",
  borderRadius: "999px",
  fontSize: "11px",
  fontWeight: 700,
};

const emptyState = {
  padding: "50px 20px",
  textAlign: "center",
  color: "#6b7280",
};

const thStyle = {
  textAlign: "left",
  padding: "13px 14px",
  fontSize: "12px",
  color: "#6b7280",
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "14px",
  fontSize: "13px",
  verticalAlign: "middle",
};

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background:
    "rgba(15, 23, 42, 0.55)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px",
  zIndex: 1000,
};

const modalContent = {
  width: "100%",
  background: "#ffffff",
  borderRadius: "14px",
  boxShadow:
    "0 20px 50px rgba(0,0,0,0.2)",
  overflow: "hidden",
};

const modalHeader = {
  padding: "18px 22px",
  borderBottom:
    "1px solid #e5e7eb",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const closeButton = {
  border: "none",
  background: "transparent",
  fontSize: "28px",
  lineHeight: 1,
  cursor: "pointer",
  color: "#6b7280",
};

const errorBox = {
  background: "#fef2f2",
  border: "1px solid #fecaca",
  color: "#b91c1c",
  padding: "12px 14px",
  borderRadius: "8px",
  marginBottom: "16px",
};

const successBox = {
  background: "#f0fdf4",
  border: "1px solid #bbf7d0",
  color: "#166534",
  padding: "12px 14px",
  borderRadius: "8px",
  marginBottom: "16px",
};


// ============================================================
// BADGE HELPERS
// ============================================================

function getRatingBadgeStyle(rating) {
  switch (rating) {
    case "EXCELLENT":
      return {
        background: "#dcfce7",
        color: "#166534",
      };

    case "VERY_GOOD":
      return {
        background: "#dbeafe",
        color: "#1d4ed8",
      };

    case "GOOD":
      return {
        background: "#fef3c7",
        color: "#92400e",
      };

    case "NEEDS_IMPROVEMENT":
      return {
        background: "#ffedd5",
        color: "#c2410c",
      };

    case "UNSATISFACTORY":
      return {
        background: "#fee2e2",
        color: "#b91c1c",
      };

    default:
      return {
        background: "#f3f4f6",
        color: "#4b5563",
      };
  }
}

function getStatusBadgeStyle(status) {
  switch (status) {
    case "DRAFT":
      return {
        background: "#f3f4f6",
        color: "#4b5563",
      };

    case "SUBMITTED":
      return {
        background: "#dbeafe",
        color: "#1d4ed8",
      };

    case "APPROVED":
      return {
        background: "#dcfce7",
        color: "#166534",
      };

    case "COMPLETED":
      return {
        background: "#dcfce7",
        color: "#166534",
      };

    case "REJECTED":
      return {
        background: "#fee2e2",
        color: "#b91c1c",
      };

    case "CANCELLED":
      return {
        background: "#f3f4f6",
        color: "#6b7280",
      };

    default:
      return {
        background: "#f3f4f6",
        color: "#4b5563",
      };
  }
}