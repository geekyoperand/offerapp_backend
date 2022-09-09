const Joi = require('joi');
const { categoryImageTypes } = require('../constants/category');
const { objectId } = require('./custom.validation');

const createCategory = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    code: Joi.string().required(),
    type: Joi.string().required(),
    image: Joi.string(),
    imgType: Joi.string()
      .when('image', { is: Joi.exist(), then: Joi.required() })
      .valid(...Object.values(categoryImageTypes)),
    parentId: Joi.string().custom(objectId),
    backgroundColor: Joi.string(),
    backgroundImg: Joi.string().uri(),
    imageColor: Joi.string(),
  }),
};

const getMyCategory = {
  body: Joi.object().keys({}),
};

const getCategories = {
  query: Joi.object().keys({
    name: Joi.string(),
    code: Joi.string(),
    type: Joi.string(),
    parentId: Joi.string().custom(objectId),
    backgroundColor: Joi.string(),
    imageColor: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getAllCategories = {
  query: Joi.object().keys({
    // TODO - Recheck if we need this
    // name: Joi.string(),
    // code: Joi.string(),
    // parentId: Joi.string().custom(objectId),
  }),
};

const getCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().custom(objectId).required(),
  }),
};

const updateCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      code: Joi.string(),
      parentId: Joi.string().custom(objectId),
      type: Joi.string().required(),
      image: Joi.string(),
      backgroundColor: Joi.string(),
      backgroundImg: Joi.string().uri(),
      imageColor: Joi.string(),
      imgType: Joi.string()
        .when('image', { is: Joi.exist(), then: Joi.required() })
        .valid(...Object.values(categoryImageTypes)),
    })
    .min(1),
};

const deleteCategory = {
  params: Joi.object().keys({
    categoryId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  getMyCategory,
  getAllCategories,
};
