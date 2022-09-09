const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const subscriptionValidation = require('../../validations/subscription.validation');
const subscriptionController = require('../../controllers/subscription.controller');

const router = express.Router();

router.route('/').post(validate(subscriptionValidation.createSubscription), subscriptionController.createSubscription);

module.exports = router;
