// =============================================================================
// KAHADE - PM2 ECOSYSTEM PRODUCTION CONFIG
// Usage:
//   # Load env FIRST, then start (env_file requires PM2 >= 5.x):
//   set -a && source .env.production && set +a
//   pm2 start ecosystem.config.prod.js
//   pm2 reload ecosystem.config.prod.js --update-env
//   pm2 delete ecosystem.config.prod.js
// =============================================================================

module.exports = {
  apps: [
    {
      name: 'kahade-api',
      script: './dist/main.js',

      // FIX: 'cluster' mode breaks Socket.IO WebSocket (requires sticky sessions / shared adapter).
      // Use 'fork' mode with instances: 1 unless you have Redis-based Socket.IO adapter configured.
      // If you scale horizontally (e.g. 4 instances), add socket.io-redis adapter first.
      instances: process.env.PM2_INSTANCES || 1,
      exec_mode: 'fork',

      // ── Environment ───────────────────────────────────────────────────────────
      // env_file is supported in PM2 >= 5.x.
      // IMPORTANT: always `source .env.production` in your shell BEFORE calling pm2
      // so that older PM2 versions also get the env vars.
      env_file: '.env.production',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },

      // ── Memory & Restart ─────────────────────────────────────────────────────
      max_memory_restart: '512M',
      node_args: '--max-old-space-size=480',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      exp_backoff_restart_delay: 100,
      listen_timeout: 15000,
      kill_timeout: 5000,

      // ── Logging ──────────────────────────────────────────────────────────────
      error_file: '/var/log/kahade/pm2-error.log',
      out_file: '/var/log/kahade/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // ── Scheduling ───────────────────────────────────────────────────────────
      cron_restart: '0 3 * * *', // Restart at 3 AM daily for memory cleanup

      // ── Misc ─────────────────────────────────────────────────────────────────
      watch: false, // Never watch in production
    },
  ],
};
