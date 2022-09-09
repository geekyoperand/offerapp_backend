const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const queryTicketValidation = require('../../validations/queryticket.validation');
const queryTicketController = require('../../controllers/queryticket.controller');

const router = express.Router();

router
  .route('/')
  .post(
    auth('createQueryTicket'),
    validate(queryTicketValidation.createQueryTicket),
    queryTicketController.createQueryTicket
  )
  .get(auth('getQueryTickets'), validate(queryTicketValidation.getQueryTickets), queryTicketController.getQueryTickets);

router
  .route('/:queryTicketId/send-message')
  .post(
    auth('addQueryTicketComment'),
    validate(queryTicketValidation.addQueryTicketComment),
    queryTicketController.addQueryTicketComment
  );

router
  .route('/:queryTicketId/change-status')
  .post(
    auth('addQueryTicketComment'),
    validate(queryTicketValidation.changeQueryTicketStatus),
    queryTicketController.changeQueryTicketStatus
  );

router
  .route('/:queryTicketId')
  .get(auth('getQueryTicket'), validate(queryTicketValidation.getQueryTicket), queryTicketController.getQueryTicket)
  .put(auth('updateQueryTicket'), validate(queryTicketValidation.updateQueryTicket), queryTicketController.updateQueryTicket)
  .delete(
    auth('deleteQueryTicket'),
    validate(queryTicketValidation.deleteQueryTicket),
    queryTicketController.deleteQueryTicket
  )
  .delete(
    auth('deleteQueryTicketComment'),
    validate(queryTicketValidation.deleteQueryTicketComment),
    queryTicketController.deleteQueryTicketComment
  );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: QueryTickets
 *   description: QueryTicket management and retrieval
 */

/**
 * @swagger
 * /queryTickets:
 *   post:
 *     summary: Create a queryTicket
 *     description: Only admins can create other queryTickets.
 *     tags: [QueryTickets]
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
 *                  enum: [queryTicket, admin]
 *             example:
 *               name: fake name
 *               email: fake@example.com
 *               password: password1
 *               role: queryTicket
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/QueryTicket'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all queryTickets
 *     description: Only admins can retrieve all queryTickets.
 *     tags: [QueryTickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: QueryTicket name
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: QueryTicket role
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
 *         description: Maximum number of queryTickets
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
 *                     $ref: '#/components/schemas/QueryTicket'
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
 * /queryTickets/{id}:
 *   get:
 *     summary: Get a queryTicket
 *     description: Logged in queryTickets can fetch only their own queryTicket information. Only admins can fetch other queryTickets.
 *     tags: [QueryTickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: QueryTicket id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/QueryTicket'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a queryTicket
 *     description: Logged in queryTickets can only update their own information. Only admins can update other queryTickets.
 *     tags: [QueryTickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: QueryTicket id
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
 *                $ref: '#/components/schemas/QueryTicket'
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
 *     summary: Delete a queryTicket
 *     description: Logged in queryTickets can delete only themselves. Only admins can delete other queryTickets.
 *     tags: [QueryTickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: QueryTicket id
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
