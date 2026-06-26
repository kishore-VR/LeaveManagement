import { useState } from "react";
import { useNavigate } from "react-router-dom";   // ✅ IMPORTANT
import { loginUser } from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();   // ✅ navigation

  const handleLogin = async () => {
    setLoading(true);
    setMsg("");

    try {
      const data = await loginUser({ email, password });

      if (data && data.token) {
        // ✅ STORE BOTH TOKEN + ROLE
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role?.trim());

        setMsg("✅ Login successful");

        // ✅ DIRECT NAVIGATION (NO DELAY)
        navigate("/dashboard");

      } else {
        setMsg("❌ Invalid credentials");
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
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        style={styles.input}
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        style={{
          ...styles.button,
          opacity: loading ? 0.7 : 1,
          cursor: loading ? "not-allowed" : "pointer"
        }}
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
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
  }
};