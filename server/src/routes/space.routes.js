import express from "express";
import spaceController from "../controllers/space.controller.js";
import validate from "../middleware/validate.js";
import {
  createSpaceSchema,
  getSpacesQuerySchema,
  spaceIdSchema,
} from "../validations/space.validation.js";

const router = express.Router();

// POST /api/space - Create new space
router.post("/", validate(createSpaceSchema), spaceController.create);

// GET /api/space/:id - Get space by ID
router.get("/:id", validate(spaceIdSchema, 'params'), spaceController.getById);

// DELETE /api/space/:id - Soft delete space
router.delete("/:id", validate(spaceIdSchema, 'params'), spaceController.delete);

export default router;
