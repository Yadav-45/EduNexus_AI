import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, getAuthToken } from "../api/config";

const AI_TUTOR_STORAGE_KEY =
  "edunexus_ai_tutor_messages";

function Dashboard() {
  const navigate = useNavigate();

  const [studentName, setStudentName] =
    useState("Student");

  const [studentEmail, setStudentEmail] =
    useState("");

  const [studentRole, setStudentRole] =
    useState("Student");

  const [courseProgress, setCourseProgress] =
    useState(0);

  const [
    assignmentsCompleted,
    setAssignmentsCompleted,
  ] = useState(0);

  const [
    totalAssignments,
    setTotalAssignments,
  ] = useState(0);

  const [aiQuestions, setAiQuestions] =
    useState(0);

  const [loadingProfile, setLoadingProfile] =
    useState(true);

  const loadDashboardData = useCallback(
    async () => {
      const token = getAuthToken();

      if (!token) {
        navigate("/");
        return;
      }

      /* ==============================
         LOAD PROFILE
      ============================== */

      try {
        const response = await fetch(
          `${API_BASE_URL}/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401) {
          localStorage.removeItem(
            "access_token"
          );

          navigate("/");
          return;
        }

        if (response.ok) {
          const profile =
            await response.json();

          setStudentName(
            profile.full_name?.trim() ||
              "Student"
          );

          setStudentEmail(
            profile.email?.trim() || ""
          );

          setStudentRole(
            profile.role?.trim() ||
              "Student"
          );
        }
      } catch (error) {
        console.error(
          "Failed to load profile:",
          error
        );
      } finally {
        setLoadingProfile(false);
      }

      /* ==============================
         LOAD COURSE PROGRESS
      ============================== */

      try {
        const response = await fetch(
          `${API_BASE_URL}/courses/1/progress`
        );

        if (response.ok) {
          const data =
            await response.json();

          setCourseProgress(
            Math.round(data.progress || 0)
          );
        }
      } catch (error) {
        console.error(
          "Failed to load course progress:",
          error
        );
      }

      /* ==============================
         LOAD ASSIGNMENTS
      ============================== */

      try {
        const response = await fetch(
          `${API_BASE_URL}/assignments`
        );

        if (response.ok) {
          const assignments =
            await response.json();

          setTotalAssignments(
            assignments.length
          );

          setAssignmentsCompleted(
            assignments.filter(
              (assignment) =>
                assignment.completed
            ).length
          );
        }
      } catch (error) {
        console.error(
          "Failed to load assignments:",
          error
        );
      }

      /* ==============================
         LOAD AI TUTOR HISTORY
      ============================== */

      const savedMessages =
        localStorage.getItem(
          AI_TUTOR_STORAGE_KEY
        );

      if (savedMessages) {
        try {
          const messages =
            JSON.parse(savedMessages);

          setAiQuestions(
            messages.filter(
              (message) =>
                message.role === "user"
            ).length
          );
        } catch (error) {
          console.error(
            "Failed to load AI Tutor history:",
            error
          );
        }
      } else {
        setAiQuestions(0);
      }
    },
    [navigate]
  );

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  /* ==============================
     LOGOUT
  ============================== */

  const logout = () => {
    localStorage.removeItem(
      "access_token"
    );

    /*
      Remove old cached profile data if
      it exists from previous versions.
    */
    localStorage.removeItem(
      "edunexus_student_profile"
    );

    localStorage.removeItem(
      AI_TUTOR_STORAGE_KEY
    );

    navigate("/");
  };

  /* ==============================
     INITIALS
  ============================== */

  const initials =
    studentName
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "S";

  return (
    <div className="dashboard">
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #ffffff;
        }

        button,
        input {
          font-family: inherit;
        }

        .dashboard {
          min-height: 100vh;
          background: #ffffff;
          color: #172033;

          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Arial,
            sans-serif;
        }

        /* ==============================
           SIDEBAR
        ============================== */

        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;

          width: 240px;

          background: #ffffff;

          border-right:
            1px solid #e7ebf0;

          padding: 24px 15px;

          display: flex;
          flex-direction: column;

          z-index: 20;
        }

        .brand {
          display: flex;
          align-items: center;

          gap: 11px;

          padding:
            2px 11px 29px;
        }

        .brand-mark {
          width: 38px;
          height: 38px;

          border-radius: 10px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #4f46e5
            );

          display: flex;
          align-items: center;
          justify-content: center;

          color: #ffffff;

          font-size: 17px;
          font-weight: 800;

          box-shadow:
            0 5px 12px
            rgba(37, 99, 235, 0.18);
        }

        .brand-text {
          line-height: 1.1;
        }

        .brand-name {
          color: #101828;

          font-size: 17px;
          font-weight: 800;

          letter-spacing: -0.5px;
        }

        .brand-name span {
          color: #2563eb;
        }

        .brand-caption {
          color: #98a2b3;

          font-size: 8px;

          margin-top: 4px;

          letter-spacing: 0.3px;
        }

        .nav-section {
          margin-bottom: 25px;
        }

        .nav-label {
          padding:
            0 12px 9px;

          color: #98a2b3;

          font-size: 9px;
          font-weight: 800;

          letter-spacing: 1px;

          text-transform: uppercase;
        }

        .nav-item {
          position: relative;

          width: 100%;

          border: none;

          background: transparent;

          color: #667085;

          border-radius: 9px;

          padding: 11px 12px;

          margin-bottom: 3px;

          display: flex;

          align-items: center;

          gap: 12px;

          font-size: 12px;
          font-weight: 600;

          cursor: pointer;

          text-align: left;

          transition:
            background 0.18s ease,
            color 0.18s ease,
            transform 0.18s ease;
        }

        .nav-item:hover {
          background: #f6f8fb;

          color: #2563eb;

          transform:
            translateX(2px);
        }

        .nav-item.active {
          background: #eff6ff;

          color: #2563eb;
        }

        .nav-item.active::before {
          content: "";

          position: absolute;

          left: -15px;

          top: 8px;
          bottom: 8px;

          width: 3px;

          border-radius:
            0 4px 4px 0;

          background: #2563eb;
        }

        .nav-icon {
          width: 22px;
          height: 22px;

          border-radius: 6px;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 14px;

          flex-shrink: 0;
        }

        .nav-item.active .nav-icon {
          background: #dbeafe;
        }

        .sidebar-bottom {
          margin-top: auto;
        }

        .sidebar-user {
          margin-top: 14px;

          padding: 12px;

          border:
            1px solid #edf0f4;

          border-radius: 11px;

          background: #fafbfd;

          display: flex;

          align-items: center;

          gap: 9px;
        }

        .sidebar-avatar {
          width: 32px;
          height: 32px;

          flex-shrink: 0;

          border-radius: 50%;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #4f46e5
            );

          color: white;

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 10px;
          font-weight: 800;
        }

        .sidebar-user-info {
          min-width: 0;
        }

        .sidebar-user-name {
          color: #344054;

          font-size: 10px;

          font-weight: 700;

          white-space: nowrap;

          overflow: hidden;

          text-overflow: ellipsis;
        }

        .sidebar-user-role {
          color: #98a2b3;

          font-size: 8px;

          margin-top: 2px;
        }

        /* ==============================
           MAIN
        ============================== */

        .main {
          margin-left: 240px;

          min-height: 100vh;

          background: #ffffff;
        }

        /* ==============================
           TOP HEADER
        ============================== */

        .header {
          height: 70px;

          padding: 0 34px;

          border-bottom:
            1px solid #edf0f4;

          display: flex;

          align-items: center;

          justify-content: flex-end;

          gap: 12px;

          background: #ffffff;
        }

        .search {
          width: 245px;
          height: 36px;

          display: flex;

          align-items: center;

          gap: 8px;

          padding: 0 12px;

          background: #f8fafc;

          border:
            1px solid #e5e9ef;

          border-radius: 8px;

          color: #98a2b3;
        }

        .search-icon {
          font-size: 14px;
        }

        .search input {
          width: 100%;

          border: none;

          outline: none;

          background: transparent;

          color: #344054;

          font-size: 11px;
        }

        .search input::placeholder {
          color: #98a2b3;
        }

        .header-icon {
          position: relative;

          width: 36px;
          height: 36px;

          border:
            1px solid #e5e9ef;

          border-radius: 8px;

          background: #ffffff;

          color: #667085;

          display: flex;

          align-items: center;
          justify-content: center;

          cursor: pointer;

          transition: 0.18s;
        }

        .header-icon:hover {
          border-color: #bfd3f2;

          color: #2563eb;

          background: #f8fbff;
        }

        .notification-dot {
          position: absolute;

          top: 7px;
          right: 7px;

          width: 5px;
          height: 5px;

          border-radius: 50%;

          background: #ef4444;

          border:
            1px solid white;
        }

        .header-profile {
          display: flex;

          align-items: center;

          gap: 9px;

          padding-left: 5px;

          cursor: pointer;
        }

        .header-avatar {
          width: 36px;
          height: 36px;

          border-radius: 50%;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #4f46e5
            );

          display: flex;

          align-items: center;
          justify-content: center;

          color: #ffffff;

          font-size: 10px;
          font-weight: 800;
        }

        .header-profile-text {
          display: flex;

          flex-direction: column;
        }

        .header-name {
          color: #344054;

          font-size: 11px;

          font-weight: 700;
        }

        .header-role {
          color: #98a2b3;

          font-size: 8px;

          margin-top: 2px;
        }

        .header-arrow {
          color: #98a2b3;

          font-size: 9px;
        }

        /* ==============================
           CONTENT
        ============================== */

        .content {
          max-width: 1380px;

          margin: 0 auto;

          padding:
            30px 34px 48px;
        }

        .welcome-row {
          display: flex;

          align-items: flex-end;

          justify-content: space-between;

          margin-bottom: 22px;
        }

        .welcome-label {
          color: #2563eb;

          font-size: 9px;

          font-weight: 800;

          text-transform: uppercase;

          letter-spacing: 1px;

          margin-bottom: 7px;
        }

        .welcome-title {
          margin: 0;

          color: #101828;

          font-size: 27px;

          line-height: 1.15;

          font-weight: 750;

          letter-spacing: -0.8px;
        }

        .welcome-subtitle {
          margin: 7px 0 0;

          color: #667085;

          font-size: 12px;
        }

        .platform-label {
          color: #98a2b3;

          font-size: 9px;
        }

        /* ==============================
           PROFILE SUMMARY
        ============================== */

        .profile-card {
          background: #ffffff;

          border:
            1px solid #e3e8ef;

          border-radius: 14px;

          padding: 21px;

          display: grid;

          grid-template-columns:
            1.5fr
            0.7fr
            0.7fr;

          gap: 20px;

          box-shadow:
            0 3px 14px
            rgba(16, 24, 40, 0.035);

          margin-bottom: 19px;
        }

        .profile-main {
          display: flex;

          align-items: center;

          gap: 16px;
        }

        .profile-avatar {
          width: 76px;
          height: 76px;

          flex-shrink: 0;

          border-radius: 13px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #4f46e5
            );

          color: white;

          display: flex;

          align-items: center;
          justify-content: center;

          font-size: 23px;

          font-weight: 800;

          box-shadow:
            0 7px 16px
            rgba(37, 99, 235, 0.15);
        }

        .profile-name {
          margin: 0;

          color: #101828;

          font-size: 20px;

          font-weight: 750;

          letter-spacing: -0.3px;
        }

        .profile-role {
          margin-top: 4px;

          color: #667085;

          font-size: 11px;
        }

        .profile-email {
          margin-top: 6px;

          color: #98a2b3;

          font-size: 9px;
        }

        .edit-button {
          margin-top: 10px;

          padding: 6px 11px;

          border:
            1px solid #d8dee7;

          border-radius: 7px;

          background: white;

          color: #475467;

          font-size: 9px;

          font-weight: 700;

          cursor: pointer;

          transition: 0.18s;
        }

        .edit-button:hover {
          border-color: #2563eb;

          color: #2563eb;

          background: #f8fbff;
        }

        .profile-stat {
          border-left:
            1px solid #edf0f4;

          padding-left: 20px;

          display: flex;

          flex-direction: column;

          justify-content: center;
        }

        .stat-label {
          color: #98a2b3;

          font-size: 9px;

          margin-bottom: 5px;
        }

        .stat-value {
          color: #101828;

          font-size: 22px;

          font-weight: 800;
        }

        .stat-description {
          color: #667085;

          font-size: 9px;

          margin-top: 3px;
        }

        /* ==============================
           MAIN GRID
        ============================== */

        .dashboard-grid {
          display: grid;

          grid-template-columns:
            0.8fr
            1.25fr
            0.95fr;

          gap: 18px;

          margin-bottom: 19px;
        }

        .card {
          background: #ffffff;

          border:
            1px solid #e3e8ef;

          border-radius: 14px;

          padding: 19px;

          box-shadow:
            0 3px 14px
            rgba(16, 24, 40, 0.03);
        }

        .card-header {
          display: flex;

          align-items: center;

          justify-content: space-between;

          margin-bottom: 16px;
        }

        .card-title {
          margin: 0;

          color: #172033;

          font-size: 13px;

          font-weight: 750;
        }

        .card-link {
          border: none;

          background: transparent;

          color: #2563eb;

          font-size: 9px;

          font-weight: 750;

          cursor: pointer;
        }

        .card-link:hover {
          color: #1d4ed8;
        }

        /* ==============================
           PROGRESS
        ============================== */

        .progress-card {
          text-align: center;
        }

        .progress-ring {
          width: 132px;
          height: 132px;

          margin: 18px auto;

          border-radius: 50%;

          display: flex;

          align-items: center;
          justify-content: center;

          position: relative;
        }

        .progress-ring::after {
          content: "";

          position: absolute;

          width: 104px;
          height: 104px;

          border-radius: 50%;

          background: white;
        }

        .progress-number {
          position: relative;

          z-index: 2;

          color: #101828;

          font-size: 25px;

          font-weight: 800;
        }

        .progress-course {
          color: #344054;

          font-size: 11px;

          font-weight: 700;
        }

        .progress-description {
          margin-top: 4px;

          color: #98a2b3;

          font-size: 8px;
        }

        /* ==============================
           COURSES
        ============================== */

        .course-list {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 10px;
        }

        .course {
          border:
            1px solid #e5eaf0;

          border-radius: 10px;

          overflow: hidden;

          background: #ffffff;

          cursor: pointer;

          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease,
            border-color 0.18s ease;
        }

        .course:hover {
          transform:
            translateY(-2px);

          border-color: #cbdaf0;

          box-shadow:
            0 8px 20px
            rgba(16, 24, 40, 0.07);
        }

        .course-top {
          height: 70px;

          background:
            linear-gradient(
              135deg,
              #f5f8fc,
              #edf3fb
            );

          border-bottom:
            1px solid #edf1f5;

          display: flex;

          align-items: center;
          justify-content: center;

          color: #2563eb;

          font-size: 27px;
        }

        .course-body {
          padding: 11px;
        }

        .course-title {
          margin: 0;

          color: #172033;

          font-size: 11px;

          font-weight: 750;
        }

        .course-description {
          margin: 4px 0 9px;

          color: #98a2b3;

          font-size: 8px;

          line-height: 1.45;
        }

        .course-progress {
          height: 4px;

          border-radius: 10px;

          background: #edf1f5;

          overflow: hidden;
        }

        .course-progress-fill {
          height: 100%;

          border-radius: 10px;

          background: #2563eb;

          transition:
            width 0.4s ease;
        }

        .course-percent {
          margin-top: 4px;

          color: #667085;

          font-size: 8px;

          text-align: right;
        }

        /* ==============================
           ACHIEVEMENTS
        ============================== */

        .achievement-list {
          display: flex;

          justify-content:
            space-between;

          gap: 8px;

          padding-top: 9px;
        }

        .achievement {
          flex: 1;

          text-align: center;
        }

        .achievement-icon {
          width: 49px;
          height: 49px;

          margin: 0 auto 8px;

          border-radius: 50%;

          background: #f8fafc;

          border:
            1px solid #e1e7ef;

          display: flex;

          align-items: center;
          justify-content: center;

          color: #2563eb;

          font-size: 18px;
        }

        .achievement-name {
          color: #344054;

          font-size: 8px;

          font-weight: 700;

          line-height: 1.35;
        }

        .achievement-status {
          margin-top: 3px;

          color: #98a2b3;

          font-size: 7px;
        }

        /* ==============================
           LOWER GRID
        ============================== */

        .lower-grid {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 18px;

          margin-bottom: 19px;
        }

        .recommendation {
          display: flex;

          align-items: center;

          gap: 12px;

          padding: 12px;

          border:
            1px solid #e5eaf0;

          border-radius: 10px;

          margin-bottom: 9px;

          cursor: pointer;

          transition: 0.18s;
        }

        .recommendation:last-child {
          margin-bottom: 0;
        }

        .recommendation:hover {
          border-color: #bfd3f2;

          background: #fbfdff;

          transform:
            translateY(-1px);
        }

        .recommendation-icon {
          width: 52px;
          height: 52px;

          flex-shrink: 0;

          border-radius: 9px;

          background: #f2f6fb;

          border:
            1px solid #e6ebf2;

          display: flex;

          align-items: center;
          justify-content: center;

          color: #2563eb;

          font-size: 16px;

          font-weight: 800;
        }

        .recommendation h3 {
          margin: 0;

          color: #172033;

          font-size: 11px;

          font-weight: 750;
        }

        .recommendation p {
          margin: 4px 0;

          color: #98a2b3;

          font-size: 8px;

          line-height: 1.4;
        }

        .recommendation-tag {
          color: #2563eb;

          font-size: 7px;

          font-weight: 750;
        }

        /* ==============================
           ACTIVITY
        ============================== */

        .activity-item {
          display: flex;

          align-items: center;

          gap: 10px;

          padding: 10px 0;

          border-bottom:
            1px solid #f0f2f5;
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        .activity-icon {
          width: 31px;
          height: 31px;

          border-radius: 8px;

          background: #f3f6fa;

          display: flex;

          align-items: center;
          justify-content: center;

          color: #2563eb;

          font-size: 11px;

          font-weight: 700;
        }

        .activity-title {
          color: #344054;

          font-size: 9px;

          font-weight: 700;
        }

        .activity-text {
          margin-top: 2px;

          color: #98a2b3;

          font-size: 8px;
        }

        /* ==============================
           AI TUTOR
        ============================== */

        .ai-tutor {
          border:
            1px solid #dbe5f3;

          border-radius: 14px;

          padding: 18px 20px;

          background:
            linear-gradient(
              135deg,
              #f8fbff,
              #f4f7ff
            );

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 20px;
        }

        .ai-content {
          display: flex;

          align-items: center;

          gap: 12px;
        }

        .ai-icon {
          width: 43px;
          height: 43px;

          border-radius: 10px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #4f46e5
            );

          display: flex;

          align-items: center;
          justify-content: center;

          color: white;

          font-size: 17px;

          box-shadow:
            0 5px 12px
            rgba(37, 99, 235, 0.15);
        }

        .ai-title {
          margin: 0;

          color: #172033;

          font-size: 13px;

          font-weight: 750;
        }

        .ai-description {
          margin: 4px 0 0;

          color: #667085;

          font-size: 8px;
        }

        .ai-button {
          padding: 9px 15px;

          border: none;

          border-radius: 7px;

          background: #2563eb;

          color: white;

          font-size: 9px;

          font-weight: 750;

          cursor: pointer;

          box-shadow:
            0 4px 10px
            rgba(37, 99, 235, 0.14);

          transition: 0.18s;
        }

        .ai-button:hover {
          background: #1d4ed8;

          transform:
            translateY(-1px);
        }

        /* ==============================
           PROFILE LOADING
        ============================== */

        .profile-loading {
          color: #98a2b3;
        }

        /* ==============================
           RESPONSIVE
        ============================== */

        @media (max-width: 1150px) {
          .dashboard-grid {
            grid-template-columns:
              1fr 1fr;
          }

          .profile-card {
            grid-template-columns:
              1fr 1fr;
          }

          .profile-main {
            grid-column:
              1 / -1;
          }
        }

        @media (max-width: 820px) {
          .sidebar {
            width: 72px;

            padding: 20px 8px;
          }

          .brand {
            justify-content: center;

            padding:
              2px 0 25px;
          }

          .brand-text {
            display: none;
          }

          .nav-label {
            display: none;
          }

          .nav-item {
            justify-content: center;

            padding:
              12px 7px;
          }

          .nav-item span {
            display: none;
          }

          .nav-item.active::before {
            left: -8px;
          }

          .sidebar-user {
            justify-content: center;

            padding: 7px;
          }

          .sidebar-user-info {
            display: none;
          }

          .main {
            margin-left: 72px;
          }

          .content {
            padding:
              24px 18px 40px;
          }

          .dashboard-grid,
          .lower-grid {
            grid-template-columns: 1fr;
          }

          .profile-card {
            grid-template-columns: 1fr;
          }

          .profile-main {
            grid-column: auto;
          }

          .profile-stat {
            border-left: none;

            border-top:
              1px solid #edf0f4;

            padding:
              13px 0 0;
          }
        }

        @media (max-width: 580px) {
          .header {
            height: 62px;

            padding: 0 13px;
          }

          .search {
            display: none;
          }

          .header-profile-text,
          .header-arrow {
            display: none;
          }

          .content {
            padding:
              20px 13px 35px;
          }

          .welcome-row {
            align-items: flex-start;

            flex-direction: column;

            gap: 7px;
          }

          .welcome-title {
            font-size: 23px;
          }

          .profile-main {
            align-items: flex-start;

            flex-direction: column;
          }

          .course-list {
            grid-template-columns: 1fr;
          }

          .ai-tutor {
            align-items: flex-start;

            flex-direction: column;
          }

          .ai-button {
            width: 100%;
          }
        }
      `}</style>

      {/* ==============================
          SIDEBAR
      ============================== */}

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            E
          </div>

          <div className="brand-text">
            <div className="brand-name">
              edu<span>nexus.ai</span>
            </div>

            <div className="brand-caption">
              AI LEARNING PLATFORM
            </div>
          </div>
        </div>

        <div className="nav-section">
          <div className="nav-label">
            Workspace
          </div>

          <button
            className="nav-item active"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            <div className="nav-icon">
              ⌂
            </div>

            <span>
              Dashboard
            </span>
          </button>

          <button
            className="nav-item"
            onClick={() =>
              navigate("/courses")
            }
          >
            <div className="nav-icon">
              ▣
            </div>

            <span>
              My Courses
            </span>
          </button>

          <button
            className="nav-item"
            onClick={() =>
              navigate("/learning")
            }
          >
            <div className="nav-icon">
              ◫
            </div>

            <span>
              Learning Path
            </span>
          </button>

          <button
            className="nav-item"
            onClick={() =>
              navigate("/assignments")
            }
          >
            <div className="nav-icon">
              ✓
            </div>

            <span>
              Assignments
            </span>
          </button>

          <button
            className="nav-item"
            onClick={() =>
              navigate("/ai-tutor")
            }
          >
            <div className="nav-icon">
              ✦
            </div>

            <span>
              AI Tutor
            </span>
          </button>
        </div>

        <div className="sidebar-bottom">
          <div className="nav-section">
            <div className="nav-label">
              Account
            </div>

            <button
              className="nav-item"
              onClick={() =>
                navigate("/profile")
              }
            >
              <div className="nav-icon">
                ⚙
              </div>

              <span>
                Profile & Settings
              </span>
            </button>

            <button
              className="nav-item"
              onClick={logout}
            >
              <div className="nav-icon">
                ⇥
              </div>

              <span>
                Log Out
              </span>
            </button>
          </div>

          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {initials}
            </div>

            <div className="sidebar-user-info">
              <div className="sidebar-user-name">
                {loadingProfile
                  ? "Loading..."
                  : studentName}
              </div>

              <div className="sidebar-user-role">
                {studentRole}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ==============================
          MAIN
      ============================== */}

      <main className="main">
        <header className="header">
          <div className="search">
            <span className="search-icon">
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search your learning..."
            />
          </div>

          <button
            className="header-icon"
            type="button"
            aria-label="Notifications"
          >
            ♧

            <span className="notification-dot" />
          </button>

          <div
            className="header-profile"
            onClick={() =>
              navigate("/profile")
            }
          >
            <div className="header-avatar">
              {initials}
            </div>

            <div className="header-profile-text">
              <div className="header-name">
                {loadingProfile
                  ? "Loading..."
                  : studentName}
              </div>

              <div className="header-role">
                {studentRole}
              </div>
            </div>

            <div className="header-arrow">
              ▼
            </div>
          </div>
        </header>

        <div className="content">
          {/* ==============================
              WELCOME
          ============================== */}

          <div className="welcome-row">
            <div>
              <div className="welcome-label">
                Student Dashboard
              </div>

              <h1 className="welcome-title">
                Welcome back, {studentName}.
              </h1>

              <p className="welcome-subtitle">
                Keep learning, stay consistent,
                and build your skills.
              </p>
            </div>

            <div className="platform-label">
              EduNexus AI Learning Platform
            </div>
          </div>

          {/* ==============================
              PROFILE SUMMARY
          ============================== */}

          <section className="profile-card">
            <div className="profile-main">
              <div className="profile-avatar">
                {initials}
              </div>

              <div>
                <h2 className="profile-name">
                  {studentName}
                </h2>

                <div className="profile-role">
                  EduNexus AI Member ·{" "}
                  {studentRole}
                </div>

                <div className="profile-email">
                  {studentEmail ||
                    "Student account"}
                </div>

                <button
                  className="edit-button"
                  onClick={() =>
                    navigate("/profile")
                  }
                >
                  Edit Profile
                </button>
              </div>
            </div>

            <div className="profile-stat">
              <div className="stat-label">
                Current Course
              </div>

              <div className="stat-value">
                Python
              </div>

              <div className="stat-description">
                Programming
              </div>
            </div>

            <div className="profile-stat">
              <div className="stat-label">
                Course Completion
              </div>

              <div className="stat-value">
                {courseProgress}%
              </div>

              <div className="stat-description">
                Overall progress
              </div>
            </div>
          </section>

          {/* ==============================
              DASHBOARD CARDS
          ============================== */}

          <div className="dashboard-grid">
            {/* LEARNING PROGRESS */}

            <section className="card progress-card">
              <div className="card-header">
                <h2 className="card-title">
                  Learning Progress
                </h2>
              </div>

              <div
                className="progress-ring"
                style={{
                  background:
                    `conic-gradient(
                      #2563eb
                      ${courseProgress}%,
                      #e8edf3
                      ${courseProgress}% 100%
                    )`,
                }}
              >
                <div className="progress-number">
                  {courseProgress}%
                </div>
              </div>

              <div className="progress-course">
                Python Programming
              </div>

              <div className="progress-description">
                Overall course completion
              </div>
            </section>

            {/* COURSES */}

            <section className="card">
              <div className="card-header">
                <h2 className="card-title">
                  Current Courses
                </h2>

                <button
                  className="card-link"
                  onClick={() =>
                    navigate("/courses")
                  }
                >
                  View all
                </button>
              </div>

              <div className="course-list">
                <div
                  className="course"
                  onClick={() =>
                    navigate("/learning")
                  }
                >
                  <div className="course-top">
                    🐍
                  </div>

                  <div className="course-body">
                    <h3 className="course-title">
                      Python Programming
                    </h3>

                    <p className="course-description">
                      From programming basics to
                      practical Python.
                    </p>

                    <div className="course-progress">
                      <div
                        className="course-progress-fill"
                        style={{
                          width:
                            `${courseProgress}%`,
                        }}
                      />
                    </div>

                    <div className="course-percent">
                      {courseProgress}%
                      {" "}
                      complete
                    </div>
                  </div>
                </div>

                <div
                  className="course"
                  onClick={() =>
                    navigate("/ai-tutor")
                  }
                >
                  <div className="course-top">
                    ✦
                  </div>

                  <div className="course-body">
                    <h3 className="course-title">
                      AI Learning Assistant
                    </h3>

                    <p className="course-description">
                      Get explanations and guidance
                      while studying.
                    </p>

                    <div className="course-progress">
                      <div
                        className="course-progress-fill"
                        style={{
                          width:
                            aiQuestions > 0
                              ? "100%"
                              : "8%",
                        }}
                      />
                    </div>

                    <div className="course-percent">
                      {aiQuestions}
                      {" "}
                      questions
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ACHIEVEMENTS */}

            <section className="card">
              <div className="card-header">
                <h2 className="card-title">
                  Achievements
                </h2>
              </div>

              <div className="achievement-list">
                <div className="achievement">
                  <div className="achievement-icon">
                    ★
                  </div>

                  <div className="achievement-name">
                    Getting
                    <br />
                    Started
                  </div>

                  <div className="achievement-status">
                    Earned
                  </div>
                </div>

                <div className="achievement">
                  <div className="achievement-icon">
                    ✓
                  </div>

                  <div className="achievement-name">
                    Course
                    <br />
                    Explorer
                  </div>

                  <div className="achievement-status">
                    Earned
                  </div>
                </div>

                <div className="achievement">
                  <div className="achievement-icon">
                    ◇
                  </div>

                  <div className="achievement-name">
                    AI
                    <br />
                    Learner
                  </div>

                  <div className="achievement-status">
                    Active
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* ==============================
              LOWER SECTION
          ============================== */}

          <div className="lower-grid">
            {/* RECOMMENDATIONS */}

            <section className="card">
              <div className="card-header">
                <h2 className="card-title">
                  Course Recommendations
                </h2>

                <button
                  className="card-link"
                  onClick={() =>
                    navigate("/courses")
                  }
                >
                  See all
                </button>
              </div>

              <div
                className="recommendation"
                onClick={() =>
                  navigate("/courses")
                }
              >
                <div className="recommendation-icon">
                  AI
                </div>

                <div>
                  <h3>
                    AI & Machine Learning
                  </h3>

                  <p>
                    Explore the fundamentals of
                    artificial intelligence.
                  </p>

                  <span className="recommendation-tag">
                    Recommended for you
                  </span>
                </div>
              </div>

              <div
                className="recommendation"
                onClick={() =>
                  navigate("/courses")
                }
              >
                <div className="recommendation-icon">
                  &lt;/&gt;
                </div>

                <div>
                  <h3>
                    Web Development
                  </h3>

                  <p>
                    Learn how modern web
                    applications are created.
                  </p>

                  <span className="recommendation-tag">
                    Explore course
                  </span>
                </div>
              </div>
            </section>

            {/* ACTIVITY */}

            <section className="card">
              <div className="card-header">
                <h2 className="card-title">
                  Learning Activity
                </h2>
              </div>

              <div className="activity-item">
                <div className="activity-icon">
                  ✓
                </div>

                <div>
                  <div className="activity-title">
                    Course Progress
                  </div>

                  <div className="activity-text">
                    Python Programming ·{" "}
                    {courseProgress}%
                    {" "}
                    completed
                  </div>
                </div>
              </div>

              <div className="activity-item">
                <div className="activity-icon">
                  □
                </div>

                <div>
                  <div className="activity-title">
                    Assignments
                  </div>

                  <div className="activity-text">
                    {assignmentsCompleted}
                    {" "}
                    of{" "}
                    {totalAssignments}
                    {" "}
                    completed
                  </div>
                </div>
              </div>

              <div className="activity-item">
                <div className="activity-icon">
                  AI
                </div>

                <div>
                  <div className="activity-title">
                    AI Tutor
                  </div>

                  <div className="activity-text">
                    {aiQuestions}
                    {" "}
                    questions asked
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* ==============================
              AI TUTOR
          ============================== */}

          <section className="ai-tutor">
            <div className="ai-content">
              <div className="ai-icon">
                ✦
              </div>

              <div>
                <h2 className="ai-title">
                  Need help with your learning?
                </h2>

                <p className="ai-description">
                  Ask EduNexus AI Tutor about
                  Python, lessons, assignments,
                  or concepts.
                </p>
              </div>
            </div>

            <button
              className="ai-button"
              onClick={() =>
                navigate("/ai-tutor")
              }
            >
              Open AI Tutor
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;