// src/pages/InterviewDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import interviewApi from "../api/interviewApi";

const InterviewDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await interviewApi.getInterviewById(id);
        setInterview(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load interview details."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const formatDate = (value) =>
    value ? new Date(value).toLocaleString() : "";

  if (loading) return <Centered>Loading interview...</Centered>;
  if (error) return <Centered>{error}</Centered>;
  if (!interview) return <Centered>Interview not found.</Centered>;

  const {
    field,
    difficulty,
    score,
    createdAt,
    questions,
    answers,
    aiFeedback,
  } = interview;

  /* ------------------ ANSWER HELPERS ------------------ */

  const findAnswer = (q, idx) => {
    const arr = Array.isArray(answers) ? answers : [];
    let a = arr.find((x) => x?.order === q?.order);
    if (!a && q?.question)
      a = arr.find((x) => x?.question === q?.question);
    if (!a) a = arr[idx];
    return a || null;
  };

  const getAnswerText = (q, idx) => {
    const a = findAnswer(q, idx);
    if (!a) return "(no answer)";
    const open = a.answerText ?? a.answer ?? "";
    const mcq = a.selectedOption ?? "";
    return q?.type === "mcq" ? mcq || open : open || mcq;
  };

  const getTypeLabel = (type) => {
    if (type === "mcq") return "MCQ";
    if (type === "code") return "CODE";
    return "OPEN";
  };

  /* ------------------ UI ------------------ */

  return (
    <div style={Page}>
      <div style={Container}>
        {/* HEADER */}
        <div style={Header}>
          <div>
            <h2>Interview Detail</h2>
            <span style={Meta}>
              {field} • {difficulty} • {formatDate(createdAt)}
            </span>
          </div>

          <div style={ButtonGroup}>
            <button type="button" style={SecondaryButton} onClick={() => navigate("/interviews")}> 
              ← History
            </button>
            <button type="button" style={SecondaryButton} onClick={() => navigate("/dashboard")}> 
              Dashboard
            </button>
          </div>
        </div>

        {/* SCORE */}
        <div style={Section}>
          <div style={SectionTitle}>Score</div>
          <div style={Score}>{score}</div>
        </div>

        {/* FEEDBACK */}
        <div style={Section}>
          <div style={SectionTitle}>AI Feedback</div>

          {aiFeedback ? (
            <>
              {aiFeedback.feedback && (
                <div style={Paragraph}>{aiFeedback.feedback}</div>
              )}

              {aiFeedback.strengths?.length > 0 && (
                <ListBlock title="Strengths" color="green">
                  {aiFeedback.strengths}
                </ListBlock>
              )}

              {aiFeedback.weaknesses?.length > 0 && (
                <ListBlock title="Weaknesses" color="red">
                  {aiFeedback.weaknesses}
                </ListBlock>
              )}

              {aiFeedback.suggestions?.length > 0 && (
                <ListBlock title="Suggestions" color="purple">
                  {aiFeedback.suggestions}
                </ListBlock>
              )}
            </>
          ) : (
            <div style={Muted}>No AI feedback recorded.</div>
          )}
        </div>

        {/* QUESTIONS */}
        <div style={Section}>
          <div style={SectionTitle}>Questions & Answers</div>

          {questions?.length ? (
            questions.map((q, idx) => (
              <div key={q.order || idx} style={QABlock}>
                <div style={Question}>
                  {q.order || idx + 1}.{" "}
                  <span style={Badge}>{getTypeLabel(q.type)}</span>
                  {q.question}
                </div>

                {q.type === "code" ? (
                  <div style={CodeBox}>
                    {getAnswerText(q, idx) || "(no answer)"}
                  </div>
                ) : (
                  <div style={Answer}>
                    <strong>Your answer:</strong>{" "}
                    {getAnswerText(q, idx) || "(no answer)"}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={Muted}>No questions stored.</div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ------------------ SMALL COMPONENTS ------------------ */

const Centered = ({ children }) => (
  <div style={Page}>
    <div style={Muted}>{children}</div>
  </div>
);

const ListBlock = ({ title, color, children }) => (
  <div style={{ marginTop: 12 }}>
    <strong style={{ color: colors[color] }}>{title}</strong>
    <ul style={{ marginTop: 4, paddingLeft: 18 }}>
      {children.map((i, idx) => (
        <li key={idx}>{i}</li>
      ))}
    </ul>
  </div>
);

/* ------------------ STYLES ------------------ */

const colors = {
  green: "#4ade80",
  red: "#f87171",
  purple: "#a78bfa",
};

const Page = {
  minHeight: "100vh",
  background: "radial-gradient(circle at top, #020617, #000)",
  color: "#e5e7eb",
  display: "flex",
  justifyContent: "center",
  padding: 24,
};

const Container = {
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
};

const Meta = {
  fontSize: 13,
  opacity: 0.75,
};

const ButtonGroup = {
  display: "flex",
  gap: 8,
};

const SecondaryButton = {
  padding: "8px 14px",
  borderRadius: 10,
  border: "1px solid #334155",
  background: "transparent",
  color: "#e5e7eb",
  cursor: "pointer",
};

const Section = {
  marginTop: 24,
  paddingTop: 16,
  borderTop: "1px solid #1f2937",
};

const SectionTitle = {
  fontSize: 18,
  fontWeight: 700,
};

const Score = {
  fontSize: 42,
  fontWeight: 800,
  marginTop: 8,
};

const Paragraph = {
  marginTop: 8,
  lineHeight: 1.6,
};

const Muted = {
  opacity: 0.6,
};

const QABlock = {
  marginTop: 16,
  padding: 14,
  borderRadius: 12,
  background: "#020617",
};

const Question = {
  fontWeight: 600,
};

const Answer = {
  marginTop: 6,
  fontSize: 14,
  lineHeight: 1.5,
};

const CodeBox = {
  marginTop: 8,
  padding: 14,
  borderRadius: 12,
  background: "#020617",
  border: "1px solid #1f2937",
  fontFamily: "monospace",
  whiteSpace: "pre-wrap",
  fontSize: 13,
};

const Badge = {
  display: "inline-block",
  padding: "2px 10px",
  borderRadius: 999,
  background: "#1f2937",
  fontSize: 11,
  marginRight: 6,
  opacity: 0.85,
};

export default InterviewDetailPage;
