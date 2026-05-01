const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');

const getOwnerId = (createdBy) => {
  if (!createdBy) return null;
  if (typeof createdBy === 'object' && createdBy._id) return createdBy._id.toString();
  return createdBy.toString();
};

const pickAllowedFields = (source, allowedFields) =>
  allowedFields.reduce((acc, field) => {
    if (Object.prototype.hasOwnProperty.call(source, field)) {
      acc[field] = source[field];
    }
    return acc;
  }, {});

/**
 * @route   GET /api/v1/tickets
 * @desc    Get all tickets (admin: all, user: own)
 * @access  Private
 */
exports.getTickets = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { createdBy: req.user._id };
    const tickets = await Ticket.find(filter)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort('-createdAt');
    
    return sendSuccess(res, 200, 'Tickets fetched', { count: tickets.length, tickets });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/v1/tickets/:id
 * @desc    Get a single ticket
 * @access  Private
 */
exports.getTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');
    if (!ticket) return sendError(res, 404, 'Ticket not found');

    if (req.user.role !== 'admin' && getOwnerId(ticket.createdBy) !== req.user._id.toString()) {
      return sendError(res, 403, 'Not authorized to view this ticket');
    }

    return sendSuccess(res, 200, 'Ticket fetched', { ticket });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/v1/tickets
 * @desc    Create a new ticket
 * @access  Private
 */
exports.createTicket = async (req, res, next) => {
  try {
    const allowedFields = req.user.role === 'admin'
      ? ['title', 'description', 'category', 'status', 'priority', 'assignedTo']
      : ['title', 'description', 'category', 'priority'];

    const payload = pickAllowedFields(req.body, allowedFields);

    if (req.user.role !== 'admin') {
      payload.status = 'open';
      payload.assignedTo = null;
    }

    const ticket = await Ticket.create({ ...payload, createdBy: req.user._id });
    return sendSuccess(res, 201, 'Ticket created', { ticket });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PUT /api/v1/tickets/:id
 * @desc    Update a ticket
 * @access  Private
 */
exports.updateTicket = async (req, res, next) => {
  try {
    let ticket = await Ticket.findById(req.params.id);
    if (!ticket) return sendError(res, 404, 'Ticket not found');

    if (req.user.role !== 'admin' && ticket.createdBy.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Not authorized to update this ticket');
    }

    if (req.user.role !== 'admin' && ticket.status !== 'open') {
      return sendError(res, 403, 'Ticket cannot be edited once it is in progress');
    }

    const allowedFields = req.user.role === 'admin'
      ? ['title', 'description', 'category', 'status', 'priority', 'assignedTo']
      : ['title', 'description', 'category', 'priority'];

    const updates = pickAllowedFields(req.body, allowedFields);

    if (req.user.role !== 'admin' && Object.keys(updates).length === 0) {
      return sendError(res, 400, 'No valid fields provided for update');
    }

    if (req.user.role === 'admin' && updates.status === 'resolved') {
      updates.resolvedAt = new Date();
      updates.closedAt = null;
    }

    if (req.user.role === 'admin' && updates.status === 'closed') {
      updates.closedAt = new Date();
    }

    if (req.user.role === 'admin' && updates.status && !['resolved', 'closed'].includes(updates.status)) {
      updates.resolvedAt = null;
      updates.closedAt = null;
    }

    ticket = await Ticket.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    return sendSuccess(res, 200, 'Ticket updated', { ticket });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   DELETE /api/v1/tickets/:id
 * @desc    Delete a ticket
 * @access  Private
 */
exports.deleteTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return sendError(res, 404, 'Ticket not found');

    if (req.user.role !== 'admin') {
      return sendError(res, 403, 'Users cannot delete tickets');
    }

    await ticket.deleteOne();
    return sendSuccess(res, 200, 'Ticket deleted');
  } catch (err) {
    next(err);
  }
};

exports.assignTicket = async (req, res, next) => {
  try {
    const { adminId } = req.body;
    if (!adminId) return sendError(res, 400, 'adminId is required');

    const assignee = await User.findById(adminId);
    if (!assignee) return sendError(res, 404, 'Assignee not found');
    if (assignee.role !== 'admin') return sendError(res, 400, 'Tickets can only be assigned to admins');

    const ticketToAssign = await Ticket.findById(req.params.id);
    if (!ticketToAssign) return sendError(res, 404, 'Ticket not found');
    if (ticketToAssign.status === 'closed') return sendError(res, 400, 'Closed tickets cannot be assigned');

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { assignedTo: adminId, status: 'in-progress', resolvedAt: null, closedAt: null },
      { new: true, runValidators: true }
    );
    return sendSuccess(res, 200, 'Ticket assigned', { ticket });
  } catch (err) { next(err); }
};

exports.resolveTicket = async (req, res, next) => {
  try {
    const ticketToResolve = await Ticket.findById(req.params.id);
    if (!ticketToResolve) return sendError(res, 404, 'Ticket not found');

    if (ticketToResolve.status === 'resolved') {
      return sendSuccess(res, 200, 'Ticket already resolved', { ticket: ticketToResolve });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      {
        status: 'resolved',
        resolvedAt: new Date(),
        closedAt: null,
        assignedTo: ticketToResolve.assignedTo || req.user._id,
      },
      { new: true, runValidators: true }
    );
    return sendSuccess(res, 200, 'Ticket resolved', { ticket });
  } catch (err) { next(err); }
};

exports.closeTicket = async (req, res, next) => {
  try {
    const ticketToClose = await Ticket.findById(req.params.id);
    if (!ticketToClose) return sendError(res, 404, 'Ticket not found');

    if (ticketToClose.status === 'closed') {
      return sendSuccess(res, 200, 'Ticket already closed', { ticket: ticketToClose });
    }

    if (ticketToClose.status !== 'resolved') {
      return sendError(res, 400, 'Only resolved tickets can be closed');
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status: 'closed', closedAt: new Date() },
      { new: true, runValidators: true }
    );
    return sendSuccess(res, 200, 'Ticket closed', { ticket });
  } catch (err) { next(err); }
};

exports.reopenTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return sendError(res, 404, 'Ticket not found');

    if (ticket.status !== 'closed') {
      return sendError(res, 400, 'Only closed tickets can be reopened');
    }

    const reopenedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status: 'open', assignedTo: null, resolvedAt: null, closedAt: null },
      { new: true, runValidators: true }
    );
    return sendSuccess(res, 200, 'Ticket reopened', { ticket: reopenedTicket });
  } catch (err) { next(err); }
};
