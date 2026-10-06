import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

function formatNPR(value) {
  const number = Number(value || 0);

  return `NPR ${number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
}

function FeeAccountDetails() {
  const { feeAccountId } = useParams();
  const navigate = useNavigate();

  const [account, setAccount] = useState(null);
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [error, setError] = useState("");

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    payment_method: "CASH",
    transaction_reference: "",
    remarks: "",
  });

  useEffect(() => {
    loadAccount();
    loadPayments();
  }, [feeAccountId]);

  async function loadAccount() {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(
        `/fee-accounts/${feeAccountId}`
      );

      setAccount(response.data);
    } catch (err) {
      console.error("Fee account details error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load fee account."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadPayments() {
    setPaymentsLoading(true);

    try {
      const response = await api.get(
        `/fee-accounts/${feeAccountId}/payments`
      );

      setPayments(response.data || []);
    } catch (err) {
      console.error("Fee payment history error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load payment history."
      );
    } finally {
      setPaymentsLoading(false);
    }
  }

  function openPayment() {
    setError("");

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

    if (!account) return;

    const amount = Number(paymentForm.amount);
    const balance = Number(account.balance || 0);

    if (!amount || amount <= 0) {
      setError("Enter a valid payment amount.");
      return;
    }

    if (amount > balance) {
      setError(
        "Payment cannot be greater than the outstanding balance."
      );
      return;
    }

    setSavingPayment(true);
    setError("");

    try {
      await api.post(
        `/fee-accounts/${feeAccountId}/payments`,
        {
          amount: paymentForm.amount,
          payment_method:
            paymentForm.payment_method.trim() || "CASH",
          transaction_reference:
            paymentForm.transaction_reference.trim() || null,
          remarks: paymentForm.remarks.trim() || null,
        }
      );

      setPaymentOpen(false);

      await Promise.all([
        loadAccount(),
        loadPayments(),
      ]);
    } catch (err) {
      console.error("Record payment error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to record payment."
      );
    } finally {
      setSavingPayment(false);
    }
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loading}>
          Loading fee account...
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div style={styles.page}>
        <div style={styles.errorCard}>
          <h2>Fee Account Not Found</h2>
          <p>
            {error ||
              "The requested fee account could not be found."}
          </p>

          <button
            style={styles.primaryButton}
            onClick={() => navigate("/fees")}
          >
            Back to Fee Management
          </button>
        </div>
      </div>
    );
  }

  const balance = Number(account.balance || 0);
  const totalDue = Number(account.total_due || 0);
  const totalPaid = Number(account.total_paid || 0);

  const paymentPercentage =
    totalDue > 0
      ? Math.min((totalPaid / totalDue) * 100, 100)
      : 0;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <button
            style={styles.backButton}
            onClick={() => navigate("/fees")}
          >
            ← Back to Fee Management
          </button>

          <h1 style={styles.title}>
            Fee Account Details
          </h1>

          <p style={styles.subtitle}>
            Account #{account.id}
          </p>
        </div>

        {balance > 0 && account.status !== "CLOSED" && (
          <button
            style={styles.primaryButton}
            onClick={openPayment}
          >
            + Record Payment
          </button>
        )}
      </div>

      {error && (
        <div style={styles.error}>
          <span>{error}</span>

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
          title="Total Fee"
          value={formatNPR(totalDue)}
        />

        <SummaryCard
          title="Total Paid"
          value={formatNPR(totalPaid)}
        />

        <SummaryCard
          title="Outstanding"
          value={formatNPR(balance)}
        />

        <SummaryCard
          title="Payment Progress"
          value={`${paymentPercentage.toFixed(1)}%`}
        />
      </div>

      <div style={styles.grid}>
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>
                Account Information
              </h2>

              <p style={styles.cardSubtitle}>
                Fee account and academic details
              </p>
            </div>

            <StatusBadge status={account.status} />
          </div>

          <div style={styles.infoGrid}>
            <InfoItem
              label="Fee Account ID"
              value={`#${account.id}`}
            />

            <InfoItem
              label="Student ID"
              value={`#${account.student_id}`}
            />

            <InfoItem
              label="Academic Year"
              value={account.academic_year}
            />

            <InfoItem
              label="Status"
              value={<StatusBadge status={account.status} />}
            />

            <InfoItem
              label="Total Due"
              value={formatNPR(account.total_due)}
            />

            <InfoItem
              label="Total Paid"
              value={formatNPR(account.total_paid)}
            />

            <InfoItem
              label="Balance"
              value={formatNPR(account.balance)}
            />

            <InfoItem
              label="Due Date"
              value={formatDate(account.due_date)}
            />

            <InfoItem
              label="Created At"
              value={formatDate(account.created_at)}
            />
          </div>

          <div style={styles.progressSection}>
            <div style={styles.progressHeader}>
              <span>Payment Progress</span>
              <strong>
                {paymentPercentage.toFixed(1)}%
              </strong>
            </div>

            <div style={styles.progressBackground}>
              <div
                style={{
                  ...styles.progressBar,
                  width: `${paymentPercentage}%`,
                }}
              />
            </div>

            <div style={styles.progressLabels}>
              <span>
                Paid: {formatNPR(totalPaid)}
              </span>

              <span>
                Remaining: {formatNPR(balance)}
              </span>
            </div>
          </div>
        </section>

        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>
                Payment Summary
              </h2>

              <p style={styles.cardSubtitle}>
                Collection information for this account
              </p>
            </div>
          </div>

          <div style={styles.largeBalance}>
            <span>Outstanding Balance</span>
            <strong>{formatNPR(balance)}</strong>
          </div>

          <div style={styles.summaryRows}>
            <div style={styles.summaryRow}>
              <span>Total Fee</span>
              <strong>{formatNPR(totalDue)}</strong>
            </div>

            <div style={styles.summaryRow}>
              <span>Total Paid</span>
              <strong>{formatNPR(totalPaid)}</strong>
            </div>

            <div style={styles.summaryRow}>
              <span>Payment Records</span>
              <strong>{payments.length}</strong>
            </div>
          </div>

          {balance > 0 &&
            account.status !== "CLOSED" && (
              <button
                style={styles.fullButton}
                onClick={openPayment}
              >
                Record Payment
              </button>
            )}
        </section>
      </div>

      <section style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h2 style={styles.cardTitle}>
              Payment History
            </h2>

            <p style={styles.cardSubtitle}>
              All payments recorded against this fee account
            </p>
          </div>

          <span style={styles.paymentCount}>
            {payments.length} payment(s)
          </span>
        </div>

        {paymentsLoading ? (
          <div style={styles.loading}>
            Loading payment history...
          </div>
        ) : payments.length === 0 ? (
          <div style={styles.empty}>
            No payments have been recorded for this account.
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Payment ID</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Method</th>
                  <th style={styles.th}>Reference</th>
                  <th style={styles.th}>Remarks</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>

              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td style={styles.td}>
                      #{payment.id}
                    </td>

                    <td style={styles.td}>
                      {formatDate(payment.payment_date)}
                    </td>

                    <td style={styles.td}>
                      <strong>
                        {formatNPR(payment.amount)}
                      </strong>
                    </td>

                    <td style={styles.td}>
                      {payment.payment_method || "-"}
                    </td>

                    <td style={styles.td}>
                      {payment.transaction_reference || "-"}
                    </td>

                    <td style={styles.td}>
                      {payment.remarks || "-"}
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
      </section>

      {paymentOpen && (
        <div style={styles.overlay}>
          <div style={styles.paymentModal}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>
                  Record Fee Payment
                </h2>

                <p style={styles.cardSubtitle}>
                  Account #{account.id}
                </p>
              </div>

              <button
                style={styles.closeButton}
                onClick={() => setPaymentOpen(false)}
              >
                ×
              </button>
            </div>

            <div style={styles.balanceBox}>
              <span>Outstanding Balance</span>

              <strong>
                {formatNPR(account.balance)}
              </strong>
            </div>

            <form onSubmit={submitPayment}>
              <label style={styles.label}>
                Amount *
                <input
                  type="number"
                  min="0.01"
                  max={balance}
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
                  maxLength={30}
                  value={paymentForm.payment_method}
                  onChange={(event) =>
                    setPaymentForm({
                      ...paymentForm,
                      payment_method: event.target.value,
                    })
                  }
                  style={styles.input}
                  required
                />

                <small style={styles.helpText}>
                  Example: CASH, BANK_TRANSFER, ONLINE
                </small>
              </label>

              <label style={styles.label}>
                Transaction Reference
                <input
                  type="text"
                  maxLength={100}
                  value={
                    paymentForm.transaction_reference
                  }
                  onChange={(event) =>
                    setPaymentForm({
                      ...paymentForm,
                      transaction_reference:
                        event.target.value,
                    })
                  }
                  style={styles.input}
                />
              </label>

              <label style={styles.label}>
                Remarks
                <textarea
                  rows="4"
                  value={paymentForm.remarks}
                  onChange={(event) =>
                    setPaymentForm({
                      ...paymentForm,
                      remarks: event.target.value,
                    })
                  }
                  style={styles.textarea}
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

function SummaryCard({ title, value }) {
  return (
    <div style={styles.summaryCard}>
      <span style={styles.summaryTitle}>{title}</span>
      <strong style={styles.summaryValue}>{value}</strong>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div style={styles.infoItem}>
      <span style={styles.infoLabel}>{label}</span>
      <strong style={styles.infoValue}>{value ?? "-"}</strong>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized = String(status || "").toUpperCase();

  let badgeStyle = styles.badgeActive;

  if (normalized === "PAID") {
    badgeStyle = styles.badgePaid;
  } else if (normalized === "PARTIAL") {
    badgeStyle = styles.badgePartial;
  } else if (normalized === "OVERDUE") {
    badgeStyle = styles.badgeOverdue;
  } else if (normalized === "CLOSED") {
    badgeStyle = styles.badgeClosed;
  }

  return (
    <span style={{ ...styles.badge, ...badgeStyle }}>
      {normalized || "-"}
    </span>
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
    margin: "7px 0 0",
    color: "#64748b",
  },

  primaryButton: {
    border: "none",
    background: "#2563eb",
    color: "#fff",
    borderRadius: "9px",
    padding: "11px 16px",
    cursor: "pointer",
    fontWeight: 600,
  },

  secondaryButton: {
    border: "1px solid #d7deea",
    background: "#fff",
    color: "#334155",
    borderRadius: "9px",
    padding: "10px 15px",
    cursor: "pointer",
    fontWeight: 600,
  },

  error: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#9f1239",
    padding: "13px 15px",
    borderRadius: "10px",
    marginBottom: "20px",
  },

  errorClose: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "20px",
  },

  errorCard: {
    maxWidth: "600px",
    margin: "100px auto",
    background: "#fff",
    border: "1px solid #e5eaf2",
    borderRadius: "14px",
    padding: "30px",
    textAlign: "center",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(210px, 1fr))",
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
    marginBottom: "9px",
  },

  summaryValue: {
    fontSize: "22px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 2fr) minmax(300px, 1fr)",
    gap: "20px",
    marginBottom: "20px",
  },

  card: {
    background: "#fff",
    border: "1px solid #e5eaf2",
    borderRadius: "14px",
    padding: "22px",
    marginBottom: "20px",
    boxShadow: "0 4px 18px rgba(15, 23, 42, 0.04)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
    marginBottom: "20px",
  },

  cardTitle: {
    margin: 0,
    fontSize: "19px",
  },

  cardSubtitle: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
  },

  infoItem: {
    border: "1px solid #e5eaf2",
    borderRadius: "10px",
    padding: "14px",
  },

  infoLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "12px",
    marginBottom: "7px",
  },

  infoValue: {
    fontSize: "14px",
  },

  largeBalance: {
    background: "#eff6ff",
    borderRadius: "12px",
    padding: "20px",
    color: "#1e40af",
    marginBottom: "18px",
  },

  largeBalance: {
    background: "#eff6ff",
    borderRadius: "12px",
    padding: "20px",
    color: "#1e40af",
    marginBottom: "18px",
  },

  summaryRows: {
    marginBottom: "18px",
  },

  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid #edf0f5",
    fontSize: "14px",
  },

  fullButton: {
    width: "100%",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    borderRadius: "9px",
    padding: "11px",
    cursor: "pointer",
    fontWeight: 600,
  },

  progressSection: {
    marginTop: "24px",
  },

  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
    fontSize: "13px",
  },

  progressBackground: {
    height: "10px",
    background: "#e2e8f0",
    borderRadius: "999px",
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    background: "#2563eb",
    borderRadius: "999px",
    transition: "width 0.3s ease",
  },

  progressLabels: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "7px",
    color: "#64748b",
    fontSize: "12px",
  },

  paymentCount: {
    color: "#64748b",
    fontSize: "13px",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "900px",
  },

  th: {
    textAlign: "left",
    padding: "13px 14px",
    background: "#f8fafc",
    color: "#64748b",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },

  td: {
    padding: "14px",
    borderTop: "1px solid #edf0f5",
    fontSize: "13px",
    verticalAlign: "top",
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
    padding: "45px 20px",
    textAlign: "center",
    color: "#64748b",
  },

  loading: {
    padding: "45px 20px",
    textAlign: "center",
    color: "#64748b",
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
    fontSize: "21px",
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

  balanceBox: {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
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

  helpText: {
    display: "block",
    color: "#64748b",
    marginTop: "5px",
    fontWeight: 400,
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
  },
};

export default FeeAccountDetails;
