import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const initialForm = {
  academic_year: "2026-27",
  application_date: new Date()
    .toISOString()
    .split("T")[0],

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

  source: "",
  notes: "",
};

function NewAdmission() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.first_name.trim()) {
      setError("Student first name is required.");
      return;
    }

    if (!form.academic_year.trim()) {
      setError("Academic year is required.");
      return;
    }

    if (!form.applying_class.trim()) {
      setError("Applying class is required.");
      return;
    }

    if (!form.parent_name.trim()) {
      setError("Parent / guardian name is required.");
      return;
    }

    if (!form.parent_phone.trim()) {
      setError("Parent / guardian phone is required.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...form,

        last_name:
          form.last_name.trim() || null,

        date_of_birth:
          form.date_of_birth || null,

        gender:
          form.gender || null,

        applying_section:
          form.applying_section.trim() || null,

        parent_relationship:
          form.parent_relationship.trim() || null,

        parent_email:
          form.parent_email.trim() || null,

        parent_occupation:
          form.parent_occupation.trim() || null,

        parent_address:
          form.parent_address.trim() || null,

        previous_school_name:
          form.previous_school_name.trim() || null,

        previous_class:
          form.previous_class.trim() || null,

        previous_board:
          form.previous_board.trim() || null,

        previous_academic_year:
          form.previous_academic_year.trim() || null,

        source:
          form.source.trim() || null,

        notes:
          form.notes.trim() || null,
      };

      const response = await api.post(
        "/admissions",
        payload
      );

      const createdAdmission = response.data;

      setSuccess(
        `Application created successfully: ${createdAdmission.application_number}`
      );

      setTimeout(() => {
        navigate("/admissions");
      }, 800);
    } catch (err) {
      console.error(
        "Create admission error:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please log in again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You do not have permission to create admissions."
        );
      } else {
        const detail =
          err.response?.data?.detail;

        if (Array.isArray(detail)) {
          setError(
            detail
              .map(
                (item) =>
                  item.msg ||
                  "Invalid field"
              )
              .join(", ")
          );
        } else {
          setError(
            detail ||
              "Unable to create admission application."
          );
        }
      }
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    navigate("/admissions");
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <div className="mb-6">

          <button
            type="button"
            onClick={handleCancel}
            className="mb-3 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            ← Back to Admissions
          </button>

          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            New Admission Application
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create a new student admission application.
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* APPLICATION INFORMATION */}

          <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="mb-5 border-b border-slate-100 pb-4">

              <h2 className="text-lg font-semibold text-slate-900">
                Application Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Basic information about the admission request.
              </p>

            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Academic Year *
                </label>

                <input
                  name="academic_year"
                  value={form.academic_year}
                  onChange={handleChange}
                  placeholder="2026-27"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Application Date *
                </label>

                <input
                  type="date"
                  name="application_date"
                  value={form.application_date}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Application Source
                </label>

                <select
                  name="source"
                  value={form.source}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">
                    Select source
                  </option>
                  <option value="WALK_IN">
                    Walk-in
                  </option>
                  <option value="WEBSITE">
                    Website
                  </option>
                  <option value="REFERRAL">
                    Referral
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

          <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="mb-5 border-b border-slate-100 pb-4">

              <h2 className="text-lg font-semibold text-slate-900">
                Student Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Personal and class information for the applicant.
              </p>

            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

              <div className="lg:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  First Name *
                </label>

                <input
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  placeholder="First name"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Last Name
                </label>

                <input
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
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
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
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
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
                  name="applying_class"
                  value={form.applying_class}
                  onChange={handleChange}
                  placeholder="Class 8"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Applying Section
                </label>

                <input
                  name="applying_section"
                  value={form.applying_section}
                  onChange={handleChange}
                  placeholder="A"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

            </div>

          </section>

          {/* PARENT INFORMATION */}

          <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="mb-5 border-b border-slate-100 pb-4">

              <h2 className="text-lg font-semibold text-slate-900">
                Parent / Guardian Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Contact information for the student's parent or guardian.
              </p>

            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Parent / Guardian Name *
                </label>

                <input
                  name="parent_name"
                  value={form.parent_name}
                  onChange={handleChange}
                  placeholder="Full name"
                  required
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
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
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
                  <option value="GRANDFATHER">
                    Grandfather
                  </option>
                  <option value="GRANDMOTHER">
                    Grandmother
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
                  name="parent_phone"
                  value={form.parent_phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                  required
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
                  placeholder="parent@example.com"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Occupation
                </label>

                <input
                  name="parent_occupation"
                  value={form.parent_occupation}
                  onChange={handleChange}
                  placeholder="Occupation"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Address
                </label>

                <input
                  name="parent_address"
                  value={form.parent_address}
                  onChange={handleChange}
                  placeholder="Address"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

            </div>

          </section>

          {/* PREVIOUS SCHOOL */}

          <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="mb-5 border-b border-slate-100 pb-4">

              <h2 className="text-lg font-semibold text-slate-900">
                Previous School Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Previous academic information, if applicable.
              </p>

            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

              <div className="lg:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Previous School
                </label>

                <input
                  name="previous_school_name"
                  value={
                    form.previous_school_name
                  }
                  onChange={handleChange}
                  placeholder="School name"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Previous Class
                </label>

                <input
                  name="previous_class"
                  value={form.previous_class}
                  onChange={handleChange}
                  placeholder="Class 7"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Board
                </label>

                <input
                  name="previous_board"
                  value={form.previous_board}
                  onChange={handleChange}
                  placeholder="NEB / CBSE / Other"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Previous Academic Year
                </label>

                <input
                  name="previous_academic_year"
                  value={
                    form.previous_academic_year
                  }
                  onChange={handleChange}
                  placeholder="2025-26"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

            </div>

          </section>

          {/* NOTES */}

          <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="mb-5 border-b border-slate-100 pb-4">

              <h2 className="text-lg font-semibold text-slate-900">
                Notes
              </h2>

            </div>

            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows="5"
              placeholder="Additional information about the application..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

          </section>

          {/* ACTIONS */}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Creating Application..."
                : "Create Application"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}

export default NewAdmission;