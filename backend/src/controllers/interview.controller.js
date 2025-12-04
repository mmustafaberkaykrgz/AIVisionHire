import { GoogleGenerativeAI } from "@google/generative-ai";
import Interview from "../models/Interview.model.js";

export const startInterview = async (req, res) => {
  try {
    const { field, difficulty } = req.body;
    const userId = req.userId;

    if (!field || !difficulty) {
      return res.status(400).json({ message: "Field and difficulty are required." });
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Model ismini güncel tutalım

    const prompt = `
      You are an experienced technical interviewer. 
      Field: ${field}
      Difficulty Level: ${difficulty}
      
      Please generate 5 technical interview questions for this candidate.
      Return the response in strict raw JSON format only. Do not use Markdown code blocks.
      
      The format must be exactly like this:
      [
        { "question": "Question text goes here", "order": 1 },
        { "question": "Question text goes here", "order": 2 }
      ]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text()
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let questionsData;

    try {
      questionsData = JSON.parse(text);
    } catch (err) {
      console.error("AI JSON Parse Hatası:", text);
      return res.status(500).json({
        message: "AI failed to generate valid JSON.",
        rawOutput: text
      });
    }

    const newInterview = await Interview.create({
      userId,
      field,
      difficulty,
      questions: questionsData,
      answers: [],
      aiFeedback: null, 
    });

    return res.status(201).json({
      message: "Interview started successfully",
      interviewId: newInterview._id,
      questions: newInterview.questions
    });

  } catch (error) {
    console.error("startInterview Hatası:", error);
    return res.status(500).json({
      message: "Something went wrong.",
      error: error.message
    });
  }
};

export const submitInterview = async (req, res) => {
  try {
    const { interviewId, answers } = req.body; 
    const userId = req.userId;

    const interview = await Interview.findById(interviewId);
    if (!interview) return res.status(404).json({ message: "Interview not found" });
    if (interview.userId.toString() !== userId) return res.status(403).json({ message: "Unauthorized" });
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 

    const prompt = `
      You are an expert technical interviewer. Evaluate the candidate's answers.
      
      Context:
      Field: ${interview.field}
      Difficulty: ${interview.difficulty}

      Questions and Answers:
      ${JSON.stringify(answers)}

      Output Requirement:
      Return ONLY raw JSON. No markdown.
      Format:
      {
        "score": number (0-100),
        "feedback": "general feedback string",
        "strengths": ["point 1", "point 2"],
        "weaknesses": ["point 1", "point 2"],
        "suggestions": ["suggestion 1", "suggestion 2"]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().replace(/```json/gi, "").replace(/```/g, "").trim();

    let analysisResult;
    try {
        analysisResult = JSON.parse(text);
    } catch (err) {
        console.error("AI Evaluation Parse Error:", text);
        return res.status(500).json({ message: "AI evaluation failed", raw: text });
    }
    interview.answers = answers;
    interview.score = analysisResult.score;
    interview.aiFeedback = analysisResult; 
    
    await interview.save();
    res.json({
      message: "Interview submitted and graded",
      score: interview.score,
      feedback: interview.aiFeedback
    });

  } catch (error) {
    console.error("Submit Error:", error);
    res.status(500).json({ message: "Server error during grading", error: error.message });
  }
};

export const getMyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.userId })
      .select("field difficulty score createdAt") 
      .sort({ createdAt: -1 });

    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching interviews", error: error.message });
  }
};

export const getInterviewById = async (req, res) => {
  try {
    const interview = await Interview.findOne({ 
      _id: req.params.id, 
      userId: req.userId 
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: "Error fetching interview details", error: error.message });
  }
};