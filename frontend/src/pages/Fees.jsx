import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import api from "../api/axios";
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  FileText,
  X,
  Layers,
  ChevronLeft,
  ChevronRight,
  Plus
} from "lucide-react";

function formatNPR(value) {
  const number = Number(value || 0);
  return `NPR ${number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function Fees() {
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
      setError(err.response?.data?.detail || "Unable to load fee dashboard summary.");
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
      if (search.trim()) params.search = search.trim();
      if (status) params.status = status;

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
      setError(err.response?.data?.detail || "Unable to load fee accounts.");
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
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
      setError(err.response?.data?.detail || "Unable to load fee account details.");
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

  async function submitPayment(e) {
    e.preventDefault();
    if (!selectedAccount) return;

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
      await api.post(`/fee-accounts/${selectedAccount.id}/payments`, {
        amount: paymentForm.amount,
        payment_method: paymentForm.payment_method,
        transaction_reference: paymentForm.transaction_reference.trim() || null,
        remarks: paymentForm.remarks.trim() || null,
      });

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
      setError(err.response?.data?.detail || "Unable to record payment.");
    } finally {
      setSavingPayment(false);
    }
  }

  function closeDetails() {
    setDetailsOpen(false);
    setSelectedAccount(null);
    setPayments([]);
  }

  function renderStatusBadge(st) {
    const s = String(st || "").toUpperCase();
    if (s === "PAID" || s === "SUCCESS" || s === "COMPLETED") {
      return <span className="badge badge-success">{s}</span>;
    }
    if (s === "OVERDUE" || s === "FAILED") {
      return <span className="badge badge-danger">{s}</span>;
    }
    if (s === "PARTIAL" || s === "PENDING") {
      return <span className="badge badge-warning">{s}</span>;
    }
    return <span className="badge badge-info">{s || "ACTIVE"}</span>;
  }

  return (
    <AppLayout
      title="Tuition & Financial Operations"
      subtitle="Student ledger balances, collection channels, and payment verification."
      actions={
        <button
          onClick={() => {
            loadSummary();
            loadAccounts();
          }}
          disabled={loading || summaryLoading}
          className="btn btn-secondary"
          style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
        >
          <RefreshCw size={15} className={loading || summaryLoading ? "animate-spin" : ""} />
          Sync Ledgers
        </button>
      }
    >
      {/* SUMMARY KPI CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "11.5px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
              Total Assessed Due
            </span>
            <DollarSign size={18} style={{ color: "var(--accent-indigo)" }} />
          </div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-bright)", fontFamily: "var(--font-mono)" }}>
            {summaryLoading ? "..." : formatNPR(summary.total_due)}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
            All academic terms
          </div>
        </div>

        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "11.5px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
              Collected Funds
            </span>
            <CheckCircle2 size={18} style={{ color: "var(--accent-emerald)" }} />
          </div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--accent-emerald)", fontFamily: "var(--font-mono)" }}>
            {summaryLoading ? "..." : formatNPR(summary.total_paid)}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
            {summary.total_successful_payments} cleared transactions
          </div>
        </div>

        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "11.5px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
              Outstanding Balance
            </span>
            <AlertCircle size={18} style={{ color: "var(--accent-amber)" }} />
          </div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--accent-amber)", fontFamily: "var(--font-mono)" }}>
            {summaryLoading ? "..." : formatNPR(summary.total_balance)}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Pending collections
          </div>
        </div>

        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "11.5px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
              Fee Accounts
            </span>
            <Layers size={18} style={{ color: "var(--accent-cyan)" }} />
          </div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--accent-cyan)" }}>
            {summaryLoading ? "..." : summary.total_accounts}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
            {summary.active_accounts} active accounts
          </div>
        </div>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "12px",
            padding: "16px 20px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#f87171",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <AlertCircle size={18} />
            <span style={{ fontSize: "13.5px" }}>{error}</span>
          </div>
          <button
            onClick={() => setError("")}
            style={{ background: "transparent", border: "none", color: "#f87171", cursor: "pointer" }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* SEARCH & FILTERS BAR */}
      <div
        className="card"
        style={{
          padding: "16px 20px",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "10px", flex: "1 1 320px", maxWidth: "460px" }}>
          <div style={{ position: "relative", width: "100%" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50)",
                color: "var(--text-muted)",
              }}
            />
            <input
              type="text"
              placeholder="Search by student ID or admission..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: "40px", height: "40px", fontSize: "13.5px" }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: "0 18px", height: "40px" }}>
            Search
          </button>
        </form>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="input-field"
            style={{ width: "auto", minWidth: "140px", height: "40px", fontSize: "13px" }}
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
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="input-field"
            style={{ width: "auto", minWidth: "110px", height: "40px", fontSize: "13px" }}
          >
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--border-default)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-secondary)" }}>
            Student Fee Accounts ({pagination.total || 0} registered)
          </span>
        </div>

        {loading ? (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                border: "3px solid rgba(255, 255, 255, 0.1)",
                borderTopColor: "var(--accent-indigo)",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 16px",
              }}
            />
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Retrieving ledger balances...</p>
          </div>
        ) : accounts.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <CreditCard size={44} style={{ color: "var(--text-muted)", opacity: 0.6, margin: "0 auto 14px" }} />
            <h3 style={{ fontSize: "17px", fontWeight: 600, color: "var(--text-bright)", margin: "0 0 6px" }}>
              No fee accounts found
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
              Try adjusting your search criteria or filter status.
            </p>
          </div>
        ) : (
          <div style={{ width: "100%", overflowX: "auto" }}>
            <table className="dark-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Academic Session</th>
                  <th>Total Due</th>
                  <th>Amount Paid</th>
                  <th>Remaining Balance</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((acc) => {
                  const hasBalance = Number(acc.balance) > 0 && acc.status !== "CLOSED";

                  return (
                    <tr key={acc.id}>
                      <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent-cyan)" }}>
                        #{acc.student_id}
                      </td>
                      <td style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
                        {acc.academic_year}
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text-bright)" }}>
                        {formatNPR(acc.total_due)}
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--accent-emerald)" }}>
                        {formatNPR(acc.total_paid)}
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: "13.5px", fontWeight: 700, color: Number(acc.balance) > 0 ? "var(--accent-amber)" : "var(--accent-emerald)" }}>
                        {formatNPR(acc.balance)}
                      </td>
                      <td>
                        {renderStatusBadge(acc.status)}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "8px" }}>
                          <button
                            onClick={() => openDetails(acc)}
                            className="btn btn-secondary"
                            style={{ padding: "6px 12px", fontSize: "12px" }}
                          >
                            Details
                          </button>
                          {hasBalance && (
                            <button
                              onClick={() => openPayment(acc)}
                              className="btn btn-primary"
                              style={{ padding: "6px 12px", fontSize: "12px" }}
                            >
                              + Pay
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        <div
          style={{
            padding: "14px 20px",
            borderTop: "1px solid var(--border-default)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="btn btn-secondary"
            style={{ padding: "7px 14px", fontSize: "12.5px" }}
          >
            <ChevronLeft size={14} /> Previous
          </button>

          <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
            Page <strong style={{ color: "var(--text-bright)" }}>{pagination.page || page}</strong> of{" "}
            <strong style={{ color: "var(--text-bright)" }}>{pagination.total_pages || 1}</strong>
          </span>

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= (pagination.total_pages || 1)}
            className="btn btn-secondary"
            style={{ padding: "7px 14px", fontSize: "12.5px" }}
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* ACCOUNT DETAILS MODAL */}
      {detailsOpen && selectedAccount && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000,
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: "760px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 0,
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid var(--border-default)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                position: "sticky",
                top: 0,
                background: "var(--bg-surface)",
                zIndex: 2,
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "var(--text-bright)" }}>
                  Fee Ledger Profile
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: "12.5px", color: "var(--text-secondary)" }}>
                  Account #{selectedAccount.id} · Student #{selectedAccount.student_id}
                </p>
              </div>
              <button
                onClick={closeDetails}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: "24px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "14px",
                  marginBottom: "24px",
                  background: "rgba(255, 255, 255, 0.02)",
                  padding: "16px",
                  borderRadius: "12px",
                  border: "1px solid var(--border-default)",
                }}
              >
                <div>
                  <div style={{ fontSize: "11.5px", color: "var(--text-muted)", textTransform: "uppercase" }}>Total Due</div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-bright)", marginTop: "4px" }}>
                    {formatNPR(selectedAccount.total_due)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "11.5px", color: "var(--text-muted)", textTransform: "uppercase" }}>Paid to Date</div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--accent-emerald)", marginTop: "4px" }}>
                    {formatNPR(selectedAccount.total_paid)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "11.5px", color: "var(--text-muted)", textTransform: "uppercase" }}>Balance Outstanding</div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--accent-amber)", marginTop: "4px" }}>
                    {formatNPR(selectedAccount.balance)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "11.5px", color: "var(--text-muted)", textTransform: "uppercase" }}>Account Status</div>
                  <div style={{ marginTop: "4px" }}>{renderStatusBadge(selectedAccount.status)}</div>
                </div>
              </div>

              {/* PAYMENT HISTORY */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "var(--text-bright)" }}>
                  Verified Payment Receipts
                </h4>
                {Number(selectedAccount.balance) > 0 && selectedAccount.status !== "CLOSED" && (
                  <button
                    onClick={() => {
                      setDetailsOpen(false);
                      openPayment(selectedAccount);
                    }}
                    className="btn btn-primary"
                    style={{ fontSize: "12px", padding: "6px 12px" }}
                  >
                    + Record Payment
                  </button>
                )}
              </div>

              {paymentsLoading ? (
                <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                  Loading payment history...
                </div>
              ) : payments.length === 0 ? (
                <div style={{ padding: "30px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                  No historical receipts recorded.
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="dark-table">
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>Amount</th>
                        <th>Channel</th>
                        <th>Transaction Ref</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p) => (
                        <tr key={p.id}>
                          <td style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
                            {p.payment_date ? new Date(p.payment_date).toLocaleString() : "—"}
                          </td>
                          <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent-emerald)" }}>
                            {formatNPR(p.amount)}
                          </td>
                          <td style={{ fontSize: "12.5px" }}>{p.payment_method}</td>
                          <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--accent-cyan)" }}>
                            {p.transaction_reference || "—"}
                          </td>
                          <td>{renderStatusBadge(p.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {paymentOpen && selectedAccount && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000,
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: "520px",
              padding: 0,
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid var(--border-default)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "var(--text-bright)" }}>
                  Record Payment
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: "12.5px", color: "var(--text-secondary)" }}>
                  Student #{selectedAccount.student_id} · Remaining: {formatNPR(selectedAccount.balance)}
                </p>
              </div>
              <button
                onClick={() => setPaymentOpen(false)}
                style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submitPayment} style={{ padding: "24px" }}>
              <div style={{ marginBottom: "16px" }}>
                <label className="form-label">
                  Payment Amount (NPR) <span style={{ color: "var(--accent-cyan)" }}>*</span>
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={selectedAccount.balance}
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  placeholder={`Max: ${selectedAccount.balance}`}
                  required
                  className="input-field"
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label className="form-label">Payment Method</label>
                <select
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                  className="input-field"
                >
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                  <option value="ESEWA">eSewa</option>
                  <option value="KHALTI">Khalti</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label className="form-label">Transaction Reference #</label>
                <input
                  type="text"
                  value={paymentForm.transaction_reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, transaction_reference: e.target.value })}
                  placeholder="e.g. TXN-940283"
                  className="input-field"
                />
              </div>

              <div style={{ marginBottom: "22px" }}>
                <label className="form-label">Remarks / Description</label>
                <input
                  type="text"
                  value={paymentForm.remarks}
                  onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                  placeholder="e.g. Term 1 partial settlement"
                  className="input-field"
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setPaymentOpen(false)}
                  disabled={savingPayment}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPayment}
                  className="btn btn-primary"
                >
                  {savingPayment ? "Processing Payment..." : "Confirm Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
