const mineflayer = require('mineflayer');

function createBot(config, logger, handlers = {}) {
  const bot = mineflayer.createBot({
    host: config.server.host,
    port: Number(config.server.port),
    username: config.bot.username,
    version: config.server.version || false,
    auth: config.bot.auth || 'offline'
  });
  bot.once('login', () => { logger.info('Minecraft login successful'); handlers.onConnected?.(bot); });
  bot.on('spawn', () => logger.info('Bot spawned in the world'));
  bot.on('kicked', reason => logger.warn('Kicked by server: ' + String(reason)));
  bot.on('error', error => logger.error('Minecraft client error: ' + error.message));
  bot.once('end', reason => { logger.warn('Connection ended: ' + String(reason || 'unknown')); handlers.onEnded?.(reason); });
  bot.on('death', () => logger.info('Bot died; waiting for normal server respawn handling'));
  bot.on('message', message => logger.debug('Server message: ' + message.toString().slice(0, 500)));
  return bot;
}
module.exports = { createBot };
