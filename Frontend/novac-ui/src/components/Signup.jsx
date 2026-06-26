import { useState } from "react";

export default function Signup({ onSignup }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    roleName: "User",
    domain: "Engineering"
  });

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("http://localhost:5255/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        setMsg("✅ Account created");

        setTimeout(() => {
          onSignup();
        }, 500);
      } else {
        const error = await res.text();
        setMsg("❌ " + error);
      }
    } catch {
      setMsg("❌ Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>

      <input
        style={styles.input}
        placeholder="Full Name"
        value={form.fullName}
        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
      />

      <input
        style={styles.input}
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <input
        style={styles.input}
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <select
        style={styles.input}
        value={form.roleName}
        onChange={(e) => setForm({ ...form, roleName: e.target.value })}
      >
        <option value="User">User</option>
        <option value="Manager">Manager</option>
        <option value="Admin">Admin</option>
      </select>

      <input
        style={styles.input}
        placeholder="Domain"
        value={form.domain}
        onChange={(e) => setForm({ ...form, domain: e.target.value })}
      />

      <button
        style={{
          ...styles.button,
          opacity: loading ? 0.7 : 1,
          cursor: loading ? "not-allowed" : "pointer"
        }}
        onClick={handleSignup}
        disabled={loading}
      >
        {loading ? "Creating..." : "Sign Up"}
      </button>

      {msg && <p style={styles.message}>{msg}</p>}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    outline: "none",
    fontSize: "14px"
  },
  button: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #4f46e5, #9333ea)",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "600",
    transition: "0.3s"
  },
  message: {
    textAlign: "center",
    fontSize: "13px"
  }
};