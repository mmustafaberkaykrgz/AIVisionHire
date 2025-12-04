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
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
    let text = response.text();

    text = text
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
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (interview.userId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 

    const prompt = `
      You are a strict technical interviewer. Evaluate the candidate's answers based on the questions.
      
      Questions and Candidate Answers:
      ${JSON.stringify(answers)}

      Provide a detailed evaluation in strict JSON format.
      Format:
      {
        "score": (number 0-100),
        "feedback": "General summary of the interview performance",
        "strengths": ["strength 1", "strength 2"],
        "weaknesses": ["weakness 1", "weakness 2"],
        "suggestions": ["suggestion 1", "suggestion 2"]
      }
    `;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    let analysisResult;
    try {
      analysisResult = JSON.parse(text);
    } catch (err) {
       analysisResult = { score: 0, feedback: "AI Analysis Error", strengths: [], weaknesses: [], suggestions: [] };
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