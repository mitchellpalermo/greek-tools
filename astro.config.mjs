// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';
import clerk from '@clerk/astro';

export default defineConfig({
  integrations: [react(), clerk()],
  adapter: cloudflare(),
  vite: {
    plugins: [tailwindcss()],
  },
});
