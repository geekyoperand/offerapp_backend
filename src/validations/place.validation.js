const Joi = require('joi');
const { meridiemTypes } = require('../constants/place');
const { objectId } = require('./custom.validation');

const createPlace = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    consentByManager: Joi.boolean().required().valid(true),
    locatedArea: Joi.string().required(),
    address: Joi.string().required(),
    location: Joi.object().keys({
      longitude: Joi.number().required(),
      latitude: Joi.number().required(),
    }), // .required(),
    isPublished: Joi.boolean(),
    keywords: Joi.array().items(Joi.string().required()).max(3),
    categoryId: Joi.array().items(Joi.string().custom(objectId).required()),
    closedDays: Joi.array().items(Joi.number().required().min(1).max(7)),
    specificOffDays: Joi.array().items(Joi.date().required()),
    images: Joi.array().items(Joi.string().uri().required()).required().min(1).max(10),
    logo: Joi.string().uri().required(),
    type: Joi.string().custom(objectId).required(),
    tags: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          textColor: Joi.string().required(),
          backgroundColor: Joi.string().required(),
        })
      )
      .required()
      .min(2)
      .max(2),
    shortTagline: Joi.string().required(),
  }),
};

const addSlot = {
  params: Joi.object().keys({
    placeId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    name: Joi.string().required(),
    placeDescription: Joi.string().required(),
    // isDefault: Joi.boolean().required(),
    startTime: Joi.object()
      .keys({
        hour: Joi.number().required().min(0).max(11),
        minute: Joi.number().required().min(0).max(59),
        meridiem: Joi.string()
          .valid(...Object.values(meridiemTypes))
          .required(),
      })
      .required(),
    endTime: Joi.object()
      .keys({
        hour: Joi.number().required().min(0).max(11),
        minute: Joi.number().required().min(0).max(59),
        meridiem: Joi.string()
          .valid(...Object.values(meridiemTypes))
          .required(),
      })
      .required(),
    activeFrom: Joi.date(),
    activeTill: Joi.date().greater('now').min(Joi.ref('activeFrom')),
    inactiveOn: Joi.array().items(Joi.date().required()),
    complementaries: Joi.array().items(Joi.string().custom(objectId).required()).required().min(1),
  }),
};

const updateSlot = {
  params: Joi.object().keys({
    slotId: Joi.string().custom(objectId).required(),
    placeId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    placeDescription: Joi.string(),
    // isDefault: Joi.boolean(),
    startTime: Joi.object().keys({
      hour: Joi.number().required().min(0).max(11),
      minute: Joi.number().required().min(0).max(59),
      meridiem: Joi.string()
        .valid(...Object.values(meridiemTypes))
        .required(),
    }),
    endTime: Joi.object().keys({
      hour: Joi.number().required().min(0).max(11),
      minute: Joi.number().required().min(0).max(59),
      meridiem: Joi.string()
        .valid(...Object.values(meridiemTypes))
        .required(),
    }),
    activeFrom: Joi.date(),
    activeTill: Joi.date().greater('now').min(Joi.ref('activeFrom')),
    inactiveOn: Joi.array().items(Joi.date().required()),
    complementaries: Joi.array().items(Joi.string().custom(objectId).required()).min(1),
  }),
};

const searchPlaces = {
  query: Joi.object().keys({
    text: Joi.string(),
    placeTypes: Joi.string(),
    locations: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getPlaces = {
  query: Joi.object().keys({
    name: Joi.string(),
    address: Joi.string(),
    isTemporarilyClosed: Joi.boolean(),
    categoryId: Joi.string().custom(objectId),
    ageLimit: Joi.number(),
    isFeatured: Joi.number(),
    managerId: Joi.string().custom(objectId),
    locations: Joi.string(),
    isTypeBased: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getPlace = {
  params: Joi.object().keys({
    placeId: Joi.string().custom(objectId).required(),
  }),
};

const changePrice = {
  params: Joi.object().keys({
    placeId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    entryFee: Joi.number().min(0).required(),
  }),
};

const getSlots = {
  params: Joi.object().keys({
    placeId: Joi.string().custom(objectId).required(),
  }),
};

const updatePlace = {
  params: Joi.object().keys({
    placeId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
      consentByManager: Joi.boolean().valid(true),
      locatedArea: Joi.string(),
      address: Joi.string(),
      location: Joi.object().keys({
        longitude: Joi.number().required(),
        latitude: Joi.number().required(),
      }), // .required(),
      isPublished: Joi.boolean(),
      keywords: Joi.array().items(Joi.string().required()).max(3),
      categoryId: Joi.array().items(Joi.string().custom(objectId).required()),
      closedDays: Joi.array().items(Joi.number().required().min(1).max(7)),
      specificOffDays: Joi.array().items(Joi.date().required()),
      images: Joi.array().items(Joi.string().uri().required()).min(1).max(10),
      logo: Joi.string().uri(),
      type: Joi.string().custom(objectId),
      tags: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().required(),
            textColor: Joi.string().required(),
            backgroundColor: Joi.string().required(),
          })
        )
        .min(2)
        .max(2),
      shortTagline: Joi.string(),
    })
    .min(1),
};

const deletePlace = {
  params: Joi.object().keys({
    placeId: Joi.string().custom(objectId).required(),
  }),
};

const deleteSlot = {
  params: Joi.object().keys({
    slotId: Joi.string().custom(objectId).required(),
    placeId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  createPlace,
  getPlaces,
  getPlace,
  addSlot,
  updateSlot,
  updatePlace,
  deletePlace,
  changePrice,
  searchPlaces,
  deleteSlot,
  getSlots,
};
