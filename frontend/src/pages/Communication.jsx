import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const NOTICE_TYPES = [
  "GENERAL",
  "ACADEMIC",
  "FEE",
  "ATTENDANCE",
  "EXAM",
  "HOLIDAY",
  "EVENT",
  "EMERGENCY",
  "TRANSPORT",
  "ADMISSION",
  "OTHER",
];

const PRIORITIES = [
  "LOW",
  "NORMAL",
  "HIGH",
  "URGENT",
];

const STATUSES = [
  "DRAFT",
  "SCHEDULED",
  "PUBLISHED",
  "ARCHIVED",
];

const TARGET_TYPES = [
  "ALL",
  "STUDENTS",
  "PARENTS",
  "TEACHERS",
  "STAFF",
  "CLASS",
  "SECTION",
  "INDIVIDUAL",
];

const PAGE_SIZES = [10, 25, 50, 100];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
}

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function formatLabel(value) {
  if (!value) return "-";

  return value
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
}

function getItems(response) {
  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.items)) {
    return response.data.items;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  return [];
}

function getTotal(response) {
  return (
    response?.data?.total ??
    response?.data?.meta?.total ??
    0
  );
}

function getTotalPages(response, pageSize) {
  return (
    response?.data?.total_pages ??
    response?.data?.meta?.total_pages ??
    Math.max(
      1,
      Math.ceil(getTotal(response) / pageSize)
    )
  );
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong."
  );
}

function emptyForm() {
  return {
    title: "",
    message: "",
    notice_type: "GENERAL",
    priority: "NORMAL",
    target_type: "ALL",
    target_class: "",
    target_section: "",
    publish_at: "",
    expires_at: "",
  };
}

function statusStyle(status) {
  const styles = {
    DRAFT: {
      background: "#f1f5f9",
      color: "#475569",
    },
    SCHEDULED: {
      background: "#fef3c7",
      color: "#92400e",
    },
    PUBLISHED: {
      background: "#dcfce7",
      color: "#166534",
    },
    ARCHIVED: {
      background: "#fee2e2",
      color: "#991b1b",
    },
  };

  return (
    styles[status] || {
      background: "#f1f5f9",
      color: "#475569",
    }
  );
}

function priorityStyle(priority) {
  const styles = {
    LOW: {
      background: "#f1f5f9",
      color: "#475569",
    },
    NORMAL: {
      background: "#dbeafe",
      color: "#1d4ed8",
    },
    HIGH: {
      background: "#fef3c7",
      color: "#92400e",
    },
    URGENT: {
      background: "#fee2e2",
      color: "#991b1b",
    },
  };

  return (
    styles[priority] || {
      background: "#f1f5f9",
      color: "#475569",
    }
  );
}

function Communication() {
  const [activeTab, setActiveTab] =
    useState("overview");

  const [dashboard, setDashboard] =
    useState(null);

  const [notices, setNotices] = useState([]);

  const [loadingDashboard, setLoadingDashboard] =
    useState(true);

  const [loadingNotices, setLoadingNotices] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState("");

  const [priorityFilter, setPriorityFilter] =
    useState("");

  const [targetFilter, setTargetFilter] =
    useState("");

  const [activeFilter, setActiveFilter] =
    useState("");

  const [page, setPage] = useState(1);

  const [pageSize, setPageSize] =
    useState(10);

  const [total, setTotal] = useState(0);

  const [totalPages, setTotalPages] =
    useState(1);

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [form, setForm] =
    useState(emptyForm());

  const [selectedNotice, setSelectedNotice] =
    useState(null);

  const [recipients, setRecipients] =
    useState([]);

  const [recipientLoading, setRecipientLoading] =
    useState(false);

  const [recipientSearch, setRecipientSearch] =
    useState("");

  const [recipientReadFilter, setRecipientReadFilter] =
    useState("");

  const [recipientPage, setRecipientPage] =
    useState(1);

  const [recipientTotal, setRecipientTotal] =
    useState(0);

  const [recipientTotalPages, setRecipientTotalPages] =
    useState(1);

  const [noticeActionLoading, setNoticeActionLoading] =
    useState(false);

  const [formErrors, setFormErrors] =
    useState({});

  // ==========================================================
  // LOAD DASHBOARD
  // ==========================================================

  const loadDashboard = async () => {
    try {
      setLoadingDashboard(true);

      const response =
        await api.get(
          "/communication/dashboard"
        );

      setDashboard(response.data);
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    } finally {
      setLoadingDashboard(false);
    }
  };

  // ==========================================================
  // LOAD NOTICES
  // ==========================================================

  const loadNotices = async () => {
    try {
      setLoadingNotices(true);
      setError("");

      const params = {
        page,
        page_size: pageSize,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (statusFilter) {
        params.notice_status =
          statusFilter;
      }

      if (typeFilter) {
        params.notice_type =
          typeFilter;
      }

      if (priorityFilter) {
        params.priority =
          priorityFilter;
      }

      if (targetFilter) {
        params.target_type =
          targetFilter;
      }

      if (activeFilter !== "") {
        params.is_active =
          activeFilter === "true";
      }

      const response =
        await api.get(
          "/communication/notices",
          {
            params,
          }
        );

      setNotices(
        getItems(response)
      );

      setTotal(
        getTotal(response)
      );

      setTotalPages(
        getTotalPages(
          response,
          pageSize
        ) || 1
      );
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    } finally {
      setLoadingNotices(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    loadNotices();
  }, [
    page,
    pageSize,
    search,
    statusFilter,
    typeFilter,
    priorityFilter,
    targetFilter,
    activeFilter,
  ]);

  // ==========================================================
  // FORM HANDLERS
  // ==========================================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setFormErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  const resetForm = () => {
    setForm(emptyForm());
    setEditingId(null);
    setFormErrors({});
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const openEditForm = (notice) => {
    if (
      notice.status === "PUBLISHED" ||
      notice.status === "ARCHIVED"
    ) {
      setError(
        "Published or archived notices cannot be edited."
      );
      return;
    }

    setEditingId(notice.id);

    setForm({
      title: notice.title || "",
      message: notice.message || "",
      notice_type:
        notice.notice_type || "GENERAL",
      priority:
        notice.priority || "NORMAL",
      target_type:
        notice.target_type || "ALL",
      target_class:
        notice.target_class || "",
      target_section:
        notice.target_section || "",
      publish_at: notice.publish_at
        ? notice.publish_at.slice(0, 16)
        : "",
      expires_at: notice.expires_at
        ? notice.expires_at.slice(0, 16)
        : "",
    });

    setFormErrors({});
    setShowForm(true);
  };

  // ==========================================================
  // VALIDATION
  // ==========================================================

  const validateForm = () => {
    const errors = {};

    if (!form.title.trim()) {
      errors.title =
        "Title is required.";
    }

    if (form.title.trim().length < 3) {
      errors.title =
        "Title must be at least 3 characters.";
    }

    if (!form.message.trim()) {
      errors.message =
        "Message is required.";
    }

    if (
      form.target_type === "CLASS" &&
      !form.target_class.trim()
    ) {
      errors.target_class =
        "Class is required.";
    }

    if (
      form.target_type === "SECTION" &&
      !form.target_class.trim()
    ) {
      errors.target_class =
        "Class is required.";
    }

    if (
      form.target_type === "SECTION" &&
      !form.target_section.trim()
    ) {
      errors.target_section =
        "Section is required.";
    }

    if (
      form.publish_at &&
      form.expires_at
    ) {
      const publishDate =
        new Date(form.publish_at);

      const expiryDate =
        new Date(form.expires_at);

      if (expiryDate <= publishDate) {
        errors.expires_at =
          "Expiry must be later than publish time.";
      }
    }

    setFormErrors(errors);

    return (
      Object.keys(errors).length === 0
    );
  };

  // ==========================================================
  // SAVE NOTICE
  // ==========================================================

  const handleSave = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        title: form.title.trim(),
        message: form.message.trim(),
        notice_type: form.notice_type,
        priority: form.priority,
        target_type: form.target_type,
        target_class:
          form.target_class.trim() || null,
        target_section:
          form.target_section.trim() || null,
        publish_at:
          form.publish_at
            ? new Date(
                form.publish_at
              ).toISOString()
            : null,
        expires_at:
          form.expires_at
            ? new Date(
                form.expires_at
              ).toISOString()
            : null,
      };

      if (editingId) {
        await api.put(
          `/communication/notices/${editingId}`,
          payload
        );

        setSuccess(
          "Notice updated successfully."
        );
      } else {
        await api.post(
          "/communication/notices",
          payload
        );

        setSuccess(
          "Notice created successfully."
        );
      }

      setShowForm(false);
      resetForm();

      await Promise.all([
        loadNotices(),
        loadDashboard(),
      ]);
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // STATUS ACTION
  // ==========================================================

  const updateStatus = async (
    notice,
    newStatus
  ) => {
    try {
      setNoticeActionLoading(true);
      setError("");
      setSuccess("");

      await api.patch(
        `/communication/notices/${notice.id}/status`,
        {
          status: newStatus,
        }
      );

      setSuccess(
        `Notice ${newStatus.toLowerCase()} successfully.`
      );

      await Promise.all([
        loadNotices(),
        loadDashboard(),
      ]);

      if (
        selectedNotice?.id === notice.id
      ) {
        setSelectedNotice(
          (current) =>
            current
              ? {
                  ...current,
                  status: newStatus,
                }
              : current
        );
      }
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    } finally {
      setNoticeActionLoading(false);
    }
  };

  // ==========================================================
  // ARCHIVE
  // ==========================================================

  const archiveNotice = async (
    notice
  ) => {
    if (
      !window.confirm(
        `Archive "${notice.title}"?`
      )
    ) {
      return;
    }

    try {
      setNoticeActionLoading(true);
      setError("");

      await api.delete(
        `/communication/notices/${notice.id}`
      );

      setSuccess(
        "Notice archived successfully."
      );

      await Promise.all([
        loadNotices(),
        loadDashboard(),
      ]);

      if (
        selectedNotice?.id === notice.id
      ) {
        setSelectedNotice(null);
      }
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    } finally {
      setNoticeActionLoading(false);
    }
  };

  // ==========================================================
  // RESTORE
  // ==========================================================

  const restoreNotice = async (
    notice
  ) => {
    try {
      setNoticeActionLoading(true);
      setError("");

      await api.patch(
        `/communication/notices/${notice.id}/restore`
      );

      setSuccess(
        "Notice restored successfully."
      );

      await Promise.all([
        loadNotices(),
        loadDashboard(),
      ]);
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    } finally {
      setNoticeActionLoading(false);
    }
  };

  // ==========================================================
  // RECIPIENTS
  // ==========================================================

  const loadRecipients = async (
    noticeId
  ) => {
    try {
      setRecipientLoading(true);

      const params = {
        page: recipientPage,
        page_size: 25,
      };

      if (recipientSearch.trim()) {
        params.search =
          recipientSearch.trim();
      }

      if (recipientReadFilter !== "") {
        params.is_read =
          recipientReadFilter === "true";
      }

      const response =
        await api.get(
          `/communication/notices/${noticeId}/recipients`,
          {
            params,
          }
        );

      setRecipients(
        getItems(response)
      );

      setRecipientTotal(
        getTotal(response)
      );

      setRecipientTotalPages(
        getTotalPages(
          response,
          25
        ) || 1
      );
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    } finally {
      setRecipientLoading(false);
    }
  };

  const openRecipients = async (
    notice
  ) => {
    setSelectedNotice(notice);
    setRecipientSearch("");
    setRecipientReadFilter("");
    setRecipientPage(1);

    try {
      setRecipientLoading(true);

      const response =
        await api.get(
          `/communication/notices/${notice.id}/recipients`,
          {
            params: {
              page: 1,
              page_size: 25,
            },
          }
        );

      setRecipients(
        getItems(response)
      );

      setRecipientTotal(
        getTotal(response)
      );

      setRecipientTotalPages(
        getTotalPages(
          response,
          25
        ) || 1
      );
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    } finally {
      setRecipientLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedNotice) {
      return;
    }

    loadRecipients(
      selectedNotice.id
    );
  }, [
    recipientPage,
    recipientSearch,
    recipientReadFilter,
  ]);

  // ==========================================================
  // DERIVED VALUES
  // ==========================================================

  const readPercentage = useMemo(() => {
    if (
      !dashboard ||
      !dashboard.total_recipients
    ) {
      return 0;
    }

    return Math.round(
      (
        dashboard.read_recipients /
        dashboard.total_recipients
      ) *
        100
    );
  }, [dashboard]);

  // ==========================================================
  // STYLES
  // ==========================================================

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#f8fafc",
      padding: "24px",
      color: "#0f172a",
    },

    container: {
      maxWidth: "1400px",
      margin: "0 auto",
    },

    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "16px",
      marginBottom: "24px",
      flexWrap: "wrap",
    },

    title: {
      margin: 0,
      fontSize: "30px",
      fontWeight: 700,
    },

    subtitle: {
      margin: "6px 0 0",
      color: "#64748b",
    },

    primaryButton: {
      border: "none",
      borderRadius: "10px",
      padding: "11px 16px",
      background: "#2563eb",
      color: "#fff",
      cursor: "pointer",
      fontWeight: 600,
    },

    secondaryButton: {
      border: "1px solid #cbd5e1",
      borderRadius: "9px",
      padding: "9px 13px",
      background: "#fff",
      color: "#334155",
      cursor: "pointer",
      fontWeight: 600,
    },

    dangerButton: {
      border: "1px solid #fecaca",
      borderRadius: "9px",
      padding: "9px 13px",
      background: "#fff",
      color: "#b91c1c",
      cursor: "pointer",
      fontWeight: 600,
    },

    successButton: {
      border: "none",
      borderRadius: "9px",
      padding: "9px 13px",
      background: "#16a34a",
      color: "#fff",
      cursor: "pointer",
      fontWeight: 600,
    },

    tabs: {
      display: "flex",
      gap: "8px",
      marginBottom: "20px",
      flexWrap: "wrap",
    },

    tab: {
      padding: "10px 16px",
      borderRadius: "10px",
      border: "1px solid #e2e8f0",
      background: "#fff",
      cursor: "pointer",
      fontWeight: 600,
    },

    activeTab: {
      background: "#0f172a",
      color: "#fff",
      borderColor: "#0f172a",
    },

    grid: {
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit, minmax(190px, 1fr))",
      gap: "16px",
    },

    card: {
      background: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: "14px",
      padding: "18px",
      boxShadow:
        "0 2px 8px rgba(15, 23, 42, 0.04)",
    },

    statLabel: {
      color: "#64748b",
      fontSize: "14px",
      marginBottom: "8px",
    },

    statValue: {
      fontSize: "28px",
      fontWeight: 700,
    },

    toolbar: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
      marginBottom: "16px",
    },

    input: {
      padding: "10px 12px",
      borderRadius: "9px",
      border: "1px solid #cbd5e1",
      background: "#fff",
      minWidth: "180px",
      outline: "none",
    },

    select: {
      padding: "10px 12px",
      borderRadius: "9px",
      border: "1px solid #cbd5e1",
      background: "#fff",
      minWidth: "160px",
      outline: "none",
    },

    tableWrapper: {
      background: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: "14px",
      overflowX: "auto",
    },

    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: "1100px",
    },

    th: {
      textAlign: "left",
      padding: "13px 14px",
      background: "#f8fafc",
      borderBottom:
        "1px solid #e2e8f0",
      fontSize: "13px",
      color: "#475569",
    },

    td: {
      padding: "14px",
      borderBottom:
        "1px solid #f1f5f9",
      verticalAlign: "top",
      fontSize: "14px",
    },

    badge: {
      display: "inline-block",
      padding: "5px 9px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: 700,
    },

    actions: {
      display: "flex",
      gap: "7px",
      flexWrap: "wrap",
    },

    pagination: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "12px",
      marginTop: "16px",
      flexWrap: "wrap",
    },

    paginationButtons: {
      display: "flex",
      gap: "7px",
    },

    modalOverlay: {
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
      background: "#fff",
      borderRadius: "16px",
      width: "100%",
      maxWidth: "760px",
      maxHeight: "90vh",
      overflowY: "auto",
      padding: "24px",
      boxShadow:
        "0 20px 60px rgba(15, 23, 42, 0.25)",
    },

    wideModal: {
      background: "#fff",
      borderRadius: "16px",
      width: "100%",
      maxWidth: "1050px",
      maxHeight: "90vh",
      overflowY: "auto",
      padding: "24px",
      boxShadow:
        "0 20px 60px rgba(15, 23, 42, 0.25)",
    },

    formGrid: {
      display: "grid",
      gridTemplateColumns:
        "repeat(2, minmax(0, 1fr))",
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
      fontWeight: 700,
      color: "#334155",
    },

    textarea: {
      padding: "11px 12px",
      borderRadius: "9px",
      border: "1px solid #cbd5e1",
      minHeight: "150px",
      resize: "vertical",
      fontFamily: "inherit",
      outline: "none",
    },

    errorText: {
      color: "#dc2626",
      fontSize: "12px",
    },

    alertError: {
      background: "#fef2f2",
      border:
        "1px solid #fecaca",
      color: "#991b1b",
      padding: "12px 14px",
      borderRadius: "10px",
      marginBottom: "16px",
    },

    alertSuccess: {
      background: "#f0fdf4",
      border:
        "1px solid #bbf7d0",
      color: "#166534",
      padding: "12px 14px",
      borderRadius: "10px",
      marginBottom: "16px",
    },

    modalHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "12px",
      marginBottom: "20px",
    },

    closeButton: {
      border: "none",
      background: "#f1f5f9",
      borderRadius: "8px",
      padding: "8px 12px",
      cursor: "pointer",
    },

    empty: {
      textAlign: "center",
      padding: "40px 20px",
      color: "#64748b",
    },
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* HEADER */}

        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              Communication Management
            </h1>

            <p style={styles.subtitle}>
              Manage school notices, announcements,
              recipients and communication history.
            </p>
          </div>

          <button
            style={styles.primaryButton}
            onClick={openCreateForm}
          >
            + New Notice
          </button>
        </div>

        {error && (
          <div style={styles.alertError}>
            {error}
          </div>
        )}

        {success && (
          <div style={styles.alertSuccess}>
            {success}
          </div>
        )}

        {/* TABS */}

        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === "overview"
                ? styles.activeTab
                : {}),
            }}
            onClick={() =>
              setActiveTab("overview")
            }
          >
            Overview
          </button>

          <button
            style={{
              ...styles.tab,
              ...(activeTab === "notices"
                ? styles.activeTab
                : {}),
            }}
            onClick={() =>
              setActiveTab("notices")
            }
          >
            Notices
          </button>
        </div>

        {/* ====================================================
            OVERVIEW
        ==================================================== */}

        {activeTab === "overview" && (
          <>
            {loadingDashboard ? (
              <div style={styles.card}>
                Loading communication dashboard...
              </div>
            ) : (
              <>
                <div style={styles.grid}>
                  <div style={styles.card}>
                    <div style={styles.statLabel}>
                      Total Notices
                    </div>

                    <div style={styles.statValue}>
                      {dashboard?.total_notices ??
                        0}
                    </div>
                  </div>

                  <div style={styles.card}>
                    <div style={styles.statLabel}>
                      Draft
                    </div>

                    <div style={styles.statValue}>
                      {dashboard?.draft_notices ??
                        0}
                    </div>
                  </div>

                  <div style={styles.card}>
                    <div style={styles.statLabel}>
                      Scheduled
                    </div>

                    <div style={styles.statValue}>
                      {dashboard?.scheduled_notices ??
                        0}
                    </div>
                  </div>

                  <div style={styles.card}>
                    <div style={styles.statLabel}>
                      Published
                    </div>

                    <div style={styles.statValue}>
                      {dashboard?.published_notices ??
                        0}
                    </div>
                  </div>

                  <div style={styles.card}>
                    <div style={styles.statLabel}>
                      Archived
                    </div>

                    <div style={styles.statValue}>
                      {dashboard?.archived_notices ??
                        0}
                    </div>
                  </div>

                  <div style={styles.card}>
                    <div style={styles.statLabel}>
                      Total Recipients
                    </div>

                    <div style={styles.statValue}>
                      {dashboard?.total_recipients ??
                        0}
                    </div>
                  </div>

                  <div style={styles.card}>
                    <div style={styles.statLabel}>
                      Read
                    </div>

                    <div style={styles.statValue}>
                      {dashboard?.read_recipients ??
                        0}
                    </div>

                    <div
                      style={{
                        marginTop: "6px",
                        color: "#16a34a",
                        fontSize: "13px",
                        fontWeight: 600,
                      }}
                    >
                      {readPercentage}% read
                    </div>
                  </div>

                  <div style={styles.card}>
                    <div style={styles.statLabel}>
                      Unread
                    </div>

                    <div style={styles.statValue}>
                      {dashboard?.unread_recipients ??
                        0}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    ...styles.grid,
                    marginTop: "18px",
                  }}
                >
                  <div style={styles.card}>
                    <h3>
                      Communication Workflow
                    </h3>

                    <p
                      style={{
                        color: "#64748b",
                        lineHeight: 1.7,
                      }}
                    >
                      Create notices as drafts,
                      schedule them for future
                      publishing, publish them to
                      targeted audiences, and track
                      recipient read status.
                    </p>
                  </div>

                  <div style={styles.card}>
                    <h3>
                      Target Audiences
                    </h3>

                    <p
                      style={{
                        color: "#64748b",
                        lineHeight: 1.7,
                      }}
                    >
                      Notices can target the whole
                      school, students, parents,
                      teachers, staff, classes or
                      sections.
                    </p>
                  </div>

                  <div style={styles.card}>
                    <h3>
                      Delivery Tracking
                    </h3>

                    <p
                      style={{
                        color: "#64748b",
                        lineHeight: 1.7,
                      }}
                    >
                      Each recipient gets an individual
                      communication record so read,
                      unread and delivery information
                      can be tracked.
                    </p>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ====================================================
            NOTICES
        ==================================================== */}

        {activeTab === "notices" && (
          <>
            <div style={styles.card}>
              <div style={styles.toolbar}>
                <input
                  style={styles.input}
                  placeholder="Search notices..."
                  value={search}
                  onChange={(event) => {
                    setSearch(
                      event.target.value
                    );
                    setPage(1);
                  }}
                />

                <select
                  style={styles.select}
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(
                      event.target.value
                    );
                    setPage(1);
                  }}
                >
                  <option value="">
                    All Statuses
                  </option>

                  {STATUSES.map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {formatLabel(status)}
                      </option>
                    )
                  )}
                </select>

                <select
                  style={styles.select}
                  value={typeFilter}
                  onChange={(event) => {
                    setTypeFilter(
                      event.target.value
                    );
                    setPage(1);
                  }}
                >
                  <option value="">
                    All Types
                  </option>

                  {NOTICE_TYPES.map(
                    (type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {formatLabel(type)}
                      </option>
                    )
                  )}
                </select>

                <select
                  style={styles.select}
                  value={priorityFilter}
                  onChange={(event) => {
                    setPriorityFilter(
                      event.target.value
                    );
                    setPage(1);
                  }}
                >
                  <option value="">
                    All Priorities
                  </option>

                  {PRIORITIES.map(
                    (priority) => (
                      <option
                        key={priority}
                        value={priority}
                      >
                        {formatLabel(priority)}
                      </option>
                    )
                  )}
                </select>

                <select
                  style={styles.select}
                  value={targetFilter}
                  onChange={(event) => {
                    setTargetFilter(
                      event.target.value
                    );
                    setPage(1);
                  }}
                >
                  <option value="">
                    All Audiences
                  </option>

                  {TARGET_TYPES.map(
                    (target) => (
                      <option
                        key={target}
                        value={target}
                      >
                        {formatLabel(target)}
                      </option>
                    )
                  )}
                </select>

                <select
                  style={styles.select}
                  value={activeFilter}
                  onChange={(event) => {
                    setActiveFilter(
                      event.target.value
                    );
                    setPage(1);
                  }}
                >
                  <option value="">
                    Active + Archived
                  </option>

                  <option value="true">
                    Active Only
                  </option>

                  <option value="false">
                    Archived Only
                  </option>
                </select>

                <select
                  style={styles.select}
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(
                      Number(
                        event.target.value
                      )
                    );
                    setPage(1);
                  }}
                >
                  {PAGE_SIZES.map(
                    (size) => (
                      <option
                        key={size}
                        value={size}
                      >
                        {size} / page
                      </option>
                    )
                  )}
                </select>

                <button
                  style={styles.secondaryButton}
                  onClick={() => {
                    loadNotices();
                    loadDashboard();
                  }}
                >
                  Refresh
                </button>
              </div>

              <div
                style={{
                  marginBottom: "15px",
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                {total} notice
                {total === 1
                  ? ""
                  : "s"} found
              </div>
            </div>

            <div
              style={{
                ...styles.tableWrapper,
                marginTop: "16px",
              }}
            >
              {loadingNotices ? (
                <div style={styles.empty}>
                  Loading notices...
                </div>
              ) : notices.length === 0 ? (
                <div style={styles.empty}>
                  No notices found.
                </div>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>
                        Notice
                      </th>

                      <th style={styles.th}>
                        Type
                      </th>

                      <th style={styles.th}>
                        Audience
                      </th>

                      <th style={styles.th}>
                        Priority
                      </th>

                      <th style={styles.th}>
                        Status
                      </th>

                      <th style={styles.th}>
                        Publish
                      </th>

                      <th style={styles.th}>
                        Created
                      </th>

                      <th style={styles.th}>
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {notices.map(
                      (notice) => {
                        const s =
                          statusStyle(
                            notice.status
                          );

                        const p =
                          priorityStyle(
                            notice.priority
                          );

                        return (
                          <tr
                            key={notice.id}
                          >
                            <td
                              style={
                                styles.td
                              }
                            >
                              <div
                                style={{
                                  fontWeight: 700,
                                }}
                              >
                                {
                                  notice.title
                                }
                              </div>

                              <div
                                style={{
                                  marginTop:
                                    "5px",
                                  color:
                                    "#64748b",
                                  fontSize:
                                    "12px",
                                }}
                              >
                                {
                                  notice.notice_number
                                }
                              </div>
                            </td>

                            <td
                              style={
                                styles.td
                              }
                            >
                              {
                                formatLabel(
                                  notice.notice_type
                                )
                              }
                            </td>

                            <td
                              style={
                                styles.td
                              }
                            >
                              <div>
                                {formatLabel(
                                  notice.target_type
                                )}
                              </div>

                              {notice.target_class && (
                                <div
                                  style={{
                                    color:
                                      "#64748b",
                                    fontSize:
                                      "12px",
                                    marginTop:
                                      "4px",
                                  }}
                                >
                                  Class:{" "}
                                  {
                                    notice.target_class
                                  }

                                  {notice.target_section
                                    ? ` / Section ${notice.target_section}`
                                    : ""}
                                </div>
                              )}
                            </td>

                            <td
                              style={
                                styles.td
                              }
                            >
                              <span
                                style={{
                                  ...styles.badge,
                                  ...p,
                                }}
                              >
                                {formatLabel(
                                  notice.priority
                                )}
                              </span>
                            </td>

                            <td
                              style={
                                styles.td
                              }
                            >
                              <span
                                style={{
                                  ...styles.badge,
                                  ...s,
                                }}
                              >
                                {formatLabel(
                                  notice.status
                                )}
                              </span>
                            </td>

                            <td
                              style={
                                styles.td
                              }
                            >
                              {formatDateTime(
                                notice.publish_at
                              )}
                            </td>

                            <td
                              style={
                                styles.td
                              }
                            >
                              {formatDate(
                                notice.created_at
                              )}
                            </td>

                            <td
                              style={
                                styles.td
                              }
                            >
                              <div
                                style={
                                  styles.actions
                                }
                              >
                                <button
                                  style={
                                    styles.secondaryButton
                                  }
                                  onClick={() =>
                                    openRecipients(
                                      notice
                                    )
                                  }
                                >
                                  Recipients
                                </button>

                                {(
                                  notice.status ===
                                    "DRAFT" ||
                                  notice.status ===
                                    "SCHEDULED"
                                ) && (
                                  <button
                                    style={
                                      styles.secondaryButton
                                    }
                                    onClick={() =>
                                      openEditForm(
                                        notice
                                      )
                                    }
                                  >
                                    Edit
                                  </button>
                                )}

                                {notice.status ===
                                  "DRAFT" && (
                                  <>
                                    <button
                                      style={
                                        styles.successButton
                                      }
                                      onClick={() =>
                                        updateStatus(
                                          notice,
                                          "PUBLISHED"
                                        )
                                      }
                                      disabled={
                                        noticeActionLoading
                                      }
                                    >
                                      Publish
                                    </button>

                                    <button
                                      style={
                                        styles.secondaryButton
                                      }
                                      onClick={() =>
                                        updateStatus(
                                          notice,
                                          "SCHEDULED"
                                        )
                                      }
                                      disabled={
                                        noticeActionLoading
                                      }
                                    >
                                      Schedule
                                    </button>
                                  </>
                                )}

                                {notice.status ===
                                  "SCHEDULED" && (
                                  <button
                                    style={
                                      styles.successButton
                                    }
                                    onClick={() =>
                                      updateStatus(
                                        notice,
                                        "PUBLISHED"
                                      )
                                    }
                                    disabled={
                                      noticeActionLoading
                                    }
                                  >
                                    Publish
                                  </button>
                                )}

                                {notice.status !==
                                  "ARCHIVED" ? (
                                  <button
                                    style={
                                      styles.dangerButton
                                    }
                                    onClick={() =>
                                      archiveNotice(
                                        notice
                                      )
                                    }
                                    disabled={
                                      noticeActionLoading
                                    }
                                  >
                                    Archive
                                  </button>
                                ) : (
                                  <button
                                    style={
                                      styles.secondaryButton
                                    }
                                    onClick={() =>
                                      restoreNotice(
                                        notice
                                      )
                                    }
                                    disabled={
                                      noticeActionLoading
                                    }
                                  >
                                    Restore
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div style={styles.pagination}>
              <div
                style={{
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                Page {page} of{" "}
                {totalPages}
              </div>

              <div
                style={
                  styles.paginationButtons
                }
              >
                <button
                  style={
                    styles.secondaryButton
                  }
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
                >
                  Previous
                </button>

                <button
                  style={
                    styles.secondaryButton
                  }
                  disabled={
                    page >= totalPages
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
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ======================================================
          CREATE / EDIT MODAL
      ====================================================== */}

      {showForm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <h2
                  style={{
                    margin: 0,
                  }}
                >
                  {editingId
                    ? "Edit Notice"
                    : "Create New Notice"}
                </h2>

                <p
                  style={{
                    margin:
                      "5px 0 0",
                    color:
                      "#64748b",
                  }}
                >
                  Create a school announcement
                  and select its target audience.
                </p>
              </div>

              <button
                style={styles.closeButton}
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSave}
            >
              <div
                style={
                  styles.formGrid
                }
              >
                <div
                  style={{
                    ...styles.formGroup,
                    ...styles.fullWidth,
                  }}
                >
                  <label
                    style={styles.label}
                  >
                    Title *
                  </label>

                  <input
                    style={styles.input}
                    name="title"
                    value={form.title}
                    onChange={
                      handleChange
                    }
                    placeholder="Notice title"
                  />

                  {formErrors.title && (
                    <span
                      style={
                        styles.errorText
                      }
                    >
                      {
                        formErrors.title
                      }
                    </span>
                  )}
                </div>

                <div
                  style={
                    styles.formGroup
                  }
                >
                  <label
                    style={styles.label}
                  >
                    Notice Type
                  </label>

                  <select
                    style={styles.select}
                    name="notice_type"
                    value={
                      form.notice_type
                    }
                    onChange={
                      handleChange
                    }
                  >
                    {NOTICE_TYPES.map(
                      (type) => (
                        <option
                          key={type}
                          value={type}
                        >
                          {formatLabel(
                            type
                          )}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div
                  style={
                    styles.formGroup
                  }
                >
                  <label
                    style={styles.label}
                  >
                    Priority
                  </label>

                  <select
                    style={styles.select}
                    name="priority"
                    value={
                      form.priority
                    }
                    onChange={
                      handleChange
                    }
                  >
                    {PRIORITIES.map(
                      (priority) => (
                        <option
                          key={priority}
                          value={
                            priority
                          }
                        >
                          {formatLabel(
                            priority
                          )}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div
                  style={
                    styles.formGroup
                  }
                >
                  <label
                    style={styles.label}
                  >
                    Target Audience
                  </label>

                  <select
                    style={styles.select}
                    name="target_type"
                    value={
                      form.target_type
                    }
                    onChange={
                      handleChange
                    }
                  >
                    {TARGET_TYPES.map(
                      (target) => (
                        <option
                          key={target}
                          value={target}
                        >
                          {formatLabel(
                            target
                          )}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {(form.target_type ===
                  "CLASS" ||
                  form.target_type ===
                    "SECTION") && (
                  <div
                    style={
                      styles.formGroup
                    }
                  >
                    <label
                      style={styles.label}
                    >
                      Class *
                    </label>

                    <input
                      style={
                        styles.input
                      }
                      name="target_class"
                      value={
                        form.target_class
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Example: 8"
                    />

                    {formErrors.target_class && (
                      <span
                        style={
                          styles.errorText
                        }
                      >
                        {
                          formErrors.target_class
                        }
                      </span>
                    )}
                  </div>
                )}

                {form.target_type ===
                  "SECTION" && (
                  <div
                    style={
                      styles.formGroup
                    }
                  >
                    <label
                      style={styles.label}
                    >
                      Section *
                    </label>

                    <input
                      style={
                        styles.input
                      }
                      name="target_section"
                      value={
                        form.target_section
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Example: A"
                    />

                    {formErrors.target_section && (
                      <span
                        style={
                          styles.errorText
                        }
                      >
                        {
                          formErrors.target_section
                        }
                      </span>
                    )}
                  </div>
                )}

                <div
                  style={
                    styles.formGroup
                  }
                >
                  <label
                    style={styles.label}
                  >
                    Publish At
                  </label>

                  <input
                    style={styles.input}
                    type="datetime-local"
                    name="publish_at"
                    value={
                      form.publish_at
                    }
                    onChange={
                      handleChange
                    }
                  />
                </div>

                <div
                  style={
                    styles.formGroup
                  }
                >
                  <label
                    style={styles.label}
                  >
                    Expires At
                  </label>

                  <input
                    style={styles.input}
                    type="datetime-local"
                    name="expires_at"
                    value={
                      form.expires_at
                    }
                    onChange={
                      handleChange
                    }
                  />

                  {formErrors.expires_at && (
                    <span
                      style={
                        styles.errorText
                      }
                    >
                      {
                        formErrors.expires_at
                      }
                    </span>
                  )}
                </div>

                <div
                  style={{
                    ...styles.formGroup,
                    ...styles.fullWidth,
                  }}
                >
                  <label
                    style={styles.label}
                  >
                    Message *
                  </label>

                  <textarea
                    style={
                      styles.textarea
                    }
                    name="message"
                    value={
                      form.message
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Write the announcement..."
                  />

                  {formErrors.message && (
                    <span
                      style={
                        styles.errorText
                      }
                    >
                      {
                        formErrors.message
                      }
                    </span>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "flex-end",
                  gap: "10px",
                  marginTop:
                    "22px",
                }}
              >
                <button
                  type="button"
                  style={
                    styles.secondaryButton
                  }
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={
                    styles.primaryButton
                  }
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Notice"
                    : "Save Draft"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================
          RECIPIENT MODAL
      ====================================================== */}

      {selectedNotice && (
        <div style={styles.modalOverlay}>
          <div style={styles.wideModal}>
            <div style={styles.modalHeader}>
              <div>
                <h2
                  style={{
                    margin: 0,
                  }}
                >
                  Notice Recipients
                </h2>

                <p
                  style={{
                    margin:
                      "5px 0 0",
                    color:
                      "#64748b",
                  }}
                >
                  {
                    selectedNotice.title
                  }
                </p>
              </div>

              <button
                style={styles.closeButton}
                onClick={() =>
                  setSelectedNotice(
                    null
                  )
                }
              >
                ✕
              </button>
            </div>

            <div
              style={{
                ...styles.toolbar,
                marginBottom:
                  "16px",
              }}
            >
              <input
                style={styles.input}
                placeholder="Search recipient..."
                value={
                  recipientSearch
                }
                onChange={(event) => {
                  setRecipientSearch(
                    event.target.value
                  );
                  setRecipientPage(1);
                }}
              />

              <select
                style={styles.select}
                value={
                  recipientReadFilter
                }
                onChange={(event) => {
                  setRecipientReadFilter(
                    event.target.value
                  );
                  setRecipientPage(1);
                }}
              >
                <option value="">
                  All Read Status
                </option>

                <option value="true">
                  Read
                </option>

                <option value="false">
                  Unread
                </option>
              </select>
            </div>

            <div
              style={{
                color:
                  "#64748b",
                marginBottom:
                  "12px",
              }}
            >
              {recipientTotal} recipient
              {recipientTotal === 1
                ? ""
                : "s"}
            </div>

            <div
              style={
                styles.tableWrapper
              }
            >
              {recipientLoading ? (
                <div
                  style={styles.empty}
                >
                  Loading recipients...
                </div>
              ) : recipients.length ===
                0 ? (
                <div
                  style={styles.empty}
                >
                  No recipients found.
                </div>
              ) : (
                <table
                  style={styles.table}
                >
                  <thead>
                    <tr>
                      <th
                        style={
                          styles.th
                        }
                      >
                        User ID
                      </th>

                      <th
                        style={
                          styles.th
                        }
                      >
                        Role
                      </th>

                      <th
                        style={
                          styles.th
                        }
                      >
                        Delivery
                      </th>

                      <th
                        style={
                          styles.th
                        }
                      >
                        Read
                      </th>

                      <th
                        style={
                          styles.th
                        }
                      >
                        Read At
                      </th>

                      <th
                        style={
                          styles.th
                        }
                      >
                        Created
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {recipients.map(
                      (recipient) => (
                        <tr
                          key={
                            recipient.id
                          }
                        >
                          <td
                            style={
                              styles.td
                            }
                          >
                            {
                              recipient.recipient_user_id
                            }
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            {formatLabel(
                              recipient.recipient_role
                            )}
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            <span
                              style={{
                                ...styles.badge,
                                background:
                                  recipient.delivery_status ===
                                  "FAILED"
                                    ? "#fee2e2"
                                    : recipient.delivery_status ===
                                      "DELIVERED"
                                    ? "#dcfce7"
                                    : "#fef3c7",
                                color:
                                  recipient.delivery_status ===
                                  "FAILED"
                                    ? "#991b1b"
                                    : recipient.delivery_status ===
                                      "DELIVERED"
                                    ? "#166534"
                                    : "#92400e",
                              }}
                            >
                              {formatLabel(
                                recipient.delivery_status
                              )}
                            </span>
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            {recipient.is_read
                              ? "Read"
                              : "Unread"}
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            {formatDateTime(
                              recipient.read_at
                            )}
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            {formatDateTime(
                              recipient.created_at
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div
              style={
                styles.pagination
              }
            >
              <div
                style={{
                  color:
                    "#64748b",
                  fontSize:
                    "14px",
                }}
              >
                Page{" "}
                {recipientPage} of{" "}
                {recipientTotalPages}
              </div>

              <div
                style={
                  styles.paginationButtons
                }
              >
                <button
                  style={
                    styles.secondaryButton
                  }
                  disabled={
                    recipientPage <=
                    1
                  }
                  onClick={() =>
                    setRecipientPage(
                      (current) =>
                        Math.max(
                          1,
                          current - 1
                        )
                    )
                  }
                >
                  Previous
                </button>

                <button
                  style={
                    styles.secondaryButton
                  }
                  disabled={
                    recipientPage >=
                    recipientTotalPages
                  }
                  onClick={() =>
                    setRecipientPage(
                      (current) =>
                        Math.min(
                          recipientTotalPages,
                          current + 1
                        )
                    )
                  }
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Communication;