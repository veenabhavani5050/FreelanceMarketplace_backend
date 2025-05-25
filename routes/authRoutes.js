import express from "express";
import { registerUser, authUser } from "../controllers/authController.js";

const router = express.Router();

// Route to register a new user
router.post("/register", registerUser);

// Route to authenticate an existing user
router.post("/login", authUser);

export default router;
