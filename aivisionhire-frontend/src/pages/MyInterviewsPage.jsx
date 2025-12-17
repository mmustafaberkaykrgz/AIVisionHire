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
        setError("Failed to load interview history.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (v) => (v ? new Date(v).toLocaleString() : "");

  if (loading) {
    return (
      <div style={Page}>
        <div style={Card}>Loading interviews...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={Page}>
        <div style={Card}>{error}</div>
      </div>
    );
  }

  return (
    <div style={Page}>
      <div style={Card}>
        {/* HEADER */}
        <div style={Header}>
          <div>
            <h2>My Interviews</h2>
            <span style={Meta}>Your interview history & results</span>
          </div>

          <button type="button" style={Secondary} onClick={() => navigate("/dashboard")}> 
            ← Dashboard
          </button>
        </div>

        {interviews.length === 0 ? (
          <div style={Empty}>No interviews found.</div>
        ) : (
          <div style={TableWrapper}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={Th}>Date</th>
                  <th style={Th}>Field</th>
                  <th style={Th}>Difficulty</th>
                  <th style={Th}>Score</th>
                  <th style={Th} align="right">Action</th>
                </tr>
              </thead>
              <tbody>
                {interviews.map((item) => (
                  <tr key={item._id} style={rowStyle}>
                    <td style={Td}>{formatDate(item.createdAt)}</td>
                    <td style={Td}>{item.field}</td>
                    <td style={Td}>
                      <span style={Badge}>{item.difficulty}</span>
                    </td>
                    <td style={Td}>
                      <span style={Score}>{item.score}</span>
                    </td>
                    <td style={Td} align="right">
                      <button
                        type="button"
                        style={PrimarySmall}
                        onClick={() => navigate(`/interviews/${item._id}`)}
                      >
                        Details →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------------- GLOBAL STYLE SYSTEM ---------------- */

const Page = {
  minHeight: "100vh",
  background: "radial-gradient(circle at top, #020617, #000)",
  display: "flex",
  justifyContent: "center",
  padding: 24,
  color: "#e5e7eb",
};

const Card = {
  width: "100%",
  maxWidth: 1000,
  background: "#0b1220",
  padding: 28,
  borderRadius: 16,
  border: "1px solid #1f2937",
  boxShadow: "0 20px 40px rgba(0,0,0,.5)",
};

const Header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20,
  gap: 12,
  flexWrap: "wrap",
};

const Meta = {
  fontSize: 14,
  opacity: 0.7,
};

const Empty = {
  opacity: 0.7,
  marginTop: 16,
};

const TableWrapper = {
  overflowX: "auto",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 14,
};

const Th = {
  textAlign: "left",
  padding: "12px 10px",
  borderBottom: "1px solid #334155",
  fontWeight: 600,
  opacity: 0.85,
};

const Td = {
  padding: "12px 10px",
  borderBottom: "1px solid #1f2937",
};

const rowStyle = {
  transition: "background .2s",
};

const Badge = {
  padding: "4px 10px",
  borderRadius: 999,
  background: "#1f2937",
  fontSize: 12,
};

const Score = {
  fontWeight: 700,
};

const PrimarySmall = {
  padding: "6px 12px",
  borderRadius: 10,
  border: "none",
  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 12,
};

const Secondary = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid #334155",
  background: "transparent",
  color: "#e5e7eb",
  cursor: "pointer",
};

export default MyInterviewsPage;
