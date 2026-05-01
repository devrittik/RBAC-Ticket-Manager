const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole, deleteUser } = require('../../controllers/adminController');
const { protect, restrictTo } = require('../../middleware/auth');
const AuditLog = require('../../models/AuditLog');

router.use(protect, restrictTo('admin'));

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only operations
 */

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List of all users
 *       403:
 *         description: Forbidden
 */
router.get('/users', getAllUsers);

/**
 * @swagger
 * /admin/users/{id}/role:
 *   patch:
 *     summary: Update user role
 *     tags: [Admin]
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
 *               role: { type: string, enum: [user, admin] }
 *     responses:
 *       200:
 *         description: Role updated
 */
router.patch('/users/:id/role', updateUserRole);

/**
 * @swagger
 * /admin/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User deleted
 */
router.delete('/users/:id', deleteUser);

/**
 * @swagger
 * /admin/audit-logs:
 *   get:
 *     summary: Get all audit logs
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Recent audit logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     logs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AuditLog'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/audit-logs', async (req, res, next) => {
    try {
        const logs = await AuditLog.find()
            .populate('performedBy', 'name email')
            .populate('targetUser', 'name email')
            .sort('-createdAt')
            .limit(100);
        res.json({ success: true, data: { logs } });
    } catch (err) { next(err); }
});

module.exports = router;
