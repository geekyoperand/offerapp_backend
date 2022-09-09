const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const couponAppliedHistoryValidation = require('../../validations/couponappliedhistory.validation');
const couponAppliedHistoryController = require('../../controllers/couponappliedhistory.controller');

const router = express.Router();

router
  .route('/')
  .post(
    auth('createCouponAppliedHistory'),
    validate(couponAppliedHistoryValidation.createCouponAppliedHistory),
    couponAppliedHistoryController.createCouponAppliedHistory
  )
  .get(
    auth('getCouponAppliedHistories'),
    validate(couponAppliedHistoryValidation.getCouponAppliedHistories),
    couponAppliedHistoryController.getCouponAppliedHistories
  );

router
  .route('/:couponAppliedHistoryId')
  .get(
    auth('getCouponAppliedHistory'),
    validate(couponAppliedHistoryValidation.getCouponAppliedHistory),
    couponAppliedHistoryController.getCouponAppliedHistory
  )
  .put(
    auth('updateCouponAppliedHistory'),
    validate(couponAppliedHistoryValidation.updateCouponAppliedHistory),
    couponAppliedHistoryController.updateCouponAppliedHistory
  )
  .delete(
    auth('deleteCouponAppliedHistory'),
    validate(couponAppliedHistoryValidation.deleteCouponAppliedHistory),
    couponAppliedHistoryController.deleteCouponAppliedHistory
  );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: CouponAppliedHistories
 *   description: CouponAppliedHistory management and retrieval
 */

/**
 * @swagger
 * /couponAppliedHistories:
 *   post:
 *     summary: Create a couponAppliedHistory
 *     description: Only admins can create other couponAppliedHistories.
 *     tags: [CouponAppliedHistories]
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
 *                  enum: [couponAppliedHistory, admin]
 *             example:
 *               name: fake name
 *               email: fake@example.com
 *               password: password1
 *               role: couponAppliedHistory
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/CouponAppliedHistory'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all couponAppliedHistories
 *     description: Only admins can retrieve all couponAppliedHistories.
 *     tags: [CouponAppliedHistories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: CouponAppliedHistory name
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: CouponAppliedHistory role
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
 *         description: Maximum number of couponAppliedHistories
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
 *                     $ref: '#/components/schemas/CouponAppliedHistory'
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
 * /couponAppliedHistories/{id}:
 *   get:
 *     summary: Get a couponAppliedHistory
 *     description: Logged in couponAppliedHistories can fetch only their own couponAppliedHistory information. Only admins can fetch other couponAppliedHistories.
 *     tags: [CouponAppliedHistories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: CouponAppliedHistory id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/CouponAppliedHistory'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a couponAppliedHistory
 *     description: Logged in couponAppliedHistories can only update their own information. Only admins can update other couponAppliedHistories.
 *     tags: [CouponAppliedHistories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: CouponAppliedHistory id
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
 *                $ref: '#/components/schemas/CouponAppliedHistory'
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
 *     summary: Delete a couponAppliedHistory
 *     description: Logged in couponAppliedHistories can delete only themselves. Only admins can delete other couponAppliedHistories.
 *     tags: [CouponAppliedHistories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: CouponAppliedHistory id
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
