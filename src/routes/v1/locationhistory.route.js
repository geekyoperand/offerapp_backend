const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const locationHistoryValidation = require('../../validations/locationhistory.validation');
const locationHistoryController = require('../../controllers/locationhistory.controller');

const router = express.Router();

router
  .route('/')
  .post(
    auth('createLocationHistory'),
    validate(locationHistoryValidation.createLocationHistory),
    locationHistoryController.createLocationHistory
  )
  .get(
    auth('getLocationHistories'),
    validate(locationHistoryValidation.getLocationHistories),
    locationHistoryController.getLocationHistories
  );

router
  .route('/:locationHistoryId')
  .get(
    auth('getLocationHistory'),
    validate(locationHistoryValidation.getLocationHistory),
    locationHistoryController.getLocationHistory
  )
  .put(
    auth('updateLocationHistory'),
    validate(locationHistoryValidation.updateLocationHistory),
    locationHistoryController.updateLocationHistory
  )
  .delete(
    auth('deleteLocationHistory'),
    validate(locationHistoryValidation.deleteLocationHistory),
    locationHistoryController.deleteLocationHistory
  );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: LocationHistories
 *   description: LocationHistory management and retrieval
 */

/**
 * @swagger
 * /locationHistories:
 *   post:
 *     summary: Create a locationHistory
 *     description: Only admins can create other locationHistories.
 *     tags: [LocationHistories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 locationHistoryat: email
 *                 description: must be unique
 *               password:
 *                 type: string
 *                 locationHistoryat: password
 *                 minLength: 8
 *                 description: At least one number and one letter
 *               role:
 *                  type: string
 *                  enum: [locationHistory, admin]
 *             example:
 *               name: fake name
 *               email: fake@example.com
 *               password: password1
 *               role: locationHistory
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/LocationHistory'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all locationHistories
 *     description: Only admins can retrieve all locationHistories.
 *     tags: [LocationHistories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: LocationHistory name
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: LocationHistory role
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the locationHistory of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of locationHistories
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LocationHistory'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /locationHistories/{id}:
 *   get:
 *     summary: Get a locationHistory
 *     description: Logged in locationHistories can fetch only their own locationHistory inlocationHistoryation. Only admins can fetch other locationHistories.
 *     tags: [LocationHistories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: LocationHistory id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/LocationHistory'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a locationHistory
 *     description: Logged in locationHistories can only update their own inlocationHistoryation. Only admins can update other locationHistories.
 *     tags: [LocationHistories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: LocationHistory id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 locationHistoryat: email
 *                 description: must be unique
 *               password:
 *                 type: string
 *                 locationHistoryat: password
 *                 minLength: 8
 *                 description: At least one number and one letter
 *             example:
 *               name: fake name
 *               email: fake@example.com
 *               password: password1
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/LocationHistory'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a locationHistory
 *     description: Logged in locationHistories can delete only themselves. Only admins can delete other locationHistories.
 *     tags: [LocationHistories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: LocationHistory id
 *     responses:
 *       "200":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
