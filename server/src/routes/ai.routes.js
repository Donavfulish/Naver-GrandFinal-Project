import express from "express";
import aiController from "../controllers/ai.controller.js";
import validate from "../middleware/validate.js";
import { generateSchema, confirmGenerateSchema, checkoutSchema } from "../validations/ai.validation.js";

const router = express.Router();

// POST /api/ai/generate - Generate AI content based on prompt
router.post('/generate', validate(generateSchema), aiController.generate);

// POST /api/ai/generate/confirm - Confirm and save AI generated space
router.post('/generate/confirm', validate(confirmGenerateSchema), aiController.confirmGenerate);

// POST /api/ai/checkout - Context-aware reflection for emotional checkout
router.post('/checkout', validate(checkoutSchema), aiController.checkout);


export default router;
