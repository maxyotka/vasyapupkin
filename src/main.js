// src/main.js
import { initHeader, initContactDropdown } from './shared.js';
import { initFormatsScroll, initFooterReveal, initMobileFormats } from './sections/formats-scroll.js';

initHeader();
initContactDropdown();

// Hero portrait load animation
const heroImg = document.querySelector('.hero__portrait img');
if (heroImg) {
  if (heroImg.complete) {
    heroImg.classList.add('is-loaded');
  } else {
    heroImg.addEventListener('load', () => heroImg.classList.add('is-loaded'));
  }
}

document.querySelectorAll('.format-panel').forEach((panel) => {
  panel.addEventListener('click', () => panel.classList.toggle('is-colored'));
});

// Formats horizontal scroll
initFormatsScroll();

// Footer rises up from below after formats section
initFooterReveal();

// Mobile format panel reveal animations
initMobileFormats();


