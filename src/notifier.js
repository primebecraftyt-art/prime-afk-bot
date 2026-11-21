const https = require('node:https');
const http = require('node:http');
const { URL } = require('node:url');

function createNotifier(webhookUrl, logger) {
  async function send(message) {
    if (!webhookUrl) return;
    let url;
    try { url = new URL(webhookUrl); } catch { logger.warn('Discord webhook URL is invalid'); return; }
    if (!['https:', 'http:'].includes(url.protocol)) { logger.warn('Unsupported webhook protocol'); return; }
    const payload = Buffer.from(JSON.stringify({ content: String(message).slice(0, 1900) }));
    const client = url.protocol === 'https:' ? https : http;
    await new Promise(resolve => {
      const req = client.request(url, { method: 'POST', headers: { 'content-type': 'application/json', 'content-length': payload.length } }, res => {
        res.resume();
        if (res.statusCode < 200 || res.statusCode >= 300) logger.warn('Discord webhook returned HTTP ' + res.statusCode);
        resolve();
      });
      req.setTimeout(5000, () => req.destroy(new Error('Webhook request timed out')));
      req.on('error', error => { logger.warn('Discord notification failed: ' + error.message); resolve(); });
      req.end(payload);
    });
  }
  return { send };
}
module.exports = { createNotifier };
