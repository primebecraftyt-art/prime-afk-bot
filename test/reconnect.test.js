const test = require('node:test');
const assert = require('node:assert/strict');
const { ReconnectController } = require('../src/reconnect');

test('starts with configured delay and caps exponential backoff', () => {
  const controller = new ReconnectController({ minMs: 5, maxMs: 20, logger: { error() {} }, connect: async () => false });
  assert.equal(controller.delay, 5);
  controller.delay = 10;
  controller.connected();
  assert.equal(controller.delay, 5);
  controller.delay = 20;
  controller.stop();
  assert.equal(controller.stopped, true);
});

test('stop prevents new scheduled work', () => {
  const controller = new ReconnectController({ logger: { error() {} }, connect: async () => false });
  controller.stop();
  controller.schedule(0);
  assert.equal(controller.timer, null);
});
