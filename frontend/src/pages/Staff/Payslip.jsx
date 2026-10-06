import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

// ============================================================
// HELPERS
// ============================================================

const getToken = () => {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token")
  );
};

const money = (value) => {
  const amount = Number(value || 0);

  return `₹ ${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (value) => {
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
};

const getMonthName = (month) => {
  const months = [
    "",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return months[Number(month)] || "-";
};


// ============================================================
// SMALL UI COMPONENTS
// ============================================================

function InfoBox({ label, value }) {
  return (
    <div
      style={{
        padding: "12px 14px",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        background: "#f9fafb",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          color: "#6b7280",
          marginBottom: "5px",
          fontWeight: "600",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "14px",
          fontWeight: "600",
          color: "#111827",
        }}
      >
        {value || "-"}
      </div>
    </div>
  );
}


function SectionTitle({ children }) {
  return (
    <div
      style={{
        marginTop: "25px",
        marginBottom: "10px",
        fontSize: "17px",
        fontWeight: "700",
        color: "#111827",
      }}
    >
      {children}
    </div>
  );
}


function TableRow({
  label,
  value,
  bold = false,
  highlight = false,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 14px",
        borderBottom: "1px solid #e5e7eb",
        background: highlight
          ? "#f3f4f6"
          : "#ffffff",
      }}
    >
      <span
        style={{
          fontSize: "14px",
          fontWeight: bold ? "700" : "500",
          color: "#374151",
        }}
      >
        {label}
      </span>

      <span
        style={{
          fontSize: "14px",
          fontWeight: bold ? "700" : "500",
          color: "#111827",
        }}
      >
        {value}
      </span>
    </div>
  );
}


// ============================================================
// COMPONENT
// ============================================================

export default function Payslip() {
  const { payslipId } = useParams();
  const navigate = useNavigate();

  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  // ==========================================================
  // LOAD PAYSLIP
  // ==========================================================

  const loadPayslip = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const response = await fetch(
        `${API_BASE}/payroll-payslips/${payslipId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        let message = "Failed to load payslip.";

        try {
          const data = await response.json();

          if (data?.detail) {
            message = data.detail;
          }
        } catch {
          // Ignore JSON parsing errors
        }

        throw new Error(message);
      }

      const data = await response.json();

      setPayslip(data);
    } catch (err) {
      setError(
        err.message ||
          "Unable to load payslip."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (payslipId) {
      loadPayslip();
    }
  }, [payslipId]);


  // ==========================================================
  // PRINT
  // ==========================================================

  const handlePrint = () => {
    window.print();
  };


  // ==========================================================
  // DOWNLOAD PDF
  // ==========================================================

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      setError("");

      const token = getToken();

      const response = await fetch(
        `${API_BASE}/payroll-payslips/${payslipId}/pdf`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        let message =
          "Failed to download payslip PDF.";

        try {
          const data =
            await response.json();

          if (data?.detail) {
            message = data.detail;
          }
        } catch {
          // Ignore JSON parsing errors
        }

        throw new Error(message);
      }

      const blob =
        await response.blob();

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `${payslip?.payslip_number || "payslip"}.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err.message ||
          "Unable to download PDF."
      );
    } finally {
      setDownloading(false);
    }
  };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f3f4f6",
          fontFamily:
            "Arial, sans-serif",
        }}
      >
        <div
          style={{
            padding: "30px",
            background: "#ffffff",
            borderRadius: "12px",
            boxShadow:
              "0 4px 20px rgba(0,0,0,0.08)",
            color: "#374151",
            fontSize: "16px",
            fontWeight: "600",
          }}
        >
          Loading payslip...
        </div>
      </div>
    );
  }


  // ==========================================================
  // ERROR
  // ==========================================================

  if (error && !payslip) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f3f4f6",
          padding: "40px",
          fontFamily:
            "Arial, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            background: "#ffffff",
            borderRadius: "12px",
            padding: "30px",
            boxShadow:
              "0 4px 20px rgba(0,0,0,0.08)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              color: "#b91c1c",
            }}
          >
            Unable to Load Payslip
          </h2>

          <p
            style={{
              color: "#4b5563",
            }}
          >
            {error}
          </p>

          <button
            onClick={() =>
              navigate(
                "/staff-payroll-reports"
              )
            }
            style={{
              border: "none",
              background: "#111827",
              color: "#ffffff",
              padding:
                "10px 18px",
              borderRadius: "7px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Back to Payroll Reports
          </button>
        </div>
      </div>
    );
  }


  // ==========================================================
  // MAIN
  // ==========================================================

  return (
    <>
      <style>
        {`
          @media print {
            body {
              background: white !important;
              margin: 0 !important;
            }

            .payslip-actions {
              display: none !important;
            }

            .payslip-page {
              box-shadow: none !important;
              margin: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              border-radius: 0 !important;
            }

            .payslip-wrapper {
              background: white !important;
              padding: 0 !important;
            }
          }

          @page {
            size: A4;
            margin: 12mm;
          }
        `}
      </style>

      <div
        className="payslip-wrapper"
        style={{
          minHeight: "100vh",
          background: "#f3f4f6",
          padding: "30px 20px",
          fontFamily:
            "Arial, Helvetica, sans-serif",
        }}
      >

        {/* ==================================================
            ACTION BAR
        ================================================== */}

        <div
          className="payslip-actions"
          style={{
            maxWidth: "900px",
            margin: "0 auto 18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >

          <button
            onClick={() =>
              navigate(
                "/staff-payroll-reports"
              )
            }
            style={{
              border: "1px solid #d1d5db",
              background: "#ffffff",
              color: "#374151",
              padding:
                "10px 16px",
              borderRadius: "7px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            ← Back to Reports
          </button>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >

            <button
              onClick={handlePrint}
              style={{
                border: "none",
                background: "#374151",
                color: "#ffffff",
                padding:
                  "10px 18px",
                borderRadius: "7px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              🖨 Print Payslip
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              style={{
                border: "none",
                background: downloading
                  ? "#9ca3af"
                  : "#111827",
                color: "#ffffff",
                padding:
                  "10px 18px",
                borderRadius: "7px",
                cursor: downloading
                  ? "not-allowed"
                  : "pointer",
                fontWeight: "600",
              }}
            >
              {downloading
                ? "Downloading..."
                : "⬇ Download PDF"}
            </button>

          </div>
        </div>


        {/* ==================================================
            ERROR MESSAGE
        ================================================== */}

        {error && (
          <div
            className="payslip-actions"
            style={{
              maxWidth: "900px",
              margin: "0 auto 15px",
              padding: "12px 16px",
              background: "#fef2f2",
              border:
                "1px solid #fecaca",
              color: "#b91c1c",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            {error}
          </div>
        )}


        {/* ==================================================
            PAYSLIP
        ================================================== */}

        <div
          className="payslip-page"
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            background: "#ffffff",
            borderRadius: "12px",
            boxShadow:
              "0 5px 25px rgba(0,0,0,0.08)",
            padding: "40px",
            boxSizing: "border-box",
          }}
        >

          {/* =================================================
              HEADER
          ================================================= */}

          <div
            style={{
              textAlign: "center",
              borderBottom:
                "2px solid #111827",
              paddingBottom: "18px",
              marginBottom: "20px",
            }}
          >

            <h1
              style={{
                margin: 0,
                fontSize: "28px",
                color: "#111827",
                letterSpacing:
                  "0.5px",
              }}
            >
              EDUNEXUS SCHOOL
            </h1>

            <div
              style={{
                marginTop: "6px",
                fontSize: "13px",
                color: "#6b7280",
              }}
            >
              Intelligent School Operating System
            </div>

            <div
              style={{
                marginTop: "16px",
                fontSize: "20px",
                fontWeight: "700",
                color: "#111827",
              }}
            >
              SALARY PAYSLIP
            </div>

          </div>


          {/* =================================================
              PAYSLIP INFORMATION
          ================================================= */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(4, 1fr)",
              gap: "12px",
              marginBottom: "20px",
            }}
          >

            <InfoBox
              label="Payslip Number"
              value={
                payslip.payslip_number
              }
            />

            <InfoBox
              label="Salary Period"
              value={`${getMonthName(
                payslip.payroll_month
              )} ${
                payslip.payroll_year
              }`}
            />

            <InfoBox
              label="Pay Date"
              value={formatDate(
                payslip.pay_date
              )}
            />

            <InfoBox
              label="Payment Status"
              value={
                payslip.payment_status
              }
            />

          </div>


          {/* =================================================
              EMPLOYEE INFORMATION
          ================================================= */}

          <SectionTitle>
            Employee Information
          </SectionTitle>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(4, 1fr)",
              gap: "12px",
            }}
          >

            <InfoBox
              label="Employee Name"
              value={
                payslip.staff_name
              }
            />

            <InfoBox
              label="Staff ID"
              value={
                payslip.staff_code
              }
            />

            <InfoBox
              label="Department"
              value={
                payslip.department
              }
            />

            <InfoBox
              label="Designation"
              value={
                payslip.designation
              }
            />

          </div>


          {/* =================================================
              ATTENDANCE
          ================================================= */}

          <SectionTitle>
            Attendance Summary
          </SectionTitle>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(6, 1fr)",
              gap: "10px",
            }}
          >

            <InfoBox
              label="Working Days"
              value={
                payslip.total_working_days
              }
            />

            <InfoBox
              label="Present"
              value={
                payslip.days_present
              }
            />

            <InfoBox
              label="Absent"
              value={
                payslip.days_absent
              }
            />

            <InfoBox
              label="Leave"
              value={
                payslip.days_on_leave
              }
            />

            <InfoBox
              label="Half Days"
              value={
                payslip.half_days
              }
            />

            <InfoBox
              label="LOP Days"
              value={
                payslip.loss_of_pay_days
              }
            />

          </div>


          {/* =================================================
              SALARY DETAILS
          ================================================= */}

          <SectionTitle>
            Salary Details
          </SectionTitle>

          <div
            style={{
              border:
                "1px solid #e5e7eb",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 180px 1fr 180px",
                background:
                  "#f3f4f6",
                fontWeight: "700",
                fontSize: "13px",
                color: "#374151",
              }}
            >

              <div
                style={{
                  padding: "12px 14px",
                }}
              >
                Earnings
              </div>

              <div
                style={{
                  padding: "12px 14px",
                  textAlign: "right",
                }}
              >
                Amount
              </div>

              <div
                style={{
                  padding: "12px 14px",
                }}
              >
                Deductions
              </div>

              <div
                style={{
                  padding: "12px 14px",
                  textAlign: "right",
                }}
              >
                Amount
              </div>

            </div>


            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 180px 1fr 180px",
              }}
            >

              <div>
                <TableRow
                  label="Basic Salary"
                  value={money(
                    payslip.basic_salary
                  )}
                />

                <TableRow
                  label="Allowances"
                  value={money(
                    payslip.allowances
                  )}
                />

                <TableRow
                  label="Overtime"
                  value={money(
                    payslip.overtime_amount
                  )}
                />

                <TableRow
                  label="Bonus"
                  value={money(
                    payslip.bonus_amount
                  )}
                />

                <TableRow
                  label="Gross Salary"
                  value={money(
                    payslip.gross_salary
                  )}
                  bold
                  highlight
                />
              </div>


              <div />

              <div>

                <TableRow
                  label="Loss of Pay"
                  value={money(
                    payslip.loss_of_pay_amount
                  )}
                />

                <TableRow
                  label="Other Deductions"
                  value={money(
                    payslip.other_deductions
                  )}
                />

                <TableRow
                  label="Total Deductions"
                  value={money(
                    payslip.total_deductions
                  )}
                  bold
                  highlight
                />

              </div>

              <div />

            </div>

          </div>


          {/* =================================================
              NET SALARY
          ================================================= */}

          <div
            style={{
              marginTop: "20px",
              border:
                "2px solid #111827",
              borderRadius: "8px",
              padding: "18px 20px",
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
            }}
          >

            <div
              style={{
                fontSize: "17px",
                fontWeight: "700",
                color: "#111827",
              }}
            >
              NET SALARY
            </div>

            <div
              style={{
                fontSize: "23px",
                fontWeight: "800",
                color: "#111827",
              }}
            >
              {money(
                payslip.net_salary
              )}
            </div>

          </div>


          {/* =================================================
              PAYMENT INFORMATION
          ================================================= */}

          <SectionTitle>
            Payment Information
          </SectionTitle>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(4, 1fr)",
              gap: "12px",
            }}
          >

            <InfoBox
              label="Payment Method"
              value={
                payslip.payment_method
              }
            />

            <InfoBox
              label="Payment Reference"
              value={
                payslip.payment_reference
              }
            />

            <InfoBox
              label="Payment Date"
              value={formatDate(
                payslip.payment_date
              )}
            />

            <InfoBox
              label="Status"
              value={
                payslip.payment_status
              }
            />

          </div>


          {/* =================================================
              REMARKS
          ================================================= */}

          {payslip.remarks && (
            <>
              <SectionTitle>
                Remarks
              </SectionTitle>

              <div
                style={{
                  padding: "14px",
                  border:
                    "1px solid #e5e7eb",
                  borderRadius: "8px",
                  background:
                    "#f9fafb",
                  color: "#374151",
                  fontSize: "14px",
                  lineHeight: "1.6",
                }}
              >
                {payslip.remarks}
              </div>
            </>
          )}


          {/* =================================================
              FOOTER
          ================================================= */}

          <div
            style={{
              marginTop: "35px",
              paddingTop: "15px",
              borderTop:
                "1px solid #d1d5db",
              textAlign: "center",
              color: "#6b7280",
              fontSize: "11px",
              lineHeight: "1.6",
            }}
          >
            <div>
              This is a system-generated
              payslip from EduNexus.
            </div>

            <div>
              Please retain this document
              for your records.
            </div>
          </div>

        </div>
      </div>
    </>
  );
}