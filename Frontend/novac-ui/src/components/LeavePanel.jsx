import { useEffect, useState } from "react";

export default function LeavePanel() {
  const [myLeaves, setMyLeaves] = useState([]);
  const [managerLeaves, setManagerLeaves] = useState([]);
  const [adminLeaves, setAdminLeaves] = useState([]);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // ✅ SAFE DATA LOAD (FIXED)
  const loadData = async () => {
    // MY LEAVES
    const my = await fetch("http://localhost:5255/api/leave/my", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (my.ok) {
      const text = await my.text();
      setMyLeaves(text ? JSON.parse(text) : []);
    } else {
      setMyLeaves([]);
    }

    // MANAGER
    if (role === "Manager") {
      const res = await fetch("http://localhost:5255/api/leave/manager", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const text = await res.text();
        setManagerLeaves(text ? JSON.parse(text) : []);
      } else {
        setManagerLeaves([]);
      }
    }

    // ADMIN
    if (role === "Admin") {
      const res = await fetch("http://localhost:5255/api/leave/admin", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const text = await res.text();
        setAdminLeaves(text ? JSON.parse(text) : []);
      } else {
        setAdminLeaves([]);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ✅ REQUEST LEAVE
  const requestLeave = async () => {
    const res = await fetch("http://localhost:5255/api/leave/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        FromDate: fromDate,
        ToDate: toDate,
        Reason: reason
      })
    });

    const text = await res.text();

    if (!res.ok) {
      alert(text);
      return;
    }

    setFromDate("");
    setToDate("");
    setReason("");

    loadData();
  };

  const managerAction = async (id, action) => {
    await fetch(
      `http://localhost:5255/api/leave/manager-action?id=${id}&action=${action}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    loadData();
  };

  const adminAction = async (id, action) => {
    await fetch(
      `http://localhost:5255/api/leave/admin-action?id=${id}&action=${action}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    loadData();
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Leave Management</h3>

      {/* REQUEST */}
      <div style={styles.card}>
        <h4>Request Leave</h4>

        <div style={styles.row}>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />

          <input
            placeholder="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          <button style={styles.primary} onClick={requestLeave}>
            Request
          </button>
        </div>
      </div>

      {/* MY LEAVES */}
      <div style={styles.card}>
        <h4>My Leaves</h4>

        {myLeaves.map((l) => (
          <div key={l.id} style={styles.item}>
            <span>
              {l.fromDate} → {l.toDate}
            </span>
            <span style={styles.status}>{l.status}</span>
          </div>
        ))}
      </div>

      {/* MANAGER */}
      {role === "Manager" && (
        <div style={styles.card}>
          <h4>Pending Approvals</h4>

          {managerLeaves.map((l) => (
            <div key={l.id} style={styles.item}>
              <span>{l.userEmail}</span>

              <div>
                <button
                  style={styles.success}
                  onClick={() => managerAction(l.id, "approve")}
                >
                  Approve
                </button>

                <button
                  style={styles.danger}
                  onClick={() => managerAction(l.id, "reject")}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADMIN */}
      {role === "Admin" && (
        <div style={styles.card}>
          <h4>Final Approval</h4>

          {adminLeaves.map((l) => (
            <div key={l.id} style={styles.item}>
              <span>{l.userEmail}</span>

              <div>
                <button
                  style={styles.success}
                  onClick={() => adminAction(l.id, "approve")}
                >
                  Approve
                </button>

                <button
                  style={styles.danger}
                  onClick={() => adminAction(l.id, "reject")}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },
  title: {
    marginBottom: "10px"
  },
  card: {
    background: "#fff",
    padding: "15px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  },
  row: {
    display: "flex",
    gap: "10px"
  },
  item: {
    display: "flex",
    justifyContent: "space-between",
    padding: "5px 0"
  },
  status: {
    fontWeight: "bold",
    color: "#6366f1"
  },
  primary: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "5px 10px",
    borderRadius: "6px"
  },
  success: {
    background: "#16a34a",
    color: "#fff",
    border: "none",
    marginRight: "5px",
    padding: "5px 10px",
    borderRadius: "6px"
  },
  danger: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "5px 10px",
    borderRadius: "6px"
  }
};