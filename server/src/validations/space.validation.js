import Joi from 'joi';

// POST /space - Create space schema
export const createSpaceSchema = Joi.object({
  user_id: Joi.string().uuid().required().messages({
    'string.uuid': 'Invalid user ID format',
    'any.required': 'User ID is required',
  }),
  name: Joi.string().min(1).max(200).required().messages({
    'string.min': 'Name cannot be empty',
    'string.max': 'Name must not exceed 200 characters',
    'any.required': 'Name is required',
  }),
  tags: Joi.array().items(Joi.string().min(1).max(100)).min(1).required().messages({
    'array.min': 'At least one tag is required',
    'any.required': 'Tags are required',
    'string.min': 'Tag name cannot be empty',
    'string.max': 'Tag name must not exceed 100 characters',
  }),
  description: Joi.string().max(1000).allow(null, '').messages({
    'string.max': 'Description must not exceed 1000 characters',
  }),
  background_url: Joi.string().uri().allow(null, '').messages({
    'string.uri': 'Invalid background URL format',
  }),
  clock_font_id: Joi.string().uuid().allow(null).messages({
    'string.uuid': 'Invalid clock font ID format',
  }),
  text_font_id: Joi.string().uuid().allow(null).messages({
    'string.uuid': 'Invalid text font ID format',
  }),
  tracks: Joi.array().items(Joi.string().uuid()).optional().messages({
    'string.uuid': 'Invalid track ID format',
    'array.base': 'Tracks must be an array',
  }),
  prompt: Joi.string().max(1000).allow(null, '').optional().messages({
    'string.max': 'Prompt must not exceed 1000 characters',
  }),
});

// PATCH /space/:id - Update space schema
export const updateSpaceSchema = Joi.object({
  metadata: Joi.object({
    name: Joi.string().min(1).max(200).messages({
      'string.min': 'Name cannot be empty',
      'string.max': 'Name must not exceed 200 characters',
    }),
    description: Joi.string().max(1000).allow(null, '').messages({
      'string.max': 'Description must not exceed 1000 characters',
    }),
  }).optional(),
  appearance: Joi.object({
    background_url: Joi.string().uri().allow(null, '').messages({
      'string.uri': 'Invalid background URL format',
    }),
    clock_font_id: Joi.string().uuid().allow(null).messages({
      'string.uuid': 'Invalid clock font ID format',
    }),
    text_font_id: Joi.string().uuid().allow(null).messages({
      'string.uuid': 'Invalid text font ID format',
    }),
  }).optional(),
  tags: Joi.array().items(Joi.string().min(1).max(100)).min(1).messages({
    'array.min': 'At least one tag is required',
    'string.min': 'Tag name cannot be empty',
    'string.max': 'Tag name must not exceed 100 characters',
  }),
  playlist_links: Joi.object({
    add: Joi.array().items(Joi.string().uuid()).messages({
      'string.uuid': 'Invalid playlist ID format',
    }),
    remove: Joi.array().items(Joi.string().uuid()).messages({
      'string.uuid': 'Invalid playlist ID format',
    }),
  }).optional(),
}).min(1).messages({
  'object.min': 'At least one update field is required',
});

// GET /space?user_id=xxx query validation
export const getSpacesQuerySchema = Joi.object({
  user_id: Joi.string().uuid().optional().messages({
    'string.uuid': 'Invalid user ID format',
  }),
});

// Params validation for :id
export const spaceIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.uuid': 'Invalid space ID format',
    'any.required': 'Space ID is required',
  }),
});

// GET /search/spaces query validation
export const searchSpacesSchema = Joi.object({
  q: Joi.string().min(1).max(200).optional().messages({
    'string.min': 'Search query cannot be empty',
    'string.max': 'Search query must not exceed 200 characters',
  }),
  title: Joi.string().min(1).max(200).optional().messages({
    'string.min': 'Title search cannot be empty',
    'string.max': 'Title search must not exceed 200 characters',
  }),
  tag: Joi.string().uuid().optional().messages({
    'string.uuid': 'Invalid tag ID format',
  }),
  author: Joi.string().uuid().optional().messages({
    'string.uuid': 'Invalid author ID format',
  }),
  limit: Joi.number().integer().min(1).max(100).default(20).optional().messages({
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit must not exceed 100',
  }),
  offset: Joi.number().integer().min(0).default(0).optional().messages({
    'number.min': 'Offset must be at least 0',
  }),
}).min(1).messages({
  'object.min': 'At least one search parameter is required',
});
