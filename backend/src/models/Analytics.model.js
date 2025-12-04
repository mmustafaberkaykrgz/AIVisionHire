import mongoose from "mongoose";

const AnalyticsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
      unique: true, 
    },

    score: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },

    strengths: {
      type: [String], 
      default: [],
    },

    weaknesses: {
      type: [String],
      default: [],
    },

    suggestions: {
      type: [String], 
      default: [],
    },

  },
  { timestamps: true }
);

const Analytics=mongoose.model("Analytics", AnalyticsSchema);
export default Analytics;


/*
Analytics

id (PK)

userId (FK → Users.id)

interviewId (FK → Interviews.id)

score (0–100)

strengths (JSON)

weaknesses (JSON)

suggestions (JSON)

createdAt

Relations:

User 1 → N Analytics

Interview 1 → 1 Analytics
*/