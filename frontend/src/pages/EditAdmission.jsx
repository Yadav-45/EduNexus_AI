import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../api/axios";

const INITIAL_FORM = {
  academic_year: "",
  application_date: "",
  source: "",

  first_name: "",
  last_name: "",
  date_of_birth: "",
  gender: "",
  applying_class: "",
  applying_section: "",

  parent_name: "",
  parent_relationship: "",
  parent_phone: "",
  parent_email: "",
  parent_occupation: "",
  parent_address: "",

  previous_school_name: "",
  previous_class: "",
  previous_board: "",
  previous_academic_year: "",

  notes: "",
};

function EditAdmission() {
  const navigate = useNavigate();
  const { admissionId } = useParams();

  const [form, setForm] =
    useState(INITIAL_FORM);

  const [applicationNumber, setApplicationNumber] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const loadAdmission = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/admissions/${admissionId}`
      );

      const data = response.data;

      setApplicationNumber(
        data.application_number || ""
      );

      setStatus(data.status || "");

      setForm({
        academic_year:
          data.academic_year || "",

        application_date:
          data.application_date || "",

        source:
          data.source || "",

        first_name:
          data.first_name || "",

        last_name:
          data.last_name || "",

        date_of_birth:
          data.date_of_birth || "",

        gender:
          data.gender || "",

        applying_class:
          data.applying_class || "",

        applying_section:
          data.applying_section || "",

        parent_name:
          data.parent_name || "",

        parent_relationship:
          data.parent_relationship || "",

        parent_phone:
          data.parent_phone || "",

        parent_email:
          data.parent_email || "",

        parent_occupation:
          data.parent_occupation || "",

        parent_address:
          data.parent_address || "",

        previous_school_name:
          data.previous_school_name || "",

        previous_class:
          data.previous_class || "",

        previous_board:
          data.previous_board || "",

        previous_academic_year:
          data.previous_academic_year || "",

        notes:
          data.notes || "",
      });

    } catch (err) {
      console.error(
        "Failed to load admission:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to load admission."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmission();
  }, [admissionId]);

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const validateForm = () => {
    if (!form.first_name.trim()) {
      return "First name is required.";
    }

    if (!form.academic_year.trim()) {
      return "Academic year is required.";
    }

    if (!form.applying_class.trim()) {
      return "Applying class is required.";
    }

    if (!form.parent_name.trim()) {
      return "Parent / guardian name is required.";
    }

    if (!form.parent_phone.trim()) {
      return "Parent / guardian phone is required.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        academic_year:
          form.academic_year.trim(),

        application_date:
          form.application_date || null,

        source:
          form.source.trim() || null,

        first_name:
          form.first_name.trim(),

        last_name:
          form.last_name.trim() || null,

        date_of_birth:
          form.date_of_birth || null,

        gender:
          form.gender || null,

        applying_class:
          form.applying_class.trim(),

        applying_section:
          form.applying_section.trim() || null,

        parent_name:
          form.parent_name.trim(),

        parent_relationship:
          form.parent_relationship.trim() || null,

        parent_phone:
          form.parent_phone.trim(),

        parent_email:
          form.parent_email.trim() || null,

        parent_occupation:
          form.parent_occupation.trim() || null,

        parent_address:
          form.parent_address.trim() || null,

        previous_school_name:
          form.previous_school_name.trim() ||
          null,

        previous_class:
          form.previous_class.trim() ||
          null,

        previous_board:
          form.previous_board.trim() ||
          null,

        previous_academic_year:
          form.previous_academic_year.trim() ||
          null,

        notes:
          form.notes.trim() || null,
      };

      await api.put(
        `/admissions/${admissionId}`,
        payload
      );

      setSuccess(
        "Admission application updated successfully."
      );

      setTimeout(() => {
        navigate(
          `/admissions/${admissionId}`
        );
      }, 700);

    } catch (err) {
      console.error(
        "Failed to update admission:",
        err
      );

      const detail =
        err?.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail
            .map(
              (item) =>
                item?.msg || "Validation error"
            )
            .join(", ")
        );
      } else {
        setError(
          detail ||
            "Unable to update admission."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-5xl">

          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm text-slate-500">
              Loading admission application...
            </p>
          </div>

        </div>
      </div>
    );
  }

  if (error && !applicationNumber) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-5xl">

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

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}
        <div className="mb-6">

          <button
            type="button"
            onClick={() =>
              navigate(
                `/admissions/${admissionId}`
              )
            }
            className="mb-3 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            ← Back to Admission Details
          </button>

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Edit Admission
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Update the admission application information.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">

              <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Application
              </div>

              <div className="mt-1 text-sm font-bold text-slate-900">
                {applicationNumber}
              </div>

              <div className="mt-1 text-xs text-slate-500">
                Status: {status || "-"}
              </div>

            </div>

          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* APPLICATION INFORMATION */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                Application Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Academic year and application source.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Academic Year *
                </label>

                <input
                  type="text"
                  name="academic_year"
                  value={form.academic_year}
                  onChange={handleChange}
                  placeholder="2026-27"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Application Date
                </label>

                <input
                  type="date"
                  name="application_date"
                  value={form.application_date}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Source
                </label>

                <select
                  name="source"
                  value={form.source}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    Select source
                  </option>
                  <option value="WEBSITE">
                    Website
                  </option>
                  <option value="WALK_IN">
                    Walk-in
                  </option>
                  <option value="REFERRAL">
                    Referral
                  </option>
                  <option value="ADVERTISEMENT">
                    Advertisement
                  </option>
                  <option value="PHONE">
                    Phone
                  </option>
                  <option value="SOCIAL_MEDIA">
                    Social Media
                  </option>
                  <option value="OTHER">
                    Other
                  </option>
                </select>
              </div>

            </div>
          </section>

          {/* STUDENT INFORMATION */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                Student Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Applicant details and requested class.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  First Name *
                </label>

                <input
                  type="text"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  placeholder="First name"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Last Name
                </label>

                <input
                  type="text"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  placeholder="Last name"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Date of Birth
                </label>

                <input
                  type="date"
                  name="date_of_birth"
                  value={form.date_of_birth}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Gender
                </label>

                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    Select gender
                  </option>
                  <option value="MALE">
                    Male
                  </option>
                  <option value="FEMALE">
                    Female
                  </option>
                  <option value="OTHER">
                    Other
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Applying Class *
                </label>

                <input
                  type="text"
                  name="applying_class"
                  value={form.applying_class}
                  onChange={handleChange}
                  placeholder="Class 8"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Applying Section
                </label>

                <input
                  type="text"
                  name="applying_section"
                  value={form.applying_section}
                  onChange={handleChange}
                  placeholder="A"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

            </div>
          </section>

          {/* PARENT INFORMATION */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                Parent / Guardian Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Primary parent or guardian contact details.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Parent / Guardian Name *
                </label>

                <input
                  type="text"
                  name="parent_name"
                  value={form.parent_name}
                  onChange={handleChange}
                  placeholder="Full name"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Relationship
                </label>

                <select
                  name="parent_relationship"
                  value={form.parent_relationship}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    Select relationship
                  </option>
                  <option value="FATHER">
                    Father
                  </option>
                  <option value="MOTHER">
                    Mother
                  </option>
                  <option value="GUARDIAN">
                    Guardian
                  </option>
                  <option value="OTHER">
                    Other
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Phone *
                </label>

                <input
                  type="tel"
                  name="parent_phone"
                  value={form.parent_phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Email
                </label>

                <input
                  type="email"
                  name="parent_email"
                  value={form.parent_email}
                  onChange={handleChange}
                  placeholder="Email address"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Occupation
                </label>

                <input
                  type="text"
                  name="parent_occupation"
                  value={form.parent_occupation}
                  onChange={handleChange}
                  placeholder="Occupation"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Address
                </label>

                <textarea
                  name="parent_address"
                  value={form.parent_address}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Parent / guardian address"
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

            </div>
          </section>

          {/* PREVIOUS SCHOOL */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                Previous School Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Previous academic background.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Previous School
                </label>

                <input
                  type="text"
                  name="previous_school_name"
                  value={form.previous_school_name}
                  onChange={handleChange}
                  placeholder="School name"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Previous Class
                </label>

                <input
                  type="text"
                  name="previous_class"
                  value={form.previous_class}
                  onChange={handleChange}
                  placeholder="Previous class"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Previous Board
                </label>

                <input
                  type="text"
                  name="previous_board"
                  value={form.previous_board}
                  onChange={handleChange}
                  placeholder="Board"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Previous Academic Year
                </label>

                <input
                  type="text"
                  name="previous_academic_year"
                  value={form.previous_academic_year}
                  onChange={handleChange}
                  placeholder="2025-26"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

            </div>
          </section>

          {/* NOTES */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                Notes
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Additional information about the application.
              </p>
            </div>

            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={5}
              placeholder="Add notes about this admission application..."
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </section>

          {/* ACTIONS */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/admissions/${admissionId}`
                )
              }
              disabled={saving}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving Changes..."
                : "Save Changes"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}

export default EditAdmission;