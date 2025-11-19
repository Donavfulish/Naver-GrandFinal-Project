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
  userId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.empty': 'userId không được để trống',
      'string.uuid': 'userId phải là UUID hợp lệ',
      'any.required': 'userId là bắt buộc'
    }),
  name: Joi.string()
    .min(1)
    .max(255)
    .required()
    .messages({
      'string.empty': 'Tên space không được để trống',
      'string.min': 'Tên space phải có ít nhất 1 ký tự',
      'string.max': 'Tên space không được vượt quá 255 ký tự',
      'any.required': 'Tên space là bắt buộc'
    }),
  description: Joi.string()
    .allow('', null)
    .max(1000)
    .messages({
      'string.max': 'Mô tả không được vượt quá 1000 ký tự'
    }),
  backgroundId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.empty': 'backgroundId không được để trống',
      'string.uuid': 'backgroundId phải là UUID hợp lệ',
      'any.required': 'backgroundId là bắt buộc'
    }),
  clockFontId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.empty': 'clockFontId không được để trống',
      'string.uuid': 'clockFontId phải là UUID hợp lệ',
      'any.required': 'clockFontId là bắt buộc'
    }),
  textFontId: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.empty': 'textFontId không được để trống',
      'string.uuid': 'textFontId phải là UUID hợp lệ',
      'any.required': 'textFontId là bắt buộc'
    }),
  tracks: Joi.array()
    .items(Joi.string().uuid())
    .default([])
    .messages({
      'array.base': 'Tracks phải là một mảng',
      'string.uuid': 'Mỗi track ID phải là UUID hợp lệ'
    }),
  prompt: Joi.string()
    .allow('', null)
    .max(1000)
    .messages({
      'string.max': 'Prompt không được vượt quá 1000 ký tự'
    }),
  tags: Joi.array()
    .items(Joi.string())
    .default([])
    .messages({
      'array.base': 'Tags phải là một mảng'
    })
});

export default {
  generateSchema,
  confirmGenerateSchema
};
