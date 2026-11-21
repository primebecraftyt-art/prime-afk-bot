module.exports = {
  apps: [{
    name: 'prime-afk-bot',
    script: 'src/index.js',
    instances: 1,
    autorestart: true,
    restart_delay: 5000,
    max_restarts: 20,
    env: { NODE_ENV: 'production' }
  }]
};
