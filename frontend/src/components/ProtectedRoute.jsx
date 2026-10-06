import { Navigate } from "react-router-dom";

function getUserRole() {
  return localStorage.getItem("user_role");
}

function ProtectedRoute({
  children,
  allowedRoles = [],
}) {
  const token =
    localStorage.getItem("access_token");

  const role = getUserRole();

  // User is not logged in.
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Route does not specify role restrictions.
  if (allowedRoles.length === 0) {
    return children;
  }

  // Logged-in user does not have permission.
  if (!allowedRoles.includes(role)) {
    const dashboardByRole = {
      OWNER: "/owner-dashboard",
      ADMIN: "/admin-dashboard",
      ACCOUNTANT: "/finance-dashboard",
      TEACHER: "/teacher-dashboard",
      PARENT: "/parent-dashboard",
      STUDENT: "/dashboard",
    };

    const correctDashboard =
      dashboardByRole[role] || "/";

    return (
      <Navigate
        to={correctDashboard}
        replace
      />
    );
  }

  return children;
}

export default ProtectedRoute;