import Joi from 'joi';

// Space validation schemas
export const createSpaceSchema = Joi.object({
  user_id: Joi.string().uuid().required().messages({
    'string.uuid': 'Invalid user ID format',
    'any.required': 'User ID is required',
  }),
  title: Joi.string().min(1).max(200).allow(null, '').messages({
    'string.max': 'Title must not exceed 200 characters',
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
});

// Create space from text input
export const createSpaceFromTextSchema = Joi.object({
  user_id: Joi.string().uuid().required().messages({
    'string.uuid': 'Invalid user ID format',
    'any.required': 'User ID is required',
  }),
  text_input: Joi.string().min(1).max(5000).required().messages({
    'string.min': 'Text input cannot be empty',
    'string.max': 'Text input must not exceed 5000 characters',
    'any.required': 'Text input is required',
  }),
});

// Create space from voice input
export const createSpaceFromVoiceSchema = Joi.object({
  user_id: Joi.string().uuid().required().messages({
    'string.uuid': 'Invalid user ID format',
    'any.required': 'User ID is required',
  }),
  audio_url: Joi.string().uri().required().messages({
    'string.uri': 'Invalid audio URL format',
    'any.required': 'Audio URL is required',
  }),
  // Alternative: if sending base64 audio data
  audio_data: Joi.string().allow(null, '').messages({
    'string.base': 'Audio data must be a string',
  }),
});

export const updateSpaceDescriptionSchema = Joi.object({
  description: Joi.string().max(1000).allow(null, '').messages({
    'string.max': 'Description must not exceed 1000 characters',
  }),
});

export const updateSpaceFontTextSchema = Joi.object({
  text_font_name: Joi.string().max(100).required().messages({
    'string.max': 'Font name must not exceed 100 characters',
    'any.required': 'Text font name is required',
  }),
});

export const updateSpaceFontClockSchema = Joi.object({
  clock_font_id: Joi.string().uuid().required().messages({
    'string.uuid': 'Invalid clock font ID format',
    'any.required': 'Clock font ID is required',
  }),
});

export const updateSpaceBackgroundSchema = Joi.object({
  background_id: Joi.string().uuid().required().messages({
    'string.uuid': 'Invalid background ID format',
    'any.required': 'Background ID is required',
  }),
});

export const updateSpacePositionSchema = Joi.object({
  positions: Joi.array().items(
    Joi.object({
      widget_name: Joi.string().required(),
      x_position: Joi.number().required(),
      y_position: Joi.number().required(),
    })
  ).required().messages({
    'any.required': 'Positions array is required',
  }),
});

export const spaceIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.uuid': 'Invalid space ID format',
    'any.required': 'Space ID is required',
  }),
});
