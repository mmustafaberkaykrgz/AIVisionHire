import { GoogleGenerativeAI } from "@google/generative-ai";
import Interview from "../models/Interview.model.js";

// Soru tipine göre baz süreler (legacy destek kalsın)
const BASE_TIMES = { open: 120, mcq: 60, code: 300 };
const DIFF_MULT = { junior: 1.0, mid: 1.1, senior: 1.25 };

const getTimeForQuestion = (type, difficulty) => {
  const base = BASE_TIMES[type] || BASE_TIMES.open;
  const mult = DIFF_MULT[String(difficulty).toLowerCase()] || 1.0;
  return Math.round(base * mult);
};

// ✅ Basit fallback soru havuzu (quota dolarsa mülakat yine başlasın)
const fallbackQuestions = (field, difficulty) => {
  return [
    `Explain core concepts in ${field} and give real examples.`,
    `Describe a challenging problem you solved in ${field}. What was your approach?`,
    `How do you debug and troubleshoot issues in ${field}? Walk through your process.`,
    `What are common performance pitfalls in ${field} and how do you avoid them?`,
    `Explain best practices and architecture decisions for a ${difficulty}-level role in ${field}.`,
  ].map((q, i) => ({ order: i + 1, type: "open", question: q }));
};

// ✅ START INTERVIEW — artık sadece classic open-ended
export const startInterview = async (req, res) => {
  try {
    const { field, difficulty } = req.body;
    const userId = req.userId;

    if (!field || !difficulty) {
      return res.status(400).json({ message: "Field and difficulty are required." });
    }

    const diffKey = String(difficulty).toLowerCase();

    let parsedQuestions = null;

    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
You are an experienced technical interviewer.

Field: "${field}"
Difficulty: "${diffKey}"

Generate exactly 5 classic open-ended technical interview questions.
- All questions must be open-ended and require explanation/examples.
- Do NOT generate multiple-choice questions.
- Do NOT generate coding-only questions.

Return STRICT RAW JSON ONLY (no markdown, no extra text) in this structure:
{
  "questions": [
    { "order": 1, "type": "open", "question": "string" }
  ]
}
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response
        .text()
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(responseText);
      if (parsed?.questions?.length) parsedQuestions = parsed.questions;
    } catch (aiErr) {
      // ✅ Quota / parse / network hatası olursa fallback ile devam
      console.error("startInterview AI failed, using fallback:", aiErr?.message);
      parsedQuestions = fallbackQuestions(field, diffKey);
    }

    if (!parsedQuestions || !Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
      parsedQuestions = fallbackQuestions(field, diffKey);
    }

    let totalTimeSeconds = 0;

    // Hepsini "open" zorluyoruz
    const questions = parsedQuestions.map((q, idx) => {
      const timeLimitSec = getTimeForQuestion("open", diffKey);
      totalTimeSeconds += timeLimitSec;

      return {
        order: q.order ?? idx + 1,
        type: "open",
        question: q.question,
        options: [],
        correctAnswer: null,
        timeLimitSec,
      };
    });

    const newInterview = await Interview.create({
      userId,
      field,
      difficulty: diffKey,
      status: "in_progress",
      questions,
      answers: [],
      aiFeedback: null,
      score: 0,
      timeLimitSeconds: totalTimeSeconds,
    });

    return res.status(201).json({
      message: "Interview started successfully",
      interviewId: newInterview._id,
      timeLimitSeconds: newInterview.timeLimitSeconds,
      questions: newInterview.questions,
    });
  } catch (error) {
    console.error("startInterview error:", error);
    return res.status(500).json({ message: "Something went wrong.", error: error.message });
  }
};

// ✅ SUBMIT — open-ended değerlendirme (legacy alanları bozmayalım)
export const submitInterview = async (req, res) => {
  try {
    const { interviewId, answers } = req.body;
    const userId = req.userId;

    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ message: "Interview not found" });
    if (interview.userId.toString() !== userId) return res.status(403).json({ message: "Unauthorized" });

    // Eğer abandon edilmişse submit etmeyelim
    if (interview.status === "abandoned") {
      return res.status(400).json({ message: "This interview was abandoned and cannot be submitted." });
    }

    const questions = interview.questions || [];

    // Frontend artık sadece answerText gönderecek, legacy için yine normalize edelim
    const normalizedAnswers = (answers || []).map((a, idx) => {
      const qByOrder = questions.find((q) => q.order === a.order);
      const order = a.order ?? qByOrder?.order ?? idx + 1;

      return {
        order,
        type: "open",
        answerText: a.answerText ?? a.answer ?? "",
        selectedOption: a.selectedOption ?? "",
      };
    });

    interview.answers = normalizedAnswers;

    // AI değerlendirme
    let aiResult = null;
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const qaBlock = questions
        .map((q) => {
          const ans = normalizedAnswers.find((a) => a.order === q.order);
          const answerText = ans?.answerText || "(no answer)";
          return `[Q${q.order}] ${q.question}\nA: ${answerText}\n`;
        })
        .join("\n");

      const prompt = `
You are grading a technical interview for the field "${interview.field}" at "${interview.difficulty}" level.

Here are all questions and candidate responses:
${qaBlock}

Return ONLY raw JSON in this format (no markdown):
{
  "score": number (0-100),
  "feedback": {
    "feedback": "string",
    "strengths": ["..."],
    "weaknesses": ["..."],
    "suggestions": ["..."]
  }
}
      `;

      const result = await model.generateContent(prompt);
      const rawText = result.response
        .text()
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      aiResult = JSON.parse(rawText);
    } catch (err) {
      console.error("AI grading failed:", err?.message);
      aiResult = {
        score: 0,
        feedback: {
          feedback: "AI grading unavailable (quota/parse error).",
          strengths: [],
          weaknesses: [],
          suggestions: [],
        },
      };
    }

    interview.score = aiResult?.score ?? 0;
    interview.aiFeedback = aiResult?.feedback ?? null;
    interview.status = "submitted";
    interview.submittedAt = new Date();

    await interview.save();

    return res.json({
      message: "Interview submitted and graded",
      score: interview.score,
      feedback: interview.aiFeedback,
    });
  } catch (error) {
    console.error("Submit Error:", error);
    res.status(500).json({ message: "Server error during grading", error: error.message });
  }
};

// ✅ HISTORY — SADECE submitted göster (legacy submitted’ları da yakala)
export const getMyInterviews = async (req, res) => {
  try {
    const userId = req.userId;

    const interviews = await Interview.find({
      userId,
      $or: [
        { status: "submitted" },
        // legacy kayıtlar: status yok ama submit olmuş olabilir
        {
          status: { $exists: false },
          $or: [
            { aiFeedback: { $ne: null } },
            { "answers.0": { $exists: true } },
            { score: { $gt: 0 } },
          ],
        },
      ],
    })
      .select("field difficulty score createdAt status")
      .sort({ createdAt: -1 });

    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching interviews", error: error.message });
  }
};

// ✅ SINGLE DETAIL
export const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.userId });
    if (!interview) return res.status(404).json({ message: "Interview not found" });
    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: "Error fetching interview details", error: error.message });
  }
};

// ✅ ABANDON (Exit Interview)
export const abandonInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.userId });
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    // submitted ise abandon yapmayalım (history’de zaten görünecek)
    if (interview.status === "submitted") {
      return res.status(400).json({ message: "Submitted interviews cannot be abandoned." });
    }

    interview.status = "abandoned";
    interview.abandonedAt = new Date();
    await interview.save();

    return res.json({ message: "Interview abandoned successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error abandoning interview", error: error.message });
  }
};
