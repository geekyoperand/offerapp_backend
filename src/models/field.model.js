const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { fieldLanguages, fieldTypes } = require('../constants');

const fieldSchema = mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    label: {
      type: String,
      required: true,
    },
    defaultValue: {
      type: String,
    },
    type: {
      type: String,
      enum: Object.values(fieldTypes),
      required: true,
    },
    maxLength: {
      type: Number,
      min: 1,
      max: 100,
    },
    minLength: {
      type: Number,
      min: 1,
      max: 100,
    },
    required: {
      type: Boolean,
      default: false,
      required: true,
    },
    language: {
      type: String,
      enum: Object.values(fieldLanguages),
      default: fieldLanguages.ENGLISH,
      required: true,
    },
    formId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Form',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
    deletedBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
fieldSchema.plugin(toJSON);
fieldSchema.plugin(paginate);

fieldSchema.pre('validate', async function (next) {
  const field = this;
  if (field.maxLength >= field.minLength) {
    next(new Error('max length must be greater or equal than min length'));
  }
  next();
});

/**
 * @typedef Field
 */
const Field = mongoose.model('Field', fieldSchema);

module.exports = Field;
