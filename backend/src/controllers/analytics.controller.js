import Interview from "../models/Interview.model.js";

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.userId;
    // Only count interviews that are completed (submitted) or legacy (no status)
    const interviews = await Interview.find({
      userId,
      $or: [
        { status: "submitted" },
        { status: { $exists: false } }
      ]
    }).sort({ createdAt: -1 });

    // If there are no completed interviews
    if (interviews.length === 0) {
      return res.json({
        totalInterviews: 0,
        averageScore: 0,
        topStrengths: [],
        topWeaknesses: [],
        recentActivity: []
      });
    }

    const totalInterviews = interviews.length;
    const totalScore = interviews.reduce((sum, interview) => {
      return sum + (typeof interview.score === "number" ? interview.score : 0);
    }, 0);
    const averageScore = Math.round(totalScore / totalInterviews);

    const allStrengths = [];
    const allWeaknesses = [];

    interviews.forEach((interview) => {
      if (!interview.aiFeedback) return;

      if (Array.isArray(interview.aiFeedback.strengths)) {
        allStrengths.push(...interview.aiFeedback.strengths);
      }

      if (Array.isArray(interview.aiFeedback.weaknesses)) {
        allWeaknesses.push(...interview.aiFeedback.weaknesses);
      }
    });

    const getTopTraits = (arr) => {
      const counts = {};
      arr.forEach((item) => {
        if (!item) return;
        const key = String(item).trim();
        if (!key) return;
        counts[key] = (counts[key] || 0) + 1;
      });

      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([key]) => key);
    };

    const recentActivity = interviews.slice(0, 5).map((i) => ({
      _id: i._id,
      field: i.field,
      difficulty: i.difficulty,
      score: i.score,
      createdAt: i.createdAt
    }));

    res.json({
      totalInterviews,
      averageScore,
      topStrengths: getTopTraits(allStrengths),
      topWeaknesses: getTopTraits(allWeaknesses),
      recentActivity
    });

  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({
      message: "Error generating dashboard stats",
      error: error.message
    });
  }
};