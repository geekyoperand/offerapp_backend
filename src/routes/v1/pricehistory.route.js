const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const priceHistoryValidation = require('../../validations/pricehistory.validation');
const priceHistoryController = require('../../controllers/pricehistory.controller');

const router = express.Router();

router
  .route('/')
  .post(
    auth('createPriceHistory'),
    validate(priceHistoryValidation.createPriceHistory),
    priceHistoryController.createPriceHistory
  )
  .get(
    auth('getPriceHistories'),
    validate(priceHistoryValidation.getPriceHistories),
    priceHistoryController.getPriceHistories
  );

router
  .route('/:priceHistoryId')
  .get(auth('getPriceHistory'), validate(priceHistoryValidation.getPriceHistory), priceHistoryController.getPriceHistory)
  .put(
    auth('updatePriceHistory'),
    validate(priceHistoryValidation.updatePriceHistory),
    priceHistoryController.updatePriceHistory
  )
  .delete(
    auth('deletePriceHistory'),
    validate(priceHistoryValidation.deletePriceHistory),
    priceHistoryController.deletePriceHistory
  );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: PriceHistories
 *   description: PriceHistory management and retrieval
 */

/**
 * @swagger
 * /priceHistories:
 *   post:
 *     summary: Create a priceHistory
 *     description: Only admins can create other priceHistories.
 *     tags: [PriceHistories]
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
 *                 format: email
 *                 description: must be unique
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: At least one number and one letter
 *               role:
 *                  type: string
 *                  enum: [priceHistory, admin]
 *             example:
 *               name: fake name
 *               email: fake@example.com
 *               password: password1
 *               role: priceHistory
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/PriceHistory'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all priceHistories
 *     description: Only admins can retrieve all priceHistories.
 *     tags: [PriceHistories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: PriceHistory name
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: PriceHistory role
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of priceHistories
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
 *                     $ref: '#/components/schemas/PriceHistory'
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
 * /priceHistories/{id}:
 *   get:
 *     summary: Get a priceHistory
 *     description: Logged in priceHistories can fetch only their own priceHistory information. Only admins can fetch other priceHistories.
 *     tags: [PriceHistories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: PriceHistory id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/PriceHistory'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a priceHistory
 *     description: Logged in priceHistories can only update their own information. Only admins can update other priceHistories.
 *     tags: [PriceHistories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: PriceHistory id
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
 *                 format: email
 *                 description: must be unique
 *               password:
 *                 type: string
 *                 format: password
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
 *                $ref: '#/components/schemas/PriceHistory'
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
 *     summary: Delete a priceHistory
 *     description: Logged in priceHistories can delete only themselves. Only admins can delete other priceHistories.
 *     tags: [PriceHistories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: PriceHistory id
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
