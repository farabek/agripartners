import { defineConfig } from 'vite';

const release = process.env.VITE_RELEASE || 'Alpha v1.2';
const commit = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || 'local';
const builtAt = new Date().toISOString();

export default defineConfig({
  plugins: [{
    name: 'agripartners-build-info',
    transformIndexHtml(html) {
      return html.replace(
        '</head>',
        `  <meta name="agripartners-release" content="${release}">\n` +
        `  <meta name="agripartners-commit" content="${commit}">\n` +
        `  <meta name="agripartners-built-at" content="${builtAt}">\n</head>`,
      );
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'build-info.json',
        source: `${JSON.stringify({ release, commit, builtAt }, null, 2)}\n`,
      });
    },
  }],
  build: {
    rollupOptions: {
      input: {
        app: 'index.html',
        walletAuthPoc: 'wallet-auth-poc.html',
      },
      output: {
        manualChunks(id) {
          if (id.includes('/chart.js/') || id.includes('\\chart.js\\')) return 'chart';
          return undefined;
        },
      },
    },
  },
});
