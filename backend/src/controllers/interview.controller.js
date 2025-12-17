// backend/controllers/interview.controller.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import Interview from "../models/Interview.model.js";

// ✅ Sabit toplam süreler (saniye)
const TOTAL_TIME_SECONDS = {
  junior: 20 * 60,  // 1200
  mid: 30 * 60,     // 1800
  senior: 40 * 60,  // 2400
};

// ✅ YENİ: Retry (Tekrar Deneme) Yardımcı Fonksiyonu
const generateWithRetry = async (genAI, modelName, prompt, retries = 3) => {
  const model = genAI.getGenerativeModel({ model: modelName });
  
  for (let i = 0; i < retries; i++) {
    try {
      return await model.generateContent(prompt);
    } catch (err) {
      // Hata 503 (Service Unavailable) veya 429 (Too Many Requests) ise tekrar dene
      const isOverloaded = err.message.includes("503") || err.message.includes("overloaded") || err.message.includes("429");
      
      if (isOverloaded && i < retries - 1) {
        console.warn(`⚠️ Model ${modelName} yoğun (${i + 1}/${retries}). 2 saniye bekleniyor...`);
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 saniye bekle
      } else {
        throw err; // Başka bir hataysa veya deneme hakkı bittiyse hatayı fırlat
      }
    }
  }
};

// ✅ Quota dolarsa mülakat yine başlasın (fallback)
const fallbackQuestions = (field, difficulty) => {
  return [
    `Explain core concepts in ${field} and give real examples.`,
    `Describe a challenging problem you solved in ${field}. What was your approach?`,
    `How do you debug and troubleshoot issues in ${field}? Walk through your process.`,
    `What are common performance pitfalls in ${field} and how do you avoid them?`,
    `Explain best practices and architecture decisions for a ${difficulty}-level role in ${field}.`,
  ].map((q, i) => ({ order: i + 1, type: "open", question: q }));
};

// ✅ START INTERVIEW — sadece classic open-ended
export const startInterview = async (req, res) => {
  try {
    const { field, difficulty } = req.body;
    const userId = req.userId;

    if (!field || !difficulty) {
      return res
        .status(400)
        .json({ message: "Field and difficulty are required." });
    }

    const diffKey = String(difficulty).toLowerCase();
    const totalTimeSeconds =
      TOTAL_TIME_SECONDS[diffKey] ?? TOTAL_TIME_SECONDS.junior;

    let parsedQuestions = null;

    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      
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

      // Retry ile çağır (Sadece 2.5 Flash)
      const result = await generateWithRetry(genAI, "gemini-2.5-flash", prompt);
      
      // ✅ ESKİ PARSER MANTIĞI GERİ GELDİ
      const responseText = result.response
        .text()
        .replace(/json/gi, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(responseText);
      if (parsed?.questions?.length) parsedQuestions = parsed.questions;
    } catch (aiErr) {
      console.error("startInterview AI failed, using fallback:", aiErr?.message);
      parsedQuestions = fallbackQuestions(field, diffKey);
    }

    if (!parsedQuestions || !Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
      parsedQuestions = fallbackQuestions(field, diffKey);
    }

    const count = parsedQuestions.length;
    const perQuestionBase = Math.floor(totalTimeSeconds / count);
    const remainder = totalTimeSeconds - perQuestionBase * count;

    const questions = parsedQuestions.map((q, idx) => {
      // son soruya kalan saniyeyi ekle
      const timeLimitSec = perQuestionBase + (idx === count - 1 ? remainder : 0);

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
      timeLimitSeconds: totalTimeSeconds, // ✅ artık sabit toplam süre
    });

    return res.status(201).json({
      message: "Interview started successfully",
      interviewId: newInterview._id,
      timeLimitSeconds: newInterview.timeLimitSeconds,
      questions: newInterview.questions,
    });
  } catch (error) {
    console.error("startInterview error:", error);
    return res.status(500).json({
      message: "Something went wrong.",
      error: error.message,
    });
  }
};

// ✅ SUBMIT — open-ended değerlendirme
export const submitInterview = async (req, res) => {
  try {
    const { interviewId, answers } = req.body;
    const userId = req.userId;

    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ message: "Interview not found" });
    if (interview.userId.toString() !== userId) return res.status(403).json({ message: "Unauthorized" });

    if (interview.status === "abandoned") {
      return res.status(400).json({ message: "This interview was abandoned and cannot be submitted." });
    }

    const questions = interview.questions || [];

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

    let aiResult = null;
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

      const qaBlock = questions
        .map((q) => {
          const ans = normalizedAnswers.find((a) => a.order === q.order);
          const answerText = ans?.answerText || "(no answer)";
          return `Q${q.order}: ${q.question}\nA: ${answerText}\n`;
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

      let result;
      try {
        // 1. DENEME: Ana Model (2.5 Flash)
        console.log("Gemini 2.5 Flash ile deneniyor...");
        result = await generateWithRetry(genAI, "gemini-2.5-flash", prompt);
      
      } catch (primaryErr) {
        // 2. DENEME: Fallback Model (2.0 Flash)
        console.warn("❌ 2.5 Flash yanıt vermedi. Fallback: Gemini 2.0 Flash deneniyor...");
        result = await generateWithRetry(genAI, "gemini-2.0-flash", prompt);
      }

      // ✅ ESKİ PARSER MANTIĞI GERİ GELDİ (JSON.parse direct call)
      const rawText = result.response
        .text()
        .replace(/```/g, "")
        .trim();
      console.log("Gemini rawText:", rawText);

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
    res.status(500).json({
      message: "Server error during grading",
      error: error.message,
    });
  }
};

// ✅ HISTORY — sadece submitted göster (legacy submitted’ları da yakala)
export const getMyInterviews = async (req, res) => {
  try {
    const userId = req.userId;

    const interviews = await Interview.find({
      userId,
      $or: [
        { status: "submitted" },
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
    res.status(500).json({
      message: "Error fetching interviews",
      error: error.message,
    });
  }
};

// ✅ SINGLE DETAIL
export const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!interview) return res.status(404).json({ message: "Interview not found" });
    res.json(interview);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching interview details",
      error: error.message,
    });
  }
};

// ✅ ABANDON (Exit Interview)
export const abandonInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!interview) return res.status(404).json({ message: "Interview not found" });

    if (interview.status === "submitted") {
      return res.status(400).json({ message: "Submitted interviews cannot be abandoned." });
    }

    interview.status = "abandoned";
    interview.abandonedAt = new Date();
    await interview.save();

    return res.json({ message: "Interview abandoned successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error abandoning interview",
      error: error.message,
    });
  }
};
