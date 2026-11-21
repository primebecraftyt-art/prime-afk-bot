# Prime AFK Bot

A configurable Minecraft client built with Node.js and Mineflayer. Includes server status checks, bounded reconnect attempts, logs, an HTTP health endpoint, optional Discord alerts, and optional allowlisted chat commands.

> **Use responsibly:** Only connect where automated clients are permitted. Aternos and other hosts may stop idle servers, enforce queues, or restrict automation. This project does not bypass AFK rules, host sleep policies, queues, rate limits, authentication, or access controls. It does not automatically start stopped servers and cannot promise 24/7 uptime.

## Requirements
- Node.js 18+ (Node.js 20 LTS recommended)
- npm
- A Minecraft server that permits bot clients and network access from your host

## Quick start
```bash
git clone https://github.com/primebecraftyt-art/prime-afk-bot.git
cd prime-afk-bot
npm install
cp config.example.json config.json
```
On Windows PowerShell, copy config with `Copy-Item config.example.json config.json`. Edit `config.json` with your server hostname, port, Minecraft version, username, and authentication mode. Then run:

```bash
npm start
```

The app reads private `config.json` when present; otherwise it reads the example file. Never commit `.env`, `config.json`, Microsoft auth caches, webhook URLs, or logs.

## Configuration

| Key | Example | Meaning |
|---|---|---|
| `server.host` | `play.example.net` | Server hostname |
| `server.port` | `25565` | Server port |
| `server.version` | `1.20.4` | Mineflayer-supported protocol version |
| `bot.username` | `PrimeBot` | Account name |
| `bot.auth` | `offline` | `offline` or `microsoft`, as permitted by server |
| `bot.reconnect` | `true` | Reconnect toggle |
| `bot.reconnectMinMs` | `5000` | Initial retry delay |
| `bot.reconnectMaxMs` | `120000` | Maximum retry delay |\n| `bot.loginTimeoutMs` | `30000` | Max wait for Minecraft login before retry |
| `health.enabled` | `true` | Enable HTTP health endpoint |
| `health.port` | `3000` | Health server port |
| `logging.level` | `info` | Winston log level |
| `logging.file` | `logs/prime-afk-bot.log` | Log file path |
| `notifications.discordWebhookUrl` | empty | Optional Discord webhook |
| `notifications.offlineAlertMinutes` | `15` | Long-disconnection alert threshold |
| `commands.enabled` | `false` | Enable allowlisted chat commands |
| `commands.allowedUsers` | `["OperatorName"]` | Exact usernames allowed to issue commands |

Environment overrides: `MC_HOST`, `MC_PORT`, `MC_USERNAME`, `MC_VERSION`, `MC_AUTH`, `HEALTH_PORT`, and `DISCORD_WEBHOOK_URL`. Copy `.env.example` to `.env` for environment-based setup.

### Authentication
Use `offline` only on servers configured for offline-mode accounts. Use `microsoft` for Microsoft-authenticated accounts and complete the device-code flow if prompted. Never share cached auth data. This project does not bypass authentication or server permissions.

## Discord notifications
Create a webhook in a Discord channel you control. Put it in private `.env` as `DISCORD_WEBHOOK_URL=...` or in private `config.json` under `notifications.discordWebhookUrl`. Set `offlineAlertMinutes` to control the prolonged-disconnection alert (default 15). Treat the webhook URL like a password.

## Allowlisted chat commands
Commands are disabled by default. Enable in private `config.json`:

```json
"commands": { "enabled": true, "allowedUsers": ["YourMinecraftName"] }
```

| Command | Action |
|---|---|
| `!status` | Replies with connection state |
| `!say <message>` | Sends a short chat message as the bot |

Only exact usernames in `allowedUsers` can issue commands. Keep this list limited to trusted operators. Remote process stop/start commands are intentionally not implemented.

## Health endpoint
- `GET /` returns a short service message.
- `GET /health` returns JSON status.
- HTTP 200 means connected; HTTP 503 means the process is running but Minecraft is disconnected.

An uptime monitor can observe this app endpoint. It cannot keep a Minecraft server awake, override a hosting provider's sleep policy, or start an offline server.

## Ubuntu VPS with PM2
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
Run the extra command printed by `pm2 startup`. Useful commands: `pm2 status`, `pm2 logs prime-afk-bot`, `pm2 restart prime-afk-bot`.

## Docker
Install Docker Engine and Compose. Create private `.env` and `config.json`, then run `docker compose up -d --build`. Follow logs with `docker compose logs -f`; stop with `docker compose down`.

## Ubuntu systemd
An example unit is at `systemd/prime-afk-bot.service.example`. Install Node.js, clone to `/opt/prime-afk-bot`, install dependencies, create config, and adjust the example unit's Linux user and paths. Then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now prime-afk-bot
sudo journalctl -u prime-afk-bot -f
```

## Raspberry Pi
Use a supported 64-bit Raspberry Pi OS and compatible Node.js LTS release. Clone the repository, run `npm install`, create/edit `config.json`, and start with `npm start`. Use PM2 or systemd for process supervision.

## Free hosting
Only use providers that explicitly permit persistent processes and outbound Minecraft traffic. Free tiers may sleep, restrict sockets, or terminate workloads. Health checks do not override those restrictions. Check current provider terms and plan limits.

## Tests and checks
```bash
npm test
npm run check
```
These run the included reconnect tests and syntax checks; they do not replace a live-server test.

## Troubleshooting

| Issue | Check |
|---|---|
| Server offline / ping timeout | Hostname, port, DNS, server status, firewall, outbound access |
| Version mismatch | Exact server version and Mineflayer support |
| Authentication failure | Auth mode and Microsoft device login |
| Queue | Wait for the normal queue; reconnecting does not skip it |
| Kicked for AFK | Follow server rules; this bot does not evade AFK enforcement |
| Health returns 503 | Minecraft is disconnected; inspect logs |
| Port in use | Change `health.port` or `HEALTH_PORT` |
| Discord alert missing | Webhook URL, channel permissions, logs |
| Commands ignored | Enable commands and allowlist the exact username |

## Project structure
```text
prime-afk-bot/
├── src/ (index.js, bot.js, reconnect.js, serverPing.js, commands.js, notifier.js, logger.js, health.js)
├── test/ (reconnect and command tests)
├── .github/workflows/node.yml
├── helper/README.md
├── systemd/prime-afk-bot.service.example
├── config.example.json
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── ecosystem.config.js
├── package.json
├── .gitignore
├── LICENSE
└── README.md
```

## Limitations
This is a connection and monitoring starter, not an AFK-evasion tool. It intentionally excludes randomized movement/jumping/sneaking, automatic login-password submission, auto-starting Aternos servers, multi-account rotation, and controls designed to bypass server or host policies. Mineflayer features and server behavior vary by Minecraft version.

## License
MIT. See [LICENSE](LICENSE).
