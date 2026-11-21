const minecraft = require('minecraft-protocol');

async function pingServer({ host, port, version }, timeout = 5000) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (result) => { if (!settled) { settled = true; resolve(result); } };
    const timer = setTimeout(() => finish({ online: false, reason: 'Ping timed out' }), timeout);
    timer.unref?.();
    try {
      minecraft.ping({ host, port, version }, (err, result) => {
        clearTimeout(timer);
        finish(err ? { online: false, reason: err.message } : { online: true, players: result?.players });
      });
    } catch (error) {
      clearTimeout(timer);
      finish({ online: false, reason: error.message });
    }
  });
}
module.exports = { pingServer };
