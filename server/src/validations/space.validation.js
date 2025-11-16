import Joi from 'joi';

// Widget position schema for validation
const widgetPositionSchema = Joi.object({
  widget_id: Joi.string().required().messages({
    'any.required': 'Widget ID is required',
  }),
  x: Joi.number().required().messages({
    'any.required': 'X coordinate is required',
  }),
  y: Joi.number().required().messages({
    'any.required': 'Y coordinate is required',
  }),
  metadata: Joi.object().optional(),
});

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
  tags: Joi.array().items(Joi.string().uuid()).min(1).required().messages({
    'array.min': 'At least one tag is required',
    'any.required': 'Tags are required',
    'string.uuid': 'Invalid tag ID format',
  }),
  description: Joi.string().max(1000).allow(null, '').messages({
    'string.max': 'Description must not exceed 1000 characters',
  }),
  background_id: Joi.string().uuid().allow(null).messages({
    'string.uuid': 'Invalid background ID format',
  }),
  clock_font_id: Joi.string().uuid().allow(null).messages({
    'string.uuid': 'Invalid clock font ID format',
  }),
  text_font_name: Joi.string().max(100).allow(null, '').messages({
    'string.max': 'Font name must not exceed 100 characters',
  }),
  playlist_ids: Joi.array().items(Joi.string().uuid()).optional().messages({
    'string.uuid': 'Invalid playlist ID format',
  }),
  widget_positions: Joi.array().items(widgetPositionSchema).optional(),
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
    background_id: Joi.string().uuid().allow(null).messages({
      'string.uuid': 'Invalid background ID format',
    }),
    clock_font_id: Joi.string().uuid().allow(null).messages({
      'string.uuid': 'Invalid clock font ID format',
    }),
    text_font_name: Joi.string().max(100).allow(null, '').messages({
      'string.max': 'Font name must not exceed 100 characters',
    }),
  }).optional(),
  tags: Joi.array().items(Joi.string().uuid()).min(1).messages({
    'array.min': 'At least one tag is required',
    'string.uuid': 'Invalid tag ID format',
  }),
  playlist_links: Joi.object({
    add: Joi.array().items(Joi.string().uuid()).messages({
      'string.uuid': 'Invalid playlist ID format',
    }),
    remove: Joi.array().items(Joi.string().uuid()).messages({
      'string.uuid': 'Invalid playlist ID format',
    }),
  }).optional(),
  widgets: Joi.array().items(widgetPositionSchema).optional(),
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
