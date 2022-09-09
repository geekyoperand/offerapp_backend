const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const lookupValidation = require('../../validations/lookup.validation');
const lookupController = require('../../controllers/lookup.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('createLookup'), validate(lookupValidation.createLookup), lookupController.createLookup)
  .get(auth('getLookups'), validate(lookupValidation.getLookups), lookupController.getLookups);

router.route('/all').get(auth('getAllLookups'), validate(lookupValidation.getAllLookups), lookupController.getAllLookups);

router
  .route('/:lookupId')
  .get(auth('getLookup'), validate(lookupValidation.getLookup), lookupController.getLookup)
  .put(auth('updateLookup'), validate(lookupValidation.updateLookup), lookupController.updateLookup)
  .delete(auth('deleteLookup'), validate(lookupValidation.deleteLookup), lookupController.deleteLookup);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Lookups
 *   description: Lookup management and retrieval
 */

/**
 * @swagger
 * /lookups:
 *   post:
 *     summary: Create a lookup
 *     description: Only admins can create other lookups.
 *     tags: [Lookups]
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
 *                 lookupat: email
 *                 description: must be unique
 *               password:
 *                 type: string
 *                 lookupat: password
 *                 minLength: 8
 *                 description: At least one number and one letter
 *               role:
 *                  type: string
 *                  enum: [lookup, admin]
 *             example:
 *               name: fake name
 *               email: fake@example.com
 *               password: password1
 *               role: lookup
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Lookup'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all lookups
 *     description: Only admins can retrieve all lookups.
 *     tags: [Lookups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Lookup name
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Lookup role
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the lookup of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of lookups
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
 *                     $ref: '#/components/schemas/Lookup'
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
 * /lookups/{id}:
 *   get:
 *     summary: Get a lookup
 *     description: Logged in lookups can fetch only their own lookup inlookupation. Only admins can fetch other lookups.
 *     tags: [Lookups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lookup id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Lookup'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a lookup
 *     description: Logged in lookups can only update their own inlookupation. Only admins can update other lookups.
 *     tags: [Lookups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lookup id
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
 *                 lookupat: email
 *                 description: must be unique
 *               password:
 *                 type: string
 *                 lookupat: password
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
 *                $ref: '#/components/schemas/Lookup'
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
 *     summary: Delete a lookup
 *     description: Logged in lookups can delete only themselves. Only admins can delete other lookups.
 *     tags: [Lookups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Lookup id
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
