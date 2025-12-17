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
      setSuccess("Account created successfully. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration failed. Please check your details."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        {/* LOGO / TITLE */}
        <div style={headerStyle}>
          <h1 style={titleStyle}>Create Account</h1>
          <p style={subtitleStyle}>
            Join <span style={brand}>AIVisionHire</span> and start practicing
          </p>
        </div>

        {error && <div style={errorStyle}>{error}</div>}
        {success && <div style={successStyle}>{success}</div>}

        <form onSubmit={handleSubmit} style={formStyle}>
          <Field label="Name">
            <input
              style={inputStyle}
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </Field>

          <Field label="Email">
            <input
              style={inputStyle}
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </Field>

          <Field label="Password">
            <input
              style={inputStyle}
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </Field>

          <button type="submit" style={primaryButton} disabled={isLoading}>
            {isLoading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p style={footerText}>
          Already have an account?{" "}
          <Link to="/login" style={linkStyle}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

/* ---------- SMALL COMPONENT ---------- */

const Field = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <label style={labelStyle}>{label}</label>
    {children}
  </div>
);

/* ---------- STYLE SYSTEM (LOGIN UYUMLU) ---------- */

const pageStyle = {
  minHeight: "100vh",
  background: "radial-gradient(circle at top, #020617, #000)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  color: "#e5e7eb",
};

const cardStyle = {
  width: "100%",
  maxWidth: 420,
  background: "#0b1220",
  padding: 28,
  borderRadius: 16,
  border: "1px solid #1f2937",
  boxShadow: "0 20px 40px rgba(0,0,0,.5)",
};

const headerStyle = {
  textAlign: "center",
  marginBottom: 20,
};

const titleStyle = {
  fontSize: 26,
  fontWeight: 800,
};

const subtitleStyle = {
  fontSize: 14,
  opacity: 0.7,
  marginTop: 6,
};

const brand = {
  color: "#6366f1",
  fontWeight: 700,
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

const labelStyle = {
  fontSize: 13,
  opacity: 0.8,
};

const inputStyle = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #334155",
  background: "#020617",
  color: "#e5e7eb",
  outline: "none",
};

const primaryButton = {
  marginTop: 10,
  padding: "12px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg,#22c55e,#16a34a)",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
};

const errorStyle = {
  marginBottom: 12,
  padding: 10,
  borderRadius: 10,
  background: "#7f1d1d",
  fontSize: 14,
};

const successStyle = {
  marginBottom: 12,
  padding: 10,
  borderRadius: 10,
  background: "#065f46",
  fontSize: 14,
};

const footerText = {
  marginTop: 16,
  fontSize: 14,
  textAlign: "center",
  opacity: 0.8,
};

const linkStyle = {
  color: "#818cf8",
  fontWeight: 700,
  textDecoration: "none",
};

export default RegisterPage;
