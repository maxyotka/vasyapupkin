# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Команды

```bash
npm run dev       # dev-сервер на http://localhost:5173
npm run build     # scripts/build-blog.js → vite build → dist/
npm run preview   # предпросмотр dist/ на http://localhost:4173
npm test          # vitest run (все тесты в tests/)
```

**Порядок build важен:** сначала `build-blog.js` генерирует `blog/*/index.html` из markdown, затем Vite включает их в бандл через `rollupOptions.input`.

## Архитектура

**Стек (фактический):** Vite + Vanilla JS + CSS-переменные. Tailwind не используется.

**Многостраничный SPA:**
- `index.html` → `src/main.js`
- `blog.html` → `src/blog-list.js`
- `gallery.html` → `src/gallery.js`
- `blog-article.html` → `src/blog-article.js`

**Shared-модуль:** `src/shared.js` экспортирует `initHeader`, `initContactDropdown` — импортируется в каждом page-скрипте. Сложные секции выносятся в `src/sections/` (например `formats-scroll.js`).

**Блог-пайплайн:**
- Контент: `content/blog/*.md` (frontmatter: title, date, preview, readingTime — все обязательны)
- Генерация: `scripts/build-blog.js` (gray-matter + marked) → `blog/{slug}/index.html`
- Vite `getBlogInputs()` в `vite.config.js` автоматически добавляет все `blog/*/index.html` как entry points
- При добавлении статьи: только создать `.md`, сборка сама подхватит

**Шрифты по страницам:**
- Все страницы: Playfair Display + Exo 2 (задаётся в каждом HTML-шаблоне)

**Тесты:** `tests/*.test.js` — vitest с jsdom. Тестируются `slugify`, `parseFrontMatter` из `build-blog.js` и утилиты.

**CSS:** Все переменные палитры в `src/styles/base.css`. Стили разбиты по компонентам: `nav.css`, `hero.css`, `formats.css`, `footer.css`, `responsive.css`, `gallery.css`, `blog.css`, `blog-article.css`.

---

# CLAUDE.md — Персональный сайт ведущего мероприятий

## Проект

Сайт-визитка для ведущего мероприятий (MC/showman). Премиальный, анимированный, с разделом «Мои мысли» (блог). НЕ Tilda, НЕ шаблон — полностью кастомный код. Целевая аудитория — люди, которые ищут ведущего на свадьбу, корпоратив, частное мероприятие. Сайт должен передавать энергию, харизму и профессионализм.

## Референсы

**Нравится (делаем как):**
- vadimkorobkov.ru — тёмная тема, SVG-иллюстрации, разреженная типографика, hub-and-spoke навигация
- vladislavsapunov.com — editorial/magazine метафора, скачиваемый райдер, кастомная графика
- landonorris.com — GSAP scroll-анимации, тёмный фон + яркий акцент, scroll-driven storytelling
- sunnybonnell.com — oversized типографика, чёрно-белый минимализм, speaker reel в hero

**НЕ нравится (избегаем):**
- emelyanov-aleksei.ru — шаблонный Tilda-вайб, нет анимаций, нет динамики
- belov.host — слишком примитивно, одна страница с 4 кнопками
- Любые сайты с эмодзи в тексте, видимыми ценами, стоковыми фото

## Стек

```
Framework:    Next.js 14+ (App Router) со static export (`output: 'export'`)
              ИЛИ plain HTML/CSS/JS если проще — решай по ситуации
Styling:      Tailwind CSS 3+ с кастомными CSS-переменными
Animations:   GSAP 3 (ScrollTrigger, SplitText) + Lenis (smooth scroll)
Typography:   Google Fonts — см. секцию «Типографика»
Icons:        Lucide или кастомные SVG
Blog CMS:     Markdown-файлы в /content/blog/ (без внешней CMS на старте)
Build:        Static HTML → деплой на VPS через Nginx
```

**GSAP + Lenis интеграция:**
```js
// Lenis управляет скроллом, GSAP управляет анимациями
const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

## Дизайн-система

### Палитра — вдохновлена сериалом «Это мы» (This Is Us)

Тёплая, ностальгическая, уютная. НИКОГДА не используй чистый #FFFFFF или #000000. Все нейтральные цвета несут тепло.

```css
:root {
  /* Фоны */
  --bg-light:        #FBF7F0;  /* тёплый off-white, основной фон */
  --bg-cream:        #F5E6D0;  /* карточки, секции, testimonials */
  --bg-dark:         #3E2723;  /* hero, footer — тёплый тёмный, НЕ чёрный */
  --bg-darker:       #2C2018;  /* footer, overlay */

  /* Акценты */
  --accent-primary:  #D4943E;  /* golden amber — CTA, ссылки, ключевые элементы */
  --accent-hover:    #B87830;  /* hover на CTA (primary затемнённый на 15%) */
  --accent-secondary:#CB7B3E;  /* autumn orange — теги, бейджи */
  --accent-highlight:#E8B960;  /* soft honey — selected, notification */
  --accent-warm:     #C9A9A6;  /* dusty rose — footer links, subtle */
  --accent-rich:     #A0522D;  /* burnt sienna — emotional emphasis, active */
  --accent-nature:   #6B7B5E;  /* muted olive — ОЧЕНЬ редко, акцент природы */

  /* Текст */
  --text-primary:    #3E2723;  /* основной текст — тёплый тёмно-коричневый */
  --text-secondary:  #8B7D6B;  /* даты, подписи, мета */
  --text-on-dark:    #FBF7F0;  /* текст на тёмном фоне */
  --text-on-dark-muted: #C9A9A6; /* вторичный текст на тёмном */

  /* Утилиты */
  --border:          #E8DDD0;  /* границы, разделители */
  --shadow:          rgba(62, 39, 35, 0.08); /* тёплые тени */
}
```

### Типографика

Два шрифта. Display — для заголовков (крупный, характерный). Body — для текста (читаемый, тёплый).

**Вариант A (editorial/элегантный):**
- Display: `Playfair Display` (serif, 700/900) — для имени, заголовков секций
- Body: `Manrope` (sans-serif, 300/400/600) — для текста, навигации

**Вариант B (современный/минималистичный):**
- Display: `Instrument Serif` (serif, 400) — изящный, лёгкий
- Body: `Satoshi` или `General Sans` (sans-serif) — чистый, геометричный

**Вариант C (brutalist/дерзкий):**
- Display: `Unbounded` (sans-serif, 700/900) — жирный, кричащий
- Body: `IBM Plex Sans` (sans-serif, 300/400) — контрастная пара

Выбери один вариант и используй его ВЕЗДЕ последовательно. Размеры:
```
Hero имя:        clamp(3rem, 8vw, 8rem)
Заголовки H2:    clamp(2rem, 4vw, 4rem)
Подзаголовки H3: clamp(1.25rem, 2vw, 2rem)
Body:            1rem / 1.125rem, line-height: 1.6
Caption/meta:    0.875rem, letter-spacing: 0.05em, uppercase
```

### Spacing & Layout

```
Контейнер:       max-width: 1400px, padding: 0 clamp(1rem, 4vw, 4rem)
Секции:          padding-block: clamp(4rem, 10vh, 10rem)
Grid:            CSS Grid, 12 колонок, gap: 2rem
Карточки:        border-radius: 0 (острые углы) ИЛИ 1rem (мягкие) — выбери одно
```

## Структура сайта

### Страница 1: Главная (/)

**Секция: Hero (полный экран)**
- Фон: `--bg-dark` или видео-луп (8 сек, H.264, <5MB, muted autoplay)
- По центру: имя ведущего — огромный display-шрифт, SplitText анимация (посимвольный reveal)
- Под именем: короткий tagline (1 строка), fade-in с задержкой
- Внизу: стрелка-скролл или «Узнать больше» с bounce-анимацией
- CTA: «Обсудить мероприятие» — кнопка `--accent-primary`

**Секция: О себе**
- Layout: текст слева (60%) + фото справа (40%), или наоборот
- Текст: 2-3 абзаца, кто он, чем занимается, что его отличает. НЕ перечисление услуг, а ЛИЧНОСТЬ
- Фото: scroll-parallax (gsap ScrollTrigger, y: -50px)
- Анимация: текст fade-up при scroll-in, фото slide-in с opacity

**Секция: Что я делаю (формат мероприятий)**
- 3-4 карточки: Свадьбы, Корпоративы, Частные мероприятия, (опционально: Конференции)
- Каждая карточка: фоновое видео/фото, название, 1-2 строки описания
- Hover: масштабирование (scale 1.02), overlay затемнение, текст становится ярче
- Stagger-анимация: карточки появляются с задержкой 0.15s при scroll-in

**Секция: Showreel / Видео**
- Полноширинный блок с embedded видео (YouTube/VK Video iframe)
- ИЛИ кастомный видеоплеер с poster-кадром
- При скролле: видео-секция «приклеивается» (ScrollTrigger pin) пока пользователь не проскроллит

**Секция: Отзывы**
- Горизонтальный marquee-скролл (бесконечная лента) ИЛИ карточки-слайдер
- Каждый отзыв: цитата, имя, тип мероприятия, дата
- Текст отзыва крупным шрифтом, display, с кавычками-«ёлочками»

**Секция: Логотипы клиентов (опционально)**
- Горизонтальная лента SVG-логотипов, бесконечный scroll (CSS animation, не JS)
- Grayscale по умолчанию, цвет при hover
- Если клиент — свадебный ведущий, заменить на счётчик: «500+ мероприятий, 12 лет опыта, ...»

**Секция: Контакт / CTA**
- Крупный текст: «Давайте сделаем ваше событие незабываемым»
- Форма: имя, телефон/email, дата мероприятия, тип, сообщение
- ИЛИ просто кнопка «Написать в Telegram» / «Написать в WhatsApp»
- Фон: `--bg-dark`, текст `--text-on-dark`

**Footer**
- Имя, email, телефон, ссылки на соцсети (Telegram, VK, Instagram)
- Ссылка на скачивание райдера (PDF)
- «© 2026 [Имя]. Все права защищены.»
- Фон: `--bg-darker`

### Страница 2: Мои мысли (/blog)

**Список статей**
- Grid: 2 колонки на desktop, 1 на mobile
- Каждая карточка: превью-фото (aspect-ratio 16/9), заголовок, дата, 2 строки текста
- Hover: фото scale 1.05 + overlay, заголовок подчёркивается

**Страница статьи (/blog/[slug])**
- Заголовок крупным display-шрифтом
- Дата, время чтения
- Markdown → HTML с кастомными стилями для h2, h3, p, blockquote, img, code
- Боковая навигация (table of contents) на desktop — sticky
- Внизу: «Другие мысли» — 2-3 карточки ещё статей

### Страница 3: Обо мне (/about) — опционально

- Расширенная биография
- Фотогалерея (masonry grid или горизонтальный scroll)
- Timeline карьеры (вертикальная линия с точками, scroll-animated)
- Скачать райдер / презентацию (PDF)

## Правила анимаций

### Глобальные

```
Easing по умолчанию:  "power2.out" для входов, "power2.inOut" для трансформ
Длительность:         0.6-1.0s для секций, 0.3-0.4s для hover
Stagger:              0.1-0.15s между элементами
ScrollTrigger start:  "top 80%" (элемент начинает анимацию когда его верх на 80% viewport)
```

### По секциям

| Элемент | Анимация | Trigger |
|---------|----------|---------|
| Hero имя | SplitText: chars reveal снизу вверх, stagger 0.03s | Page load |
| Hero tagline | Fade + translateY(20px), delay 0.8s | Page load |
| Hero CTA | Fade + scale(0.95→1), delay 1.2s | Page load |
| Секция заголовок H2 | SplitText: words reveal, stagger 0.08s | ScrollTrigger |
| Параграфы | Fade + translateY(30px) | ScrollTrigger |
| Карточки (grid) | Stagger fade+translateY, 0.15s между карточками | ScrollTrigger |
| Фото | Clip-path reveal (inset 100% → 0%) ИЛИ parallax translateY | ScrollTrigger |
| Видео-секция | Pin + scale(0.9→1) при скролле | ScrollTrigger pin |
| Счётчики | CountUp от 0 до значения, duration 2s | ScrollTrigger |
| Навигация | Backdrop-blur появляется после скролла 100px | Scroll event |

### prefers-reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
Если включено: отключить все GSAP-анимации, показать контент сразу. Lenis тоже выключить.

## Правила для изображений

- Все фото в формате WebP, с fallback JPEG
- Hero video: MP4 H.264, 1920x1080, <5MB, 6-8 секунд, loop
- Mobile: заменить video на статичный poster (picture + source media)
- Lazy loading для всего ниже first viewport
- aspect-ratio задавать явно чтобы избежать CLS

## Responsive

```
Desktop:  > 1024px  — полный layout, все анимации
Tablet:   768-1024  — упрощённый grid (2→1 колонка), анимации сохранить
Mobile:   < 768     — одна колонка, упрощённые анимации (без parallax), hamburger меню
```

Навигация на mobile: полноэкранный overlay с вертикальным списком, анимация open/close через GSAP.

## SEO & Performance

- Все страницы: уникальный title, meta description, og:image
- Структурированные данные: Person schema (JSON-LD) на главной
- Шрифты: `font-display: swap`, preload critical fonts
- Изображения: `<Image>` с next/image ИЛИ ручной `<picture>` с srcset
- Целевые метрики: LCP < 2.5s, CLS < 0.1, FID < 100ms

## Контент-плейсхолдеры

Пока нет реального контента, используй осмысленные плейсхолдеры:

```
Имя:           «Александр Волков»
Tagline:        «Ведущий, который чувствует вашу историю»
О себе:         2-3 абзаца про подход к работе, философию, опыт (БЕЗ клише типа «индивидуальный подход»)
Мероприятия:    Свадьбы, Корпоративы, Частные вечера, Конференции
Отзывы:         3-5 реалистичных отзывов с именами и датами
Блог:           2-3 статьи-заглушки: «Как выбрать ведущего», «5 ошибок на свадьбе», «Закулисье корпоратива»
Контакты:       +7 (999) 123-45-67, hello@example.ru, @username
```

## Чего НЕ делать

- НЕ используй чистый чёрный (#000) или белый (#FFF) — только тёплые оттенки
- НЕ показывай цены на сайте — только «Обсудить»
- НЕ используй стоковые фото — лучше абстрактные SVG-формы как плейсхолдеры
- НЕ делай «портянку» текста — короткие абзацы, много воздуха
- НЕ используй эмодзи в тексте
- НЕ используй шрифты Inter, Roboto, Arial, Open Sans
- НЕ делай карусель на автоплее без контроля пользователя
- НЕ ставь музыку на автоплей
- НЕ забывай alt-тексты на изображениях

## Порядок работы

1. Инициализируй проект (Next.js ИЛИ Vite + vanilla)
2. Настрой Tailwind + CSS-переменные палитры
3. Установи GSAP, Lenis, подключи шрифты
4. Собери layout: навигация + footer
5. Собери Hero секцию с анимациями
6. По секциям сверху вниз: «О себе» → «Форматы» → «Видео» → «Отзывы» → «Контакт»
7. Собери страницу блога (список + статья)
8. Responsive pass: проверь все breakpoints
9. Performance pass: оптимизируй изображения, шрифты, bundle
10. Final: SEO meta, favicon, og:image, 404-страница
