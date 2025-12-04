import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import interviewRoutes from "./routes/interview.routes.js"; 
import analyticsRoutes from "./routes/analytics.routes.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "AI Interview Backend Running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/interview", interviewRoutes); 
app.use("/api/analytics", analyticsRoutes);
export default app;