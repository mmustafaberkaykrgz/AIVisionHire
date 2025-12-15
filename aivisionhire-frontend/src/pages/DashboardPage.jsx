// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from "react";
import analyticsApi from "../api/analyticsApi";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";


const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await analyticsApi.getDashboardStats();
        setStats(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard stats.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return <div style={pageStyle}>Loading dashboard...</div>;
  }

  if (error) {
    return <div style={pageStyle}>{error}</div>;
  }

  return (
    <div style={pageStyle}>
      <div style={layoutStyle}>
        <header style={headerStyle}>
          <h1>AIVisionHire Dashboard</h1>
          <div>
            <span style={{ marginRight: 8 }}>
              {user ? `Hi, ${user.name}` : ""}
            </span>
            <button onClick={handleLogout} style={logoutButtonStyle}>
              Logout
            </button>
          </div>
        </header>

        <main>
          <div style={cardsRowStyle}>
            <div style={cardStyle}>
              <h3>Total Interviews</h3>
              <p style={bigNumberStyle}>{stats.totalInterviews}</p>
            </div>
            <div style={cardStyle}>
              <h3>Average Score</h3>
              <p style={bigNumberStyle}>{stats.averageScore}</p>
            </div>
          </div>

          <div style={cardsRowStyle}>
            <div style={cardStyle}>
              <h3>Top Strengths</h3>
              {stats.topStrengths?.length ? (
                <div style={badgeContainerStyle}>
                  {stats.topStrengths.map((s) => (
                    <span key={s} style={badgeGreen}>
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p>No data yet.</p>
              )}
            </div>

            <div style={cardStyle}>
              <h3>Top Weaknesses</h3>
              {stats.topWeaknesses?.length ? (
                <div style={badgeContainerStyle}>
                  {stats.topWeaknesses.map((w) => (
                    <span key={w} style={badgeRed}>
                      {w}
                    </span>
                  ))}
                </div>
              ) : (
                <p>No data yet.</p>
              )}
            </div>
          </div>
                    {/* Quick action */}
          <div style={{ marginTop: 16 }}>
            <Link
              to="/interview/setup"
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                background: "#4f46e5",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              ➕ Start New Interview
            </Link>
          </div>
          <div style={{ marginTop: 8 }}>
          <Link
          to="/interviews"
          style={{
          padding: "8px 12px",
          borderRadius: 8,
          background: "#111827",
          color: "#e5e7eb",
          textDecoration: "none",
          fontSize: 14,
          border: "1px solid #4b5563",
        }}
  >
    📜 View My Interviews
  </Link>
</div>        

        </main>
      </div>
    </div>
  );
};

const pageStyle = {
  minHeight: "100vh",
  background: "#020617",
  color: "#e5e7eb",
  padding: "24px 0",
};

const layoutStyle = {
  maxWidth: 900,
  margin: "0 auto",
  padding: "0 16px",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 24,
};

const logoutButtonStyle = {
  padding: "6px 10px",
  borderRadius: 8,
  border: "1px solid #f87171",
  background: "transparent",
  color: "#fca5a5",
  cursor: "pointer",
};

const cardsRowStyle = {
  display: "flex",
  gap: 16,
  marginBottom: 16,
  flexWrap: "wrap",
};

const cardStyle = {
  flex: 1,
  minWidth: 250,
  background: "#111827",
  padding: 16,
  borderRadius: 12,
  marginBottom: 16,
};

const bigNumberStyle = { fontSize: 32, fontWeight: 700, marginTop: 8 };

const badgeContainerStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 8,
};

const badgeGreen = {
  padding: "4px 8px",
  borderRadius: 999,
  background: "#065f46",
  fontSize: 12,
};

const badgeRed = {
  padding: "4px 8px",
  borderRadius: 999,
  background: "#7f1d1d",
  fontSize: 12,
};

export default DashboardPage;
