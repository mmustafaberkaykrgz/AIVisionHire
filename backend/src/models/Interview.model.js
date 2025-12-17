// backend/models/Interview.model.js
import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema(
  {
    order: { type: Number, required: true },
    type: {
      type: String,
      enum: ["open", "mcq", "code"],
      default: "open",
    },
    question: { type: String, required: true },

    // MCQ için
    options: [{ type: String }],      // ["A", "B", "C", "D"]
    correctAnswer: { type: String },  // "A" ya da "useEffect"

    // Zaman (saniye)
    timeLimitSec: { type: Number },
  },
  { _id: false }
);

const AnswerSchema = new mongoose.Schema(
  {
    order: { type: Number, required: true },
    type: { type: String, enum: ["open", "mcq", "code"], default: "open" },

    // open & code cevapları
    answerText: { type: String },

    // MCQ için seçilen seçenek
    selectedOption: { type: String },
  },
  { _id: false }
);

const FeedbackSchema = new mongoose.Schema(
  {
    feedback: String,
    strengths: [String],
    weaknesses: [String],
    suggestions: [String],
  },
  { _id: false }
);

const InterviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    field: { type: String, required: true },

    difficulty: {
      type: String,
      enum: ["junior", "mid", "senior"],
      required: true,
    },

    questions: [QuestionSchema],

    answers: [AnswerSchema],

    aiFeedback: FeedbackSchema,

    score: { type: Number, default: 0 },

    // Tüm mülakat için toplam süre (saniye)
    timeLimitSeconds: { type: Number },
    // Interview status
    status: { type: String, enum: ["submitted", "abandoned", "in_progress"], default: "in_progress" },
  },
  { timestamps: true }
);

const Interview = mongoose.model("Interview", InterviewSchema);

export default Interview;

/*
Interview

id (PK)

userId (FK → Users.id)

domain (örn: "frontend", "backend", "devops", "mobile")

difficulty ("junior", "mid", "senior")

questions (JSON)

answers (JSON)

aiFeedback (JSON)

createdAt

Relation:

User 1 → N Interview
*/