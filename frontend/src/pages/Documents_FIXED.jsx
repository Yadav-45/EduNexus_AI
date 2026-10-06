import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const ENTITY_TYPES = ["STUDENT", "PARENT", "STAFF", "TEACHER", "SCHOOL"];
const VERIFICATION_STATUSES = ["PENDING", "VERIFIED", "REJECTED"];
const PAGE_SIZES = [10, 25, 50, 100];

const emptyForm = {
  category_id: "",
  title: "",
  description: "",
  entity_type: "STUDENT",
  entity_id: "",
  document_date: "",
  expiry_date: "",
  is_confidential: false,
  notes: "",
};

const emptyCategoryForm = {
  category_name: "",
  description: "",
  applies_to: "ALL",
};

function getItems(response) {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function getTotal(response, fallback = 0) {
  const data = response?.data;
  if (typeof data?.total === "number") return data.total;
  if (typeof data?.pagination?.total === "number") {
    return data.pagination.total;
  }
  return fallback;
}

function getTotalPages(response, pageSize, total) {
  const data = response?.data;
  if (typeof data?.total_pages === "number") return data.total_pages;
  if (typeof data?.pagination?.total_pages === "number") {
    return data.pagination.total_pages;
  }
  return Math.max(1, Math.ceil(total / pageSize));
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function formatBytes(bytes) {
  if (bytes === null || bytes === undefined) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function label(value) {
  if (!value) return "-";
  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function errorMessage(error, fallback) {
  return (
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

function statusStyle(status) {
  if (status === "VERIFIED" || status === "ACTIVE") {
    return { background: "#dcfce7", color: "#166534" };
  }
  if (status === "REJECTED") {
    return { background: "#fee2e2", color: "#991b1b" };
  }
  if (status === "PENDING") {
    return { background: "#fef3c7", color: "#92400e" };
  }
  return { background: "#e5e7eb", color: "#374151" };
}

function StatCard({ title, value }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statTitle}>{title}</div>
      <div style={styles.statValue}>{value ?? 0}</div>
    </div>
  );
}

function Documents() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("documents");
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dashboard, setDashboard] = useState({});
  const [expiryDocuments, setExpiryDocuments] = useState([]);

  const [loading, setLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [entityType, setEntityType] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("");
  const [confidential, setConfidential] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [showUpload, setShowUpload] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [verificationForm, setVerificationForm] = useState({
    verification_status: "VERIFIED",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const loadDashboard = async () => {
    try {
      setDashboardLoading(true);
      const response = await api.get("/documents/dashboard");
      setDashboard(response.data || {});
    } catch (err) {
      setError(errorMessage(err, "Unable to load document dashboard."));
    } finally {
      setDashboardLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await api.get("/documents/categories", {
        params: {
          page: 1,
          page_size: 100,
          include_archived: false,
        },
      });
      setCategories(getItems(response));
    } catch (err) {
      setError(errorMessage(err, "Unable to load document categories."));
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        page_size: pageSize,
      };

      if (search.trim()) params.search = search.trim();
      if (entityType) params.entity_type = entityType;
      if (categoryId) params.category_id = categoryId;
      if (verificationStatus) {
        params.verification_status = verificationStatus;
      }
      if (confidential !== "") {
        params.is_confidential = confidential === "true";
      }
      if (includeArchived) params.include_archived = true;

      const response = await api.get("/documents", { params });
      const items = getItems(response);
      const count = getTotal(response, items.length);

      setDocuments(items);
      setTotal(count);
      setTotalPages(getTotalPages(response, pageSize, count));
    } catch (err) {
      setError(errorMessage(err, "Unable to load documents."));
    } finally {
      setLoading(false);
    }
  };

  const loadExpiry = async () => {
    try {
      const response = await api.get("/documents/expiry/list", {
        params: { page: 1, page_size: 50 },
      });
      setExpiryDocuments(getItems(response));
    } catch (err) {
      setError(errorMessage(err, "Unable to load expiry information."));
    }
  };

  useEffect(() => {
    loadDashboard();
    loadCategories();
    loadExpiry();
  }, []);

  useEffect(() => {
    if (tab === "documents") {
      loadDocuments();
    }
  }, [
    tab,
    page,
    pageSize,
    entityType,
    categoryId,
    verificationStatus,
    confidential,
    includeArchived,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadDocuments();
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const resetFilters = () => {
    setSearch("");
    setEntityType("");
    setCategoryId("");
    setVerificationStatus("");
    setConfidential("");
    setIncludeArchived(false);
    setPage(1);
  };

  const submitCategory = async (event) => {
    event.preventDefault();

    if (!categoryForm.category_name.trim()) {
      setError("Category name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await api.post("/documents/categories", categoryForm);

      setSuccess("Document category created successfully.");
      setCategoryForm(emptyCategoryForm);
      setShowCategory(false);

      await loadCategories();
      await loadDashboard();
    } catch (err) {
      setError(errorMessage(err, "Unable to create category."));
    } finally {
      setSaving(false);
    }
  };

  const submitUpload = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Document title is required.");
      return;
    }

    if (!form.entity_id) {
      setError("Entity ID is required.");
      return;
    }

    if (!selectedFile) {
      setError("Please select a file.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size cannot be greater than 10 MB.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const data = new FormData();

      if (form.category_id) data.append("category_id", form.category_id);
      data.append("title", form.title.trim());

      if (form.description) data.append("description", form.description);
      data.append("entity_type", form.entity_type);
      data.append("entity_id", form.entity_id);

      if (form.document_date) {
        data.append("document_date", form.document_date);
      }

      if (form.expiry_date) {
        data.append("expiry_date", form.expiry_date);
      }

      data.append("is_confidential", String(form.is_confidential));

      if (form.notes) data.append("notes", form.notes);
      data.append("file", selectedFile);

      // Do not manually set Content-Type.
      // Axios/browser adds the correct multipart boundary.
      await api.post("/documents", data);

      setSuccess("Document uploaded successfully.");
      setForm(emptyForm);
      setSelectedFile(null);
      setShowUpload(false);

      await Promise.all([
        loadDocuments(),
        loadDashboard(),
        loadExpiry(),
      ]);
    } catch (err) {
      setError(errorMessage(err, "Unable to upload document."));
    } finally {
      setSaving(false);
    }
  };

  const openDetails = async (id) => {
    try {
      setError("");
      const response = await api.get(`/documents/${id}`);
      setSelectedDocument(response.data);
      setShowDetails(true);
    } catch (err) {
      setError(errorMessage(err, "Unable to load document details."));
    }
  };

  const openVerification = (documentItem) => {
    setSelectedDocument(documentItem);
    setVerificationForm({
      verification_status:
        documentItem.verification_status === "VERIFIED"
          ? "VERIFIED"
          : "PENDING",
    });
    setShowVerification(true);
  };

  const submitVerification = async (event) => {
    event.preventDefault();

    if (!selectedDocument) return;

    try {
      setSaving(true);
      setError("");

      await api.patch(
        `/documents/${selectedDocument.id}/verification`,
        verificationForm
      );

      setSuccess("Verification status updated successfully.");
      setShowVerification(false);
      setSelectedDocument(null);

      await Promise.all([loadDocuments(), loadDashboard()]);
    } catch (err) {
      setError(errorMessage(err, "Unable to update verification status."));
    } finally {
      setSaving(false);
    }
  };

  const archiveDocument = async (id) => {
    if (!window.confirm("Archive this document?")) return;

    try {
      setSaving(true);
      setError("");

      await api.delete(`/documents/${id}`);

      setSuccess("Document archived successfully.");
      await Promise.all([loadDocuments(), loadDashboard()]);
    } catch (err) {
      setError(errorMessage(err, "Unable to archive document."));
    } finally {
      setSaving(false);
    }
  };

  const restoreDocument = async (id) => {
    try {
      setSaving(true);
      setError("");

      await api.patch(`/documents/${id}/restore`);

      setSuccess("Document restored successfully.");
      await Promise.all([loadDocuments(), loadDashboard()]);
    } catch (err) {
      setError(errorMessage(err, "Unable to restore document."));
    } finally {
      setSaving(false);
    }
  };

  const downloadDocument = async (documentItem) => {
    try {
      setError("");

      const response = await api.get(
        `/documents/${documentItem.id}/download`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(response.data);
      const anchor = window.document.createElement("a");

      anchor.href = url;
      anchor.download =
        documentItem.original_file_name ||
        documentItem.file_name ||
        "document";

      window.document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(errorMessage(err, "Unable to download document."));
    }
  };

  const openDocumentFile = async (documentItem) => {
    try {
      setError("");

      const response = await api.get(
        `/documents/${documentItem.id}/file`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(response.data);
      window.open(url, "_blank", "noopener,noreferrer");

      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch (err) {
      setError(errorMessage(err, "Unable to open document."));
    }
  };

  const stats = {
    total:
      dashboard.total_documents ??
      dashboard.total ??
      total ??
      0,
    active:
      dashboard.active_documents ??
      dashboard.active ??
      0,
    pending:
      dashboard.pending_verification ??
      dashboard.pending ??
      0,
    verified:
      dashboard.verified_documents ??
      dashboard.verified ??
      0,
    rejected:
      dashboard.rejected_documents ??
      dashboard.rejected ??
      0,
    expiring:
      dashboard.expiring_documents ??
      dashboard.expiring ??
      expiryDocuments.length ??
      0,
    expired:
      dashboard.expired_documents ??
      dashboard.expired ??
      0,
    confidential:
      dashboard.confidential_documents ??
      dashboard.confidential ??
      0,
  };

  const pageNumbers = [];
  const start = Math.max(1, Math.min(totalPages, page - 2));
  const end = Math.min(totalPages, start + 4);

  for (let p = start; p <= end; p += 1) {
    pageNumbers.push(p);
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <button style={styles.backButton} onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1 style={styles.title}>Document Management</h1>
          <p style={styles.subtitle}>
            Manage school documents, verification, expiry and secure files.
          </p>
        </div>

        <div style={styles.headerActions}>
          <button
            style={styles.secondaryButton}
            onClick={() => setShowCategory(true)}
          >
            + Category
          </button>
          <button
            style={styles.primaryButton}
            onClick={() => setShowUpload(true)}
          >
            + Upload Document
          </button>
        </div>
      </header>

      {error && (
        <div style={styles.errorBox}>
          <span>{error}</span>
          <button style={styles.messageClose} onClick={() => setError("")}>
            ×
          </button>
        </div>
      )}

      {success && (
        <div style={styles.successBox}>
          <span>{success}</span>
          <button style={styles.messageClose} onClick={() => setSuccess("")}>
            ×
          </button>
        </div>
      )}

      <div style={styles.tabs}>
        {[
          ["overview", "Overview"],
          ["documents", "Documents"],
          ["expiry", "Expiry Tracking"],
          ["categories", "Categories"],
        ].map(([value, text]) => (
          <button
            key={value}
            style={tab === value ? styles.activeTab : styles.tab}
            onClick={() => setTab(value)}
          >
            {text}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <section>
          <div style={styles.statsGrid}>
            <StatCard
              title="Total Documents"
              value={dashboardLoading ? "..." : stats.total}
            />
            <StatCard title="Active" value={stats.active} />
            <StatCard title="Pending Verification" value={stats.pending} />
            <StatCard title="Verified" value={stats.verified} />
            <StatCard title="Rejected" value={stats.rejected} />
            <StatCard title="Expiring" value={stats.expiring} />
            <StatCard title="Expired" value={stats.expired} />
            <StatCard title="Confidential" value={stats.confidential} />
          </div>

          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Document Management</h2>
            <p style={styles.muted}>
              Use the tabs above to search documents, track expiry dates and
              manage document categories.
            </p>
          </div>
        </section>
      )}

      {tab === "documents" && (
        <section style={styles.card}>
          <div style={styles.filters}>
            <input
              style={styles.input}
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              style={styles.input}
              value={entityType}
              onChange={(e) => {
                setEntityType(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Entity Types</option>
              {ENTITY_TYPES.map((item) => (
                <option key={item} value={item}>
                  {label(item)}
                </option>
              ))}
            </select>

            <select
              style={styles.input}
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Categories</option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.category_name}
                </option>
              ))}
            </select>

            <select
              style={styles.input}
              value={verificationStatus}
              onChange={(e) => {
                setVerificationStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              {VERIFICATION_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {label(item)}
                </option>
              ))}
            </select>

            <select
              style={styles.input}
              value={confidential}
              onChange={(e) => {
                setConfidential(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Documents</option>
              <option value="true">Confidential</option>
              <option value="false">Non-confidential</option>
            </select>

            <button style={styles.secondaryButton} onClick={resetFilters}>
              Reset
            </button>
          </div>

          <div style={styles.filterRow}>
            <label style={styles.checkLabel}>
              <input
                type="checkbox"
                checked={includeArchived}
                onChange={(e) => {
                  setIncludeArchived(e.target.checked);
                  setPage(1);
                }}
              />
              Include archived
            </label>

            <div style={styles.pageSize}>
              <span>Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div style={styles.empty}>Loading documents...</div>
          ) : documents.length === 0 ? (
            <div style={styles.empty}>
              No documents found.
            </div>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Document</th>
                    <th style={styles.th}>Entity</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Verification</th>
                    <th style={styles.th}>Expiry</th>
                    <th style={styles.th}>Size</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {documents.map((item) => (
                    <tr key={item.id}>
                      <td style={styles.td}>
                        <strong>{item.title}</strong>
                        <div style={styles.smallText}>
                          {item.document_number || `#${item.id}`}
                        </div>
                        {item.is_confidential && (
                          <span style={styles.confidentialBadge}>
                            Confidential
                          </span>
                        )}
                      </td>

                      <td style={styles.td}>
                        {label(item.entity_type)}
                        <div style={styles.smallText}>
                          ID: {item.entity_id ?? "-"}
                        </div>
                      </td>

                      <td style={styles.td}>
                        {item.category_name ||
                          item.category?.category_name ||
                          "-"}
                      </td>

                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.badge,
                            ...statusStyle(item.verification_status),
                          }}
                        >
                          {label(item.verification_status)}
                        </span>
                      </td>

                      <td style={styles.td}>
                        {formatDate(item.expiry_date)}
                      </td>

                      <td style={styles.td}>
                        {formatBytes(item.file_size)}
                      </td>

                      <td style={styles.td}>
                        <div style={styles.actionRow}>
                          <button
                            style={styles.smallButton}
                            onClick={() => openDetails(item.id)}
                          >
                            View
                          </button>

                          <button
                            style={styles.smallButton}
                            onClick={() => openDocumentFile(item)}
                          >
                            Open
                          </button>

                          <button
                            style={styles.smallButton}
                            onClick={() => downloadDocument(item)}
                          >
                            Download
                          </button>

                          <button
                            style={styles.smallButton}
                            onClick={() => openVerification(item)}
                          >
                            Verify
                          </button>

                          {item.is_active === false ? (
                            <button
                              style={styles.restoreButton}
                              onClick={() => restoreDocument(item.id)}
                            >
                              Restore
                            </button>
                          ) : (
                            <button
                              style={styles.dangerButton}
                              onClick={() => archiveDocument(item.id)}
                            >
                              Archive
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={styles.pagination}>
            <span>
              Showing {documents.length} of {total} documents
            </span>

            <div style={styles.paginationButtons}>
              <button
                style={styles.smallButton}
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>

              {pageNumbers.map((number) => (
                <button
                  key={number}
                  style={
                    number === page
                      ? styles.currentPage
                      : styles.smallButton
                  }
                  onClick={() => setPage(number)}
                >
                  {number}
                </button>
              ))}

              <button
                style={styles.smallButton}
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((p) => Math.min(totalPages, p + 1))
                }
              >
                Next
              </button>
            </div>
          </div>
        </section>
      )}

      {tab === "expiry" && (
        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Expiry Tracking</h2>

          {expiryDocuments.length === 0 ? (
            <div style={styles.empty}>No expiry records found.</div>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Document</th>
                    <th style={styles.th}>Entity</th>
                    <th style={styles.th}>Expiry Date</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {expiryDocuments.map((item) => (
                    <tr key={item.id}>
                      <td style={styles.td}>
                        {item.title || item.document_number || `#${item.id}`}
                      </td>
                      <td style={styles.td}>
                        {label(item.entity_type)} #{item.entity_id ?? "-"}
                      </td>
                      <td style={styles.td}>
                        {formatDate(item.expiry_date)}
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.badge,
                            ...statusStyle(
                              item.status ||
                                item.verification_status ||
                                "PENDING"
                            ),
                          }}
                        >
                          {label(
                            item.status ||
                              item.verification_status ||
                              "PENDING"
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {tab === "categories" && (
        <section style={styles.card}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Document Categories</h2>
              <p style={styles.muted}>
                Categories control how school documents are organized.
              </p>
            </div>
            <button
              style={styles.primaryButton}
              onClick={() => setShowCategory(true)}
            >
              + Add Category
            </button>
          </div>

          {categoriesLoading ? (
            <div style={styles.empty}>Loading categories...</div>
          ) : categories.length === 0 ? (
            <div style={styles.empty}>No categories found.</div>
          ) : (
            <div style={styles.categoryGrid}>
              {categories.map((item) => (
                <div style={styles.categoryCard} key={item.id}>
                  <strong>{item.category_name}</strong>
                  <div style={styles.smallText}>
                    Code: {item.category_code || "-"}
                  </div>
                  <div style={styles.smallText}>
                    Applies to: {label(item.applies_to)}
                  </div>
                  <p style={styles.muted}>
                    {item.description || "No description."}
                  </p>
                  <span
                    style={{
                      ...styles.badge,
                      ...statusStyle(item.status || "ACTIVE"),
                    }}
                  >
                    {label(item.status || "ACTIVE")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {showUpload && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.sectionTitle}>Upload Document</h2>
              <button
                style={styles.closeButton}
                onClick={() => setShowUpload(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={submitUpload}>
              <div style={styles.formGrid}>
                <label style={styles.field}>
                  Title *
                  <input
                    style={styles.input}
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                  />
                </label>

                <label style={styles.field}>
                  Entity Type *
                  <select
                    style={styles.input}
                    value={form.entity_type}
                    onChange={(e) =>
                      setForm({ ...form, entity_type: e.target.value })
                    }
                  >
                    {ENTITY_TYPES.map((item) => (
                      <option key={item} value={item}>
                        {label(item)}
                      </option>
                    ))}
                  </select>
                </label>

                <label style={styles.field}>
                  Entity ID *
                  <input
                    style={styles.input}
                    type="number"
                    value={form.entity_id}
                    onChange={(e) =>
                      setForm({ ...form, entity_id: e.target.value })
                    }
                  />
                </label>

                <label style={styles.field}>
                  Category
                  <select
                    style={styles.input}
                    value={form.category_id}
                    onChange={(e) =>
                      setForm({ ...form, category_id: e.target.value })
                    }
                  >
                    <option value="">No category</option>
                    {categories.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.category_name}
                      </option>
                    ))}
                  </select>
                </label>

                <label style={styles.field}>
                  Document Date
                  <input
                    style={styles.input}
                    type="date"
                    value={form.document_date}
                    onChange={(e) =>
                      setForm({ ...form, document_date: e.target.value })
                    }
                  />
                </label>

                <label style={styles.field}>
                  Expiry Date
                  <input
                    style={styles.input}
                    type="date"
                    value={form.expiry_date}
                    onChange={(e) =>
                      setForm({ ...form, expiry_date: e.target.value })
                    }
                  />
                </label>

                <label style={styles.field}>
                  File *
                  <input
                    style={styles.input}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.txt"
                    onChange={(e) =>
                      setSelectedFile(e.target.files?.[0] || null)
                    }
                  />
                  <small style={styles.smallText}>
                    Maximum size: 10 MB
                  </small>
                </label>

                <label style={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={form.is_confidential}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        is_confidential: e.target.checked,
                      })
                    }
                  />
                  Confidential document
                </label>
              </div>

              <label style={styles.field}>
                Description
                <textarea
                  style={styles.textarea}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </label>

              <label style={styles.field}>
                Notes
                <textarea
                  style={styles.textarea}
                  value={form.notes}
                  onChange={(e) =>
                    setForm({ ...form, notes: e.target.value })
                  }
                />
              </label>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.secondaryButton}
                  onClick={() => setShowUpload(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={styles.primaryButton}
                  disabled={saving}
                >
                  {saving ? "Uploading..." : "Upload Document"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCategory && (
        <div style={styles.overlay}>
          <div style={styles.modalSmall}>
            <div style={styles.modalHeader}>
              <h2 style={styles.sectionTitle}>Add Category</h2>
              <button
                style={styles.closeButton}
                onClick={() => setShowCategory(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={submitCategory}>
              <label style={styles.field}>
                Category Name *
                <input
                  style={styles.input}
                  value={categoryForm.category_name}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      category_name: e.target.value,
                    })
                  }
                />
              </label>

              <label style={styles.field}>
                Applies To
                <select
                  style={styles.input}
                  value={categoryForm.applies_to}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      applies_to: e.target.value,
                    })
                  }
                >
                  <option value="ALL">All</option>
                  {ENTITY_TYPES.map((item) => (
                    <option key={item} value={item}>
                      {label(item)}
                    </option>
                  ))}
                </select>
              </label>

              <label style={styles.field}>
                Description
                <textarea
                  style={styles.textarea}
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      description: e.target.value,
                    })
                  }
                />
              </label>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.secondaryButton}
                  onClick={() => setShowCategory(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={styles.primaryButton}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetails && selectedDocument && (
        <div style={styles.overlay}>
          <div style={styles.modalSmall}>
            <div style={styles.modalHeader}>
              <h2 style={styles.sectionTitle}>Document Details</h2>
              <button
                style={styles.closeButton}
                onClick={() => setShowDetails(false)}
              >
                ×
              </button>
            </div>

            <div style={styles.detailsGrid}>
              <Detail label="Document Number" value={selectedDocument.document_number} />
              <Detail label="Title" value={selectedDocument.title} />
              <Detail label="Entity" value={`${label(selectedDocument.entity_type)} #${selectedDocument.entity_id ?? "-"}`} />
              <Detail label="Original File" value={selectedDocument.original_file_name} />
              <Detail label="File Type" value={selectedDocument.mime_type} />
              <Detail label="File Size" value={formatBytes(selectedDocument.file_size)} />
              <Detail label="Document Date" value={formatDate(selectedDocument.document_date)} />
              <Detail label="Expiry Date" value={formatDate(selectedDocument.expiry_date)} />
              <Detail label="Verification" value={label(selectedDocument.verification_status)} />
              <Detail label="Created" value={formatDateTime(selectedDocument.created_at)} />
            </div>

            <div style={styles.modalActions}>
              <button
                style={styles.secondaryButton}
                onClick={() => openDocumentFile(selectedDocument)}
              >
                Open File
              </button>
              <button
                style={styles.primaryButton}
                onClick={() => downloadDocument(selectedDocument)}
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {showVerification && selectedDocument && (
        <div style={styles.overlay}>
          <div style={styles.modalSmall}>
            <div style={styles.modalHeader}>
              <h2 style={styles.sectionTitle}>Verify Document</h2>
              <button
                style={styles.closeButton}
                onClick={() => setShowVerification(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={submitVerification}>
              <p style={styles.muted}>
                {selectedDocument.title}
              </p>

              <label style={styles.field}>
                Verification Status
                <select
                  style={styles.input}
                  value={verificationForm.verification_status}
                  onChange={(e) =>
                    setVerificationForm({
                      verification_status: e.target.value,
                    })
                  }
                >
                  {VERIFICATION_STATUSES.map((item) => (
                    <option key={item} value={item}>
                      {label(item)}
                    </option>
                  ))}
                </select>
              </label>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.secondaryButton}
                  onClick={() => setShowVerification(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={styles.primaryButton}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label: title, value }) {
  return (
    <div style={styles.detailItem}>
      <div style={styles.smallText}>{title}</div>
      <strong>{value || "-"}</strong>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    padding: "28px",
    boxSizing: "border-box",
    fontFamily: "Arial, sans-serif",
    color: "#111827",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "20px",
  },
  headerActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  backButton: {
    border: "none",
    background: "transparent",
    padding: "0",
    marginBottom: "8px",
    cursor: "pointer",
    color: "#2563eb",
    fontSize: "14px",
  },
  title: {
    margin: "0 0 6px",
    fontSize: "30px",
  },
  subtitle: {
    margin: 0,
    color: "#6b7280",
  },
  primaryButton: {
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#fff",
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: 600,
  },
  secondaryButton: {
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    background: "#fff",
    color: "#374151",
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: 600,
  },
  dangerButton: {
    border: "none",
    borderRadius: "6px",
    background: "#fee2e2",
    color: "#991b1b",
    padding: "6px 9px",
    cursor: "pointer",
  },
  restoreButton: {
    border: "none",
    borderRadius: "6px",
    background: "#dcfce7",
    color: "#166534",
    padding: "6px 9px",
    cursor: "pointer",
  },
  tabs: {
    display: "flex",
    gap: "4px",
    borderBottom: "1px solid #e5e7eb",
    marginBottom: "20px",
    overflowX: "auto",
  },
  tab: {
    border: "none",
    background: "transparent",
    padding: "12px 18px",
    cursor: "pointer",
    color: "#6b7280",
  },
  activeTab: {
    border: "none",
    borderBottom: "3px solid #2563eb",
    background: "#fff",
    padding: "12px 18px",
    cursor: "pointer",
    color: "#2563eb",
    fontWeight: 700,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "20px",
  },
  statCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  statTitle: {
    color: "#6b7280",
    fontSize: "13px",
    marginBottom: "8px",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: 700,
  },
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  sectionTitle: {
    margin: "0",
    fontSize: "20px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginBottom: "18px",
  },
  muted: {
    color: "#6b7280",
    lineHeight: 1.5,
  },
  filters: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "10px",
    marginBottom: "12px",
  },
  filterRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
  },
  pageSize: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    padding: "10px 12px",
    background: "#fff",
    fontSize: "14px",
  },
  textarea: {
    width: "100%",
    minHeight: "90px",
    boxSizing: "border-box",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    padding: "10px 12px",
    resize: "vertical",
    fontFamily: "inherit",
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "950px",
  },
  th: {
    textAlign: "left",
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
    background: "#f9fafb",
    fontSize: "13px",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #f0f1f3",
    verticalAlign: "top",
    fontSize: "14px",
  },
  smallText: {
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "4px",
  },
  badge: {
    display: "inline-block",
    borderRadius: "999px",
    padding: "4px 8px",
    fontSize: "12px",
    fontWeight: 600,
  },
  confidentialBadge: {
    display: "inline-block",
    marginTop: "5px",
    borderRadius: "999px",
    padding: "3px 7px",
    background: "#ede9fe",
    color: "#6d28d9",
    fontSize: "11px",
  },
  actionRow: {
    display: "flex",
    gap: "5px",
    flexWrap: "wrap",
  },
  smallButton: {
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    background: "#fff",
    color: "#374151",
    padding: "6px 9px",
    cursor: "pointer",
    fontSize: "12px",
  },
  currentPage: {
    border: "1px solid #2563eb",
    borderRadius: "6px",
    background: "#2563eb",
    color: "#fff",
    padding: "6px 10px",
    cursor: "pointer",
  },
  pagination: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginTop: "18px",
    flexWrap: "wrap",
    color: "#6b7280",
    fontSize: "13px",
  },
  paginationButtons: {
    display: "flex",
    gap: "5px",
  },
  empty: {
    padding: "45px 20px",
    textAlign: "center",
    color: "#6b7280",
  },
  errorBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "12px 14px",
    marginBottom: "15px",
  },
  successBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #bbf7d0",
    borderRadius: "8px",
    padding: "12px 14px",
    marginBottom: "15px",
  },
  messageClose: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "20px",
  },
  checkLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
  },
  categoryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "14px",
  },
  categoryCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "16px",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 1000,
  },
  modal: {
    width: "min(850px, 100%)",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#fff",
    borderRadius: "14px",
    padding: "24px",
    boxSizing: "border-box",
  },
  modalSmall: {
    width: "min(560px, 100%)",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#fff",
    borderRadius: "14px",
    padding: "24px",
    boxSizing: "border-box",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  closeButton: {
    border: "none",
    background: "#f3f4f6",
    borderRadius: "50%",
    width: "34px",
    height: "34px",
    cursor: "pointer",
    fontSize: "20px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "14px",
    marginBottom: "14px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "14px",
    fontSize: "13px",
    fontWeight: 600,
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "14px",
  },
  detailItem: {
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
};

export default Documents;
