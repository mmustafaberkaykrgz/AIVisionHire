// src/pages/RegisterPage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authApi from "../api/authApi";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      await authApi.register(form);
      setSuccess("Registration successful. You can now login.");
      // Kısa bir bekleme sonrası direkt login sayfasına da yönlendirebilirsin:
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Registration failed. Please check the form."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create Account</h1>

        {error && <div style={styles.errorBox}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Name</label>
            <input
              style={styles.input}
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

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

          <button type="submit" style={styles.button} disabled={isLoading}>
            {isLoading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p style={styles.bottomText}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>
            Login
          </Link>
        </p>
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
    maxWidth: 420,
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
    marginBottom: 12,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#b91c1c",
  },
  successBox: {
    marginBottom: 12,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#065f46",
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
    background: "#22c55e",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
  },
  bottomText: {
    marginTop: 12,
    fontSize: 14,
    textAlign: "center",
  },
  link: {
    color: "#60a5fa",
    textDecoration: "none",
    fontWeight: 600,
  },
};

export default RegisterPage;
