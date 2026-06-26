import { useEffect, useState } from "react";
import TeamForm from "./TeamForm";
import TeamList from "./TeamList";

export default function Dashboard() {
  const [showForm, setShowForm] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div style={styles.container}>

      {/* Top Bar */}
      <div style={styles.header}>
        <h2>Dashboard</h2>
        <button style={styles.logout} onClick={handleLogout}>
          Logout
        </button>
      </div>

      <p style={styles.welcome}>Welcome 👋</p>

      {/* Create Team Button */}
      <button
        style={styles.primaryBtn}
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "Close" : "Create Team"}
      </button>

      {/* Team Form */}
      {showForm && <TeamForm refresh={() => window.location.reload()} />}

      {/* Team List */}
      <div style={{ marginTop: "20px" }}>
        <TeamList />
      </div>

    </div>
  );
}

const styles = {
  container: {
    maxWidth: "800px",
    margin: "30px auto",
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.1)"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  welcome: {
    margin: "10px 0 20px 0",
    color: "#555"
  },

  primaryBtn: {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #4f46e5, #9333ea)",
    color: "#fff",
    cursor: "pointer",
    fontSize: "14px"
  },

  logout: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "none",
    background: "#ef4444",
    color: "#fff",
    cursor: "pointer"
  }
};