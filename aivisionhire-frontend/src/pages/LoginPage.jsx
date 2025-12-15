// src/pages/LoginPage.jsx
import React, { useState } from "react";
import authApi from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";


const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await authApi.login(form);
      const { token, user } = res.data;
      login(user, token);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>AIVisionHire Login</h1>
        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button style={styles.button} type="submit" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
          <p style={{ marginTop: 12, fontSize: 14, textAlign: "center" }}>
  Don&apos;t have an account?{" "}
  <Link to="/register" style={{ color: "#60a5fa", textDecoration: "none", fontWeight: 600 }}>
    Register
  </Link>
</p>

        </form>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0f172a",
    color: "#fff",
  },
  card: {
    width: "100%",
    maxWidth: 400,
    background: "#1f2937",
    padding: 24,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 16,
    textAlign: "center",
  },
  errorBox: {
    marginBottom: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#b91c1c",
  },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  field: { display: "flex", flexDirection: "column", gap: 4 },
  label: { fontSize: 14 },
  input: {
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid #4b5563",
    background: "#020617",
    color: "#e5e7eb",
  },
  button: {
    marginTop: 8,
    padding: "10px 12px",
    borderRadius: 8,
    border: "none",
    background: "#4f46e5",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
  },
};

export default LoginPage;
