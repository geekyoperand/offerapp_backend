const mongoose = require('mongoose');
const { url } = require('../validations/custom.validation');
const { bannerTypes } = require('../constants/banner');
const { toJSON, paginate } = require('./plugins');

const bannerSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    activeFrom: {
      type: Date,
      default: Date.now,
      required: true,
    },
    activeTill: {
      type: Date,
      default: null,
    },
    link: {
      type: String,
    },
    slug: {
      type: String,
    },
    image: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(bannerTypes)
    },
    placeId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Place',
    },
    placeSelectedDate: {
      type: Date,
    },
    slotId: {
      type: mongoose.SchemaTypes.ObjectId,
    },
    url: {
      type: String,
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
bannerSchema.plugin(toJSON);
bannerSchema.plugin(paginate);

bannerSchema.path('link').validate(function (value) {
  return url(value);
}, 'Link must be a valid url');

bannerSchema.path('image').validate(function (value) {
  return url(value, true);
}, 'Image url must be a valid uri');

bannerSchema.pre('validate', async function (next) {
  const banner = this;
  if (banner.activeFrom > banner.activeTill) {
    next(new Error('active till must be greater than active from'));
  }
  next();
});

/**
 * @typedef Banner
 */
const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;
