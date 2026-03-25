// vite.config.js
import { defineConfig } from 'vite';
import { resolve, join, dirname } from 'path';
import { readdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function getBlogInputs() {
  const blogDir = resolve(__dirname, 'blog');
  if (!existsSync(blogDir)) return {};
  const slugs = readdirSync(blogDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .filter(slug => existsSync(join(blogDir, slug, 'index.html')));
  return Object.fromEntries(
    slugs.map(slug => [
      `blog-${slug}`,
      join(blogDir, slug, 'index.html')
    ])
  );
}

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main:           resolve(__dirname, 'index.html'),
        gallery:        resolve(__dirname, 'gallery.html'),
        blogList:       resolve(__dirname, 'blog.html'),
...getBlogInputs()
      }
    }
  },
  test: {
    environment: 'jsdom',
    exclude: ['tests/e2e.spec.js', 'tests/debug.spec.js', 'node_modules/**']
  }
});
