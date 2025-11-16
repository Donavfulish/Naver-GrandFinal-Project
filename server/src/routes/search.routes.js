import express from "express";
import spaceService from "../services/space.service.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { ErrorCodes } from "../constants/errorCodes.js";
import validate from "../middleware/validate.js";
import { searchSpacesSchema } from "../validations/space.validation.js";


const router = express.Router();

// GET /api/search/spaces
router.get(
  "/spaces",
  validate({ query: searchSpacesSchema }),
  asyncHandler(async (req, res) => {
    const { q, title, tag, author, limit = 20, offset = 0 } = req.query;

    try {
      const result = await spaceService.searchSpaces({
        q,
        title,
        tag,
        author,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      res.status(200).json({
        success: true,
        data: result.spaces,
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
          hasMore: result.offset + result.limit < result.total,
        },
      });
    } catch (error) {
      if (error.code === ErrorCodes.SPACE_VALIDATION_FAILED) {
        return res.status(error.statusCode || 422).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }

      return res.status(500).json({
        success: false,
        error: {
          code: ErrorCodes.SPACE_NOT_FOUND,
          message: "Failed to search spaces",
          details: error.message,
        },
      });
    }
  })
);

export default router;
