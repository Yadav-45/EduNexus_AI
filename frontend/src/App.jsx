import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/login";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";

import Users from "./pages/Students/Users";
import Students from "./pages/Students";
import Student360 from "./pages/Student360";

import Parents from "./pages/Parents";
import Attendance from "./pages/Attendance";

import Admissions from "./pages/Admissions";
import NewAdmission from "./pages/NewAdmission";
import AdmissionDetails from "./pages/AdmissionDetails";
import EditAdmission from "./pages/EditAdmission";

import Fees from "./pages/Fees";
import FeeAccountDetails from "./pages/FeeAccountDetails";

import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import Learning from "./pages/Learning";
import Assignments from "./pages/Assignments";

import AITutor from "./pages/AITutor";

import Profile from "./pages/Profile";
import Accounting from "./pages/Accounting";

import InventoryDashboard from "./pages/Inventory/InventoryDashboard";

import Communication from "./pages/Communication";
import Documents from "./pages/Documents_FIXED";
import Analytics from "./pages/Analytics";

import Staff from "./pages/Staff";
import NewStaff from "./pages/Staff/NewStaff";
import StaffDetails from "./pages/Staff/StaffDetails";
import EditStaff from "./pages/Staff/EditStaff";
import StaffAttendance from "./pages/Staff/StaffAttendance";
import StaffLeave from "./pages/Staff/StaffLeave";
import StaffPayroll from "./pages/Staff/StaffPayroll";
import PayrollReports from "./pages/Staff/PayrollReports";
import Payslip from "./pages/Staff/Payslip";
import StaffPerformance from "./pages/Staff/StaffPerformance";

import Exam from "./pages/Academic/Exam";
import ExamPapers from "./pages/Academic/Exampapers";
import ExamResults from "./pages/Academic/ExamResults";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ==================== PUBLIC ==================== */}

        {/* Root URL now goes to login */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Login page */}
        <Route
          path="/login"
          element={<Login />}
        />


        {/* ==================== MAIN DASHBOARDS ==================== */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/owner-dashboard"
          element={
            <ProtectedRoute>
              <OwnerDashboard />
            </ProtectedRoute>
          }
        />


        {/* ==================== USERS ==================== */}

        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />


        {/* ==================== STUDENTS ==================== */}

        <Route
          path="/students"
          element={
            <ProtectedRoute>
              <Students />
            </ProtectedRoute>
          }
        />

        <Route
          path="/students/:id"
          element={
            <ProtectedRoute>
              <Student360 />
            </ProtectedRoute>
          }
        />


        {/* ==================== PARENTS ==================== */}

        <Route
          path="/parents"
          element={
            <ProtectedRoute>
              <Parents />
            </ProtectedRoute>
          }
        />


        {/* ==================== ATTENDANCE ==================== */}

        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <Attendance />
            </ProtectedRoute>
          }
        />


        {/* ==================== ADMISSIONS ==================== */}

        <Route
          path="/admissions"
          element={
            <ProtectedRoute>
              <Admissions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admissions/new"
          element={
            <ProtectedRoute>
              <NewAdmission />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admissions/:id"
          element={
            <ProtectedRoute>
              <AdmissionDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admissions/:id/edit"
          element={
            <ProtectedRoute>
              <EditAdmission />
            </ProtectedRoute>
          }
        />


        {/* ==================== FEES ==================== */}

        <Route
          path="/fees"
          element={
            <ProtectedRoute>
              <Fees />
            </ProtectedRoute>
          }
        />

        <Route
          path="/fees/:id"
          element={
            <ProtectedRoute>
              <FeeAccountDetails />
            </ProtectedRoute>
          }
        />


        {/* ==================== COURSES ==================== */}

        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <Courses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/courses/:id"
          element={
            <ProtectedRoute>
              <CourseDetails />
            </ProtectedRoute>
          }
        />


        {/* ==================== LEARNING ==================== */}

        <Route
          path="/learning"
          element={
            <ProtectedRoute>
              <Learning />
            </ProtectedRoute>
          }
        />


        {/* ==================== ASSIGNMENTS ==================== */}

        <Route
          path="/assignments"
          element={
            <ProtectedRoute>
              <Assignments />
            </ProtectedRoute>
          }
        />


        {/* ==================== AI TUTOR ==================== */}

        <Route
          path="/ai-tutor"
          element={
            <ProtectedRoute>
              <AITutor />
            </ProtectedRoute>
          }
        />


        {/* ==================== PROFILE ==================== */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />


        {/* ==================== ACCOUNTING ==================== */}

        <Route
          path="/accounting"
          element={
            <ProtectedRoute>
              <Accounting />
            </ProtectedRoute>
          }
        />


        {/* ==================== INVENTORY ==================== */}

        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <InventoryDashboard />
            </ProtectedRoute>
          }
        />


        {/* ==================== COMMUNICATION ==================== */}

        <Route
          path="/communication"
          element={
            <ProtectedRoute>
              <Communication />
            </ProtectedRoute>
          }
        />


        {/* ==================== DOCUMENTS ==================== */}

        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <Documents />
            </ProtectedRoute>
          }
        />


        {/* ==================== ANALYTICS ==================== */}

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />


        {/* ==================== STAFF ==================== */}

        <Route
          path="/staff"
          element={
            <ProtectedRoute>
              <Staff />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/new"
          element={
            <ProtectedRoute>
              <NewStaff />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/:id"
          element={
            <ProtectedRoute>
              <StaffDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/:id/edit"
          element={
            <ProtectedRoute>
              <EditStaff />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff-attendance"
          element={
            <ProtectedRoute>
              <StaffAttendance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff-leave"
          element={
            <ProtectedRoute>
              <StaffLeave />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff-payroll"
          element={
            <ProtectedRoute>
              <StaffPayroll />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payroll-reports"
          element={
            <ProtectedRoute>
              <PayrollReports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payslip/:id"
          element={
            <ProtectedRoute>
              <Payslip />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff-performance"
          element={
            <ProtectedRoute>
              <StaffPerformance />
            </ProtectedRoute>
          }
        />


        {/* ==================== ACADEMICS ==================== */}

        <Route
          path="/academic/exams"
          element={
            <ProtectedRoute>
              <Exam />
            </ProtectedRoute>
          }
        />

        <Route
          path="/academic/exam-papers"
          element={
            <ProtectedRoute>
              <ExamPapers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/academic/exam-results"
          element={
            <ProtectedRoute>
              <ExamResults />
            </ProtectedRoute>
          }
        />


        {/* ==================== FALLBACK ==================== */}

        {/* Unknown URLs go to login instead of creating a redirect loop */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;