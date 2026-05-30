module.exports = {
  apps: [
    {
      name: 'amg-api',
      cwd: './apps/api',
      script: 'dist/apps/api/src/main.js',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        API_PORT: 4000,
      },
    },
    {
      name: 'amg-web',
      cwd: './apps/web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
