import { useEffect, useState } from "react";

export default function TeamList({ reload }) {
  const [teams, setTeams] = useState([]);
  const [editingTeam, setEditingTeam] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState("");

  // ✅ FIX ROLE (CASE INSENSITIVE)
  const role = localStorage.getItem("role")?.toLowerCase();
  const token = localStorage.getItem("token");

  // ✅ LOAD TEAMS
  const loadTeams = async () => {
    const res = await fetch("http://localhost:5255/api/team", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setTeams(data);
  };

  const loadUsers = async () => {
  try {
    // ✅ Skip for user role (optimization)
    if (role === "user") {
      setUsers([]);
      return;
    }

    const res = await fetch("http://localhost:5255/api/user/all", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // ✅ Read as text FIRST (this is the key fix)
    const text = await res.text();

    // ✅ If empty → don't parse
    if (!text) {
      console.log("Empty response from API");
      setUsers([]);
      return;
    }

    // ✅ Try parsing safely
    const data = JSON.parse(text);
    setUsers(data);

  } catch (err) {
    console.log("Error loading users:", err);
    setUsers([]);
  }
};
  useEffect(() => {
    loadTeams();
    loadUsers();
  }, [reload]);

  // ✅ DELETE TEAM
  const deleteTeam = async (team) => {
    if (!window.confirm(`Delete team "${team.teamName}"?`)) return;

    await fetch(`http://localhost:5255/api/team/${team.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    loadTeams();
  };

  // ✅ UPDATE TEAM
  const updateTeam = async () => {
    if (!editingTeam?.teamName) return alert("Team name required");

    await fetch(`http://localhost:5255/api/team/${editingTeam.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(editingTeam)
    });

    setEditingTeam(null);
    loadTeams();
  };

  // ✅ ADD MEMBER
  const addMember = async (teamId) => {
    if (!selectedEmail) return alert("Select user");

    const selectedUser = users.find(u => u.email === selectedEmail);

    await fetch(`http://localhost:5255/api/team/${teamId}/members`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: selectedUser.fullName,
        expertise: "General"
      })
    });

    setSelectedEmail("");
    loadTeams();
  };

  // ✅ UPDATE MEMBER
  const updateMember = async () => {
    if (!editingMember?.name) return alert("Name required");

    await fetch(`http://localhost:5255/api/team/members/${editingMember.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(editingMember)
    });

    setEditingMember(null);
    loadTeams();
  };

  // ✅ DELETE MEMBER
  const deleteMember = async (member) => {
    if (!window.confirm(`Remove ${member.name}?`)) return;

    await fetch(`http://localhost:5255/api/team/members/${member.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    loadTeams();
  };

  return (
    <div>
      <h3>Your Teams</h3>

      {teams.length === 0 && <p>No teams yet</p>}

      {teams.map((team) => (
        <div key={team.id} style={styles.card}>

          {/* ✅ TEAM HEADER */}
          <div style={styles.header}>
            {editingTeam?.id === team.id ? (
              <input
                value={editingTeam.teamName}
                onChange={(e) =>
                  setEditingTeam({ ...editingTeam, teamName: e.target.value })
                }
              />
            ) : (
              <h4>{team.teamName}</h4>
            )}

            {/* ✅ FIXED ROLE CHECK */}
            {(role === "admin" || role === "manager") && (
              <div style={styles.btnGroup}>
                <button style={styles.editBtn} onClick={() => setEditingTeam(team)}>
                  Edit
                </button>

                <button
                  style={styles.saveBtn}
                  onClick={updateTeam}
                  disabled={editingTeam?.id !== team.id}
                >
                  Save
                </button>

                <button style={styles.deleteBtn} onClick={() => deleteTeam(team)}>
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* ✅ MEMBERS */}
          <div style={styles.members}>
            {team.members.length === 0 && <p>No members</p>}

            {team.members.map((member) => (
              <div key={member.id} style={styles.member}>

                {editingMember?.id === member.id ? (
                  <>
                    <input
                      value={editingMember.name}
                      onChange={(e) =>
                        setEditingMember({ ...editingMember, name: e.target.value })
                      }
                    />

                    <input
                      value={editingMember.expertise}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          expertise: e.target.value
                        })
                      }
                    />

                    <button style={styles.saveBtn} onClick={updateMember}>
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    <span>{member.name}</span>
                    <span style={styles.badge}>{member.expertise}</span>

                    {(role === "admin" || role === "manager") && (
                      <div style={styles.memberActions}>
                        <button
                          style={styles.editBtn}
                          onClick={() => setEditingMember(member)}
                        >
                          Edit
                        </button>

                        <button
                          style={styles.deleteBtnSmall}
                          onClick={() => deleteMember(member)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </>
                )}

              </div>
            ))}

            {/* ✅ ADD MEMBER */}
            {(role === "admin" || role === "manager") && (
              <div style={styles.addMember}>
                <select
                  value={selectedEmail}
                  onChange={(e) => setSelectedEmail(e.target.value)}
                >
                  <option value="">Select User</option>
                  {users.map((u) => (
                    <option key={u.email} value={u.email}>
                      {u.fullName}
                    </option>
                  ))}
                </select>

                <button style={styles.addBtn} onClick={() => addMember(team.id)}>
                  Add
                </button>
              </div>
            )}

          </div>
        </div>
      ))}
    </div>
  );
}

/* ✅ FIXED STYLES */
const styles = {
  card: {
    background: "#fff",
    padding: "15px",
    marginBottom: "15px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  btnGroup: {
    display: "flex",
    gap: "8px"
  },

  members: {
    marginTop: "10px"
  },

  member: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "6px 0",
    borderBottom: "1px solid #eee"
  },

  memberActions: {
    display: "flex",
    gap: "6px"
  },

  badge: {
    background: "#e0e7ff",
    padding: "3px 8px",
    borderRadius: "6px"
  },

  editBtn: {
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    padding: "5px 8px"
  },

  saveBtn: {
    background: "#10b981",
    color: "#fff",
    border: "none",
    padding: "5px 8px"
  },

  deleteBtn: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "5px 8px"
  },

  deleteBtnSmall: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "3px 6px"
  },

  addMember: {
    display: "flex",
    gap: "8px",
    marginTop: "10px"
  },

  addBtn: {
    background: "#2563eb",
    color: "#fff",
    padding: "5px 10px",
    border: "none"
  }
};