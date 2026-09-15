module.exports = {
  apps: [
    {
      name: 'krphysiotherapy',
      script: 'backend/src/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development',
        PORT: 5100
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5100
      }
    }
  ]
};
