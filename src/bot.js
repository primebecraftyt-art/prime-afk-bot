const mineflayer = require('mineflayer');

function createBot(config, logger, handlers = {}) {
  const bot = mineflayer.createBot({
    host: config.server.host,
    port: Number(config.server.port),
    username: config.bot.username,
    version: config.server.version || false,
    auth: config.bot.auth || 'offline'
  });
  let ended = false;\n  const loginTimer = setTimeout(() => {\n    if (ended) return;\n    logger.warn('Login timed out; closing this connection attempt');\n    try { bot.quit('Login timeout'); } catch (error) { logger.warn(error.message); }\n    handlers.onEnded?.('Login timeout');\n  }, Number(config.bot.loginTimeoutMs || 30000));\n  loginTimer.unref?.();\n  bot.once('login', () => { clearTimeout(loginTimer); logger.info('Minecraft login successful'); handlers.onConnected?.(bot); });
  bot.on('spawn', () => logger.info('Bot spawned in the world'));
  bot.on('kicked', reason => logger.warn('Kicked by server: ' + String(reason)));
  bot.on('error', error => logger.error('Minecraft client error: ' + error.message));
  bot.once('end', reason => { ended = true; clearTimeout(loginTimer); logger.warn('Connection ended: ' + String(reason || 'unknown')); handlers.onEnded?.(reason); });
  bot.on('death', () => logger.info('Bot died; waiting for normal server respawn handling'));
  bot.on('message', message => logger.debug('Server message: ' + message.toString().slice(0, 500)));
  return bot;
}
module.exports = { createBot };
