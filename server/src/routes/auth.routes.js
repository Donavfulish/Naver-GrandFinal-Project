import express from "express";
import authController from "../controllers/auth.controller.js";
import validate from "../middleware/validate.js";
import { signupSchema, loginSchema } from "../validations/user.validation.js";

const router = express.Router();

// POST /api/auth/signup - Register new user
router.post("/signup", validate(signupSchema), authController.signup);

// POST /api/auth/login - Login user
router.post("/login", validate(loginSchema), authController.login);

export default router;
