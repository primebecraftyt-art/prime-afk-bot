const fs = require('node:fs');
const path = require('node:path');
const winston = require('winston');

function createLogger(config = {}) {
  const transports = [new winston.transports.Console()];
  if (config.file) {
    fs.mkdirSync(path.dirname(config.file), { recursive: true });
    transports.push(new winston.transports.File({ filename: config.file, maxsize: 5_000_000, maxFiles: 3 }));
  }
  return winston.createLogger({
    level: config.level || 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.printf(({ timestamp, level, message, stack }) => `${timestamp} [${level}] ${stack || message}`)),
    transports
  });
}
module.exports = { createLogger };
