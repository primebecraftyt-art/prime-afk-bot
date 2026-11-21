class ReconnectController {
  constructor({ minMs = 5000, maxMs = 120000, logger, connect }) {
    this.minMs = minMs; this.maxMs = maxMs; this.logger = logger; this.connect = connect;
    this.delay = minMs; this.timer = null; this.stopped = false; this.connecting = false;
  }
  start() { this.stopped = false; this.schedule(0); }
  schedule(delay = this.delay) {
    if (this.stopped || this.timer || this.connecting) return;
    this.timer = setTimeout(async () => {
      this.timer = null;
      if (this.stopped) return;
      this.connecting = true;
      let retry = false;
      try { retry = (await this.connect()) === false; }
      catch (error) { this.logger.error('Connect attempt failed: ' + error.message); retry = true; }
      finally {
        this.connecting = false;
        if (retry && !this.stopped) {
          const nextDelay = this.delay;
          this.delay = Math.min(this.delay * 2, this.maxMs);
          this.schedule(nextDelay);
        }
      }
    }, delay);
    this.timer.unref?.();
  }
  connected() {
    this.delay = this.minMs;
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
  }
  disconnected() {
    const retryDelay = this.delay;\n    this.delay = Math.min(this.delay * 2, this.maxMs);\n    this.schedule(retryDelay);\n  }
  stop() { this.stopped = true; if (this.timer) clearTimeout(this.timer); this.timer = null; }
}
module.exports = { ReconnectController };
