import Interview from "../models/Interview.model.js";

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.userId;
    const interviews = await Interview.find({ userId }).sort({ createdAt: -1 });
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
    const averageScore = Math.round(totalScore / totalInterviews);

    const allStrengths = [];
    const allWeaknesses = [];

    interviews.forEach(interview => {
        if (interview.aiFeedback) {
            if (Array.isArray(interview.aiFeedback.strengths)) {
                allStrengths.push(...interview.aiFeedback.strengths);
            }
            if (Array.isArray(interview.aiFeedback.weaknesses)) {
                allWeaknesses.push(...interview.aiFeedback.weaknesses);
            }
        }
    });
    const getTopTraits = (arr) => {
      const counts = {};
      arr.forEach(item => { 
          const key = item.trim(); 
          counts[key] = (counts[key] || 0) + 1; 
      });
      
      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1]) 
        .slice(0, 5) 
        .map(entry => entry[0]);
    };
    const recentActivity = interviews.slice(0, 5).map(i => ({
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
    res.status(500).json({ message: "Error generating dashboard stats", error: error.message });
  }
};