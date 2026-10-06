function Sidebar() {
  return (
    <div
      style={{
        width: "250px",
        minHeight: "100vh",
        background: "black",
        color: "white",
        padding: "30px",
        boxSizing: "border-box",
      }}
    >
      <h2>EduNexus AI</h2>

      <p>🏠 Dashboard</p>
      <p>📚 Courses</p>
      <p>📝 Assignments</p>
      <p>🤖 AI Tutor</p>
      <p>📊 Analytics</p>
      <p>⚙️ Settings</p>
    </div>
  );
}

export default Sidebar;