import { useEffect, useState } from "react";

export default function TeamList({ reload }) {

  const [teams, setTeams] = useState([]);
  const [editingMember, setEditingMember] = useState(null);
  const [editedName, setEditedName] = useState("");

  const [editingTeamId, setEditingTeamId] = useState(null);
  const [editedTeamName, setEditedTeamName] = useState("");

  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState({});

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role")?.toLowerCase();

  const loadTeams = async () => {
    const res = await fetch("http://localhost:5255/api/team", {
      headers: { Authorization: `Bearer ${token}` }
    });
const text = await res.text();
const data = text ? JSON.parse(text) : [];
    setTeams(data);
  };

  useEffect(() => {
    loadTeams();

    fetch("http://localhost:5255/api/user/all", {
      headers: { Authorization: `Bearer ${token}` }
    })
.then(async (res) => {
  const text = await res.text();
  return text ? JSON.parse(text) : [];
})      .then(data => setAllUsers(data));

  }, [reload]);

  const deleteMember = async (id) => {
    await fetch(`http://localhost:5255/api/team/members/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    loadTeams();
  };

  const updateMember = async (id) => {
    await fetch(`http://localhost:5255/api/team/members/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name: editedName })
    });

    setEditingMember(null);
    setEditedName("");
    loadTeams();
  };

  const handleEditTeam = (team) => {
    setEditingTeamId(team.id);
    setEditedTeamName(team.teamName);
  };

  const updateTeam = async () => {
    await fetch(`http://localhost:5255/api/team/${editingTeamId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ teamName: editedTeamName })
    });

    setEditingTeamId(null);
    loadTeams();
  };

  const deleteTeam = async (id) => {
    await fetch(`http://localhost:5255/api/team/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    loadTeams();
  };

  // ✅ ADD MEMBER FUNCTION
  const addMember = async (teamId) => {
    const email = selectedUser[teamId];
    if (!email) return alert("Select user");

    const user = allUsers.find(u => u.email === email);

    const res = await fetch(`http://localhost:5255/api/team/${teamId}/members`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: user.fullName,
        email: user.email,
        expertise: "General"
      })
    });

    if (!res.ok) {
      const err = await res.text();
      alert(err);
      return;
    }

    setSelectedUser(prev => ({ ...prev, [teamId]: "" }));
    loadTeams();
  };

  // ✅ GLOBAL CHECK: ALL USERS ALREADY ASSIGNED
  const allAssignedEmails = teams.flatMap(t => t.members.map(m => m.email));

  return (
    <div style={styles.container}>

      <h3 style={styles.title}>Teams</h3>

      {teams.map(team => (
        <div key={team.id} style={styles.card}>

          <div style={styles.header}>

            {editingTeamId === team.id ? (
              <input
                value={editedTeamName}
                onChange={(e) => setEditedTeamName(e.target.value)}
              />
            ) : (
              <h4>{team.teamName}</h4>
            )}

            <div style={styles.actions}>
              {(role === "admin" || role === "manager") && (
                <>
                  {editingTeamId === team.id ? (
                    <button style={styles.saveBtn} onClick={updateTeam}>
                      Save
                    </button>
                  ) : (
                    <button style={styles.editBtn} onClick={() => handleEditTeam(team)}>
                      Edit
                    </button>
                  )}

                  <button style={styles.deleteBtn} onClick={() => deleteTeam(team.id)}>
                    Delete
                  </button>
                </>
              )}
            </div>

          </div>

          <span style={styles.managerTag}>
            Manager: {team.managerEmail}
          </span>

          <div>
            <h5>Members</h5>

            {team.members.map(m => (
              <div key={m.id} style={styles.row}>

                {editingMember === m.id ? (
                  <input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                  />
                ) : (
                  <span>{m.name}</span>
                )}

                {(role === "admin" || role === "manager") && (
                  <div style={styles.actions}>

                    {editingMember === m.id ? (
                      <button onClick={() => updateMember(m.id)}>Save</button>
                    ) : (
                      <button onClick={() => {
                        setEditingMember(m.id);
                        setEditedName(m.name);
                      }}>
                        Edit
                      </button>
                    )}

                    <button onClick={() => deleteMember(m.id)}>
                      Delete
                    </button>

                  </div>
                )}

              </div>
            ))}

            {/* ✅ ADD MEMBER UI */}
            {(role === "admin" || role === "manager") && (
              <>
                <h5>Add Member</h5>

                <div style={styles.row}>
                  <select
                    value={selectedUser[team.id] || ""}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        [team.id]: e.target.value
                      })
                    }
                  >
                    <option value="">-- Select User --</option>

                    {allUsers.map(u => (
                      <option
                        key={u.email}
                        value={u.email}
                        disabled={allAssignedEmails.includes(u.email)}
                      >
                        {allAssignedEmails.includes(u.email)
                          ? `${u.fullName} (Assigned)`
                          : u.fullName}
                      </option>
                    ))}
                  </select>

                  <button onClick={() => addMember(team.id)}>
                    Add
                  </button>
                </div>
              </>
            )}

          </div>

        </div>
      ))}

    </div>
  );
}

const styles = {
  container: {
    marginTop: "20px"
  },
  title: {
    marginBottom: "10px"
  },
  card: {
    padding: "15px",
    marginBottom: "15px",
    borderRadius: "10px",
    background: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "6px"
  },
  actions: {
    display: "flex",
    gap: "8px"
  },
  editBtn: {
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    padding: "4px 8px",
    borderRadius: "5px"
  },
  saveBtn: {
    background: "#10b981",
    color: "#fff",
    border: "none",
    padding: "4px 8px",
    borderRadius: "5px"
  },
  deleteBtn: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "4px 8px",
    borderRadius: "5px"
  },
  managerTag: {
    display: "inline-block",
    marginTop: "5px",
    fontSize: "12px",
    background: "#6366f1",
    color: "#fff",
    padding: "3px 6px",
    borderRadius: "5px"
  }
};