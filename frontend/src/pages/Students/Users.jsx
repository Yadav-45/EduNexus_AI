import { useEffect, useState } from "react";
import api from "../../api/axios";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [showCreateForm, setShowCreateForm] =
    useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "STUDENT",
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await api.get("/users");

      setUsers(response.data);
    } catch (error) {
      console.error("Error loading users:", error);

      setMessage(
        error.response?.data?.detail ||
          "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();

    try {
      setMessage("");

      await api.post("/users", {
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        role: form.role,
      });

      setForm({
        full_name: "",
        email: "",
        password: "",
        role: "STUDENT",
      });

      setShowCreateForm(false);

      setMessage("User created successfully.");

      await loadUsers();
    } catch (error) {
      console.error(
        "Error creating user:",
        error
      );

      setMessage(
        error.response?.data?.detail ||
          "Unable to create user."
      );
    }
  };

  const handleStatusChange = async (
    userId,
    currentStatus
  ) => {
    try {
      setMessage("");

      await api.patch(
        `/users/${userId}/status`,
        {
          is_active: !currentStatus,
        }
      );

      setMessage("User status updated.");

      await loadUsers();
    } catch (error) {
      console.error(
        "Error updating user status:",
        error
      );

      setMessage(
        error.response?.data?.detail ||
          "Unable to update user status."
      );
    }
  };

  const getRoleLabel = (role) => {
    const labels = {
      OWNER: "Owner",
      ADMIN: "Administrator",
      ACCOUNTANT: "Accountant",
      TEACHER: "Teacher",
      PARENT: "Parent",
      STUDENT: "Student",
    };

    return labels[role] || role;
  };

  const getRoleClass = (role) => {
    return role.toLowerCase();
  };

  return (
    <div className="users-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
        }

        .users-page {
          min-height: 100vh;
          background: #f8fafc;
          color: #101828;
          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Arial,
            sans-serif;
        }

        .users-header {
          background: #ffffff;
          border-bottom: 1px solid #e4e7ec;
          padding: 22px 34px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .brand-mark {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            linear-gradient(
              135deg,
              #2563eb,
              #4f46e5
            );
          color: #ffffff;
          font-size: 17px;
          font-weight: 850;
        }

        .brand-name {
          font-size: 16px;
          font-weight: 850;
        }

        .brand-name span {
          color: #2563eb;
        }

        .header-subtitle {
          margin-top: 3px;
          color: #98a2b3;
          font-size: 10px;
        }

        .back-button {
          border: 1px solid #d0d5dd;
          background: #ffffff;
          color: #344054;
          padding: 9px 14px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .back-button:hover {
          background: #f9fafb;
        }

        .users-content {
          max-width: 1250px;
          margin: 0 auto;
          padding: 36px;
        }

        .page-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 25px;
        }

        .eyebrow {
          color: #2563eb;
          font-size: 9px;
          font-weight: 850;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 7px;
        }

        .page-title {
          margin: 0;
          font-size: 30px;
          font-weight: 850;
          letter-spacing: -0.7px;
        }

        .page-description {
          margin: 8px 0 0;
          color: #667085;
          font-size: 12px;
        }

        .primary-button {
          border: none;
          border-radius: 9px;
          padding: 11px 16px;
          background:
            linear-gradient(
              135deg,
              #2563eb,
              #4f46e5
            );
          color: #ffffff;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
          box-shadow:
            0 5px 13px
            rgba(37, 99, 235, 0.16);
        }

        .primary-button:hover {
          opacity: 0.94;
        }

        .message {
          margin-bottom: 20px;
          padding: 11px 14px;
          border-radius: 8px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1d4ed8;
          font-size: 11px;
          font-weight: 650;
        }

        .create-card {
          background: #ffffff;
          border: 1px solid #e4e7ec;
          border-radius: 14px;
          padding: 22px;
          margin-bottom: 24px;
        }

        .create-title {
          margin: 0 0 18px;
          font-size: 16px;
          font-weight: 800;
        }

        .create-form {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 15px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-label {
          color: #344054;
          font-size: 10px;
          font-weight: 750;
        }

        .form-input,
        .form-select {
          width: 100%;
          padding: 10px 11px;
          border: 1px solid #d0d5dd;
          border-radius: 8px;
          background: #ffffff;
          color: #101828;
          font-size: 11px;
          outline: none;
        }

        .form-input:focus,
        .form-select:focus {
          border-color: #84aef5;
          box-shadow:
            0 0 0 3px
            rgba(37, 99, 235, 0.08);
        }

        .form-actions {
          grid-column: 1 / -1;
          display: flex;
          gap: 10px;
          margin-top: 3px;
        }

        .secondary-button {
          border: 1px solid #d0d5dd;
          border-radius: 8px;
          padding: 10px 14px;
          background: #ffffff;
          color: #344054;
          font-size: 10px;
          font-weight: 750;
          cursor: pointer;
        }

        .table-card {
          background: #ffffff;
          border: 1px solid #e4e7ec;
          border-radius: 14px;
          overflow: hidden;
        }

        .table-header {
          padding: 17px 20px;
          border-bottom: 1px solid #eef0f3;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .table-title {
          margin: 0;
          font-size: 14px;
          font-weight: 800;
        }

        .user-count {
          color: #667085;
          font-size: 10px;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          padding: 11px 18px;
          background: #f9fafb;
          color: #667085;
          font-size: 9px;
          font-weight: 800;
          text-align: left;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        td {
          padding: 14px 18px;
          border-top: 1px solid #f0f2f5;
          color: #344054;
          font-size: 11px;
        }

        .user-name {
          color: #101828;
          font-weight: 750;
        }

        .user-email {
          color: #667085;
        }

        .role-badge {
          display: inline-flex;
          padding: 5px 8px;
          border-radius: 6px;
          font-size: 8px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .role-owner {
          background: #f3e8ff;
          color: #7e22ce;
        }

        .role-admin {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .role-accountant {
          background: #dcfce7;
          color: #15803d;
        }

        .role-teacher {
          background: #fef3c7;
          color: #a16207;
        }

        .role-parent {
          background: #fce7f3;
          color: #be185d;
        }

        .role-student {
          background: #e0f2fe;
          color: #0369a1;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 8px;
          border-radius: 6px;
          font-size: 8px;
          font-weight: 800;
        }

        .status-active {
          background: #dcfce7;
          color: #15803d;
        }

        .status-inactive {
          background: #fee2e2;
          color: #b91c1c;
        }

        .status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: currentColor;
        }

        .status-button {
          border: 1px solid #d0d5dd;
          border-radius: 7px;
          padding: 6px 9px;
          background: #ffffff;
          color: #344054;
          font-size: 8px;
          font-weight: 750;
          cursor: pointer;
        }

        .status-button:hover {
          background: #f9fafb;
        }

        .empty-state {
          padding: 45px 20px;
          text-align: center;
          color: #667085;
          font-size: 11px;
        }

        .loading-state {
          padding: 45px 20px;
          text-align: center;
          color: #667085;
          font-size: 11px;
        }

        @media (max-width: 750px) {
          .users-header {
            padding: 18px;
          }

          .users-content {
            padding: 22px 18px;
          }

          .page-heading {
            flex-direction: column;
          }

          .create-form {
            grid-template-columns: 1fr;
          }

          .form-group.full-width {
            grid-column: auto;
          }

          .form-actions {
            grid-column: auto;
          }
        }
      `}</style>

      <header className="users-header">
        <div className="header-left">
          <div className="brand-mark">
            E
          </div>

          <div>
            <div className="brand-name">
              edu<span>nexus.ai</span>
            </div>

            <div className="header-subtitle">
              School Operating System
            </div>
          </div>
        </div>

        <button
          className="back-button"
          onClick={() =>
            (window.location.href =
              "/admin-dashboard")
          }
        >
          ← Dashboard
        </button>
      </header>

      <main className="users-content">
        <div className="page-heading">
          <div>
            <div className="eyebrow">
              User Management
            </div>

            <h1 className="page-title">
              School Users
            </h1>

            <p className="page-description">
              Create and manage accounts for
              administrators, teachers, accountants,
              parents, and students.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={() =>
              setShowCreateForm(
                !showCreateForm
              )
            }
          >
            {showCreateForm
              ? "Close Form"
              : "+ Create User"}
          </button>
        </div>

        {message && (
          <div className="message">
            {message}
          </div>
        )}

        {showCreateForm && (
          <section className="create-card">
            <h2 className="create-title">
              Create New User
            </h2>

            <form
              className="create-form"
              onSubmit={handleCreateUser}
            >
              <div className="form-group">
                <label className="form-label">
                  Full Name
                </label>

                <input
                  className="form-input"
                  type="text"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Email
                </label>

                <input
                  className="form-input"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Password
                </label>

                <input
                  className="form-input"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create password"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Role
                </label>

                <select
                  className="form-select"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="ADMIN">
                    Administrator
                  </option>

                  <option value="ACCOUNTANT">
                    Accountant
                  </option>

                  <option value="TEACHER">
                    Teacher
                  </option>

                  <option value="PARENT">
                    Parent
                  </option>

                  <option value="STUDENT">
                    Student
                  </option>
                </select>
              </div>

              <div className="form-actions">
                <button
                  className="primary-button"
                  type="submit"
                >
                  Create User
                </button>

                <button
                  className="secondary-button"
                  type="button"
                  onClick={() =>
                    setShowCreateForm(false)
                  }
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="table-card">
          <div className="table-header">
            <h2 className="table-title">
              All Users
            </h2>

            <span className="user-count">
              {users.length} user
              {users.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <div className="loading-state">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              No users found.
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-name">
                          {user.full_name}
                        </div>
                      </td>

                      <td>
                        <div className="user-email">
                          {user.email}
                        </div>
                      </td>

                      <td>
                        <span
                          className={`role-badge role-${getRoleClass(
                            user.role
                          )}`}
                        >
                          {getRoleLabel(
                            user.role
                          )}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`status-badge ${
                            user.is_active
                              ? "status-active"
                              : "status-inactive"
                          }`}
                        >
                          <span className="status-dot" />

                          {user.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <button
                          className="status-button"
                          onClick={() =>
                            handleStatusChange(
                              user.id,
                              user.is_active
                            )
                          }
                        >
                          {user.is_active
                            ? "Deactivate"
                            : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Users;