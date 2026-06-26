import { useNavigate } from "react-router-dom";
import Signup from "../components/Signup";

export default function SignupPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      
      <div style={styles.card}>
        
        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.subtitle}>Get started with Novac</p>

        <Signup onSignup={() => navigate("/")} />

        <p style={styles.footer}>
          Already have an account?{" "}
          <span style={styles.link} onClick={() => navigate("/")}>
            Login
          </span>
        </p>

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
    background: "linear-gradient(135deg, #4f46e5, #9333ea)"
  },
  card: {
    width: "360px",
    padding: "30px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "#fff",
    textAlign: "center"
  },
  title: {
    fontSize: "28px",
    marginBottom: "5px"
  },
  subtitle: {
    fontSize: "14px",
    marginBottom: "20px",
    opacity: 0.8
  },
  footer: {
    marginTop: "15px",
    fontSize: "13px"
  },
  link: {
    cursor: "pointer",
    textDecoration: "underline"
  }
};