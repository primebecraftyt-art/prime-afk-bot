const express = require('express');

function startHealthServer({ port, getStatus, logger }) {
  const app = express();
  app.get('/health', (_req, res) => {
    const status = getStatus();
    res.status(status.connected ? 200 : 503).json({ service: 'prime-afk-bot', ...status, timestamp: new Date().toISOString() });
  });
  app.get('/', (_req, res) => res.type('text').send('Prime AFK Bot is running. See /health.'));
  const server = app.listen(port, '0.0.0.0', () => logger.info(`Health endpoint listening on port ${port}`));
  server.on('error', (error) => logger.error('Health server error: ' + error.message));
  return () => new Promise(resolve => server.close(resolve));
}
module.exports = { startHealthServer };
