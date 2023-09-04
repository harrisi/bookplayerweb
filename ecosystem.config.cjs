module.exports = {
  apps: [
    {
      name: 'bookplayerweb',
      script: 'node build',
      time: true,
      watch: false,
      env: {
        PORT: 3001,
      },
    },
  ],
  deploy: {
    production: {
      user: process.env.BPW_USER,
      host: [process.env.BPW_HOST],
      ref: 'origin/main',
      repo: 'https://github.com/harrisi/bookplayerweb.git',
      path: process.env.BPW_PATH,
      'post-deploy': 'npm i && npm run build && npm ci --omit dev',
    },
  },
};
