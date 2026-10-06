import React, { useEffect, useMemo, useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const STATUS_OPTIONS = [
  "ALL",
  "DRAFT",
  "PROCESSED",
  "APPROVED",
  "PAID",
  "CANCELLED",
];

function getToken() {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    ""
  );
}

function money(value) {
  const number = Number(value || 0);

  return `₹${number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function monthName(month) {
  const found = MONTHS.find(
    (item) => item.value === Number(month)
  );

  return found ? found.label : "-";
}

function getCurrentYear() {
  return new Date().getFullYear();
}

function getCurrentMonth() {
  return new Date().getMonth() + 1;
}

function getInitialForm() {
  return {
    staff_id: "",
    payroll_month: getCurrentMonth(),
    payroll_year: getCurrentYear(),
    pay_date: "",
    total_working_days: "26",
    days_present: "0",
    days_absent: "0",
    days_on_leave: "0",
    half_days: "0",
    loss_of_pay_days: "0",
    basic_salary: "",
    allowances: "0",
    deductions: "0",
    overtime_amount: "0",
    bonus_amount: "0",
    payment_method: "",
    payment_reference: "",
    payment_date: "",
    remarks: "",
  };
}

export default function StaffPayroll() {
  const [staff, setStaff] = useState([]);
  const [payrolls, setPayrolls] = useState([]);

  const [summary, setSummary] = useState({
    total_staff: 0,
    total_payroll_records: 0,
    draft: 0,
    processed: 0,
    approved: 0,
    paid: 0,
    cancelled: 0,
    total_gross_salary: 0,
    total_deductions: 0,
    total_net_salary: 0,
  });

  const [loading, setLoading] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedMonth, setSelectedMonth] = useState(
    getCurrentMonth()
  );

  const [selectedYear, setSelectedYear] = useState(
    getCurrentYear()
  );

  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState(
    getInitialForm()
  );

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [selectedPayroll, setSelectedPayroll] =
    useState(null);

  const [showPayModal, setShowPayModal] =
    useState(false);

  const [paymentForm, setPaymentForm] = useState({
    payment_method: "BANK_TRANSFER",
    payment_reference: "",
    payment_date: new Date()
      .toISOString()
      .split("T")[0],
    remarks: "",
  });

  const token = getToken();

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  // =====================================================
  // LOAD STAFF
  // =====================================================

  const loadStaff = async () => {
    try {
      setStaffLoading(true);

      const response = await fetch(
        `${API_BASE}/staff?page=1&page_size=100`,
        {
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load staff."
        );
      }

      const data = await response.json();

      const activeStaff = (
        data.items || []
      ).filter(
        (item) =>
          item.status === "ACTIVE" &&
          !item.is_deleted
      );

      setStaff(activeStaff);
    } catch (err) {
      setError(err.message);
    } finally {
      setStaffLoading(false);
    }
  };

  // =====================================================
  // LOAD PAYROLL
  // =====================================================

  const loadPayrolls = async () => {
    try {
      setLoading(true);
      setError("");

      let url =
        `${API_BASE}/staff-payroll` +
        `?page=1&page_size=100` +
        `&payroll_month=${selectedMonth}` +
        `&payroll_year=${selectedYear}`;

      if (search.trim()) {
        url += `&search=${encodeURIComponent(
          search.trim()
        )}`;
      }

      if (statusFilter !== "ALL") {
        url += `&status=${statusFilter}`;
      }

      const response = await fetch(
        url,
        {
          headers,
        }
      );

      if (!response.ok) {
        const data = await response.json();

        throw new Error(
          data.detail ||
            "Unable to load payroll."
        );
      }

      const data = await response.json();

      setPayrolls(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD SUMMARY
  // =====================================================

  const loadSummary = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/staff-payroll/summary` +
          `?payroll_month=${selectedMonth}` +
          `&payroll_year=${selectedYear}`,
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
        "Summary error:",
        err
      );
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    loadPayrolls();
    loadSummary();
  }, [
    selectedMonth,
    selectedYear,
    statusFilter,
  ]);

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleFormChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // STAFF SELECTION
  // =====================================================

  const handleStaffChange = (
    event
  ) => {
    const staffId = event.target.value;

    const selected = staff.find(
      (item) =>
        String(item.id) ===
        String(staffId)
    );

    setForm((previous) => ({
      ...previous,
      staff_id: staffId,
      basic_salary:
        selected?.basic_salary ||
        "",
    }));
  };

  // =====================================================
  // OPEN CREATE MODAL
  // =====================================================

  const openCreateModal = () => {
    setError("");
    setMessage("");

    setForm({
      ...getInitialForm(),
      payroll_month: selectedMonth,
      payroll_year: selectedYear,
    });

    setShowModal(true);
  };

  // =====================================================
  // CREATE PAYROLL
  // =====================================================

  const handleCreatePayroll = async (
    event
  ) => {
    event.preventDefault();

    if (!form.staff_id) {
      setError(
        "Please select a staff member."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        staff_id: Number(
          form.staff_id
        ),

        payroll_month: Number(
          form.payroll_month
        ),

        payroll_year: Number(
          form.payroll_year
        ),

        pay_date:
          form.pay_date || null,

        total_working_days: Number(
          form.total_working_days || 0
        ),

        days_present: Number(
          form.days_present || 0
        ),

        days_absent: Number(
          form.days_absent || 0
        ),

        days_on_leave: Number(
          form.days_on_leave || 0
        ),

        half_days: Number(
          form.half_days || 0
        ),

        loss_of_pay_days: Number(
          form.loss_of_pay_days || 0
        ),

        basic_salary: Number(
          form.basic_salary || 0
        ),

        allowances: Number(
          form.allowances || 0
        ),

        deductions: Number(
          form.deductions || 0
        ),

        overtime_amount: Number(
          form.overtime_amount || 0
        ),

        bonus_amount: Number(
          form.bonus_amount || 0
        ),

        payment_method:
          form.payment_method ||
          null,

        payment_reference:
          form.payment_reference ||
          null,

        payment_date:
          form.payment_date ||
          null,

        remarks:
          form.remarks || null,
      };

      const response = await fetch(
        `${API_BASE}/staff-payroll`,
        {
          method: "POST",
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
            "Unable to create payroll."
        );
      }

      setMessage(
        "Payroll created successfully."
      );

      setShowModal(false);

      await loadPayrolls();
      await loadSummary();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // PROCESS PAYROLL
  // =====================================================

  const processPayroll = async (
    payroll
  ) => {
    const confirmed = window.confirm(
      `Process payroll for ${payroll.staff_name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_BASE}/staff-payroll/${payroll.id}/process`,
        {
          method: "PATCH",
          headers,
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to process payroll."
        );
      }

      setMessage(
        "Payroll processed successfully."
      );

      await loadPayrolls();
      await loadSummary();
    } catch (err) {
      setError(err.message);
    }
  };

  // =====================================================
  // APPROVE PAYROLL
  // =====================================================

  const approvePayroll = async (
    payroll
  ) => {
    const remarks =
      window.prompt(
        "Approval remarks (optional):",
        ""
      );

    if (remarks === null) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_BASE}/staff-payroll/${payroll.id}/approve`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({
            approval_remarks:
              remarks || null,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to approve payroll."
        );
      }

      setMessage(
        "Payroll approved successfully."
      );

      await loadPayrolls();
      await loadSummary();
    } catch (err) {
      setError(err.message);
    }
  };

  // =====================================================
  // OPEN PAYMENT MODAL
  // =====================================================

  const openPayModal = (
    payroll
  ) => {
    setSelectedPayroll(payroll);

    setPaymentForm({
      payment_method:
        "BANK_TRANSFER",
      payment_reference: "",
      payment_date:
        new Date()
          .toISOString()
          .split("T")[0],
      remarks: "",
    });

    setShowPayModal(true);
  };

  // =====================================================
  // MARK PAYROLL PAID
  // =====================================================

  const handlePayPayroll = async (
    event
  ) => {
    event.preventDefault();

    if (!selectedPayroll) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_BASE}/staff-payroll/${selectedPayroll.id}/pay`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({
            payment_method:
              paymentForm.payment_method,

            payment_reference:
              paymentForm.payment_reference ||
              null,

            payment_date:
              paymentForm.payment_date ||
              null,

            remarks:
              paymentForm.remarks ||
              null,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to mark payroll as paid."
        );
      }

      setMessage(
        "Payroll marked as PAID successfully."
      );

      setShowPayModal(false);
      setSelectedPayroll(null);

      await loadPayrolls();
      await loadSummary();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // CANCEL PAYROLL
  // =====================================================

  const cancelPayroll = async (
    payroll
  ) => {
    const confirmed = window.confirm(
      `Cancel payroll for ${payroll.staff_name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_BASE}/staff-payroll/${payroll.id}/cancel`,
        {
          method: "PATCH",
          headers,
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to cancel payroll."
        );
      }

      setMessage(
        "Payroll cancelled successfully."
      );

      await loadPayrolls();
      await loadSummary();
    } catch (err) {
      setError(err.message);
    }
  };

  // =====================================================
  // DELETE PAYROLL
  // =====================================================

  const deletePayroll = async (
    payroll
  ) => {
    const confirmed = window.confirm(
      `Delete payroll for ${payroll.staff_name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_BASE}/staff-payroll/${payroll.id}`,
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
            "Unable to delete payroll."
        );
      }

      setMessage(
        "Payroll deleted successfully."
      );

      await loadPayrolls();
      await loadSummary();
    } catch (err) {
      setError(err.message);
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearch = () => {
    loadPayrolls();
  };

  // =====================================================
  // STATUS BADGE
  // =====================================================

  const statusStyle = (
    status
  ) => {
    const styles = {
      DRAFT: {
        background: "#f3f4f6",
        color: "#374151",
      },

      PROCESSED: {
        background: "#dbeafe",
        color: "#1d4ed8",
      },

      APPROVED: {
        background: "#dcfce7",
        color: "#15803d",
      },

      PAID: {
        background: "#d1fae5",
        color: "#047857",
      },

      CANCELLED: {
        background: "#fee2e2",
        color: "#b91c1c",
      },
    };

    return (
      styles[status] || {
        background: "#f3f4f6",
        color: "#374151",
      }
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f8fa",
        padding: "28px",
        fontFamily:
          "Inter, Arial, sans-serif",
      }}
    >
      {/* ==========================================
          HEADER
      ========================================== */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: "24px",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "30px",
              fontWeight: 700,
              color: "#111827",
            }}
          >
            Staff Payroll
          </h1>

          <p
            style={{
              margin:
                "7px 0 0",
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            Manage salaries, payroll
            processing and staff payments.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          style={{
            border: "none",
            background: "#111827",
            color: "white",
            padding:
              "12px 18px",
            borderRadius: "9px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "14px",
          }}
        >
          + Create Payroll
        </button>
      </div>

      {/* ==========================================
          MESSAGES
      ========================================== */}

      {message && (
        <div
          style={{
            background: "#dcfce7",
            color: "#166534",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "14px",
            fontSize: "14px",
          }}
        >
          {message}
        </div>
      )}

      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "14px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {/* ==========================================
          PERIOD FILTER
      ========================================== */}

      <div
        style={{
          background: "white",
          border:
            "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "18px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "end",
          gap: "14px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: 600,
              color: "#6b7280",
              marginBottom: "6px",
            }}
          >
            Payroll Month
          </label>

          <select
            value={selectedMonth}
            onChange={(e) =>
              setSelectedMonth(
                Number(e.target.value)
              )
            }
            style={inputStyle}
          >
            {MONTHS.map(
              (month) => (
                <option
                  key={month.value}
                  value={month.value}
                >
                  {month.label}
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: 600,
              color: "#6b7280",
              marginBottom: "6px",
            }}
          >
            Year
          </label>

          <select
            value={selectedYear}
            onChange={(e) =>
              setSelectedYear(
                Number(e.target.value)
              )
            }
            style={inputStyle}
          >
            {[
              getCurrentYear() - 1,
              getCurrentYear(),
              getCurrentYear() + 1,
            ].map((year) => (
              <option
                key={year}
                value={year}
              >
                {year}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            flex: 1,
            minWidth: "220px",
          }}
        >
          <label
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: 600,
              color: "#6b7280",
              marginBottom: "6px",
            }}
          >
            Search
          </label>

          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            onKeyDown={(e) => {
              if (
                e.key === "Enter"
              ) {
                handleSearch();
              }
            }}
            placeholder="Search staff..."
            style={inputStyle}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: 600,
              color: "#6b7280",
              marginBottom: "6px",
            }}
          >
            Status
          </label>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            style={inputStyle}
          >
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
        </div>

        <button
          onClick={() => {
            loadPayrolls();
            loadSummary();
          }}
          style={secondaryButton}
        >
          ↻ Refresh
        </button>
      </div>

      {/* ==========================================
          SUMMARY CARDS
      ========================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "14px",
          marginBottom: "22px",
        }}
      >
        <SummaryCard
          title="Payroll Records"
          value={
            summary.total_payroll_records
          }
        />

        <SummaryCard
          title="Draft"
          value={summary.draft}
        />

        <SummaryCard
          title="Processed"
          value={summary.processed}
        />

        <SummaryCard
          title="Approved"
          value={summary.approved}
        />

        <SummaryCard
          title="Paid"
          value={summary.paid}
        />

        <SummaryCard
          title="Gross Salary"
          value={money(
            summary.total_gross_salary
          )}
        />

        <SummaryCard
          title="Deductions"
          value={money(
            summary.total_deductions
          )}
        />

        <SummaryCard
          title="Net Salary"
          value={money(
            summary.total_net_salary
          )}
        />
      </div>

      {/* ==========================================
          PAYROLL TABLE
      ========================================== */}

      <div
        style={{
          background: "white",
          border:
            "1px solid #e5e7eb",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "18px",
            borderBottom:
              "1px solid #e5e7eb",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "18px",
              color: "#111827",
            }}
          >
            {monthName(
              selectedMonth
            )}{" "}
            {selectedYear} Payroll
          </h2>
        </div>

        {loading ? (
          <div
            style={{
              padding: "50px",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            Loading payroll...
          </div>
        ) : payrolls.length === 0 ? (
          <div
            style={{
              padding: "55px",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            <div
              style={{
                fontSize: "36px",
                marginBottom: "10px",
              }}
            >
              💰
            </div>

            <div
              style={{
                fontWeight: 600,
                color: "#374151",
                marginBottom: "5px",
              }}
            >
              No payroll records
            </div>

            <div
              style={{
                fontSize: "13px",
              }}
            >
              Create payroll for this
              month to get started.
            </div>
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
                      "#f9fafb",
                  }}
                >
                  {[
                    "Staff",
                    "Period",
                    "Basic",
                    "Gross",
                    "Deductions",
                    "Net Salary",
                    "Status",
                    "Actions",
                  ].map(
                    (heading) => (
                      <th
                        key={heading}
                        style={{
                          textAlign:
                            "left",
                          padding:
                            "13px 15px",
                          fontSize:
                            "12px",
                          color:
                            "#6b7280",
                          fontWeight:
                            700,
                          borderBottom:
                            "1px solid #e5e7eb",
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {payrolls.map(
                  (payroll) => (
                    <tr
                      key={
                        payroll.id
                      }
                    >
                      <td
                        style={
                          tableCell
                        }
                      >
                        <div
                          style={{
                            fontWeight: 600,
                            color:
                              "#111827",
                          }}
                        >
                          {
                            payroll.staff_name
                          }
                        </div>

                        <div
                          style={{
                            fontSize:
                              "12px",
                            color:
                              "#6b7280",
                            marginTop:
                              "3px",
                          }}
                        >
                          {
                            payroll.staff_code
                          }
                        </div>

                        <div
                          style={{
                            fontSize:
                              "11px",
                            color:
                              "#9ca3af",
                            marginTop:
                              "2px",
                          }}
                        >
                          {
                            payroll.designation ||
                            "-"
                          }
                        </div>
                      </td>

                      <td
                        style={
                          tableCell
                        }
                      >
                        {monthName(
                          payroll.payroll_month
                        )}{" "}
                        {
                          payroll.payroll_year
                        }
                      </td>

                      <td
                        style={
                          tableCell
                        }
                      >
                        {money(
                          payroll.basic_salary
                        )}
                      </td>

                      <td
                        style={
                          tableCell
                        }
                      >
                        {money(
                          payroll.gross_salary
                        )}
                      </td>

                      <td
                        style={
                          tableCell
                        }
                      >
                        {money(
                          payroll.total_deductions
                        )}
                      </td>

                      <td
                        style={{
                          ...tableCell,
                          fontWeight: 700,
                          color:
                            "#111827",
                        }}
                      >
                        {money(
                          payroll.net_salary
                        )}
                      </td>

                      <td
                        style={
                          tableCell
                        }
                      >
                        <span
                          style={{
                            ...statusStyle(
                              payroll.status
                            ),
                            display:
                              "inline-block",
                            padding:
                              "5px 9px",
                            borderRadius:
                              "999px",
                            fontSize:
                              "11px",
                            fontWeight:
                              700,
                          }}
                        >
                          {
                            payroll.status
                          }
                        </span>
                      </td>

                      <td
                        style={
                          tableCell
                        }
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            gap:
                              "6px",
                            flexWrap:
                              "wrap",
                          }}
                        >
                          {payroll.status ===
                            "DRAFT" && (
                            <>
                              <ActionButton
                                label="Process"
                                onClick={() =>
                                  processPayroll(
                                    payroll
                                  )
                                }
                              />

                              <ActionButton
                                label="Delete"
                                danger
                                onClick={() =>
                                  deletePayroll(
                                    payroll
                                  )
                                }
                              />
                            </>
                          )}

                          {payroll.status ===
                            "PROCESSED" && (
                            <>
                              <ActionButton
                                label="Approve"
                                onClick={() =>
                                  approvePayroll(
                                    payroll
                                  )
                                }
                              />

                              <ActionButton
                                label="Cancel"
                                danger
                                onClick={() =>
                                  cancelPayroll(
                                    payroll
                                  )
                                }
                              />
                            </>
                          )}

                          {payroll.status ===
                            "APPROVED" && (
                            <>
                              <ActionButton
                                label="Pay"
                                onClick={() =>
                                  openPayModal(
                                    payroll
                                  )
                                }
                              />

                              <ActionButton
                                label="Cancel"
                                danger
                                onClick={() =>
                                  cancelPayroll(
                                    payroll
                                  )
                                }
                              />
                            </>
                          )}

                          {payroll.status ===
                            "CANCELLED" && (
                            <ActionButton
                              label="Delete"
                              danger
                              onClick={() =>
                                deletePayroll(
                                  payroll
                                )
                              }
                            />
                          )}

                          {payroll.status ===
                            "PAID" && (
                            <span
                              style={{
                                color:
                                  "#047857",
                                fontSize:
                                  "12px",
                                fontWeight:
                                  600,
                              }}
                            >
                              Payment
                              completed
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==========================================
          CREATE PAYROLL MODAL
      ========================================== */}

      {showModal && (
        <Modal
          title="Create Payroll"
          onClose={() =>
            setShowModal(false)
          }
        >
          <form
            onSubmit={
              handleCreatePayroll
            }
          >
            <div
              style={formGrid}
            >
              <FormField
                label="Staff Member"
                required
              >
                <select
                  name="staff_id"
                  value={
                    form.staff_id
                  }
                  onChange={
                    handleStaffChange
                  }
                  style={
                    inputStyle
                  }
                  required
                >
                  <option value="">
                    {staffLoading
                      ? "Loading staff..."
                      : "Select staff"}
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
                        {person.staff_id}{" "}
                        -{" "}
                        {
                          person.first_name
                        }{" "}
                        {
                          person.last_name
                        }
                      </option>
                    )
                  )}
                </select>
              </FormField>

              <FormField
                label="Payroll Month"
                required
              >
                <select
                  name="payroll_month"
                  value={
                    form.payroll_month
                  }
                  onChange={
                    handleFormChange
                  }
                  style={
                    inputStyle
                  }
                >
                  {MONTHS.map(
                    (month) => (
                      <option
                        key={
                          month.value
                        }
                        value={
                          month.value
                        }
                      >
                        {
                          month.label
                        }
                      </option>
                    )
                  )}
                </select>
              </FormField>

              <FormField
                label="Payroll Year"
                required
              >
                <input
                  type="number"
                  name="payroll_year"
                  value={
                    form.payroll_year
                  }
                  onChange={
                    handleFormChange
                  }
                  style={
                    inputStyle
                  }
                  min="2000"
                  max="2100"
                />
              </FormField>

              <FormField label="Pay Date">
                <input
                  type="date"
                  name="pay_date"
                  value={
                    form.pay_date
                  }
                  onChange={
                    handleFormChange
                  }
                  style={
                    inputStyle
                  }
                />
              </FormField>

              <FormField
                label="Basic Salary"
                required
              >
                <input
                  type="number"
                  name="basic_salary"
                  value={
                    form.basic_salary
                  }
                  onChange={
                    handleFormChange
                  }
                  style={
                    inputStyle
                  }
                  min="0"
                  step="0.01"
                  required
                />
              </FormField>

              <FormField label="Allowances">
                <input
                  type="number"
                  name="allowances"
                  value={
                    form.allowances
                  }
                  onChange={
                    handleFormChange
                  }
                  style={
                    inputStyle
                  }
                  min="0"
                  step="0.01"
                />
              </FormField>

              <FormField label="Bonus">
                <input
                  type="number"
                  name="bonus_amount"
                  value={
                    form.bonus_amount
                  }
                  onChange={
                    handleFormChange
                  }
                  style={
                    inputStyle
                  }
                  min="0"
                  step="0.01"
                />
              </FormField>

              <FormField label="Overtime Amount">
                <input
                  type="number"
                  name="overtime_amount"
                  value={
                    form.overtime_amount
                  }
                  onChange={
                    handleFormChange
                  }
                  style={
                    inputStyle
                  }
                  min="0"
                  step="0.01"
                />
              </FormField>

              <FormField label="Other Deductions">
                <input
                  type="number"
                  name="deductions"
                  value={
                    form.deductions
                  }
                  onChange={
                    handleFormChange
                  }
                  style={
                    inputStyle
                  }
                  min="0"
                  step="0.01"
                />
              </FormField>

              <FormField label="Total Working Days">
                <input
                  type="number"
                  name="total_working_days"
                  value={
                    form.total_working_days
                  }
                  onChange={
                    handleFormChange
                  }
                  style={
                    inputStyle
                  }
                  min="0"
                  step="0.5"
                />
              </FormField>

              <FormField label="Present Days">
                <input
                  type="number"
                  name="days_present"
                  value={
                    form.days_present
                  }
                  onChange={
                    handleFormChange
                  }
                  style={
                    inputStyle
                  }
                  min="0"
                  step="0.5"
                />
              </FormField>

              <FormField label="Absent Days">
                <input
                  type="number"
                  name="days_absent"
                  value={
                    form.days_absent
                  }
                  onChange={
                    handleFormChange
                  }
                  style={
                    inputStyle
                  }
                  min="0"
                  step="0.5"
                />
              </FormField>

              <FormField label="Leave Days">
                <input
                  type="number"
                  name="days_on_leave"
                  value={
                    form.days_on_leave
                  }
                  onChange={
                    handleFormChange
                  }
                  style={
                    inputStyle
                  }
                  min="0"
                  step="0.5"
                />
              </FormField>

              <FormField label="Half Days">
                <input
                  type="number"
                  name="half_days"
                  value={
                    form.half_days
                  }
                  onChange={
                    handleFormChange
                  }
                  style={
                    inputStyle
                  }
                  min="0"
                  step="0.5"
                />
              </FormField>

              <FormField label="Loss of Pay Days">
                <input
                  type="number"
                  name="loss_of_pay_days"
                  value={
                    form.loss_of_pay_days
                  }
                  onChange={
                    handleFormChange
                  }
                  style={
                    inputStyle
                  }
                  min="0"
                  step="0.5"
                />
              </FormField>

              <FormField label="Payment Method">
                <select
                  name="payment_method"
                  value={
                    form.payment_method
                  }
                  onChange={
                    handleFormChange
                  }
                  style={
                    inputStyle
                  }
                >
                  <option value="">
                    Not Paid Yet
                  </option>
                  <option value="BANK_TRANSFER">
                    Bank Transfer
                  </option>
                  <option value="UPI">
                    UPI
                  </option>
                  <option value="CASH">
                    Cash
                  </option>
                  <option value="CHEQUE">
                    Cheque
                  </option>
                </select>
              </FormField>

              <FormField label="Payment Reference">
                <input
                  type="text"
                  name="payment_reference"
                  value={
                    form.payment_reference
                  }
                  onChange={
                    handleFormChange
                  }
                  style={
                    inputStyle
                  }
                  placeholder="Optional"
                />
              </FormField>
            </div>

            <FormField label="Remarks">
              <textarea
                name="remarks"
                value={
                  form.remarks
                }
                onChange={
                  handleFormChange
                }
                style={{
                  ...inputStyle,
                  minHeight:
                    "80px",
                  resize:
                    "vertical",
                }}
                placeholder="Optional payroll remarks"
              />
            </FormField>

            <div
              style={{
                marginTop: "20px",
                background:
                  "#f9fafb",
                border:
                  "1px solid #e5e7eb",
                borderRadius:
                  "10px",
                padding:
                  "14px",
              }}
            >
              <strong
                style={{
                  fontSize:
                    "13px",
                  color:
                    "#374151",
                }}
              >
                Payroll Calculation
              </strong>

              <p
                style={{
                  margin:
                    "7px 0 0",
                  fontSize:
                    "12px",
                  color:
                    "#6b7280",
                  lineHeight:
                    "1.6",
                }}
              >
                Gross Salary = Basic +
                Allowances + Bonus +
                Overtime.
                <br />
                LOP is calculated from
                Basic Salary and LOP
                days.
                <br />
                Net Salary = Gross Salary -
                Deductions - LOP.
              </p>
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
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setShowModal(
                    false
                  )
                }
                style={
                  secondaryButton
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  saving
                }
                style={
                  primaryButton
                }
              >
                {saving
                  ? "Creating..."
                  : "Create Payroll"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ==========================================
          PAYMENT MODAL
      ========================================== */}

      {showPayModal &&
        selectedPayroll && (
          <Modal
            title="Mark Payroll as Paid"
            onClose={() => {
              setShowPayModal(
                false
              );
              setSelectedPayroll(
                null
              );
            }}
          >
            <div
              style={{
                background:
                  "#f9fafb",
                padding:
                  "14px",
                borderRadius:
                  "10px",
                marginBottom:
                  "18px",
              }}
            >
              <div
                style={{
                  fontWeight:
                    700,
                  color:
                    "#111827",
                }}
              >
                {
                  selectedPayroll.staff_name
                }
              </div>

              <div
                style={{
                  fontSize:
                    "13px",
                  color:
                    "#6b7280",
                  marginTop:
                    "4px",
                }}
              >
                Net Salary:{" "}
                <strong>
                  {money(
                    selectedPayroll.net_salary
                  )}
                </strong>
              </div>
            </div>

            <form
              onSubmit={
                handlePayPayroll
              }
            >
              <FormField
                label="Payment Method"
                required
              >
                <select
                  value={
                    paymentForm.payment_method
                  }
                  onChange={(e) =>
                    setPaymentForm(
                      (
                        previous
                      ) => ({
                        ...previous,
                        payment_method:
                          e.target.value,
                      })
                    )
                  }
                  style={
                    inputStyle
                  }
                  required
                >
                  <option value="BANK_TRANSFER">
                    Bank Transfer
                  </option>

                  <option value="UPI">
                    UPI
                  </option>

                  <option value="CASH">
                    Cash
                  </option>

                  <option value="CHEQUE">
                    Cheque
                  </option>
                </select>
              </FormField>

              <FormField label="Payment Reference">
                <input
                  value={
                    paymentForm.payment_reference
                  }
                  onChange={(e) =>
                    setPaymentForm(
                      (
                        previous
                      ) => ({
                        ...previous,
                        payment_reference:
                          e.target.value,
                      })
                    )
                  }
                  style={
                    inputStyle
                  }
                  placeholder="Transaction / cheque reference"
                />
              </FormField>

              <FormField
                label="Payment Date"
                required
              >
                <input
                  type="date"
                  value={
                    paymentForm.payment_date
                  }
                  onChange={(e) =>
                    setPaymentForm(
                      (
                        previous
                      ) => ({
                        ...previous,
                        payment_date:
                          e.target.value,
                      })
                    )
                  }
                  style={
                    inputStyle
                  }
                  required
                />
              </FormField>

              <FormField label="Remarks">
                <textarea
                  value={
                    paymentForm.remarks
                  }
                  onChange={(e) =>
                    setPaymentForm(
                      (
                        previous
                      ) => ({
                        ...previous,
                        remarks:
                          e.target.value,
                      })
                    )
                  }
                  style={{
                    ...inputStyle,
                    minHeight:
                      "80px",
                    resize:
                      "vertical",
                  }}
                />
              </FormField>

              <div
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "flex-end",
                  gap: "10px",
                  marginTop:
                    "20px",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowPayModal(
                      false
                    );
                    setSelectedPayroll(
                      null
                    );
                  }}
                  style={
                    secondaryButton
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  style={
                    primaryButton
                  }
                >
                  {saving
                    ? "Processing..."
                    : "Confirm Payment"}
                </button>
              </div>
            </form>
          </Modal>
        )}
    </div>
  );
}


// =====================================================
// SUMMARY CARD
// =====================================================

function SummaryCard({
  title,
  value,
}) {
  return (
    <div
      style={{
        background:
          "white",
        border:
          "1px solid #e5e7eb",
        borderRadius:
          "12px",
        padding:
          "17px",
      }}
    >
      <div
        style={{
          fontSize:
            "12px",
          color:
            "#6b7280",
          fontWeight:
            600,
          marginBottom:
            "8px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize:
            "21px",
          fontWeight:
            700,
          color:
            "#111827",
        }}
      >
        {value}
      </div>
    </div>
  );
}


// =====================================================
// FORM FIELD
// =====================================================

function FormField({
  label,
  required = false,
  children,
}) {
  return (
    <div
      style={{
        marginBottom:
          "15px",
      }}
    >
      <label
        style={{
          display:
            "block",
          fontSize:
            "12px",
          fontWeight:
            600,
          color:
            "#374151",
          marginBottom:
            "6px",
        }}
      >
        {label}

        {required && (
          <span
            style={{
              color:
                "#dc2626",
              marginLeft:
                "3px",
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


// =====================================================
// ACTION BUTTON
// =====================================================

function ActionButton({
  label,
  onClick,
  danger = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: `1px solid ${
          danger
            ? "#fecaca"
            : "#d1d5db"
        }`,
        background:
          danger
            ? "#fff7f7"
            : "white",
        color:
          danger
            ? "#b91c1c"
            : "#374151",
        borderRadius:
          "6px",
        padding:
          "6px 9px",
        cursor:
          "pointer",
        fontSize:
          "11px",
        fontWeight:
          600,
      }}
    >
      {label}
    </button>
  );
}


// =====================================================
// MODAL
// =====================================================

function Modal({
  title,
  onClose,
  children,
}) {
  return (
    <div
      style={{
        position:
          "fixed",
        inset: 0,
        background:
          "rgba(0,0,0,0.45)",
        display:
          "flex",
        alignItems:
          "center",
        justifyContent:
          "center",
        zIndex: 1000,
        padding:
          "20px",
      }}
    >
      <div
        style={{
          background:
            "white",
          borderRadius:
            "14px",
          width:
            "min(900px, 100%)",
          maxHeight:
            "90vh",
          overflowY:
            "auto",
          boxShadow:
            "0 20px 50px rgba(0,0,0,0.2)",
        }}
      >
        <div
          style={{
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "space-between",
            padding:
              "18px 20px",
            borderBottom:
              "1px solid #e5e7eb",
            position:
              "sticky",
            top: 0,
            background:
              "white",
            zIndex: 2,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize:
                "19px",
              color:
                "#111827",
            }}
          >
            {title}
          </h2>

          <button
            type="button"
            onClick={
              onClose
            }
            style={{
              border:
                "none",
              background:
                "#f3f4f6",
              width:
                "32px",
              height:
                "32px",
              borderRadius:
                "50%",
              cursor:
                "pointer",
              fontSize:
                "18px",
              color:
                "#374151",
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            padding:
              "20px",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}


// =====================================================
// STYLES
// =====================================================

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  border:
    "1px solid #d1d5db",
  borderRadius: "8px",
  padding:
    "9px 11px",
  fontSize: "13px",
  outline: "none",
  background: "white",
};

const tableCell = {
  padding:
    "13px 15px",
  borderBottom:
    "1px solid #f0f0f0",
  fontSize: "13px",
  color: "#374151",
  verticalAlign:
    "middle",
};

const formGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(2, minmax(0, 1fr))",
  gap: "0 16px",
};

const primaryButton = {
  border: "none",
  background: "#111827",
  color: "white",
  padding:
    "10px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "13px",
};

const secondaryButton = {
  border:
    "1px solid #d1d5db",
  background: "white",
  color: "#374151",
  padding:
    "10px 15px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "13px",
};