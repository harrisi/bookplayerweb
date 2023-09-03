module.exports = {
  deploy: {
    production: {
      user: process.env.BPW_USER,
      host: [process.env.BPW_HOST],
      ref: 'origin/main',
      repo: 'git@github.com:harrisi/bookplayerweb.git',
      path: 'process.env.BPW_PATH',
      'post-deploy': 'npm i && npm run build && npm ci --omit dev',
    },
  },
};
