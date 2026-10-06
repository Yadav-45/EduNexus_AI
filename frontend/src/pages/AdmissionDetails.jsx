import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../api/axios";

const STATUS_OPTIONS = [
  "APPLIED",
  "UNDER_REVIEW",
  "SHORTLISTED",
  "WAITLISTED",
  "APPROVED",
  "REJECTED",
  "ENROLLED",
  "WITHDRAWN",
];

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
}

function statusClasses(status) {
  const styles = {
    APPLIED: "bg-blue-100 text-blue-700",
    UNDER_REVIEW: "bg-yellow-100 text-yellow-700",
    SHORTLISTED: "bg-purple-100 text-purple-700",
    WAITLISTED: "bg-orange-100 text-orange-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    ENROLLED: "bg-emerald-100 text-emerald-700",
    WITHDRAWN: "bg-slate-200 text-slate-700",
  };

  return (
    styles[status] ||
    "bg-slate-100 text-slate-700"
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="border-b border-slate-100 py-3 last:border-b-0">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </div>

      <div className="mt-1 text-sm font-medium text-slate-800">
        {value || "-"}
      </div>
    </div>
  );
}

function CredentialBox({
  label,
  value,
}) {
  const copyValue = async () => {
    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
    } catch (error) {
      console.error(
        "Unable to copy:",
        error
      );
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <div className="min-w-0 flex-1 overflow-hidden rounded-md bg-slate-50 px-3 py-2 font-mono text-sm text-slate-800">
          <span className="break-all">
            {value || "-"}
          </span>
        </div>

        <button
          type="button"
          onClick={copyValue}
          disabled={!value}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Copy
        </button>
      </div>
    </div>
  );
}

function AdmissionDetails() {
  const navigate = useNavigate();
  const { admissionId } = useParams();

  const [admission, setAdmission] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [actionLoading, setActionLoading] =
    useState(false);

  const [status, setStatus] =
    useState("");

  const [enrollmentResult, setEnrollmentResult] =
    useState(null);

  const loadAdmission = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/admissions/${admissionId}`
      );

      setAdmission(response.data);
      setStatus(response.data.status || "");

    } catch (err) {
      console.error(
        "Failed to load admission:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to load admission details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmission();
  }, [admissionId]);

  const handleStatusChange = async (
    event
  ) => {
    const newStatus = event.target.value;

    if (!newStatus || !admission) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const response = await api.patch(
        `/admissions/${admission.id}/status`,
        {
          status: newStatus,
        }
      );

      setAdmission(response.data);
      setStatus(response.data.status);

    } catch (err) {
      console.error(
        "Failed to update status:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to update admission status."
      );

      setStatus(admission.status);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!admission) {
      return;
    }

    if (admission.status !== "APPROVED") {
      setError(
        "Only approved admissions can be enrolled."
      );
      return;
    }

    const confirmed =
      window.confirm(
        "Enroll this approved applicant? This will create the student, parent, relationship, and fee account."
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setEnrollmentResult(null);

      const response = await api.post(
        `/admissions/${admission.id}/enroll`
      );

      setEnrollmentResult(response.data);

      setAdmission((previous) => ({
        ...previous,
        status:
          response.data.admission_status ||
          "ENROLLED",
      }));

      setStatus(
        response.data.admission_status ||
          "ENROLLED"
      );

    } catch (err) {
      console.error(
        "Failed to enroll admission:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Enrollment failed."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!admission) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to archive this admission application?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await api.delete(
        `/admissions/${admission.id}`
      );

      await loadAdmission();

    } catch (err) {
      console.error(
        "Failed to archive admission:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to archive admission."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!admission) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      const response = await api.patch(
        `/admissions/${admission.id}/restore`
      );

      setAdmission(response.data);
      setStatus(response.data.status);

    } catch (err) {
      console.error(
        "Failed to restore admission:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to restore admission."
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm text-slate-500">
              Loading admission details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !admission) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl">

          <button
            type="button"
            onClick={() =>
              navigate("/admissions")
            }
            className="mb-6 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            ← Back to Admissions
          </button>

          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h1 className="text-lg font-semibold text-red-800">
              Unable to load admission
            </h1>

            <p className="mt-2 text-sm text-red-700">
              {error}
            </p>
          </div>

        </div>
      </div>
    );
  }

  if (!admission) {
    return null;
  }

  const applicantName = [
    admission.first_name,
    admission.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  const isArchived =
    admission.is_active === false;

  const canEnroll =
    admission.status === "APPROVED" &&
    !isArchived;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <button
              type="button"
              onClick={() =>
                navigate("/admissions")
              }
              className="mb-3 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              ← Back to Admissions
            </button>

            <h1 className="text-3xl font-bold text-slate-900">
              Admission Details
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View and manage this admission application.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">

            {canEnroll && (
              <button
                type="button"
                onClick={handleEnroll}
                disabled={actionLoading}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading
                  ? "Enrolling..."
                  : "Enroll Student"}
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/admissions/${admission.id}/edit`
                )
              }
              disabled={actionLoading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Edit Application
            </button>

            {!isArchived ? (
              <button
                type="button"
                onClick={handleArchive}
                disabled={actionLoading}
                className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Archive
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRestore}
                disabled={actionLoading}
                className="rounded-lg border border-green-200 bg-white px-4 py-2 text-sm font-semibold text-green-600 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Restore
              </button>
            )}

          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ENROLLMENT SUCCESS */}
        {enrollmentResult && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-6">

            <div className="flex items-start gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                ✓
              </div>

              <div>
                <h2 className="text-lg font-bold text-emerald-900">
                  Enrollment Successful
                </h2>

                <p className="mt-1 text-sm text-emerald-700">
                  {enrollmentResult.message}
                </p>
              </div>

            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-lg border border-emerald-100 bg-white p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Student ID
                </div>

                <div className="mt-1 text-lg font-bold text-slate-900">
                  {enrollmentResult.student_id}
                </div>
              </div>

              <div className="rounded-lg border border-emerald-100 bg-white p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Parent ID
                </div>

                <div className="mt-1 text-lg font-bold text-slate-900">
                  {enrollmentResult.parent_id}
                </div>
              </div>

              <div className="rounded-lg border border-emerald-100 bg-white p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Relationship ID
                </div>

                <div className="mt-1 text-lg font-bold text-slate-900">
                  {enrollmentResult.parent_student_id}
                </div>
              </div>

              <div className="rounded-lg border border-emerald-100 bg-white p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Fee Account ID
                </div>

                <div className="mt-1 text-lg font-bold text-slate-900">
                  {enrollmentResult.fee_account_id}
                </div>
              </div>

            </div>

            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">

              <h3 className="font-semibold text-amber-900">
                Temporary Login Credentials
              </h3>

              <p className="mt-1 text-xs text-amber-700">
                These credentials are temporary. Handle them securely and provide them only to the appropriate user.
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-2">

                <div>
                  <h4 className="mb-2 text-sm font-semibold text-slate-800">
                    Student Login
                  </h4>

                  <div className="space-y-3">

                    <CredentialBox
                      label="Email"
                      value={
                        enrollmentResult.student_login_email
                      }
                    />

                    <CredentialBox
                      label="Temporary Password"
                      value={
                        enrollmentResult.student_temporary_password
                      }
                    />

                  </div>
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-semibold text-slate-800">
                    Parent Login
                  </h4>

                  <div className="space-y-3">

                    <CredentialBox
                      label="Email"
                      value={
                        enrollmentResult.parent_login_email
                      }
                    />

                    <CredentialBox
                      label="Temporary Password"
                      value={
                        enrollmentResult.parent_temporary_password
                      }
                    />

                  </div>
                </div>

              </div>

            </div>

            <div className="mt-4 rounded-lg border border-emerald-100 bg-white p-4">

              <div className="flex flex-wrap gap-3">

                <button
                  type="button"
                  onClick={() =>
                    navigate("/students")
                  }
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Go to Students
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/parents")
                  }
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Go to Parents
                </button>

              </div>

            </div>

          </div>
        )}

        {/* APPLICATION SUMMARY */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Application Number
              </div>

              <div className="mt-1 text-2xl font-bold text-slate-900">
                {admission.application_number}
              </div>

              <div className="mt-2 text-sm text-slate-500">
                {applicantName}
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(
                  admission.status
                )}`}
              >
                {admission.status}
              </span>

              {isArchived && (
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                  ARCHIVED
                </span>
              )}

              <select
                value={status}
                onChange={handleStatusChange}
                disabled={
                  actionLoading ||
                  admission.status === "ENROLLED"
                }
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                {STATUS_OPTIONS.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option}
                    </option>
                  )
                )}
              </select>

            </div>

          </div>

        </div>

        {/* STUDENT INFORMATION */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Applicant Information
            </h2>

            <p className="text-sm text-slate-500">
              Student details submitted with the application.
            </p>
          </div>

          <div className="grid gap-x-8 md:grid-cols-2 lg:grid-cols-3">

            <InfoRow
              label="First Name"
              value={admission.first_name}
            />

            <InfoRow
              label="Last Name"
              value={admission.last_name}
            />

            <InfoRow
              label="Date of Birth"
              value={formatDate(
                admission.date_of_birth
              )}
            />

            <InfoRow
              label="Gender"
              value={admission.gender}
            />

            <InfoRow
              label="Applying Class"
              value={admission.applying_class}
            />

            <InfoRow
              label="Applying Section"
              value={admission.applying_section}
            />

            <InfoRow
              label="Academic Year"
              value={admission.academic_year}
            />

            <InfoRow
              label="Application Date"
              value={formatDate(
                admission.application_date
              )}
            />

            <InfoRow
              label="Application Source"
              value={admission.source}
            />

          </div>

        </div>

        {/* PARENT INFORMATION */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Parent / Guardian Information
            </h2>

            <p className="text-sm text-slate-500">
              Primary parent or guardian details.
            </p>
          </div>

          <div className="grid gap-x-8 md:grid-cols-2 lg:grid-cols-3">

            <InfoRow
              label="Parent / Guardian"
              value={admission.parent_name}
            />

            <InfoRow
              label="Relationship"
              value={admission.parent_relationship}
            />

            <InfoRow
              label="Phone"
              value={admission.parent_phone}
            />

            <InfoRow
              label="Email"
              value={admission.parent_email}
            />

            <InfoRow
              label="Occupation"
              value={admission.parent_occupation}
            />

            <InfoRow
              label="Address"
              value={admission.parent_address}
            />

          </div>

        </div>

        {/* PREVIOUS SCHOOL */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Previous School Information
            </h2>

            <p className="text-sm text-slate-500">
              Previous academic background provided during admission.
            </p>
          </div>

          <div className="grid gap-x-8 md:grid-cols-2 lg:grid-cols-4">

            <InfoRow
              label="Previous School"
              value={
                admission.previous_school_name
              }
            />

            <InfoRow
              label="Previous Class"
              value={admission.previous_class}
            />

            <InfoRow
              label="Previous Board"
              value={admission.previous_board}
            />

            <InfoRow
              label="Previous Academic Year"
              value={
                admission.previous_academic_year
              }
            />

          </div>

        </div>

        {/* NOTES */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-bold text-slate-900">
            Notes
          </h2>

          <div className="mt-4 rounded-lg bg-slate-50 p-4">

            {admission.notes ? (
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {admission.notes}
              </p>
            ) : (
              <p className="text-sm text-slate-400">
                No notes have been added to this application.
              </p>
            )}

          </div>

        </div>

        {/* SYSTEM INFORMATION */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-bold text-slate-900">
            Application Information
          </h2>

          <div className="mt-4 grid gap-x-8 md:grid-cols-2">

            <InfoRow
              label="Application ID"
              value={String(admission.id)}
            />

            <InfoRow
              label="Active"
              value={
                admission.is_active
                  ? "Yes"
                  : "No"
              }
            />

            <InfoRow
              label="Created At"
              value={formatDate(
                admission.created_at
              )}
            />

            <InfoRow
              label="Updated At"
              value={formatDate(
                admission.updated_at
              )}
            />

          </div>

        </div>

      </div>
    </div>
  );
}

export default AdmissionDetails;