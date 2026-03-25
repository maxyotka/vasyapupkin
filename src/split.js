// src/split.js — text splitting utilities for GSAP animations

/**
 * Split element text into per-character <span>s.
 * Sets aria-label on the element to preserve accessible text.
 * Spaces become non-breaking spaces so they retain visual width.
 * @param {HTMLElement} el
 * @returns {HTMLElement[]} array of char spans
 */
export function splitChars(el) {
  const originalText = el.textContent;
  el.setAttribute('aria-label', originalText);

  const chars = [...originalText].map((char) => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.style.display = 'inline-block';
    return span;
  });

  el.innerHTML = '';
  chars.forEach((span) => el.appendChild(span));
  return chars;
}

/**
 * Split element text into per-word <span>s.
 * @param {HTMLElement} el
 * @returns {HTMLElement[]} array of word spans
 */
export function splitWords(el) {
  const originalText = el.textContent;
  el.setAttribute('aria-label', originalText);
  const words = originalText.split(/\s+/).filter(Boolean);

  el.innerHTML = '';
  return words.map((word, i) => {
    const span = document.createElement('span');
    span.textContent = word;
    span.style.display = 'inline-block';
    el.appendChild(span);
    if (i < words.length - 1) {
      el.appendChild(document.createTextNode('\u00A0'));
    }
    return span;
  });
}
