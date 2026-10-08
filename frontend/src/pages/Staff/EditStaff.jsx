import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL, getAuthToken } from "../../api/config";

export default function EditStaff() {
  const { staffId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    gender: "",
    date_of_birth: "",

    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    postal_code: "",

    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relation: "",

    joining_date: "",
    department: "",
    designation: "",
    employment_type: "",
    qualification: "",
    experience_years: "",

    basic_salary: "",
    allowances: "0",
    deductions: "0",

    bank_name: "",
    bank_account_number: "",
    bank_ifsc: "",

    status: "ACTIVE",
    notes: "",
  });

  const getToken = () => {
    return getAuthToken();
  };

  const getHeaders = () => {
    const token = getToken();

    return {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };
  };

  const loadStaff = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/staff/${staffId}`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to load staff member."
        );
      }

      setForm({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        gender: data.gender || "",
        date_of_birth: formatDateForInput(
          data.date_of_birth
        ),

        phone: data.phone || "",
        email: data.email || "",
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        postal_code: data.postal_code || "",

        emergency_contact_name:
          data.emergency_contact_name || "",

        emergency_contact_phone:
          data.emergency_contact_phone || "",

        emergency_contact_relation:
          data.emergency_contact_relation || "",

        joining_date: formatDateForInput(
          data.joining_date
        ),

        department: data.department || "",
        designation: data.designation || "",
        employment_type:
          data.employment_type || "",

        qualification: data.qualification || "",

        experience_years:
          data.experience_years ?? "",

        basic_salary:
          data.basic_salary ?? "",

        allowances:
          data.allowances ?? "0",

        deductions:
          data.deductions ?? "0",

        bank_name: data.bank_name || "",
        bank_account_number:
          data.bank_account_number || "",

        bank_ifsc: data.bank_ifsc || "",

        status: data.status || "ACTIVE",

        notes: data.notes || "",
      });
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Something went wrong while loading the staff member."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, [staffId]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSaving(true);

    try {
      if (
        !form.first_name.trim() ||
        !form.last_name.trim()
      ) {
        throw new Error(
          "First name and last name are required."
        );
      }

      const payload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),

        gender: form.gender || null,
        date_of_birth: form.date_of_birth || null,

        phone: form.phone.trim() || null,
        email: form.email.trim() || null,

        address: form.address.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        postal_code: form.postal_code.trim() || null,

        emergency_contact_name:
          form.emergency_contact_name.trim() || null,

        emergency_contact_phone:
          form.emergency_contact_phone.trim() || null,

        emergency_contact_relation:
          form.emergency_contact_relation.trim() || null,

        joining_date: form.joining_date || null,

        department:
          form.department.trim() || null,

        designation:
          form.designation.trim() || null,

        employment_type:
          form.employment_type || null,

        qualification:
          form.qualification.trim() || null,

        experience_years:
          form.experience_years !== ""
            ? Number(form.experience_years)
            : null,

        basic_salary:
          form.basic_salary !== ""
            ? Number(form.basic_salary)
            : null,

        allowances:
          form.allowances !== ""
            ? Number(form.allowances)
            : 0,

        deductions:
          form.deductions !== ""
            ? Number(form.deductions)
            : 0,

        bank_name:
          form.bank_name.trim() || null,

        bank_account_number:
          form.bank_account_number.trim() || null,

        bank_ifsc:
          form.bank_ifsc.trim() || null,

        status: form.status || "ACTIVE",

        notes: form.notes.trim() || null,
      };

      const response = await fetch(
        `${API_BASE_URL}/staff/${staffId}`,
        {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to update staff member."
        );
      }

      navigate(`/staff/${staffId}`);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Something went wrong while updating the staff member."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={loadingStyle}>
          Loading staff information...
        </div>
      </div>
    );
  }

  if (error && !form.first_name) {
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

  return (
    <div style={pageStyle}>
      {/* HEADER */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
          marginBottom: "25px",
        }}
      >
        <button
          type="button"
          onClick={() =>
            navigate(`/staff/${staffId}`)
          }
          style={backButtonStyle}
        >
          ← Back
        </button>

        <div>
          <h1 style={titleStyle}>
            Edit Staff
          </h1>

          <p style={subtitleStyle}>
            Update staff member information
          </p>
        </div>
      </div>

      {error && (
        <div style={errorStyle}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* BASIC INFORMATION */}

        <Section title="Basic Information">
          <Field
            label="First Name"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            required
          />

          <Field
            label="Last Name"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            required
          />

          <SelectField
            label="Gender"
            name="gender"
            value={form.gender}
            onChange={handleChange}
            options={[
              ["", "Select Gender"],
              ["MALE", "Male"],
              ["FEMALE", "Female"],
              ["OTHER", "Other"],
            ]}
          />

          <Field
            label="Date of Birth"
            name="date_of_birth"
            type="date"
            value={form.date_of_birth}
            onChange={handleChange}
          />
        </Section>

        {/* CONTACT */}

        <Section title="Contact Information">
          <Field
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />

          <Field
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />

          <Field
            label="City"
            name="city"
            value={form.city}
            onChange={handleChange}
          />

          <Field
            label="State"
            name="state"
            value={form.state}
            onChange={handleChange}
          />

          <Field
            label="Postal Code"
            name="postal_code"
            value={form.postal_code}
            onChange={handleChange}
          />

          <TextAreaField
            label="Address"
            name="address"
            value={form.address}
            onChange={handleChange}
            fullWidth
          />
        </Section>

        {/* EMERGENCY CONTACT */}

        <Section title="Emergency Contact">
          <Field
            label="Contact Name"
            name="emergency_contact_name"
            value={form.emergency_contact_name}
            onChange={handleChange}
          />

          <Field
            label="Contact Phone"
            name="emergency_contact_phone"
            value={form.emergency_contact_phone}
            onChange={handleChange}
          />

          <Field
            label="Relationship"
            name="emergency_contact_relation"
            value={form.emergency_contact_relation}
            onChange={handleChange}
            placeholder="Father, Mother, Spouse..."
          />
        </Section>

        {/* EMPLOYMENT */}

        <Section title="Employment Information">
          <Field
            label="Joining Date"
            name="joining_date"
            type="date"
            value={form.joining_date}
            onChange={handleChange}
          />

          <Field
            label="Department"
            name="department"
            value={form.department}
            onChange={handleChange}
          />

          <Field
            label="Designation"
            name="designation"
            value={form.designation}
            onChange={handleChange}
          />

          <SelectField
            label="Employment Type"
            name="employment_type"
            value={form.employment_type}
            onChange={handleChange}
            options={[
              ["", "Select Type"],
              ["FULL_TIME", "Full Time"],
              ["PART_TIME", "Part Time"],
              ["CONTRACT", "Contract"],
              ["TEMPORARY", "Temporary"],
              ["INTERN", "Intern"],
            ]}
          />

          <Field
            label="Qualification"
            name="qualification"
            value={form.qualification}
            onChange={handleChange}
          />

          <Field
            label="Experience (Years)"
            name="experience_years"
            type="number"
            min="0"
            step="0.01"
            value={form.experience_years}
            onChange={handleChange}
          />

          <SelectField
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            options={[
              ["ACTIVE", "Active"],
              ["INACTIVE", "Inactive"],
              ["ON_LEAVE", "On Leave"],
              ["SUSPENDED", "Suspended"],
            ]}
          />
        </Section>

        {/* SALARY */}

        <Section title="Salary Information">
          <Field
            label="Basic Salary"
            name="basic_salary"
            type="number"
            min="0"
            step="0.01"
            value={form.basic_salary}
            onChange={handleChange}
          />

          <Field
            label="Allowances"
            name="allowances"
            type="number"
            min="0"
            step="0.01"
            value={form.allowances}
            onChange={handleChange}
          />

          <Field
            label="Deductions"
            name="deductions"
            type="number"
            min="0"
            step="0.01"
            value={form.deductions}
            onChange={handleChange}
          />
        </Section>

        {/* BANK */}

        <Section title="Bank & Payment Information">
          <Field
            label="Bank Name"
            name="bank_name"
            value={form.bank_name}
            onChange={handleChange}
          />

          <Field
            label="Bank Account Number"
            name="bank_account_number"
            value={form.bank_account_number}
            onChange={handleChange}
          />

          <Field
            label="IFSC Code"
            name="bank_ifsc"
            value={form.bank_ifsc}
            onChange={handleChange}
          />
        </Section>

        {/* NOTES */}

        <Section title="Additional Information">
          <TextAreaField
            label="Notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            fullWidth
          />
        </Section>

        {/* ACTIONS */}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            marginTop: "25px",
          }}
        >
          <button
            type="button"
            onClick={() =>
              navigate(`/staff/${staffId}`)
            }
            style={cancelButtonStyle}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            style={{
              ...saveButtonStyle,
              opacity: saving ? 0.7 : 1,
            }}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}


/* ============================================================
   SECTION
============================================================ */

function Section({ title, children }) {
  return (
    <div style={sectionStyle}>
      <h2 style={sectionTitleStyle}>
        {title}
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "18px",
        }}
      >
        {children}
      </div>
    </div>
  );
}


/* ============================================================
   FIELD
============================================================ */

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
  min,
  step,
}) {
  return (
    <div>
      <label style={labelStyle}>
        {label}

        {required && (
          <span style={{ color: "#dc2626" }}>
            {" "}*
          </span>
        )}
      </label>

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        min={min}
        step={step}
        style={inputStyle}
      />
    </div>
  );
}


/* ============================================================
   SELECT
============================================================ */

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
}) {
  return (
    <div>
      <label style={labelStyle}>
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        style={inputStyle}
      >
        {options.map(
          ([optionValue, optionLabel]) => (
            <option
              key={optionValue}
              value={optionValue}
            >
              {optionLabel}
            </option>
          )
        )}
      </select>
    </div>
  );
}


/* ============================================================
   TEXTAREA
============================================================ */

function TextAreaField({
  label,
  name,
  value,
  onChange,
  fullWidth = false,
}) {
  return (
    <div
      style={{
        gridColumn: fullWidth
          ? "1 / -1"
          : undefined,
      }}
    >
      <label style={labelStyle}>
        {label}
      </label>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={4}
        style={{
          ...inputStyle,
          resize: "vertical",
          fontFamily: "inherit",
        }}
      />
    </div>
  );
}


/* ============================================================
   DATE FORMAT
============================================================ */

function formatDateForInput(value) {
  if (!value) {
    return "";
  }

  return String(value).split("T")[0];
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

const sectionStyle = {
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

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  fontSize: "13px",
  fontWeight: "600",
  color: "#374151",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "7px",
  background: "#ffffff",
  color: "#172033",
  fontSize: "14px",
  outline: "none",
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

const cancelButtonStyle = {
  border: "1px solid #d1d5db",
  background: "#ffffff",
  color: "#374151",
  padding: "11px 20px",
  borderRadius: "7px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "600",
};

const saveButtonStyle = {
  border: "none",
  background: "#2563eb",
  color: "#ffffff",
  padding: "11px 22px",
  borderRadius: "7px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "600",
};

const loadingStyle = {
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