import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_BASE_URL = "http://127.0.0.1:8000";

export default function StaffDetails() {
  const { staffId } = useParams();
  const navigate = useNavigate();

  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => {
    return (
      localStorage.getItem("access_token") ||
      localStorage.getItem("token")
    );
  };

  const loadStaff = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/staff/${staffId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to load staff profile."
        );
      }

      setStaff(data);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Something went wrong while loading the staff profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, [staffId]);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to archive this staff member?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = getToken();

      const response = await fetch(
        `${API_BASE_URL}/staff/${staffId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to archive staff member."
        );
      }

      navigate("/staff");
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Something went wrong while archiving the staff member."
      );
    }
  };

  const fullName = staff
    ? `${staff.first_name || ""} ${
        staff.last_name || ""
      }`.trim()
    : "";

  const initials = staff
    ? `${staff.first_name?.charAt(0) || ""}${
        staff.last_name?.charAt(0) || ""
      }`.toUpperCase()
    : "";

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

    try {
      return new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return value;
    }
  };

  const formatMoney = (value) => {
    if (value === null || value === undefined || value === "") {
      return "—";
    }

    return `₹${Number(value).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={loadingStyle}>
          Loading staff profile...
        </div>
      </div>
    );
  }

  if (error && !staff) {
    return (
      <div style={pageStyle}>
        <div style={errorStyle}>
          {error}
        </div>

        <button
          onClick={() => navigate("/staff")}
          style={backButtonStyle}
        >
          ← Back to Staff
        </button>
      </div>
    );
  }

  if (!staff) {
    return (
      <div style={pageStyle}>
        <div style={emptyStyle}>
          Staff member not found.
        </div>

        <button
          onClick={() => navigate("/staff")}
          style={backButtonStyle}
        >
          ← Back to Staff
        </button>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
          marginBottom: "25px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
          }}
        >
          <button
            onClick={() => navigate("/staff")}
            style={backButtonStyle}
          >
            ← Back
          </button>

          <div>
            <h1 style={titleStyle}>
              Staff Profile
            </h1>

            <p style={subtitleStyle}>
              View complete staff information
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
          }}
        >
          <button
            onClick={() =>
              navigate(`/staff/${staff.id}/edit`)
            }
            style={editButtonStyle}
          >
            Edit Staff
          </button>

          <button
            onClick={handleDelete}
            style={deleteButtonStyle}
          >
            Archive
          </button>
        </div>
      </div>

      {error && (
        <div style={errorStyle}>
          {error}
        </div>
      )}

      {/* =====================================================
          PROFILE HEADER
      ====================================================== */}

      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            flexWrap: "wrap",
          }}
        >
          <div style={avatarStyle}>
            {initials}
          </div>

          <div style={{ flex: 1 }}>
            <h2
              style={{
                margin: 0,
                fontSize: "25px",
                color: "#172033",
              }}
            >
              {fullName}
            </h2>

            <p
              style={{
                margin: "6px 0",
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              {staff.designation || "Staff Member"}
              {staff.department
                ? ` • ${staff.department}`
                : ""}
            </p>

            <p
              style={{
                margin: 0,
                color: "#6b7280",
                fontSize: "13px",
              }}
            >
              Staff ID:{" "}
              <strong>{staff.staff_id}</strong>
            </p>
          </div>

          <StatusBadge status={staff.status} />
        </div>
      </div>

      {/* =====================================================
          BASIC INFORMATION
      ====================================================== */}

      <InfoSection title="Basic Information">
        <InfoItem
          label="First Name"
          value={staff.first_name}
        />

        <InfoItem
          label="Last Name"
          value={staff.last_name}
        />

        <InfoItem
          label="Gender"
          value={staff.gender}
        />

        <InfoItem
          label="Date of Birth"
          value={formatDate(staff.date_of_birth)}
        />

        <InfoItem
          label="Staff ID"
          value={staff.staff_id}
        />

        <InfoItem
          label="Status"
          value={staff.status}
        />
      </InfoSection>

      {/* =====================================================
          CONTACT
      ====================================================== */}

      <InfoSection title="Contact Information">
        <InfoItem
          label="Phone"
          value={staff.phone}
        />

        <InfoItem
          label="Email"
          value={staff.email}
        />

        <InfoItem
          label="City"
          value={staff.city}
        />

        <InfoItem
          label="State"
          value={staff.state}
        />

        <InfoItem
          label="Postal Code"
          value={staff.postal_code}
        />

        <InfoItem
          label="Address"
          value={staff.address}
          fullWidth
        />
      </InfoSection>

      {/* =====================================================
          EMPLOYMENT
      ====================================================== */}

      <InfoSection title="Employment Information">
        <InfoItem
          label="Joining Date"
          value={formatDate(staff.joining_date)}
        />

        <InfoItem
          label="Department"
          value={staff.department}
        />

        <InfoItem
          label="Designation"
          value={staff.designation}
        />

        <InfoItem
          label="Employment Type"
          value={formatEmploymentType(
            staff.employment_type
          )}
        />

        <InfoItem
          label="Qualification"
          value={staff.qualification}
        />

        <InfoItem
          label="Experience"
          value={
            staff.experience_years !== null &&
            staff.experience_years !== undefined
              ? `${staff.experience_years} years`
              : "—"
          }
        />
      </InfoSection>

      {/* =====================================================
          SALARY
      ====================================================== */}

      <InfoSection title="Salary Information">
        <InfoItem
          label="Basic Salary"
          value={formatMoney(staff.basic_salary)}
        />

        <InfoItem
          label="Allowances"
          value={formatMoney(staff.allowances)}
        />

        <InfoItem
          label="Deductions"
          value={formatMoney(staff.deductions)}
        />

        <InfoItem
          label="Estimated Net Salary"
          value={formatMoney(
            calculateNetSalary(staff)
          )}
          highlight
        />
      </InfoSection>

      {/* =====================================================
          EMERGENCY CONTACT
      ====================================================== */}

      <InfoSection title="Emergency Contact">
        <InfoItem
          label="Contact Name"
          value={staff.emergency_contact_name}
        />

        <InfoItem
          label="Phone"
          value={staff.emergency_contact_phone}
        />

        <InfoItem
          label="Relationship"
          value={staff.emergency_contact_relation}
        />
      </InfoSection>

      {/* =====================================================
          BANK
      ====================================================== */}

      <InfoSection title="Bank & Payment Information">
        <InfoItem
          label="Bank Name"
          value={staff.bank_name}
        />

        <InfoItem
          label="Account Number"
          value={staff.bank_account_number}
        />

        <InfoItem
          label="IFSC Code"
          value={staff.bank_ifsc}
        />
      </InfoSection>

      {/* =====================================================
          NOTES
      ====================================================== */}

      <InfoSection title="Additional Information">
        <InfoItem
          label="Notes"
          value={staff.notes}
          fullWidth
        />
      </InfoSection>

      {/* =====================================================
          SYSTEM INFORMATION
      ====================================================== */}

      <InfoSection title="System Information">
        <InfoItem
          label="Record Created"
          value={formatDate(staff.created_at)}
        />

        <InfoItem
          label="Last Updated"
          value={formatDate(staff.updated_at)}
        />

        <InfoItem
          label="Database ID"
          value={staff.id}
        />
      </InfoSection>
    </div>
  );
}


/* ============================================================
   INFO SECTION
============================================================ */

function InfoSection({ title, children }) {
  return (
    <div style={cardStyle}>
      <h2 style={sectionTitleStyle}>
        {title}
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
        }}
      >
        {children}
      </div>
    </div>
  );
}


/* ============================================================
   INFO ITEM
============================================================ */

function InfoItem({
  label,
  value,
  fullWidth = false,
  highlight = false,
}) {
  return (
    <div
      style={{
        gridColumn: fullWidth
          ? "1 / -1"
          : undefined,
      }}
    >
      <div
        style={{
          fontSize: "12px",
          color: "#6b7280",
          marginBottom: "6px",
          fontWeight: "600",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "14px",
          color: highlight
            ? "#2563eb"
            : "#172033",
          fontWeight: highlight ? "700" : "500",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {value !== null &&
        value !== undefined &&
        value !== ""
          ? value
          : "—"}
      </div>
    </div>
  );
}


/* ============================================================
   STATUS
============================================================ */

function StatusBadge({ status }) {
  const normalized = (
    status || "UNKNOWN"
  ).toUpperCase();

  let background = "#f3f4f6";
  let color = "#4b5563";

  if (normalized === "ACTIVE") {
    background = "#dcfce7";
    color = "#166534";
  }

  if (normalized === "INACTIVE") {
    background = "#f3f4f6";
    color = "#4b5563";
  }

  if (normalized === "ON_LEAVE") {
    background = "#fef3c7";
    color = "#92400e";
  }

  if (normalized === "SUSPENDED") {
    background = "#fee2e2";
    color = "#991b1b";
  }

  return (
    <span
      style={{
        padding: "7px 13px",
        borderRadius: "20px",
        background,
        color,
        fontSize: "12px",
        fontWeight: "700",
      }}
    >
      {normalized}
    </span>
  );
}


/* ============================================================
   HELPERS
============================================================ */

function formatEmploymentType(value) {
  if (!value) {
    return "—";
  }

  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function calculateNetSalary(staff) {
  const basic = Number(staff.basic_salary || 0);
  const allowances = Number(staff.allowances || 0);
  const deductions = Number(staff.deductions || 0);

  return basic + allowances - deductions;
}


/* ============================================================
   STYLES
============================================================ */

const pageStyle = {
  minHeight: "100vh",
  background: "#f7f8fc",
  padding: "30px",
};

const titleStyle = {
  margin: 0,
  fontSize: "28px",
  color: "#172033",
};

const subtitleStyle = {
  margin: "6px 0 0",
  color: "#6b7280",
  fontSize: "14px",
};

const cardStyle = {
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  padding: "22px",
  marginBottom: "20px",
};

const sectionTitleStyle = {
  margin: "0 0 20px",
  fontSize: "18px",
  color: "#172033",
};

const avatarStyle = {
  width: "70px",
  height: "70px",
  borderRadius: "50%",
  background: "#e8eefc",
  color: "#2563eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "22px",
  fontWeight: "700",
};

const backButtonStyle = {
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#374151",
  padding: "9px 14px",
  borderRadius: "7px",
  cursor: "pointer",
  fontSize: "14px",
};

const editButtonStyle = {
  border: "none",
  background: "#2563eb",
  color: "#ffffff",
  padding: "10px 16px",
  borderRadius: "7px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "600",
};

const deleteButtonStyle = {
  border: "1px solid #fecaca",
  background: "#ffffff",
  color: "#dc2626",
  padding: "10px 16px",
  borderRadius: "7px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "600",
};

const loadingStyle = {
  background: "#ffffff",
  borderRadius: "12px",
  padding: "60px",
  textAlign: "center",
  color: "#6b7280",
};

const emptyStyle = {
  background: "#ffffff",
  borderRadius: "12px",
  padding: "60px",
  textAlign: "center",
  color: "#6b7280",
};

const errorStyle = {
  background: "#fef2f2",
  border: "1px solid #fecaca",
  color: "#b91c1c",
  padding: "14px 16px",
  borderRadius: "8px",
  marginBottom: "20px",
};