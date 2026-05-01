const { createProxyMiddleware } = require('http-proxy-middleware');

const target = (process.env.SERVER_URL || 'http://localhost:5000').replace(/\/+$/, '');

module.exports = function setupProxy(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target,
      changeOrigin: true,
    })
  );
};
