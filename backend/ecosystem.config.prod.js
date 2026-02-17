// =============================================================================
// KAHADE - PM2 ECOSYSTEM PRODUCTION CONFIG
// Usage:
//   pm2 start ecosystem.config.prod.js --env production
//   pm2 reload ecosystem.config.prod.js --update-env
//   pm2 delete ecosystem.config.prod.js
// =============================================================================

module.exports = {
  apps: [
    {
      name: 'kahade-api',
      script: './dist/main.js',

      // ── Cluster mode for multi-core utilization ──────────────────────────
      // FIX: was `instances: 1, exec_mode: 'fork'` which doesn't scale.
      // Use 'max' to spawn one worker per CPU, or set a fixed number like 2/4.
      instances: process.env.PM2_INSTANCES || 'max',
      exec_mode: 'cluster',

      // ── Environment ───────────────────────────────────────────────────────
      // FIX: `env_file` is NOT a valid PM2 option — PM2 ignores it silently!
      // Solution: load .env.production in deploy.sh with `source .env.production`
      // BEFORE calling `pm2 start/reload` so PM2 inherits the vars.
      // The env_production block below overrides/ensures critical vars.
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },

      // ── Memory & Restart ─────────────────────────────────────────────────
      max_memory_restart: '512M',
      node_args: '--max-old-space-size=480',
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      exp_backoff_restart_delay: 100,
      listen_timeout: 15000,
      kill_timeout: 5000,

      // ── Logging ──────────────────────────────────────────────────────────
      error_file: '/var/log/kahade/pm2-error.log',
      out_file: '/var/log/kahade/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // ── Scheduling ───────────────────────────────────────────────────────
      cron_restart: '0 3 * * *', // Restart at 3 AM daily for memory cleanup

      // ── Misc ─────────────────────────────────────────────────────────────
      watch: false, // Never watch in production
    },
  ],
};
