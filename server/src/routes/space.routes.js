import express from "express";
import spaceController from "../controllers/space.controller.js";
import validate from "../middleware/validate.js";
import {
  createSpaceSchema,
  spaceIdSchema,
  updateSpaceSummarySchema,
  addNoteSchema,
  noteIdSchema,
} from "../validations/space.validation.js";

const router = express.Router();

// GET /api/spaces/fonts/clock - Must be before /:id route
router.get("/fonts/clock", spaceController.getClockFonts);

// GET /api/spaces/fonts/text - Must be before /:id route
router.get("/fonts/text", spaceController.getTextFonts);

// GET /api/spaces/backgrounds - Get all backgrounds
router.get("/backgrounds", spaceController.getBackgrounds);

// GET /api/spaces/dashboard - Get spaces for dashboard
router.get("/dashboard", spaceController.getDashboardSpaces);

// POST /api/spaces - Create new space
router.post("/", validate(createSpaceSchema), spaceController.create);

// GET /api/spaces/:id - Get space by ID
router.get("/:id", validate(spaceIdSchema, 'params'), spaceController.getById);

// DELETE /api/spaces/:id - Soft delete space
router.delete("/:id", validate(spaceIdSchema, 'params'), spaceController.delete);

// POST /api/spaces/:id/note - Add note to space
router.post(
  "/:id/note",
  validate(spaceIdSchema, 'params'),
  validate(addNoteSchema),
  spaceController.addNote
);

// DELETE /api/spaces/:id/note/:noteId - Remove note from space (soft delete)
router.delete(
  "/:id/note/:noteId",
  validate(noteIdSchema, 'params'),
  spaceController.removeNote
);

export default router;
