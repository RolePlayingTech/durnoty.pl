import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  site: 'https://durnoty.pl',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  server: { host: '127.0.0.1' },
  vite: { ssr: { external: ['better-sqlite3'] } },
});
