import { useNavigate } from "react-router-dom";
import Login from "../components/Login";

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      
      <div style={styles.card}>
        
        <h1 style={styles.title}>Novac</h1>
        <p style={styles.subtitle}>Team Management Platform</p>

        <Login onLogin={() => navigate("/dashboard")} />

        <div style={styles.links}>
          <span onClick={() => navigate("/signup")} style={styles.link}>
            Create Account
          </span>

          <span style={styles.divider}>•</span>

          <span onClick={() => navigate("/forgot-password")} style={styles.link}>
            Forgot Password
          </span>
        </div>

      </div>

    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #4f46e5, #9333ea)",
  },

  card: {
    width: "380px",
    padding: "32px",
    borderRadius: "16px",
    background: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(14px)",
    border: "1px solid rgba(255,255,255,0.3)",
    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
    textAlign: "center",
    color: "#fff"
  },

  title: {
    fontSize: "32px",
    fontWeight: "700",
    marginBottom: "6px",
    letterSpacing: "1px"
  },

  subtitle: {
    fontSize: "14px",
    marginBottom: "24px",
    opacity: 0.85
  },

  links: {
    marginTop: "18px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    fontSize: "13px"
  },

  link: {
    cursor: "pointer",
    textDecoration: "underline",
    opacity: 0.9
  },

  divider: {
    opacity: 0.6
  }
};