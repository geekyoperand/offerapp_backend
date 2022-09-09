const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const refferalHistoryValidation = require('../../validations/refferalhistory.validation');
const refferalHistoryController = require('../../controllers/refferalhistory.controller');

const router = express.Router();

router
  .route('/')
  .post(
    auth('createRefferalHistory'),
    validate(refferalHistoryValidation.createRefferalHistory),
    refferalHistoryController.createRefferalHistory
  )
  .get(
    auth('getRefferalHistories'),
    validate(refferalHistoryValidation.getRefferalHistories),
    refferalHistoryController.getRefferalHistories
  );

router
  .route('/:refferalHistoryId')
  .get(
    auth('getRefferalHistory'),
    validate(refferalHistoryValidation.getRefferalHistory),
    refferalHistoryController.getRefferalHistory
  )
  .put(
    auth('updateRefferalHistory'),
    validate(refferalHistoryValidation.updateRefferalHistory),
    refferalHistoryController.updateRefferalHistory
  )
  .delete(
    auth('deleteRefferalHistory'),
    validate(refferalHistoryValidation.deleteRefferalHistory),
    refferalHistoryController.deleteRefferalHistory
  );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: RefferalHistories
 *   description: RefferalHistory management and retrieval
 */

/**
 * @swagger
 * /refferalHistories:
 *   post:
 *     summary: Create a refferalHistory
 *     description: Only admins can create other refferalHistories.
 *     tags: [RefferalHistories]
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
 *                  enum: [refferalHistory, admin]
 *             example:
 *               name: fake name
 *               email: fake@example.com
 *               password: password1
 *               role: refferalHistory
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/RefferalHistory'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all refferalHistories
 *     description: Only admins can retrieve all refferalHistories.
 *     tags: [RefferalHistories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: RefferalHistory name
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: RefferalHistory role
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
 *         description: Maximum number of refferalHistories
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
 *                     $ref: '#/components/schemas/RefferalHistory'
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
 * /refferalHistories/{id}:
 *   get:
 *     summary: Get a refferalHistory
 *     description: Logged in refferalHistories can fetch only their own refferalHistory information. Only admins can fetch other refferalHistories.
 *     tags: [RefferalHistories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: RefferalHistory id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/RefferalHistory'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a refferalHistory
 *     description: Logged in refferalHistories can only update their own information. Only admins can update other refferalHistories.
 *     tags: [RefferalHistories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: RefferalHistory id
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
 *                $ref: '#/components/schemas/RefferalHistory'
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
 *     summary: Delete a refferalHistory
 *     description: Logged in refferalHistories can delete only themselves. Only admins can delete other refferalHistories.
 *     tags: [RefferalHistories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: RefferalHistory id
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
