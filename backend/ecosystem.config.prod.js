module.exports = {
  apps: [{
    name: 'kahade-api',
    script: './dist/main.js',
    instances: 2,
    exec_mode: 'cluster',
    env_file: '.env.production',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    max_memory_restart: '500M',
    node_args: '--max-old-space-size=460',
    error_file: '/var/log/kahade/pm2-error.log',
    out_file: '/var/log/kahade/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: '10s',
    listen_timeout: 10000,
    kill_timeout: 5000,
    wait_ready: true,
    cron_restart: '0 3 * * *', // Restart setiap jam 3 pagi
    exp_backoff_restart_delay: 100
  }]
};
