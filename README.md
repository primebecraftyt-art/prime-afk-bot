# Prime AFK Bot

A configurable Mineflayer client for Minecraft servers you are authorized to access. Includes status ping, reconnect handling, logs, and an HTTP health endpoint.

> **Important:** No software can guarantee 24/7 availability. Aternos and other free hosts may stop servers, impose queues, or restrict automation. This project does not bypass host policies, AFK enforcement, or access controls, and does not automatically start stopped servers.

## Quick start

1. Clone: `git clone https://github.com/primebecraftyt-art/prime-afk-bot.git`
2. Enter the folder: `cd prime-afk-bot`
3. Install: `npm install`
4. Copy `config.example.json` to `config.json` (PowerShell: `Copy-Item config.example.json config.json`).
5. Edit `config.json` with your server hostname, port, Minecraft version, username, and authentication mode.
6. Run: `npm start`

Node.js 18+ is required; Node.js 20 LTS is recommended. Never commit `.env`, `config.json`, account tokens, or passwords.

## Features

- Mineflayer client with configurable server and account settings.
- Server status ping before connection attempts.
- Exponential reconnect delay from 5 seconds up to 2 minutes.
- Winston console and file logging.
- Express `/health` endpoint.
- Graceful SIGINT/SIGTERM shutdown.
- Docker Compose, PM2, and systemd examples.

## Configuration

| Setting | Example | Description |
|---|---|---|
| `server.host` | `play.example.net` | Server hostname |
| `server.port` | `25565` | Server port |
| `server.version` | `1.20.4` | Minecraft protocol version supported by Mineflayer |
| `bot.username` | `PrimeBot` | Bot username |
| `bot.auth` | `offline` | `offline` or `microsoft`, as allowed by the server |
| `bot.reconnect` | `true` | Reconnect toggle |
| `bot.reconnectMinMs` | `5000` | Initial retry delay |
| `bot.reconnectMaxMs` | `120000` | Maximum retry delay |
| `health.enabled` | `true` | Enable HTTP endpoint |
| `health.port` | `3000` | HTTP port |
| `logging.level` | `info` | Log level |
| `logging.file` | `logs/prime-afk-bot.log` | Log file path |

Environment overrides: `MC_HOST`, `MC_PORT`, `MC_USERNAME`, `MC_VERSION`, `MC_AUTH`, and `HEALTH_PORT`. See `.env.example`.

## Health endpoint

Open `http://localhost:3000/health`. HTTP 200 means the Minecraft client is connected; HTTP 503 means it is disconnected. An uptime monitor only checks this process endpoint—it does not keep a Minecraft server awake or defeat a hosting provider's sleep policy.

## Deployment

### Ubuntu VPS with PM2

```bash
sudo apt update && sudo apt install -y nodejs npm
git clone https://github.com/primebecraftyt-art/prime-afk-bot.git
cd prime-afk-bot && npm install
cp config.example.json config.json
nano config.json
sudo npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

Run the command printed by `pm2 startup`. View logs with `pm2 logs prime-afk-bot`.

### Docker

Create local `.env` and `config.json`, then run `docker compose up -d --build`. Follow logs with `docker compose logs -f`.

### Raspberry Pi

Install a supported 64-bit Node.js LTS release, clone the repository, run `npm install`, copy and edit `config.json`, then run `npm start`. PM2 can be used for process supervision.

### systemd

Create `/etc/systemd/system/prime-afk-bot.service` and adjust the user and paths:

```ini
[Unit]
Description=Prime AFK Bot
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/prime-afk-bot
ExecStart=/usr/bin/node /opt/prime-afk-bot/src/index.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable it with `sudo systemctl daemon-reload && sudo systemctl enable --now prime-afk-bot`. Logs: `sudo journalctl -u prime-afk-bot -f`.

### Free hosting

Only use a provider that permits persistent processes and outbound Minecraft connections. Free tiers may sleep, restrict sockets, or terminate workloads. A health endpoint or external monitor does not override those limits; check the provider's current terms.

## Troubleshooting

- **Version mismatch:** use the server's actual version and confirm Mineflayer supports it.
- **Server offline / ping timeout:** verify hostname, port, DNS, server status, and outbound network access.
- **Queue:** wait for the normal server queue; repeated attempts do not bypass it.
- **Authentication failure:** check auth mode and complete Microsoft device login when required.
- **Kicked for AFK:** follow the server's rules. This project does not automate activity to evade AFK enforcement.
- **Health returns 503:** the process is running but Minecraft is disconnected; inspect logs.
- **Port in use:** change `health.port` or `HEALTH_PORT`.

## Scope

This starter focuses on connection lifecycle and monitoring. It does not implement chat commands, password-based auto-login, automated movement, auto-eating, multi-account rotation, Discord notifications, or Aternos auto-start.

## License

MIT. See `LICENSE`.