import express from "express";
import { startInterview,submitInterview,getMyInterviews,getInterviewById} from "../controllers/interview.controller.js";
import { auth } from "../middleware/auth.middleware.js"; 
const router = express.Router();
router.post("/start", auth, startInterview);
router.post("/submit", auth, submitInterview);
router.get("/my-interviews", auth, getMyInterviews); 
router.get("/:id", auth, getInterviewById);          
export default router;