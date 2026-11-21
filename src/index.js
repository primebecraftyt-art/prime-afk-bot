require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { createLogger } = require('./logger');
const { createBot } = require('./bot');
const { pingServer } = require('./serverPing');
const { startHealthServer } = require('./health');
const { ReconnectController } = require('./reconnect');
const { createNotifier } = require('./notifier');

function loadConfig() {
  const file = path.resolve(process.env.CONFIG_FILE || 'config.json');
  const base = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : JSON.parse(fs.readFileSync(path.resolve('config.example.json'), 'utf8'));
  base.server.host = process.env.MC_HOST || base.server.host;
  base.server.port = Number(process.env.MC_PORT || base.server.port);
  base.server.version = process.env.MC_VERSION || base.server.version;
  base.bot.username = process.env.MC_USERNAME || base.bot.username;
  base.bot.auth = process.env.MC_AUTH || base.bot.auth;
  base.health.port = Number(process.env.HEALTH_PORT || base.health.port);
  if (!base.server.host || base.server.host.startsWith('your-server')) throw new Error('Set server.host in config.json or MC_HOST in .env');
  return base;
}

async function main() {
  const config = loadConfig();
  const logger = createLogger(config.logging);
  let bot = null, connected = false, lastError = null, lastConnectedAt = null, lastDisconnectedAt = null, shuttingDown = false;
  const status = () => ({ connected, username: config.bot.username, host: config.server.host, lastConnectedAt, lastError });
  const notifier = createNotifier(process.env.DISCORD_WEBHOOK_URL || config.notifications?.discordWebhookUrl, logger);
  let offlineAlertSent = false;\n  let longOfflineAlertSent = false;\n  const offlineThresholdMs = Math.max(1, Number(config.notifications?.offlineAlertMinutes || 15)) * 60_000;\n  const offlineWatch = setInterval(() => {\n    if (!connected && lastDisconnectedAt && !longOfflineAlertSent && Date.now() - lastDisconnectedAt >= offlineThresholdMs) {\n      longOfflineAlertSent = true;\n      notifier.send('Prime AFK Bot has been disconnected for more than ' + (offlineThresholdMs / 60_000) + ' minutes.');\n    }\n  }, 60_000);\n  offlineWatch.unref?.();
  const notifyOffline = async (reason) => { if (!offlineAlertSent) { offlineAlertSent = true; await notifier.send('Prime AFK Bot disconnected: ' + String(reason || 'unknown')); } };
  const closeHealth = config.health.enabled ? startHealthServer({ port: config.health.port, getStatus: status, logger }) : async () => {};

  const reconnect = new ReconnectController({
    minMs: config.bot.reconnectMinMs, maxMs: config.bot.reconnectMaxMs, logger,
    connect: async () => {
      const ping = await pingServer(config.server);
      if (!ping.online) { connected = false; lastDisconnectedAt ||= Date.now(); lastError = ping.reason; logger.warn('Server is not responding to status ping: ' + ping.reason); await notifyOffline(ping.reason); return false; }
      logger.info('Server responded to status ping; connecting');
      bot = createBot(config, logger, {
        onConnected: () => { const wasOffline = !connected; connected = true; lastDisconnectedAt = null; longOfflineAlertSent = false; lastConnectedAt = new Date().toISOString(); lastError = null; offlineAlertSent = false; reconnect.connected(); if (wasOffline) notifier.send('Prime AFK Bot connected to ' + config.server.host); },
        onEnded: reason => { connected = false; lastDisconnectedAt ||= Date.now(); lastError = String(reason || 'Connection ended'); notifier.send('Prime AFK Bot connection ended: ' + lastError); if (!shuttingDown && config.bot.reconnect) reconnect.disconnected(); }
      });
      const { attachCommands } = require('./commands');
      attachCommands(bot, config, logger, status);
    }
  });
  reconnect.start();

  async function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true; logger.info(`Received ${signal}; shutting down`);
    reconnect.stop();
    clearInterval(offlineWatch);
    try { bot?.quit('Bot process shutting down'); } catch (error) { logger.warn(error.message); }
    await closeHealth();
    process.exit(0);
  }
  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
  process.on('unhandledRejection', reason => logger.error('Unhandled rejection: ' + String(reason)));
  process.on('uncaughtException', error => { logger.error('Uncaught exception: ' + error.stack); shutdown('uncaughtException'); });
}
main().catch(error => { console.error(error); process.exitCode = 1; });
