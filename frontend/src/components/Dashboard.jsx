function Dashboard() {
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/";
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        fontFamily: "Arial, sans-serif",
        background: "#f3f4f6",
      }}
    >
      <aside
        style={{
          width: "240px",
          minHeight: "100vh",
          background: "#111827",
          color: "white",
          padding: "25px 20px",
          boxSizing: "border-box",
        }}
      >
        <h2>EduNexus AI</h2>

        <div style={{ marginTop: "35px" }}>
          <div style={menuStyle}>🏠 Dashboard</div>
          <div style={menuStyle}>📚 Courses</div>
          <div style={menuStyle}>📝 Assignments</div>
          <div style={menuStyle}>🤖 AI Tutor</div>
          <div style={menuStyle}>📊 Analytics</div>
          <div style={menuStyle}>⚙️ Settings</div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            marginTop: "40px",
            width: "100%",
            padding: "12px",
            border: "none",
            borderRadius: "8px",
            background: "#dc2626",
            color: "white",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </aside>

      <main
        style={{
          flex: 1,
          padding: "40px",
          boxSizing: "border-box",
        }}
      >
        <h1>Welcome to your Dashboard 👋</h1>

        <p style={{ fontSize: "18px" }}>
          Manage your learning, courses, assignments and AI learning tools
          from here.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
            marginTop: "40px",
          }}
        >
          <div style={cardStyle}>
            <div style={{ fontSize: "35px" }}>📚</div>
            <h2>Courses</h2>
            <p>View and manage your enrolled courses.</p>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: "35px" }}>📝</div>
            <h2>Assignments</h2>
            <p>Check your assignments and deadlines.</p>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: "35px" }}>🤖</div>
            <h2>AI Tutor</h2>
            <p>Learn with your personal AI tutor.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

const menuStyle = {
  padding: "14px",
  marginBottom: "8px",
  borderRadius: "8px",
  fontSize: "16px",
};

const cardStyle = {
  background: "white",
  padding: "25px",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
};

export default Dashboard;
