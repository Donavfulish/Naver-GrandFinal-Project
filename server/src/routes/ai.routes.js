import express from "express";
import aiController from "../controllers/ai.controller.js";
import validate from "../middleware/validate.js";
import { generateSchema, confirmGenerateSchema } from "../validations/ai.validation.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// POST /api/ai/generate - Generate AI content based on prompt
router.post('/generate', validate(generateSchema), aiController.generate);

// POST /api/ai/generate/confirm - Confirm and save AI generated space
router.post('/generate/confirm', authenticate, validate(confirmGenerateSchema), aiController.confirmGenerate);

export default router;
