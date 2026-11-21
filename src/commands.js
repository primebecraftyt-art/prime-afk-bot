function attachCommands(bot, config, logger, getStatus) {
  const allowed = new Set((config.commands?.allowedUsers || []).map(name => name.toLowerCase()));
  if (!config.commands?.enabled || allowed.size === 0) return;
  bot.on('chat', (username, message) => {
    if (username.toLowerCase() === bot.username.toLowerCase() || !allowed.has(username.toLowerCase())) return;
    if (!message.startsWith('!')) return;
    const [command, ...args] = message.slice(1).trim().split(/\s+/);
    if (command === 'status') {
      const state = getStatus();
      bot.chat(state.connected ? 'Prime AFK Bot: connected.' : 'Prime AFK Bot: disconnected.');
    } else if (command === 'say' && args.length) {
      const text = args.join(' ').slice(0, 180);
      bot.chat(text);
    } else {
      logger.info('Ignored unknown command from authorized user ' + username);
    }
  });
}
module.exports = { attachCommands };
