import express from "express";
import aiController from "../controllers/ai.controller.js";
import validate from "../middleware/validate.js";
import { generateSchema, confirmGenerateSchema, checkoutSchema, mindSchema } from "../validations/ai.validation.js";

const router = express.Router();

// POST /api/ai/generate - Generate AI content based on prompt
router.post('/generate', validate(generateSchema), aiController.generate);

// POST /api/ai/checkout - Context-aware reflection for emotional checkout
router.post('/checkout', validate(checkoutSchema), aiController.checkout);

// POST /api/ai/mind - Generate user mind description based on 10 most recent spaces
router.post('/mind', validate(mindSchema), aiController.mind);

export default router;
