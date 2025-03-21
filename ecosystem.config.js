module.exports = {
  apps: [
    {
      name: 'oms-backend',
      script: './app/backend/dist/index.js',
      instances: 1,
      autorestart: true,
      watch: ['./app/backend/dist'],
      ignore_watch: ['node_modules', 'logs'],
      watch_options: {
        followSymlinks: false
      },
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 6060
      }
    },
    {
      name: 'oms-frontend',
      script: 'serve',
      instances: 1,
      autorestart: true,
      watch: ['./app/frontend/dist'],
      ignore_watch: ['node_modules'],
      watch_options: {
        followSymlinks: false
      },
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PM2_SERVE_PATH: './app/frontend/dist',
        PM2_SERVE_PORT: 5173,
        PM2_SERVE_SPA: 'true',
        PM2_SERVE_HOMEPAGE: '/index.html'
      }
    }
  ]
};