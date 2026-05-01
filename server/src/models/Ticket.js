const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  title: { type: String, required: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 2000, default: '' },
  category: { type: String, enum: ['billing', 'technical', 'general', 'feature-request'], default: 'general' },
  status: { type: String, enum: ['open', 'in-progress', 'resolved', 'closed'], default: 'open' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // admin only
  resolvedAt: { type: Date, default: null },
  closedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);
