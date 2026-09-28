import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import site from './src/content/site.json' with { type: 'json' };

// Домен задаётся в одном месте: src/content/site.json → "url"
export default defineConfig({
  site: site.url,
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [tailwind({ applyBaseStyles: false }), sitemap()],
});
