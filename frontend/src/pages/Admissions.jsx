import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function formatDate(value) {
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
}

function getStatusClass(status) {
  switch (status) {
    case "APPROVED":
      return "bg-green-100 text-green-800";

    case "ENROLLED":
      return "bg-blue-100 text-blue-800";

    case "REJECTED":
      return "bg-red-100 text-red-800";

    case "WITHDRAWN":
      return "bg-gray-100 text-gray-700";

    case "SHORTLISTED":
      return "bg-purple-100 text-purple-800";

    case "WAITLISTED":
      return "bg-yellow-100 text-yellow-800";

    case "UNDER_REVIEW":
      return "bg-orange-100 text-orange-800";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

function displayStatus(status) {
  return status?.replaceAll("_", " ") || "-";
}

function Admissions() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);

  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [applyingClass, setApplyingClass] = useState("");
  const [activeFilter, setActiveFilter] = useState("true");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState(null);

  async function loadAdmissions(customPage = page) {
    setLoading(true);
    setError("");

    try {
      const params = {
        page: customPage,
        page_size: pageSize,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (status) {
        params.status = status;
      }

      if (academicYear.trim()) {
        params.academic_year = academicYear.trim();
      }

      if (applyingClass.trim()) {
        params.applying_class = applyingClass.trim();
      }

      if (activeFilter === "true") {
        params.is_active = true;
      }

      if (activeFilter === "false") {
        params.is_active = false;
      }

      const response = await api.get("/admissions", {
        params,
      });

      const data = response.data;

      setItems(data.items || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 1);
      setPage(data.page || customPage);
      setPageSize(data.page_size || pageSize);
    } catch (err) {
      console.error("Admissions load error:", err);

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please log in again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You do not have permission to view Admissions."
        );
      } else {
        setError(
          err.response?.data?.detail ||
            "Unable to load admissions."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdmissions(page);
  }, [
    page,
    pageSize,
    status,
    activeFilter,
  ]);

  function handleSearch(event) {
    event.preventDefault();

    setPage(1);

    loadAdmissions(1);
  }

  function handleReset() {
    setSearch("");
    setStatus("");
    setAcademicYear("");
    setApplyingClass("");
    setActiveFilter("true");
    setPage(1);
  }

  async function updateStatus(id, nextStatus) {
    setActionId(id);
    setError("");

    try {
      await api.patch(
        `/admissions/${id}/status`,
        {
          status: nextStatus,
        }
      );

      await loadAdmissions(page);
    } catch (err) {
      console.error(
        "Admission status update error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to update admission status."
      );
    } finally {
      setActionId(null);
    }
  }

  async function archiveAdmission(id) {
    const confirmed = window.confirm(
      "Are you sure you want to archive this admission application?"
    );

    if (!confirmed) {
      return;
    }

    setActionId(id);
    setError("");

    try {
      await api.delete(`/admissions/${id}`);

      await loadAdmissions(page);
    } catch (err) {
      console.error(
        "Archive admission error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to archive admission application."
      );
    } finally {
      setActionId(null);
    }
  }

  async function restoreAdmission(id) {
    const confirmed = window.confirm(
      "Restore this archived admission application?"
    );

    if (!confirmed) {
      return;
    }

    setActionId(id);
    setError("");

    try {
      await api.patch(
        `/admissions/${id}/restore`
      );

      await loadAdmissions(page);
    } catch (err) {
      console.error(
        "Restore admission error:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to restore admission application."
      );
    } finally {
      setActionId(null);
    }
  }

  const firstItem =
    total === 0
      ? 0
      : (page - 1) * pageSize + 1;

  const lastItem = Math.min(
    page * pageSize,
    total
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <button
              type="button"
              onClick={() =>
                navigate("/owner-dashboard")
              }
              className="mb-3 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              ← Back to Dashboard
            </button>

            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Admissions Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage applications, review status,
              and admission workflows.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/admissions/new")
            }
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            + New Application
          </button>

        </div>

        {/* SUMMARY */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Applications Found
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {total}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Current Page
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {page} / {totalPages}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Showing
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {firstItem}-{lastItem}
            </p>
          </div>

        </div>

        {/* FILTERS */}

        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-6"
          >

            {/* SEARCH */}

            <div className="lg:col-span-2">

              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Search
              </label>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Application no., name, phone..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* STATUS */}

            <div>

              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </label>

              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >

                <option value="">
                  All statuses
                </option>

                {STATUS_OPTIONS.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {displayStatus(option)}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* ACADEMIC YEAR */}

            <div>

              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Academic Year
              </label>

              <input
                value={academicYear}
                onChange={(event) =>
                  setAcademicYear(
                    event.target.value
                  )
                }
                placeholder="2026-27"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />

            </div>

            {/* CLASS */}

            <div>

              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Applying Class
              </label>

              <input
                value={applyingClass}
                onChange={(event) =>
                  setApplyingClass(
                    event.target.value
                  )
                }
                placeholder="Class 8"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />

            </div>

            {/* RECORD STATUS */}

            <div>

              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Records
              </label>

              <select
                value={activeFilter}
                onChange={(event) => {
                  setActiveFilter(
                    event.target.value
                  );
                  setPage(1);
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >

                <option value="true">
                  Active
                </option>

                <option value="false">
                  Archived
                </option>

                <option value="all">
                  All records
                </option>

              </select>

            </div>

            {/* BUTTONS */}

            <div className="flex items-end gap-2 md:col-span-2 lg:col-span-6">

              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Search
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={() =>
                  loadAdmissions(page)
                }
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Refresh
              </button>

            </div>

          </form>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* TABLE */}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="min-w-[1250px] w-full">

              <thead className="bg-slate-100">

                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-600">

                  <th className="px-4 py-3">
                    Application
                  </th>

                  <th className="px-4 py-3">
                    Applicant
                  </th>

                  <th className="px-4 py-3">
                    Class
                  </th>

                  <th className="px-4 py-3">
                    Parent / Guardian
                  </th>

                  <th className="px-4 py-3">
                    Application Date
                  </th>

                  <th className="px-4 py-3">
                    Status
                  </th>

                  <th className="px-4 py-3">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {loading ? (

                  <tr>

                    <td
                      colSpan="7"
                      className="px-4 py-12 text-center text-sm text-slate-500"
                    >
                      Loading admissions...
                    </td>

                  </tr>

                ) : items.length === 0 ? (

                  <tr>

                    <td
                      colSpan="7"
                      className="px-4 py-12 text-center text-sm text-slate-500"
                    >
                      No admission applications found.
                    </td>

                  </tr>

                ) : (

                  items.map(
                    (admission) => (
                      <tr
                        key={admission.id}
                        className="align-top transition hover:bg-slate-50"
                      >

                        {/* APPLICATION */}

                        <td className="px-4 py-4">

                          <p className="font-semibold text-slate-900">
                            {
                              admission.application_number
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {
                              admission.academic_year
                            }
                          </p>

                        </td>

                        {/* APPLICANT */}

                        <td className="px-4 py-4">

                          <p className="font-medium text-slate-900">

                            {[
                              admission.first_name,
                              admission.last_name,
                            ]
                              .filter(Boolean)
                              .join(" ")}

                          </p>

                          {admission.gender && (
                            <p className="mt-1 text-xs text-slate-500">
                              {admission.gender}
                            </p>
                          )}

                        </td>

                        {/* CLASS */}

                        <td className="px-4 py-4 text-sm text-slate-700">

                          <p>
                            {
                              admission.applying_class ||
                              "-"
                            }
                          </p>

                          {admission.applying_section && (
                            <p className="mt-1 text-xs text-slate-500">
                              Section{" "}
                              {
                                admission.applying_section
                              }
                            </p>
                          )}

                        </td>

                        {/* PARENT */}

                        <td className="px-4 py-4">

                          <p className="font-medium text-slate-800">
                            {
                              admission.parent_name ||
                              "-"
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {
                              admission.parent_phone ||
                              "-"
                            }
                          </p>

                        </td>

                        {/* DATE */}

                        <td className="px-4 py-4 text-sm text-slate-700">
                          {formatDate(
                            admission.application_date
                          )}
                        </td>

                        {/* STATUS */}

                        <td className="px-4 py-4">

                          <select
                            value={
                              admission.status
                            }
                            disabled={
                              actionId ===
                              admission.id
                            }
                            onChange={(event) =>
                              updateStatus(
                                admission.id,
                                event.target.value
                              )
                            }
                            className={`rounded-full border-0 px-3 py-1.5 text-xs font-semibold outline-none ${getStatusClass(
                              admission.status
                            )}`}
                          >

                            {STATUS_OPTIONS.map(
                              (option) => (
                                <option
                                  key={option}
                                  value={option}
                                >
                                  {displayStatus(
                                    option
                                  )}
                                </option>
                              )
                            )}

                          </select>

                        </td>

                        {/* ACTIONS */}

                        <td className="px-4 py-4">

                          <div className="flex flex-wrap gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/admissions/${admission.id}`
                                )
                              }
                              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                            >
                              View
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/admissions/${admission.id}/edit`
                                )
                              }
                              className="rounded-md border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                            >
                              Edit
                            </button>

                            {admission.is_active ? (

                              <button
                                type="button"
                                disabled={
                                  actionId ===
                                  admission.id
                                }
                                onClick={() =>
                                  archiveAdmission(
                                    admission.id
                                  )
                                }
                                className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                              >
                                Archive
                              </button>

                            ) : (

                              <button
                                type="button"
                                disabled={
                                  actionId ===
                                  admission.id
                                }
                                onClick={() =>
                                  restoreAdmission(
                                    admission.id
                                  )
                                }
                                className="rounded-md border border-green-200 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50 disabled:opacity-50"
                              >
                                Restore
                              </button>

                            )}

                          </div>

                        </td>

                      </tr>
                    )
                  )

                )}

              </tbody>

            </table>

          </div>

          {/* PAGINATION */}

          <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-2 text-sm text-slate-600">

              <span>
                Rows per page:
              </span>

              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(
                    Number(event.target.value)
                  );
                  setPage(1);
                }}
                className="rounded-md border border-slate-300 px-2 py-1.5"
              >

                {PAGE_SIZE_OPTIONS.map(
                  (size) => (
                    <option
                      key={size}
                      value={size}
                    >
                      {size}
                    </option>
                  )
                )}

              </select>

            </div>

            <div className="flex items-center gap-2">

              <button
                type="button"
                disabled={
                  page <= 1 || loading
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      current - 1
                  )
                }
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <span className="min-w-[90px] text-center text-sm text-slate-600">
                Page {page} of{" "}
                {totalPages}
              </span>

              <button
                type="button"
                disabled={
                  page >= totalPages ||
                  loading
                }
                onClick={() =>
                  setPage(
                    (current) =>
                      current + 1
                  )
                }
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Admissions;