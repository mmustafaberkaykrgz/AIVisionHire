// src/pages/InterviewSetupPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import interviewApi from "../api/interviewApi";

const InterviewSetupPage = () => {
  const navigate = useNavigate();
  const [field, setField] = useState("React Native");
  const [difficulty, setDifficulty] = useState("junior");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStart = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await interviewApi.startInterview({ field, difficulty });
      const { interviewId, questions, timeLimitSeconds } = res.data;

      navigate(`/interview/${interviewId}`, {
        state: { questions, timeLimitSeconds },
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to start interview."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={Page}>
      <div style={Card}>
        {/* TOP BAR */}
        <div style={TopBar}>
          <button type="button" style={Secondary} onClick={() => navigate("/dashboard")}> 
            ← Dashboard
          </button>
          <button type="button" style={Secondary} onClick={() => navigate("/interviews")}> 
            History
          </button>
        </div>

        <div style={Header}>
          <h2>Start New Interview</h2>
          <p style={{ opacity: 0.7, fontSize: 14 }}>
            Configure your AI-powered interview session
          </p>
        </div>

        {error && <div style={Error}>{error}</div>}

        <form onSubmit={handleStart}>
          <div style={Field}>
            <label style={Label}>Field</label>
            <input
              style={Input}
              value={field}
              onChange={(e) => setField(e.target.value)}
              placeholder="React, Backend, Data Science..."
            />
          </div>

          <div style={Field}>
            <label style={Label}>Difficulty</label>
            <select
              style={Select}
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="junior">Junior</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
            </select>
          </div>

          <button type="submit" style={Primary} disabled={loading}>
            {loading ? "Starting..." : "Start Interview"}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ---------------- STYLE SYSTEM (GLOBAL) ---------------- */

const Page = {
  minHeight: "100vh",
  background: "radial-gradient(circle at top, #020617, #000)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  color: "#e5e7eb",
};

const Card = {
  width: "100%",
  maxWidth: 460,
  background: "#0b1220",
  padding: 28,
  borderRadius: 16,
  border: "1px solid #1f2937",
  boxShadow: "0 20px 40px rgba(0,0,0,.5)",
};

const TopBar = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 16,
};

const Header = {
  marginBottom: 20,
};

const Field = {
  marginBottom: 16,
};

const Label = {
  display: "block",
  marginBottom: 6,
  fontSize: 14,
  opacity: 0.8,
};

const Input = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #334155",
  background: "#020617",
  color: "#e5e7eb",
  outline: "none",
};

const Select = {
  ...Input,
};

const Primary = {
  marginTop: 20,
  width: "100%",
  padding: "12px 16px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

const Secondary = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid #334155",
  background: "transparent",
  color: "#e5e7eb",
  cursor: "pointer",
};

const Error = {
  marginBottom: 12,
  padding: 10,
  borderRadius: 10,
  background: "#7f1d1d",
  fontSize: 14,
};

export default InterviewSetupPage;
