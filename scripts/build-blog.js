// scripts/build-blog.js
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join, basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { marked } from 'marked';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT        = join(__dirname, '..');
const CONTENT_DIR = join(ROOT, 'content/blog');
const OUT_DIR     = join(ROOT, 'blog');

// ── Exports for unit tests ─────────────────────────────────────────
export function slugify(filename) {
  return basename(filename, '.md')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function parseFrontMatter(content, opts = {}) {
  const result = matter(content);
  if (opts.requireAll) {
    const required = ['title', 'date', 'preview', 'readingTime'];
    for (const field of required) {
      if (result.data[field] == null) throw new Error(`Missing required front-matter field: ${field}`);
    }
  }
  return result;
}

// ── Helpers ────────────────────────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const MONTHS_RU = ['января','февраля','марта','апреля','мая','июня',
                   'июля','августа','сентября','октября','ноября','декабря'];

function formatDateRu(isoDate) {
  const d = new Date(isoDate + 'T12:00:00');
  return `${d.getDate()} ${MONTHS_RU[d.getMonth()]} ${d.getFullYear()}`;
}

function buildToc(body) {
  let idx = 0;
  const headings = [];
  const bodyWithIds = body.replace(/<(h[23])([^>]*)>([\s\S]*?)<\/\1>/gi, (match, tag, attrs, content) => {
    const existingId = /id="([^"]+)"/.exec(attrs);
    const id = existingId ? existingId[1] : `section-${++idx}`;
    const text = content.replace(/<[^>]+>/g, '').trim();
    headings.push({ id, text });
    if (existingId) return match;
    return `<${tag}${attrs} id="${escapeHtml(id)}">${content}</${tag}>`;
  });
  if (!headings.length) {
    return { toc: '<aside class="article-toc" aria-hidden="true"></aside>', body: bodyWithIds };
  }
  const items = headings.map(h => `<li><a href="#${encodeURIComponent(h.id)}">${escapeHtml(h.text)}</a></li>`).join('\n          ');
  const toc = `<aside class="article-toc" aria-label="Содержание">
      <nav>
        <p class="article-toc__label">Содержание</p>
        <ul class="article-toc__list">
          ${items}
        </ul>
      </nav>
    </aside>`;
  return { toc, body: bodyWithIds };
}

const HEADER_HTML = `  <header class="header" id="header">
    <div class="header__left">
      <a class="header__home" href="/">Влад Ковальский</a>
    </div>
    <nav class="header__right" aria-label="Основная навигация">
      <button class="header__item" id="contactBtn" aria-expanded="false" aria-controls="contactDropdown">Контакт</button>
      <a class="header__item" href="/gallery.html">Галерея</a>
      <a class="header__item" href="/blog.html">Мои мысли</a>
    </nav>
  </header>

  <div class="contact-dropdown" id="contactDropdown" aria-labelledby="contactBtn" aria-hidden="true">
    <div class="contact-dropdown__inner">
      <ul class="contact-dropdown__list">
        <li class="contact-dropdown__item"><a href="https://t.me/vladkovalsky" target="_blank" rel="noopener noreferrer">@vladkovalsky — Telegram</a></li>
        <li class="contact-dropdown__item"><a href="https://vk.com/vladkovalsky" target="_blank" rel="noopener noreferrer">vk.com/vladkovalsky</a></li>
        <li class="contact-dropdown__item"><a href="tel:+79991234567">+7 (999) 123-45-67</a></li>
      </ul>
    </div>
  </div>`;

const FOOTER_HTML = `  <footer class="footer" id="footer">
    <div class="footer__contacts">
      <a href="tel:+79991234567" class="footer__contact-item">+7 (999) 123-45-67</a>
      <a href="mailto:hello@vladkovalsky.ru" class="footer__contact-item">hello@vladkovalsky.ru</a>
      <a href="https://t.me/vladkovalsky" target="_blank" rel="noopener noreferrer" class="footer__contact-item">@vladkovalsky</a>
    </div>
    <div class="footer__bottom">
      <span class="footer__copy">© 2026 Влад Ковальский</span>
      <a class="footer__credit" href="https://gundyrev.com" target="_blank" rel="noopener noreferrer">by Gundyrev</a>
    </div>
  </footer>`;

// ── HTML Templates ─────────────────────────────────────────────────
function articleTemplate({ title, date, preview, readingTime, body, related }) {
  const { toc, body: bodyWithIds } = buildToc(body);
  const dateDisplay = formatDateRu(date);
  const safeTitle = escapeHtml(title);
  const safePreview = escapeHtml(preview);
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle} — Влад Ковальский</title>
  <meta name="description" content="${safePreview}" />
  <meta property="og:title" content="${safeTitle} — Влад Ковальский" />
  <meta property="og:description" content="${safePreview}" />
  <meta property="og:image" content="https://vladkovalsky.ru/og-image.jpg" />
  <meta property="og:type" content="article" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Exo+2:ital,wght@0,200;0,300;0,400;0,500;0,600;1,200;1,300;1,400&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/src/styles/base.css" />
  <link rel="stylesheet" href="/src/styles/nav.css" />
  <link rel="stylesheet" href="/src/styles/blog-article.css" />
  <link rel="stylesheet" href="/src/styles/footer.css" />
  <link rel="stylesheet" href="/src/styles/responsive.css" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
  <link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />
</head>
<body>

${HEADER_HTML}

  <main>
    <div class="article-layout">
      ${toc}
      <article class="article">
        <header class="article__header">
          <a href="/blog.html" class="article__back">← Мои мысли</a>
          <div class="article__meta">
            <time class="article__date" datetime="${date}">${dateDisplay}</time>
            <span class="article__read-time">${readingTime} мин читать</span>
          </div>
          <h1 class="article__title">${safeTitle}</h1>
        </header>
        <div class="article__body">
          ${bodyWithIds}
        </div>
      </article>
    </div>
    ${related}
  </main>

${FOOTER_HTML}

  <script type="module" src="/src/blog-article.js"></script>
</body>
</html>`;
}

function listTemplate(cards) {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Мои мысли — Влад Ковальский</title>
  <meta name="description" content="Заметки ведущего Влада Ковальского о мероприятиях, людях и работе." />
  <meta property="og:title" content="Мои мысли — Влад Ковальский" />
  <meta property="og:description" content="Заметки ведущего Влада Ковальского о мероприятиях, людях и работе." />
  <meta property="og:image" content="https://vladkovalsky.ru/og-image.jpg" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Exo+2:ital,wght@0,200;0,300;0,400;0,500;0,600;1,200;1,300;1,400&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/src/styles/base.css" />
  <link rel="stylesheet" href="/src/styles/nav.css" />
  <link rel="stylesheet" href="/src/styles/blog.css" />
  <link rel="stylesheet" href="/src/styles/footer.css" />
  <link rel="stylesheet" href="/src/styles/responsive.css" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
  <link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />
</head>
<body>

${HEADER_HTML}

  <main>
    <section class="blog-header">
      <h1 class="blog-header__title">Мои<br><em>мысли</em></h1>
      <p class="blog-header__sub">Не советы. Не инструкции. Просто то, о чём думаю.</p>
    </section>
    <section class="blog-scatter" aria-label="Статьи">
      <div class="blog-scatter__canvas" id="blogCanvas">
        ${cards}
      </div>
    </section>
  </main>

${FOOTER_HTML}

  <script type="module" src="/src/blog-list.js"></script>
</body>
</html>`;
}

// ── Main build ─────────────────────────────────────────────────────
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const files = readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
  const posts = files.map(file => {
    const raw     = readFileSync(join(CONTENT_DIR, file), 'utf-8');
    const { data, content } = parseFrontMatter(raw, { requireAll: true });
    const slug    = slugify(file);
    const body    = marked.parse(content);
    return { ...data, date: new Date(data.date).toISOString().slice(0, 10), slug, body };
  }).sort((a, b) => b.date.localeCompare(a.date));

  // Generate article pages
  posts.forEach((post, i) => {
    const dir = join(OUT_DIR, post.slug);
    mkdirSync(dir, { recursive: true });

    const related = posts
      .filter((_, idx) => idx !== i)
      .slice(0, 2)
      .map(r => `<article class="related-card"><a class="related-card__link" href="/blog/${r.slug}/"><time class="related-card__date" datetime="${r.date}">${formatDateRu(r.date)}</time><h3 class="related-card__title">${escapeHtml(r.title)}</h3></a></article>`)
      .join('');

    const html = articleTemplate({
      title: post.title,
      date:  post.date,
      preview: post.preview,
      readingTime: post.readingTime,
      body:  post.body,
      related: related ? `<section class="related container"><p class="related__title">Другие мысли</p><div class="related__grid">${related}</div></section>` : ''
    });

    writeFileSync(join(dir, 'index.html'), html);
  });

  // Generate blog index (writes to root blog.html)
  const cards = posts.map(post => `
        <article class="blog-card">
          <a class="blog-card__link" href="/blog/${post.slug}/">
            <time class="blog-card__date" datetime="${post.date}">${formatDateRu(post.date)}</time>
            <h2 class="blog-card__title">${escapeHtml(post.title)}</h2>
            <p class="blog-card__excerpt">${escapeHtml(post.preview)}</p>
            <span class="blog-card__read">Читать →</span>
          </a>
        </article>`).join('');

  writeFileSync(join(ROOT, 'blog.html'), listTemplate(cards));

  console.log(`Blog built: ${posts.length} posts`);
}
