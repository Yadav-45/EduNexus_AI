import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function formatNPR(value) {
  const number = Number(value || 0);
  return `NPR ${number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function Fees() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState({
    total_due: 0,
    total_paid: 0,
    total_balance: 0,
    total_accounts: 0,
    active_accounts: 0,
    total_successful_payments: 0,
  });

  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [payments, setPayments] = useState([]);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    page_size: 25,
    total_pages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState("");

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    payment_method: "CASH",
    transaction_reference: "",
    remarks: "",
  });

  useEffect(() => {
    loadSummary();
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [page, pageSize, status]);

  async function loadSummary() {
    setSummaryLoading(true);

    try {
      const response = await api.get("/fee-dashboard/summary");
      setSummary(response.data);
    } catch (err) {
      console.error("Fee summary error:", err);
      setError(
        err.response?.data?.detail ||
          "Unable to load fee dashboard summary."
      );
    } finally {
      setSummaryLoading(false);
    }
  }

  async function loadAccounts() {
    setLoading(true);
    setError("");

    try {
      const params = {
        page,
        page_size: pageSize,
        sort_by: "id",
        sort_order: "desc",
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (status) {
        params.status = status;
      }

      const response = await api.get("/fee-accounts", { params });

      setAccounts(response.data.data || []);
      setPagination(
        response.data.pagination || {
          total: 0,
          page,
          page_size: pageSize,
          total_pages: 1,
        }
      );
    } catch (err) {
      console.error("Fee accounts error:", err);
      setAccounts([]);
      setError(
        err.response?.data?.detail ||
          "Unable to load fee accounts."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    setPage(1);
    loadAccounts();
  }

  async function openDetails(account) {
    setError("");
    setDetailsOpen(true);
    setSelectedAccount(account);
    setPayments([]);
    setPaymentsLoading(true);

    try {
      const [accountResponse, paymentsResponse] = await Promise.all([
        api.get(`/fee-accounts/${account.id}`),
        api.get(`/fee-accounts/${account.id}/payments`),
      ]);

      setSelectedAccount(accountResponse.data);
      setPayments(paymentsResponse.data || []);
    } catch (err) {
      console.error("Fee details error:", err);
      setError(
        err.response?.data?.detail ||
          "Unable to load fee account details."
      );
    } finally {
      setPaymentsLoading(false);
    }
  }

  function openPayment(account) {
    setSelectedAccount(account);
    setPaymentForm({
      amount: "",
      payment_method: "CASH",
      transaction_reference: "",
      remarks: "",
    });
    setPaymentOpen(true);
  }

  async function submitPayment(event) {
    event.preventDefault();

    if (!selectedAccount) {
      return;
    }

    const amount = Number(paymentForm.amount);

    if (!amount || amount <= 0) {
      setError("Enter a valid payment amount.");
      return;
    }

    if (amount > Number(selectedAccount.balance)) {
      setError("Payment cannot be greater than the outstanding balance.");
      return;
    }

    setSavingPayment(true);
    setError("");

    try {
      await api.post(
        `/fee-accounts/${selectedAccount.id}/payments`,
        {
          amount: paymentForm.amount,
          payment_method: paymentForm.payment_method,
          transaction_reference:
            paymentForm.transaction_reference.trim() || null,
          remarks: paymentForm.remarks.trim() || null,
        }
      );

      setPaymentOpen(false);
      setPaymentForm({
        amount: "",
        payment_method: "CASH",
        transaction_reference: "",
        remarks: "",
      });

      await Promise.all([loadAccounts(), loadSummary()]);

      if (detailsOpen) {
        await openDetails(selectedAccount);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(
        err.response?.data?.detail ||
          "Unable to record payment."
      );
    } finally {
      setSavingPayment(false);
    }
  }

  function closeDetails() {
    setDetailsOpen(false);
    setSelectedAccount(null);
    setPayments([]);
  }

  const currentBalance = Number(selectedAccount?.balance || 0);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <button
            style={styles.backButton}
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          <h1 style={styles.title}>Fee Management</h1>
          <p style={styles.subtitle}>
            Manage student fee accounts, collections and outstanding balances.
          </p>
        </div>

        <button
          style={styles.refreshButton}
          onClick={() => {
            loadSummary();
            loadAccounts();
          }}
        >
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div style={styles.error}>
          <strong>Error:</strong> {error}
          <button
            style={styles.errorClose}
            onClick={() => setError("")}
          >
            ×
          </button>
        </div>
      )}

      <div style={styles.summaryGrid}>
        <SummaryCard
          title="Total Due"
          value={formatNPR(summary.total_due)}
          loading={summaryLoading}
        />
        <SummaryCard
          title="Total Collected"
          value={formatNPR(summary.total_paid)}
          loading={summaryLoading}
        />
        <SummaryCard
          title="Outstanding"
          value={formatNPR(summary.total_balance)}
          loading={summaryLoading}
        />
        <SummaryCard
          title="Fee Accounts"
          value={summary.total_accounts}
          loading={summaryLoading}
        />
        <SummaryCard
          title="Active Accounts"
          value={summary.active_accounts}
          loading={summaryLoading}
        />
        <SummaryCard
          title="Successful Payments"
          value={summary.total_successful_payments}
          loading={summaryLoading}
        />
      </div>

      <div style={styles.card}>
        <div style={styles.toolbar}>
          <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
            <input
              type="text"
              placeholder="Search student name or admission number..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={styles.searchInput}
            />

            <button type="submit" style={styles.primaryButton}>
              Search
            </button>
          </form>

          <div style={styles.filters}>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              style={styles.select}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="PAID">PAID</option>
              <option value="PARTIAL">PARTIAL</option>
              <option value="OVERDUE">OVERDUE</option>
              <option value="CLOSED">CLOSED</option>
            </select>

            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              style={styles.select}
            >
              <option value={10}>10 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>
          </div>
        </div>

        <div style={styles.tableHeader}>
          <div>
            <strong>Student Fee Accounts</strong>
            <span style={styles.resultCount}>
              {pagination.total || 0} account(s)
            </span>
          </div>
        </div>

        {loading ? (
          <div style={styles.empty}>Loading fee accounts...</div>
        ) : accounts.length === 0 ? (
          <div style={styles.empty}>
            No fee accounts found.
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Student ID</th>
                  <th style={styles.th}>Academic Year</th>
                  <th style={styles.th}>Total Due</th>
                  <th style={styles.th}>Paid</th>
                  <th style={styles.th}>Balance</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id}>
                    <td style={styles.td}>
                      #{account.student_id}
                    </td>
                    <td style={styles.td}>
                      {account.academic_year}
                    </td>
                    <td style={styles.td}>
                      {formatNPR(account.total_due)}
                    </td>
                    <td style={styles.td}>
                      {formatNPR(account.total_paid)}
                    </td>
                    <td style={styles.td}>
                      <strong>
                        {formatNPR(account.balance)}
                      </strong>
                    </td>
                    <td style={styles.td}>
                      <StatusBadge status={account.status} />
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <button
                          style={styles.secondaryButton}
                          onClick={() => openDetails(account)}
                        >
                          View
                        </button>

                        {Number(account.balance) > 0 &&
                          account.status !== "CLOSED" && (
                            <button
                              style={styles.primarySmallButton}
                              onClick={() => openPayment(account)}
                            >
                              Payment
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
          <button
            style={styles.secondaryButton}
            disabled={page <= 1}
            onClick={() => setPage((value) => value - 1)}
          >
            ← Previous
          </button>

          <span>
            Page <strong>{pagination.page || page}</strong> of{" "}
            <strong>{pagination.total_pages || 1}</strong>
          </span>

          <button
            style={styles.secondaryButton}
            disabled={page >= (pagination.total_pages || 1)}
            onClick={() => setPage((value) => value + 1)}
          >
            Next →
          </button>
        </div>
      </div>

      {detailsOpen && selectedAccount && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>Fee Account Details</h2>
                <p style={styles.modalSubtitle}>
                  Account #{selectedAccount.id}
                </p>
              </div>

              <button
                style={styles.closeButton}
                onClick={closeDetails}
              >
                ×
              </button>
            </div>

            <div style={styles.detailGrid}>
              <Detail label="Student ID" value={selectedAccount.student_id} />
              <Detail
                label="Academic Year"
                value={selectedAccount.academic_year}
              />
              <Detail
                label="Total Due"
                value={formatNPR(selectedAccount.total_due)}
              />
              <Detail
                label="Total Paid"
                value={formatNPR(selectedAccount.total_paid)}
              />
              <Detail
                label="Balance"
                value={formatNPR(selectedAccount.balance)}
              />
              <Detail
                label="Status"
                value={<StatusBadge status={selectedAccount.status} />}
              />
            </div>

            <div style={styles.paymentHistoryHeader}>
              <h3>Payment History</h3>

              {currentBalance > 0 &&
                selectedAccount.status !== "CLOSED" && (
                  <button
                    style={styles.primaryButton}
                    onClick={() => {
                      setDetailsOpen(false);
                      openPayment(selectedAccount);
                    }}
                  >
                    + Record Payment
                  </button>
                )}
            </div>

            {paymentsLoading ? (
              <div style={styles.empty}>Loading payments...</div>
            ) : payments.length === 0 ? (
              <div style={styles.empty}>
                No payments recorded yet.
              </div>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Amount</th>
                      <th style={styles.th}>Method</th>
                      <th style={styles.th}>Reference</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td style={styles.td}>
                          {payment.payment_date
                            ? new Date(
                                payment.payment_date
                              ).toLocaleString()
                            : "-"}
                        </td>
                        <td style={styles.td}>
                          {formatNPR(payment.amount)}
                        </td>
                        <td style={styles.td}>
                          {payment.payment_method}
                        </td>
                        <td style={styles.td}>
                          {payment.transaction_reference || "-"}
                        </td>
                        <td style={styles.td}>
                          <StatusBadge status={payment.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {paymentOpen && selectedAccount && (
        <div style={styles.overlay}>
          <div style={styles.paymentModal}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>Record Fee Payment</h2>
                <p style={styles.modalSubtitle}>
                  Student #{selectedAccount.student_id} ·{" "}
                  {selectedAccount.academic_year}
                </p>
              </div>

             <button
  style={styles.secondaryButton}
  onClick={() => navigate(`/fees/${selectedAccount.id}`)}
>
  View
</button>
            </div>

            <div style={styles.paymentBalance}>
              Outstanding Balance:
              <strong>{formatNPR(selectedAccount.balance)}</strong>
            </div>

            <form onSubmit={submitPayment}>
              <label style={styles.label}>
                Amount *
                <input
                  type="number"
                  min="0.01"
                  max={Number(selectedAccount.balance)}
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(event) =>
                    setPaymentForm({
                      ...paymentForm,
                      amount: event.target.value,
                    })
                  }
                  style={styles.input}
                  required
                />
              </label>

              <label style={styles.label}>
                Payment Method *
                <input
                  type="text"
                  value={paymentForm.payment_method}
                  onChange={(event) =>
                    setPaymentForm({
                      ...paymentForm,
                      payment_method: event.target.value,
                    })
                  }
                  style={styles.input}
                  maxLength={30}
                  required
                />
              </label>

              <label style={styles.label}>
                Transaction Reference
                <input
                  type="text"
                  value={paymentForm.transaction_reference}
                  onChange={(event) =>
                    setPaymentForm({
                      ...paymentForm,
                      transaction_reference:
                        event.target.value,
                    })
                  }
                  style={styles.input}
                  maxLength={100}
                />
              </label>

              <label style={styles.label}>
                Remarks
                <textarea
                  value={paymentForm.remarks}
                  onChange={(event) =>
                    setPaymentForm({
                      ...paymentForm,
                      remarks: event.target.value,
                    })
                  }
                  style={styles.textarea}
                  rows={4}
                />
              </label>

              <div style={styles.formActions}>
                <button
                  type="button"
                  style={styles.secondaryButton}
                  onClick={() => setPaymentOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={styles.primaryButton}
                  disabled={savingPayment}
                >
                  {savingPayment
                    ? "Saving..."
                    : "Save Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value, loading }) {
  return (
    <div style={styles.summaryCard}>
      <span style={styles.summaryTitle}>{title}</span>
      <strong style={styles.summaryValue}>
        {loading ? "..." : value}
      </strong>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized = String(status || "").toUpperCase();

  return (
    <span
      style={{
        ...styles.badge,
        ...(normalized === "PAID"
          ? styles.badgePaid
          : normalized === "PARTIAL"
          ? styles.badgePartial
          : normalized === "OVERDUE"
          ? styles.badgeOverdue
          : normalized === "CLOSED"
          ? styles.badgeClosed
          : styles.badgeActive),
      }}
    >
      {normalized || "-"}
    </span>
  );
}

function Detail({ label, value }) {
  return (
    <div style={styles.detail}>
      <span style={styles.detailLabel}>{label}</span>
      <strong style={styles.detailValue}>{value ?? "-"}</strong>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "32px",
    background: "#f5f7fb",
    color: "#172033",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "24px",
  },
  backButton: {
    border: "none",
    background: "transparent",
    padding: 0,
    marginBottom: "10px",
    cursor: "pointer",
    color: "#475569",
    fontSize: "14px",
  },
  title: {
    margin: 0,
    fontSize: "30px",
  },
  subtitle: {
    margin: "8px 0 0",
    color: "#64748b",
  },
  refreshButton: {
    border: "1px solid #d7deea",
    background: "#fff",
    borderRadius: "10px",
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: 600,
  },
  error: {
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#9f1239",
    padding: "12px 14px",
    borderRadius: "10px",
    marginBottom: "20px",
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
  },
  errorClose: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "20px",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  summaryCard: {
    background: "#fff",
    border: "1px solid #e5eaf2",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 4px 18px rgba(15, 23, 42, 0.04)",
  },
  summaryTitle: {
    display: "block",
    color: "#64748b",
    fontSize: "13px",
    marginBottom: "10px",
  },
  summaryValue: {
    fontSize: "22px",
  },
  card: {
    background: "#fff",
    border: "1px solid #e5eaf2",
    borderRadius: "14px",
    overflow: "hidden",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    padding: "18px",
    borderBottom: "1px solid #edf0f5",
    flexWrap: "wrap",
  },
  searchForm: {
    display: "flex",
    gap: "8px",
    flex: 1,
    minWidth: "280px",
  },
  searchInput: {
    flex: 1,
    border: "1px solid #d7deea",
    borderRadius: "9px",
    padding: "11px 13px",
    fontSize: "14px",
  },
  filters: {
    display: "flex",
    gap: "8px",
  },
  select: {
    border: "1px solid #d7deea",
    borderRadius: "9px",
    padding: "10px 12px",
    background: "#fff",
  },
  primaryButton: {
    border: "none",
    background: "#2563eb",
    color: "#fff",
    borderRadius: "9px",
    padding: "10px 15px",
    cursor: "pointer",
    fontWeight: 600,
  },
  primarySmallButton: {
    border: "none",
    background: "#2563eb",
    color: "#fff",
    borderRadius: "7px",
    padding: "7px 10px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "12px",
  },
  secondaryButton: {
    border: "1px solid #d7deea",
    background: "#fff",
    color: "#334155",
    borderRadius: "8px",
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: 600,
  },
  tableHeader: {
    padding: "16px 18px",
    borderBottom: "1px solid #edf0f5",
  },
  resultCount: {
    marginLeft: "10px",
    color: "#64748b",
    fontSize: "13px",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "850px",
  },
  th: {
    textAlign: "left",
    padding: "13px 16px",
    background: "#f8fafc",
    color: "#64748b",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  td: {
    padding: "14px 16px",
    borderTop: "1px solid #edf0f5",
    fontSize: "14px",
  },
  actions: {
    display: "flex",
    gap: "7px",
  },
  badge: {
    display: "inline-block",
    borderRadius: "999px",
    padding: "5px 9px",
    fontSize: "11px",
    fontWeight: 700,
  },
  badgeActive: {
    background: "#dbeafe",
    color: "#1d4ed8",
  },
  badgePaid: {
    background: "#dcfce7",
    color: "#166534",
  },
  badgePartial: {
    background: "#fef3c7",
    color: "#92400e",
  },
  badgeOverdue: {
    background: "#fee2e2",
    color: "#991b1b",
  },
  badgeClosed: {
    background: "#e2e8f0",
    color: "#475569",
  },
  empty: {
    padding: "50px 20px",
    textAlign: "center",
    color: "#64748b",
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "18px",
    padding: "18px",
    borderTop: "1px solid #edf0f5",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    zIndex: 1000,
  },
  modal: {
    width: "min(1000px, 100%)",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#fff",
    borderRadius: "16px",
    padding: "24px",
  },
  paymentModal: {
    width: "min(560px, 100%)",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#fff",
    borderRadius: "16px",
    padding: "24px",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "20px",
  },
  modalTitle: {
    margin: 0,
    fontSize: "22px",
  },
  modalSubtitle: {
    margin: "5px 0 0",
    color: "#64748b",
  },
  closeButton: {
    width: "36px",
    height: "36px",
    border: "none",
    borderRadius: "8px",
    background: "#f1f5f9",
    cursor: "pointer",
    fontSize: "22px",
  },
  detailGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
    marginBottom: "28px",
  },
  detail: {
    border: "1px solid #e5eaf2",
    borderRadius: "10px",
    padding: "14px",
  },
  detailLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "12px",
    marginBottom: "7px",
  },
  detailValue: {
    fontSize: "15px",
  },
  paymentHistoryHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
  },
  paymentBalance: {
    display: "flex",
    justifyContent: "space-between",
    background: "#eff6ff",
    color: "#1e40af",
    padding: "14px",
    borderRadius: "10px",
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    marginBottom: "15px",
  },
  input: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    marginTop: "7px",
    border: "1px solid #d7deea",
    borderRadius: "9px",
    padding: "11px 12px",
    fontSize: "14px",
  },
  textarea: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    marginTop: "7px",
    border: "1px solid #d7deea",
    borderRadius: "9px",
    padding: "11px 12px",
    fontSize: "14px",
    resize: "vertical",
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
  },
};

export default Fees;
