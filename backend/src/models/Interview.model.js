import mongoose from "mongoose";

const InterviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  field: { type: String, required: true }, 

  questions: [
    {
      question: String,
      order: Number
    }
  ],

  answers: [
    {
      question: String,
      answer: String,
      order: Number
    }
  ],

 difficulty: { type: String, required: true }, 
  aiFeedback: { type: Object }, 

  score: { type: Number },        
  duration: { type: Number },    

}, { timestamps: true });

const Interview= mongoose.model("Interview", InterviewSchema);

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