const express = require('express');
const router = express.Router();
const {
  getTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
  assignTicket,
  resolveTicket,
  closeTicket,
  reopenTicket,
} = require('../../controllers/ticketController');
const { protect, restrictTo } = require('../../middleware/auth');
const { ticketRules, validate } = require('../../validators');

router.use(protect); // All ticket routes require auth

/**
 * @swagger
 * /tickets/{id}/assign:
 *   patch:
 *     summary: Assign or reassign a ticket to an admin
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [adminId]
 *             properties:
 *               adminId:
 *                 type: string
 *                 example: 69f4970fad6474ee58106d97
 *     responses:
 *       200:
 *         description: Ticket assigned
 *       400:
 *         description: Invalid assignment request
 *       404:
 *         description: Ticket or assignee not found
 */
router.patch('/:id/assign', restrictTo('admin'), assignTicket);

/**
 * @swagger
 * /tickets/{id}/resolve:
 *   patch:
 *     summary: Mark a ticket as resolved
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket resolved
 *       404:
 *         description: Ticket not found
 */
router.patch('/:id/resolve', restrictTo('admin'), resolveTicket);

/**
 * @swagger
 * /tickets/{id}/close:
 *   patch:
 *     summary: Close a resolved ticket
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket closed
 *       400:
 *         description: Ticket is not in a closable state
 *       404:
 *         description: Ticket not found
 */
router.patch('/:id/close', restrictTo('admin'), closeTicket);

/**
 * @swagger
 * /tickets/{id}/reopen:
 *   patch:
 *     summary: Reopen a closed ticket
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket reopened
 *       400:
 *         description: Ticket is not in a reopenable state
 *       404:
 *         description: Ticket not found
 */
router.patch('/:id/reopen', restrictTo('admin'), reopenTicket);

/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Ticket management
 */

/**
 * @swagger
 * /tickets:
 *   get:
 *     summary: Get all tickets (admin gets all, user gets own)
 *     tags: [Tickets]
 *     responses:
 *       200:
 *         description: List of tickets
 *   post:
 *     summary: Create a new ticket
 *     tags: [Tickets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string, example: My first ticket }
 *               description: { type: string, example: Details here }
 *               category: { type: string, enum: [billing, technical, general, feature-request] }
 *               status: { type: string, enum: [open, in-progress, resolved, closed] }
 *               priority: { type: string, enum: [low, medium, high, critical] }
 *     responses:
 *       201:
 *         description: Ticket created
 */
router.route('/').get(getTickets).post(ticketRules, validate, createTicket);

/**
 * @swagger
 * /tickets/{id}:
 *   get:
 *     summary: Get a single ticket by ID
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Ticket data
 *       404:
 *         description: Ticket not found
 *   put:
 *     summary: Update a ticket
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               category: { type: string, enum: [billing, technical, general, feature-request] }
 *               status: { type: string, enum: [open, in-progress, resolved, closed] }
 *               priority: { type: string, enum: [low, medium, high, critical] }
 *     responses:
 *       200:
 *         description: Ticket updated
 *   delete:
 *     summary: Delete a ticket
 *     tags: [Tickets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Ticket deleted
 */
router.route('/:id').get(getTicket).put(ticketRules, validate, updateTicket).delete(deleteTicket);

module.exports = router;
