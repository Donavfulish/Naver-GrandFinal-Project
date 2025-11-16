import express from "express";
import userController from "../controllers/user.controller.js";
import validate from "../middleware/validate.js";
import {
  userIdSchema,
  updateUserNameSchema,
  updateUserEmailSchema,
  updateUserAvatarSchema,
} from "../validations/user.validation.js";

const router = express.Router();

// GET /api/users/:id - Get user by ID
router.get("/:id", validate(userIdSchema, 'params'), userController.getById);

// GET /api/users/:id/spaces - Get spaces by user ID
router.get(
  "/:id/spaces",
  validate(userIdSchema, 'params'),
  userController.getSpacesByUserId
);

// PATCH /api/users/:id/name - Update user name
router.patch(
  "/:id/name",
  validate(userIdSchema, 'params'),
  validate(updateUserNameSchema),
  userController.updateName
);

// PATCH /api/users/:id/email - Update user email
router.patch(
  "/:id/email",
  validate(userIdSchema, 'params'),
  validate(updateUserEmailSchema),
  userController.updateEmail
);

// PATCH /api/users/:id/avatar - Update user avatar
router.patch(
  "/:id/avatar",
  validate(userIdSchema, 'params'),
  validate(updateUserAvatarSchema),
  userController.updateAvatar
);

// PATCH /api/users/:id/password - Update user password
router.patch(
  "/:id/password",
  validate(userIdSchema, 'params'),
  validate(updateUserAvatarSchema),
  userController.updatePassword
);


// POST /api/users/:id - Delete user
router.post("/:id", validate(userIdSchema, 'params'), userController.delete);

export default router;
