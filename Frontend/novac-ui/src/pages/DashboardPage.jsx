import { useNavigate } from "react-router-dom";
import Dashboard from "../components/Dashboard";

export default function DashboardPage() {
  const navigate = useNavigate();

  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div style={styles.page}>

      {/* ✅ HEADER */}
      <div style={styles.header}>
        <h2>Team Dashboard</h2>

        <div style={styles.right}>
          <span style={styles.role}>Role: {role}</span>

          <button style={styles.logoutBtn} onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {/* ✅ CONTENT */}
      <Dashboard />

    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    padding: "20px"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },

  right: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },

  role: {
    fontSize: "14px",
    background: "#e5e7eb",
    padding: "5px 10px",
    borderRadius: "6px"
  },

  logoutBtn: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer"
  }
};
