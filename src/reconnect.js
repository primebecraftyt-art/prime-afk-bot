class ReconnectController {
  constructor({ minMs = 5000, maxMs = 120000, logger, connect }) {
    this.minMs = minMs; this.maxMs = maxMs; this.logger = logger; this.connect = connect;
    this.delay = minMs; this.timer = null; this.stopped = false; this.connecting = false;
  }
  start() { this.stopped = false; this.schedule(0); }
  schedule(delay = this.delay) {
    if (this.stopped || this.timer || this.connecting) return;
    this.timer = setTimeout(async () => {
      this.timer = null; if (this.stopped) return;
      this.connecting = true;
      try { await this.connect(); } catch (error) { this.logger.error('Connect attempt failed: ' + error.message); }
      finally { this.connecting = false; }
      this.delay = Math.min(this.delay * 2, this.maxMs);
    }, delay);
    this.timer.unref?.();
  }
  connected() { this.delay = this.minMs; }
  disconnected() { this.schedule(this.delay); }
  stop() { this.stopped = true; if (this.timer) clearTimeout(this.timer); this.timer = null; }
}
module.exports = { ReconnectController };
