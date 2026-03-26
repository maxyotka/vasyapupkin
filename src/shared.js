// src/shared.js — общая логика для всех страниц

// ─── Header scroll / always-scrolled ───
export function initHeader({ alwaysScrolled = false } = {}) {
  const header = document.getElementById('header');
  if (!header) return;

  // Mark current page link for screen readers
  // Strip .html suffix to match both /gallery.html and clean /gallery URLs
  const path = window.location.pathname.replace(/\.html$/, '');
  header.querySelectorAll('a.header__item').forEach(link => {
    const rawHref = link.getAttribute('href');
    if (!rawHref) return;
    const href = rawHref.replace(/\.html$/, '');
    if (href === path) link.setAttribute('aria-current', 'page');
  });

  if (alwaysScrolled) {
    header.classList.add('is-scrolled');
    return;
  }

  // On mobile, switch to solid header sooner (after 60% of viewport)
  const threshold = () => window.innerWidth <= 768 ? 0.6 : 0.8;
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > window.innerHeight * threshold());
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ─── Contact dropdown ───
export function initContactDropdown() {
  const contactBtn = document.getElementById('contactBtn');
  const contactDropdown = document.getElementById('contactDropdown');
  if (!contactBtn || !contactDropdown) return;

  contactBtn.addEventListener('click', () => {
    const isOpen = contactDropdown.classList.toggle('is-open');
    contactBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    contactDropdown.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
  });

  document.addEventListener('click', (e) => {
    if (!contactBtn.contains(e.target) && !contactDropdown.contains(e.target)) {
      contactDropdown.classList.remove('is-open');
      contactBtn.setAttribute('aria-expanded', 'false');
      contactDropdown.setAttribute('aria-hidden', 'true');
    }
  });

  contactDropdown.addEventListener('focusout', (e) => {
    if (!contactDropdown.contains(e.relatedTarget) && !contactBtn.contains(e.relatedTarget)) {
      contactDropdown.classList.remove('is-open');
      contactBtn.setAttribute('aria-expanded', 'false');
      contactDropdown.setAttribute('aria-hidden', 'true');
    }
  });
}

