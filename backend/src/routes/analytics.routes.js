import express from "express";
import { getDashboardStats } from "../controllers/analytics.controller.js";
import { auth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/dashboard", auth, getDashboardStats);

export default router;