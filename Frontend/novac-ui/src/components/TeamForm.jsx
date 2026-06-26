import { useEffect, useState } from "react";

export default function TeamForm({ refresh }) {
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState("");

  const token = localStorage.getItem("token");

  // ✅ LOAD USERS
  const loadUsers = async () => {
    try {
      const res = await fetch("http://localhost:5255/api/user/all", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      setUsers(data);
    } catch {
      console.log("Error loading users");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ✅ ADD MEMBER
  const handleAddMember = () => {
    if (!selectedEmail) return;

    const selectedUser = users.find(u => u.email === selectedEmail);
    if (!selectedUser) return;

    // ✅ prevent duplicate
    if (members.some(m => m.name === selectedUser.fullName)) {
      alert("User already added");
      return;
    }

    setMembers([
      ...members,
      {
        name: selectedUser.fullName,
        expertise: "General"
      }
    ]);

    setSelectedEmail("");
  };

  // ✅ REMOVE MEMBER
  const removeMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  // ✅ CLEAR FORM
  const clearForm = () => {
    setTeamName("");
    setMembers([]);
    setSelectedEmail("");
  };

  // ✅ CREATE TEAM
  const createTeam = async () => {
    if (!teamName) return alert("Team name required");
    if (members.length === 0) return alert("Add at least one member");

    try {
      const res = await fetch("http://localhost:5255/api/team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          teamName,
          members
        })
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
      }

      alert("✅ Team created");

      clearForm();
      refresh();
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  return (
    <div style={styles.container}>
      <h3>Create Team</h3>

      {/* ✅ TEAM NAME */}
      <input
        style={styles.input}
        placeholder="Team Name"
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
      />

      <h4>Add Members</h4>

      {/* ✅ DROPDOWN */}
      <select
        value={selectedEmail}
        onChange={(e) => setSelectedEmail(e.target.value)}
        style={styles.input}
      >
        <option value="">-- Select User --</option>
        {users.map((u) => (
          <option
            key={u.email}
            value={u.email}
            disabled={members.some(m => m.name === u.fullName)}
          >
            {u.fullName} ({u.email})
          </option>
        ))}
      </select>

      {/* ✅ ADD BUTTON */}
      <button
        style={styles.addBtn}
        onClick={handleAddMember}
        disabled={!selectedEmail}
      >
        Add Member
      </button>

      {/* ✅ MEMBER LIST */}
      {members.map((m, index) => (
        <div key={index} style={styles.memberRow}>
          <span>{m.name}</span>

          <button
            style={styles.deleteBtnSmall}
            onClick={() => removeMember(index)}
          >
            Delete
          </button>
        </div>
      ))}

      {/* ✅ ACTION BUTTONS */}
      <button
        style={styles.createBtn}
        onClick={createTeam}
        disabled={!teamName || members.length === 0}
      >
        Create Team
      </button>
     
      <button style={styles.clearBtn} onClick={clearForm}>
        Clear
      </button>
    </div>
  );
}
const styles = {
  container: {
    marginTop: "20px",
    padding: "15px",
    background: "#f9fafb",
    borderRadius: "10px"
  },

  input: {
    width: "100%",
    marginBottom: "10px",
    padding: "10px"
  },

  addBtn: {
    marginBottom: "10px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    cursor: "pointer"
  },

  memberRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "5px",
    padding: "6px",
    borderBottom: "1px solid #ddd"
  },

  deleteBtnSmall: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "4px 8px",
    cursor: "pointer"
  },

  createBtn: {
    marginTop: "10px",
    width: "100%",
    padding: "10px",
    background: "#4f46e5",
    color: "#fff",
    border: "none"
  },

  clearBtn: {
    marginTop: "10px",
    width: "100%",
    padding: "8px",
    background: "#9ca3af",
    color: "#fff",
    border: "none"
  }
};

