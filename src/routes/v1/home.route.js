const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const homeValidation = require('../../validations/home.validation');
const homeController = require('../../controllers/home.controller');

const router = express.Router();

router.route('/').get(validate(homeValidation.getServerStatus), homeController.getServerStatus);

router.route('/home').get(auth('getHomeDetails'), validate(homeValidation.getHomeDetails), homeController.getHomeDetails);

module.exports = router;
