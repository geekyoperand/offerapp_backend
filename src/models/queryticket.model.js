const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { queryTicketTypes, queryTicketStatuses } = require('../constants');

const queryTicketSchema = mongoose.Schema(
  {
    messages: {
      type: [
        {
          _id: {
            type: Number,
            required: true,
          },
          isSupportUser: {
            type: Boolean,
            default: false,
          },
          type: {
            type: String,
          },
          createdAt: {
            type: Date,
            required: true,
          },
          text: {
            type: String,
            default: '',
          },
          image: {
            type: String,
          },
          system: {
            type: Boolean,
          },
        },
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(queryTicketTypes),
      required: true,
    },
    orderId: {
      type: String,
      ref: 'Order',
    },
    placeId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Place',
    },
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    firebaseRealtimeChatId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: Object.values(queryTicketStatuses),
      default: queryTicketStatuses.OPEN,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      required: true,
    },
    createdBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      // required: true,
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
queryTicketSchema.plugin(toJSON);
queryTicketSchema.plugin(paginate);

// queryTicketSchema.path('comments').validate(function (value) {
//   if (value && value.length > 0) {
//     const comment = value[0];
//     if (comment.images) {
//       const isFound = comment.images.find((image) => !url(image));
//       return isFound;
//     }
//     return true;
//   }
//   return true;
// }, 'Image url must be a valid uri');

/**
 * @typedef QueryTicket
 */
const QueryTicket = mongoose.model('QueryTicket', queryTicketSchema);

module.exports = QueryTicket;
