import express from "express";
import spaceController from "../controllers/space.controller.js";
import validate from "../middleware/validate.js";
import {
  createSpaceSchema,
  createSpaceFromTextSchema,
  createSpaceFromVoiceSchema,
  updateSpaceDescriptionSchema,
  updateSpaceFontTextSchema,
  updateSpaceFontClockSchema,
  updateSpaceBackgroundSchema,
  updateSpacePositionSchema,
  spaceIdSchema,
} from "../validations/space.validation.js";

const router = express.Router();

// GET /api/spaces - Get all spaces
router.get("/", spaceController.getAll);

// POST /api/spaces - Create new space
router.post("/", validate(createSpaceSchema), spaceController.create);

// POST /api/spaces/text - Create new space by text
router.post(
  "/text",
  validate(createSpaceFromTextSchema),
  spaceController.createFromText
);

// POST /api/spaces/voice - Create new space by voice
router.post(
  "/voice",
  validate(createSpaceFromVoiceSchema),
  spaceController.createFromVoice
);

// GET /api/spaces/:id - Get space by ID
router.get("/:id", validate(spaceIdSchema, 'params'), spaceController.getById);

// PUT /api/spaces/:id/description - Update space description
router.put(
  "/:id/description",
  validate(spaceIdSchema, 'params'),
  validate(updateSpaceDescriptionSchema),
  spaceController.updateDescription
);

// PUT /api/spaces/:id/font-text - Update text font
router.put(
  "/:id/font-text",
  validate(spaceIdSchema, 'params'),
  validate(updateSpaceFontTextSchema),
  spaceController.updateFontText
);

// PUT /api/spaces/:id/font-clock - Update clock font
router.put(
  "/:id/font-clock",
  validate(spaceIdSchema, 'params'),
  validate(updateSpaceFontClockSchema),
  spaceController.updateFontClock
);

// PUT /api/spaces/:id/background - Update background
router.put(
  "/:id/background",
  validate(spaceIdSchema, 'params'),
  validate(updateSpaceBackgroundSchema),
  spaceController.updateBackground
);

// PUT /api/spaces/:id/position - Update widget positions
router.put(
  "/:id/position",
  validate(spaceIdSchema, 'params'),
  validate(updateSpacePositionSchema),
  spaceController.updatePosition
);

// DELETE /api/spaces/:id - Delete space
router.delete("/:id", validate(spaceIdSchema, 'params'), spaceController.delete);

// POST /api/spaces/:id/fork - Fork a space
router.post("/:id/fork", validate(spaceIdSchema, 'params'), spaceController.fork);

// DELETE /api/spaces/:id/fork/:forkId - Delete forked space
router.delete("/:id/fork/:forkId", validate(spaceIdSchema, 'params'), spaceController.deleteFork);

export default router;
