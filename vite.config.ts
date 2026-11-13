import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

function disableHmrWebSocketPlugin(): Plugin {
  let hmrDisabled = false;
  return {
    name: 'disable-hmr-websocket',
    apply: 'serve',
    configResolved(config) {
      hmrDisabled = config.server.hmr === false || config.server.ws === false;
    },
    transform(code, id) {
      if (!hmrDisabled) return null;
      const cleanId = id.replace(/\\/g, '/').split('?')[0];
      if (
        cleanId.endsWith('/vite/dist/client/client.mjs') ||
        cleanId.endsWith('/vite/dist/client/bundledDevClient.mjs')
      ) {
        const replaced = code.replace(
          /createWebSocketModuleRunnerTransport\(\{[\s\S]*?pingInterval:\s*hmrTimeout\s*\}\)/g,
          '({ async connect() {}, async disconnect() {}, send() {} })'
        );
        if (replaced !== code) {
          return { code: replaced, map: null };
        }
      }
      return null;
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), disableHmrWebSocketPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio container environment.
      hmr: false,
      ws: false as const,
      // Disable file watching to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
