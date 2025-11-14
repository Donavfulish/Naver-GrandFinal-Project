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

// PUT /api/users/:id/name - Update user name
router.put(
  "/:id/name",
  validate(userIdSchema, 'params'),
  validate(updateUserNameSchema),
  userController.updateName
);

// PUT /api/users/:id/email - Update user email
router.put(
  "/:id/email",
  validate(userIdSchema, 'params'),
  validate(updateUserEmailSchema),
  userController.updateEmail
);

// PUT /api/users/:id/avatar - Update user avatar
router.put(
  "/:id/avatar",
  validate(userIdSchema, 'params'),
  validate(updateUserAvatarSchema),
  userController.updateAvatar
);

// PUT /api/users/:id/password - Update user password
router.put(
  "/:id/password",
  validate(userIdSchema, 'params'),
  validate(updateUserAvatarSchema),
  userController.updatePassword
);


// DELETE /api/users/:id - Delete user
router.delete("/:id", validate(userIdSchema, 'params'), userController.delete);

export default router;
