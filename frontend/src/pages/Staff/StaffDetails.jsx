import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL, getAuthToken } from "../../api/config";
import {
  ArrowLeft,
  Edit3,
  Archive,
  User,
  Phone,
  Briefcase,
  IndianRupee,
  ShieldAlert,
  Building,
  FileText,
  Database,
  Calendar,
  Sparkles,
} from "lucide-react";

export default function StaffDetails() {
  const { staffId } = useParams();
  const navigate = useNavigate();

  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => {
    return getAuthToken();
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
          data.detail || "Unable to fetch staff details."
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
    ? `${staff.first_name || ""} ${staff.last_name || ""}`.trim()
    : "";

  const initials = staff
    ? `${staff.first_name?.charAt(0) || ""}${
        staff.last_name?.charAt(0) || ""
      }`.toUpperCase()
    : "";

  const formatDate = (value) => {
    if (!value) return "—";
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
    if (value === null || value === undefined || value === "") return "—";
    return `₹${Number(value).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (loading) {
    return (
      <div className="dark-details-page">
        <div className="state-card">
          <div className="spinner"></div>
          <p>Decrypting staff identity record...</p>
        </div>
      </div>
    );
  }

  if (error && !staff) {
    return (
      <div className="dark-details-page">
        <div className="state-card error-card">
          <p>{error}</p>
          <button onClick={() => navigate("/staff")} className="btn-secondary">
            <ArrowLeft size={16} /> Back to Staff
          </button>
        </div>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="dark-details-page">
        <div className="state-card">
          <p>Staff member record not found.</p>
          <button onClick={() => navigate("/staff")} className="btn-secondary">
            <ArrowLeft size={16} /> Back to Staff
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dark-details-page">
      {/* Top Action Bar */}
      <div className="top-action-bar">
        <div className="bar-left">
          <button onClick={() => navigate("/staff")} className="btn-back">
            <ArrowLeft size={16} />
            <span>Staff Directory</span>
          </button>
          <div>
            <h1 className="page-heading">Staff Profile Dossier</h1>
            <p className="page-subheading">
              Official institutional record and credential profile
            </p>
          </div>
        </div>

        <div className="bar-actions">
          <button
            onClick={() => navigate(`/staff/${staff.id}/edit`)}
            className="btn-edit"
          >
            <Edit3 size={15} />
            <span>Edit Profile</span>
          </button>

          <button onClick={handleDelete} className="btn-archive">
            <Archive size={15} />
            <span>Archive</span>
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* Hero Overview Card */}
      <div className="profile-hero-card">
        <div className="hero-left">
          <div className="hero-avatar">{initials || "ST"}</div>
          <div className="hero-details">
            <div className="hero-name-row">
              <h2 className="hero-name">{fullName || "Unnamed Staff"}</h2>
              <StatusBadge status={staff.status} />
            </div>

            <p className="hero-role">
              {staff.designation || "Staff Member"}
              {staff.department ? ` • ${staff.department}` : ""}
            </p>

            <div className="hero-meta-row">
              <span className="meta-badge">
                ID: <strong>{staff.staff_id || "—"}</strong>
              </span>
              <span className="meta-badge">
                Joined: <strong>{formatDate(staff.joining_date)}</strong>
              </span>
              <span className="meta-badge">
                Type: <strong>{formatEmploymentType(staff.employment_type)}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Profile Sections */}
      <div className="sections-grid">
        {/* Basic Info */}
        <InfoSection title="Basic Information" icon={User}>
          <InfoItem label="First Name" value={staff.first_name} />
          <InfoItem label="Last Name" value={staff.last_name} />
          <InfoItem label="Gender" value={staff.gender} />
          <InfoItem label="Date of Birth" value={formatDate(staff.date_of_birth)} />
          <InfoItem label="Staff ID" value={staff.staff_id} />
          <InfoItem label="Status" value={staff.status} />
        </InfoSection>

        {/* Contact Info */}
        <InfoSection title="Contact Information" icon={Phone}>
          <InfoItem label="Phone" value={staff.phone} />
          <InfoItem label="Email" value={staff.email} />
          <InfoItem label="City" value={staff.city} />
          <InfoItem label="State" value={staff.state} />
          <InfoItem label="Postal Code" value={staff.postal_code} />
          <InfoItem label="Residential Address" value={staff.address} fullWidth />
        </InfoSection>

        {/* Employment Info */}
        <InfoSection title="Employment & Academic" icon={Briefcase}>
          <InfoItem label="Joining Date" value={formatDate(staff.joining_date)} />
          <InfoItem label="Department" value={staff.department} />
          <InfoItem label="Designation" value={staff.designation} />
          <InfoItem
            label="Employment Type"
            value={formatEmploymentType(staff.employment_type)}
          />
          <InfoItem label="Highest Qualification" value={staff.qualification} />
          <InfoItem
            label="Total Experience"
            value={
              staff.experience_years !== null && staff.experience_years !== undefined
                ? `${staff.experience_years} Years`
                : "—"
            }
          />
        </InfoSection>

        {/* Payroll & Compensation */}
        <InfoSection title="Payroll & Compensation" icon={IndianRupee}>
          <InfoItem label="Base Basic Salary" value={formatMoney(staff.basic_salary)} />
          <InfoItem label="Allowances" value={formatMoney(staff.allowances)} />
          <InfoItem label="Deductions" value={formatMoney(staff.deductions)} />
          <InfoItem
            label="Estimated Net Payout"
            value={formatMoney(calculateNetSalary(staff))}
            highlight
          />
        </InfoSection>

        {/* Emergency Contact */}
        <InfoSection title="Emergency Protocol" icon={ShieldAlert}>
          <InfoItem label="Emergency Contact" value={staff.emergency_contact_name} />
          <InfoItem label="Emergency Phone" value={staff.emergency_contact_phone} />
          <InfoItem label="Relationship" value={staff.emergency_contact_relation} />
        </InfoSection>

        {/* Banking */}
        <InfoSection title="Banking & Settlement" icon={Building}>
          <InfoItem label="Bank Institution" value={staff.bank_name} />
          <InfoItem label="Account Number" value={staff.bank_account_number} />
          <InfoItem label="IFSC Code" value={staff.bank_ifsc} />
        </InfoSection>

        {/* Additional Notes */}
        <InfoSection title="Administrative Notes" icon={FileText}>
          <InfoItem label="Internal Remarks" value={staff.notes} fullWidth />
        </InfoSection>

        {/* System Ledger */}
        <InfoSection title="System Audit Record" icon={Database}>
          <InfoItem label="Record Created" value={formatDate(staff.created_at)} />
          <InfoItem label="Last Modified" value={formatDate(staff.updated_at)} />
          <InfoItem label="Record UUID" value={staff.id} />
        </InfoSection>
      </div>

      <style>{`
        .dark-details-page {
          min-height: 100vh;
          background: #07090e;
          color: #f8fafc;
          padding: 32px;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .state-card {
          max-width: 450px;
          margin: 80px auto;
          background: #111726;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 36px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .error-card {
          border-color: rgba(244, 63, 94, 0.3);
          color: #fb7185;
        }

        .top-action-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 28px;
        }

        .bar-left {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .btn-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #111726;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-back:hover {
          color: #ffffff;
          background: #172033;
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateX(-2px);
        }

        .page-heading {
          font-family: 'Outfit', sans-serif;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 0;
          color: #ffffff;
        }

        .page-subheading {
          font-size: 13px;
          color: #64748b;
          margin: 4px 0 0;
        }

        .bar-actions {
          display: flex;
          gap: 10px;
        }

        .btn-edit {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
          color: #ffffff;
          padding: 9px 18px;
          border-radius: 10px;
          border: none;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
          transition: all 0.2s;
        }

        .btn-edit:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }

        .btn-archive {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(244, 63, 94, 0.12);
          border: 1px solid rgba(244, 63, 94, 0.25);
          color: #fb7185;
          padding: 9px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-archive:hover {
          background: rgba(244, 63, 94, 0.22);
          color: #ffffff;
        }

        .error-banner {
          background: rgba(244, 63, 94, 0.15);
          border: 1px solid rgba(244, 63, 94, 0.3);
          color: #fb7185;
          padding: 12px 18px;
          border-radius: 10px;
          font-size: 13.5px;
          margin-bottom: 24px;
        }

        .profile-hero-card {
          background: linear-gradient(135deg, #111726 0%, #0d121f 100%);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 18px;
          padding: 26px 30px;
          margin-bottom: 26px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }

        .hero-left {
          display: flex;
          align-items: center;
          gap: 22px;
          flex-wrap: wrap;
        }

        .hero-avatar {
          width: 72px;
          height: 72px;
          border-radius: 18px;
          background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
          color: #ffffff;
          font-family: 'Outfit', sans-serif;
          font-size: 26px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
        }

        .hero-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .hero-name-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .hero-name {
          font-family: 'Outfit', sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
        }

        .hero-role {
          font-size: 14px;
          color: #94a3b8;
          margin: 0;
        }

        .hero-meta-row {
          display: flex;
          gap: 10px;
          margin-top: 8px;
          flex-wrap: wrap;
        }

        .meta-badge {
          font-size: 12px;
          color: #64748b;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.07);
          padding: 4px 10px;
          border-radius: 6px;
        }

        .meta-badge strong {
          color: #cbd5e1;
        }

        .sections-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
          gap: 22px;
        }

        @media (max-width: 600px) {
          .dark-details-page {
            padding: 18px;
          }
          .sections-grid {
            grid-template-columns: 1fr;
          }
          .hero-avatar {
            width: 56px;
            height: 56px;
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
}

function InfoSection({ title, icon: Icon, children }) {
  return (
    <div className="info-card">
      <div className="info-card-header">
        {Icon && (
          <div className="info-icon-box">
            <Icon size={16} />
          </div>
        )}
        <h3 className="info-card-title">{title}</h3>
      </div>

      <div className="info-grid">{children}</div>

      <style>{`
        .info-card {
          background: #111726;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 22px;
          transition: all 0.2s;
        }

        .info-card:hover {
          border-color: rgba(99, 102, 241, 0.3);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }

        .info-card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .info-icon-box {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .info-card-title {
          font-family: 'Outfit', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
        }
      `}</style>
    </div>
  );
}

function InfoItem({ label, value, fullWidth = false, highlight = false }) {
  return (
    <div className={`info-item ${fullWidth ? "full-width" : ""}`}>
      <span className="item-label">{label}</span>
      <span className={`item-value ${highlight ? "item-highlight" : ""}`}>
        {value !== null && value !== undefined && value !== "" ? value : "—"}
      </span>

      <style>{`
        .info-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .info-item.full-width {
          grid-column: 1 / -1;
        }

        .item-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #64748b;
        }

        .item-value {
          font-size: 13.5px;
          font-weight: 500;
          color: #e2e8f0;
          word-break: break-word;
        }

        .item-highlight {
          color: #38bdf8;
          font-weight: 700;
          font-size: 17px;
          font-family: 'Outfit', sans-serif;
        }
      `}</style>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized = (status || "UNKNOWN").toUpperCase();

  let badgeClass = "badge-info";
  if (normalized === "ACTIVE") badgeClass = "badge-success";
  if (normalized === "INACTIVE") badgeClass = "badge-secondary";
  if (normalized === "ON_LEAVE") badgeClass = "badge-warning";
  if (normalized === "SUSPENDED") badgeClass = "badge-danger";

  return <span className={`status-pill ${badgeClass}`}>{normalized}</span>;
}

function formatEmploymentType(value) {
  if (!value) return "—";
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function calculateNetSalary(staff) {
  const basic = Number(staff.basic_salary || 0);
  const allowances = Number(staff.allowances || 0);
  const deductions = Number(staff.deductions || 0);
  return basic + allowances - deductions;
}