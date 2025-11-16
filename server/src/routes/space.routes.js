import express from "express";
import spaceController from "../controllers/space.controller.js";
import validate from "../middleware/validate.js";
import {
  createSpaceSchema,
  updateSpaceSchema,
  getSpacesQuerySchema,
  spaceIdSchema,
} from "../validations/space.validation.js";

const router = express.Router();

// TODO: Add authentication middleware
// TODO: Add ownership verification middleware

// GET /api/space - List spaces with optional filtering
router.get("/", validate(getSpacesQuerySchema, 'query'), spaceController.getAll);

// POST /api/space - Create new space
router.post("/", validate(createSpaceSchema), spaceController.create);

// GET /api/space/:id - Get space by ID
router.get("/:id", validate(spaceIdSchema, 'params'), spaceController.getById);

// PATCH /api/space/:id - Update space (metadata, appearance, tags, playlists, widgets)
router.patch(
  "/:id",
  validate(spaceIdSchema, 'params'),
  validate(updateSpaceSchema),
  spaceController.update
);

// DELETE /api/space/:id - Soft delete space
router.delete("/:id", validate(spaceIdSchema, 'params'), spaceController.delete);

export default router;
