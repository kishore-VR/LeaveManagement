import { useEffect, useState } from "react";

export default function TeamForm({ refresh }) {

  const [teamName, setTeamName] = useState("");
  const [managerEmail, setManagerEmail] = useState("");

  const [members, setMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState("");

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role")?.toLowerCase();

  // ✅ Extract email from JWT
  const getEmailFromToken = () => {
    if (!token) return "";

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
    } catch {
      return "";
    }
  };

  const loggedInEmail = getEmailFromToken();

  const loadUsers = async () => {
    const res = await fetch("http://localhost:5255/api/user/all", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const text = await res.text();
const data = text ? JSON.parse(text) : [];
setUsers(data);
  };

  useEffect(() => {
    loadUsers();

    // ✅ Auto-assign manager if logged in as manager
    if (role === "manager") {
      setManagerEmail(loggedInEmail);
    }

  }, []);

  const handleAddMember = () => {
    if (!selectedEmail) return;

    const selectedUser = users.find(u => u.email === selectedEmail);
    if (!selectedUser) return;

    if (members.some(m => m.email === selectedUser.email)) return;

    setMembers([
      ...members,
      {
        name: selectedUser.fullName,
        email: selectedUser.email,
        expertise: "General"
      }
    ]);

    setSelectedEmail("");
  };

  const removeMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const clearForm = () => {
    setTeamName("");

    if (role === "manager") {
      setManagerEmail(loggedInEmail); // ✅ maintain manager
    } else {
      setManagerEmail("");
    }

    setMembers([]);
    setSelectedEmail("");
  };

  const createTeam = async () => {
    if (!teamName) return alert("Team name required");
    if (!managerEmail) return alert("Select manager");

    await fetch("http://localhost:5255/api/team", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        teamName,
        managerEmail,
        members
      })
    });

    clearForm();
    refresh();
  };

  return (
    <div style={styles.card}>

      <h3 style={styles.title}>Create Team</h3>

      <input
        style={styles.input}
        placeholder="Team Name"
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
      />

      <div>
        <label style={styles.label}>Select Manager</label>

        <select
          value={managerEmail}
          onChange={(e) => setManagerEmail(e.target.value)}
          style={styles.input}
          disabled={role === "manager"} // ✅ lock for manager
        >
          <option value="">-- Select Manager --</option>

          {/* ✅ Show logged-in manager */}
          {role === "manager" && (
            <option value={loggedInEmail}>
              {loggedInEmail}
            </option>
          )}

          {/* ✅ Admin sees only managers */}
          {users
            .filter(u => u.role.toLowerCase() === "manager")
            .map(u => (
              <option key={u.email} value={u.email}>
                {u.fullName}
              </option>
            ))}
        </select>
      </div>

      <h4 style={styles.subtitle}>Add Members</h4>

      <div style={styles.row}>
        <select
          value={selectedEmail}
          onChange={(e) => setSelectedEmail(e.target.value)}
          style={styles.input}
        >
          <option value="">-- Select User --</option>

          {users.map(u => (
            <option key={u.email} value={u.email}>
              {u.fullName}
            </option>
          ))}
        </select>

        <button style={styles.primary} onClick={handleAddMember}>
          Add
        </button>
      </div>

      <div>
        {members.map((m, index) => (
          <div key={index} style={styles.memberRow}>
            <span>{m.name}</span>
            <button style={styles.danger} onClick={() => removeMember(index)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      <button style={styles.createBtn} onClick={createTeam}>
        Create Team
      </button>

      <button style={styles.clearBtn} onClick={clearForm}>
        Clear
      </button>

    </div>
  );
}

const styles = {
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    marginTop: "15px"
  },

  title: {
    marginBottom: "10px"
  },

  subtitle: {
    marginTop: "15px",
    marginBottom: "5px"
  },

  label: {
    fontSize: "14px",
    marginBottom: "5px",
    display: "block"
  },

  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "6px",
    border: "1px solid #ddd"
  },

  row: {
    display: "flex",
    gap: "10px"
  },

  memberRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px",
    borderBottom: "1px solid #eee"
  },

  primary: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px"
  },

  danger: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "4px 8px",
    borderRadius: "6px"
  },

  createBtn: {
    marginTop: "15px",
    width: "100%",
    padding: "10px",
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "6px"
  },

  clearBtn: {
    marginTop: "8px",
    width: "100%",
    padding: "8px",
    background: "#9ca3af",
    color: "#fff",
    border: "none",
    borderRadius: "6px"
  }
};