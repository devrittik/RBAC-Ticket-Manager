const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PrimeTrade Ticket Manager API',
      version: '1.0.0',
      description: 'RBAC ticket raiser and handler API with JWT authentication.',
    },
    servers: [{ url: '/api/v1', description: 'Version 1' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        UserSummary: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '69f4970fad6474ee58106d97' },
            name: { type: 'string', example: 'Jane Doe' },
            email: { type: 'string', example: 'jane@example.com' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'admin' },
          },
        },
        Ticket: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '69f4996ead6474ee58106e03' },
            title: { type: 'string', example: 'Unable to access dashboard' },
            description: { type: 'string', example: 'I get a blank screen after login.' },
            category: { type: 'string', enum: ['billing', 'technical', 'general', 'feature-request'] },
            status: { type: 'string', enum: ['open', 'in-progress', 'resolved', 'closed'] },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
            createdBy: {
              oneOf: [
                { type: 'string', example: '69f4970fad6474ee58106d97' },
                { $ref: '#/components/schemas/UserSummary' },
              ],
            },
            assignedTo: {
              oneOf: [
                { type: 'string', nullable: true, example: null },
                { $ref: '#/components/schemas/UserSummary' },
              ],
            },
            resolvedAt: { type: 'string', format: 'date-time', nullable: true },
            closedAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        AuditLog: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '69f4b2eead6474ee58106e55' },
            action: { type: 'string', example: 'ROLE_CHANGE' },
            performedBy: {
              oneOf: [
                { type: 'string', example: '69f4970fad6474ee58106d97' },
                { $ref: '#/components/schemas/UserSummary' },
              ],
            },
            targetUser: {
              oneOf: [
                { type: 'string', nullable: true, example: null },
                { $ref: '#/components/schemas/UserSummary' },
              ],
            },
            details: {
              type: 'object',
              additionalProperties: true,
              example: { oldRole: 'user', newRole: 'admin' },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [path.join(__dirname, '../routes/v1/*.js')],
};

module.exports = swaggerJsdoc(options);
