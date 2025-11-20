import express from "express";
import spaceController from "../controllers/space.controller.js";
import validate from "../middleware/validate.js";
import {
  createSpaceSchema,
  spaceIdSchema,
  updateSpaceSummarySchema,
} from "../validations/space.validation.js";

const router = express.Router();

// GET /api/spaces/fonts/clock - Must be before /:id route
router.get("/fonts/clock", spaceController.getClockFonts);

// GET /api/spaces/fonts/text - Must be before /:id route
router.get("/fonts/text", spaceController.getTextFonts);

// POST /api/spaces - Create new space
router.post("/", validate(createSpaceSchema), spaceController.create);

// GET /api/spaces/:id - Get space by ID
router.get("/:id", validate(spaceIdSchema, 'params'), spaceController.getById);

// POST /api/spaces/:id/summary - Update space summary (duration, AI content, mood)
router.post(
  "/:id/summary",
  validate(spaceIdSchema, 'params'),
  validate(updateSpaceSummarySchema),
  spaceController.getSpacesSummary
);

// DELETE /api/spaces/:id - Soft delete space
router.delete("/:id", validate(spaceIdSchema, 'params'), spaceController.delete);

export default router;
