import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Относительный base: ассеты грузятся и с корня (Cloudflare), и из подпапки
  // (SourceCraft Sites раздаёт по /<репо>/).
  base: './',
  plugins: [react()],
  server: { host: true },
});
