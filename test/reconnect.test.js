const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { ReconnectController } = require('../src/reconnect');
const { attachCommands } = require('../src/commands');

test('reconnect delay resets after a successful connection', () => {
  const controller = new ReconnectController({ minMs: 5, maxMs: 20, logger: { error() {} }, connect: async () => false });
  controller.delay = 20;
  controller.connected();
  assert.equal(controller.delay, 5);
  controller.stop();
});

test('disconnect increases delay up to the configured maximum', () => {
  const controller = new ReconnectController({ minMs: 5, maxMs: 20, logger: { error() {} }, connect: async () => false });
  controller.disconnected();
  assert.equal(controller.delay, 10);
  controller.stop();
  controller.delay = 20;
  controller.disconnected();
  assert.equal(controller.delay, 20);
  controller.stop();
});

test('stop prevents new scheduled work', () => {
  const controller = new ReconnectController({ logger: { error() {} }, connect: async () => false });
  controller.stop();
  controller.schedule(0);
  assert.equal(controller.timer, null);
});

test('chat commands are restricted to allowlisted usernames', () => {
  const bot = new EventEmitter();
  bot.username = 'PrimeBot';
  const sent = [];
  bot.chat = message => sent.push(message);
  attachCommands(bot, { commands: { enabled: true, allowedUsers: ['TrustedAdmin'] } }, { info() {} }, () => ({ connected: true }));
  bot.emit('chat', 'RandomPlayer', '!say hello');
  assert.deepEqual(sent, []);
  bot.emit('chat', 'TrustedAdmin', '!say hello');
  assert.deepEqual(sent, ['hello']);
  bot.emit('chat', 'TrustedAdmin', '!status');
  assert.equal(sent[1], 'Prime AFK Bot: connected.');
});
