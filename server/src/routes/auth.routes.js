import express from "express";
import authController from "../controllers/auth.controller.js";
import validate from "../middleware/validate.js";
import { signupSchema, loginSchema, userIdSchema } from "../validations/user.validation.js";

const router = express.Router();

// POST /api/auth/signup - Register new user
router.post("/signup", validate(signupSchema), authController.signup);

// POST /api/auth/login - Login user
router.post("/login", validate(loginSchema), authController.login);

// DELETE /api/auth/:id/logout - Logout user
router.delete("/:id/logout", validate(userIdSchema, 'params'), authController.logout);

export default router;
