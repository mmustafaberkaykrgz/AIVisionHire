import express from "express";
import { startInterview,submitInterview } from "../controllers/interview.controller.js";
import { auth } from "../middleware/auth.middleware.js"; 
const router = express.Router();
router.post("/start", auth, startInterview);
router.post("/submit", auth, submitInterview);
export default router;