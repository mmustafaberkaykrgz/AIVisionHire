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
        console.error(err);
        setError(err.response?.data?.message || "Failed to load interview details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const formatDate = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleString();
  };

  if (loading) return <div style={pageStyle}>Loading interview...</div>;
  if (error) return <div style={pageStyle}>{error}</div>;
  if (!interview) return <div style={pageStyle}>Interview not found.</div>;

  const { field, difficulty, score, createdAt, questions, answers, aiFeedback } = interview;

  // ✅ Hibrit cevap bulma (order -> question -> index fallback)
  const findAnswer = (q, idx) => {
    const arr = Array.isArray(answers) ? answers : [];

    // 1) Yeni yapı: order ile eşleştir
    let a = arr.find((x) => x?.order === q?.order);

    // 2) Eski yapı: question text ile eşleştir (eski kayıtlar için)
    if (!a && q?.question) {
      a = arr.find((x) => x?.question === q?.question);
    }

    // 3) Son fallback: index
    if (!a) a = arr[idx];

    return a || null;
  };

  // ✅ Hibrit cevap text üretme
  const getAnswerText = (q, idx) => {
    const a = findAnswer(q, idx);
    if (!a) return "(no answer)";

    const openOrCode = a.answerText ?? a.answer ?? "";
    const mcq = a.selectedOption ?? "";

    if (q?.type === "mcq") return mcq || openOrCode || "(no answer)";
    return openOrCode || mcq || "(no answer)";
  };

  const getTypeLabel = (type) => {
    if (type === "mcq") return "MCQ";
    if (type === "code") return "Code";
    return "Open";
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <header style={headerStyle}>
          <div>
            <h2>Interview Detail</h2>
            <p style={{ fontSize: 13, opacity: 0.8 }}>
              {field} • {difficulty} • {formatDate(createdAt)}
            </p>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button style={buttonSecondary} onClick={() => navigate("/interviews")}>
              ← Back to History
            </button>
            <button style={buttonSecondary} onClick={() => navigate("/dashboard")}>
              Dashboard
            </button>
          </div>
        </header>

        <section style={sectionStyle}>
          <h3>Score</h3>
          <p style={{ fontSize: 32, fontWeight: 700 }}>{score}</p>
        </section>

        <section style={sectionStyle}>
          <h3>Feedback</h3>
          {aiFeedback ? (
            <>
              {aiFeedback.feedback && <p style={{ marginTop: 4 }}>{aiFeedback.feedback}</p>}

              {Array.isArray(aiFeedback.strengths) && aiFeedback.strengths.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <strong>Strengths:</strong>
                  <ul>
                    {aiFeedback.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {Array.isArray(aiFeedback.weaknesses) && aiFeedback.weaknesses.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <strong>Weaknesses:</strong>
                  <ul>
                    {aiFeedback.weaknesses.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {Array.isArray(aiFeedback.suggestions) && aiFeedback.suggestions.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <strong>Suggestions:</strong>
                  <ul>
                    {aiFeedback.suggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p>No AI feedback recorded.</p>
          )}
        </section>

        <section style={sectionStyle}>
          <h3>Questions & Answers</h3>

          {Array.isArray(questions) && questions.length > 0 ? (
            questions.map((q, idx) => {
              const answerText = getAnswerText(q, idx);

              return (
                <div key={q.order || idx} style={qaBlockStyle}>
                  <p style={questionTextStyle}>
                    {q.order || idx + 1}.{" "}
                    <span style={badgeStyle}>{getTypeLabel(q.type)}</span>{" "}
                    {q.question}
                  </p>

                  {q.type === "code" ? (
                    <pre style={codeBoxStyle}>
                      <strong>Your answer:</strong>
                      {"\n"}
                      {answerText || "(no answer)"}
                    </pre>
                  ) : (
                    <p style={answerTextStyle}>
                      <strong>Your answer:</strong> {answerText || "(no answer)"}
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            <p>No questions stored for this interview.</p>
          )}
        </section>
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

const sectionStyle = {
  marginTop: 16,
  paddingTop: 8,
  borderTop: "1px solid #374151",
};

const qaBlockStyle = {
  marginTop: 12,
  padding: 10,
  borderRadius: 8,
  background: "#020617",
};

const questionTextStyle = {
  fontWeight: 600,
  marginBottom: 6,
};

const answerTextStyle = {
  fontSize: 14,
  lineHeight: 1.5,
};

const codeBoxStyle = {
  marginTop: 8,
  padding: 12,
  borderRadius: 8,
  background: "#0b1220",
  border: "1px solid #1f2937",
  whiteSpace: "pre-wrap",
  fontSize: 13,
  lineHeight: 1.5,
};

const badgeStyle = {
  display: "inline-block",
  padding: "2px 8px",
  borderRadius: 999,
  background: "#1f2937",
  fontSize: 11,
  marginRight: 6,
  opacity: 0.9,
};

const buttonSecondary = {
  padding: "6px 10px",
  borderRadius: 8,
  border: "1px solid #4b5563",
  background: "transparent",
  color: "#e5e7eb",
  cursor: "pointer",
};

export default InterviewDetailPage;

