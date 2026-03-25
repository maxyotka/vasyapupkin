// src/blog-article.js
import { initHeader, initContactDropdown } from './shared.js';

initHeader({ alwaysScrolled: true });
initContactDropdown();

// ─── Active TOC link on scroll ───
const tocLinks = document.querySelectorAll('.article-toc__list a');
const headings = document.querySelectorAll('.article__body h2[id], .article__body h3[id]');

if (tocLinks.length && headings.length) {
  // Track which headings are currently intersecting, pick the first in DOM order
  const intersecting = new Set();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          intersecting.add(entry.target);
        } else {
          intersecting.delete(entry.target);
        }
      });

      // Find topmost intersecting heading by DOM order
      let topmost = null;
      headings.forEach((h) => {
        if (intersecting.has(h) && !topmost) topmost = h;
      });

      // Only update when a heading is visible — prevents flicker during inter-heading gaps
      if (topmost) {
        tocLinks.forEach((link) => link.classList.remove('is-active'));
        const active = document.querySelector(`.article-toc__list a[href="#${encodeURIComponent(topmost.id)}"]`);
        active?.classList.add('is-active');
      }
    },
    { rootMargin: '-20% 0px -70% 0px' }
  );

  headings.forEach((h) => observer.observe(h));
}
