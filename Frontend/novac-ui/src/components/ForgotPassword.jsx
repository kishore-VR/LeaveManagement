import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgot = async () => {
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch(
        `http://localhost:5255/api/auth/forgot-password?email=${email}`,
        {
          method: "POST"
        }
      );

      if (res.ok) {
        setMsg("✅ Reset email sent");
      } else {
        setMsg("❌ Failed to send reset email");
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
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button
        style={{
          ...styles.button,
          opacity: loading ? 0.7 : 1
        }}
        onClick={handleForgot}
        disabled={loading}
      >
        {loading ? "Sending..." : "Send Reset Link"}
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
    fontSize: "14px"
  },
  button: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #4f46e5, #9333ea)",
    color: "#fff",
    fontSize: "14px"
  },
  message: {
    textAlign: "center",
    fontSize: "13px"
  }
};