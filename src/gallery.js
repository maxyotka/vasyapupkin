// src/gallery.js
import { initHeader, initContactDropdown } from './shared.js';

initHeader({ alwaysScrolled: true });
initContactDropdown();

// ─── Lightbox ───
const lightbox = document.getElementById('lightbox');
const lightboxContent = document.getElementById('lightboxContent');
const lightboxClose = document.getElementById('lightboxClose');

let isClosing = false;
let triggerEl = null;
let cleanupTimer = null;
let pendingTransitionEnd = null;

function cancelPendingCleanup() {
  clearTimeout(cleanupTimer);
  cleanupTimer = null;
  if (pendingTransitionEnd) {
    lightbox.removeEventListener('transitionend', pendingTransitionEnd);
    pendingTransitionEnd = null;
  }
}

function openLightbox(item) {
  cancelPendingCleanup();
  isClosing = false;
  const type = item.dataset.type;
  const src = item.dataset.src;

  lightboxContent.innerHTML = '';

  if (type === 'youtube') {
    const iframe = document.createElement('iframe');
    iframe.src = src + '?autoplay=1';
    iframe.allow = 'autoplay; fullscreen';
    iframe.allowFullscreen = true;
    lightboxContent.appendChild(iframe);
  } else {
    const img = document.createElement('img');
    img.src = src;
    img.alt = item.querySelector('img')?.alt || '';
    lightboxContent.appendChild(img);
  }

  lightbox.removeAttribute('hidden');
  lightbox.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => lightbox.classList.add('is-open'));
  document.body.style.overflow = 'hidden';
  lightboxClose?.focus();
}

function closeLightbox() {
  if (isClosing) return;
  isClosing = true;
  lightbox.classList.remove('is-open');
  document.body.style.overflow = '';

  function cleanup() {
    lightbox.setAttribute('hidden', '');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxContent.innerHTML = '';
    isClosing = false;
    triggerEl?.focus();
    triggerEl = null;
  }

  cleanupTimer = setTimeout(cleanup, 500);
  pendingTransitionEnd = function onTransitionEnd(e) {
    if (e.target !== lightbox) return;
    clearTimeout(cleanupTimer);
    cleanupTimer = null;
    lightbox.removeEventListener('transitionend', pendingTransitionEnd);
    pendingTransitionEnd = null;
    cleanup();
  };
  lightbox.addEventListener('transitionend', pendingTransitionEnd);
}

// Open on item click or Enter/Space keyboard activation
document.querySelectorAll('.gallery-item').forEach((item) => {
  item.addEventListener('click', () => {
    triggerEl = item;
    openLightbox(item);
  });
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerEl = item;
      openLightbox(item);
    }
  });
});

// Close button
lightboxClose?.addEventListener('click', closeLightbox);

// Close on backdrop click
lightbox?.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

// Close on Escape; focus trap keeps focus inside while open
document.addEventListener('keydown', (e) => {
  if (lightbox && !lightbox.hasAttribute('hidden')) {
    if (e.key === 'Escape') { closeLightbox(); return; }
    if (e.key === 'Tab') {
      const focusable = Array.from(lightbox.querySelectorAll('button, iframe, [tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) { e.preventDefault(); return; }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
  }
});
