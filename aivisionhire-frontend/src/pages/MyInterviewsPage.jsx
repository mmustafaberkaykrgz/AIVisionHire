// src/pages/MyInterviewsPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import interviewApi from "../api/interviewApi";

const MyInterviewsPage = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await interviewApi.getMyInterviews();
        setInterviews(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load interview history.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleShowDetails = (id) => {
    navigate(`/interviews/${id}`);
  };

  const formatDate = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleString();
  };

  if (loading) {
    return <div style={pageStyle}>Loading interviews...</div>;
  }

  if (error) {
    return <div style={pageStyle}>{error}</div>;
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <header style={headerStyle}>
          <h2>My Interviews</h2>
          <button style={buttonSecondary} onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </button>
        </header>

        {interviews.length === 0 ? (
          <p>You have no interviews yet.</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thTdStyle}>Date</th>
                <th style={thTdStyle}>Field</th>
                <th style={thTdStyle}>Difficulty</th>
                <th style={thTdStyle}>Score</th>
                <th style={thTdStyle}>Actions</th> {/* 🆕 */}
              </tr>
            </thead>
            <tbody>
              {interviews.map((item) => (
                <tr key={item._id} style={rowStyle}>
                  <td style={thTdStyle}>{formatDate(item.createdAt)}</td>
                  <td style={thTdStyle}>{item.field}</td>
                  <td style={thTdStyle}>{item.difficulty}</td>
                  <td style={thTdStyle}>{item.score}</td>
                  <td style={thTdStyle}>
                    <button
                      style={detailsButtonStyle}
                      onClick={() => handleShowDetails(item._id)}
                    >
                      Show Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
};

const containerStyle = {
  width: "100%",
  maxWidth: 900,
  background: "#111827",
  padding: 24,
  borderRadius: 12,
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 16,
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 14,
};

const thTdStyle = {
  borderBottom: "1px solid #374151",
  padding: "8px 10px",
  textAlign: "left",
};

const rowStyle = {
  cursor: "default",
};

const buttonSecondary = {
  padding: "6px 10px",
  borderRadius: 8,
  border: "1px solid #4b5563",
  background: "transparent",
  color: "#e5e7eb",
  cursor: "pointer",
};

const detailsButtonStyle = {
  padding: "6px 10px",
  borderRadius: 8,
  border: "none",
  background: "#4f46e5",
  color: "#fff",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};

export default MyInterviewsPage;
