import Joi from 'joi';

export const generateSchema = Joi.object({
  prompt: Joi.string()
    .min(10)
    .max(1000)
    .required()
    .messages({
      'string.empty': 'Prompt không được để trống',
      'string.min': 'Prompt phải có ít nhất 10 ký tự',
      'string.max': 'Prompt không được vượt quá 1000 ký tự',
      'any.required': 'Prompt là bắt buộc'
    })
});

export const confirmGenerateSchema = Joi.object({
  generatedSpace: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().allow('', null),
    clock_font: Joi.object({
      id: Joi.string().uuid().required(),
      name: Joi.string().required()
    }).required(),
    text_font: Joi.object({
      id: Joi.string().uuid().required(),
      name: Joi.string().required()
    }).required(),
    background: Joi.object({
      id: Joi.string().uuid().required(),
      url: Joi.string().required(),
      emotion: Joi.array().items(Joi.string()),
      tags: Joi.array().items(Joi.string())
    }).required(),
    playlist: Joi.object({
      name: Joi.string().required(),
      tracks: Joi.array().items(
        Joi.object({
          id: Joi.string().uuid().required(),
          name: Joi.string(),
          thumbnail: Joi.string().allow(null),
          track_url: Joi.string(),
          emotion: Joi.array().items(Joi.string()),
          tags: Joi.array().items(Joi.string()),
          order: Joi.number().integer()
        })
      )
    }),
    prompt: Joi.string()
  }).required()
});

export default {
  generateSchema,
  confirmGenerateSchema
};

