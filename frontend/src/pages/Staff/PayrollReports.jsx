import React, { useEffect, useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

function PayrollReports() {
  const today = new Date();

  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  const [summary, setSummary] = useState(null);
  const [report, setReport] = useState(null);
  const [payslips, setPayslips] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // ============================================================
  // LOAD ALL REPORT DATA
  // ============================================================

  const loadReportData = async () => {
    setLoading(true);
    setError("");

    try {
      const summaryResponse = await fetch(
        `${API_BASE}/payroll-payslips/summary?payroll_month=${month}&payroll_year=${year}`,
        {
          headers,
        }
      );

      if (!summaryResponse.ok) {
        throw new Error("Unable to load payroll summary");
      }

      const summaryData = await summaryResponse.json();

      const reportResponse = await fetch(
        `${API_BASE}/payroll-payslips/reports/monthly?payroll_month=${month}&payroll_year=${year}`,
        {
          headers,
        }
      );

      if (!reportResponse.ok) {
        throw new Error("Unable to load payroll report");
      }

      const reportData = await reportResponse.json();

      const payslipResponse = await fetch(
        `${API_BASE}/payroll-payslips?page=1&page_size=100&payroll_month=${month}&payroll_year=${year}`,
        {
          headers,
        }
      );

      if (!payslipResponse.ok) {
        throw new Error("Unable to load payslips");
      }

      const payslipData = await payslipResponse.json();

      setSummary(summaryData);
      setReport(reportData);
      setPayslips(payslipData.items || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [month, year]);

  // ============================================================
  // GENERATE PAYSLIP
  // ============================================================

  const generatePayslip = async (payrollId) => {
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/payroll-payslips/generate/${payrollId}`,
        {
          method: "POST",
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to generate payslip"
        );
      }

      setMessage(
        `Payslip ${data.payslip_number} generated successfully.`
      );

      await loadReportData();
    } catch (err) {
      setError(err.message || "Unable to generate payslip");
    }
  };

  // ============================================================
  // FILTER PAYSLIPS
  // ============================================================

  const filteredPayslips = payslips.filter((item) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      !searchText ||
      String(item.payslip_number || "")
        .toLowerCase()
        .includes(searchText) ||
      String(item.staff_code || "")
        .toLowerCase()
        .includes(searchText) ||
      String(item.staff_name || "")
        .toLowerCase()
        .includes(searchText) ||
      String(item.department || "")
        .toLowerCase()
        .includes(searchText) ||
      String(item.designation || "")
        .toLowerCase()
        .includes(searchText);

    const matchesStatus =
      !statusFilter ||
      item.payment_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // ============================================================
  // FORMATTERS
  // ============================================================

  const money = (value) => {
    const number = Number(value || 0);

    return `₹${number.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const number = (value) => {
    return Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });
  };

  const monthName = (monthNumber) => {
    return new Date(
      2000,
      monthNumber - 1,
      1
    ).toLocaleString("en-US", {
      month: "long",
    });
  };

  const statusStyle = (status) => {
    if (status === "PAID") {
      return {
        background: "#dcfce7",
        color: "#166534",
      };
    }

    return {
      background: "#fef3c7",
      color: "#92400e",
    };
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "30px",
        boxSizing: "border-box",
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
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "25px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "30px",
              fontWeight: "700",
              color: "#172033",
            }}
          >
            Payroll Reports
          </h1>

          <p
            style={{
              margin: "7px 0 0",
              color: "#6b7280",
              fontSize: "15px",
            }}
          >
            View monthly payroll performance, salaries and payslips.
          </p>
        </div>

        <button
          onClick={loadReportData}
          disabled={loading}
          style={{
            border: "none",
            borderRadius: "8px",
            padding: "11px 18px",
            background: "#2563eb",
            color: "#ffffff",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      {/* ======================================================
          ALERTS
      ====================================================== */}

      {message && (
        <div
          style={{
            background: "#dcfce7",
            color: "#166534",
            padding: "12px 15px",
            borderRadius: "8px",
            marginBottom: "18px",
            border: "1px solid #bbf7d0",
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
            padding: "12px 15px",
            borderRadius: "8px",
            marginBottom: "18px",
            border: "1px solid #fecaca",
          }}
        >
          {error}
        </div>
      )}

      {/* ======================================================
          PERIOD FILTER
      ====================================================== */}

      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          padding: "18px",
          marginBottom: "22px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          display: "flex",
          alignItems: "center",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              color: "#6b7280",
              marginBottom: "6px",
            }}
          >
            Payroll Month
          </label>

          <select
            value={month}
            onChange={(e) =>
              setMonth(Number(e.target.value))
            }
            style={{
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "7px",
              minWidth: "160px",
              background: "#ffffff",
            }}
          >
            {Array.from(
              { length: 12 },
              (_, index) => index + 1
            ).map((monthNumber) => (
              <option
                key={monthNumber}
                value={monthNumber}
              >
                {monthName(monthNumber)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              color: "#6b7280",
              marginBottom: "6px",
            }}
          >
            Payroll Year
          </label>

          <select
            value={year}
            onChange={(e) =>
              setYear(Number(e.target.value))
            }
            style={{
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "7px",
              minWidth: "130px",
              background: "#ffffff",
            }}
          >
            {Array.from(
              { length: 7 },
              (_, index) =>
                today.getFullYear() - 3 + index
            ).map((yearNumber) => (
              <option
                key={yearNumber}
                value={yearNumber}
              >
                {yearNumber}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            marginLeft: "auto",
            fontWeight: "600",
            color: "#374151",
            paddingTop: "20px",
          }}
        >
          {monthName(month)} {year}
        </div>
      </div>

      {/* ======================================================
          SUMMARY CARDS
      ====================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(190px, 1fr))",
          gap: "16px",
          marginBottom: "25px",
        }}
      >
        <SummaryCard
          title="Total Payslips"
          value={
            summary?.total_payslips ??
            report?.total_staff ??
            0
          }
          subtitle={`${summary?.paid_payslips || 0} paid`}
        />

        <SummaryCard
          title="Gross Salary"
          value={money(summary?.total_gross_salary)}
          subtitle="Total earnings"
        />

        <SummaryCard
          title="Deductions"
          value={money(summary?.total_deductions)}
          subtitle="Total deductions"
        />

        <SummaryCard
          title="Net Salary"
          value={money(summary?.total_net_salary)}
          subtitle="Total payable"
        />

        <SummaryCard
          title="Paid Amount"
          value={money(summary?.total_paid_amount)}
          subtitle={`${summary?.paid_payslips || 0} payslips paid`}
        />

        <SummaryCard
          title="Pending Amount"
          value={money(summary?.total_pending_amount)}
          subtitle={`${summary?.pending_payslips || 0} pending`}
        />
      </div>

      {/* ======================================================
          ATTENDANCE SUMMARY
      ====================================================== */}

      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "25px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        }}
      >
        <h2
          style={{
            margin: "0 0 18px",
            fontSize: "18px",
            color: "#172033",
          }}
        >
          Attendance Summary
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "15px",
          }}
        >
          <MiniCard
            title="Working Days"
            value={number(report?.total_working_days)}
          />

          <MiniCard
            title="Present Days"
            value={number(report?.total_present_days)}
          />

          <MiniCard
            title="Absent Days"
            value={number(report?.total_absent_days)}
          />

          <MiniCard
            title="Leave Days"
            value={number(report?.total_leave_days)}
          />
        </div>
      </div>

      {/* ======================================================
          FILTERS
      ====================================================== */}

      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          padding: "18px",
          marginBottom: "18px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Search staff, code, department or payslip..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          style={{
            flex: 1,
            minWidth: "260px",
            padding: "11px 13px",
            border: "1px solid #d1d5db",
            borderRadius: "7px",
            outline: "none",
          }}
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
          style={{
            padding: "11px 13px",
            border: "1px solid #d1d5db",
            borderRadius: "7px",
            minWidth: "150px",
            background: "#ffffff",
          }}
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
        </select>

        <button
          onClick={() => {
            setSearch("");
            setStatusFilter("");
          }}
          style={{
            padding: "11px 17px",
            border: "1px solid #d1d5db",
            borderRadius: "7px",
            background: "#ffffff",
            cursor: "pointer",
          }}
        >
          Clear
        </button>
      </div>

      {/* ======================================================
          PAYROLL TABLE
      ====================================================== */}

      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "19px",
              color: "#172033",
            }}
          >
            Staff Payroll Report
          </h2>

          <p
            style={{
              margin: "5px 0 0",
              color: "#6b7280",
              fontSize: "13px",
            }}
          >
            {filteredPayslips.length} payslip
            {filteredPayslips.length !== 1
              ? "s"
              : ""}{" "}
            found
          </p>
        </div>

        {loading ? (
          <div
            style={{
              padding: "45px",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            Loading payroll report...
          </div>
        ) : filteredPayslips.length === 0 ? (
          <div
            style={{
              padding: "50px",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            <div
              style={{
                fontSize: "40px",
                marginBottom: "10px",
              }}
            >
              📋
            </div>

            <strong>
              No payslips found
            </strong>

            <div
              style={{
                marginTop: "6px",
                fontSize: "14px",
              }}
            >
              Generate payslips from approved or paid
              payroll records.
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
                borderCollapse: "collapse",
                minWidth: "1250px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f8fafc",
                  }}
                >
                  <TableHeader>
                    Payslip
                  </TableHeader>

                  <TableHeader>
                    Staff
                  </TableHeader>

                  <TableHeader>
                    Department
                  </TableHeader>

                  <TableHeader>
                    Attendance
                  </TableHeader>

                  <TableHeader>
                    Basic
                  </TableHeader>

                  <TableHeader>
                    Allowances
                  </TableHeader>

                  <TableHeader>
                    Gross
                  </TableHeader>

                  <TableHeader>
                    Deductions
                  </TableHeader>

                  <TableHeader>
                    Net Salary
                  </TableHeader>

                  <TableHeader>
                    Status
                  </TableHeader>

                  <TableHeader>
                    Action
                  </TableHeader>
                </tr>
              </thead>

              <tbody>
                {filteredPayslips.map((item) => (
                  <tr
                    key={item.id}
                    style={{
                      borderTop:
                        "1px solid #e5e7eb",
                    }}
                  >
                    <TableCell>
                      <strong>
                        {item.payslip_number}
                      </strong>

                      <div
                        style={{
                          color: "#6b7280",
                          fontSize: "12px",
                          marginTop: "3px",
                        }}
                      >
                        {item.payroll_month}/
                        {item.payroll_year}
                      </div>
                    </TableCell>

                    <TableCell>
                      <strong>
                        {item.staff_name ||
                          "Unknown Staff"}
                      </strong>

                      <div
                        style={{
                          color: "#6b7280",
                          fontSize: "12px",
                          marginTop: "3px",
                        }}
                      >
                        {item.staff_code || "-"}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        {item.department || "-"}
                      </div>

                      <div
                        style={{
                          color: "#6b7280",
                          fontSize: "12px",
                          marginTop: "3px",
                        }}
                      >
                        {item.designation || "-"}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        P: {number(item.days_present)}
                      </div>

                      <div
                        style={{
                          color: "#6b7280",
                          fontSize: "12px",
                        }}
                      >
                        A: {number(item.days_absent)}
                        {" | "}
                        L: {number(item.days_on_leave)}
                      </div>
                    </TableCell>

                    <TableCell>
                      {money(item.basic_salary)}
                    </TableCell>

                    <TableCell>
                      {money(item.allowances)}
                    </TableCell>

                    <TableCell>
                      <strong>
                        {money(item.gross_salary)}
                      </strong>
                    </TableCell>

                    <TableCell>
                      {money(item.total_deductions)}
                    </TableCell>

                    <TableCell>
                      <strong
                        style={{
                          color: "#166534",
                        }}
                      >
                        {money(item.net_salary)}
                      </strong>
                    </TableCell>

                    <TableCell>
                      <span
                        style={{
                          ...statusStyle(
                            item.payment_status
                          ),
                          padding:
                            "5px 9px",
                          borderRadius:
                            "999px",
                          fontSize: "12px",
                          fontWeight: "700",
                          display:
                            "inline-block",
                        }}
                      >
                        {item.payment_status}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div
                        style={{
                          display: "flex",
                          gap: "7px",
                          flexDirection:
                            "column",
                        }}
                      >
                        <button
                          onClick={() => {
                            window.location.href =
                              `/staff-payslip/${item.id}`;
                          }}
                          style={{
                            border: "none",
                            background:
                              "#2563eb",
                            color:
                              "#ffffff",
                            padding:
                              "7px 11px",
                            borderRadius:
                              "6px",
                            cursor:
                              "pointer",
                            fontSize:
                              "12px",
                            fontWeight:
                              "600",
                          }}
                        >
                          View Payslip
                        </button>

                        <button
                          onClick={() =>
                            generatePayslip(
                              item.payroll_id
                            )
                          }
                          style={{
                            border:
                              "1px solid #d1d5db",
                            background:
                              "#ffffff",
                            color:
                              "#374151",
                            padding:
                              "7px 11px",
                            borderRadius:
                              "6px",
                            cursor:
                              "pointer",
                            fontSize:
                              "12px",
                          }}
                        >
                          Regenerate
                        </button>
                      </div>
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


// ============================================================
// SUMMARY CARD
// ============================================================

function SummaryCard({
  title,
  value,
  subtitle,
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "12px",
        padding: "20px",
        boxShadow:
          "0 2px 10px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          color: "#6b7280",
          fontSize: "13px",
          marginBottom: "8px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "23px",
          fontWeight: "700",
          color: "#172033",
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop: "6px",
          fontSize: "12px",
          color: "#9ca3af",
        }}
      >
        {subtitle}
      </div>
    </div>
  );
}


// ============================================================
// MINI CARD
// ============================================================

function MiniCard({
  title,
  value,
}) {
  return (
    <div
      style={{
        background: "#f8fafc",
        borderRadius: "8px",
        padding: "15px",
        border:
          "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          color: "#6b7280",
          marginBottom: "5px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "20px",
          fontWeight: "700",
          color: "#172033",
        }}
      >
        {value}
      </div>
    </div>
  );
}


// ============================================================
// TABLE COMPONENTS
// ============================================================

function TableHeader({ children }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "13px 14px",
        fontSize: "12px",
        color: "#6b7280",
        fontWeight: "700",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}


function TableCell({ children }) {
  return (
    <td
      style={{
        padding: "14px",
        fontSize: "13px",
        color: "#374151",
        verticalAlign: "middle",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </td>
  );
}


export default PayrollReports;