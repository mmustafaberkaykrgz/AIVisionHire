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

  const hasProgress = useMemo(() => {
    return Object.values(answers).some((v) => String(v || "").trim().length > 0);
  }, [answers]);

  useEffect(() => {
    if (!initialTime) return;

    setTimeLeft(initialTime);
    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [initialTime]);

  useEffect(() => {
    const handler = (e) => {
      if (result) return;
      if (!hasProgress) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasProgress, result]);

  const handleExitInterview = async () => {
    if (hasProgress && !result) {
      const ok = window.confirm(
        "Exit interview? Your answers will be lost if you haven't submitted."
      );
      if (!ok) return;
    }

    if (result) {
      navigate("/dashboard");
      return;
    }

    try {
      setExiting(true);
      await interviewApi.abandonInterview(interviewId);
    } catch (err) {
      console.error("Abandon failed:", err);
    } finally {
      setExiting(false);
      navigate("/dashboard");
    }
  };

  const handleChange = (order, value) => {
    setAnswers((prev) => ({ ...prev, [order]: value }));
  };

  // ✅ Artık her soru klasik: sadece answerText gönderiyoruz
  const buildPayload = () => {
    return {
      interviewId,
      answers: questions.map((q) => ({
        order: q.order,
        type: "open",
        answerText: answers[q.order] || "",
      })),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setGrading(true);

    try {
      const payload = buildPayload();
      const res = await interviewApi.submitInterview(payload);
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Failed to submit interview. Please try again."
      );
    } finally {
      setGrading(false);
    }
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (!questions || questions.length === 0) {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <h2>Interview Session</h2>
          <p style={{ marginTop: 8 }}>
            Interview data not found. Please start a new interview.
          </p>

          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button style={buttonStyle} onClick={() => navigate("/interview/setup")}>
              Start New Interview
            </button>
            <button style={buttonDanger} onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <header style={headerStyle}>
          <div>
            <h2>Interview Session</h2>
            <p style={{ fontSize: 13, opacity: 0.8 }}>ID: {interviewId}</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              type="button"
              style={buttonDanger}
              onClick={handleExitInterview}
              disabled={grading || exiting}
            >
              {exiting ? "Exiting..." : "Exit Interview"}
            </button>

            {initialTime > 0 && (
              <div style={timerBoxStyle}>
                <span style={{ fontSize: 13, opacity: 0.8 }}>
                  Time left (recommended):
                </span>
                <span style={{ fontWeight: 700, marginLeft: 8 }}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>
        </header>

        {error && <div style={errorStyle}>{error}</div>}

        {!result ? (
          <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
            {questions.map((q) => (
              <div key={q.order} style={questionBlockStyle}>
                <p style={questionTextStyle}>
                  {q.order}. <span style={badgeStyle}>Open</span> {q.question}
                </p>

                <textarea
                  style={textareaStyle}
                  rows={4}
                  value={answers[q.order] || ""}
                  onChange={(e) => handleChange(q.order, e.target.value)}
                  placeholder="Your answer..."
                />
              </div>
            ))}

            <button type="submit" style={buttonStyle} disabled={grading || exiting}>
              {grading ? "Grading..." : "Submit Answers"}
            </button>
          </form>
        ) : (
          <div style={resultBoxStyle}>
            <h3>Result</h3>
            <p>
              <strong>Score:</strong> {result.score}
            </p>

            {result.feedback && (
              <>
                {result.feedback.feedback && (
                  <p style={{ marginTop: 8 }}>
                    <strong>Feedback: </strong>
                    {result.feedback.feedback}
                  </p>
                )}

                {Array.isArray(result.feedback.strengths) && result.feedback.strengths.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <strong>Strengths:</strong>
                    <ul>
                      {result.feedback.strengths.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {Array.isArray(result.feedback.weaknesses) && result.feedback.weaknesses.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <strong>Weaknesses:</strong>
                    <ul>
                      {result.feedback.weaknesses.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {Array.isArray(result.feedback.suggestions) && result.feedback.suggestions.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <strong>Suggestions:</strong>
                    <ul>
                      {result.feedback.suggestions.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button style={buttonStyle} onClick={() => navigate("/dashboard")}>
                Back to Dashboard
              </button>
              <button style={buttonDanger} onClick={() => navigate("/interview/setup")}>
                Start New Interview
              </button>
            </div>
          </div>
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
  padding: 18,
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
  gap: 12,
  flexWrap: "wrap",
};

const questionBlockStyle = { marginBottom: 16 };
const questionTextStyle = { fontWeight: 600, marginBottom: 4 };

const textareaStyle = {
  width: "100%",
  borderRadius: 8,
  border: "1px solid #4b5563",
  background: "#020617",
  color: "#e5e7eb",
  padding: 8,
};

const buttonStyle = {
  marginTop: 8,
  padding: "10px 12px",
  borderRadius: 8,
  border: "none",
  background: "#4f46e5",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};

const buttonDanger = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #ef4444",
  background: "transparent",
  color: "#ef4444",
  fontWeight: 700,
  cursor: "pointer",
};

const errorStyle = {
  marginTop: 8,
  padding: 8,
  borderRadius: 8,
  backgroundColor: "#b91c1c",
};

const resultBoxStyle = {
  marginTop: 16,
  padding: 16,
  borderRadius: 12,
  background: "#020617",
};

const badgeStyle = {
  display: "inline-block",
  padding: "2px 6px",
  borderRadius: 999,
  backgroundColor: "#1f2937",
  fontSize: 11,
  marginRight: 6,
};

const timerBoxStyle = {
  padding: "6px 10px",
  borderRadius: 999,
  backgroundColor: "#020617",
  border: "1px solid #4b5563",
};

export default InterviewSessionPage;
