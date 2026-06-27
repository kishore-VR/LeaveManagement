import { useState } from "react";

export default function Signup({ onSignup }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    domain: "Engineering"
  });

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    // ✅ VALIDATION
    if (!form.fullName || !form.email || !form.password) {
      return setMsg("❌ All fields are required");
    }

    if (!form.email.includes("@")) {
      return setMsg("❌ Invalid email");
    }

    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("http://localhost:5255/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...form,
          roleName: "User" // ✅ FORCE DEFAULT ROLE
        })
      });

      if (!res.ok) {
        const error = await res.text();
        setMsg("❌ " + error);
        setLoading(false);
        return;
      }

      setMsg("✅ Account created as USER");

      setTimeout(() => {
        onSignup();
      }, 500);

    } catch {
      setMsg("❌ Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>

      <h3>Create Account</h3>

      <input
        style={styles.input}
        placeholder="Full Name"
        value={form.fullName}
        onChange={(e) =>
          setForm({ ...form, fullName: e.target.value })
        }
      />

      <input
        style={styles.input}
        type="email"
        placeholder="Email (case-sensitive)"
        value={form.email}
        onChange={(e) =>
          setForm({ ...form, email: e.target.value })
        }
      />

      <input
        style={styles.input}
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) =>
          setForm({ ...form, password: e.target.value })
        }
      />

      <input
        style={styles.input}
        placeholder="Domain"
        value={form.domain}
        onChange={(e) =>
          setForm({ ...form, domain: e.target.value })
        }
      />

      {/* ✅ ROLE INFO ONLY */}
      <p style={styles.note}>
        Default role: <strong>User</strong>  
        (You can request Manager/Admin access after signup)
      </p>

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
    fontWeight: "600"
  },

  message: {
    textAlign: "center",
    fontSize: "13px"
  },

  note: {
    fontSize: "12px",
    color: "#555"
  }
};