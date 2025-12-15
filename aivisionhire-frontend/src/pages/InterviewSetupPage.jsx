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
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to start interview. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        {/* ✅ Top Bar */}
        <div style={topBarStyle}>
          <button
            type="button"
            style={buttonSecondary}
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>

          <button
            type="button"
            style={buttonSecondary}
            onClick={() => navigate("/interviews")}
          >
            History
          </button>
        </div>

        <h2>Start New Interview</h2>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleStart} style={formStyle}>
          <div>
            <label style={labelStyle}>Field</label>
            <input
              style={inputStyle}
              value={field}
              onChange={(e) => setField(e.target.value)}
              placeholder="React Native, Backend, Data Science..."
            />
          </div>

          <div>
            <label style={labelStyle}>Difficulty</label>
            <select
              style={inputStyle}
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="junior">Junior</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
            </select>
          </div>

          <button type="submit" style={buttonPrimary} disabled={loading}>
            {loading ? "Starting..." : "Start Interview"}
          </button>
        </form>
      </div>
    </div>
  );
};

const pageStyle = {
  minHeight: "100vh",
  background: "#020617",
  color: "#e5e7eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
};

const cardStyle = {
  background: "#111827",
  padding: 24,
  borderRadius: 12,
  width: "100%",
  maxWidth: 480,
  border: "1px solid #1f2937",
};

const topBarStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 8,
  marginBottom: 12,
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  marginTop: 16,
};

const labelStyle = {
  display: "block",
  marginBottom: 4,
  fontSize: 14,
};

const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #4b5563",
  background: "#020617",
  color: "#e5e7eb",
  outline: "none",
};

const buttonPrimary = {
  marginTop: 8,
  padding: "10px 12px",
  borderRadius: 8,
  border: "none",
  background: "#4f46e5",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};

const buttonSecondary = {
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #4b5563",
  background: "transparent",
  color: "#e5e7eb",
  cursor: "pointer",
};

const errorStyle = {
  marginTop: 8,
  padding: 8,
  borderRadius: 8,
  backgroundColor: "#b91c1c",
};

export default InterviewSetupPage;
