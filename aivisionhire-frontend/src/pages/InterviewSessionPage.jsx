// src/pages/InterviewSessionPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import interviewApi from "../api/interviewApi";

const InterviewSessionPage = () => {
  const { id: interviewId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const questions = location.state?.questions || [];
  const initialTime = location.state?.timeLimitSeconds || 0;

  const [answers, setAnswers] = useState({});
  const [grading, setGrading] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(initialTime);

  const hasProgress = useMemo(
    () => Object.values(answers).some((v) => String(v || "").trim()),
    [answers]
  );

  /* ---------------- TIMER ---------------- */

  useEffect(() => {
    if (!initialTime) return;
    setTimeLeft(initialTime);

    const id = setInterval(() => {
      setTimeLeft((p) => (p <= 1 ? 0 : p - 1));
    }, 1000);

    return () => clearInterval(id);
  }, [initialTime]);

  /* ---------------- LEAVE WARNING ---------------- */

  useEffect(() => {
    const handler = (e) => {
      if (hasProgress && !result) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasProgress, result]);

  /* ---------------- ACTIONS ---------------- */

  const handleExitInterview = async () => {
    if (hasProgress && !result) {
      const ok = window.confirm("Exit interview? Answers will be lost.");
      if (!ok) return;
    }

    try {
      setExiting(true);
      await interviewApi.abandonInterview(interviewId);
    } catch {}
    finally {
      navigate("/dashboard");
    }
  };

  const handleChange = (order, value) =>
    setAnswers((p) => ({ ...p, [order]: value }));

  const buildPayload = () => ({
    interviewId,
    answers: questions.map((q) => ({
      order: q.order,
      type: "open",
      answerText: answers[q.order] || "",
    })),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setGrading(true);
    try {
      const res = await interviewApi.submitInterview(buildPayload());
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Submit failed.");
    } finally {
      setGrading(false);
    }
  };

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
      2,
      "0"
    )}`;

  /* ---------------- EMPTY ---------------- */

  if (!questions.length) {
    return (
      <div style={Page}>
        <div style={Card}>
          <h2>Interview Session</h2>
          <div style={Muted}>No interview data found.</div>
          <div style={Actions}>
            <button type="button" style={Primary} onClick={() => navigate("/interview/setup")}> 
              Start Interview
            </button>
            <button type="button" style={Secondary} onClick={() => navigate("/dashboard")}> 
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div style={Page}>
      <div style={Card}>
        {/* HEADER */}
        <div style={Header}>
          <div>
            <h2>Interview Session</h2>
            <span style={Meta}>ID: {interviewId}</span>
          </div>

          <div style={Right}>
            {initialTime > 0 && (
              <span style={Timer}>
                ⏱ {formatTime(timeLeft)}
              </span>
            )}
            <button type="button" style={Danger} onClick={handleExitInterview} disabled={grading || exiting}>
              Exit
            </button>
          </div>
        </div>

        {error && <div style={Error}>{error}</div>}

        {!result ? (
          <form onSubmit={handleSubmit}>
            {questions.map((q) => (
              <div key={q.order} style={QuestionCard}>
                <div style={Question}>
                  {q.order}. <span style={Badge}>OPEN</span> {q.question}
                </div>

                <textarea
                  style={Textarea}
                  rows={4}
                  value={answers[q.order] || ""}
                  onChange={(e) => handleChange(q.order, e.target.value)}
                  placeholder="Type your answer..."
                />
              </div>
            ))}

            <button type="submit" style={Primary} disabled={grading || exiting}>
              {grading ? "Grading..." : "Submit Answers"}
            </button>
          </form>
        ) : (
          <div style={Result}>
            <h3>Result</h3>
            <div style={Score}>{result.score}</div>

            {result.feedback?.feedback && (
              <p>{result.feedback.feedback}</p>
            )}

            <div style={Actions}>
              <button type="button" style={Primary} onClick={() => navigate("/dashboard")}> 
                Dashboard
              </button>
              <button type="button" style={Danger} onClick={() => navigate("/interview/setup")}> 
                New Interview
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------------- STYLES (GLOBAL DİL) ---------------- */

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
  maxWidth: 960,
  background: "#0b1220",
  borderRadius: 16,
  padding: 28,
  boxShadow: "0 20px 40px rgba(0,0,0,.5)",
};

const Header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 16,
  gap: 12,
  flexWrap: "wrap",
};

const Meta = { fontSize: 13, opacity: 0.7 };

const Right = { display: "flex", gap: 10, alignItems: "center" };

const Timer = {
  padding: "6px 12px",
  borderRadius: 999,
  background: "#020617",
  border: "1px solid #334155",
  fontWeight: 600,
};

const QuestionCard = {
  marginTop: 16,
  padding: 16,
  borderRadius: 12,
  background: "#020617",
};

const Question = { fontWeight: 600, marginBottom: 6 };

const Textarea = {
  width: "100%",
  borderRadius: 10,
  border: "1px solid #334155",
  background: "#020617",
  color: "#e5e7eb",
  padding: 10,
};

const Badge = {
  marginRight: 6,
  padding: "2px 10px",
  borderRadius: 999,
  background: "#1f2937",
  fontSize: 11,
};

const Primary = {
  marginTop: 20,
  padding: "12px 16px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

const Secondary = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #334155",
  background: "transparent",
  color: "#e5e7eb",
  cursor: "pointer",
};

const Danger = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #ef4444",
  background: "transparent",
  color: "#ef4444",
  fontWeight: 700,
  cursor: "pointer",
};

const Error = {
  marginTop: 12,
  padding: 10,
  borderRadius: 10,
  background: "#7f1d1d",
};

const Result = {
  marginTop: 20,
  padding: 20,
  borderRadius: 14,
  background: "#020617",
};

const Score = {
  fontSize: 40,
  fontWeight: 800,
  margin: "8px 0",
};

const Actions = { display: "flex", gap: 10, marginTop: 16 };

const Muted = { opacity: 0.7 };

export default InterviewSessionPage;
