const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    action: { type: String, required: true },  // e.g. 'ROLE_CHANGE'
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    details: { type: Object },                  // { oldRole, newRole } etc.
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);