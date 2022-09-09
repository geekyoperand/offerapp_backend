const mongoose = require('mongoose');
const { url } = require('../validations/custom.validation');
const { toJSON, paginate } = require('./plugins');
const { meridiemTypes } = require('../constants/place');

const placeSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    consentByManager: {
      type: Boolean,
      required: true,
      enum: [true],
    },
    locatedArea: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    location: {
      longitude: {
        type: Number,
        // required: true,
      },
      latitude: {
        type: Number,
        // required: true,
      },
    },
    locationId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Category',
      required: true,
    },
    keywords: [
      {
        type: String,
      },
    ],
    categoryId: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Category',
      },
    ],
    closedDays: {
      type: [
        {
          type: Number,
          min: 1,
          max: 7,
          required: true,
        },
      ],
      default: [],
    },
    specificOffDays: {
      type: [{ type: Date, required: true }],
    },
    images: {
      type: [
        {
          type: String,
          required: true,
        },
      ],
      default: [],
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      default: 5,
    },
    featuredOrder: {
      type: Number,
    },
    popularOrder: {
      type: Number,
    },
    logo: {
      type: String,
      required: true,
    },
    type: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Category',
      required: true,
    },
    slots: [
      {
        name: { type: String, required: true },
        startTime: {
          hour: {
            type: Number,
            default: 8,
            required: true,
          },
          minute: {
            type: Number,
            default: 0,
            required: true,
          },
          meridiem: {
            type: String,
            default: meridiemTypes.PM,
            required: true,
            enum: Object.values(meridiemTypes),
          },
        },
        endTime: {
          hour: {
            type: Number,
            default: 4,
            required: true,
          },
          minute: {
            type: Number,
            default: 0,
            required: true,
          },
          meridiem: {
            type: String,
            default: meridiemTypes.AM,
            required: true,
            enum: Object.values(meridiemTypes),
          },
        },
        placeDescription: {
          type: String,
          required: true,
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
        complementaries: [
          {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'Category',
          },
        ],
        inactiveOn: {
          type: [{ type: Date, required: true }],
        },
        // isDefault: {
        //   type: Boolean,
        //   required: true,
        // },
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
    ],
    isTemporarilyClosed: {
      type: Boolean,
      default: false,
    },
    bookingCount: {
      type: Number,
      default: 0,
      required: true,
    },
    tags: [
      {
        name: { type: String, required: true },
        textColor: { type: String, required: true },
        backgroundColor: { type: String, required: true },
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
    },
    shortTagline: {
      type: String,
      trim: true,
      required: true,
    },
    favoriteCount: {
      type: Number,
      default: 0,
      required: true,
    },
    viewCount: {
      type: Number,
      default: 0,
      required: true,
    },
    managerId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
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
placeSchema.plugin(toJSON);
placeSchema.plugin(paginate);

placeSchema.index({ name: 1 });

placeSchema.index({
  name: 1,
});
placeSchema.set('autoIndex', true);

placeSchema.path('images').validate(function (value) {
  if (value && value.length > 0) {
    return value.find((ele) => !url(ele, true));
  }
  return false;
}, 'Link must be a valid url');

placeSchema.path('logo').validate(function (value) {
  return url(value, true);
}, 'Image url must be a valid uri');

/**
 * @typedef Place
 */
const Place = mongoose.model('Place', placeSchema);

Place.collection.dropIndex('name', function (err, result) {
  // if (err) {
  //   console.log('Error in dropping index!', err);
  // }
  // console.log('Place Indexed dropped ');
});

Place.on('index', (error) => {
  if (error) {
    console.error(error);
    return;
  }
  console.log('Place index created');
});

module.exports = Place;
