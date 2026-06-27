import { useEffect, useState } from "react";
import TeamForm from "./TeamForm";
import TeamList from "./TeamList";
import LeavePanel from "./LeavePanel";

export default function Dashboard() {

  // ✅ ALL STATE INSIDE COMPONENT
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState(null);

  const [pendingUsers, setPendingUsers] = useState([]);
  const [roleRequests, setRoleRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);

  const token = localStorage.getItem("token");

  // ✅ SAFE PARSER
  const safeJson = async (res) => {
    try {
      const text = await res.text();
      return text ? JSON.parse(text) : [];
    } catch {
      return [];
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  // ✅ LOAD USER
  const loadUser = async () => {
    const res = await fetch("http://localhost:5255/api/user/me", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await safeJson(res);
    setUser(data);
  };

  const loadPendingUsers = async () => {
    const res = await fetch("http://localhost:5255/api/user/pending", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await safeJson(res);
    setPendingUsers(data);
  };

  const loadRoleRequests = async () => {
    const res = await fetch("http://localhost:5255/api/user/role-requests", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await safeJson(res);
    setRoleRequests(data);
  };

  const loadMyRequests = async () => {
    const res = await fetch("http://localhost:5255/api/user/my-requests", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await safeJson(res);
    setMyRequests(data);
  };

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    if (user.role === "Admin") {
      loadPendingUsers();
      loadRoleRequests();
    }

    loadMyRequests();
  }, [user]);

  const approveUser = async (email) => {
    await fetch(`http://localhost:5255/api/user/approve?email=${email}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    loadPendingUsers();
  };

  const rejectUser = async (email) => {
    await fetch(`http://localhost:5255/api/user/reject?email=${email}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    loadPendingUsers();
  };

  const requestRole = async (role) => {
    await fetch(`http://localhost:5255/api/user/request-role?role=${role}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    loadMyRequests();
  };

  const approveRole = async (id) => {
    await fetch(`http://localhost:5255/api/user/approve-role?id=${id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    loadRoleRequests();
  };

  const rejectRole = async (id) => {
    await fetch(`http://localhost:5255/api/user/reject-role?id=${id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    loadRoleRequests();
  };

  // ✅ LOADING STATE
  if (!user) return <p style={{ textAlign: "center" }}>Loading...</p>;

  if (user.approvalStatus === "Pending") {
    return (
      <div style={styles.center}>
        <h3>Waiting for Approval</h3>
        <button style={styles.logout} onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  if (user.approvalStatus === "Rejected") {
    return (
      <div style={styles.center}>
        <h3>Request Denied</h3>
        <button style={styles.logout} onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>

      <div style={styles.header}>
        <h2>Dashboard</h2>
        <button style={styles.logout} onClick={handleLogout}>Logout</button>
      </div>

      <div style={styles.userCard}>
        <span>{user.fullName}</span>
        <span style={styles.roleTag}>{user.role}</span>
      </div>

      {user.role === "User" && (
        <div style={styles.panel}>
          <h3>Role Upgrade</h3>

          <div style={styles.btnRow}>
            <button style={styles.primary} onClick={() => requestRole("Manager")}>Request Manager</button>
            <button style={styles.secondary} onClick={() => requestRole("Admin")}>Request Admin</button>
          </div>

          <h4>Status</h4>
          {myRequests.map(r => (
            <p key={r.id}>{r.requestedRole} - {r.status}</p>
          ))}
        </div>
      )}

      {user.role === "Admin" && (
        <div style={styles.panel}>
          <h3>Pending Users</h3>

          {pendingUsers.map(u => (
            <div key={u.email} style={styles.row}>
              <span>{u.fullName}</span>

              <div style={styles.btnRow}>
                <button style={styles.success} onClick={() => approveUser(u.email)}>Approve</button>
                <button style={styles.danger} onClick={() => rejectUser(u.email)}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {user.role === "Admin" && (
        <div style={styles.panel}>
          <h3>Role Requests</h3>

          {roleRequests.map(r => (
            <div key={r.id} style={styles.row}>
              <span>{r.userEmail} → {r.requestedRole}</span>

              <div style={styles.btnRow}>
                <button style={styles.success} onClick={() => approveRole(r.id)}>Approve</button>
                <button style={styles.danger} onClick={() => rejectRole(r.id)}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(user.role === "Admin" || user.role === "Manager") && (
        <div style={styles.panel}>
          <button style={styles.primary} onClick={() => setShowForm(!showForm)}>
            {showForm ? "Close" : "Create Team"}
          </button>
          {showForm && <TeamForm refresh={() => window.location.reload()} />}
        </div>
      )}

      <div style={styles.panel}>
        <TeamList />
      </div>

      <div style={styles.panel}>
        <LeavePanel />
      </div>

    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    background: "#f3f4f6",
    minHeight: "100vh"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px"
  },
  userCard: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px",
    background: "#fff",
    borderRadius: "8px",
    marginBottom: "20px"
  },
  roleTag: {
    padding: "4px 8px",
    background: "#6366f1",
    color: "#fff",
    borderRadius: "6px"
  },
  panel: {
    background: "#fff",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "20px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px"
  },
  btnRow: {
    display: "flex",
    gap: "10px"
  },
  primary: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px"
  },
  secondary: {
    background: "#9333ea",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px"
  },
  success: {
    background: "#16a34a",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px"
  },
  danger: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: "6px"
  },
  logout: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px"
  },
  center: {
    textAlign: "center",
    marginTop: "100px"
  }
};